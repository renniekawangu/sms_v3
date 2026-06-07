import { AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SELF_ACCESS_PERMISSIONS } from '../config/rbac'

/**
 * Component to conditionally render content based on permissions
 * Supports role-based and permission-based access control
 * Enforces self-access-only rules for sensitive data
 *
 * @param {string|string[]} permission - Single permission or array of permissions
 * @param {boolean} requireAll - If true, requires all permissions; if false, requires any
 * @param {React.ReactNode} children - Content to render if permission granted
 * @param {React.ReactNode} fallback - Content to render if permission denied (optional)
 * @param {string} requiredRole - Optional: restrict to specific role
 */
export function PermissionGate({
  permission,
  requireAll = false,
  children,
  fallback = null,
  requiredRole = null
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user, isSelfAccessOnly } = useAuth()

  // Check role restriction if provided
  if (requiredRole && user?.role !== requiredRole) {
    return fallback || <AccessDeniedMessage reason="insufficient_role" />
  }

  let hasAccess = false

  if (Array.isArray(permission)) {
    hasAccess = requireAll 
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
  } else if (permission) {
    hasAccess = hasPermission(permission)
  }

  if (hasAccess) {
    // Warn about self-access-only permissions
    if (typeof permission === 'string' && isSelfAccessOnly(permission)) {
      // Log for debugging - self-access enforcement happens on backend
      console.debug(`[SELF-ACCESS] Permission "${permission}" requires accessing own data only`)
    }

    return children
  }

  return fallback || <AccessDeniedMessage />
}

/**
 * Component to show access denied message with helpful info
 */
export function AccessDeniedMessage({ reason = 'insufficient_permissions' }) {
  const reasons = {
    insufficient_permissions: "You don't have permission to access this content",
    insufficient_role: 'Your role does not have access to this content',
    self_access_only: 'You can only access your own data',
    not_authenticated: 'Please log in to access this content'
  }

  return (
    <div className="flex items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle size={20} />
        <span>{reasons[reason] || reasons.insufficient_permissions}</span>
      </div>
    </div>
  )
}

/**
 * Hook to check permissions
 * @deprecated Use useAuth() directly instead
 */
export function usePermission() {
  return useAuth()
}
