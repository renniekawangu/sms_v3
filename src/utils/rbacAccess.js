import { normalizeRole } from '../config/rbac.js'

export function hasRequiredRole(userRole, requiredRole) {
  if (!requiredRole) {
    return true
  }

  return normalizeRole(userRole) === normalizeRole(requiredRole)
}
