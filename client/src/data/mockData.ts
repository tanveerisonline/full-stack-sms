import { Student, Teacher, Course, Transaction, Announcement, Book, Exam } from '@/types';

export const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@student.edu',
    phone: '+1 (555) 123-4567',
    grade: 'Grade 10',
    dateOfBirth: '2008-05-15',
    address: '123 Main St, City, State 12345',
    parentName: 'Robert Johnson',
    parentContact: '+1 (555) 123-4567',
    rollNumber: 'STU001',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Davis',
    email: 'sarah.davis@student.edu',
    phone: '+1 (555) 234-5678',
    grade: 'Grade 11',
    dateOfBirth: '2007-08-22',
    address: '456 Oak Ave, City, State 12345',
    parentName: 'Jennifer Davis',
    parentContact: '+1 (555) 234-5678',
    rollNumber: 'STU002',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@student.edu',
    phone: '+1 (555) 345-6789',
    grade: 'Grade 9',
    dateOfBirth: '2009-03-10',
    address: '789 Pine Rd, City, State 12345',
    parentName: 'David Chen',
    parentContact: '+1 (555) 345-6789',
    rollNumber: 'STU003',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    firstName: 'Emily',
    lastName: 'Wilson',
    email: 'emily.wilson@school.edu',
    phone: '+1 (555) 987-6543',
    dateOfBirth: '1985-06-15',
    address: '123 Faculty St, City, State 12345',
    qualification: 'Master of Mathematics',
    experience: 8,
    subjects: ['Mathematics', 'Algebra'],
    salary: 55000,
    joinDate: '2020-08-15',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    studentId: '1',
    amount: 450,
    type: 'tuition',
    status: 'paid',
    description: 'Tuition Fee - January 2024',
    dueDate: '2024-01-15',
    paidDate: '2024-01-15',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    studentId: '2',
    amount: 120,
    type: 'library',
    status: 'pending',
    description: 'Library Fee - January 2024',
    dueDate: '2024-01-20',
    createdAt: '2024-01-14T00:00:00Z',
    updatedAt: '2024-01-14T00:00:00Z'
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Parent-Teacher Conference Schedule',
    content: 'Conferences scheduled for February 15-16. Please book your slots online.',
    type: 'general',
    targetAudience: ['parents'],
    createdBy: '1',
    status: 'published',
    publishDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Science Fair Registration Open',
    content: 'Students can now register for the annual science fair. Deadline: March 1st.',
    type: 'academic',
    targetAudience: ['students'],
    createdBy: '1',
    status: 'published',
    publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Advanced Mathematics',
    author: 'Dr. Robert Smith',
    isbn: '978-0123456789',
    category: 'Mathematics',
    quantity: 50,
    available: 45,
    status: 'available',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockExams: Exam[] = [
  {
    id: '1',
    name: 'Mathematics Mid-term',
    courseId: '1',
    date: '2024-02-15',
    duration: 120,
    totalMarks: 100,
    passingMarks: 40,
    type: 'midterm',
    status: 'scheduled',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];
