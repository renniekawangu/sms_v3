import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLES, ROUTE_ACCESS } from '../config/rbac'

/**
 * ProtectedRoute Component
 * Enforces authentication, role-based access, and permission-based access
 * Prevents unauthorized access and redirects appropriately
 */
function ProtectedRoute({ children, requiredRole, requiredPermission, route }) {
  const { isAuthenticated, loading, user, hasPermission } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check route access if route is provided
  if (route) {
    const allowedRoles = ROUTE_ACCESS[route]
    if (allowedRoles && allowedRoles.length > 0) {
      if (user?.role !== ROLES.ADMIN && !allowedRoles.includes(user?.role)) {
        console.warn(`[ACCESS DENIED] User role "${user?.role}" cannot access route "${route}"`)
        return <Navigate to="/" replace />
      }
    }
  }

  // Check role-based access (supports both single string and array of roles)
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (user?.role !== ROLES.ADMIN && !allowedRoles.includes(user?.role)) {
      console.warn(`[ACCESS DENIED] User role "${user?.role}" is not in allowed roles: ${allowedRoles.join(', ')}`)
      return <Navigate to="/" replace />
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      console.warn(`[ACCESS DENIED] User does not have permission: "${requiredPermission}"`)
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
