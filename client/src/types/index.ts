export interface User {
  id: string | number;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'super_admin';
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
}

export interface Student {
  id: string | number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  grade: string;
  dateOfBirth?: string | Date | null;
  address?: string | null;
  parentName: string | null;
  parentContact: string | null;
  rollNumber: string;
  status: string;
  avatar?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Additional fields that might be present
  section?: string | null;
  admissionDate?: string | Date | null;
  parentEmail?: string | null;
  bloodGroup?: string | null;
  medicalInfo?: string | null;
}

export interface Teacher {
  id: string | number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | Date | null;
  address: string | null;
  qualification?: string | null;
  experience?: number | null;
  subject?: string | null; // singular subject from database
  subjects?: string[]; // optional array for backward compatibility 
  salary?: string | number | null;
  hireDate?: string | Date | null;
  joinDate?: string; // for backward compatibility
  status: string;
  role?: string;
  avatar?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Additional database fields
  employeeId?: string | null;
  department?: string | null;
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
  id: number;
  studentId: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'holiday';
  grade?: string;
  section?: string;
  remarks?: string;
  markedBy?: number;
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
  availableCopies?: number;
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
  // Additional fields that might be present
  gradeType?: string;
  type?: string;
  score?: number;
  total?: number;
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
