import { storage } from './localStorage';
import { Student, Teacher, Course, AttendanceRecord, Transaction, Announcement, Book, BookIssue, Exam, Grade, ClassSchedule, Assignment } from '@/types';
import { mockStudents, mockTeachers, mockTransactions, mockAnnouncements, mockBooks, mockExams } from '@/data/mockData';

export class DataService {
  constructor() {
    this.initializeWithMockData();
  }

  // Initialize with mock data if no data exists
  initializeWithMockData() {
    if (this.getStudents().length === 0) {
      mockStudents.forEach(student => {
        storage.set('students', [...this.getStudents(), student]);
      });
    }
    
    if (this.getTeachers().length === 0) {
      mockTeachers.forEach(teacher => {
        storage.set('teachers', [...this.getTeachers(), teacher]);
      });
    }
    
    if (this.getTransactions().length === 0) {
      mockTransactions.forEach(transaction => {
        storage.set('transactions', [...this.getTransactions(), transaction]);
      });
    }
    
    if (this.getAnnouncements().length === 0) {
      mockAnnouncements.forEach(announcement => {
        storage.set('announcements', [...this.getAnnouncements(), announcement]);
      });
    }
    
    if (this.getBooks().length === 0) {
      mockBooks.forEach(book => {
        storage.set('books', [...this.getBooks(), book]);
      });
    }
    
    if (this.getExams().length === 0) {
      mockExams.forEach(exam => {
        storage.set('exams', [...this.getExams(), exam]);
      });
    }
  }

  // Students
  getStudents(): Student[] {
    return storage.get<Student[]>('students') || [];
  }

  getStudent(id: string): Student | null {
    const students = this.getStudents();
    return students.find(student => student.id === id) || null;
  }

  addStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    students.push(newStudent);
    storage.set('students', students);
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const students = this.getStudents();
    const index = students.findIndex(student => student.id === id);
    if (index === -1) return null;

