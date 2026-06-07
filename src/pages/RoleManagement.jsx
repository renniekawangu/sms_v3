import { useState, useEffect } from 'react'
import { Shield, Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import Modal from '../components/Modal'
import RoleForm from '../components/RoleForm'
import { useToast } from '../contexts/ToastContext'
import { rolesApi } from '../services/rolesApi'

function RoleManagement() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [viewDetailsRole, setViewDetailsRole] = useState(null)
  const { success, error } = useToast()

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      // Try to load from the API, fallback to mock data
      try {
        const data = await rolesApi.list()
        const items = Array.isArray(data) ? data : (data.data || [])
        setRoles(items)
      } catch (err) {
        console.warn('API not available, using mock data')
        // Mock data for demonstration
        setRoles([
          {
            role_id: 1,
            name: 'Admin',
            description: 'Full system access',
            permissions: [
              'view_dashboard',
              'view_users',
              'create_user',
              'edit_user',
              'delete_user',
              'manage_settings',
            ],
            created_at: '2024-01-01',
          },
          {
            role_id: 2,
            name: 'Teacher',
            description: 'Manage classrooms and attendance',
            permissions: [
              'view_dashboard',
              'view_students',
              'view_attendance',
              'create_attendance',
            ],
            created_at: '2024-01-01',
          },
          {
            role_id: 3,
            name: 'Accountant',
            description: 'Manage fees and payments',
            permissions: ['view_dashboard', 'view_fees', 'manage_fees', 'view_payments', 'create_payment'],
            created_at: '2024-01-01',
          },
        ])
      }
    } catch (err) {
      console.error('Error loading roles:', err)
      error('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async (formData) => {
    try {
      setIsFormLoading(true)
      await rolesApi.create(formData)
      success('Role created successfully')
      setIsModalOpen(false)
      setSelectedRole(null)
      await loadRoles()
    } catch (err) {
      error(err.message || 'Failed to create role')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleUpdateRole = async (formData) => {
    if (!selectedRole) return
    try {
      setIsFormLoading(true)
      const id = selectedRole._id || selectedRole.id || selectedRole.role_id
      await rolesApi.update(id, formData)
      success('Role updated successfully')
      setIsModalOpen(false)
      setSelectedRole(null)
      await loadRoles()
    } catch (err) {
      error(err.message || 'Failed to update role')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleDeleteRole = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to delete the "${roleName}" role?`)) {
      return
    }
    try {
      await rolesApi.delete(roleId)
      success('Role deleted successfully')
      await loadRoles()
    } catch (err) {
      error(err.message || 'Failed to delete role')
    }
  }

  const handleEditClick = (role) => {
    setSelectedRole(role)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleCreateClick = () => {
    setSelectedRole(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const filteredRoles = (Array.isArray(roles) ? roles : []).filter((role) =>
    role.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-blue/10 rounded-lg">
              <Shield className="text-primary-blue" size={24} />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Role Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">Create and manage user roles with permissions</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-blue text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium text-xs sm:text-sm"
        >
          <Plus size={18} />
          Create Role
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card-white rounded-custom shadow-custom p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search roles by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {filteredRoles.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-card-white rounded-custom shadow-custom p-12 text-center">
              <Shield className="text-gray-300 size-16 mx-auto mb-4" />
              <p className="text-text-muted text-lg">No roles found</p>
              <p className="text-text-muted text-sm mt-1">Create a new role to get started</p>
            </div>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role.id || role.name || role.role_id}
              className="bg-card-white rounded-custom shadow-custom hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Role Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-dark">{role.name}</h3>
                    <p className="text-sm text-text-muted mt-1">{role.description || 'No description'}</p>
                  </div>
                  <div className="p-2 bg-primary-blue/10 rounded-lg">
                    <Shield className="text-primary-blue" size={20} />
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-text-dark uppercase tracking-wide">
                    Permissions ({role.permissions?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions?.slice(0, 3).map((perm) => (
                      <span
                        key={perm}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                      >
                        {perm.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {role.permissions?.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-text-muted rounded-full">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                {role.created_at && (
                  <p className="text-xs text-text-muted border-t border-gray-200 pt-3">
                    Created: {new Date(role.created_at).toLocaleDateString()}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setViewDetailsRole(role)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleEditClick(role)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id || role.role_id, role.name)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRole(null)
        }}
        title={modalMode === 'create' ? 'Create New Role' : 'Edit Role'}
      >
        <RoleForm
          role={selectedRole}
          onSubmit={modalMode === 'create' ? handleCreateRole : handleUpdateRole}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedRole(null)
          }}
          isLoading={isFormLoading}
        />
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewDetailsRole}
        onClose={() => setViewDetailsRole(null)}
        title={`${viewDetailsRole?.name} - Details`}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Role Name</label>
            <p className="text-text-dark font-medium">{viewDetailsRole?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Description</label>
            <p className="text-text-dark">{viewDetailsRole?.description || 'No description'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-3">All Permissions</label>
            <div className="space-y-2">
              {viewDetailsRole?.permissions?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {viewDetailsRole.permissions.map((perm) => (
                    <span key={perm} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {perm.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted">No permissions assigned</p>
              )}
            </div>
          </div>

          {viewDetailsRole?.created_at && (
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Created</label>
              <p className="text-text-dark">
                {new Date(viewDetailsRole.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setViewDetailsRole(null)
              handleEditClick(viewDetailsRole)
            }}
            className="w-full px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors font-medium mt-4"
          >
            Edit Role
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default RoleManagement
