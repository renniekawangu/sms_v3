import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { subjectsApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { ROLES, normalizeRole } from '../config/rbac'
import Modal from '../components/Modal'
import SubjectForm from '../components/SubjectForm'

function Subjects() {
  const { user } = useAuth()
  const normalizedRole = normalizeRole(user?.role)
  const isStudentView = normalizedRole === ROLES.STUDENT
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const { success, error: showError } = useToast()

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await subjectsApi.list()
      setSubjects(data)
    } catch (err) {
      const errorMessage = err.message || 'Failed to load subjects'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingSubject(null)
    setIsModalOpen(true)
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setIsModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingSubject) {
        await subjectsApi.update(editingSubject._id || editingSubject.subject_id, formData)
        success('Subject updated successfully')
      } else {
        await subjectsApi.create(formData)
        success('Subject created successfully')
      }
      setIsModalOpen(false)
      setEditingSubject(null)
      await loadSubjects()
    } catch (err) {
      const errorMessage = err.message || (editingSubject ? 'Failed to update subject' : 'Failed to create subject')
      showError(errorMessage)
    }
  }

  const handleDelete = async (subject_id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectsApi.delete(subject_id)
        success('Subject deleted successfully')
        await loadSubjects()
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete subject'
        showError(errorMessage)
      }
    }
  }

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects
    const query = searchQuery.toLowerCase()
    return subjects.filter((subject) => {
      const subjectId = subject.subject_id || subject._id || ''
      return (
        subject.name?.toLowerCase().includes(query) ||
        (subject.code || '').toLowerCase().includes(query) ||
        subject.grade?.toString().includes(query) ||
        subjectId.toString().includes(query)
      )
    })
  }, [subjects, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading subjects...</p>
        </div>
      </div>
    )
  }

  if (error && subjects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-dark font-medium mb-2">Error loading subjects</p>
          <p className="text-text-muted mb-4">{error}</p>
          <button
            onClick={loadSubjects}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Student view - read-only list
  if (isStudentView) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-dark">My Subjects</h1>
          <p className="text-sm text-text-muted mt-1">Your subjects for this term</p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary-blue border-t-transparent" />
            Loading subjects...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5" />
              <div>
                <p className="font-medium">Could not load subjects</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No subjects have been added for your classroom yet.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => {
              const subjectId = subject._id || subject.subject_id || subject.id
              return (
                <Link
                  key={subjectId}
                  to={`/subjects/${subjectId}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow block"
                >
                  <h3 className="font-semibold text-slate-900">{subject.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">Code: {subject.code || '—'}</p>
                  <p className="text-xs text-slate-400 mt-2">Grade {subject.grade}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-blue/10 px-3 py-1 text-xs font-medium text-primary-blue">
                    View materials
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Teacher/Admin view - full management interface
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Subjects</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Manage all subjects</p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-blue text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium text-xs sm:text-sm"
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      <div className="bg-card-white rounded-custom shadow-custom p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Code</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Grade</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted">
                    No subjects found
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject._id || subject.subject_id || Math.random()} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-text-dark">{subject.subject_id || subject._id}</td>
                    <td className="py-3 px-4 text-sm text-text-dark font-medium">
                      <Link to={`/subjects/${subject._id || subject.subject_id || subject.id}`} className="hover:text-primary-blue transition-colors">
                        {subject.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-dark">{subject.code || '-'}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">Grade {subject.grade}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">{subject.description || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/subjects/${subject._id || subject.subject_id || subject.id}`}
                          className="inline-flex items-center gap-1 rounded-full border border-primary-blue px-3 py-1 text-xs font-medium text-primary-blue hover:bg-primary-blue/10 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleEdit(subject)}
                          className="inline-flex items-center gap-1 rounded-full text-primary-blue hover:text-primary-blue/80 text-sm font-medium"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject._id || subject.subject_id)}
                          className="inline-flex items-center gap-1 rounded-full text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <p className="text-sm text-text-muted">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </p>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSubject(null)
        }}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <SubjectForm
          subject={editingSubject}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingSubject(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default Subjects
