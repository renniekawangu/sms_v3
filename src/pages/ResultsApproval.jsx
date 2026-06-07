import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Loader, MessageSquare } from 'lucide-react'
import { resultApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../config/rbac'

function ResultsApproval() {
  const { user } = useAuth()
  const { error: showError, success: showSuccess } = useToast()
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState(null)
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [filter, setFilter] = useState({
    status: 'submitted'
  })

  useEffect(() => {
    loadResults()
  }, [filter])

  const loadResults = async () => {
    try {
      setLoading(true)
      const data = await resultApi.getPending(filter)
      setResults(data.results || [])
    } catch (err) {
      showError(err.message || 'Failed to load pending results')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (resultId) => {
    try {
      await resultApi.approve(resultId)
      showSuccess('Result approved successfully')
      setSelectedResult(null)
      loadResults()
    } catch (err) {
      showError(err.message || 'Failed to approve result')
    }
  }

  const handlePublish = async (resultId) => {
    try {
      await resultApi.publish(resultId)
      showSuccess('Result published successfully')
      setSelectedResult(null)
      loadResults()
    } catch (err) {
      showError(err.message || 'Failed to publish result')
    }
  }

  const handleReject = async (resultId) => {
    if (!rejectionReason.trim()) {
      showError('Please provide a rejection reason')
      return
    }

    try {
      await resultApi.reject(resultId, rejectionReason)
      showSuccess('Result rejected successfully')
      setSelectedResult(null)
      setRejectionReason('')
      setShowApprovalForm(false)
      loadResults()
    } catch (err) {
      showError(err.message || 'Failed to reject result')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'submitted': return 'bg-blue-100 text-blue-700'
      case 'approved': return 'bg-yellow-100 text-yellow-700'
      case 'published': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-dark">Results Approval</h1>
        <p className="text-sm text-text-muted mt-1">Review and approve exam results</p>
      </div>

      {/* Filter */}
      <div className="bg-card-white rounded-lg shadow-sm p-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Filter by Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue"
          >
            <option value="submitted">Pending Approval</option>
            <option value="approved">Approved (Not Published)</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <div className="bg-card-white rounded-lg shadow-sm p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-lg">No results to review</p>
          <p className="text-sm text-text-muted mt-2">
            {filter.status === 'submitted' ? 'All results are up to date!' : 'No results found with this status'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map(result => (
            <div
              key={result._id}
              className="bg-card-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedResult(result)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-text-dark">
                      {result.student?.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-text-muted">Student ID</p>
                      <p className="font-medium text-text-dark">{result.student?.studentId}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Exam</p>
                      <p className="font-medium text-text-dark">{result.exam?.name}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Subject</p>
                      <p className="font-medium text-text-dark">{result.subject?.name}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Score/Grade</p>
                      <p className="font-medium text-text-dark">{result.score}/{result.maxMarks} ({result.grade})</p>
                    </div>
                  </div>

                  <div className="text-xs text-text-muted">
                    Submitted by {result.submittedBy?.name} on {new Date(result.submittedAt).toLocaleDateString()}
                  </div>
                </div>

                <button className="text-primary-blue hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail & Action Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-dark">Result Details</h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-text-muted hover:text-text-dark text-2xl"
              >
                ×
              </button>
            </div>

            {/* Result Information */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-sm text-text-muted">Student</p>
                <p className="font-medium text-text-dark">{selectedResult.student?.name}</p>
                <p className="text-xs text-text-muted">{selectedResult.student?.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Exam</p>
                <p className="font-medium text-text-dark">{selectedResult.exam?.name}</p>
                <p className="text-xs text-text-muted">{selectedResult.exam?.term}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Subject</p>
                <p className="font-medium text-text-dark">{selectedResult.subject?.name}</p>
                <p className="text-xs text-text-muted">{selectedResult.subject?.code}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Score</p>
                <p className="font-medium text-text-dark">{selectedResult.score}/{selectedResult.maxMarks}</p>
                <p className="text-xs text-text-muted">Grade: {selectedResult.grade}</p>
              </div>
            </div>

            {/* Status and History */}
            <div className="mb-6 pb-6 border-b">
              <p className="text-sm font-medium text-text-dark mb-3">Status History</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Submitted</span>
                  <span className="font-medium text-text-dark">
                    {new Date(selectedResult.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                {selectedResult.approvedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Approved</span>
                    <span className="font-medium text-text-dark">
                      {new Date(selectedResult.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {selectedResult.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Published</span>
                    <span className="font-medium text-text-dark">
                      {new Date(selectedResult.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Remarks */}
            {selectedResult.remarks && (
              <div className="mb-6 pb-6 border-b">
                <p className="text-sm font-medium text-text-dark mb-2">Teacher Remarks</p>
                <p className="text-sm text-text-dark bg-gray-50 p-3 rounded-lg">{selectedResult.remarks}</p>
              </div>
            )}

            {/* Action Form */}
            {!showApprovalForm ? (
              <div className="flex gap-3">
                {selectedResult.status === 'submitted' && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedResult._id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-opacity-90 flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => setShowApprovalForm(true)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-opacity-90 flex items-center justify-center gap-2 transition-all"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </>
                )}
                {selectedResult.status === 'approved' && (
                  <button
                    onClick={() => handlePublish(selectedResult._id)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-opacity-90 flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle size={18} />
                    Publish Result
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this result is being rejected..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue resize-none"
                    rows="4"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(selectedResult._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-opacity-90 transition-all"
                  >
                    Submit Rejection
                  </button>
                  <button
                    onClick={() => {
                      setShowApprovalForm(false)
                      setRejectionReason('')
                    }}
                    className="flex-1 bg-gray-300 text-text-dark py-2 rounded-lg hover:bg-opacity-80 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsApproval
