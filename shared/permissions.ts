// Comprehensive permission system for school management
export const PERMISSIONS = {
  // User Management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_APPROVE: 'user:approve',
  USER_DEACTIVATE: 'user:deactivate',

  // Student Management
  STUDENT_VIEW: 'student:view',
  STUDENT_CREATE: 'student:create',
  STUDENT_UPDATE: 'student:update',
  STUDENT_DELETE: 'student:delete',
  STUDENT_PROFILE: 'student:profile',
  STUDENT_ID_CARDS: 'student:id_cards',

  // Teacher Management
  TEACHER_VIEW: 'teacher:view',
  TEACHER_CREATE: 'teacher:create',
  TEACHER_UPDATE: 'teacher:update',
  TEACHER_DELETE: 'teacher:delete',
  TEACHER_PROFILE: 'teacher:profile',
  TEACHER_ASSIGNMENTS: 'teacher:assignments',

  // Academic Management
  ACADEMIC_VIEW: 'academic:view',
  ACADEMIC_CURRICULUM: 'academic:curriculum',
  ACADEMIC_CLASSES: 'academic:classes',
  ACADEMIC_SCHEDULING: 'academic:scheduling',
  ACADEMIC_ASSIGNMENTS: 'academic:assignments',
  ACADEMIC_TIMETABLE: 'academic:timetable',

  // Attendance Management
  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_MARK: 'attendance:mark',
  ATTENDANCE_BULK: 'attendance:bulk',
  ATTENDANCE_REPORTS: 'attendance:reports',

  // Grading System
  GRADING_VIEW: 'grading:view',
  GRADING_CREATE: 'grading:create',
  GRADING_UPDATE: 'grading:update',
  GRADING_REPORTS: 'grading:reports',

  // Financial Management
  FINANCIAL_VIEW: 'financial:view',
  FINANCIAL_CREATE: 'financial:create',
  FINANCIAL_UPDATE: 'financial:update',
  FINANCIAL_REPORTS: 'financial:reports',
  FINANCIAL_FEES: 'financial:fees',

  // Library Management
  LIBRARY_VIEW: 'library:view',
  LIBRARY_BOOKS: 'library:books',
  LIBRARY_ISSUE: 'library:issue',
  LIBRARY_RETURN: 'library:return',
  LIBRARY_REPORTS: 'library:reports',

  // Communication
  COMMUNICATION_VIEW: 'communication:view',
  COMMUNICATION_ANNOUNCE: 'communication:announce',
  COMMUNICATION_NOTIFICATIONS: 'communication:notifications',

  // HR Management
  HR_VIEW: 'hr:view',
  HR_EMPLOYEES: 'hr:employees',
  HR_PAYROLL: 'hr:payroll',
  HR_REPORTS: 'hr:reports',

  // Facilities Management
  FACILITIES_VIEW: 'facilities:view',
  FACILITIES_MANAGE: 'facilities:manage',
  FACILITIES_BOOKING: 'facilities:booking',

  // Transportation
  TRANSPORT_VIEW: 'transport:view',
  TRANSPORT_MANAGE: 'transport:manage',
  TRANSPORT_ROUTES: 'transport:routes',

  // Hostel Management
  HOSTEL_VIEW: 'hostel:view',
  HOSTEL_MANAGE: 'hostel:manage',
  HOSTEL_ROOMS: 'hostel:rooms',

  // Examinations
  EXAM_VIEW: 'exam:view',
  EXAM_CREATE: 'exam:create',
  EXAM_MANAGE: 'exam:manage',
  EXAM_RESULTS: 'exam:results',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_EXPORT: 'reports:export',

  // System Administration
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_AUDIT: 'system:audit',
  SYSTEM_USERS: 'system:users',

  // Role Management (Super Admin only)
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_ASSIGN: 'role:assign',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Permission categories for UI organization
export const PERMISSION_CATEGORIES = {
  'User Management': [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_APPROVE,
    PERMISSIONS.USER_DEACTIVATE,
  ],
  'Student Management': [
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.STUDENT_CREATE,
    PERMISSIONS.STUDENT_UPDATE,
    PERMISSIONS.STUDENT_DELETE,
    PERMISSIONS.STUDENT_PROFILE,
    PERMISSIONS.STUDENT_ID_CARDS,
  ],
  'Teacher Management': [
    PERMISSIONS.TEACHER_VIEW,
    PERMISSIONS.TEACHER_CREATE,
    PERMISSIONS.TEACHER_UPDATE,
    PERMISSIONS.TEACHER_DELETE,
    PERMISSIONS.TEACHER_PROFILE,
    PERMISSIONS.TEACHER_ASSIGNMENTS,
  ],
  'Academic Management': [
    PERMISSIONS.ACADEMIC_VIEW,
    PERMISSIONS.ACADEMIC_CURRICULUM,
    PERMISSIONS.ACADEMIC_CLASSES,
    PERMISSIONS.ACADEMIC_SCHEDULING,
    PERMISSIONS.ACADEMIC_ASSIGNMENTS,
    PERMISSIONS.ACADEMIC_TIMETABLE,
  ],
  'Attendance': [
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.ATTENDANCE_BULK,
    PERMISSIONS.ATTENDANCE_REPORTS,
  ],
  'Grading': [
    PERMISSIONS.GRADING_VIEW,
    PERMISSIONS.GRADING_CREATE,
    PERMISSIONS.GRADING_UPDATE,
    PERMISSIONS.GRADING_REPORTS,
  ],
  'Financial Management': [
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_CREATE,
    PERMISSIONS.FINANCIAL_UPDATE,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.FINANCIAL_FEES,
  ],
  'Library': [
    PERMISSIONS.LIBRARY_VIEW,
    PERMISSIONS.LIBRARY_BOOKS,
    PERMISSIONS.LIBRARY_ISSUE,
    PERMISSIONS.LIBRARY_RETURN,
    PERMISSIONS.LIBRARY_REPORTS,
  ],
  'Communication': [
    PERMISSIONS.COMMUNICATION_VIEW,
    PERMISSIONS.COMMUNICATION_ANNOUNCE,
    PERMISSIONS.COMMUNICATION_NOTIFICATIONS,
  ],
  'HR Management': [
    PERMISSIONS.HR_VIEW,
    PERMISSIONS.HR_EMPLOYEES,
    PERMISSIONS.HR_PAYROLL,
    PERMISSIONS.HR_REPORTS,
  ],
  'Other Systems': [
    PERMISSIONS.FACILITIES_VIEW,
    PERMISSIONS.FACILITIES_MANAGE,
    PERMISSIONS.FACILITIES_BOOKING,
    PERMISSIONS.TRANSPORT_VIEW,
    PERMISSIONS.TRANSPORT_MANAGE,
    PERMISSIONS.TRANSPORT_ROUTES,
    PERMISSIONS.HOSTEL_VIEW,
    PERMISSIONS.HOSTEL_MANAGE,
    PERMISSIONS.HOSTEL_ROOMS,
    PERMISSIONS.EXAM_VIEW,
    PERMISSIONS.EXAM_CREATE,
    PERMISSIONS.EXAM_MANAGE,
    PERMISSIONS.EXAM_RESULTS,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_EXPORT,
  ],
  'System Administration': [
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.SYSTEM_BACKUP,
    PERMISSIONS.SYSTEM_AUDIT,
    PERMISSIONS.SYSTEM_USERS,
  ],
  'Role Management': [
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.ROLE_ASSIGN,
  ],
} as const;

// Predefined role templates
export const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: Object.values(PERMISSIONS),
  },
  ADMIN: {
    name: 'Administrator',
    description: 'School administration with most permissions except system management',
    permissions: [
      ...PERMISSION_CATEGORIES['User Management'],
      ...PERMISSION_CATEGORIES['Student Management'],
      ...PERMISSION_CATEGORIES['Teacher Management'],
      ...PERMISSION_CATEGORIES['Academic Management'],
      ...PERMISSION_CATEGORIES['Attendance'],
      ...PERMISSION_CATEGORIES['Grading'],
      ...PERMISSION_CATEGORIES['Financial Management'],
      ...PERMISSION_CATEGORIES['Library'],
      ...PERMISSION_CATEGORIES['Communication'],
      ...PERMISSION_CATEGORIES['HR Management'],
      ...PERMISSION_CATEGORIES['Other Systems'],
    ],
  },
  TEACHER: {
    name: 'Teacher',
    description: 'Teaching staff with student and academic management',
    permissions: [
      PERMISSIONS.STUDENT_VIEW,
      PERMISSIONS.STUDENT_PROFILE,
      PERMISSIONS.TEACHER_VIEW,
      PERMISSIONS.TEACHER_PROFILE,
      PERMISSIONS.TEACHER_ASSIGNMENTS,
      PERMISSIONS.ACADEMIC_VIEW,
      PERMISSIONS.ACADEMIC_CLASSES,
      PERMISSIONS.ACADEMIC_ASSIGNMENTS,
      PERMISSIONS.ACADEMIC_TIMETABLE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.ATTENDANCE_MARK,
      PERMISSIONS.ATTENDANCE_REPORTS,
      PERMISSIONS.GRADING_VIEW,
      PERMISSIONS.GRADING_CREATE,
      PERMISSIONS.GRADING_UPDATE,
      PERMISSIONS.GRADING_REPORTS,
      PERMISSIONS.LIBRARY_VIEW,
      PERMISSIONS.LIBRARY_ISSUE,
      PERMISSIONS.LIBRARY_RETURN,
      PERMISSIONS.COMMUNICATION_VIEW,
      PERMISSIONS.EXAM_VIEW,
      PERMISSIONS.EXAM_RESULTS,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
  STUDENT: {
    name: 'Student',
    description: 'Student access with limited permissions',
    permissions: [
      PERMISSIONS.STUDENT_VIEW,
      PERMISSIONS.STUDENT_PROFILE,
      PERMISSIONS.ACADEMIC_VIEW,
      PERMISSIONS.ACADEMIC_TIMETABLE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.GRADING_VIEW,
      PERMISSIONS.LIBRARY_VIEW,
      PERMISSIONS.COMMUNICATION_VIEW,
      PERMISSIONS.EXAM_VIEW,
      PERMISSIONS.EXAM_RESULTS,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
  PARENT: {
    name: 'Parent',
    description: 'Parent access to view child information',
    permissions: [
      PERMISSIONS.STUDENT_VIEW,
      PERMISSIONS.ACADEMIC_VIEW,
      PERMISSIONS.ACADEMIC_TIMETABLE,
      PERMISSIONS.ATTENDANCE_VIEW,
      PERMISSIONS.GRADING_VIEW,
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.LIBRARY_VIEW,
      PERMISSIONS.COMMUNICATION_VIEW,
      PERMISSIONS.EXAM_VIEW,
      PERMISSIONS.EXAM_RESULTS,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
} as const;

// Helper functions
export const getAllPermissions = (): Permission[] => {
  return Object.values(PERMISSIONS);
};

export const getPermissionsByCategory = (category: keyof typeof PERMISSION_CATEGORIES): Permission[] => {
  return [...(PERMISSION_CATEGORIES[category] || [])];
};

export const hasPermission = (userPermissions: string[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};