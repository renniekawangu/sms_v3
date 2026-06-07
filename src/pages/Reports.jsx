import React, { useState, useEffect } from 'react'
import { Download, FileText, BarChart3, Calendar, User, BookOpen, DollarSign } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'

const Reports = () => {
  const { success, error } = useToast()
  const [reportType, setReportType] = useState('attendance')
  const [loading, setLoading] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(null)
  const [reportParams, setReportParams] = useState({
    students: [],
    classes: [],
    subjects: [],
    reportTypes: []
  })

  const [filters, setFilters] = useState({
    studentId: '',
    classId: '',
    startDate: '',
    endDate: '',
    term: 'term1',
    period: 'current'
  })

  useEffect(() => {
    loadReportParameters()
  }, [])

  const loadReportParameters = async () => {
    try {
      setLoading(true)
      const token = JSON.parse(localStorage.getItem('user')).token
      const response = await fetch('/api/reports/available', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load report parameters')
      const data = await response.json()
      setReportParams(data.parameters)
    } catch (err) {
      console.error('Error loading parameters:', err)
      error('Failed to load report options')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(reportType)
      const token = JSON.parse(localStorage.getItem('user')).token

      let endpoint = `/api/reports/${reportType}`
      const params = new URLSearchParams()

      // Add relevant filters based on report type
      if (reportType === 'attendance') {
        if (filters.studentId) params.append('studentId', filters.studentId)
        if (filters.classId) params.append('classId', filters.classId)
        if (filters.startDate) params.append('startDate', filters.startDate)
        if (filters.endDate) params.append('endDate', filters.endDate)
      } else if (reportType === 'grades') {
        if (filters.studentId) params.append('studentId', filters.studentId)
        if (filters.classId) params.append('classId', filters.classId)
        if (filters.term) params.append('term', filters.term)
      } else if (reportType === 'fees') {
        if (!filters.studentId) {
          error('Please select a student for fee statement')
          setDownloadingReport(null)
          return
        }
        params.append('studentId', filters.studentId)
      } else if (reportType === 'analytics') {
        if (filters.period) params.append('period', filters.period)
      }

      const queryString = params.toString()
      const url = queryString ? `${endpoint}?${queryString}` : endpoint

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error(`Failed to generate report: ${response.status}`)

      // Get filename from header or use default
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `report-${Date.now()}.pdf`

      // Download PDF
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(link.href)
      document.body.removeChild(link)

      success('Report downloaded successfully')
    } catch (err) {
      console.error('Error downloading report:', err)
      error(err.message || 'Failed to download report')
    } finally {
      setDownloadingReport(null)
    }
  }

  const reportConfigs = {
    attendance: {
      icon: Calendar,
      name: 'Attendance Report',
      description: 'Generate attendance records for students',
      color: 'bg-blue-50 border-blue-200',
      btnColor: 'bg-blue-500 hover:bg-blue-600'
    },
    grades: {
      icon: BookOpen,
      name: 'Grade Report',
      description: 'Generate student grades and results',
      color: 'bg-green-50 border-green-200',
      btnColor: 'bg-green-500 hover:bg-green-600'
    },
    fees: {
      icon: DollarSign,
      name: 'Fee Statement',
      description: 'Generate student fee statements',
      color: 'bg-purple-50 border-purple-200',
      btnColor: 'bg-purple-500 hover:bg-purple-600'
    },
    analytics: {
      icon: BarChart3,
      name: 'Analytics Report',
      description: 'School-wide analytics and statistics (Admin only)',
      color: 'bg-orange-50 border-orange-200',
      btnColor: 'bg-orange-500 hover:bg-orange-600'
    }
  }

  const currentReport = reportConfigs[reportType]
  const CurrentIcon = currentReport.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <FileText size={32} className="text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Generate and download comprehensive reports
          </p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {Object.entries(reportConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                setReportType(key)
                setFilters({
                  studentId: '',
                  classId: '',
                  startDate: '',
                  endDate: '',
                  term: 'term1',
                  period: 'current'
                })
              }}
              className={`p-4 rounded-lg border-2 transition text-left ${
                reportType === key
                  ? config.color + ' border-blue-500'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <config.icon size={24} className={reportType === key ? 'text-blue-600' : 'text-gray-600'} />
              <h3 className="font-semibold text-sm sm:text-base mt-2 text-gray-900">{config.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{config.description}</p>
            </button>
          ))}
        </div>

        {/* Report Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Report Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Student Selection */}
            {['attendance', 'grades', 'fees'].includes(reportType) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student
                </label>
                <select
                  value={filters.studentId}
                  onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Students</option>
                  {reportParams.students?.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Class Selection */}
            {['attendance', 'grades'].includes(reportType) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={filters.classId}
                  onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Classes</option>
                  {reportParams.classes?.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Start Date */}
            {reportType === 'attendance' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}

            {/* End Date */}
            {reportType === 'attendance' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}

            {/* Term Selection */}
            {reportType === 'grades' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Term
                </label>
                <select
                  value={filters.term}
                  onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="term1">Term 1</option>
                  <option value="term2">Term 2</option>
                  <option value="term3">Term 3</option>
                </select>
              </div>
            )}

            {/* Period Selection */}
            {reportType === 'analytics' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Period
                </label>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="current">Current Session</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            )}
          </div>

          {/* Download Button */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadReport}
              disabled={downloadingReport === reportType || loading}
              className={`flex-1 px-4 py-2 sm:py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition ${
                currentReport.btnColor
              } disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base`}
            >
              <Download size={18} />
              {downloadingReport === reportType ? 'Generating...' : 'Download Report'}
            </button>
          </div>
        </div>

        {/* Report Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Report Tips
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Leave filters empty to include all records</li>
              <li>• Date ranges are inclusive</li>
              <li>• Reports are generated in PDF format</li>
              <li>• Admin access required for analytics</li>
            </ul>
          </div>

          {/* Available Reports */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 size={18} className="text-green-600" />
              Available Reports
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Attendance records and summaries</li>
              <li>✓ Student grades by term</li>
              <li>✓ Fee statements and status</li>
              <li>✓ School analytics (Admin)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
