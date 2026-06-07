import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, BookOpen, CheckCircle, DollarSign, Calendar, User, AlertCircle, Loader, TrendingUp, FileText, RefreshCw, Award } from 'lucide-react'
import { parentsApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useSettings } from '../contexts/SettingsContext'
import ChildHomework from '../components/ChildHomework'
import ErrorBoundary from '../components/ErrorBoundary'

function ChildDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { error: showError, success: showSuccess } = useToast()
  const { currentAcademicYear } = useSettings()

  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null)
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'cash', notes: '', fee_id: '' })

  // Detail data
  const [grades, setGrades] = useState([])
  const [attendance, setAttendance] = useState([])
  const [fees, setFees] = useState([])

  useEffect(() => {
    loadChildData()
  }, [id, currentAcademicYear])

  const loadChildData = async () => {
    try {
      setLoading(true)
      const [gradesData, attendanceData, feesData, resultsData] = await Promise.all([
        parentsApi.getChildGrades(id).catch((err) => {
          console.error('Error loading grades:', err)
          return []
        }),
        parentsApi.getChildAttendance(id).catch((err) => {
          console.error('Error loading attendance:', err)
          return []
        }),
        parentsApi.getChildFees(id).catch((err) => {
          console.error('Error loading fees:', err)
          return []
        }),
        parentsApi.getChildResults(id).catch((err) => {
          console.error('Error loading results:', err)
          return []
        })
      ])

      console.log('Grades:', gradesData)
      console.log('Attendance:', attendanceData)
      console.log('Fees:', feesData)
      console.log('Results:', resultsData)

      setGrades(resultsData || [])
      setAttendance(attendanceData || [])
      setFees(feesData || [])

      // Get child basic info
      const dashboard = await parentsApi.getDashboard()
      const childData = dashboard.children?.find(c => c._id === id)
      if (childData) {
        setChild(childData)
      }
    } catch (err) {
      console.error('Error loading child data:', err)
      showError(err.message || 'Failed to load child data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadChildData()
    showSuccess('Data refreshed successfully')
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!paymentForm.amount || paymentForm.amount <= 0) {
      showError('Please enter a valid payment amount')
      return
    }

    try {
      setPaymentLoading(true)
      const response = await parentsApi.makePayment(id, {
        fee_id: paymentForm.fee_id || undefined,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      })

      showSuccess(`Payment of K${paymentForm.amount} recorded successfully`)
      setPaymentForm({ amount: '', paymentMethod: 'cash', notes: '', fee_id: '' })
      setShowPaymentForm(false)
      
      // Refresh fees data
      await loadChildData()
    } catch (err) {
      showError(err.message || 'Failed to record payment')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true)
      const blob = await parentsApi.downloadChildReport(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${child?.firstName}_${child?.lastName}_Report.pdf`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      a.remove()
      showSuccess('Report downloaded successfully')
    } catch (err) {
      showError(err.message || 'Failed to download report')
    } finally {
      setDownloadingReport(false)
    }
  }

  const calculateAttendancePercentage = () => {
    if (attendance.length === 0) return 0
    const present = attendance.filter(a => a.status === 'present').length
    return Math.round((present / attendance.length) * 100)
  }

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 'N/A'
    
    // Handle exam results format (from /results endpoint)
    if (grades[0]?.overallGrade !== undefined || grades[0]?.percentage !== undefined) {
      const total = grades.reduce((sum, result) => {
        // Use percentage if available, or try to convert grade to numeric
        const value = result.percentage || 
                     (result.overallGrade ? gradeToNumber(result.overallGrade) : 0)
        return sum + value
      }, 0)
      const average = total / grades.length
      return isNaN(average) ? 'N/A' : average.toFixed(2)
    }
    
    // Handle legacy grades format
    const total = grades.reduce((sum, g) => {
      // Try to get grade in order of preference: finalGrade > grade > endTermGrade > midTermGrade
      const gradeValue = g.finalGrade || g.grade || g.endTermGrade || g.midTermGrade || 0
      return sum + gradeValue
    }, 0)
    const average = total / grades.length
    return isNaN(average) ? 'N/A' : average.toFixed(2)
  }

  const gradeToNumber = (grade) => {
    const gradeMap = { 'A+': 95, 'A': 90, 'B+': 85, 'B': 80, 'C+': 75, 'C': 70, 'D': 60, 'F': 0 }
    return gradeMap[grade] || 0
  }

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-500'
    const gradeStr = String(grade).toUpperCase()
    if (gradeStr.startsWith('A')) return 'text-green-600'
    if (gradeStr.startsWith('B')) return 'text-primary-blue'
    if (gradeStr.startsWith('C')) return 'text-yellow-600'
    if (gradeStr.startsWith('D')) return 'text-orange-600'
    if (gradeStr.startsWith('E') || gradeStr.startsWith('F')) return 'text-red-600'
    return 'text-gray-500'
  }

  const getGradeBgColor = (grade) => {
    if (!grade) return 'bg-gray-50'
    const gradeStr = String(grade).toUpperCase()
    if (gradeStr.startsWith('A')) return 'bg-green-50 border-green-200'
    if (gradeStr.startsWith('B')) return 'bg-cyan-50 border-cyan-200'
    if (gradeStr.startsWith('C')) return 'bg-yellow-50 border-yellow-200'
    if (gradeStr.startsWith('D')) return 'bg-orange-50 border-orange-200'
    if (gradeStr.startsWith('E') || gradeStr.startsWith('F')) return 'bg-red-50 border-red-200'
    return 'bg-gray-50'
  }

  const calculateFeesStatus = () => {
    // Use summary data from the backend which is already calculated
    if (fees && fees.summary) {
      const { totalFees, totalPaid, pendingFees } = fees.summary
      const percentage = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0
      return {
        paid: totalPaid,
        pending: pendingFees,
        percentage
      }
    }

    // Fallback: handle legacy format or direct array
    let feesList = []
    
    if (Array.isArray(fees)) {
      feesList = fees
    } else if (fees && typeof fees === 'object' && fees.fees && Array.isArray(fees.fees)) {
      feesList = fees.fees
    }

    if (!Array.isArray(feesList) || feesList.length === 0) {
      return { paid: 0, pending: 0, percentage: 0 }
    }

    const totalAmount = feesList.reduce((sum, f) => sum + (f.amount || 0), 0)
    const paidAmount = feesList.reduce((sum, f) => sum + (f.amountPaid || 0), 0)
    const percentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0
    
    return {
      paid: paidAmount,
      pending: totalAmount - paidAmount,
      percentage
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-primary-blue" size={32} />
      </div>
    )
  }

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-text-dark mb-2">Child Not Found</h1>
        <button
          onClick={() => navigate('/children')}
          className="mt-4 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
        >
          Back to Children
        </button>
      </div>
    )
  }

  const feesStatus = calculateFeesStatus()
  const avgGrade = calculateAverageGrade()
  const attendancePercentage = calculateAttendancePercentage()

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background-light">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col gap-3 mb-4">
              <button
                onClick={() => navigate('/children')}
                className="flex items-center gap-2 text-primary-blue hover:text-primary-blue/80 transition text-xs sm:text-sm font-medium w-fit"
              >
                <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Back to Children</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>

            {/* Child Header */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-blue to-primary-deep flex items-center justify-center text-white flex-shrink-0">
                <User size={24} className="sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold text-text-dark truncate">
                  {child.firstName} {child.lastName}
                </h1>
                <p className="text-xs sm:text-sm text-text-muted truncate">Student ID: {child.studentId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {/* Position in Class */}
            <div className="surface-card section-pad border-l-4 border-primary-blue">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-text-muted text-xs sm:text-sm font-medium">Overall Average</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-blue mt-1 sm:mt-2">{avgGrade}</p>
                  {grades.length > 0 && <p className="text-xs text-text-muted mt-1">All-time average</p>}
                </div>
                <Award size={24} className="hidden sm:block text-primary-blue opacity-20 flex-shrink-0" />
              </div>
            </div>

            {/* Attendance */}
            <div className="surface-card section-pad border-l-4 border-green-500">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-text-muted text-xs sm:text-sm font-medium">Attendance Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{attendancePercentage}%</p>
                </div>
                <CheckCircle size={24} className="hidden sm:block text-green-500 opacity-20 flex-shrink-0" />
              </div>
            </div>

            {/* Fees Status */}
            <div className="surface-card section-pad border-l-4 border-orange-500">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-text-muted text-xs sm:text-sm font-medium">Fees Paid</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1 sm:mt-2">K{feesStatus.paid.toFixed(2)}</p>
                </div>
                <DollarSign size={24} className="hidden sm:block text-orange-500 opacity-20 flex-shrink-0" />
              </div>
            </div>

            {/* Pending Fees */}
            <div className="surface-card section-pad border-l-4 border-red-500">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-text-muted text-xs sm:text-sm font-medium">Fees Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-1 sm:mt-2">K{feesStatus.pending.toFixed(2)}</p>
                </div>
                <AlertCircle size={24} className="hidden sm:block text-red-500 opacity-20 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="surface-card overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {['overview', 'grades', 'attendance', 'fees', 'homework'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 sm:px-6 py-3 font-medium text-xs sm:text-sm capitalize transition border-b-2 whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-primary-blue border-primary-blue'
                        : 'text-text-muted border-transparent hover:text-text-dark'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <h3 className="font-semibold text-text-dark mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-primary-blue" />
                        Recent Exams
                      </h3>
                      {grades.length > 0 ? (
                        <div className="space-y-3">
                          <div className="overflow-x-auto">
                            <div className="flex gap-2 pb-2 min-w-max lg:min-w-full lg:flex-wrap">
                              {grades.slice(0, 4).map((result, idx) => (
                                <div key={idx} className={`flex-shrink-0 lg:flex-shrink min-w-max lg:min-w-0 lg:flex-1 ${getGradeBgColor(result.overallGrade)} border-2 rounded-lg p-3 text-center hover:shadow-md transition`}>
                                  <p className="text-xs font-semibold text-text-muted truncate mb-1">
                                    {result.exam?.name || 'Exam'}
                                  </p>
                                  <p className={`text-2xl font-bold ${getGradeColor(result.overallGrade)}`}>
                                    {result.overallGrade || 'N/A'}
                                  </p>
                                  <p className="text-xs text-text-muted mt-1">{result.percentage}%</p>
                                </div>
                              ))}
                              {grades.length > 4 && (
                                <div className="flex-shrink-0 lg:flex-shrink min-w-max lg:min-w-0 lg:flex-1 bg-gradient-to-br from-cyan-100 to-cyan-50 border-2 border-cyan-300 rounded-lg p-3 text-center">
                                  <p className="text-xs font-semibold text-cyan-700 mb-1">Average</p>
                                  <p className="text-2xl font-bold text-primary-blue">{avgGrade}%</p>
                                  <p className="text-xs text-cyan-700 mt-1">+{grades.length - 4} more</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-text-muted">No grades available yet</p>
                      )}
                    </div>

                    {/* Attendance Summary */}
                    <div>
                      <h3 className="font-semibold text-text-dark mb-4 flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-600" />
                        Attendance Summary
                      </h3>
                      {attendance.length > 0 ? (
                        <div className="space-y-3">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-full transition-all"
                              style={{ width: `${attendancePercentage}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-green-50 rounded">
                              <p className="text-text-muted text-xs">Present</p>
                              <p className="text-xl font-bold text-green-600">
                                {attendance.filter(a => a.status === 'present').length}
                              </p>
                            </div>
                            <div className="p-3 bg-red-50 rounded">
                              <p className="text-text-muted text-xs">Absent</p>
                              <p className="text-xl font-bold text-red-600">
                                {attendance.filter(a => a.status === 'absent').length}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-text-muted">No attendance records yet</p>
                      )}
                    </div>
                  </div>

                  {/* Fees Overview */}
                  <div>
                    <h3 className="font-semibold text-text-dark mb-4 flex items-center gap-2">
                      <DollarSign size={20} className="text-orange-600" />
                      Fees Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-cyan-50 rounded-lg">
                        <p className="text-text-muted text-sm">Total Amount</p>
                        <p className="text-2xl font-bold text-primary-blue mt-1">
                          K{(feesStatus.paid + feesStatus.pending).toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-text-muted text-sm">Paid</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          K{feesStatus.paid.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-text-muted text-sm">Pending</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                          K{feesStatus.pending.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grades Tab */}
              {activeTab === 'grades' && (
                <div>
                  <h3 className="font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-primary-blue" />
                    Exam Results
                  </h3>
                  
                  {grades.length > 0 ? (
                    <div>
                      {/* Academic Year Tabs */}
                      <div className="mb-4 border-b border-gray-200 overflow-x-auto">
                        <div className="flex gap-1">
                          {Array.from(new Set(grades.map(g => g.exam?.academicYear))).sort().reverse().map(year => (
                            <button
                              key={year}
                              onClick={() => {
                                setSelectedAcademicYear(year);
                                setSelectedTerm(null);
                              }}
                              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                                selectedAcademicYear === year
                                  ? 'text-primary-blue border-primary-blue'
                                  : 'text-text-muted border-transparent hover:text-text-dark'
                              }`}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Set default academic year on first load */}
                      {!selectedAcademicYear && grades.length > 0 && (
                        (() => {
                          const defaultYear = Array.from(new Set(grades.map(g => g.exam?.academicYear))).sort().reverse()[0];
                          setSelectedAcademicYear(defaultYear);
                          return null;
                        })()
                      )}

                      {selectedAcademicYear && (
                        <div>
                          {/* Term Tabs */}
                          <div className="mb-4 border-b border-gray-200 overflow-x-auto bg-gray-50 p-2 rounded-lg">
                            <div className="flex gap-2">
                              {Array.from(new Set(
                                grades
                                  .filter(g => g.exam?.academicYear === selectedAcademicYear)
                                  .map(g => g.exam?.term)
                              )).sort().map(term => (
                                <button
                                  key={term}
                                  onClick={() => setSelectedTerm(term)}
                                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-lg transition ${
                                    selectedTerm === term
                                      ? 'text-white bg-primary-blue'
                                      : 'text-text-muted bg-white border border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  {term}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Set default term on year change */}
                          {selectedAcademicYear && !selectedTerm && (
                            (() => {
                              const defaultTerm = Array.from(new Set(
                                grades
                                  .filter(g => g.exam?.academicYear === selectedAcademicYear)
                                  .map(g => g.exam?.term)
                              )).sort()[0];
                              setSelectedTerm(defaultTerm);
                              return null;
                            })()
                          )}

                          {selectedTerm && (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Exam</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Subject</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Score</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-text-dark">Percentage</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Grade</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Comment</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {grades
                                    .filter(g => g.exam?.academicYear === selectedAcademicYear && g.exam?.term === selectedTerm)
                                    .map((result, idx) => {
                                      const percentage = result.exam?.totalMarks ? Math.round((result.score / result.exam.totalMarks) * 100) : 0;
                                      const gradeColor = percentage >= 80 ? 'text-green-600 bg-green-50' : percentage >= 60 ? 'text-primary-blue bg-cyan-50' : percentage >= 40 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
                                      
                                      return (
                                        <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                                          <td className="px-4 py-3 text-sm text-text-dark font-medium">
                                            <div>
                                              <p>{result.exam?.name}</p>
                                              <p className="text-xs text-text-muted">
                                                {result.exam?.examType}
                                              </p>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 text-sm text-text-dark">
                                            {result.subject?.name}
                                            {result.subject?.code && <span className="text-text-muted ml-1">({result.subject.code})</span>}
                                          </td>
                                          <td className="px-4 py-3 text-sm font-medium text-text-dark">
                                            {result.score}/{result.exam?.totalMarks || 100}
                                          </td>
                                          <td className="px-4 py-3 text-sm font-medium text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full font-semibold ${gradeColor}`}>
                                              {percentage}%
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-sm font-medium text-text-dark">
                                            {percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'D'}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-text-muted">
                                            {result.remarks || '-'}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-text-muted">No exam results available yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                <div>
                  <h3 className="font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    Attendance Records
                  </h3>
                  {attendance.length > 0 ? (
                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-green-500 h-4 rounded-full transition-all"
                          style={{ width: `${attendancePercentage}%` }}
                        />
                      </div>
                      <p className="text-center text-lg font-semibold text-text-dark">
                        Attendance Rate: {attendancePercentage}%
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left p-3 text-sm font-semibold text-text-muted">Date</th>
                              <th className="text-left p-3 text-sm font-semibold text-text-muted">Day</th>
                              <th className="text-left p-3 text-sm font-semibold text-text-muted">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendance.slice(0, 20).map((record, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3 text-sm text-text-dark">
                                  {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-sm text-text-dark">
                                  {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                      record.status === 'present'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-text-muted">No attendance records yet</p>
                  )}
                </div>
              )}

              {/* Fees Tab */}
              {activeTab === 'fees' && (
                <div>
                  <h3 className="font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-orange-600" />
                    Fees & Payments
                  </h3>

                  {/* Fees Overview */}
                  <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div
                        className="bg-orange-500 h-3 rounded-full transition-all"
                        style={{ width: `${feesStatus.percentage}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                      <div>
                        <p className="text-text-muted text-xs sm:text-sm font-medium">Total</p>
                        <p className="text-xl sm:text-lg font-bold text-text-dark mt-1">
                          K{(feesStatus.paid + feesStatus.pending).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-muted text-xs sm:text-sm font-medium">Paid</p>
                        <p className="text-xl sm:text-lg font-bold text-green-600 mt-1">
                          K{feesStatus.paid.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-text-muted text-xs sm:text-sm font-medium">Pending</p>
                        <p className="text-xl sm:text-lg font-bold text-red-600 mt-1">
                          K{feesStatus.pending.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-xs sm:text-sm text-text-muted mt-2">
                      Payment Progress: {feesStatus.percentage}%
                    </p>
                  </div>

                  {/* Payment Button */}
                  {feesStatus.pending > 0 && (
                    <div className="mb-6">
                      <button
                        onClick={() => setShowPaymentForm(!showPaymentForm)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm sm:text-base"
                      >
                        {showPaymentForm ? 'Cancel Payment' : 'Make Payment'}
                      </button>
                    </div>
                  )}

                  {/* Payment Form */}
                  {showPaymentForm && feesStatus.pending > 0 && (
                    <form onSubmit={handlePayment} className="mb-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-text-dark mb-4 text-sm sm:text-base">Record Payment</h4>
                      
                      <div className="space-y-3">
                        {/* Select Fee (optional) */}
                        {fees.fees && fees.fees.length > 0 && (
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-text-dark mb-1">
                              Apply to Specific Fee (Optional)
                            </label>
                            <select
                              value={paymentForm.fee_id}
                              onChange={(e) => setPaymentForm({...paymentForm, fee_id: e.target.value})}
                              className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Distribute to all unpaid fees</option>
                              {fees.fees.filter(f => f.status !== 'paid').map((fee) => (
                                <option key={fee._id} value={fee._id}>
                                  {fee.description || 'Fee'} - K{fee.amount}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Amount */}
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-text-dark mb-1">
                            Amount (K)
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            max={feesStatus.pending}
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                            placeholder={`Max: K${feesStatus.pending.toFixed(2)}`}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>

                        {/* Payment Method */}
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-text-dark mb-1">
                            Payment Method
                          </label>
                          <select
                            value={paymentForm.paymentMethod}
                            onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="mobile_money">Mobile Money</option>
                            <option value="cheque">Cheque</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-text-dark mb-1">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                            placeholder="e.g., Reference number, payment details..."
                            rows="2"
                            className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={paymentLoading}
                          className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium text-xs sm:text-sm"
                        >
                          {paymentLoading ? 'Recording Payment...' : 'Record Payment'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Fees List */}
                  {fees.fees && fees.fees.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium text-text-dark mb-3 text-sm">Fee Breakdown</h4>
                      {fees.fees.map((fee, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-dark text-sm">{fee.description || 'Fee'}</p>
                            {fee.term && <p className="text-xs text-text-muted">Term {fee.term}</p>}
                            {fee.dueDate && <p className="text-xs text-text-muted">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>}
                          </div>
                          <div className="text-left sm:text-right flex items-center justify-between sm:flex-col gap-2">
                            <p className="font-semibold text-text-dark text-sm">K{fee.amount}</p>
                            <p className={`text-xs font-medium ${fee.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                              {fee.status === 'paid' ? 'Paid' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                      <p className="text-text-muted text-sm">No fee records available yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Homework Tab */}
              {activeTab === 'homework' && (
                <div>
                  <h3 className="font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-primary-blue" />
                    Homework Assignments
                  </h3>
                  <ChildHomework studentId={id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ChildDetail
