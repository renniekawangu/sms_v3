# SMS Project: Comprehensive Error Clearing & Improvement Prompt

## Purpose
This prompt guides developers (or Claude) through systematically auditing, fixing errors, and improving the school management system codebase.

---

## Part 1: Pre-Audit Checklist

Before running improvements, confirm:
- [ ] All dependencies installed: `npm install`
- [ ] `serviceAccountKey.json` present in project root (for seeding)
- [ ] Firebase config valid in `src/services/firebaseConfig.js`
- [ ] Seed script syntax checked: `node --check seedData.mjs`
- [ ] Latest code cloned/pulled from repo

---

## Part 2: Systematic Code Audit

### 2.1 RBAC Consistency Check
**Goal**: Eliminate hard-coded role strings and use centralized constants.

**Steps**:
1. Run RBAC string search:
   ```bash
   grep -rn "role.*=.*['\"]" src/ || true
   grep -rn "ROLES\.\|role ===" src/ | grep -v node_modules || true
   ```
2. For each match not in `src/config/rbac.js`:
   - Replace string literals with imports from `src/config/rbac.js`.
   - Example:
     ```javascript
     // Bad
     if (user.role === 'teacher') { ... }
     
     // Good
     import { ROLES } from '@/config/rbac';
     if (user.role === ROLES.TEACHER) { ... }
     ```
3. Check `src/components/` and `src/pages/` for role-related conditionals.
4. Verify all role usages in `seedData.mjs` match `src/config/rbac.js` constants.

**Validation**:
- Run seed: `node seedData.mjs` → should complete without role-related errors.
- UI should show/hide features correctly based on logged-in user's role.

---

### 2.2 API Layer & Collection Consistency
**Goal**: Ensure `src/services/api.js` covers all Firestore collections and operations.

**Steps**:
1. List all collections referenced in components and pages:
   ```bash
   grep -rn "api\." src/components/ src/pages/ | cut -d: -f3 | sort -u | head -20
   ```
2. Cross-reference with `src/services/api.js` — ensure exports exist for:
   - `listDocuments()`, `getDocument()`, `upsertDocument()`, `deleteDocument()` for each collection.
   - Admin-prefixed routes (e.g., `admin/`, `head-teacher/`) if used by UI.
3. Check for any hardcoded Firestore collection names outside `api.js`:
   ```bash
   grep -rn "collection(" src/ | grep -v "src/services/api.js"
   ```
   → Move to `api.js` if found outside.
4. Ensure all mock/pseudo-endpoints have clear comments explaining their purpose.

**Validation**:
- Components should only call `api.*()` helpers, never directly invoke Firestore.
- Add console logs in `api.js` to trace calls during testing.

---

### 2.3 Seeding & Demo Data Quality
**Goal**: Fix seeding errors and ensure idempotent, repeatable data creation.

**Steps**:
1. Review `seedData.mjs` for:
   - Undefined array indices (especially in parent-child linking).
   - Hard-coded IDs vs. generated IDs consistency.
   - Error handling and try-catch blocks.
2. Run seed with verbose logging:
   ```bash
   node seedData.mjs 2>&1 | tee seed.log
   ```
3. Check for errors in `seed.log`:
   - TypeError, reference errors → fix array mapping.
   - Auth/permission errors → validate `serviceAccountKey.json`.
   - Document conflicts → use idempotent upserts.
4. Verify created documents in Firestore:
   - Count users: `db.collection('users').get().then(snap => console.log(snap.size))`
   - Check parent-child links: ensure `children` arrays are populated.

**Validation**:
- Run seed twice → should be idempotent (no duplicate IDs).
- Spot-check a few documents in Firestore console.

---

### 2.4 Component & Page Review
**Goal**: Fix broken imports, missing handlers, and UI inconsistencies.

**Steps**:
1. Check for unused or invalid imports:
   ```bash
   npm run build 2>&1 | grep -i "warning\|error" | head -20
   ```
2. Fix common issues:
   - **Missing imports**: add `import { ROLES } from '@/config/rbac'` where needed.
   - **Broken component references**: verify all `<Component />` exports exist.
   - **Missing event handlers**: ensure all buttons/forms have `onClick`, `onChange`, etc.
   - **Incorrect hook usage**: confirm `useState`, `useContext`, `useEffect` follow React rules.
3. Audit specific high-risk components (from docs):
   - `src/components/Homework.jsx` → role checks, teacher vs. student views.
   - `src/pages/Results.jsx` → result display logic, approval flow.
   - `src/components/UserForm.jsx` → form validation, role-based field visibility.

**Validation**:
- `npm run build` succeeds with no errors.
- Manual testing in browser: navigate pages, check role-gated features work.

---

### 2.5 Firebase Config & Credentials
**Goal**: Ensure production/dev configs are correct and secure.

**Steps**:
1. Review `src/services/firebaseConfig.js`:
   - Verify `projectId`, `apiKey`, `authDomain` match intended Firebase project.
   - Check `.env` or `.env.local` for overrides.
2. Validate `serviceAccountKey.json`:
   - Confirm it's in `.gitignore` (never commit).
   - Test credentials: `node --eval "const admin = require('firebase-admin'); const key = require('./serviceAccountKey.json'); admin.initializeApp({credential: admin.credential.cert(key)}); admin.firestore().collection('users').limit(1).get().then(() => console.log('OK')).catch(e => console.log(e.message))"`
3. Check for hardcoded keys in source:
   ```bash
   grep -rn "AIza\|GOOG" src/ || true
   ```
   → Should return nothing (use env vars instead).

