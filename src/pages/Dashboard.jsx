import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import { Link } from 'react-router-dom'
import { GraduationCap, User, Users, School, FileText, Award, DollarSign, Calendar, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { studentsApi, teachersApi, classroomsApi, feesApi, expensesApi, issuesApi, parentsApi, teacherApi } from '../services/api'
import PageHeader from '../components/PageHeader'

// Admin Dashboard
function AdminDashboard() {
  const { schoolSettings, currentAcademicYear } = useSettings()
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classrooms: 0,
    exams: 0,
    totalFees: 0,
    totalExpenses: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [students, teachers, classrooms, fees, expenses] = await Promise.all([
        studentsApi.list(),
        teachersApi.list(),
        classroomsApi.list(),
        feesApi.list(),
        expensesApi.list()
      ])
      
      const totalFees = fees.reduce((sum, f) => sum + f.amount, 0)
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      
      setStats({
        students: students.length,
        teachers: teachers.length,
        classrooms: classrooms.length,
        totalFees,
        totalExpenses
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Control Center"
        title="Admin Dashboard"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Link to="/roles" className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Users & Roles</p>
              <p className="font-display text-3xl font-semibold text-text-dark">Manage</p>
            </div>
            <Users className="text-primary-blue" size={36} />
          </div>
        </Link>

        <Link to="/students" className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Students</p>
              <p className="font-display text-3xl font-semibold text-text-dark">{stats.students}</p>
            </div>
            <GraduationCap className="text-primary-blue" size={36} />
          </div>
        </Link>

        <Link to="/teachers" className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Teachers</p>
              <p className="font-display text-3xl font-semibold text-text-dark">{stats.teachers}</p>
            </div>
            <User className="text-primary-blue" size={36} />
          </div>
        </Link>

        <Link to="/classrooms" className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Classrooms</p>
              <p className="font-display text-3xl font-semibold text-text-dark">{stats.classrooms}</p>
            </div>
            <School className="text-primary-blue" size={36} />
          </div>
        </Link>

        <Link to="/fees" className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Fees</p>
              <p className="font-display text-3xl font-semibold text-text-dark">K{stats.totalFees}</p>
            </div>
            <DollarSign className="text-primary-blue" size={36} />
          </div>
        </Link>

        <Link to="/expenses" className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Expenses</p>
              <p className="font-display text-3xl font-semibold text-text-dark">K{stats.totalExpenses}</p>
            </div>
            <DollarSign className="text-primary-blue" size={36} />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Link to="/results" className="surface-card section-pad hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)] transition-shadow">
          <div className="flex items-center gap-4">
            <Award className="text-primary-blue" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark mb-1">Results</h3>
              <p className="text-sm text-text-muted">View exam results</p>
            </div>
          </div>
        </Link>

        <Link to="/issues" className="surface-card section-pad hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)] transition-shadow">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-primary-blue" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark mb-1">Issues</h3>
              <p className="text-sm text-text-muted">Manage issues</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

// Parent Dashboard
function ParentDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setError(null)
      const data = await parentsApi.getDashboard()
      console.log('Parent dashboard API response:', data)
      setDashboardData(data)
    } catch (error) {
      console.error('Error loading parent dashboard:', error)
      setError(error.message || 'Failed to load parent dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Parent Dashboard</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-medium">Error</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button onClick={loadDashboard} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Parent Dashboard</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-text-muted">No profile data available yet</p>
        </div>
      </div>
    )
  }

  const { summary, children } = dashboardData

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Parent Dashboard</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Children Card */}
        <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Total Children</p>
            <GraduationCap className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">{summary?.totalChildren || 0}</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Enrolled students</p>
        </div>

        {/* Fees Paid Card */}
        <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-green-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Fees Paid</p>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-green-600">K{(summary?.totalPaid || 0).toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">of K{(summary?.totalFees || 0).toFixed(2)}</p>
        </div>

        {/* Pending Fees Card */}
        <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-orange-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Pending</p>
            <AlertCircle className="text-orange-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-orange-600">K{(summary?.pendingFees || 0).toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Amount due</p>
        </div>

        {/* Attendance Card */}
        <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-purple-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Attendance</p>
            <Award className="text-purple-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-purple-600">{(summary?.attendanceRate || 0).toFixed(1)}%</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Overall rate</p>
        </div>
      </div>

      {/* Overdue Fees Alert */}
      {summary?.overdueFees > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-l-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-600 text-sm sm:text-base">Overdue Fees</h3>
              <p className="text-xs sm:text-sm text-red-700 mt-1">You have K{(summary.overdueFees).toFixed(2)} in overdue fees. Please make payment as soon as possible.</p>
            </div>
          </div>
        </div>
      )}

      {/* Children Overview */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-dark mb-3 sm:mb-4">Children</h2>
        {children && children.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {children.map((child) => (
              <Link
                key={child._id}
                to={`/children/${child._id}`}
                className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div>
                  <p className="text-sm text-text-muted mb-1">Student ID: {child.studentId}</p>
                  <p className="text-lg sm:text-xl font-semibold text-text-dark">{child.firstName} {child.lastName}</p>
                  {child.class && <p className="text-xs sm:text-sm text-text-muted mt-2">Class: {child.class}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-text-muted text-sm">No children enrolled yet</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-dark mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Link to="/children" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <GraduationCap className="text-blue-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">View Children</h3>
              <p className="text-xs sm:text-sm text-text-muted">See all details</p>
            </div>
          </Link>

          <Link to="/messages" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <FileText className="text-green-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Messages</h3>
              <p className="text-xs sm:text-sm text-text-muted">Communication</p>
            </div>
          </Link>

          <Link to="/children" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <DollarSign className="text-orange-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Fees</h3>
              <p className="text-xs sm:text-sm text-text-muted">Payment info</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Teacher Dashboard
function TeacherDashboard() {
  const { user } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadClassrooms()
  }, [])

  const loadClassrooms = async () => {
    try {
      setError(null)
      const data = await teacherApi.getMyClassrooms()
      console.log('Classrooms API response:', data)
      setClassrooms(data.data || data || [])
    } catch (error) {
      console.error('Error loading classrooms:', error)
      setError(error.message || 'Failed to load classrooms')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Teacher Dashboard</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-medium">Error</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button onClick={loadClassrooms} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Teacher Dashboard</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">My Classes</p>
            <School className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">{classrooms.length}</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Classrooms assigned</p>
        </div>

        <Link to="/timetable" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Attendance</p>
            <Calendar className="text-green-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">Mark</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Student presence</p>
        </Link>

        <Link to="/results" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Results</p>
            <Award className="text-purple-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">Manage</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Grades & scores</p>
        </Link>
      </div>

      {/* My Classrooms Section */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-dark mb-3 sm:mb-4">My Classrooms</h2>
        {classrooms && classrooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {classrooms.map((classroom) => (
              <div key={classroom._id} className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs sm:text-sm text-text-muted font-medium">Class</p>
                    <p className="text-lg sm:text-xl font-semibold text-text-dark">{classroom.name}</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-2">
                    <School className="text-blue-600" size={20} />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-text-muted">Grade:</span>
                    <span className="font-medium text-text-dark">{classroom.grade}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-text-muted">Section:</span>
                    <span className="font-medium text-text-dark">{classroom.section}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-text-muted">Students:</span>
                    <span className="font-medium text-blue-600">{classroom.students?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-text-muted">Capacity:</span>
                    <span className="font-medium text-text-dark">{classroom.capacity}</span>
                  </div>
                </div>
                <Link
                  to={`/classrooms/${classroom._id}`}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm font-medium text-center inline-block"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-text-muted text-sm">No classrooms assigned yet</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-dark mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Link to="/timetable" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <Calendar className="text-green-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Mark Attendance</h3>
              <p className="text-xs sm:text-sm text-text-muted">Daily records</p>
            </div>
          </Link>

          <Link to="/results" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <Award className="text-purple-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Enter Results</h3>
              <p className="text-xs sm:text-sm text-text-muted">Student grades</p>
            </div>
          </Link>

          <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 flex items-center gap-4">
            <School className="text-blue-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Classes</h3>
              <p className="text-xs sm:text-sm text-blue-600">{classrooms.length} assigned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Student Dashboard
function StudentDashboard() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Student Dashboard</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Link to="/subjects" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Subjects</p>
            <FileText className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">Browse</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Course materials</p>
        </Link>

        <Link to="/attendance" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Attendance</p>
            <Calendar className="text-green-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">Check</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Your records</p>
        </Link>

        <Link to="/results" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Results</p>
            <Award className="text-purple-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">View</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Your grades</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-dark mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Link to="/subjects" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <FileText className="text-blue-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Subjects</h3>
              <p className="text-xs sm:text-sm text-text-muted">View all courses</p>
            </div>
          </Link>

          <Link to="/timetable" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <Calendar className="text-blue-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Timetable</h3>
              <p className="text-xs sm:text-sm text-text-muted">Class schedule</p>
            </div>
          </Link>

          <Link to="/issues" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <AlertCircle className="text-orange-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Report Issue</h3>
              <p className="text-xs sm:text-sm text-text-muted">Need help?</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Accounts Dashboard
function AccountsDashboard() {
  const [stats, setStats] = useState({
    totalFees: 0,
    totalExpenses: 0,
    totalPayments: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setError(null)
      const [fees, expenses] = await Promise.all([
        feesApi.list(),
        expensesApi.list()
      ])
      
      const totalFees = fees.reduce((sum, f) => sum + f.amount, 0)
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      const paidFees = fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0)
      
      setStats({
        totalFees,
        totalExpenses,
        totalPayments: paidFees
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      setError(error.message || 'Failed to load accounting data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Accounts Dashboard</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">Financial overview</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-medium">Error</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button onClick={loadStats} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const netBalance = stats.totalPayments - stats.totalExpenses

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Accounts Dashboard</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">Financial overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Fees Card */}
        <Link to="/fees" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Total Fees</p>
            <DollarSign className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">K{stats.totalFees.toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">All fees charged</p>
        </Link>

        {/* Total Payments Card */}
        <Link to="/payments" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Payments Received</p>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-green-600">K{stats.totalPayments.toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Collected so far</p>
        </Link>

        {/* Total Expenses Card */}
        <Link to="/expenses" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Total Expenses</p>
            <TrendingDown className="text-red-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-red-600">K{stats.totalExpenses.toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Amount spent</p>
        </Link>

        {/* Net Balance Card */}
        <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-purple-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Net Balance</p>
            <Award className="text-purple-500" size={24} />
          </div>
          <p className={`text-2xl sm:text-3xl font-semibold ${netBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
            K{Math.abs(netBalance).toFixed(2)}
          </p>
          <p className={`text-xs sm:text-sm ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'} mt-2`}>
            {netBalance >= 0 ? '✓ Surplus' : '✗ Deficit'}
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Payment Collection Rate */}
        <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6">
          <h3 className="font-semibold text-text-dark mb-4 text-sm sm:text-base">Collection Rate</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-text-muted">Payment Progress</p>
                <p className="text-xs sm:text-sm font-medium text-text-dark">
                  {stats.totalFees > 0 ? ((stats.totalPayments / stats.totalFees) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${stats.totalFees > 0 ? Math.min((stats.totalPayments / stats.totalFees) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-text-muted pt-2">
              <span>Collected: K{stats.totalPayments.toFixed(2)}</span>
              <span>Pending: K{(stats.totalFees - stats.totalPayments).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Financial Status */}
        <div className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6">
          <h3 className="font-semibold text-text-dark mb-4 text-sm sm:text-base">Financial Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-xs sm:text-sm text-text-muted">Total Income</span>
              <span className="font-semibold text-blue-600">K{stats.totalPayments.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-xs sm:text-sm text-text-muted">Total Expenses</span>
              <span className="font-semibold text-red-600">K{stats.totalExpenses.toFixed(2)}</span>
            </div>
            <div className={`flex items-center justify-between p-3 ${netBalance >= 0 ? 'bg-green-50' : 'bg-orange-50'} rounded-lg border-l-4 ${netBalance >= 0 ? 'border-l-green-500' : 'border-l-orange-500'}`}>
              <span className="text-xs sm:text-sm text-text-muted">Balance</span>
              <span className={`font-semibold ${netBalance >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                K{Math.abs(netBalance).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-dark mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Link to="/fees" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <DollarSign className="text-blue-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Manage Fees</h3>
              <p className="text-xs sm:text-sm text-text-muted">Add/edit fees</p>
            </div>
          </Link>

          <Link to="/payments" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <DollarSign className="text-green-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">View Payments</h3>
              <p className="text-xs sm:text-sm text-text-muted">Payment history</p>
            </div>
          </Link>

          <Link to="/expenses" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <DollarSign className="text-red-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Manage Expenses</h3>
              <p className="text-xs sm:text-sm text-text-muted">Add/view expenses</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
// Head Teacher Dashboard
function HeadTeacherDashboard (){
  const { user } = useAuth()
  const userName = user?.name || 'Head Teacher'

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Head Teacher Dashboard</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">Welcome back, {userName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Link to="/subjects" className="bg-card-white rounded-custom shadow-custom p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary-blue">
          <div className="flex items-center gap-4">
            <FileText className="text-primary-blue" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark">Subjects</h3>
              <p className="text-sm text-text-muted">View subjects</p>
            </div>
          </div>
        </Link>

        <Link to="/timetable" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Timetable</p>
            <Calendar className="text-green-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">View</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Classes schedule</p>
        </Link>

        <Link to="/attendance" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Attendance</p>
            <Calendar className="text-orange-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">Monitor</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Student presence</p>
        </Link>

        <Link to="/results" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-text-muted font-medium">Results</p>
            <Award className="text-purple-500" size={24} />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-text-dark">Review</p>
          <p className="text-xs sm:text-sm text-text-muted mt-2">Academic progress</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-text-dark mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Link to="/subjects" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <FileText className="text-blue-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Subjects</h3>
              <p className="text-xs sm:text-sm text-text-muted">Manage curriculum</p>
            </div>
          </Link>

          <Link to="/attendance" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <Calendar className="text-orange-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Attendance</h3>
              <p className="text-xs sm:text-sm text-text-muted">View records</p>
            </div>
          </Link>

          <Link to="/results" className="bg-card-white rounded-custom shadow-custom p-4 sm:p-6 hover:shadow-lg transition-shadow flex items-center gap-4">
            <Award className="text-purple-500" size={32} />
            <div>
              <h3 className="font-semibold text-text-dark text-sm sm:text-base">Results</h3>
              <p className="text-xs sm:text-sm text-text-muted">Review performance</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )       
}

// Main Dashboard Component
function Dashboard() {
  const { user } = useAuth()
  const userRole = user?.role || 'admin'

  if (userRole === 'admin') {
    return <AdminDashboard />
  } else if (userRole === 'teacher') {
    return <TeacherDashboard />
  } else if (userRole === 'student') {
    return <StudentDashboard />
  } else if (userRole === 'accounts') {
    return <AccountsDashboard />
  } else if (userRole === 'parent') {
    return <ParentDashboard />
  } else if (userRole === 'head-teacher') {
    return <HeadTeacherDashboard />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-dark">Dashboard</h1>
        <p className="text-text-muted mt-1">Welcome to the School Management System</p>
      </div>
    </div>
  )
}

export default Dashboard
