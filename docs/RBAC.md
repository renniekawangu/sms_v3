**RBAC (Roles & Permissions)**

Purpose: explain the role model, where constants live, and how to add or change roles and permissions.

Where roles live
- Role constants: `src/config/rbac.js` — central list like `ADMIN`, `HEAD_TEACHER`, `TEACHER`, `PARENT`, `STUDENT`.
- Permission mappings: `src/config/permissions.js` — maps roles to high-level permissions used by UI and API layer.

How UI uses roles
- Components/pages check `user.role` against constants imported from `src/config/rbac.js`.
- Example: `if (user.role === ROLES.HEAD_TEACHER) { ... }` — prefer constants to string literals.

Adding a role
1. Add a new constant in `src/config/rbac.js`.
2. Add permission mappings in `src/config/permissions.js`.
3. Update the seed script `seedData.mjs` to create an example user for the new role.
4. Update UI places that should grant access to the new role.

Server/admin endpoints with role prefixes
- `src/services/api.js` includes some admin-esque pseudo-routes like `admin` and `head-teacher` that gate data and behaviors. These are implemented in the client app to simplify local development.

Best practices
- Keep role checks to a single import of `ROLES` rather than scattering literal strings.
- Use permission maps for capabilities (e.g., `canApproveResults`) instead of checking for role names everywhere.
- Document any role-specific UI flows in `docs/ARCHITECTURE.md`.

---
Generated 2026-07-09.