**Project Overview**
- **Purpose**: A school management system (SMS) built with React + Vite and Firestore. It includes user/role management, students/parents, fees, exams, attendance, timetables, results, and simple RBAC.
- **Stack**: Frontend: React + Vite. Backend datastore: Firestore (client SDK). Admin operations & seeding: `firebase-admin` via `seedData.mjs`.

**Quick Start**
- **Install**: `npm install`
- **Run Dev**: `npm run dev`
- **Build**: `npm run build`
- **Run Seed**: Ensure a valid `serviceAccountKey.json` is present at the project root, then run either `npm run seed` (if present) or:

```bash
node seedData.mjs
```

**Files of Interest**
- **Seed script**: [seedData.mjs](seedData.mjs#L1) — creates `roles`, `users`, `profiles`, and links parents/students for demo data.
- **Firebase client config**: [src/services/firebaseConfig.js](src/services/firebaseConfig.js#L1)
- **API & mocks layer**: [src/services/api.js](src/services/api.js#L1)
- **RBAC constants**: [src/config/rbac.js](src/config/rbac.js#L1)
- **Permissions mapping**: [src/config/permissions.js](src/config/permissions.js#L1)
- **Key UI spots using roles**: [src/components/Homework.jsx](src/components/Homework.jsx#L1), [src/pages/Results.jsx](src/pages/Results.jsx#L1), [src/components/UserForm.jsx](src/components/UserForm.jsx#L1)

**Architecture & Data Model (high level)**
- **Collections** (Firestore): `users`, `roles`, `profiles` (teacher/student/parent), `students`, `parents`, `results`, `attendance`, `homework`, `classrooms`, `subjects`, `payments`, `fees`, etc.
- **Users vs Profiles**: `users` hold auth-like info (email, role, _id). `profiles` and domain collections contain domain-specific attributes and links, e.g., `studentId`, `parentId`.
- **RBAC**: Roles are defined centrally in `src/config/rbac.js` and used across UI and seed. Prefer using those constants rather than string literals.

**Seeding Details**
- **What it does**: `seedData.mjs` creates baseline roles, demo users (admin, head-teacher, teachers, parents, students), and cross-links parents to their children.
- **Credentials**: The script uses a service account key file. Place a Firestore admin service account JSON at the repo root named `serviceAccountKey.json` or update the script to point to your key path.
- **Domain convention**: Demo users use the `@esyncsms.com` domain. If you change domain values, update both the seed file and any UI placeholders.
- **Common issues**:
  - Missing or invalid `serviceAccountKey.json` → seed fails with auth errors.
  - Parent/student link errors (undefined array indices) → ensure the seed script ran fully; recent fixes in the script addressed mapping issues.

**RBAC: How to extend or change roles**
- Edit role constants in [src/config/rbac.js](src/config/rbac.js#L1) and update permission maps in [src/config/permissions.js](src/config/permissions.js#L1).
- Update the seed data in [seedData.mjs](seedData.mjs#L1) to create the new role and example users if needed.
- Search for role checks and prefer constants: run `grep -R "ROLES" -n src || true` to find usages.

**Developer Notes & Conventions**
- Email placeholders in forms use `@esyncsms.com` for seeded/demo users.
- UI code should check roles using values from `src/config/rbac.js` rather than hard-coded strings.
- The repo includes a build artifact folder `dist/` — do not edit generated files there; source exists under `src/`.

**Troubleshooting**
- Seed script syntax check: `node --check seedData.mjs` (useful to catch syntax errors without running the script).
- If Firestore returns permission errors, confirm that the service account has sufficient Firestore privileges and the `project_id` matches the intended Firebase project.

**Where to make common changes**
- Add collections or modify documents: update `src/services/api.js` (CRUD mocks and collection lists) and the seed script to create example documents.
- Add/remove UI features: edit components in `src/components/` and pages in `src/pages/`.

**Next Steps (if you want)**
- Centralize any remaining hard-coded role/email strings to the `src/config/` files.
- Add a `docs/` folder with more targeted guides (RBAC guide, data model ERD, seeding options).

---
Generated on 2026-07-09. If you want this saved under a different filename (for example `docs/ARCHITECTURE.md`) or prefer more detail per section, tell me which sections to expand.