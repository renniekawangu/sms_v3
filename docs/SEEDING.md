**Seeding Guide**

Purpose: document how `seedData.mjs` works, prerequisites, common options, and troubleshooting.

Prerequisites
- Node 16+ (matching project engine).
- A Firestore project and a service account JSON with Firestore Admin privileges. Place it at the project root as `serviceAccountKey.json` or set `GOOGLE_APPLICATION_CREDENTIALS` to its path.
- The project must have `firebase-admin` available. Install via `npm install firebase-admin` if not present.

Quick run

```bash
# syntax check without executing
node --check seedData.mjs

# run the seed script (uses serviceAccountKey.json by default)
node seedData.mjs
```

What the script does
- Creates a set of `roles` (admin, head-teacher, teacher, parent, student, etc.).
- Creates demo `users` with emails in the `@esyncsms.com` domain.
- Creates `profiles` and domain documents and links parents to students.

Important points
- Domain alignment: demo emails use `@esyncsms.com`. Keep UI placeholders and any filtering aligned to avoid confusion.
- Idempotence: the script attempts to merge/overwrite existing documents where appropriate so repeated runs should not duplicate core records.
- Error handling: watch console output for mapping errors (commonly from arrays when building parent/child links). Recent fixes addressed undefined indices.

Customizing the seed
- Edit roles and users in `seedData.mjs`. Add new roles to `src/config/rbac.js` if you add role checks in the UI.
- To generate more students/parents, modify the arrays and the linking logic in `seedData.mjs`.

Environment variables
- `GOOGLE_APPLICATION_CREDENTIALS` — path to a service account JSON (optional if `serviceAccountKey.json` exists).
- `FIRESTORE_EMULATOR_HOST` — if using the Firestore emulator, set this and run the emulator before seeding.

Troubleshooting
- Permission errors: confirm the service account has Firestore Admin rights and that `project_id` matches.
- Unexpected duplicates: verify seed logic or remove existing test docs before re-running.
- Mapping errors when linking parents/students: ensure arrays used for mapping are not empty and indexing logic is correct.

References
- Seed script: [seedData.mjs](seedData.mjs#L1)

---
Generated 2026-07-09.