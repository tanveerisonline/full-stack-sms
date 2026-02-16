import { 
  users, students,
  type User, type Student,
  type InsertUser, type InsertStudent
} from '@shared/schema';
import { db } from './db';
import { eq, desc } from 'drizzle-orm';

// Simple interface with only basic operations
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
    const [user] = await db.select().from(users).where(eq(users.id, insertId));
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
    const [newStudent] = await db.select().from(students).where(eq(students.id, insertId));
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student> {
    await db.update(students)
      .set(student)
      .where(eq(students.id, id));
    const [updatedStudent] = await db.select().from(students).where(eq(students.id, id));
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }
}

export const storage = new DatabaseStorage();
