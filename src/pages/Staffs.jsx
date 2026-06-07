import { useState, useEffect, useMemo } from 'react'
import { Users, Search, Plus, Filter, Edit2, Trash2, AlertCircle, Download, CheckSquare, Square } from 'lucide-react'
import { teachersApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../config/rbac'
import Modal from '../components/Modal'
import AdvancedSearch from '../components/AdvancedSearch'
import Pagination from '../components/Pagination'
import SkeletonLoader from '../components/SkeletonLoader'
import ConfirmDialog from '../components/ConfirmDialog'
import PageHeader from '../components/PageHeader'
import { exportToCSV } from '../utils/exportData'
import { filterData, sortData, searchData, paginateData } from '../utils/filterSort'
import useKeyboardShortcuts from '../utils/keyboardShortcuts.jsx'

function Staffs() {
  const [staffs, setStaffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterRole, setFilterRole] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false })
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'teacher',
    department: 'Administration'
  })
  const { success, error: showError } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === ROLES.ADMIN

  const roles = [
    { value: 'teacher', label: 'Teacher' },
    { value: 'administrator', label: 'Administrator' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'librarian', label: 'Librarian' },
    { value: 'security', label: 'Security Guard' },
    { value: 'maintenance', label: 'Maintenance' }
  ]

  useEffect(() => {
    loadStaffs()
  }, [])

  const loadStaffs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await teachersApi.list()
      // Transform API data to match our format
      const transformed = data.map(staff => ({
        ...staff,
        id: staff.teacher_id || staff._id,
        name: `${staff.firstName || ''} ${staff.lastName || ''}`.trim(),
        department: staff.department || 'Administration'
      }))
      setStaffs(transformed)
    } catch (err) {
      setError(err.message || 'Failed to load staff')
      showError('Failed to load staff records')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingStaff(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'teacher',
      department: 'Administration'
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Staff',
      message: 'Are you sure you want to delete this staff member? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await teachersApi.delete(id)
          success('Staff member deleted successfully')
          await loadStaffs()
          setConfirmDialog({ isOpen: false })
        } catch (err) {
          showError(err.message || 'Failed to delete staff member')
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    })
  }

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds)
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Multiple Staff',
      message: `Are you sure you want to delete ${ids.length} staff member(s)? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete All',
      onConfirm: async () => {
        try {
          for (const id of ids) {
            await teachersApi.delete(id)
          }
          success(`${ids.length} staff member(s) deleted successfully`)
          setSelectedIds(new Set())
          await loadStaffs()
          setConfirmDialog({ isOpen: false })
        } catch (err) {
          showError(err.message || 'Failed to delete staff members')
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    })
  }

  const handleExportAll = () => {
    exportToCSV(processedStaffs, 'staffs.csv', [
      'name',
      'email',
      'phone',
      'role',
      'department'
    ])
  }

  const handleExportSelected = () => {
    const selectedData = staffs.filter(s => selectedIds.has(s.id || s._id))
    if (selectedData.length === 0) {
      showError('No staff members selected for export')
      return
    }
    exportToCSV(selectedData, 'staffs_selected.csv', [
      'name',
      'email',
      'phone',
      'role',
      'department'
    ])
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === processedStaffs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(processedStaffs.map(s => s.id || s._id)))
    }
  }

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    new: handleCreate,
    export: handleExportAll,
    search: () => document.querySelector('input[type="text"]')?.focus()
  })

  // Filter, sort, search, and paginate
  let processedStaffs = useMemo(() => {
    let result = filterData(staffs, filters)
    result = searchData(result, searchQuery, ['name', 'email', 'department'])
    result = sortData(result, sortBy, sortOrder)
    return result
  }, [staffs, filters, searchQuery, sortBy, sortOrder])

  const paginatedData = useMemo(() => {
    return paginateData(processedStaffs, currentPage, pageSize)
  }, [processedStaffs, currentPage, pageSize])

  // Filtered and searched staffs
  const filteredStaffs = useMemo(() => {
    return staffs.filter(staff => {
      const matchesSearch = 
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = filterRole === 'all' || staff.role === filterRole
      return matchesSearch && matchesRole
    })
  }, [staffs, searchQuery, filterRole])

  const handleAddClick = () => {
    handleCreate()
  }

  const handleEditClick = (staff) => {
    setEditingStaff(staff)
    const [firstName, ...rest] = (staff.name || '').split(' ')
    const lastName = rest.join(' ')
    setFormData({
      firstName: firstName || '',
      lastName: lastName || '',
      email: staff.email || '',
      phone: staff.phone || '',
      role: staff.role || 'teacher',
      department: staff.department || 'Administration'
    })
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (staff) => {
    if (!window.confirm(`Are you sure you want to delete ${staff.name}?`)) return

    try {
      await teachersApi.delete(staff.id)
      setStaffs(staffs.filter(s => s.id !== staff.id))
      success('Staff member deleted successfully')
    } catch (err) {
      showError(err.message || 'Failed to delete staff')
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.firstName.trim()) {
      showError('First name is required')
      return
    }
    if (!formData.email.trim()) {
      showError('Email is required')
      return
    }
    if (!formData.phone.trim()) {
      showError('Phone is required')
      return
    }

    try {
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        department: formData.department
      }

      if (editingStaff) {
        // Update existing staff
        await teachersApi.update(editingStaff.id, submitData)
        setStaffs(staffs.map(s => 
          s.id === editingStaff.id 
            ? {
                ...s,
                ...submitData,
                name: `${submitData.firstName} ${submitData.lastName}`.trim()
              }
            : s
        ))
        success('Staff member updated successfully')
      } else {
        // Create new staff
        const newStaff = await teachersApi.create(submitData)
        setStaffs([...staffs, {
          ...newStaff,
          id: newStaff.teacher_id || newStaff._id,
          name: `${newStaff.firstName || ''} ${newStaff.lastName || ''}`.trim(),
          department: newStaff.department || 'Administration'
        }])
        success('Staff member added successfully')
      }

      setIsModalOpen(false)
    } catch (err) {
      showError(err.message || 'Failed to save staff')
    }
  }

  if (loading) {
    return (
      <div className="page-stack">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="surface-card section-pad overflow-x-auto">
          <table className="min-w-full">
            <tbody>
              <SkeletonLoader count={5} variant="row" />
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Support & Operations"
        title="Staffs"
        description={`Manage staff records, assignments, and exports from a single workspace. ${staffs.length} records are currently loaded.`}
        meta={
          <>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Visible records</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{processedStaffs.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Selected</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{selectedIds.size}</p>
            </div>
          </>
        }
        actions={
          <>
          {isAdmin && (
            <button
              onClick={handleAddClick}
              className="btn-ui btn-primary"
              title="Ctrl+N"
            >
              <Plus size={18} />
              <span>Add Staff</span>
            </button>
          )}
          <button
            onClick={handleExportAll}
            className="btn-ui btn-secondary"
            title="Ctrl+E"
          >
            <Download size={18} />
            <span>Export All</span>
          </button>
          {selectedIds.size > 0 && isAdmin && (
            <button
              onClick={handleExportSelected}
              className="btn-ui btn-secondary"
            >
              <Download size={18} />
              <span>Export ({selectedIds.size})</span>
            </button>
          )}
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="btn-ui btn-danger"
            >
              <Trash2 size={18} />
              <span>Delete ({selectedIds.size})</span>
            </button>
          )}
          </>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm sm:text-base text-red-700">{error}</p>
        </div>
      )}

      {/* Advanced Search */}
      <div className="toolbar-card">
        <AdvancedSearch
          searchFields={['name', 'email', 'department']}
          filterOptions={{
            role: ['teacher', 'administrator', 'secretary', 'librarian', 'security', 'maintenance'],
            department: ['Administration', 'Academic', 'Support', 'Security']
          }}
          onSearch={setSearchQuery}
          onFilter={setFilters}
          onClear={() => {
            setSearchQuery('')
            setFilters({})
          }}
          loading={loading}
        />
      </div>

      <div className="table-shell p-3 sm:p-4 lg:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 sm:px-4 w-8">
                  <button
                    onClick={toggleSelectAll}
                    className="text-primary-blue hover:text-primary-blue/80"
                    title="Select all"
                  >
                    {selectedIds.size === paginatedData.data.length ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th 
                  className="text-left py-3 px-2 sm:px-4 font-semibold text-text-dark cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSortBy('name')
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')
                  }}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="hidden md:table-cell text-left py-3 px-4 font-semibold text-text-dark cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSortBy('email')
                    setSortOrder(sortBy === 'email' && sortOrder === 'asc' ? 'desc' : 'asc')
                  }}>
                  Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="hidden lg:table-cell text-left py-3 px-4 font-semibold text-text-dark">Phone</th>
                <th className="hidden xl:table-cell text-left py-3 px-4 font-semibold text-text-dark cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSortBy('role')
                    setSortOrder(sortBy === 'role' && sortOrder === 'asc' ? 'desc' : 'asc')
                  }}>
                  Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="hidden xl:table-cell text-left py-3 px-4 font-semibold text-text-dark">Department</th>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-xs sm:text-sm text-text-muted">
                    No staff found
                  </td>
                </tr>
              ) : (
                paginatedData.data.map((staff) => (
                  <tr key={staff.id || staff._id} className="border-b border-gray-100 hover:bg-cyan-50/50 transition-colors">
                    <td className="py-3 px-2 sm:px-4">
                      <button
                        onClick={() => toggleSelect(staff.id || staff._id)}
                        className="text-primary-blue hover:text-primary-blue/80"
                      >
                        {selectedIds.has(staff.id || staff._id) ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-text-dark font-medium">{staff.name}</td>
                    <td className="hidden md:table-cell py-3 px-4 text-sm text-text-muted">{staff.email}</td>
                    <td className="hidden lg:table-cell py-3 px-4 text-sm text-text-muted">{staff.phone}</td>
                    <td className="hidden xl:table-cell py-3 px-4 text-sm text-text-muted capitalize">{staff.role}</td>
                    <td className="hidden xl:table-cell py-3 px-4 text-sm text-text-muted">{staff.department}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex items-center gap-1 sm:gap-3">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEditClick(staff)}
                              className="text-primary-blue hover:text-primary-blue/80 text-xs sm:text-sm font-medium flex items-center gap-1 p-1 rounded hover:bg-cyan-50"
                              title="Edit"
                            >
                              <Edit2 size={14} className="sm:size-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(staff.id || staff._id)}
                              className="text-red-500 hover:text-red-600 text-xs sm:text-sm font-medium flex items-center gap-1 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={14} className="sm:size-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedData.pageCount > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginatedData.pageCount}
            totalItems={paginatedData.total}
            pageSize={pageSize}
            onPageChange={(page, newPageSize) => {
              if (newPageSize) {
                setPageSize(newPageSize)
                setCurrentPage(1)
              } else {
                setCurrentPage(page)
              }
            }}
          />
        )}
      </div>

      {/* Staff Form Modal */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-text-dark mb-4">
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-dark mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-dark mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-dark mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-dark mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-dark mb-2">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  required
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-text-dark mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="Enter department"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="w-full sm:flex-1 bg-primary-blue text-white px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
                >
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:flex-1 px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      <ConfirmDialog {...confirmDialog} />
    </div>
  )
}

export default Staffs
