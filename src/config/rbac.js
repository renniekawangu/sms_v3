/**
 * Frontend RBAC Configuration
 * Synced with backend role definitions from roles.permissions.json
 * Provides permission checking for UI components and route guards
 */

export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
  HEAD_TEACHER: 'head-teacher',
  ACCOUNTS: 'accounts',
  PARENT: 'parent'
};

/**
 * Permission descriptions mapped from roles.permissions.json
 * Format: "action:resource:scope"
 * Examples: "user:create", "student:results:view:self"
 */
export const PERMISSIONS = {
  // Admin Permissions
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  ROLE_ASSIGN: 'role:assign',
  SCHOOL_CONFIGURE: 'school:configure',
  CLASS_MANAGE: 'class:manage',
  SUBJECT_MANAGE: 'subject:manage',
  TERM_MANAGE: 'term:manage',
  ACADEMIC_YEAR_MANAGE: 'academic_year:manage',
  REPORT_ACADEMIC_VIEW: 'report:academic:view',
  REPORT_FINANCIAL_VIEW: 'report:financial:view',
  AUDIT_LOG_VIEW: 'audit_log:view',
  SYSTEM_SETTINGS_UPDATE: 'system:settings:update',

  // Head Teacher Permissions
  TEACHER_ATTENDANCE_VIEW: 'teacher:attendance:view',
  TEACHER_ATTENDANCE_MARK: 'teacher:attendance:mark',
  STUDENT_ATTENDANCE_VIEW: 'student:attendance:view',
  STUDENT_RESULTS_VIEW: 'student:results:view',
  STUDENT_RESULTS_APPROVE: 'student:results:approve',
  REPORT_ACADEMIC_GENERATE: 'report:academic:generate',
  ANNOUNCEMENT_CREATE: 'announcement:create',

  // Teacher Permissions
  STUDENT_ATTENDANCE_MARK: 'student:attendance:mark',
  STUDENT_RESULTS_CREATE: 'student:results:create',
  STUDENT_RESULTS_UPDATE: 'student:results:update',
  HOMEWORK_CREATE: 'homework:create',
  HOMEWORK_VIEW: 'homework:view',
  PARENT_MESSAGE: 'parent:message',

  // Accounts Permissions
  FEES_STRUCTURE_CREATE: 'fees:structure:create',
  FEES_STRUCTURE_UPDATE: 'fees:structure:update',
  PAYMENT_RECORD: 'payment:record',
  PAYMENT_VIEW: 'payment:view',
  STUDENT_BALANCE_VIEW: 'student:balance:view',
  REPORT_FINANCIAL_GENERATE: 'report:financial:generate',
  FINANCE_EXPORT: 'finance:export',

  // Parent Permissions (Self-access only)
  STUDENT_RESULTS_VIEW_SELF: 'student:results:view:self',
  STUDENT_ATTENDANCE_VIEW_SELF: 'student:attendance:view:self',
  FEES_BALANCE_VIEW_SELF: 'fees:balance:view:self',
  ANNOUNCEMENT_VIEW: 'announcement:view',
  TEACHER_MESSAGE: 'teacher:message',

  // Student Permissions (Self-access only)
  STUDENT_RESULTS_VIEW_SELF: 'student:results:view:self',
  STUDENT_ATTENDANCE_VIEW_SELF: 'student:attendance:view:self'
};

/**
 * Role-based permissions matrix
 * Maps each role to its list of available permissions
 * Loaded from roles.permissions.json in backend
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_ASSIGN,
    PERMISSIONS.SCHOOL_CONFIGURE,
    PERMISSIONS.CLASS_MANAGE,
    PERMISSIONS.SUBJECT_MANAGE,
    PERMISSIONS.TERM_MANAGE,
    PERMISSIONS.ACADEMIC_YEAR_MANAGE,
    PERMISSIONS.REPORT_ACADEMIC_VIEW,
    PERMISSIONS.REPORT_FINANCIAL_VIEW,
    PERMISSIONS.AUDIT_LOG_VIEW,
    PERMISSIONS.SYSTEM_SETTINGS_UPDATE
  ],

  [ROLES.HEAD_TEACHER]: [
    PERMISSIONS.TEACHER_ATTENDANCE_VIEW,
    PERMISSIONS.TEACHER_ATTENDANCE_MARK,
    PERMISSIONS.STUDENT_ATTENDANCE_VIEW,
    PERMISSIONS.STUDENT_RESULTS_VIEW,
    PERMISSIONS.STUDENT_RESULTS_APPROVE,
    PERMISSIONS.REPORT_ACADEMIC_GENERATE,
    PERMISSIONS.ANNOUNCEMENT_CREATE
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.STUDENT_ATTENDANCE_MARK,
    PERMISSIONS.STUDENT_RESULTS_CREATE,
    PERMISSIONS.STUDENT_RESULTS_UPDATE,
    PERMISSIONS.HOMEWORK_CREATE,
    PERMISSIONS.HOMEWORK_VIEW,
    PERMISSIONS.PARENT_MESSAGE
  ],

  [ROLES.ACCOUNTS]: [
    PERMISSIONS.FEES_STRUCTURE_CREATE,
    PERMISSIONS.FEES_STRUCTURE_UPDATE,
    PERMISSIONS.PAYMENT_RECORD,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.STUDENT_BALANCE_VIEW,
    PERMISSIONS.REPORT_FINANCIAL_GENERATE,
    PERMISSIONS.FINANCE_EXPORT
  ],

  [ROLES.PARENT]: [
    PERMISSIONS.STUDENT_RESULTS_VIEW_SELF,
    PERMISSIONS.STUDENT_ATTENDANCE_VIEW_SELF,
    PERMISSIONS.FEES_BALANCE_VIEW_SELF,
    PERMISSIONS.ANNOUNCEMENT_VIEW,
    PERMISSIONS.TEACHER_MESSAGE
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.STUDENT_RESULTS_VIEW_SELF,
    PERMISSIONS.STUDENT_ATTENDANCE_VIEW_SELF
  ]
};

/**
 * Route access control matrix
 * Maps routes to roles that can access them
 */
