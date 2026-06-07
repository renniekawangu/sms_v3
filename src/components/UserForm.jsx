import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ROLES } from '../config/permissions'

function UserForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.STUDENT,
    phone: '',
    date_of_join: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Never pre-fill password
        role: user.role || ROLES.STUDENT,
        phone: user.phone || '',
        date_of_join: user.date_of_join ? new Date(user.date_of_join).toISOString().split('T')[0] : ''
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Password required only for new users
    if (!user && !formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.role) {
      newErrors.role = 'Role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Only include password if it's been entered
      const submitData = { ...formData }
      if (!submitData.password) {
        delete submitData.password
      }
      onSubmit(submitData)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              placeholder="+1234567890"
            />
          </div>

          {/* Date of Join */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Join
            </label>
            <input
              type="date"
              name="date_of_join"
              value={formData.date_of_join}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!user && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
            {user && (
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to keep current password
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select role</option>
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.HEAD_TEACHER}>Head Teacher</option>
              <option value={ROLES.TEACHER}>Teacher</option>
              <option value={ROLES.ACCOUNTS}>Accounts</option>
              <option value={ROLES.PARENT}>Parent</option>
              <option value={ROLES.STUDENT}>Student</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
