**Troubleshooting Guide**

Common issues and fixes

1) Seed script failure
- Symptom: `Error: Could not find path to service account` or permission denied.
- Fix: ensure `serviceAccountKey.json` exists or set `GOOGLE_APPLICATION_CREDENTIALS` pointing to a valid service account JSON with Firestore Admin privileges.

2) Mapping/linking errors during seeding
- Symptom: `TypeError: Cannot read property '...' of undefined` when linking parents/students.
- Fix: open `seedData.mjs` and inspect the arrays used for mapping. Ensure lengths match the expected linking logic.

3) UI access differences
- Symptom: a page visible to one user but hidden to another unexpectedly.
- Fix: check `user.role` at runtime (via devtools or `AuthContext`) and confirm role strings match `src/config/rbac.js` constants. Look for literal strings in code and replace with constants.

4) Firestore permission errors in production
- Symptom: read/write denied despite working locally.
- Fix: verify Firestore rules and service account/project ids. Ensure the app is pointed at the correct Firebase project (check `src/services/firebaseConfig.js`).

5) Build artifacts confusion
- Symptom: changes to `src/` don't reflect in hosted app.
- Fix: ensure the latest build was deployed and not serving stale files; purge CDN caches if needed.

Debugging tips
- Use `node --check seedData.mjs` to quickly catch syntax errors in the seed script.
- Add console debug logs in `src/services/api.js` to trace client-side pseudo-endpoints.
- Use the Firestore emulator during development to seed and inspect data without affecting production.

If you need help: provide the failing command and the exact error output and I will help triage.

---
Generated 2026-07-09.