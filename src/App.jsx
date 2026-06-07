import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { SettingsProvider } from './contexts/SettingsContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import './index-responsive.css'
import { PermissionGate } from './components/PermissionGate'
import { ROLES, PERMISSIONS } from './config/rbac'

const RoleBasedDashboard = lazy(() => import('./components/RoleBasedDashboard'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const RoleManagement = lazy(() => import('./pages/RoleManagement'))
const Students = lazy(() => import('./pages/Students'))
const Teachers = lazy(() => import('./pages/Teachers'))
const Staffs = lazy(() => import('./pages/Staffs'))
const Classrooms = lazy(() => import('./pages/Classrooms'))
const ViewClassroom = lazy(() => import('./pages/ViewClassroom'))
const Subjects = lazy(() => import('./pages/Subjects'))
const Timetable = lazy(() => import('./pages/Timetable'))
const Children = lazy(() => import('./pages/Children'))
const ChildDetail = lazy(() => import('./pages/ChildDetail'))
const Parents = lazy(() => import('./pages/Parents'))
const Attendance = lazy(() => import('./pages/Attendance'))
const Fees = lazy(() => import('./pages/Fees'))
const Payments = lazy(() => import('./pages/Payments'))
const FinancialReports = lazy(() => import('./pages/FinancialReports'))
const Expenses = lazy(() => import('./pages/Expenses'))
const Issues = lazy(() => import('./pages/Issues'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const Settings = lazy(() => import('./pages/Settings'))
const UsersManagement = lazy(() => import('./pages/UsersManagement'))
const Messages = lazy(() => import('./pages/Messages'))
const Reports = lazy(() => import('./pages/Reports'))
const ReportCards = lazy(() => import('./pages/ReportCards'))
const Exams = lazy(() => import('./pages/Exams'))
const Results = lazy(() => import('./pages/Results'))
const ResultsApproval = lazy(() => import('./pages/ResultsApproval'))

function RouteFallback() {
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-muted">Loading page...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <SettingsProvider>
            <Router>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
          
                  {/* Dashboard - Routes to role-based dashboards */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <RoleBasedDashboard />
                      </ProtectedRoute>
                    }
                  />

              {/* Dashboard fallback for direct access */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Panel - ADMIN ONLY */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN} route="/admin">
                    <Layout>
                      <AdminPanel />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Role Management - ADMIN ONLY */}
              <Route
                path="/roles"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN} route="/roles">
                    <Layout>
                      <PermissionGate permission={PERMISSIONS.ROLE_ASSIGN}>
                        <RoleManagement />
                      </PermissionGate>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Users Management - ADMIN ONLY */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN} route="/users">
                    <Layout>
                      <PermissionGate permission={PERMISSIONS.USER_CREATE}>
                        <UsersManagement />
                      </PermissionGate>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Students - Accessible to multiple roles */}
              <Route
                path="/students"
                element={
                  <ProtectedRoute route="/students">
                    <Layout>
                      <Students />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Parents - ADMIN ONLY */}
              <Route
                path="/parents"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN} route="/parents">
                    <Layout>
                      <Parents />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Teachers - HEAD TEACHER & ADMIN */}
              <Route
                path="/teachers"
                element={
                  <ProtectedRoute requiredRole={[ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/teachers">
                    <Layout>
                      <Teachers />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Staffs - HEAD TEACHER & ADMIN */}
              <Route
                path="/staffs"
                element={
                  <ProtectedRoute requiredRole={[ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/staffs">
                    <Layout>
                      <Staffs />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Classrooms - TEACHER, HEAD_TEACHER & ADMIN */}
              <Route
                path="/classrooms"
                element={
                  <ProtectedRoute requiredRole={[ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/classrooms">
                    <Layout>
                      <Classrooms />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* View Classroom - TEACHER, HEAD_TEACHER & ADMIN */}
              <Route
                path="/classrooms/:id"
                element={
                  <ProtectedRoute requiredRole={[ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN]}>
                    <Layout>
                      <ViewClassroom />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Subjects - TEACHER, HEAD_TEACHER & ADMIN */}
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute requiredRole={[ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/subjects">
                    <Layout>
                      <Subjects />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Timetable - All authenticated users */}
              <Route
                path="/timetable"
                element={
                  <ProtectedRoute route="/timetable">
                    <Layout>
                      <Timetable />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Children - PARENT & ADMIN ONLY */}
              <Route
                path="/children"
                element={
                  <ProtectedRoute requiredRole={[ROLES.PARENT, ROLES.ADMIN]} route="/children">
                    <Layout>
                      <Children />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Child Detail - PARENT & ADMIN ONLY (self-access enforced on backend) */}
              <Route
                path="/children/:id"
                element={
                  <ProtectedRoute requiredRole={[ROLES.PARENT, ROLES.ADMIN]}>
                    <Layout>
                      <ChildDetail />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Attendance - TEACHER, HEAD_TEACHER & ADMIN */}
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute requiredRole={[ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/attendance">
                    <Layout>
                      <Attendance />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Exams - TEACHER, HEAD_TEACHER & ADMIN */}
              <Route
                path="/exams"
                element={
                  <ProtectedRoute requiredRole={[ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/exams">
                    <Layout>
                      <Exams />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Results - TEACHER, HEAD_TEACHER & ADMIN */}
              <Route
                path="/results"
                element={
                  <ProtectedRoute requiredRole={[ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/results">
                    <Layout>
                      <Results />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Results Approval - HEAD_TEACHER & ADMIN */}
              <Route
                path="/results-approval"
                element={
                  <ProtectedRoute requiredRole={[ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/results-approval">
                    <Layout>
                      <ResultsApproval />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Fees - ACCOUNTS, HEAD_TEACHER & ADMIN */}
              <Route
                path="/fees"
                element={
                  <ProtectedRoute requiredRole={[ROLES.ACCOUNTS, ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/fees">
                    <Layout>
                      <Fees />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Payments - ACCOUNTS, HEAD_TEACHER & ADMIN */}
              <Route
                path="/payments"
                element={
                  <ProtectedRoute requiredRole={[ROLES.ACCOUNTS, ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/payments">
                    <Layout>
                      <Payments />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Financial Reports - ACCOUNTS, HEAD_TEACHER & ADMIN */}
              <Route
                path="/financial-reports"
                element={
                  <ProtectedRoute requiredRole={[ROLES.ACCOUNTS, ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/financial-reports">
                    <Layout>
                      <FinancialReports />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Expenses - ACCOUNTS & ADMIN */}
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute requiredRole={[ROLES.ACCOUNTS, ROLES.ADMIN]} route="/expenses">
                    <Layout>
                      <Expenses />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Issues - All authenticated users can view/create */}
              <Route
                path="/issues"
                element={
                  <ProtectedRoute route="/issues">
                    <Layout>
                      <Issues />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Search Results - All authenticated users */}
              <Route
                path="/search-results/:id"
                element={
                  <ProtectedRoute route="/search-results">
                    <Layout>
                      <SearchResults />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Messages - All authenticated users */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute route="/messages">
                    <Layout>
                      <Messages />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Reports - HEAD_TEACHER & ADMIN */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute requiredRole={[ROLES.HEAD_TEACHER, ROLES.ADMIN]} route="/reports">
                    <Layout>
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Report Cards - HEAD_TEACHER, TEACHER, ADMIN & STUDENT */}
              <Route
                path="/report-cards"
                element={
                  <ProtectedRoute requiredRole={[ROLES.HEAD_TEACHER, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]} route="/report-cards">
                    <Layout>
                      <ReportCards />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Settings - ADMIN ONLY */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN} route="/settings">
                    <Layout>
                      <PermissionGate permission={PERMISSIONS.SYSTEM_SETTINGS_UPDATE}>
                        <Settings />
                      </PermissionGate>
                    </Layout>
                  </ProtectedRoute>
                }
              />

                  {/* Catch-all - redirect to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </SettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
