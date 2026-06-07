import { useState, useEffect } from 'react'
import { Users, Search, Edit2, Save, X } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { rolesApi } from '../services/rolesApi'
import { studentsApi, teachersApi, accountsApi } from '../services/api'

function UserRoleAssignment() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)
  const [selectedRoles, setSelectedRoles] = useState({})
  const { success, error } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load roles
      try {
        const rolesData = await rolesApi.list()
        setRoles(rolesData.roles || rolesData || [])
      } catch (err) {
        // Fallback mock roles
        setRoles([
          { role_id: 1, name: 'Admin' },
          { role_id: 2, name: 'Teacher' },
          { role_id: 3, name: 'Accountant' },
        ])
      }

      // Load users
      try {
        const [students, teachers, accounts] = await Promise.all([
          studentsApi.list(),
          teachersApi.list(),
          accountsApi.list(),
        ])

        const allUsers = [
          ...students.map((s) => ({
            user_id: s.student_id,
            name: s.name,
            email: s.email,
            type: 'student',
            currentRole: 'Teacher', // Would come from API
          })),
          ...teachers.map((t) => ({
            user_id: t.teacher_id,
            name: t.name,
            email: t.email,
            type: 'teacher',
            currentRole: 'Teacher',
          })),
          ...accounts.map((a) => ({
            user_id: a.accountant_id,
            name: a.name,
            email: a.email,
            type: 'accounts',
            currentRole: 'Accountant',
          })),
        ]

        setUsers(allUsers)
        // Initialize selected roles
        const initialRoles = {}
        allUsers.forEach((user) => {
          initialRoles[user.user_id] = user.currentRole
        })
        setSelectedRoles(initialRoles)
      } catch (err) {
        console.error('Error loading users:', err)
        error('Failed to load users')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async (userId) => {
    try {
      const roleId = selectedRoles[userId]
      await rolesApi.assignToUser(userId, roleId)
      success('Role assigned successfully')
      setEditingUserId(null)
      await loadData()
    } catch (err) {
      error(err.message || 'Failed to assign role')
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-blue/10 rounded-lg">
          <Users className="text-primary-blue" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-text-dark">User Role Assignment</h2>
          <p className="text-text-muted text-sm">Assign roles to users and manage permissions</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card-white rounded-custom shadow-custom p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card-white rounded-custom shadow-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-text-dark">User Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-text-dark">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-text-dark">Type</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-text-dark">Current Role</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-text-dark">{user.name}</div>
                    </td>
                    <td className="py-4 px-6 text-text-muted text-sm">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded capitalize">
                        {user.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {editingUserId === user.user_id ? (
                        <select
                          value={selectedRoles[user.user_id] || ''}
                          onChange={(e) =>
                            setSelectedRoles((prev) => ({
                              ...prev,
                              [user.user_id]: e.target.value,
                            }))
                          }
                          className="px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
                        >
                          <option value="">Select a role</option>
                          {roles.map((role) => (
                            <option key={role.role_id} value={role.role_id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          {selectedRoles[user.user_id] || user.currentRole}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {editingUserId === user.user_id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAssignRole(user.user_id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-700 font-medium text-sm"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingUserId(user.user_id)}
                          className="flex items-center gap-1 text-primary-blue hover:text-primary-blue/80 font-medium text-sm"
                        >
                          <Edit2 size={16} />
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-white rounded-custom shadow-custom p-4 text-center">
          <p className="text-gray-600 text-sm mb-1">Total Users</p>
          <p className="text-2xl font-bold text-primary-blue">{users.length}</p>
        </div>
        <div className="bg-card-white rounded-custom shadow-custom p-4 text-center">
          <p className="text-gray-600 text-sm mb-1">Available Roles</p>
          <p className="text-2xl font-bold text-primary-blue">{roles.length}</p>
        </div>
        <div className="bg-card-white rounded-custom shadow-custom p-4 text-center">
          <p className="text-gray-600 text-sm mb-1">Filtered Results</p>
          <p className="text-2xl font-bold text-primary-blue">{filteredUsers.length}</p>
        </div>
      </div>
    </div>
  )
}

export default UserRoleAssignment
