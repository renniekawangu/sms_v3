import { useState, useEffect, useCallback } from 'react'
import { homeworkApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import { BookOpen, Plus, Trash2, Edit, Calendar, User, CheckCircle, Upload, X } from 'lucide-react'
import Modal from '../components/Modal'
import ErrorBoundary from '../components/ErrorBoundary'
import { convertImageToPdf } from '../utils/photoPdfConverter'

function Homework({ classroomId }) {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const { currentAcademicYear } = useSettings()
  
  const [homework, setHomework] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHomework, setEditingHomework] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    files: [],
    existingAttachments: []
  })

  useEffect(() => {
    loadHomework()
  }, [classroomId])

  const loadHomework = async () => {
    try {
      setLoading(true)
      const data = await homeworkApi.getByClassroom(
        classroomId,
        currentAcademicYear?.year
      )
      setHomework(data.homework || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load homework')
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClick = () => {
    setEditingHomework(null)
    setFormData({
      title: '',
      description: '',
      subject: '',
      dueDate: '',
      files: [],
      existingAttachments: []
    })
    setIsModalOpen(true)
  }

  const handleEditClick = (hw) => {
    setEditingHomework(hw)
    setFormData({
      title: hw.title,
      description: hw.description,
      subject: hw.subject,
      dueDate: hw.dueDate.split('T')[0],
      files: [],
      existingAttachments: hw.attachments || []
    })
    setIsModalOpen(true)
  }

  const handleFileChange = async (e) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    const newFiles = []
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      
      // If it's an image, convert to PDF
      if (file.type.startsWith('image/')) {
        try {
          const pdfBlob = await convertImageToPdf(file)
          const pdfFile = new File([pdfBlob], `${file.name.split('.')[0]}.pdf`, { type: 'application/pdf' })
          newFiles.push(pdfFile)
        } catch (err) {
          showError(`Failed to convert ${file.name} to PDF`)
        }
      } else {
        newFiles.push(file)
      }
    }

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }))
    
    // Reset input
    e.target.value = ''
  }

  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const handleRemoveExistingAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      existingAttachments: prev.existingAttachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.subject || !formData.dueDate) {
      showError('All fields are required')
      return
    }

    try {
      if (editingHomework) {
        // For edit, update fields and attachments
        const data = {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          dueDate: formData.dueDate,
          classroomId,
          academicYear: currentAcademicYear?.year,
          attachments: formData.existingAttachments // Updated attachments list (removed ones are excluded)
        }
        
        await homeworkApi.update(editingHomework._id, data)
        
        // If there are new files, add them separately
        if (formData.files.length > 0) {
          const formDataWithFiles = new FormData()
          formData.files.forEach((file) => {
            formDataWithFiles.append('files', file)
          })
          await homeworkApi.addFiles(editingHomework._id, formDataWithFiles)
        }
        
        success('Homework updated successfully')
      } else {
        // For create, upload files along with homework
        if (formData.files.length > 0) {
          const formDataWithFiles = new FormData()
          formDataWithFiles.append('title', formData.title)
          formDataWithFiles.append('description', formData.description)
          formDataWithFiles.append('subject', formData.subject)
          formDataWithFiles.append('dueDate', formData.dueDate)
          formDataWithFiles.append('classroomId', classroomId)
          formDataWithFiles.append('academicYear', currentAcademicYear?.year)
          
          // Add files
          formData.files.forEach((file) => {
            formDataWithFiles.append('files', file)
          })

          await homeworkApi.createWithFiles(formDataWithFiles)
        } else {
          // Create without files
          const data = {
            title: formData.title,
            description: formData.description,
            subject: formData.subject,
            dueDate: formData.dueDate,
            classroomId,
            academicYear: currentAcademicYear?.year
          }
          await homeworkApi.create(data)
        }
        success('Homework created successfully')
      }

      setIsModalOpen(false)
      await loadHomework()
    } catch (err) {
      showError(err.message || 'Failed to save homework')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this homework?')) {
      try {
        await homeworkApi.delete(id)
        success('Homework deleted successfully')
        await loadHomework()
      } catch (err) {
        showError(err.message || 'Failed to delete homework')
      }
    }
  }

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'head-teacher'

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-text-muted">Loading homework...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-primary-blue" />
            <h2 className="text-lg font-semibold text-text-dark">Homework</h2>
            <span className="text-sm text-text-muted">({homework.length})</span>
          </div>
          {isTeacher && (
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Add Homework
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {homework.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-text-muted opacity-50 mb-4" />
            <p className="text-text-muted">No homework yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {homework.map((hw) => (
              <div
                key={hw._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-dark mb-1">{hw.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-text-muted mb-2">
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {hw.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Due: {new Date(hw.dueDate).toLocaleDateString()}
                      </span>
                      {hw.teacher && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {hw.teacher.firstName} {hw.teacher.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  {isTeacher && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(hw)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(hw._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-text-muted text-sm mb-3">{hw.description}</p>

                {/* Show attachments if any */}
                {hw.attachments && hw.attachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-text-muted mb-2">
                      📚 Materials ({hw.attachments.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hw.attachments.map((att, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          📄 {att.name || att.filename}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hw.submissions && hw.submissions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-text-muted mb-2">
                      Submissions: {hw.submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length}/{hw.submissions.length}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal for Create/Edit */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingHomework ? 'Edit Homework' : 'Add Homework'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }}
                autoComplete="off"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, subject: e.target.value }))
                }}
                autoComplete="off"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Description *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }}
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, dueDate: e.target.value }))
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                required
              />
            </div>

            {/* File upload section - show for both create and edit */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                📸 Upload Materials (Photos/PDFs) - Optional
              </label>
              
              {/* Show existing attachments when editing */}
              {editingHomework && formData.existingAttachments.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Existing Materials ({formData.existingAttachments.length}):</p>
                  <div className="space-y-2">
                    {formData.existingAttachments.map((att, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100 text-sm">
                        <span className="text-text-dark truncate flex-1">📄 {att.name || att.filename || 'Material'}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingAttachment(index)}
                          className="ml-2 text-red-600 hover:bg-red-50 p-1 rounded transition"
                          title="Remove attachment"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-blue transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload size={24} className="mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">
                    {editingHomework ? 'Click to add more materials' : 'Click to upload photos or PDFs'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">Photos will be converted to PDF</p>
                </label>
              </div>

              {formData.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-text-muted">New Files ({formData.files.length}):</p>
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                      <span className="text-text-muted truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingHomework ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </ErrorBoundary>
  )
}

export default Homework
