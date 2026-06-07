/**
 * Comprehensive Role-Based Permissions Configuration
 * Synced with backend ROLES constant
 */

export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
  HEAD_TEACHER: 'head-teacher',
  ACCOUNTS: 'accounts',
  PARENT: 'parent'
};

export const PERMISSION_CATEGORIES = {
  DASHBOARD: 'dashboard',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  USERS: 'users',
  STAFF: 'staff',
  CLASSROOMS: 'classrooms',
  SUBJECTS: 'subjects',
  TIMETABLE: 'timetable',
  EXAMS: 'exams',
  RESULTS: 'results',
  ATTENDANCE: 'attendance',
  FEES: 'fees',
  PAYMENTS: 'payments',
  EXPENSES: 'expenses',
  ISSUES: 'issues',
  ROLES: 'roles',
  SETTINGS: 'settings',
  REPORTS: 'reports'
};

export const PERMISSIONS = {
  // Dashboard Permissions
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_ANALYTICS: 'dashboard:analytics',

  // Student Permissions
  STUDENTS_VIEW: 'students:view',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_EDIT: 'students:edit',
  STUDENTS_DELETE: 'students:delete',
  STUDENTS_VIEW_PROFILE: 'students:view_profile',

  // Teacher Permissions
  TEACHERS_VIEW: 'teachers:view',
  TEACHERS_CREATE: 'teachers:create',
  TEACHERS_EDIT: 'teachers:edit',
  TEACHERS_DELETE: 'teachers:delete',

  // User Management Permissions
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',

  // Staff Permissions
  STAFF_VIEW: 'staff:view',
  STAFF_CREATE: 'staff:create',
  STAFF_EDIT: 'staff:edit',
  STAFF_DELETE: 'staff:delete',

  // Classroom Permissions
  CLASSROOMS_VIEW: 'classrooms:view',
  CLASSROOMS_CREATE: 'classrooms:create',
  CLASSROOMS_EDIT: 'classrooms:edit',
  CLASSROOMS_DELETE: 'classrooms:delete',

  // Subject Permissions
  SUBJECTS_VIEW: 'subjects:view',
  SUBJECTS_CREATE: 'subjects:create',
  SUBJECTS_EDIT: 'subjects:edit',
  SUBJECTS_DELETE: 'subjects:delete',

  // Timetable Permissions
  TIMETABLE_VIEW: 'timetable:view',
  TIMETABLE_CREATE: 'timetable:create',
  TIMETABLE_EDIT: 'timetable:edit',
  TIMETABLE_DELETE: 'timetable:delete',

  // Exam Permissions
  EXAMS_VIEW: 'exams:view',
  EXAMS_CREATE: 'exams:create',
  EXAMS_EDIT: 'exams:edit',
  EXAMS_DELETE: 'exams:delete',

  // Results Permissions
  RESULTS_VIEW: 'results:view',
  RESULTS_CREATE: 'results:create',
  RESULTS_EDIT: 'results:edit',
  RESULTS_DELETE: 'results:delete',

  // Attendance Permissions
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_CREATE: 'attendance:create',
  ATTENDANCE_EDIT: 'attendance:edit',
  ATTENDANCE_DELETE: 'attendance:delete',

  // Fee Permissions
  FEES_VIEW: 'fees:view',
  FEES_CREATE: 'fees:create',
  FEES_EDIT: 'fees:edit',
  FEES_DELETE: 'fees:delete',

  // Payment Permissions
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_EDIT: 'payments:edit',
  PAYMENTS_DELETE: 'payments:delete',

  // Expense Permissions
  EXPENSES_VIEW: 'expenses:view',
  EXPENSES_CREATE: 'expenses:create',
  EXPENSES_EDIT: 'expenses:edit',
  EXPENSES_DELETE: 'expenses:delete',

  // Issue Permissions
  ISSUES_VIEW: 'issues:view',
  ISSUES_CREATE: 'issues:create',
  ISSUES_EDIT: 'issues:edit',
  ISSUES_DELETE: 'issues:delete',

  // Role Permissions
  ROLES_VIEW: 'roles:view',
  ROLES_CREATE: 'roles:create',
  ROLES_EDIT: 'roles:edit',
  ROLES_DELETE: 'roles:delete',

  // Settings Permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  // Reports Permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_DOWNLOAD: 'reports:download'
};