export const ROUTE_ACCESS = {
  // Public routes
  '/login': [],

  // Admin routes
  '/admin': [ROLES.ADMIN],
  '/users': [ROLES.ADMIN],
  '/roles': [ROLES.ADMIN],
  '/settings': [ROLES.ADMIN],

  // Head Teacher routes
  '/teachers': [ROLES.HEAD_TEACHER, ROLES.ADMIN],
  '/staffs': [ROLES.HEAD_TEACHER, ROLES.ADMIN],
  '/reports': [ROLES.HEAD_TEACHER, ROLES.ADMIN],

  // Teacher routes
  '/classrooms': [ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN],
  '/attendance': [ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN],
  '/subjects': [ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN],
  '/timetable': [ROLES.TEACHER, ROLES.HEAD_TEACHER, ROLES.ADMIN, ROLES.STUDENT],

  // Accounts routes
  '/fees': [ROLES.ACCOUNTS, ROLES.ADMIN, ROLES.HEAD_TEACHER],
  '/payments': [ROLES.ACCOUNTS, ROLES.ADMIN, ROLES.HEAD_TEACHER],
  '/expenses': [ROLES.ACCOUNTS, ROLES.ADMIN],
  '/financial-reports': [ROLES.ACCOUNTS, ROLES.ADMIN, ROLES.HEAD_TEACHER],

  // Parent routes
  '/children': [ROLES.PARENT, ROLES.ADMIN],
  '/child-detail': [ROLES.PARENT, ROLES.ADMIN],

  // Universal routes
  '/issues': [ROLES.STUDENT, ROLES.PARENT, ROLES.TEACHER, ROLES.ADMIN],
  '/messages': [ROLES.STUDENT, ROLES.PARENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.HEAD_TEACHER, ROLES.ACCOUNTS]
};

/**
 * Self-access-only permissions
 * These permissions require the user to access their own data only
 */
export const SELF_ACCESS_PERMISSIONS = [
  PERMISSIONS.STUDENT_RESULTS_VIEW_SELF,
  PERMISSIONS.STUDENT_ATTENDANCE_VIEW_SELF,
  PERMISSIONS.FEES_BALANCE_VIEW_SELF
];

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (role === ROLES.ADMIN) return true; // Admin has all permissions
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role can access a route
 * @param {string} role - User role
 * @param {string} route - Route path
 * @returns {boolean}
 */
export function canAccessRoute(role, route) {
  if (role === ROLES.ADMIN) return true; // Admin can access all routes
  const allowedRoles = ROUTE_ACCESS[route];
  return allowedRoles && allowedRoles.includes(role);
}

/**
 * Check if a permission requires self-access only
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function requiresSelfAccessOnly(permission) {
  return SELF_ACCESS_PERMISSIONS.includes(permission);
}

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]}
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get dashboard route for a role
 * Maps roles to their appropriate dashboard/home page
 * @param {string} role - User role
 * @returns {string}
 */
export function getDashboardRoute(role) {
  const routes = {
    [ROLES.ADMIN]: '/admin',
    [ROLES.HEAD_TEACHER]: '/teachers',
    [ROLES.TEACHER]: '/classrooms',
    [ROLES.ACCOUNTS]: '/fees',
    [ROLES.PARENT]: '/children',
    [ROLES.STUDENT]: '/exams'
  };
  return routes[role] || '/';
}

/**
 * Get accessible routes for a role
 * @param {string} role - User role
 * @returns {string[]}
 */
export function getAccessibleRoutes(role) {
  return Object.entries(ROUTE_ACCESS)
    .filter(([, allowedRoles]) => !allowedRoles.length || allowedRoles.includes(role) || role === ROLES.ADMIN)
    .map(([route]) => route);
}
