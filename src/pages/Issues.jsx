import { useState, useEffect, useMemo } from 'react'
import { AlertCircle, Plus, Edit, Trash2, Search, CheckCircle, Eye, X } from 'lucide-react'
import { issuesApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import IssueForm from '../components/IssueForm'

function Issues() {
  const { user } = useAuth()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIssue, setEditingIssue] = useState(null)
  const [viewingIssue, setViewingIssue] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const { success, error: showError } = useToast()

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await issuesApi.list()
      setIssues(data)
    } catch (err) {
      const errorMessage = err.message || 'Failed to load issues'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingIssue(null)
    setIsModalOpen(true)
  }

  const handleEdit = (issue) => {
    setEditingIssue(issue)
    setIsModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingIssue) {
        await issuesApi.update(editingIssue._id, formData)
        success('Issue updated successfully')
      } else {
        await issuesApi.create(formData)
        success('Issue created successfully')
      }
      setIsModalOpen(false)
      setEditingIssue(null)
      await loadIssues()
    } catch (err) {
      const errorMessage = err.message || (editingIssue ? 'Failed to update issue' : 'Failed to create issue')
      showError(errorMessage)
    }
  }

  const handleResolve = async (issue_id) => {
    try {
      await issuesApi.resolve(issue_id)
      success('Issue resolved successfully')
      await loadIssues()
    } catch (err) {
      const errorMessage = err.message || 'Failed to resolve issue'
      showError(errorMessage)
    }
  }

  const handleDelete = async (issue_id) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await issuesApi.delete(issue_id)
        success('Issue deleted successfully')
        await loadIssues()
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete issue'
        showError(errorMessage)
      }
    }
  }

  const handleView = (issue) => {
    setViewingIssue(issue)
    setIsViewModalOpen(true)
  }

  const filteredIssues = useMemo(() => {
    if (!searchQuery.trim()) return issues
    const query = searchQuery.toLowerCase()
    return issues.filter((issue) => {
      return (
        issue.title?.toLowerCase().includes(query) ||
        issue.description?.toLowerCase().includes(query) ||
        issue.category?.toLowerCase().includes(query) ||
        issue._id?.toString().includes(query)
      )
    })
  }, [issues, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading issues...</p>
        </div>
      </div>
    )
  }

  if (error && issues.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-dark font-medium mb-2">Error loading issues</p>
          <p className="text-text-muted mb-4">{error}</p>
          <button
            onClick={loadIssues}
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
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Issues</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">View and manage issues</p>
      </div>
      <button
        onClick={handleCreate}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 bg-primary-blue text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors text-sm sm:text-base font-medium"
      >
        <Plus size={18} />
        <span>Create Issue</span>
      </button>

      <div className="bg-card-white rounded-custom shadow-custom p-6">
        {issues.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                placeholder="Search issues by title, category, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Raised By</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Role</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted">
                    {issues.length === 0 ? 'No issues found' : 'No issues match your search'}
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-text-dark font-medium">{issue.title}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">{issue.reportedBy?.email || 'Unknown'}</td>
                    <td className="py-3 px-4 text-sm capitalize">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {issue.reportedBy?.role || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-muted capitalize">{issue.category}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        issue.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        issue.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {issue.priority || 'medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        issue.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : issue.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {issue.status || 'open'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(issue)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1"
                          title="View description"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        {(user?.role === 'admin' || user?._id === issue.reportedBy?._id) && (
                          <button
                            onClick={() => handleEdit(issue)}
                            className="text-primary-blue hover:text-primary-blue/80 text-sm font-medium flex items-center gap-1"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                        )}
                        {user?.role === 'admin' && issue.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolve(issue._id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                          >
                            <CheckCircle size={16} />
                            Resolve
                          </button>
                        )}
                        {(user?.role === 'admin' || user?._id === issue.reportedBy?._id) && (
                          <button
                            onClick={() => handleDelete(issue._id)}
                            className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {issues.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-text-muted">
              Showing {filteredIssues.length} of {issues.length} issues
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingIssue(null)
        }}
        title={editingIssue ? 'Edit Issue' : 'Create New Issue'}
      >
        <IssueForm
          issue={editingIssue}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingIssue(null)
          }}
        />
      </Modal>

      {/* View Description Modal */}
      {isViewModalOpen && viewingIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Issue Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Title</label>
                <p className="text-gray-700">{viewingIssue.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Category</label>
                  <p className="text-gray-700 capitalize">{viewingIssue.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Priority</label>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize inline-block ${
                    viewingIssue.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    viewingIssue.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    viewingIssue.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {viewingIssue.priority || 'medium'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Raised By</label>
                  <p className="text-gray-700">{viewingIssue.reportedBy?.email || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Status</label>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize inline-block ${
                    viewingIssue.status === 'resolved'
                      ? 'bg-green-100 text-green-700'
                      : viewingIssue.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {viewingIssue.status || 'open'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Description</label>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{viewingIssue.description}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Issues
