import { useState, useEffect } from 'react'
import { Users, Plus, Search, GraduationCap, User, DollarSign, Trash2 } from 'lucide-react'
import { studentsApi, teachersApi, accountsApi } from '../services/api'
import Modal from '../components/Modal'

function Roles() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ role: 'student', name: '', email: '', phone: '' })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const [students, teachers, accounts] = await Promise.all([
        studentsApi.list(),
        teachersApi.list(),
        accountsApi.list()
      ])

      // Combine all users with role information
      const allUsers = [
        ...students.map(s => ({ ...s, role: 'student', id: s.student_id, idKey: 'student_id' })),
        ...teachers.map(t => ({ ...t, role: 'teacher', id: t.teacher_id, idKey: 'teacher_id' })),
        ...accounts.map(a => ({ ...a, role: 'accounts', id: a.accountant_id, idKey: 'accountant_id' }))
      ]

      setUsers(allUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const { role, ...userData } = formData
      
      if (role === 'student') {
        await studentsApi.create({
          ...userData,
          dob: '2000-01-01',
          sex: 'M',
          address: '',
          date_of_join: new Date().toISOString().split('T')[0],
          parent_name: ''
        })
      } else if (role === 'teacher') {
        await teachersApi.create({
          ...userData,
          dob: '1980-01-01',
          sex: 'M',
          address: '',
          date_of_join: new Date().toISOString().split('T')[0]
        })
      } else if (role === 'accounts') {
        await accountsApi.create({
          ...userData,
          date_of_join: new Date().toISOString().split('T')[0]
        })
      }

      setIsModalOpen(false)
      setFormData({ role: 'student', name: '', email: '', phone: '' })
      await loadUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user')
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete this ${user.role}?`)) return

    try {
      if (user.role === 'student') {
        await studentsApi.delete(user.student_id)
      } else if (user.role === 'teacher') {
        await teachersApi.delete(user.teacher_id)
      }
      // Accounts don't have delete endpoint in API contract
      
      await loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <GraduationCap size={20} className="text-primary-blue" />
      case 'teacher':
        return <User size={20} className="text-primary-blue" />
      case 'accounts':
        return <DollarSign size={20} className="text-primary-blue" />
      default:
        return <Users size={20} className="text-primary-blue" />
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-700'
      case 'teacher':
        return 'bg-purple-100 text-purple-700'
      case 'accounts':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

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
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Users & Roles</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">Manage users and their roles</p>
      </div>
      <button
        onClick={handleCreateUser}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 bg-primary-blue text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors text-sm sm:text-base font-medium"
      >
        <Plus size={18} />
        <span>Create User</span>
      </button>

      <div className="bg-card-white rounded-custom shadow-custom p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="accounts">Accounts</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={`${user.role}-${user.id}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-text-dark">{user.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-dark font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">{user.email}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">{user.phone || '-'}</td>
                    <td className="py-3 px-4">
                      {(user.role === 'student' || user.role === 'teacher') && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span>Students: {users.filter(u => u.role === 'student').length}</span>
            <span>Teachers: {users.filter(u => u.role === 'teacher').length}</span>
            <span>Accounts: {users.filter(u => u.role === 'accounts').length}</span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setFormData({ role: 'student', name: '', email: '', phone: '' })
        }}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="accounts">Accounts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors"
            >
              Create User
            </button>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setFormData({ role: 'student', name: '', email: '', phone: '' })
              }}
              className="flex-1 bg-gray-200 text-text-dark px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Roles
