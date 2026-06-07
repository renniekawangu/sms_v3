import { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, Search, Mail, UserCheck } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import usersApi from '../services/usersApi'
import UserForm from '../components/UserForm'

function UsersManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await usersApi.getAllUsers()
      setUsers(Array.isArray(data) ? data : data.users || [])
    } catch (error) {
      showToast('Failed to load users', 'error')
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setShowForm(true)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setShowForm(true)
  }

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return
    }

    try {
      await usersApi.deleteUser(userId)
      showToast('User deleted successfully', 'success')
      loadUsers()
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete user', 'error')
    }
  }

  const handleSubmit = async (userData) => {
    try {
      if (selectedUser) {
        await usersApi.updateUser(selectedUser._id, userData)
        showToast('User updated successfully', 'success')
      } else {
        await usersApi.createUser(userData)
        showToast('User created successfully', 'success')
      }
      setShowForm(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error) {
      showToast(
        error.response?.data?.message || `Failed to ${selectedUser ? 'update' : 'create'} user`,
        'error'
      )
    }
  }

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase()
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    )
  })

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      'head-teacher': 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      accounts: 'bg-yellow-100 text-yellow-800',
      student: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-primary-blue" size={24} />
            Users Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No users found matching your search' : 'No users available'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Join
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-blue rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.user_id || user._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail size={16} className="text-gray-400 mr-2" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.date_of_join ? new Date(user.date_of_join).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="text-primary-blue" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <UserCheck className="text-purple-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teachers</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'teacher' || u.role === 'head-teacher').length}
              </p>
            </div>
            <UserCheck className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'student').length}
              </p>
            </div>
            <UserCheck className="text-gray-600" size={32} />
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={selectedUser}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}

export default UsersManagement
