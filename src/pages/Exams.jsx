import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { examApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../config/rbac'
import ExamForm from '../components/ExamForm'

function Exams() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { error: showError, success: showSuccess } = useToast()
  
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [academicYears, setAcademicYears] = useState([])
  const [filter, setFilter] = useState({
    academicYear: '',
    term: '',
    status: '',
    examType: ''
  })
  const [showForm, setShowForm] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)

  useEffect(() => {
    // Generate available academic years (current and next 2 years)
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = 0; i < 3; i++) {
      const year = currentYear + i
      years.push(`${year}`)
    }
    setAcademicYears(years)
    loadExams()
  }, [filter])

  const loadExams = async () => {
    try {
      setLoading(true)
      const query = Object.fromEntries(
        Object.entries(filter).filter(([, v]) => v)
      )
      console.log('Sending filter query:', query)
      const data = await examApi.list(query)
      console.log('Exams response:', data)
      
      // Handle different response formats
      let examsList = []
      if (Array.isArray(data)) {
        examsList = data
      } else if (data?.exams && Array.isArray(data.exams)) {
        examsList = data.exams
      }
      
      console.log('Exams list:', examsList)
      setExams(examsList)
    } catch (err) {
      showError(err.message || 'Failed to load exams')
      console.error('Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (examId) => {
    try {
      await examApi.publish(examId)
      showSuccess('Exam published successfully')
      loadExams()
    } catch (err) {
      showError(err.message || 'Failed to publish exam')
    }
  }

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await examApi.delete(examId)
        showSuccess('Exam deleted successfully')
        loadExams()
      } catch (err) {
        showError(err.message || 'Failed to delete exam')
      }
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'published': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-red-100 text-red-700'
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-dark">Exams</h1>
          <p className="text-sm text-text-muted mt-1">Manage school exams and grading</p>
        </div>
        {(user.role === ROLES.HEAD_TEACHER || user.role === ROLES.ADMIN) && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
          >
            <Plus size={20} />
            New Exam
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card-white rounded-lg shadow-sm p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Academic Year</label>
          <select
            value={filter.academicYear}
            onChange={(e) => setFilter({ ...filter, academicYear: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue"
          >
            <option value="">All Years</option>
            {academicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Term</label>
          <select
            value={filter.term}
            onChange={(e) => setFilter({ ...filter, term: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue"
          >
            <option value="">All Terms</option>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Exam Type</label>
          <select
            value={filter.examType}
            onChange={(e) => setFilter({ ...filter, examType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue"
          >
            <option value="">All Types</option>
            <option value="unit-test">Unit Test</option>
            <option value="midterm">Midterm</option>
            <option value="endterm">Endterm</option>
            <option value="final">Final</option>
            <option value="diagnostic">Diagnostic</option>
            <option value="formative">Formative</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Exams List */}
      {exams.length === 0 ? (
        <div className="bg-card-white rounded-lg shadow-sm p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted text-lg">No exams found</p>
          <p className="text-sm text-text-muted mt-2">Create a new exam to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map(exam => (
            <div key={exam._id} className="bg-card-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-text-dark">{exam.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-text-muted">Type</p>
                      <p className="font-medium text-text-dark capitalize">{exam.examType}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Term</p>
                      <p className="font-medium text-text-dark">{exam.term}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Academic Year</p>
                      <p className="font-medium text-text-dark">{exam.academicYear}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Total Marks</p>
                      <p className="font-medium text-text-dark">{exam.totalMarks}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {exam.status === 'draft' && (user.role === ROLES.HEAD_TEACHER || user.role === ROLES.ADMIN) && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedExam(exam)
                          setShowForm(true)
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} className="text-primary-blue" />
                      </button>
                      <button
                        onClick={() => handlePublish(exam._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Publish"
                      >
                        <CheckCircle size={18} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ExamForm
          isOpen={showForm}
          exam={selectedExam}
          onClose={() => {
            setShowForm(false)
            setSelectedExam(null)
          }}
          onSuccess={() => {
            setSelectedExam(null)
            loadExams()
          }}
        />
      )}
    </div>
  )
}

export default Exams
