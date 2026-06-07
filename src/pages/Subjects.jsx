import { useState, useEffect, useMemo } from 'react'
import { BookOpen, Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { subjectsApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import SubjectForm from '../components/SubjectForm'

function Subjects() {
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
      return (
        subject.name?.toLowerCase().includes(query) ||
        subject.code?.toLowerCase().includes(query) ||
        subject.grade?.toString().includes(query) ||
        subject.subject_id?.toString().includes(query)
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
                    <td className="py-3 px-4 text-sm text-text-dark">{subject.subject_id}</td>
                    <td className="py-3 px-4 text-sm text-text-dark font-medium">{subject.name}</td>
                    <td className="py-3 px-4 text-sm text-text-dark">{subject.code || '-'}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">Grade {subject.grade}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">{subject.description || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-primary-blue hover:text-primary-blue/80 text-sm font-medium flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject._id || subject.subject_id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
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
