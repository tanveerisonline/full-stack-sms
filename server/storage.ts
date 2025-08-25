import { 
  users, students, teachers, classes, assignments, grades, attendance, 
  books, bookIssues, transactions, announcements, timetable, payroll,
  type User, type Student, type Teacher, type Class, type Assignment, 
  type Grade, type Attendance, type Book, type BookIssue, type Transaction, 
  type Announcement, type Timetable, type Payroll,
  type InsertUser, type InsertStudent, type InsertTeacher, type InsertClass,
  type InsertAssignment, type InsertGrade, type InsertAttendance, 
  type InsertBook, type InsertBookIssue, type InsertTransaction,
  type InsertAnnouncement, type InsertTimetable, type InsertPayroll
} from '@shared/schema';
import { db } from './db';
import { eq, desc, and, like, or } from 'drizzle-orm';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
  
  // Teachers
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: number): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: number, teacher: Partial<InsertTeacher>): Promise<Teacher>;
  deleteTeacher(id: number): Promise<void>;
  
  // Classes
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, classData: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: number): Promise<void>;
  
  // Assignments
  getAssignments(): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment>;
  deleteAssignment(id: number): Promise<void>;
  
  // Grades
  getGrades(): Promise<Grade[]>;
  getGradesByStudent(studentId: number): Promise<Grade[]>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade>;
  deleteGrade(id: number): Promise<void>;
  
  // Attendance
  getAttendance(): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, attendance: Partial<InsertAttendance>): Promise<Attendance>;
  deleteAttendance(id: number): Promise<void>;
  
  // Books
  getBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: number): Promise<void>;
  
  // Book Issues
  getBookIssues(): Promise<BookIssue[]>;
  getBookIssue(id: number): Promise<BookIssue | undefined>;
  createBookIssue(bookIssue: InsertBookIssue): Promise<BookIssue>;
  updateBookIssue(id: number, bookIssue: Partial<InsertBookIssue>): Promise<BookIssue>;
  deleteBookIssue(id: number): Promise<void>;
  
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  
  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  
  // Timetable
  getTimetable(): Promise<Timetable[]>;
  getTimetableEntry(id: number): Promise<Timetable | undefined>;
  createTimetableEntry(timetableEntry: InsertTimetable): Promise<Timetable>;
  updateTimetableEntry(id: number, timetableEntry: Partial<InsertTimetable>): Promise<Timetable>;
  deleteTimetableEntry(id: number): Promise<void>;
  
  // Payroll
  getPayroll(): Promise<Payroll[]>;
  getPayrollRecord(id: number): Promise<Payroll | undefined>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, payroll: Partial<InsertPayroll>): Promise<Payroll>;
  deletePayroll(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(desc(students.createdAt));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db.update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    return await db.select().from(teachers).orderBy(desc(teachers.createdAt));
  }

  async getTeacher(id: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    return teacher || undefined;
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const [newTeacher] = await db.insert(teachers).values(teacher).returning();
    return newTeacher;
  }

  async updateTeacher(id: number, teacher: Partial<InsertTeacher>): Promise<Teacher> {
    const [updatedTeacher] = await db.update(teachers)
      .set({ ...teacher, updatedAt: new Date() })
      .where(eq(teachers.id, id))
      .returning();
    return updatedTeacher;
  }

  async deleteTeacher(id: number): Promise<void> {
    await db.delete(teachers).where(eq(teachers.id, id));
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes).orderBy(desc(classes.createdAt));
  }

  async getClass(id: number): Promise<Class | undefined> {
    const [classData] = await db.select().from(classes).where(eq(classes.id, id));
    return classData || undefined;
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    return newClass;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class> {
    const [updatedClass] = await db.update(classes)
      .set({ ...classData, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }

  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments).orderBy(desc(assignments.createdAt));
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment || undefined;
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }

  async updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment> {
    const [updatedAssignment] = await db.update(assignments)
      .set({ ...assignment, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteAssignment(id: number): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }

  // Grades
  async getGrades(): Promise<Grade[]> {
    return await db.select().from(grades).orderBy(desc(grades.createdAt));
  }

  async getGradesByStudent(studentId: number): Promise<Grade[]> {
    return await db.select().from(grades).where(eq(grades.studentId, studentId));
  }

  async createGrade(grade: InsertGrade): Promise<Grade> {
    const [newGrade] = await db.insert(grades).values(grade).returning();
    return newGrade;
  }

  async updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade> {
    const [updatedGrade] = await db.update(grades)
      .set({ ...grade, updatedAt: new Date() })
      .where(eq(grades.id, id))
      .returning();
    return updatedGrade;
  }

  async deleteGrade(id: number): Promise<void> {
    await db.delete(grades).where(eq(grades.id, id));
  }

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    return await db.select().from(attendance).orderBy(desc(attendance.createdAt));
  }

  async getAttendanceByStudent(studentId: number): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.studentId, studentId));
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return newAttendance;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance> {
    const [updatedAttendance] = await db.update(attendance)
      .set({ ...attendanceData, updatedAt: new Date() })
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance;
  }

  async deleteAttendance(id: number): Promise<void> {
    await db.delete(attendance).where(eq(attendance.id, id));
  }

  // Books
  async getBooks(): Promise<Book[]> {
    return await db.select().from(books).orderBy(desc(books.createdAt));
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: number, book: Partial<InsertBook>): Promise<Book> {
    const [updatedBook] = await db.update(books)
      .set({ ...book, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return updatedBook;
  }

  async deleteBook(id: number): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  // Book Issues
  async getBookIssues(): Promise<BookIssue[]> {
    return await db.select().from(bookIssues).orderBy(desc(bookIssues.createdAt));
  }

  async getBookIssue(id: number): Promise<BookIssue | undefined> {
    const [bookIssue] = await db.select().from(bookIssues).where(eq(bookIssues.id, id));
    return bookIssue || undefined;
  }

  async createBookIssue(bookIssue: InsertBookIssue): Promise<BookIssue> {
    const [newBookIssue] = await db.insert(bookIssues).values(bookIssue).returning();
    return newBookIssue;
  }

  async updateBookIssue(id: number, bookIssue: Partial<InsertBookIssue>): Promise<BookIssue> {
    const [updatedBookIssue] = await db.update(bookIssues)
      .set({ ...bookIssue, updatedAt: new Date() })
      .where(eq(bookIssues.id, id))
      .returning();
    return updatedBookIssue;
  }

  async deleteBookIssue(id: number): Promise<void> {
    await db.delete(bookIssues).where(eq(bookIssues.id, id));
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db.update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement || undefined;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updatedAnnouncement] = await db.update(announcements)
      .set({ ...announcement, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Timetable
  async getTimetable(): Promise<Timetable[]> {
    return await db.select().from(timetable).orderBy(desc(timetable.createdAt));
  }

  async getTimetableEntry(id: number): Promise<Timetable | undefined> {
    const [timetableEntry] = await db.select().from(timetable).where(eq(timetable.id, id));
    return timetableEntry || undefined;
  }

  async createTimetableEntry(timetableEntry: InsertTimetable): Promise<Timetable> {
    const [newTimetableEntry] = await db.insert(timetable).values(timetableEntry).returning();
    return newTimetableEntry;
  }

  async updateTimetableEntry(id: number, timetableEntry: Partial<InsertTimetable>): Promise<Timetable> {
    const [updatedTimetableEntry] = await db.update(timetable)
      .set({ ...timetableEntry, updatedAt: new Date() })
      .where(eq(timetable.id, id))
      .returning();
    return updatedTimetableEntry;
  }

  async deleteTimetableEntry(id: number): Promise<void> {
    await db.delete(timetable).where(eq(timetable.id, id));
  }

  // Payroll
  async getPayroll(): Promise<Payroll[]> {
    return await db.select({
      id: payroll.id,
      teacherId: payroll.teacherId,
      teacherName: teachers.firstName,
      employeeId: teachers.employeeId,
      month: payroll.month,
      year: payroll.year,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      overtime: payroll.overtime,
      bonus: payroll.bonus,
      grossSalary: payroll.grossSalary,
      netSalary: payroll.netSalary,
      status: payroll.status,
      notes: payroll.notes,
      createdAt: payroll.createdAt,
    })
    .from(payroll)
    .leftJoin(teachers, eq(payroll.teacherId, teachers.id))
    .orderBy(desc(payroll.createdAt));
  }

  async getPayrollRecord(id: number): Promise<Payroll | undefined> {
    const [record] = await db.select().from(payroll).where(eq(payroll.id, id));
    return record || undefined;
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    // Calculate gross and net salary
    const basicSalary = Number(insertPayroll.basicSalary) || 0;
    const allowances = Number(insertPayroll.allowances) || 0;
    const overtime = Number(insertPayroll.overtime) || 0;
    const bonus = Number(insertPayroll.bonus) || 0;
    const deductions = Number(insertPayroll.deductions) || 0;
    
    const grossSalary = basicSalary + allowances + overtime + bonus;
    const netSalary = grossSalary - deductions;

    const [record] = await db.insert(payroll).values({
      ...insertPayroll,
      grossSalary: grossSalary.toString(),
      netSalary: netSalary.toString(),
    }).returning();
    return record;
  }

  async updatePayroll(id: number, updatePayroll: Partial<InsertPayroll>): Promise<Payroll> {
    // Recalculate if salary components are being updated
    if (updatePayroll.basicSalary || updatePayroll.allowances || 
        updatePayroll.overtime || updatePayroll.bonus || updatePayroll.deductions) {
      
      const [currentRecord] = await db.select().from(payroll).where(eq(payroll.id, id));
      if (currentRecord) {
        const basicSalary = Number(updatePayroll.basicSalary ?? currentRecord.basicSalary) || 0;
        const allowances = Number(updatePayroll.allowances ?? currentRecord.allowances) || 0;
        const overtime = Number(updatePayroll.overtime ?? currentRecord.overtime) || 0;
        const bonus = Number(updatePayroll.bonus ?? currentRecord.bonus) || 0;
        const deductions = Number(updatePayroll.deductions ?? currentRecord.deductions) || 0;
        
        const grossSalary = basicSalary + allowances + overtime + bonus;
        const netSalary = grossSalary - deductions;

        updatePayroll.grossSalary = grossSalary.toString();
        updatePayroll.netSalary = netSalary.toString();
      }
    }

    const [record] = await db.update(payroll)
      .set(updatePayroll)
      .where(eq(payroll.id, id))
      .returning();
    return record;
  }

  async deletePayroll(id: number): Promise<void> {
    await db.delete(payroll).where(eq(payroll.id, id));
  }
}

export const storage = new DatabaseStorage();
