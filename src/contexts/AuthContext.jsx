import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { authApi, AUTH_LOGOUT_EVENT } from '../services/api'
import { auth } from '../services/firebaseConfig'
import { ROLE_PERMISSIONS, ROLES, canAccessRoute, requiresSelfAccessOnly } from '../config/rbac'

const defaultAuthContext = {
  user: null,
  login: async () => ({ success: false, error: 'Auth provider unavailable' }),
  logout: async () => {},
  isAuthenticated: false,
  loading: true,
  permissions: [],
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  canAccess: () => false,
  isSelfAccessOnly: () => false,
}

const AuthContext = createContext(defaultAuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState([])

  useEffect(() => {
    let isMounted = true

    const syncUserState = (userData) => {
      if (!isMounted) return
      setUser(userData)
      setPermissions(userData ? (ROLE_PERMISSIONS[userData.role] || []) : [])
    }

    const clearAuthState = () => {
      localStorage.removeItem('user')
      syncUserState(null)
      setLoading(false)
    }

    const handleAuthChange = async (firebaseUser) => {
      if (!isMounted) return

      if (!firebaseUser) {
        clearAuthState()
        return
      }

      try {
        const profile = await authApi.me()
        const token = await firebaseUser.getIdToken()
        const userData = {
          user_id: firebaseUser.uid,
          email: firebaseUser.email || profile.email,
          role: profile.role || 'student',
          token,
          name: profile.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          ...profile,
        }

        localStorage.setItem('user', JSON.stringify(userData))
        syncUserState(userData)
      } catch (e) {
        clearAuthState()
      } finally {
        setLoading(false)
      }
    }

    const handleUnauthorized = () => {
      clearAuthState()
    }

    const unsubscribe = onAuthStateChanged(auth, handleAuthChange)
    window.addEventListener(AUTH_LOGOUT_EVENT, handleUnauthorized)

    return () => {
      isMounted = false
      unsubscribe()
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleUnauthorized)
    }
  }, [])

  /**
   * Check if user has a specific permission
   */
  const hasPermissionCheck = useCallback((permission) => {
    if (!user) return false
    if (user.role === ROLES.ADMIN) return true // Admin has all permissions
    return permissions.includes(permission)
  }, [user, permissions])

  /**
   * Check if user has any of the provided permissions
   */
  const hasAnyPermission = useCallback((permissionList) => {
    return permissionList.some(permission => hasPermissionCheck(permission))
  }, [hasPermissionCheck])

  /**
   * Check if user has all of the provided permissions
   */
  const hasAllPermissions = useCallback((permissionList) => {
    return permissionList.every(permission => hasPermissionCheck(permission))
  }, [hasPermissionCheck])

  /**
   * Check if user can access a route
   */
  const canAccess = useCallback((route) => {
    if (!user) return false
    return canAccessRoute(user.role, route)
  }, [user])

  /**
   * Check if a permission requires self-access only
   */
  const isSelfAccessOnly = useCallback((permission) => {
    return requiresSelfAccessOnly(permission)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password)
      
      // Create user object based on role
      const userData = {
        user_id: response.user_id,
        email,
        role: response.role,
        token: response.token,
        name: response.name || 'User'
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Load permissions based on role using RBAC config
      const rolePermissions = ROLE_PERMISSIONS[userData.role] || []
      setPermissions(rolePermissions)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || 'Invalid email or password' }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setPermissions([])
      localStorage.removeItem('user')
    }
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    permissions,
    hasPermission: hasPermissionCheck,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    isSelfAccessOnly
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    console.error('useAuth must be used within an AuthProvider')
    return defaultAuthContext
  }
  return context
}
