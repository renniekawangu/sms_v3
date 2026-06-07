import { Link, useLocation } from 'react-router-dom'
import { Grid, GraduationCap, User, Users, School, BookOpen, Calendar, FileText, Award, CheckCircle, DollarSign, CreditCard, TrendingDown, AlertCircle, Settings, UserCog, Lock, X, LogOut, Mail, BarChart3, Bookmark, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { teacherApi } from '../services/api'
import { ROLES, ROUTE_ACCESS } from '../config/rbac'

/**
 * Role-based menu items definition
 * Only shows items that the user's role can access
 * Based on ROUTE_ACCESS from rbac.js config
 */
const allMenuItems = {
  dashboard: { label: 'Dashboard', icon: Grid, path: '/', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.STUDENT, ROLES.ACCOUNTS, ROLES.PARENT] },
  adminPanel: { label: 'Admin Panel', icon: Lock, path: '/admin', roles: [ROLES.ADMIN] },
  roles: { label: 'Users & Roles', icon: Users, path: '/roles', roles: [ROLES.ADMIN] },
  users: { label: 'Users', icon: UserCog, path: '/users', roles: [ROLES.ADMIN] },
  students: { label: 'Students', icon: GraduationCap, path: '/students', roles: [ROLES.ADMIN] },
  parents: { label: 'Parents', icon: Users, path: '/parents', roles: [ROLES.ADMIN] },
  teachers: { label: 'Teachers', icon: User, path: '/teachers', roles: [ROLES.ADMIN] },
  staffs: { label: 'Staffs', icon: UserCog, path: '/staffs', roles: [ROLES.ADMIN] },
  classrooms: { label: 'Classrooms', icon: School, path: '/classrooms', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.HEAD_TEACHER] },
  subjects: { label: 'Subjects', icon: BookOpen, path: '/subjects', roles: [ROLES.ADMIN, ROLES.HEAD_TEACHER] },
  timetable: { label: 'Timetable', icon: Calendar, path: '/timetable', roles: [ROLES.ADMIN, ROLES.HEAD_TEACHER, ROLES.STUDENT] },
  exams: { label: 'Exams', icon: FileText, path: '/exams', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.HEAD_TEACHER] },
  results: { label: 'Results', icon: Award, path: '/results', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.HEAD_TEACHER] },
  reportCards: { label: 'Report Cards', icon: Bookmark, path: '/report-cards', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.STUDENT] },
  resultsApproval: { label: 'Results Approval', icon: CheckCircle, path: '/results-approval', roles: [ROLES.ADMIN, ROLES.HEAD_TEACHER] },
  attendance: { label: 'Attendance', icon: CheckCircle, path: '/attendance', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.HEAD_TEACHER] },
  fees: { label: 'Fees', icon: DollarSign, path: '/fees', roles: [ROLES.ADMIN, ROLES.ACCOUNTS, ROLES.HEAD_TEACHER] },
  payments: { label: 'Payments', icon: CreditCard, path: '/payments', roles: [ROLES.ADMIN, ROLES.ACCOUNTS, ROLES.HEAD_TEACHER] },
  financialReports: { label: 'Financial Reports', icon: BarChart3, path: '/financial-reports', roles: [ROLES.ADMIN, ROLES.ACCOUNTS, ROLES.HEAD_TEACHER] },
  expenses: { label: 'Expenses', icon: TrendingDown, path: '/expenses', roles: [ROLES.ADMIN, ROLES.ACCOUNTS] },
  issues: { label: 'Issues', icon: AlertCircle, path: '/issues', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT, ROLES.HEAD_TEACHER, ROLES.ACCOUNTS] },
  messages: { label: 'Messages', icon: Mail, path: '/messages', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT, ROLES.HEAD_TEACHER, ROLES.ACCOUNTS] },
  reports: { label: 'Reports', icon: BarChart3, path: '/reports', roles: [ROLES.ADMIN, ROLES.HEAD_TEACHER] },
  settings: { label: 'Settings', icon: Settings, path: '/settings', roles: [ROLES.ADMIN] },
  children: { label: 'My Children', icon: Users, path: '/children', roles: [ROLES.PARENT, ROLES.ADMIN] }
}

/**
 * Get menu items filtered by user role
 * Only returns items accessible to the user's role
 */
function getMenuItemsForRole(role) {
  return Object.values(allMenuItems).filter(item => 
    item.roles.includes(role) || role === ROLES.ADMIN // Admin can see all items
  )
}

function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { success } = useToast()
  const navigate = useNavigate()
  const userRole = user?.role || ROLES.ADMIN
  const [teacherClassroomId, setTeacherClassroomId] = useState(null)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen && onClose) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.classList.remove('modal-open')
    }
  }, [isOpen, onClose])

  // Fetch teacher's classroom on component mount
  useEffect(() => {
    if (userRole === ROLES.TEACHER) {
      const fetchTeacherClassroom = async () => {
        try {
          const classrooms = await teacherApi.getMyClassrooms()
          const classroomList = classrooms.data || classrooms || []
          if (classroomList.length === 1) {
            setTeacherClassroomId(classroomList[0]._id)
          }
        } catch (err) {
          console.error('Failed to fetch teacher classroom:', err)
        }
      }
      fetchTeacherClassroom()
    }
  }, [userRole])

  const handleLogout = async () => {
    try {
      await logout()
      success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      navigate('/login')
    }
  }

  // Get menu items based on user role
  // Only show items that the user's role has access to
  const menuItems = getMenuItemsForRole(userRole)

  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  // Helper function to get the correct path for menu items
  const getMenuItemPath = (item) => {
    if (userRole === ROLES.TEACHER && item.label === 'Classrooms' && teacherClassroomId) {
      return `/classrooms/${teacherClassroomId}`
    }
    return item.path
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[85vw] max-w-[320px] md:w-72 border-r border-slate-200 bg-white text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        h-[100dvh] md:h-auto overflow-y-auto overscroll-contain
      `}>
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-full w-full items-center justify-center rounded-2xl">
                  <img src="/logo.png" alt="Esync Logo" className="h-full w-full object-contain" />
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="md:hidden rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Navigation</p>
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const itemPath = getMenuItemPath(item)
              const isActive = location.pathname === itemPath || (itemPath !== '/' && location.pathname.startsWith(item.path))
              return (
                <li key={item.label}>
                  <Link
                    to={itemPath}
                    onClick={handleLinkClick}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all ${
                      isActive
                        ? 'bg-[linear-gradient(135deg,rgba(2,167,191,0.2),rgba(94,144,84,0.14))] text-slate-900 shadow-[0_12px_22px_rgba(2,167,191,0.14)]'
                        : 'text-slate-600 hover:bg-cyan-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                      isActive ? 'bg-white text-primary-blue' : 'bg-slate-100 text-slate-500 group-hover:bg-cyan-100 group-hover:text-primary-blue'
                    }`}>
                      <Icon size={18} className="flex-shrink-0" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200 p-4 sm:p-5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
