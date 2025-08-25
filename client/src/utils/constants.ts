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
    id: 'dashboard',
    label: 'Executive Dashboard',
    icon: 'fas fa-chart-pie',
    path: '/dashboard'
  },
  {
    id: 'student-management',
    label: 'Student Management',
    icon: 'fas fa-user-graduate',
    hasSubmenu: true,
    submenu: [
      { id: 'student-registration', label: 'Registration & Enrollment', icon: 'fas fa-user-plus', path: '/students' },
      { id: 'student-profiles', label: 'Student Profiles', icon: 'fas fa-address-card', path: '/students/profiles' },
      { id: 'id-cards', label: 'ID Card System', icon: 'fas fa-id-card', path: '/students/id-cards' }
    ]
  },
  {
    id: 'academic-management',
    label: 'Academic Management',
    icon: 'fas fa-book',
    hasSubmenu: true,
    submenu: [
      { id: 'curriculum', label: 'Curriculum & Courses', icon: 'fas fa-list', path: '/academic/curriculum' },
      { id: 'scheduling', label: 'Class Scheduling', icon: 'fas fa-calendar-alt', path: '/academic/scheduling' },
      { id: 'assignments', label: 'Assignment Hub', icon: 'fas fa-clipboard-list', path: '/academic/assignments' }
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance System',
    icon: 'fas fa-check-circle',
    path: '/attendance'
  },
  {
    id: 'grading',
    label: 'Grading & Assessment',
    icon: 'fas fa-trophy',
    path: '/grading'
  },
  {
    id: 'communication',
    label: 'Communication Hub',
    icon: 'fas fa-comments',
    path: '/communication'
  },
  {
    id: 'financial',
    label: 'Financial Management',
    icon: 'fas fa-dollar-sign',
    path: '/financial'
  },
  {
    id: 'library',
    label: 'Library System',
    icon: 'fas fa-book-open',
    path: '/library'
  },
  {
    id: 'hr',
    label: 'HR & Teacher Management',
    icon: 'fas fa-users-cog',
    hasSubmenu: true,
    submenu: [
      { id: 'teacher-registration', label: 'Teacher Registration', icon: 'fas fa-user-plus', path: '/hr' },
      { id: 'teacher-profiles', label: 'Teacher Profiles', icon: 'fas fa-address-card', path: '/hr/profiles' },
      { id: 'payroll', label: 'Payroll Management', icon: 'fas fa-money-check-alt', path: '/hr/payroll' }
    ]
  },
  {
    id: 'facilities',
    label: 'Facilities Management',
    icon: 'fas fa-building',
    path: '/facilities'
  },
  {
    id: 'transportation',
    label: 'Transportation',
    icon: 'fas fa-bus',
    path: '/transportation'
  },
  {
    id: 'hostel',
    label: 'Hostel Management',
    icon: 'fas fa-bed',
    path: '/hostel'
  },
  {
    id: 'examinations',
    label: 'Examination System',
    icon: 'fas fa-file-alt',
    path: '/examinations'
  },
  {
    id: 'reports',
    label: 'Reporting & Analytics',
    icon: 'fas fa-chart-bar',
    path: '/reports'
  }
];
