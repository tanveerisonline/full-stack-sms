export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  grade: string;
  dateOfBirth: string;
  address: string;
  parentName: string;
  parentContact: string;
  rollNumber: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  qualification: string;
  experience: number;
  subjects: string[];
  salary: number;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  grade: string;
  subject: string;
  teacherId: string;
  credits: number;
  duration: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  amount: number;
  type: 'tuition' | 'library' | 'transport' | 'hostel' | 'exam' | 'other';
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
  description: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'academic' | 'event' | 'urgent';
  targetAudience: ('all' | 'students' | 'parents' | 'teachers')[];
  priority: 'low' | 'medium' | 'high';
  publishDate: string;
  expiryDate?: string;
  attachments?: string[];
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
  status: 'available' | 'maintenance' | 'lost';
  createdAt: string;
  updatedAt: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  studentId: string;
  issuedDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue';
  fineAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  name: string;
  courseId: string;
  date: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  type: 'midterm' | 'final' | 'quiz' | 'assignment';
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  examId?: string;
  assignmentId?: string;
  subject: string;
  marks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  comments?: string;
  gradedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
  monthlyRevenue: number;
  pendingFees: number;
  activeClasses: number;
  libraryBooks: number;
  upcomingExams: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    tension?: number;
    fill?: boolean;
  }[];
}

export interface ClassSchedule {
  id: string;
  courseId: string;
  teacherId: string;
  grade: string;
  section: string;
  subject: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  status: 'active' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  teacherId: string;
  grade: string;
  subject: string;
  dueDate: string;
  totalMarks: number;
  status: 'draft' | 'published' | 'closed';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}
