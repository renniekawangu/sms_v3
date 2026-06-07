import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Upload, Eye, AlertCircle, Loader, CheckCircle, Send, Check, Download } from 'lucide-react'
import { resultApi, examApi, classroomApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../config/rbac'
import ResultsEntryForm from '../components/ResultsEntryForm'
import PageHeader from '../components/PageHeader'

function Results() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { error: showError, success: showSuccess } = useToast()
  
  const [classrooms, setClassrooms] = useState([])
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [selectedExam, setSelectedExam] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showGradeForm, setShowGradeForm] = useState(false)
  const [transitioningId, setTransitioningId] = useState(null)
  const [selectedResults, setSelectedResults] = useState(new Set())
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)

      const classroomsData = await classroomApi.list()
      const examsData = await examApi.list()
      
      // Handle different response formats
      const classroomsList = Array.isArray(classroomsData) 
        ? classroomsData 
        : classroomsData?.data 
        ? Array.isArray(classroomsData.data) 
          ? classroomsData.data 
          : [classroomsData.data]
        : classroomsData?.classrooms || []
        
      const examsList = Array.isArray(examsData)
        ? examsData
        : examsData?.exams || []
      
      setClassrooms(classroomsList)
      setExams(examsList)
    } catch (err) {
      console.error('LoadInitialData error:', err)
      showError(err.message || 'Failed to load initial data')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadResults = async () => {
    if (!selectedClassroom || !selectedExam) {
      showError('Please select both classroom and exam')
      return
    }

    try {
      setLoading(true)
      const data = await resultApi.getClassroomExamResults(selectedClassroom, selectedExam)
      
      // If no results exist, initialize them
      if (!data.results || data.results.length === 0) {
        console.log('No results found, initializing...')
        await resultApi.initializeResults({
          exam: selectedExam,
          classroom: selectedClassroom
        })
        
        // Reload results
        const newData = await resultApi.getClassroomExamResults(selectedClassroom, selectedExam)
        setResults(newData.results || [])
        showSuccess('Results initialized for all students')
      } else {
        setResults(data.results)
      }
    } catch (err) {
      showError(err.message || 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'submitted': return 'bg-cyan-100 text-cyan-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'published': return 'bg-purple-100 text-purple-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleStatusTransition = async (resultId, currentStatus) => {
    const endpoints = {
      'draft': 'submit',
      'submitted': 'approve',
      'approved': 'publish'
    }

    const endpoint = endpoints[currentStatus]
    if (!endpoint) return

    try {
      setTransitioningId(resultId)
      await resultApi[endpoint](resultId)
      showSuccess(`Result ${endpoint}ed successfully`)
      handleLoadResults()
    } catch (err) {
      showError(err.message || `Failed to ${endpoint} result`)
    } finally {
      setTransitioningId(null)
    }
  }

  const toggleResultSelection = (resultId) => {
    const newSelected = new Set(selectedResults)
    if (newSelected.has(resultId)) {
      newSelected.delete(resultId)
    } else {
      newSelected.add(resultId)
    }
    setSelectedResults(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedResults.size === filteredResults.length) {
      setSelectedResults(new Set())
    } else {
      setSelectedResults(new Set(filteredResults.map(r => r._id)))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedResults.size === 0) {
      showError('Please select at least one result')
      return
    }

    try {
      setBulkProcessing(true)
      const resultIds = Array.from(selectedResults)
      await resultApi[action](resultIds)
      showSuccess(`${resultIds.length} results ${action}ed successfully`)
      setSelectedResults(new Set())
      handleLoadResults()
    } catch (err) {
      showError(err.message || `Failed to ${action} results`)
    } finally {
      setBulkProcessing(false)
    }
  }

  const exportToCSV = () => {
    if (filteredResults.length === 0) {
      showError('No results to export')
      return
    }

    const headers = ['Student Name', 'Student ID', 'Subject', 'Score', 'Max Marks', 'Grade', 'Status', 'Remarks']
    const rows = filteredResults.map(r => [
      r.student?.name || 'N/A',
      r.student?.studentId || 'N/A',
      r.subject?.name || 'N/A',
      r.score || 0,
      r.maxMarks || 100,
      r.grade || 'N/A',
      r.status || 'N/A',
      r.remarks || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `results-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    showSuccess('Results exported to CSV')
  }

  const filteredResults = results
    .filter(result => !statusFilter || result.status === statusFilter)
    .filter(result => !subjectFilter || result.subject?.name === subjectFilter)

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Academic Workflow"
        title="Results Management"
        description="Load a classroom and exam, enter grades, then move results through submission, approval, and publishing with a clearer review flow."
        meta={
          <>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Loaded results</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{results.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Selected</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{selectedResults.size}</p>
            </div>
          </>
        }
      />

      {/* Selection Panel */}
      <div className="surface-card section-pad">
        {loading && <div className="text-sm text-text-muted mb-4">Loading classrooms and exams...</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Classroom</label>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              disabled={loading || classrooms.length === 0}
              className="ui-select disabled:bg-gray-100"
            >
              <option value="">
                {loading ? 'Loading...' : classrooms.length === 0 ? 'No classrooms available' : 'Select Classroom'}
              </option>
              {classrooms && classrooms.length > 0 && classrooms.map(classroom => (
                <option key={classroom._id || classroom.id} value={classroom._id || classroom.id}>
                  {classroom.name || `Grade ${classroom.grade} - ${classroom.section}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              disabled={loading || !selectedClassroom}
              className="ui-select disabled:bg-gray-100"
            >
              <option value="">{!selectedClassroom ? 'Select classroom first' : 'Select Exam'}</option>
              {exams && exams.length > 0 && exams.filter(exam => exam.status !== 'closed' && exam.status !== 'cancelled').map(exam => (
                <option key={exam._id || exam.id} value={exam._id || exam.id}>
                  {exam.name || exam.title} - {exam.term}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleLoadResults}
              disabled={loading || !selectedClassroom || !selectedExam}
              className="btn-ui btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load Results
            </button>
          </div>
        </div>

        {selectedClassroom && selectedExam && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowGradeForm(true)}
                className="btn-ui btn-primary"
              >
                <Upload size={18} />
                Enter Grades
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="ui-select"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Filter by Subject</label>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="ui-select"
                >
                  <option value="">All Subjects</option>
                  {Array.from(new Set(results.map(r => r.subject?.name)))
                    .filter(Boolean)
                    .map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedResults.size > 0 && (
          <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-sm text-cyan-900 mb-3 font-medium">{selectedResults.size} result(s) selected</p>
            <div className="flex flex-wrap gap-2">
              {/* Submit All button for draft results */}
              {Array.from(selectedResults).some(id => results.find(r => r._id === id)?.status === 'draft') && (
                <button
                  onClick={() => handleBulkAction('bulkSubmit')}
                  disabled={bulkProcessing}
                  className="btn-ui btn-primary disabled:opacity-50"
                >
                  <Send size={16} />
                  Submit All
                </button>
              )}
              {/* Approve All button for submitted results */}
              {(user.role === 'head-teacher' || user.role === 'admin') && Array.from(selectedResults).some(id => results.find(r => r._id === id)?.status === 'submitted') && (
                <button
                  onClick={() => handleBulkAction('bulkApprove')}
                  disabled={bulkProcessing}
                  className="btn-ui btn-secondary disabled:opacity-50"
                >
                  <Check size={16} />
                  Approve All
                </button>
              )}
              {/* Publish All button for approved results */}
              {(user.role === 'admin' || user.role === 'head-teacher') && Array.from(selectedResults).some(id => results.find(r => r._id === id)?.status === 'approved') && (
                <button
                  onClick={() => handleBulkAction('bulkPublish')}
                  disabled={bulkProcessing}
                  className="btn-ui btn-secondary disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Publish All
                </button>
              )}
              <button
                onClick={() => setSelectedResults(new Set())}
                className="btn-ui btn-secondary"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Export button */}
        {results.length > 0 && (
          <button
            onClick={exportToCSV}
            className="btn-ui btn-secondary mt-4"
          >
            <Download size={18} />
            Export to CSV
          </button>
        )}
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader className="animate-spin" size={40} />
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="surface-card section-pad p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-lg">No results found</p>
          <p className="text-sm text-text-muted mt-2">Adjust filters or select a classroom and exam, then enter grades</p>
        </div>
      ) : (
        <div className="table-shell overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyan-50/60 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedResults.size === filteredResults.length && filteredResults.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(result => (
                  <tr key={result._id} className="border-b hover:bg-cyan-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedResults.has(result._id)}
                        onChange={() => toggleResultSelection(result._id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-text-dark">
                      {result.student?.name} ({result.student?.studentId})
                    </td>
                    <td className="px-4 py-3 text-sm text-text-dark">
                      {result.subject?.name}
                      {result.subject?.code && <span className="text-text-muted ml-1">({result.subject.code})</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-dark">
                      {result.score}/{result.maxMarks}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-dark">
                      {result.grade}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {result.status === 'draft' && (
                        <button
                          onClick={() => handleStatusTransition(result._id, 'draft')}
                          disabled={transitioningId === result._id}
                          className="text-cyan-700 hover:text-cyan-600 flex items-center gap-1 disabled:opacity-50"
                        >
                          <Send size={16} />
                          Submit
                        </button>
                      )}
                      {result.status === 'submitted' && (user.role === 'head-teacher' || user.role === 'admin') && (
                        <button
                          onClick={() => handleStatusTransition(result._id, 'submitted')}
                          disabled={transitioningId === result._id}
                          className="text-green-600 hover:text-opacity-80 flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                      )}
                      {result.status === 'approved' && (user.role === 'admin' || user.role === 'head-teacher') && (
                        <button
                          onClick={() => handleStatusTransition(result._id, 'approved')}
                          disabled={transitioningId === result._id}
                          className="text-purple-600 hover:text-opacity-80 flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submission Info */}
      {results.length > 0 && (
        <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-cyan-700 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-cyan-900">Ready to Submit?</p>
              <p className="text-sm text-cyan-700 mt-1">
                Once all grades are entered, you can submit the results for head-teacher approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grade Entry Form */}
      <ResultsEntryForm
        isOpen={showGradeForm}
        onClose={() => setShowGradeForm(false)}
        classroomId={selectedClassroom}
        examId={selectedExam}
        results={results}
        onSuccess={() => {
          showSuccess('Grades saved successfully')
          handleLoadResults()
        }}
      />
    </div>
  )
}

export default Results
