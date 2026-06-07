import { useState, useEffect, useMemo } from 'react'
import { Users, Search, Plus, Edit, Trash2, Link as LinkIcon, Unlink, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { parentsApi, studentsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { ROLES } from '../config/rbac'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'

function Parents() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const isAdmin = user?.role === ROLES.ADMIN
  const [parents, setParents] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedParentId, setExpandedParentId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [editingParent, setEditingParent] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    relationship: 'Guardian',
    address: '',
    occupation: ''
  })
  const [linkingParent, setLinkingParent] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [parentsData, studentsData] = await Promise.all([
        parentsApi.list(),
        studentsApi.list()
      ])
      setParents(parentsData.parents || parentsData)
      setStudents(studentsData)
    } catch (err) {
      showError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredParents = useMemo(() => {
    return parents.filter(parent => {
      const query = searchQuery.toLowerCase()
      return (
        parent.firstName?.toLowerCase().includes(query) ||
        parent.lastName?.toLowerCase().includes(query) ||
        parent.email?.toLowerCase().includes(query) ||
        parent.phone?.includes(query)
      )
    })
  }, [parents, searchQuery])

  const handleOpenModal = (mode, parent = null) => {
    if (mode === 'create') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        relationship: 'Guardian',
        address: '',
        occupation: ''
      })
    } else {
      setFormData({
        firstName: parent.firstName,
        lastName: parent.lastName,
        email: parent.email,
        phone: parent.phone,
        relationship: parent.relationship || 'Guardian',
        address: parent.address || '',
        occupation: parent.occupation || ''
      })
      setEditingParent(parent)
    }
    setModalMode(mode)
    setIsModalOpen(true)
  }

  const handleSaveParent = async (e) => {
    e.preventDefault()
    try {
      if (modalMode === 'create') {
        // Note: Create is typically done through user creation, but we can add it here if needed
        showError('Parents are created through user management. Please create a user with parent role first.')
        setIsModalOpen(false)
        return
      } else {
        // Update parent
        await parentsApi.update(editingParent._id, formData)
        success('Parent updated successfully')
        await loadData()
        setIsModalOpen(false)
      }
    } catch (err) {
      showError(err.message || 'Failed to save parent')
    }
  }

  const handleDeleteParent = async (parentId) => {
    if (!window.confirm('Are you sure you want to delete this parent?')) return
    try {
      await parentsApi.delete(parentId)
      success('Parent deleted successfully')
      await loadData()
    } catch (err) {
      showError(err.message || 'Failed to delete parent')
    }
  }

  const handleLinkStudent = async (parentId, studentId) => {
    try {
      await parentsApi.linkStudent(parentId, studentId)
      success('Student linked to parent')
      await loadData()
      setSelectedStudents(prev => ({ ...prev, [parentId]: [] }))
    } catch (err) {
      showError(err.message || 'Failed to link student')
    }
  }

  const handleUnlinkStudent = async (parentId, studentId) => {
    if (!window.confirm('Unlink this student from the parent?')) return
    try {
      await parentsApi.unlinkStudent(parentId, studentId)
      success('Student unlinked from parent')
      await loadData()
    } catch (err) {
      showError(err.message || 'Failed to unlink student')
    }
  }

  const getAvailableStudents = (parentId) => {
    const parent = parents.find(p => p._id === parentId)
    if (!parent) return []
    const linkedIds = (parent.students || []).map(s => s._id || s)
    return students.filter(s => !linkedIds.includes(s._id))
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Family Links"
        title="Parents"
        description="Manage parents and guardians, review linked students, and keep family relationships organized in one place."
        meta={
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Visible parents</p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{filteredParents.length}</p>
          </div>
        }
        actions={
          isAdmin ? (
            <button onClick={() => handleOpenModal('create')} className="btn-ui btn-primary">
              <Plus size={18} />
              <span>New Parent</span>
            </button>
          ) : null
        }
      />

      {/* Search Bar */}
      <div className="toolbar-card relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Search parents by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
        />
      </div>

      {/* No Results */}
      {filteredParents.length === 0 && (
        <div className="surface-card border-l-4 border-yellow-400 bg-yellow-50 section-pad">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">No parents found</h3>
              <p className="text-sm text-yellow-700">Create parent users in User Management to add parents to the system.</p>
            </div>
          </div>
        </div>
      )}

      {/* Parents List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredParents.map(parent => (
          <div
            key={parent._id}
            className="surface-card surface-card-strong border border-gray-200 overflow-hidden hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-shadow"
          >
            {/* Parent Header */}
            <div
              onClick={() => setExpandedParentId(expandedParentId === parent._id ? null : parent._id)}
              className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {parent.firstName?.[0]}{parent.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-dark truncate">
                      {parent.firstName} {parent.lastName}
                    </h3>
                    <div className="flex gap-4 text-xs text-text-muted mt-1">
                      <span key="email">{parent.email}</span>
                      {parent.phone && <span key="separator">•</span>}
                      {parent.phone && <span key="phone">{parent.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenModal('edit', parent)
                        }}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} className="sm:size-[18px]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteParent(parent._id)
                        }}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="sm:size-[18px]" />
                      </button>
                    </>
                  )}
                  {expandedParentId === parent._id ? (
                    <ChevronUp className="text-gray-400" />
                  ) : (
                    <ChevronDown className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex gap-4 mt-3 text-sm">
                {parent.relationship && (
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {parent.relationship}
                  </span>
                )}
                <span className="text-text-muted">
                  {(parent.students || []).length} student{(parent.students || []).length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedParentId === parent._id && (
              <div className="border-t border-gray-200 bg-gray-50 space-y-3 sm:space-y-4">
                {/* Parent Details */}
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-text-dark mb-3 text-sm sm:text-base">Parent Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div key="email">
                    <p className="text-xs text-text-muted uppercase font-semibold">Email</p>
                    <p className="text-sm text-text-dark break-all">{parent.email}</p>
                  </div>
                  <div key="phone">
                    <p className="text-xs text-text-muted uppercase font-semibold">Phone</p>
                    <p className="text-sm text-text-dark">{parent.phone || 'N/A'}</p>
                  </div>
                  <div key="relationship">
                    <p className="text-xs text-text-muted uppercase font-semibold">Relationship</p>
                    <p className="text-sm text-text-dark">{parent.relationship || 'Not specified'}</p>
                  </div>
                  <div key="occupation">
                    <p className="text-xs text-text-muted uppercase font-semibold">Occupation</p>
                    <p className="text-sm text-text-dark">{parent.occupation || 'Not specified'}</p>
                  </div>
                  {parent.address && (
                    <div key="address" className="md:col-span-2">
                      <p className="text-xs text-text-muted uppercase font-semibold">Address</p>
                      <p className="text-sm text-text-dark">{parent.address}</p>
                    </div>
                  )}
                </div>
                </div>

                {/* Linked Students */}
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-text-dark mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <LinkIcon size={16} />
                    Linked Students ({(parent.students || []).length})
                  </h4>
                  {(parent.students || []).length > 0 ? (
                    <div className="space-y-2">
                      {parent.students.map(student => (
                        <div
                          key={student._id}
                          className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                        >
                          <div>
                            <p className="text-sm font-medium text-text-dark">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-text-muted">ID: {student.studentId}</p>
                          </div>
                          <button
                            onClick={() => handleUnlinkStudent(parent._id, student._id)}
                            className="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                            title="Unlink student"
                          >
                            <Unlink size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted italic">No students linked yet</p>
                  )}
                </div>

                {/* Link New Student */}
                <div className="p-3 sm:p-4">
                  <h4 className="font-semibold text-text-dark mb-3 text-sm sm:text-base">Link New Student</h4>
                  <div className="space-y-2">
                    {getAvailableStudents(parent._id).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {getAvailableStudents(parent._id).map(student => (
                          <button
                            key={student._id}
                            onClick={() => handleLinkStudent(parent._id, student._id)}
                            className="text-left p-2 rounded border border-gray-200 hover:border-primary-blue hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <LinkIcon size={14} className="text-primary-blue flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-text-dark truncate">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-xs text-text-muted">ID: {student.studentId}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted italic">All available students are already linked</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Parent Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Create Parent' : 'Edit Parent'}>
        <form onSubmit={handleSaveParent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div key="firstName">
              <label className="block text-sm font-medium text-text-dark mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div key="lastName">
              <label className="block text-sm font-medium text-text-dark mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div key="phone">
              <label className="block text-sm font-medium text-text-dark mb-1">Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div key="relationship">
              <label className="block text-sm font-medium text-text-dark mb-1">Relationship</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option key="Father" value="Father">Father</option>
                <option key="Mother" value="Mother">Mother</option>
                <option key="Guardian" value="Guardian">Guardian</option>
                <option key="Sibling" value="Sibling">Sibling</option>
                <option key="Other" value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-blue text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Save Parent
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-200 text-text-dark py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Parents
