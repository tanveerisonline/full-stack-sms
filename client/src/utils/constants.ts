export const GRADES = [
  'Grade 9',
  'Grade 10', 
  'Grade 11',
  'Grade 12'
];

export const STUDENT_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' }
];

export const ATTENDANCE_STATUS = [
  { value: 'present', label: 'Present', color: 'text-green-600' },
  { value: 'absent', label: 'Absent', color: 'text-red-600' },
  { value: 'late', label: 'Late', color: 'text-yellow-600' }
];

export const TRANSACTION_TYPES = [
  { value: 'tuition', label: 'Tuition Fee' },
  { value: 'library', label: 'Library Fee' },
  { value: 'transport', label: 'Transport Fee' },
  { value: 'hostel', label: 'Hostel Fee' },
  { value: 'exam', label: 'Exam Fee' },
  { value: 'other', label: 'Other' }
];

export const TRANSACTION_STATUS = [
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
];

export const ANNOUNCEMENT_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'academic', label: 'Academic' },
  { value: 'event', label: 'Event' }
];

export const TARGET_AUDIENCE = [
  { value: 'all', label: 'All' },
  { value: 'students', label: 'Students' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'parents', label: 'Parents' }
];

export const EXAM_TYPES = [
  { value: 'midterm', label: 'Mid-term' },
  { value: 'final', label: 'Final' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' }
];

export const SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography', 
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education',
  'French',
  'Spanish',
  'Economics',
  'Philosophy'
];

export const BOOK_CATEGORIES = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education'
];

export const NAVIGATION_ITEMS = [
  {
    id: 'academic-management',
    label: 'Academic Management',
    icon: 'BookOpen',
    hasSubmenu: true,
    submenu: [
      { id: 'curriculum', label: 'Curriculum & Courses', icon: 'List', path: '/academic/curriculum' },
      { id: 'scheduling', label: 'Class Scheduling', icon: 'Calendar', path: '/academic/scheduling' },
      { id: 'assignments', label: 'Assignment Hub', icon: 'ClipboardList', path: '/academic/assignments' }
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance System',
    icon: 'CheckCircle',
    path: '/attendance'
  },
  {
    id: 'communication',
    label: 'Communication Hub',
    icon: 'MessageSquare',
    path: '/communication'
  },
  {
    id: 'examinations',
    label: 'Examination System',
    icon: 'FileText',
    path: '/examinations'
  },
  {
    id: 'dashboard',
    label: 'Executive Dashboard',
    icon: 'PieChart',
    path: '/dashboard'
  },
  {
    id: 'facilities',
    label: 'Facilities Management',
    icon: 'Building',
    path: '/facilities'
  },
  {
    id: 'financial',
    label: 'Financial Management',
    icon: 'DollarSign',
    path: '/financial'
  },
  {
    id: 'grading',
    label: 'Grading & Assessment',
    icon: 'Trophy',
    path: '/grading'
  },
  {
    id: 'hr',
    label: 'HR & Teacher Management',
    icon: 'Users',
    hasSubmenu: true,
    submenu: [
      { id: 'teacher-registration', label: 'Teacher Registration', icon: 'UserPlus', path: '/hr' },
      { id: 'teacher-profiles', label: 'Teacher Profiles', icon: 'UserCheck', path: '/hr/profiles' },
      { id: 'payroll', label: 'Payroll Management', icon: 'CreditCard', path: '/hr/payroll' }
    ]
  },
  {
    id: 'library',
    label: 'Library System',
    icon: 'Library',
    path: '/library'
  },
  {
    id: 'student-management',
    label: 'Student Management',
    icon: 'GraduationCap',
    hasSubmenu: true,
    submenu: [
      { id: 'student-registration', label: 'Registration & Enrollment', icon: 'UserPlus', path: '/students' },
      { id: 'student-profiles', label: 'Student Profiles', icon: 'User', path: '/students/profiles' },
      { id: 'id-cards', label: 'ID Card System', icon: 'CreditCard', path: '/students/id-cards' }
    ]
  },
  {
    id: 'transportation',
    label: 'Transportation',
    icon: 'Truck',
    path: '/transportation'
  }
];