/**
 * Default role permissions mapping
 * Each role gets predefined permissions
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin has all permissions

  [ROLES.HEAD_TEACHER]: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_ANALYTICS,

    // Students
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_VIEW_PROFILE,

    // Teachers
    PERMISSIONS.TEACHERS_VIEW,

    // Classrooms
    PERMISSIONS.CLASSROOMS_VIEW,

    // Subjects
    PERMISSIONS.SUBJECTS_VIEW,

    // Timetable
    PERMISSIONS.TIMETABLE_VIEW,

    // Exams
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.EXAMS_CREATE,
    PERMISSIONS.EXAMS_EDIT,

    // Results
    PERMISSIONS.RESULTS_VIEW,
    PERMISSIONS.RESULTS_CREATE,
    PERMISSIONS.RESULTS_EDIT,

    // Attendance
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_CREATE,

    // Fees
    PERMISSIONS.FEES_VIEW,

    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_DOWNLOAD
  ],

  [ROLES.TEACHER]: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,

    // Students
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_VIEW_PROFILE,

    // Timetable
    PERMISSIONS.TIMETABLE_VIEW,

    // Exams
    PERMISSIONS.EXAMS_VIEW,

    // Results
    PERMISSIONS.RESULTS_VIEW,
    PERMISSIONS.RESULTS_CREATE,
    PERMISSIONS.RESULTS_EDIT,

    // Attendance
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_EDIT,

    // Reports
    PERMISSIONS.REPORTS_VIEW
  ],

  [ROLES.ACCOUNTS]: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_ANALYTICS,

    // Fees
    PERMISSIONS.FEES_VIEW,
    PERMISSIONS.FEES_CREATE,
    PERMISSIONS.FEES_EDIT,

    // Payments
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.PAYMENTS_EDIT,

    // Expenses
    PERMISSIONS.EXPENSES_VIEW,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_EDIT,

    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_DOWNLOAD
  ],

  [ROLES.STUDENT]: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,

    // Students (view own profile)
    PERMISSIONS.STUDENTS_VIEW_PROFILE,

    // Results
    PERMISSIONS.RESULTS_VIEW,

    // Attendance
    PERMISSIONS.ATTENDANCE_VIEW,

    // Fees
    PERMISSIONS.FEES_VIEW,

    // Payments
    PERMISSIONS.PAYMENTS_VIEW
  ],

  [ROLES.PARENT]: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,

    // Students (view children)
    PERMISSIONS.STUDENTS_VIEW_PROFILE,

    // Results (view children's results)
    PERMISSIONS.RESULTS_VIEW,

    // Attendance (view children's attendance)
    PERMISSIONS.ATTENDANCE_VIEW,

    // Fees (view and pay children's fees)
    PERMISSIONS.FEES_VIEW,
    PERMISSIONS.PAYMENTS_VIEW
  ]
};

/**
 * Permission descriptions for UI display
 */
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.DASHBOARD_VIEW]: 'View dashboard',
  [PERMISSIONS.DASHBOARD_ANALYTICS]: 'View analytics and charts',

  [PERMISSIONS.STUDENTS_VIEW]: 'View all students',
  [PERMISSIONS.STUDENTS_CREATE]: 'Create new students',
  [PERMISSIONS.STUDENTS_EDIT]: 'Edit student information',
  [PERMISSIONS.STUDENTS_DELETE]: 'Delete students',
  [PERMISSIONS.STUDENTS_VIEW_PROFILE]: 'View student profiles',

  [PERMISSIONS.TEACHERS_VIEW]: 'View all teachers',
  [PERMISSIONS.TEACHERS_CREATE]: 'Create new teachers',
  [PERMISSIONS.TEACHERS_EDIT]: 'Edit teacher information',
  [PERMISSIONS.TEACHERS_DELETE]: 'Delete teachers',

  [PERMISSIONS.STAFF_VIEW]: 'View all staff',
  [PERMISSIONS.STAFF_CREATE]: 'Create new staff',
  [PERMISSIONS.STAFF_EDIT]: 'Edit staff information',
  [PERMISSIONS.STAFF_DELETE]: 'Delete staff',

  [PERMISSIONS.CLASSROOMS_VIEW]: 'View classrooms',
  [PERMISSIONS.CLASSROOMS_CREATE]: 'Create classrooms',
  [PERMISSIONS.CLASSROOMS_EDIT]: 'Edit classrooms',
  [PERMISSIONS.CLASSROOMS_DELETE]: 'Delete classrooms',

  [PERMISSIONS.SUBJECTS_VIEW]: 'View subjects',
  [PERMISSIONS.SUBJECTS_CREATE]: 'Create subjects',
  [PERMISSIONS.SUBJECTS_EDIT]: 'Edit subjects',
  [PERMISSIONS.SUBJECTS_DELETE]: 'Delete subjects',

  [PERMISSIONS.TIMETABLE_VIEW]: 'View timetable',
  [PERMISSIONS.TIMETABLE_CREATE]: 'Create timetable entries',
  [PERMISSIONS.TIMETABLE_EDIT]: 'Edit timetable',
  [PERMISSIONS.TIMETABLE_DELETE]: 'Delete timetable entries',

  [PERMISSIONS.EXAMS_VIEW]: 'View exams',
  [PERMISSIONS.EXAMS_CREATE]: 'Create exams',
  [PERMISSIONS.EXAMS_EDIT]: 'Edit exams',
  [PERMISSIONS.EXAMS_DELETE]: 'Delete exams',

  [PERMISSIONS.RESULTS_VIEW]: 'View exam results',
  [PERMISSIONS.RESULTS_CREATE]: 'Create results',
  [PERMISSIONS.RESULTS_EDIT]: 'Edit results',
  [PERMISSIONS.RESULTS_DELETE]: 'Delete results',

  [PERMISSIONS.ATTENDANCE_VIEW]: 'View attendance',
  [PERMISSIONS.ATTENDANCE_CREATE]: 'Record attendance',
  [PERMISSIONS.ATTENDANCE_EDIT]: 'Edit attendance',
  [PERMISSIONS.ATTENDANCE_DELETE]: 'Delete attendance records',

  [PERMISSIONS.FEES_VIEW]: 'View fees',
  [PERMISSIONS.FEES_CREATE]: 'Create fee structures',
  [PERMISSIONS.FEES_EDIT]: 'Edit fees',
  [PERMISSIONS.FEES_DELETE]: 'Delete fees',

  [PERMISSIONS.PAYMENTS_VIEW]: 'View payments',
  [PERMISSIONS.PAYMENTS_CREATE]: 'Record payments',
  [PERMISSIONS.PAYMENTS_EDIT]: 'Edit payments',
  [PERMISSIONS.PAYMENTS_DELETE]: 'Delete payments',

  [PERMISSIONS.EXPENSES_VIEW]: 'View expenses',
  [PERMISSIONS.EXPENSES_CREATE]: 'Create expenses',
  [PERMISSIONS.EXPENSES_EDIT]: 'Edit expenses',
  [PERMISSIONS.EXPENSES_DELETE]: 'Delete expenses',

  [PERMISSIONS.ISSUES_VIEW]: 'View issues',
  [PERMISSIONS.ISSUES_CREATE]: 'Create issues',
  [PERMISSIONS.ISSUES_EDIT]: 'Edit issues',
  [PERMISSIONS.ISSUES_DELETE]: 'Delete issues',

  [PERMISSIONS.ROLES_VIEW]: 'View roles',
  [PERMISSIONS.ROLES_CREATE]: 'Create roles',
  [PERMISSIONS.ROLES_EDIT]: 'Edit roles',
  [PERMISSIONS.ROLES_DELETE]: 'Delete roles',

  [PERMISSIONS.SETTINGS_VIEW]: 'View settings',
  [PERMISSIONS.SETTINGS_EDIT]: 'Edit settings',

  [PERMISSIONS.REPORTS_VIEW]: 'View reports',
  [PERMISSIONS.REPORTS_GENERATE]: 'Generate reports',
  [PERMISSIONS.REPORTS_DOWNLOAD]: 'Download reports'
};
