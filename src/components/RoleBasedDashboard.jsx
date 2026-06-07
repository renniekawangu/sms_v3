/**
 * RoleBasedDashboard Component
 * Routes users to role-appropriate dashboards
 * Prevents unauthorized access to wrong dashboards
 *
 * Business Rule Alignment:
 * - Admin → Full system dashboard with statistics
 * - Head Teacher → Academic dashboard with stats
 * - Teacher → Class/subject dashboard with stats
 * - Accounts → Finance dashboard with stats
 * - Parent → Child-focused dashboard with stats
 * - Student → Personal academic dashboard with stats
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../config/rbac'
import Layout from './Layout'
import Dashboard from '../pages/Dashboard'

function RoleBasedDashboard() {
  const { user, isAuthenticated } = useAuth()

  console.log('[RoleBasedDashboard] Rendering with user:', { isAuthenticated, role: user?.role, name: user?.name })

  if (!isAuthenticated || !user) {
    console.log('[RoleBasedDashboard] Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Show the dashboard component which handles role-based rendering internally
  console.log('[RoleBasedDashboard] Showing dashboard for role:', user.role)
  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}

export default RoleBasedDashboard