**Validation**:
- App loads without Firebase errors.
- Firestore reads/writes work in dev and (if deployed) production.

---

## Part 3: Common Error Fixes

### Error 1: `ROLES is not exported from src/config/rbac.js`
**Fix**:
```javascript
// In src/config/rbac.js, ensure exports:
export const ROLES = {
  ADMIN: 'admin',
  HEAD_TEACHER: 'head_teacher',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student',
};
```

### Error 2: `Cannot read property of undefined` in seedData.mjs
**Fix**:
```javascript
// Add array bounds checks:
const usersToLink = users.slice(0, 3);  // ensure array exists
if (usersToLink && usersToLink.length > 0) {
  usersToLink.forEach((u, idx) => {
    // safe linking
  });
}
```

### Error 3: Firestore permission denied in production
**Fix**:
- Check Firestore rules allow read/write for authenticated users.
- Verify service account used for seeding has Firestore Admin role.
- Confirm app is pointing to correct Firebase project.

### Error 4: Inconsistent email domain in forms and seed
**Fix**:
- Centralize domain in `src/config/constants.js`:
  ```javascript
  export const DEMO_DOMAIN = '@esyncsms.com';
  ```
- Use in `seedData.mjs` and form placeholders:
  ```javascript
  const email = `${name.toLowerCase()}${DEMO_DOMAIN}`;
  ```

### Error 5: Build fails with "module not found"
**Fix**:
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check import paths use `@/` alias correctly (configured in `vite.config.js`).

---

## Part 4: Improvement Roadmap

### Priority 1: Code Quality (Do First)
- [ ] Centralize all role constants and remove string literals.
- [ ] Add TypeScript or JSDoc types to API layer functions.
- [ ] Add error boundaries to key pages.
- [ ] Document each collection's schema in `docs/DATA_MODEL.md`.

### Priority 2: Testing & Reliability
- [ ] Add unit tests for RBAC permission checks.
- [ ] Add integration tests for seeding.
- [ ] Set up Firestore rules testing.
- [ ] Document and test all role-gated flows.

### Priority 3: DX & Scalability
- [ ] Add environment-specific config (dev, staging, prod).
- [ ] Create a CLI for seeding with options (--clear, --partial, --verbose).
- [ ] Add logging/instrumentation to API layer.
- [ ] Create a seed validation script to check data integrity.

### Priority 4: Deployment & DevOps
- [ ] Lock down Firestore rules for production.
- [ ] Set up CI/CD pipeline (GitHub Actions or similar).
- [ ] Create deployment checklist in `docs/DEPLOYMENT.md`.
- [ ] Set up monitoring for auth, Firestore quota, errors.

---

## Part 5: Execution Steps

### Step 1: Run the Audit
```bash
# Syntax check
node --check seedData.mjs

# Check for obvious role/string issues
grep -rn "role ===" src/ || echo "No role literals found"
grep -rn "import.*ROLES" src/ || echo "No ROLES imports found"

# Build check
npm run build
```

### Step 2: Fix Errors Found
- Address each error from the audit in order of severity.
- Test each fix locally.

### Step 3: Reseed Data
```bash
# Clear Firestore (optional, if safe)
# node seedData.mjs --clear

# Run seed
node seedData.mjs
```

### Step 4: Validate in UI
- Start dev server: `npm run dev`
- Test each role (admin, teacher, parent, student) access.
- Check role-gated features appear/disappear correctly.

### Step 5: Commit & Document
```bash
git add .
git commit -m "fix: clear RBAC inconsistencies, improve seeding, fix [specific errors]"
```

---

## Part 6: Validation Checklist

After improvements, confirm:
- [ ] `npm run build` succeeds with zero errors.
- [ ] `node --check seedData.mjs` passes.
- [ ] `npm run seed` (or `node seedData.mjs`) completes without errors.
- [ ] App loads in browser without console errors.
- [ ] Each role can log in and see expected UI.
- [ ] No hard-coded role strings in `src/` (all use `ROLES.*` constants).
- [ ] All collections referenced in UI exist in `src/services/api.js`.
- [ ] `serviceAccountKey.json` is in `.gitignore`.
- [ ] Firestore rules are restrictive for production.
- [ ] Documentation in `docs/` is current.

---

## Part 7: Quick Commands Reference

```bash
# Syntax check seed script
node --check seedData.mjs

# Find role literals
grep -rn "role.*===" src/ || true
grep -rn "['\"]admin['\"]" src/ || true

# Build & test
npm install
npm run build
npm run dev

# Run seed
node seedData.mjs

# Check Firestore config
grep -n "projectId\|apiKey" src/services/firebaseConfig.js
```

---

## Part 8: When to Escalate

Ask for help if:
- Firestore rules are blocking reads/writes despite correct config.
- Service account key is invalid or project_id doesn't match.
- Build fails with module resolution errors even after `npm install`.
- Seed script runs but documents don't appear in Firestore.
- A specific component is broken and root cause is unclear.

Provide:
- Full error message (or terminal output).
- The command that triggered the error.
- The file/section of code in question.

---

## Summary

This prompt provides a systematic way to:
1. **Audit** the codebase for role inconsistencies, missing exports, and configuration issues.
2. **Fix** common errors in seeding, RBAC, API layer, and components.
3. **Improve** code quality, testing, and documentation.
4. **Validate** that all changes work end-to-end.

**Start with Part 2 (Audit) and work through each section in order.**

---

**Generated**: 2026-07-09
**For**: School Management System (SMS) project team
**Status**: Ready to use as a developer guide or as a prompt for Claude.