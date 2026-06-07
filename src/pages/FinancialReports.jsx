import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, AlertTriangle, Calendar, Download, Filter } from 'lucide-react'
import { accountsApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useSettings } from '../contexts/SettingsContext'

function FinancialReports() {
  const [summary, setSummary] = useState(null)
  const [overdue, setOverdue] = useState(null)
  const [trend, setTrend] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [academicYear, setAcademicYear] = useState('')
  const [academicYears, setAcademicYears] = useState([])
  const { error: showError, success } = useToast()
  const { currentAcademicYear, academicYears: contextAcademicYears } = useSettings()

  useEffect(() => {
    if (contextAcademicYears && contextAcademicYears.length > 0) {
      setAcademicYears(contextAcademicYears)
      if (currentAcademicYear?.year) {
        setAcademicYear(currentAcademicYear.year)
      }
    }
  }, [contextAcademicYears, currentAcademicYear])

  useEffect(() => {
    loadReports()
  }, [academicYear])

  const loadReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (academicYear) queryParams.append('academicYear', academicYear)
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate)
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate)

      const [summaryData, overdueData, trendData] = await Promise.all([
        accountsApi.getReportSummary(queryParams),
        accountsApi.getReportOverdue(),
        accountsApi.getReportTrend({ months: 12 })
      ])

      setSummary(summaryData.summary)
      setOverdue(overdueData)
      setTrend(trendData.trend)
    } catch (err) {
      const errorMessage = err.message || 'Failed to load reports'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (key, value) => {
    const newDateRange = { ...dateRange, [key]: value }
    setDateRange(newDateRange)
  }

  const handleApplyDateFilter = () => {
    loadReports()
  }

  const downloadReport = (type) => {
    const data = type === 'summary' ? summary : type === 'overdue' ? overdue : trend
    const jsonStr = JSON.stringify(data, null, 2)
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr))
    element.setAttribute('download', `${type}-report-${new Date().toISOString().split('T')[0]}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    success('Report downloaded')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-dark">Financial Reports</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">Analytics and financial insights</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="">Select Year</option>
              {academicYears.map(yearObj => {
                // Handle both string and object formats
                const yearValue = typeof yearObj === 'string' ? yearObj : yearObj?.year || ''
                const yearKey = typeof yearObj === 'string' ? yearValue : yearObj?._id || yearValue
                return (
                  <option key={yearKey} value={yearValue}>
                    {yearValue}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyDateFilter}
              className="w-full px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors font-medium text-sm"
            >
              <Filter size={16} className="inline mr-2" />
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-medium text-red-800">Error loading reports</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Fees</p>
                <p className="text-2xl font-bold text-text-dark mt-2">K{summary.totalFees?.toLocaleString()}</p>
              </div>
              <BarChart3 size={32} className="text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Paid</p>
                <p className="text-2xl font-bold text-text-dark mt-2">K{summary.totalPaid?.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">{summary.paidPercentage}% collected</p>
              </div>
              <TrendingUp size={32} className="text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Outstanding</p>
                <p className="text-2xl font-bold text-text-dark mt-2">K{summary.totalOutstanding?.toLocaleString()}</p>
              </div>
              <AlertTriangle size={32} className="text-red-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Fee Breakdown */}
      {summary?.feeBreakdown && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Fee Status Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-3xl font-bold text-green-600">{summary.feeBreakdown.paid}</p>
              <p className="text-sm text-gray-600 mt-1">Paid</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-3xl font-bold text-yellow-600">{summary.feeBreakdown.pending}</p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-3xl font-bold text-red-600">{summary.feeBreakdown.unpaid}</p>
              <p className="text-sm text-gray-600 mt-1">Unpaid</p>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Fees */}
      {overdue && overdue.count > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text-dark">Overdue Fees</h2>
              <p className="text-sm text-gray-600 mt-1">{overdue.count} fees overdue - Total: K{overdue.totalOverdue?.toLocaleString()}</p>
            </div>
            <button
              onClick={() => downloadReport('overdue')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-text-dark rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Download size={16} />
              Download
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">Student</th>
                  <th className="text-right py-2 px-2 font-medium">Outstanding</th>
                  <th className="text-right py-2 px-2 font-medium">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {overdue.fees?.slice(0, 10).map((fee, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">{fee.studentId?.firstName} {fee.studentId?.lastName}</td>
                    <td className="py-2 px-2 text-right font-medium">K{fee.outstandingAmount?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-red-600 font-medium">{fee.daysOverdue} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collection Trend */}
      {trend && trend.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-dark">Payment Trend (Last 12 Months)</h2>
            <button
              onClick={() => downloadReport('trend')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-text-dark rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Download size={16} />
              Download
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">Period</th>
                  <th className="text-right py-2 px-2 font-medium">Amount</th>
                  <th className="text-right py-2 px-2 font-medium">Payments</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2">{item._id?.month}/{item._id?.year}</td>
                    <td className="py-2 px-2 text-right font-medium">K{item.totalAmount?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancialReports
