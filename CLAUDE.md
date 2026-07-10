# Claude Context for sms_v3

This project is a school management system built as a React + Vite web app. It provides an admin-style dashboard for managing students, teachers, parents, classrooms, attendance, homework, fees, exams, results, and related school operations.

## What the app does

The app is organized around a role-based school administration workflow:

- Authentication and user access
- Dashboard views for different roles
- CRUD-style management for school entities
- Attendance, homework, results, and fee tracking
- Reporting and financial summaries

## Tech stack

- React 18 with Vite
- React Router for page navigation
- Tailwind CSS for styling
- Firebase client SDK for app authentication and data access
- Firebase Admin SDK for seeding/demo data scripts
- Lucide React for icons
- jsPDF for PDF generation

## Main project structure

- src/ — application source code
  - components/ — reusable UI pieces such as forms, tables, dialogs, and layout
  - pages/ — main route-based screens like Students, Teachers, Fees, Results, Reports
  - services/ — Firebase/API integration and data access helpers
  - contexts/ — auth, settings, and toast state
  - config/ — RBAC and permission configuration
  - hooks/ — small reusable hooks
- seedData.mjs — script to seed demo data into Firestore
- serviceAccountKey.json — local Firebase admin credentials for seeding
- docs/ — project documentation

## How the app is organized

### Frontend flow

1. The app boots from src/main.jsx.
2. App-level providers and routing are established in src/App.jsx.
3. Auth state is managed via src/contexts/AuthContext.jsx.
4. Protected pages are wrapped by route guards such as ProtectedRoute and PermissionGate.
5. Pages call service-layer helpers in src/services/api.js rather than talking to Firebase directly.

### Role-based access control

The app uses a permission system based on roles and capability checks:

- Roles and role keys are defined in src/config/rbac.js
- Permission mappings live in src/config/permissions.js
- UI and page-level access should respect these rules

When changing features, preserve RBAC behavior and use the existing permission patterns.

## Core data model

The app works with school-domain data such as:

- users
- roles
- students
- parents
- teachers
- classrooms
- subjects
- attendance
- homework
- exams
- results
- fees
- payments
- expenses
- issues

Most domain logic is centered around Firestore collections and the helper methods in src/services/api.js.

## Common development commands

```bash
npm install
npm run dev
npm run build
npm run seed
```

## Important implementation notes

- Prefer editing existing components and page patterns instead of introducing a new architecture.
- Keep Firestore access centralized in src/services/api.js when possible.
- Respect the existing role-based UI gates and permission checks.
- Seed data is meant for demo/local development and should stay idempotent where possible.
- Avoid committing or exposing service account credentials from serviceAccountKey.json.

## Good places to start when changing features

- UI changes: src/pages/ and src/components/
- Data access changes: src/services/api.js
- Permission behavior: src/config/rbac.js and src/config/permissions.js
- Auth behavior: src/contexts/AuthContext.jsx
- Demo data: seedData.mjs

## Suggested approach for Claude

When making changes:

1. Understand the relevant page and component first.
2. Follow the existing service and context patterns.
3. Preserve RBAC and existing user flows.
4. Keep changes scoped and consistent with the rest of the app.
5. Verify with a build after edits.
