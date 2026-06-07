import { useState, useEffect } from 'react'
import { useToast } from '../contexts/ToastContext'
import { X } from 'lucide-react'

const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', name: 'View Dashboard', category: 'Dashboard' },
  { id: 'view_users', name: 'View Users', category: 'Users' },
  { id: 'create_user', name: 'Create Users', category: 'Users' },
  { id: 'edit_user', name: 'Edit Users', category: 'Users' },
  { id: 'delete_user', name: 'Delete Users', category: 'Users' },
  { id: 'view_students', name: 'View Students', category: 'Students' },
  { id: 'create_student', name: 'Create Students', category: 'Students' },
  { id: 'edit_student', name: 'Edit Students', category: 'Students' },
  { id: 'delete_student', name: 'Delete Students', category: 'Students' },
  { id: 'view_teachers', name: 'View Teachers', category: 'Teachers' },
  { id: 'create_teacher', name: 'Create Teachers', category: 'Teachers' },
  { id: 'edit_teacher', name: 'Edit Teachers', category: 'Teachers' },
  { id: 'delete_teacher', name: 'Delete Teachers', category: 'Teachers' },
  { id: 'view_classrooms', name: 'View Classrooms', category: 'Classrooms' },
  { id: 'create_classroom', name: 'Create Classrooms', category: 'Classrooms' },
  { id: 'edit_classroom', name: 'Edit Classrooms', category: 'Classrooms' },
  { id: 'delete_classroom', name: 'Delete Classrooms', category: 'Classrooms' },
  { id: 'view_attendance', name: 'View Attendance', category: 'Attendance' },
  { id: 'create_attendance', name: 'Mark Attendance', category: 'Attendance' },
  { id: 'view_fees', name: 'View Fees', category: 'Fees' },
  { id: 'manage_fees', name: 'Manage Fees', category: 'Fees' },
  { id: 'view_payments', name: 'View Payments', category: 'Payments' },
  { id: 'create_payment', name: 'Create Payments', category: 'Payments' },
  { id: 'view_expenses', name: 'View Expenses', category: 'Expenses' },
  { id: 'manage_expenses', name: 'Manage Expenses', category: 'Expenses' },
  { id: 'view_reports', name: 'View Reports', category: 'Reports' },
  { id: 'view_settings', name: 'View Settings', category: 'Settings' },
  { id: 'manage_settings', name: 'Manage Settings', category: 'Settings' },
]

function RoleForm({ role, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
  })
  const [selectedPermissions, setSelectedPermissions] = useState(new Set())
  const { success, error } = useToast()

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || [],
      })
      setSelectedPermissions(new Set(role.permissions || []))
    }
  }, [role])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePermissionToggle = (permissionId) => {
    const newPermissions = new Set(selectedPermissions)
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId)
    } else {
      newPermissions.add(permissionId)
    }
    setSelectedPermissions(newPermissions)
  }

  const handleSelectAll = () => {
    if (selectedPermissions.size === AVAILABLE_PERMISSIONS.length) {
      setSelectedPermissions(new Set())
    } else {
      setSelectedPermissions(new Set(AVAILABLE_PERMISSIONS.map((p) => p.id)))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      error('Role name is required')
      return
    }

    if (selectedPermissions.size === 0) {
      error('At least one permission is required')
      return
    }

    try {
      await onSubmit({
        ...formData,
        permissions: Array.from(selectedPermissions),
      })
    } catch (err) {
      console.error('Error submitting form:', err)
    }
  }

  // Group permissions by category
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {})

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[90vh] overflow-y-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Role Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Teacher, Accountant, Principal"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the purpose of this role"
            rows="3"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-text-dark">Permissions</label>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-primary-blue hover:underline font-medium"
          >
            {selectedPermissions.size === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          {Object.entries(permissionsByCategory).map(([category, permissions]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm text-text-dark">{category}</h4>
              <div className="space-y-2 pl-4">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(perm.id)}
                      onChange={() => handlePermissionToggle(perm.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue cursor-pointer"
                    />
                    <span className="text-sm text-text-dark">{perm.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-text-muted">
          {selectedPermissions.size} of {AVAILABLE_PERMISSIONS.length} permissions selected
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-text-dark rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:bg-gray-400 transition-colors font-medium"
        >
          {isLoading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
        </button>
      </div>
    </form>
  )
}

export default RoleForm
