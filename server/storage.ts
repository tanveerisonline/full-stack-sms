import { 
  users, students, teachers, classes, assignments, grades, attendance, 
  books, bookIssues, transactions, announcements, timetable, payroll,
  exams, questions, questionOptions, examSubmissions, submissionAnswers, examResults,
  type User, type Student, type Teacher, type Class, type Assignment, 
  type Grade, type Attendance, type Book, type BookIssue, type Transaction, 
  type Announcement, type Timetable, type Payroll, type Exam, type Question,
  type QuestionOption, type ExamSubmission, type SubmissionAnswer, type ExamResult,
  type InsertUser, type InsertStudent, type InsertTeacher, type InsertClass,
  type InsertAssignment, type InsertGrade, type InsertAttendance, 
  type InsertBook, type InsertBookIssue, type InsertTransaction,
  type InsertAnnouncement, type InsertTimetable, type InsertPayroll,
  type InsertExam, type InsertQuestion, type InsertQuestionOption,
  type InsertExamSubmission, type InsertSubmissionAnswer, type InsertExamResult
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
  
  // Examinations
  // Exams
  getExams(): Promise<Exam[]>;
  getExam(id: number): Promise<Exam | undefined>;
  getExamsByTeacher(teacherId: number): Promise<Exam[]>;
  getExamsByClass(classId: string): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, exam: Partial<InsertExam>): Promise<Exam>;
  deleteExam(id: number): Promise<void>;
  
  // Questions
  getQuestions(): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByExam(examId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;
  
  // Question Options
  getQuestionOptions(): Promise<QuestionOption[]>;
  getQuestionOption(id: number): Promise<QuestionOption | undefined>;
  getQuestionOptionsByQuestion(questionId: number): Promise<QuestionOption[]>;
  createQuestionOption(option: InsertQuestionOption): Promise<QuestionOption>;
  updateQuestionOption(id: number, option: Partial<InsertQuestionOption>): Promise<QuestionOption>;
  deleteQuestionOption(id: number): Promise<void>;
  
  // Exam Submissions
  getExamSubmissions(): Promise<ExamSubmission[]>;
  getExamSubmission(id: number): Promise<ExamSubmission | undefined>;
  getExamSubmissionsByStudent(studentId: number): Promise<ExamSubmission[]>;
  getExamSubmissionsByExam(examId: number): Promise<ExamSubmission[]>;
  getExamSubmissionByStudentAndExam(studentId: number, examId: number): Promise<ExamSubmission | undefined>;
  createExamSubmission(submission: InsertExamSubmission): Promise<ExamSubmission>;
  updateExamSubmission(id: number, submission: Partial<InsertExamSubmission>): Promise<ExamSubmission>;
  deleteExamSubmission(id: number): Promise<void>;
  
  // Submission Answers
  getSubmissionAnswers(): Promise<SubmissionAnswer[]>;
  getSubmissionAnswer(id: number): Promise<SubmissionAnswer | undefined>;
  getSubmissionAnswersBySubmission(submissionId: number): Promise<SubmissionAnswer[]>;
  createSubmissionAnswer(answer: InsertSubmissionAnswer): Promise<SubmissionAnswer>;
  updateSubmissionAnswer(id: number, answer: Partial<InsertSubmissionAnswer>): Promise<SubmissionAnswer>;
  deleteSubmissionAnswer(id: number): Promise<void>;
  
  // Exam Results
  getExamResults(): Promise<ExamResult[]>;
  getExamResult(id: number): Promise<ExamResult | undefined>;
  getExamResultsByStudent(studentId: number): Promise<ExamResult[]>;
  getExamResultsByExam(examId: number): Promise<ExamResult[]>;
  getExamResultByStudentAndExam(studentId: number, examId: number): Promise<ExamResult | undefined>;
  createExamResult(result: InsertExamResult): Promise<ExamResult>;
  updateExamResult(id: number, result: Partial<InsertExamResult>): Promise<ExamResult>;
  deleteExamResult(id: number): Promise<void>;
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
    const result = await db.insert(users).values(insertUser);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [user] = await db.select().from(users).where(eq(users.id, Number(insertId)));
    if (!user) throw new Error('Failed to retrieve created user');
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
    // Generate required fields
    const rollNumber = `STU${Date.now().toString().slice(-6)}`;
    const studentData = {
      ...student,
      rollNumber,
      admissionDate: new Date(),
    };
    const result = await db.insert(students).values(studentData);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newStudent] = await db.select().from(students).where(eq(students.id, Number(insertId)));
    if (!newStudent) throw new Error('Failed to retrieve created student');
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student> {
    await db.update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(students.id, id));
    const [updatedStudent] = await db.select().from(students).where(eq(students.id, id));
    if (!updatedStudent) throw new Error('Student not found');
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
    const result = await db.insert(teachers).values(teacher);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newTeacher] = await db.select().from(teachers).where(eq(teachers.id, Number(insertId)));
    if (!newTeacher) throw new Error('Failed to retrieve created teacher');
    return newTeacher;
  }

  async updateTeacher(id: number, teacher: Partial<InsertTeacher>): Promise<Teacher> {
    await db.update(teachers)
      .set({ ...teacher, updatedAt: new Date() })
      .where(eq(teachers.id, id));
    const [updatedTeacher] = await db.select().from(teachers).where(eq(teachers.id, id));
    if (!updatedTeacher) throw new Error('Teacher not found');
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
    await db.insert(classes).values(classData);
    // Get the most recently created class with matching data
    const [newClass] = await db.select().from(classes)
      .where(
        and(
          eq(classes.name, classData.name),
          eq(classes.grade, classData.grade),
          eq(classes.subject, classData.subject)
        )
      )
      .orderBy(desc(classes.id))
      .limit(1);
    
    if (!newClass) {
      throw new Error('Failed to retrieve created class');
    }
    return newClass;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class> {
    await db.update(classes)
      .set({ ...classData, updatedAt: new Date() })
      .where(eq(classes.id, id));
    // Get the updated class
    const [updatedClass] = await db.select().from(classes).where(eq(classes.id, id));
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
    const result = await db.insert(assignments).values(assignment);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newAssignment] = await db.select().from(assignments).where(eq(assignments.id, Number(insertId)));
    if (!newAssignment) throw new Error('Failed to retrieve created assignment');
    return newAssignment;
  }

  async updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment> {
    await db.update(assignments)
      .set({ ...assignment, updatedAt: new Date() })
      .where(eq(assignments.id, id));
    const [updatedAssignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    if (!updatedAssignment) throw new Error('Assignment not found');
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
    const result = await db.insert(grades).values(grade);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newGrade] = await db.select().from(grades).where(eq(grades.id, Number(insertId)));
    if (!newGrade) throw new Error('Failed to retrieve created grade');
    return newGrade;
  }

  async updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade> {
    await db.update(grades)
      .set({ ...grade, updatedAt: new Date() })
      .where(eq(grades.id, id));
    const [updatedGrade] = await db.select().from(grades).where(eq(grades.id, id));
    if (!updatedGrade) throw new Error('Grade not found');
    return updatedGrade;
  }

  async deleteGrade(id: number): Promise<void> {
    await db.delete(grades).where(eq(grades.id, id));
  }

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    return await db.select().from(attendance).orderBy(desc(attendance.id));
  }

  async getAttendanceByStudent(studentId: number): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.studentId, studentId));
  }

  async getAttendanceByGradeSectionDate(grade: string, section: string, date: string): Promise<Attendance[]> {
    return await db.select().from(attendance)
      .where(
        and(
          eq(attendance.grade, grade),
          eq(attendance.section, section),
          eq(attendance.date, new Date(date))
        )
      )
      .orderBy(desc(attendance.id));
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const result = await db.insert(attendance).values(attendanceData);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newAttendance] = await db.select().from(attendance).where(eq(attendance.id, Number(insertId)));
    if (!newAttendance) throw new Error('Failed to retrieve created attendance');
    return newAttendance;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance> {
    await db.update(attendance)
      .set({ ...attendanceData, updatedAt: new Date() })
      .where(eq(attendance.id, id));
    const [updatedAttendance] = await db.select().from(attendance).where(eq(attendance.id, id));
    if (!updatedAttendance) throw new Error('Attendance not found');
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
    const result = await db.insert(books).values(book);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newBook] = await db.select().from(books).where(eq(books.id, Number(insertId)));
    if (!newBook) throw new Error('Failed to retrieve created book');
    return newBook;
  }

  async updateBook(id: number, book: Partial<InsertBook>): Promise<Book> {
    await db.update(books)
      .set({ ...book, updatedAt: new Date() })
      .where(eq(books.id, id));
    const [updatedBook] = await db.select().from(books).where(eq(books.id, id));
    if (!updatedBook) throw new Error('Book not found');
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
    const result = await db.insert(bookIssues).values(bookIssue);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newBookIssue] = await db.select().from(bookIssues).where(eq(bookIssues.id, Number(insertId)));
    if (!newBookIssue) throw new Error('Failed to retrieve created book issue');
    return newBookIssue;
  }

  async updateBookIssue(id: number, bookIssue: Partial<InsertBookIssue>): Promise<BookIssue> {
    await db.update(bookIssues)
      .set({ ...bookIssue, updatedAt: new Date() })
      .where(eq(bookIssues.id, id));
    const [updatedBookIssue] = await db.select().from(bookIssues).where(eq(bookIssues.id, id));
    if (!updatedBookIssue) throw new Error('Book issue not found');
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
    const result = await db.insert(transactions).values(transaction);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newTransaction] = await db.select().from(transactions).where(eq(transactions.id, Number(insertId)));
    if (!newTransaction) throw new Error('Failed to retrieve created transaction');
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    await db.update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id));
    const [updatedTransaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!updatedTransaction) throw new Error('Transaction not found');
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
    const result = await db.insert(announcements).values(announcement);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newAnnouncement] = await db.select().from(announcements).where(eq(announcements.id, Number(insertId)));
    if (!newAnnouncement) throw new Error('Failed to retrieve created announcement');
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    await db.update(announcements)
      .set({ ...announcement, updatedAt: new Date() })
      .where(eq(announcements.id, id));
    const [updatedAnnouncement] = await db.select().from(announcements).where(eq(announcements.id, id));
    if (!updatedAnnouncement) throw new Error('Announcement not found');
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
    try {
      console.log('Creating timetable entry with data:', timetableEntry);
      const result = await db.insert(timetable).values(timetableEntry);
      console.log('Timetable insert result:', result);
      
      const insertId = (result as any).insertId;
      console.log('Timetable insert ID:', insertId);
      
      if (!insertId) {
        console.error('No insert ID returned from database for timetable');
        throw new Error('Failed to get insert ID');
      }
      
      const [newTimetableEntry] = await db.select().from(timetable).where(eq(timetable.id, Number(insertId)));
      if (!newTimetableEntry) throw new Error('Failed to retrieve created timetable entry');
      return newTimetableEntry;
    } catch (error) {
      console.error('Error creating timetable entry:', error);
      throw error;
    }
  }

  async updateTimetableEntry(id: number, timetableEntry: Partial<InsertTimetable>): Promise<Timetable> {
    await db.update(timetable)
      .set({ ...timetableEntry, updatedAt: new Date() })
      .where(eq(timetable.id, id));
    const [updatedTimetableEntry] = await db.select().from(timetable).where(eq(timetable.id, id));
    if (!updatedTimetableEntry) throw new Error('Timetable entry not found');
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
      updatedAt: payroll.updatedAt,
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

    const result = await db.insert(payroll).values({
      ...insertPayroll,
      grossSalary: grossSalary.toString(),
      netSalary: netSalary.toString(),
    });
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [record] = await db.select().from(payroll).where(eq(payroll.id, Number(insertId)));
    if (!record) throw new Error('Failed to retrieve created payroll record');
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

    await db.update(payroll)
      .set(updatePayroll)
      .where(eq(payroll.id, id));
    const [record] = await db.select().from(payroll).where(eq(payroll.id, id));
    if (!record) throw new Error('Payroll record not found');
    return record;
  }

  async deletePayroll(id: number): Promise<void> {
    await db.delete(payroll).where(eq(payroll.id, id));
  }

  // Examinations
  // Exams
  async getExams(): Promise<Exam[]> {
    return await db.select().from(exams).orderBy(desc(exams.createdAt));
  }

  async getExam(id: number): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam || undefined;
  }

  async getExamsByTeacher(teacherId: number): Promise<Exam[]> {
    return await db.select().from(exams).where(eq(exams.teacherId, teacherId));
  }

  async getExamsByClass(classId: string): Promise<Exam[]> {
    return await db.select().from(exams).where(eq(exams.class, classId));
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    try {
      console.log('Creating exam with data:', exam);
      const result = await db.insert(exams).values(exam);
      console.log('Insert result:', result);
      
      const insertId = (result as any).insertId;
      console.log('Insert ID:', insertId);
      
      if (!insertId) {
        console.error('No insert ID returned from database');
        throw new Error('Failed to get insert ID');
      }
      
      const [newExam] = await db.select().from(exams).where(eq(exams.id, Number(insertId)));
      if (!newExam) throw new Error('Failed to retrieve created exam');
      return newExam;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  }

  async updateExam(id: number, exam: Partial<InsertExam>): Promise<Exam> {
    await db.update(exams)
      .set({ ...exam, updatedAt: new Date() })
      .where(eq(exams.id, id));
    const [updatedExam] = await db.select().from(exams).where(eq(exams.id, id));
    if (!updatedExam) throw new Error('Exam not found');
    return updatedExam;
  }

  async deleteExam(id: number): Promise<void> {
    await db.delete(exams).where(eq(exams.id, id));
  }

  // Questions
  async getQuestions(): Promise<Question[]> {
    return await db.select().from(questions).orderBy(questions.orderIndex);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async getQuestionsByExam(examId: number): Promise<Question[]> {
    return await db.select().from(questions)
      .where(eq(questions.examId, examId))
      .orderBy(questions.orderIndex);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(questions).values(question);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newQuestion] = await db.select().from(questions).where(eq(questions.id, Number(insertId)));
    if (!newQuestion) throw new Error('Failed to retrieve created question');
    return newQuestion;
  }

  async updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question> {
    await db.update(questions)
      .set({ ...question, updatedAt: new Date() })
      .where(eq(questions.id, id));
    const [updatedQuestion] = await db.select().from(questions).where(eq(questions.id, id));
    if (!updatedQuestion) throw new Error('Question not found');
    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  // Question Options
  async getQuestionOptions(): Promise<QuestionOption[]> {
    return await db.select().from(questionOptions).orderBy(questionOptions.orderIndex);
  }

  async getQuestionOption(id: number): Promise<QuestionOption | undefined> {
    const [option] = await db.select().from(questionOptions).where(eq(questionOptions.id, id));
    return option || undefined;
  }

  async getQuestionOptionsByQuestion(questionId: number): Promise<QuestionOption[]> {
    return await db.select().from(questionOptions)
      .where(eq(questionOptions.questionId, questionId))
      .orderBy(questionOptions.orderIndex);
  }

  async createQuestionOption(option: InsertQuestionOption): Promise<QuestionOption> {
    const result = await db.insert(questionOptions).values(option);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newOption] = await db.select().from(questionOptions).where(eq(questionOptions.id, Number(insertId)));
    if (!newOption) throw new Error('Failed to retrieve created question option');
    return newOption;
  }

  async updateQuestionOption(id: number, option: Partial<InsertQuestionOption>): Promise<QuestionOption> {
    await db.update(questionOptions)
      .set(option)
      .where(eq(questionOptions.id, id));
    const [updatedOption] = await db.select().from(questionOptions).where(eq(questionOptions.id, id));
    if (!updatedOption) throw new Error('Question option not found');
    return updatedOption;
  }

  async deleteQuestionOption(id: number): Promise<void> {
    await db.delete(questionOptions).where(eq(questionOptions.id, id));
  }

  // Exam Submissions
  async getExamSubmissions(): Promise<ExamSubmission[]> {
    return await db.select().from(examSubmissions).orderBy(desc(examSubmissions.createdAt));
  }

  async getExamSubmission(id: number): Promise<ExamSubmission | undefined> {
    const [submission] = await db.select().from(examSubmissions).where(eq(examSubmissions.id, id));
    return submission || undefined;
  }

  async getExamSubmissionsByStudent(studentId: number): Promise<ExamSubmission[]> {
    return await db.select().from(examSubmissions).where(eq(examSubmissions.studentId, studentId));
  }

  async getExamSubmissionsByExam(examId: number): Promise<ExamSubmission[]> {
    return await db.select().from(examSubmissions).where(eq(examSubmissions.examId, examId));
  }

  async getExamSubmissionByStudentAndExam(studentId: number, examId: number): Promise<ExamSubmission | undefined> {
    const [submission] = await db.select().from(examSubmissions)
      .where(and(eq(examSubmissions.studentId, studentId), eq(examSubmissions.examId, examId)));
    return submission || undefined;
  }

  async createExamSubmission(submission: InsertExamSubmission): Promise<ExamSubmission> {
    const result = await db.insert(examSubmissions).values(submission);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newSubmission] = await db.select().from(examSubmissions).where(eq(examSubmissions.id, Number(insertId)));
    if (!newSubmission) throw new Error('Failed to retrieve created exam submission');
    return newSubmission;
  }

  async updateExamSubmission(id: number, submission: Partial<InsertExamSubmission>): Promise<ExamSubmission> {
    await db.update(examSubmissions)
      .set({ ...submission, updatedAt: new Date() })
      .where(eq(examSubmissions.id, id));
    const [updatedSubmission] = await db.select().from(examSubmissions).where(eq(examSubmissions.id, id));
    if (!updatedSubmission) throw new Error('Exam submission not found');
    return updatedSubmission;
  }

  async deleteExamSubmission(id: number): Promise<void> {
    await db.delete(examSubmissions).where(eq(examSubmissions.id, id));
  }

  // Submission Answers
  async getSubmissionAnswers(): Promise<SubmissionAnswer[]> {
    return await db.select().from(submissionAnswers);
  }

  async getSubmissionAnswer(id: number): Promise<SubmissionAnswer | undefined> {
    const [answer] = await db.select().from(submissionAnswers).where(eq(submissionAnswers.id, id));
    return answer || undefined;
  }

  async getSubmissionAnswersBySubmission(submissionId: number): Promise<SubmissionAnswer[]> {
    return await db.select().from(submissionAnswers).where(eq(submissionAnswers.submissionId, submissionId));
  }

  async createSubmissionAnswer(answer: InsertSubmissionAnswer): Promise<SubmissionAnswer> {
    const result = await db.insert(submissionAnswers).values(answer);
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newAnswer] = await db.select().from(submissionAnswers).where(eq(submissionAnswers.id, Number(insertId)));
    if (!newAnswer) throw new Error('Failed to retrieve created submission answer');
    return newAnswer;
  }

  async updateSubmissionAnswer(id: number, answer: Partial<InsertSubmissionAnswer>): Promise<SubmissionAnswer> {
    await db.update(submissionAnswers)
      .set({ ...answer, updatedAt: new Date() })
      .where(eq(submissionAnswers.id, id));
    const [updatedAnswer] = await db.select().from(submissionAnswers).where(eq(submissionAnswers.id, id));
    if (!updatedAnswer) throw new Error('Submission answer not found');
    return updatedAnswer;
  }

  async deleteSubmissionAnswer(id: number): Promise<void> {
    await db.delete(submissionAnswers).where(eq(submissionAnswers.id, id));
  }

  // Exam Results
  async getExamResults(): Promise<ExamResult[]> {
    return await db.select().from(examResults).orderBy(desc(examResults.createdAt));
  }

  async getExamResult(id: number): Promise<ExamResult | undefined> {
    const [result] = await db.select().from(examResults).where(eq(examResults.id, id));
    return result || undefined;
  }

  async getExamResultsByStudent(studentId: number): Promise<ExamResult[]> {
    return await db.select().from(examResults).where(eq(examResults.studentId, studentId));
  }

  async getExamResultsByExam(examId: number): Promise<ExamResult[]> {
    return await db.select().from(examResults).where(eq(examResults.examId, examId));
  }

  async getExamResultByStudentAndExam(studentId: number, examId: number): Promise<ExamResult | undefined> {
    const [result] = await db.select().from(examResults)
      .where(and(eq(examResults.studentId, studentId), eq(examResults.examId, examId)));
    return result || undefined;
  }

  async createExamResult(result: InsertExamResult): Promise<ExamResult> {
    const insertResult = await db.insert(examResults).values(result);
    const insertId = (insertResult as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    const [newResult] = await db.select().from(examResults).where(eq(examResults.id, Number(insertId)));
    if (!newResult) throw new Error('Failed to retrieve created exam result');
    return newResult;
  }

  async updateExamResult(id: number, result: Partial<InsertExamResult>): Promise<ExamResult> {
    await db.update(examResults)
      .set({ ...result, updatedAt: new Date() })
      .where(eq(examResults.id, id));
    const [updatedResult] = await db.select().from(examResults).where(eq(examResults.id, id));
    if (!updatedResult) throw new Error('Exam result not found');
    return updatedResult;
  }

  async deleteExamResult(id: number): Promise<void> {
    await db.delete(examResults).where(eq(examResults.id, id));
  }
}

export const storage = new DatabaseStorage();
