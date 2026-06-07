import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(String(email).trim(), password)
      
      if (result.success) {
        success('Login successful!')
        navigate('/')
      } else {
        const errorMsg = result.error || 'Login failed'
        setError(errorMsg)
        showError(errorMsg)
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-3 sm:p-4 lg:p-6 py-8 sm:py-10">
      <div className="w-full max-w-md flex-shrink-0">
        {/* Login Card */}
        <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-5 lg:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center mb-2 sm:mb-3">
              <img src="/logo.png" alt="Esync Logo" className="h-16 sm:h-14 lg:h-16 w-auto object-contain" />
            </div>
          </div>
          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-text-dark mb-1">Welcome Back</h2>
            <p className="text-xs sm:text-sm text-text-muted">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3 lg:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-text-dark mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.com"
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-text-dark mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted hover:text-text-dark"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-3 h-3 sm:w-4 sm:h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
                />
                <span className="ml-2 text-xs text-text-muted">Remember me</span>
              </label>
              <a href="mailto:support@esyncsms.com" className="text-xs text-primary-blue hover:text-primary-blue/80">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-blue text-white py-2 sm:py-2.5 lg:py-3 rounded-lg font-medium text-xs sm:text-sm hover:bg-primary-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} className="sm:size-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs sm:text-xs text-text-muted mt-4">
          © 2026 esyncsms. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login
