import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

const PERMISSION_CATEGORIES = {
  Dashboard: ['view_dashboard'],
  Users: ['view_users', 'create_user', 'edit_user', 'delete_user'],
  Students: ['view_students', 'create_student', 'edit_student', 'delete_student'],
  Teachers: ['view_teachers', 'create_teacher', 'edit_teacher', 'delete_teacher'],
  Classrooms: ['view_classrooms', 'create_classroom', 'edit_classroom', 'delete_classroom'],
  Attendance: ['view_attendance', 'create_attendance'],
  Fees: ['view_fees', 'manage_fees'],
  Payments: ['view_payments', 'create_payment'],
  Expenses: ['view_expenses', 'manage_expenses'],
  Reports: ['view_reports'],
  Settings: ['view_settings', 'manage_settings'],
}

function PermissionsPanel({ permissions = [], onPermissionsChange }) {
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(PERMISSION_CATEGORIES).reduce((acc, cat) => {
      acc[cat] = true
      return acc
    }, {})
  )

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handlePermissionChange = (permissionId) => {
    const newPermissions = permissions.includes(permissionId)
      ? permissions.filter((p) => p !== permissionId)
      : [...permissions, permissionId]
    onPermissionsChange(newPermissions)
  }

  const handleCategoryToggle = (category) => {
    const categoryPermissions = PERMISSION_CATEGORIES[category]
    const allSelected = categoryPermissions.every((p) => permissions.includes(p))

    if (allSelected) {
      // Deselect all in category
      const newPermissions = permissions.filter((p) => !categoryPermissions.includes(p))
      onPermissionsChange(newPermissions)
    } else {
      // Select all in category
      const newPermissions = [...new Set([...permissions, ...categoryPermissions])]
      onPermissionsChange(newPermissions)
    }
  }

  const getCategoryStatus = (category) => {
    const categoryPermissions = PERMISSION_CATEGORIES[category]
    const selectedCount = categoryPermissions.filter((p) => permissions.includes(p)).length
    return {
      all: selectedCount === categoryPermissions.length,
      some: selectedCount > 0 && selectedCount < categoryPermissions.length,
      none: selectedCount === 0,
    }
  }

  const formatPermissionName = (permission) => {
    return permission
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="space-y-2">
      {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => {
        const status = getCategoryStatus(category)
        const isExpanded = expandedCategories[category]

        return (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCategoryToggle(category)
                  }}
                  className="cursor-pointer"
                >
                  {status.all ? (
                    <CheckCircle2 className="text-green-600" size={20} />
                  ) : status.some ? (
                    <div className="relative">
                      <Circle className="text-gray-300" size={20} />
                      <div className="absolute inset-1 bg-green-600 rounded-full"></div>
                    </div>
                  ) : (
                    <Circle className="text-gray-300" size={20} />
                  )}
                </div>
                <span className="font-medium text-text-dark">{category}</span>
              </div>
              <svg
                className={`w-5 h-5 transition-transform text-text-muted ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Permissions List */}
            {isExpanded && (
              <div className="divide-y divide-gray-200 bg-white">
                {perms.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-text-dark">{formatPermissionName(permission)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Summary */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>{permissions.length}</strong> permissions selected out of{' '}
          <strong>{Object.values(PERMISSION_CATEGORIES).flat().length}</strong> total
        </p>
      </div>
    </div>
  )
}

export default PermissionsPanel