    students[index] = {
      ...students[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.set('students', students);
    return students[index];
  }

  deleteStudent(id: string): boolean {
    const students = this.getStudents();
    const filteredStudents = students.filter(student => student.id !== id);
    if (filteredStudents.length === students.length) return false;
    
    storage.set('students', filteredStudents);
    return true;
  }

  // Teachers
  getTeachers(): Teacher[] {
    return storage.get<Teacher[]>('teachers') || [];
  }

  addTeacher(teacher: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Teacher {
    const teachers = this.getTeachers();
    const newTeacher: Teacher = {
      ...teacher,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    teachers.push(newTeacher);
    storage.set('teachers', teachers);
    return newTeacher;
  }

  updateTeacher(id: string, updates: Partial<Teacher>): Teacher | null {
    const teachers = this.getTeachers();
    const index = teachers.findIndex(teacher => teacher.id === id);
    if (index === -1) return null;

    teachers[index] = {
      ...teachers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.set('teachers', teachers);
    return teachers[index];
  }

  deleteTeacher(id: string): boolean {
    const teachers = this.getTeachers();
    const filteredTeachers = teachers.filter(teacher => teacher.id !== id);
    if (filteredTeachers.length === teachers.length) return false;
    
    storage.set('teachers', filteredTeachers);
    return true;
  }

  // Courses
  getCourses(): Course[] {
    return storage.get<Course[]>('courses') || [];
  }

  addCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course {
    const courses = this.getCourses();
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    courses.push(newCourse);
    storage.set('courses', courses);
    return newCourse;
  }

  // Class Schedules
  getClassSchedules(): ClassSchedule[] {
    return storage.get<ClassSchedule[]>('class_schedules') || [];
  }

  addClassSchedule(schedule: Omit<ClassSchedule, 'id' | 'createdAt' | 'updatedAt'>): ClassSchedule {
    const schedules = this.getClassSchedules();
    const newSchedule: ClassSchedule = {
      ...schedule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    schedules.push(newSchedule);
    storage.set('class_schedules', schedules);
    return newSchedule;
  }

  // Assignments
  getAssignments(): Assignment[] {
    return storage.get<Assignment[]>('assignments') || [];
  }

  addAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Assignment {
    const assignments = this.getAssignments();
    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    assignments.push(newAssignment);
    storage.set('assignments', assignments);
    return newAssignment;
  }

  // Attendance
  getAttendanceRecords(): AttendanceRecord[] {
    return storage.get<AttendanceRecord[]>('attendance') || [];
  }

  addAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): AttendanceRecord {
    const records = this.getAttendanceRecords();
    const newRecord: AttendanceRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newRecord);
    storage.set('attendance', records);
    return newRecord;
  }

  getAttendanceByDate(date: string): AttendanceRecord[] {
    const records = this.getAttendanceRecords();
    return records.filter(record => record.date === date);
  }

  // Transactions
  getTransactions(): Transaction[] {
    return storage.get<Transaction[]>('transactions') || [];
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const transactions = this.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    storage.set('transactions', transactions);
    return newTransaction;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(transaction => transaction.id === id);
    if (index === -1) return null;

    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.set('transactions', transactions);
    return transactions[index];
  }

  // Announcements
  getAnnouncements(): Announcement[] {
    return storage.get<Announcement[]>('announcements') || [];
  }

  addAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Announcement {
    const announcements = this.getAnnouncements();
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    announcements.push(newAnnouncement);
    storage.set('announcements', announcements);
    return newAnnouncement;
  }

  // Books
  getBooks(): Book[] {
    return storage.get<Book[]>('books') || [];
  }

  addBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book {
    const books = this.getBooks();
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    books.push(newBook);
    storage.set('books', books);
    return newBook;
  }

  // Book Issues
  getBookIssues(): BookIssue[] {
    return storage.get<BookIssue[]>('book_issues') || [];
  }

  addBookIssue(issue: Omit<BookIssue, 'id' | 'createdAt' | 'updatedAt'>): BookIssue {
    const issues = this.getBookIssues();
    const newIssue: BookIssue = {
      ...issue,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    issues.push(newIssue);
    storage.set('book_issues', issues);
    return newIssue;
  }

  // Exams
  getExams(): Exam[] {
    return storage.get<Exam[]>('exams') || [];
  }

  addExam(exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Exam {
    const exams = this.getExams();
    const newExam: Exam = {
      ...exam,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    exams.push(newExam);
    storage.set('exams', exams);
    return newExam;
  }

  // Grades
  getGrades(): Grade[] {
    return storage.get<Grade[]>('grades') || [];
  }

  addGrade(grade: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>): Grade {
    const grades = this.getGrades();
    const newGrade: Grade = {
      ...grade,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    grades.push(newGrade);
    storage.set('grades', grades);
    return newGrade;
  }

  // Dashboard Statistics
  getDashboardStats() {
    const students = this.getStudents();
    const teachers = this.getTeachers();
    const transactions = this.getTransactions();
    const attendance = this.getAttendanceRecords();
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(record => record.date === today);
    const presentToday = todayAttendance.filter(record => record.status === 'present').length;
    const attendanceRate = todayAttendance.length > 0 ? (presentToday / todayAttendance.length) * 100 : 95.5;
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate.getMonth() === thisMonth && 
             transactionDate.getFullYear() === thisYear && 
             transaction.status === 'paid';
    });
    
    const monthlyRevenue = monthlyTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const pendingFees = transactions
      .filter(transaction => transaction.status === 'pending' || transaction.status === 'overdue')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      monthlyRevenue,
      pendingFees,
      activeClasses: this.getCourses().filter(course => course.status === 'active').length,
      libraryBooks: this.getBooks().length,
      upcomingExams: this.getExams().filter(exam => exam.status === 'scheduled' && new Date(exam.date) > new Date()).length
    };
  }
  // Parents
  getParents(): any[] {
    return storage.get<any[]>('parents') || [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1234567890',
        studentId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1234567891',
        studentId: '2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Notifications
  getNotifications(): any[] {
    return storage.get<any[]>('notifications') || [
      {
        id: '1',
        title: 'Assignment Due Reminder',
        message: 'Math homework is due tomorrow',
        type: 'assignment',
        status: 'unread',
        priority: 'medium',
        targetAudience: 'students',
        sender: 'Math Teacher',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Parent-Teacher Meeting',
        message: 'Scheduled for next week',
        type: 'event',
        status: 'read',
        priority: 'high',
        targetAudience: 'parents',
        sender: 'School Admin',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Grade Updated',
        message: 'New grade posted for Science test',
        type: 'grade',
        status: 'unread',
        priority: 'low',
        targetAudience: 'students',
        sender: 'Science Teacher',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];
  }
}

export const dataService = new DataService();
