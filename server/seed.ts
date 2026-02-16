import { storage } from './storage';
import bcrypt from 'bcrypt';
import { db } from './db';
import { users } from '../shared/schemas/user';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...');

  try {
    // Create admin users first
    console.log('Creating admin users...');
    
    // Create super admin user
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    
    // Check if super admin exists first
    const [existingSuperAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, 'superadmin'))
      .limit(1);
    
    if (!existingSuperAdmin) {
      await db.insert(users).values({
        username: 'superadmin',
        password: superAdminPassword,
        role: 'super_admin',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@edumanage.pro',
        phone: '+1234567890',
        isActive: true,
        isApproved: true
      });
      console.log('✅ Created super admin');
    } else {
      console.log('✅ Super admin already exists, updating password');
      await db.update(users)
        .set({ password: superAdminPassword, updatedAt: new Date() })
        .where(eq(users.id, existingSuperAdmin.id));
    }
    
    // Create regular admin user
    const adminPassword = await bcrypt.hash('password', 10);
    
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, 'admin'))
      .limit(1);
    
    if (!existingAdmin) {
      await db.insert(users).values({
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        firstName: 'School',
        lastName: 'Admin',
        email: 'admin@school.edu',
        phone: '+1234567891',
        isActive: true,
        isApproved: true
      });
      console.log('✅ Created regular admin');
    } else {
      console.log('✅ Regular admin already exists, updating password');
      await db.update(users)
        .set({ password: adminPassword, updatedAt: new Date() })
        .where(eq(users.id, existingAdmin.id));
    }
    
    console.log('✅ Admin users ready');
    console.log('  - Super Admin: superadmin@edumanage.pro / superadmin123');
    console.log('  - Admin: admin@school.edu / password');
    // Check if data already exists
    const existingStudents = await storage.getStudents();
    if (existingStudents.length > 1) { // Allow re-seeding if minimal data
      console.log('✅ Database already has comprehensive data, skipping seed.');
      return;
    }

    // Seed Teachers first (needed for foreign keys)
    const teachers = await Promise.all([
      storage.createTeacher({
        employeeId: 'T001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@school.edu',
        phone: '555-0101',
        hireDate: new Date('2020-08-15'),
        department: 'Mathematics',
        subject: 'Mathematics',
        qualification: 'M.Sc Mathematics',
        experience: 5,
        salary: '55000',
        address: '123 Teacher Lane, City, State',
        status: 'active'
      }),
      storage.createTeacher({
        employeeId: 'T002',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@school.edu',
        phone: '555-0102',
        hireDate: new Date('2019-08-20'),
        department: 'Science',
        subject: 'Physics',
        qualification: 'Ph.D Physics',
        experience: 8,
        salary: '65000',
        address: '456 Faculty Drive, City, State',
        status: 'active'
      }),
      storage.createTeacher({
        employeeId: 'T003',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@school.edu',
        phone: '555-0103',
        hireDate: new Date('2021-08-10'),
        department: 'English',
        subject: 'English Literature',
        qualification: 'M.A English',
        experience: 3,
        salary: '50000',
        address: '789 Education Blvd, City, State',
        status: 'active'
      })
    ]);

    console.log(`✅ Created ${teachers.length} teachers`);

    // Seed Students
    const students = await Promise.all([
      storage.createStudent({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@student.edu',
        phone: '555-1001',
        dateOfBirth: new Date('2008-03-15'),
        grade: '10',
        section: 'A',
        parentName: 'Robert Doe',
        parentContact: '555-1002',
        parentEmail: 'robert.doe@parent.com',
        address: '123 Student Street, City, State',
        status: 'active'
      }),
      storage.createStudent({
        firstName: 'Emma',
        lastName: 'Smith',
        email: 'emma.smith@student.edu',
        phone: '555-1003',
        dateOfBirth: new Date('2008-07-22'),
        grade: '10',
        section: 'A',
        parentName: 'David Smith',
        parentContact: '555-1004',
        parentEmail: 'david.smith@parent.com',
        address: '456 Academy Road, City, State',
        status: 'active'
      }),
      storage.createStudent({
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@student.edu',
        phone: '555-1005',
        dateOfBirth: new Date('2007-11-10'),
        grade: '11',
        section: 'B',
        parentName: 'Lisa Johnson',
        parentContact: '555-1006',
        parentEmail: 'lisa.johnson@parent.com',
        address: '789 Learning Lane, City, State',
        status: 'active'
      }),
      storage.createStudent({
        firstName: 'Sofia',
        lastName: 'Garcia',
        email: 'sofia.garcia@student.edu',
        phone: '555-1007',
        dateOfBirth: new Date('2008-05-18'),
        grade: '10',
        section: 'B',
        parentName: 'Carlos Garcia',
        parentContact: '555-1008',
        parentEmail: 'carlos.garcia@parent.com',
        address: '321 School Drive, City, State',
        status: 'active'
      })
    ]);

    console.log(`✅ Created ${students.length} students`);

    // Seed Books
    const books = await Promise.all([
      storage.createBook({
        title: 'Introduction to Programming',
        author: 'Jane Smith',
        isbn: '978-0123456789',
        category: 'Computer Science',
        publisher: 'Tech Books',
        publicationYear: 2023,
        quantity: 5,
        available: 4,
        location: 'CS-101',
        description: 'A comprehensive guide to programming fundamentals',
        status: 'available'
      }),
      storage.createBook({
        title: 'Advanced Mathematics',
        author: 'Dr. Robert Wilson',
        isbn: '978-0987654321',
        category: 'Mathematics',
        publisher: 'Academic Press',
        publicationYear: 2022,
        quantity: 3,
        available: 3,
        location: 'MATH-201',
        description: 'Advanced mathematical concepts for high school',
        status: 'available'
      }),
      storage.createBook({
        title: 'Physics: Principles and Applications',
        author: 'Prof. Alan Giancoli',
        isbn: '978-0321625922',
        category: 'Physics',
        publisher: 'Pearson',
        publicationYear: 2021,
        quantity: 4,
        available: 3,
        location: 'PHY-101',
        description: 'Comprehensive physics textbook for grades 10-12',
        status: 'available'
      }),
      storage.createBook({
        title: 'Shakespeare Complete Works',
        author: 'William Shakespeare',
        isbn: '978-0486475914',
        category: 'Literature',
        publisher: 'Dover Publications',
        publicationYear: 2020,
        quantity: 6,
        available: 6,
        location: 'LIT-301',
        description: 'Complete collection of Shakespeare works',
        status: 'available'
      })
    ]);

    console.log(`✅ Created ${books.length} books`);

    // Seed Assignments
    const assignments = await Promise.all([
      storage.createAssignment({
        title: 'Algebra Problem Set 1',
        description: 'Solve quadratic equations and graph functions',
        subject: 'Mathematics',
        grade: '10',
        section: 'A',
        teacherId: teachers[0].id,
        dueDate: new Date('2024-09-15'),
        totalMarks: 100,
        instructions: 'Complete all problems showing work. Use graphing calculator where needed.',
        status: 'active'
      }),
      storage.createAssignment({
        title: 'Physics Lab Report: Motion',
        description: 'Analyze motion data from pendulum experiment',
        subject: 'Physics',
        grade: '11',
        section: 'B',
        teacherId: teachers[1].id,
        dueDate: new Date('2024-09-20'),
        totalMarks: 50,
        instructions: 'Include data tables, graphs, and error analysis.',
        status: 'active'
      }),
      storage.createAssignment({
        title: 'Essay: Romeo and Juliet Analysis',
        description: 'Analyze themes in Romeo and Juliet',
        subject: 'English Literature',
        grade: '10',
        section: 'A',
        teacherId: teachers[2].id,
        dueDate: new Date('2024-09-25'),
        totalMarks: 75,
        instructions: 'Minimum 500 words. Include quotes and citations.',
        status: 'active'
      })
    ]);

    console.log(`✅ Created ${assignments.length} assignments`);

    // Seed Transactions
    const transactions = await Promise.all([
      storage.createTransaction({
        studentId: students[0].id,
        type: 'tuition',
        amount: '2500.00',
        description: 'Q1 2024 Tuition Fee',
        dueDate: new Date('2024-04-01'),
        status: 'paid',
        paidDate: new Date('2024-03-28'),
        paymentMethod: 'bank_transfer'
      }),
      storage.createTransaction({
        studentId: students[1].id,
        type: 'tuition',
        amount: '2500.00',
        description: 'Q1 2024 Tuition Fee',
        dueDate: new Date('2024-04-01'),
        status: 'pending'
      }),
      storage.createTransaction({
        studentId: students[2].id,
        type: 'library',
        amount: '15.00',
        description: 'Late return fine for Physics textbook',
        dueDate: new Date('2024-09-10'),
        status: 'pending'
      }),
      storage.createTransaction({
        studentId: students[3].id,
        type: 'transport',
        amount: '150.00',
        description: 'Monthly bus pass fee',
        dueDate: new Date('2024-09-01'),
        status: 'paid',
        paidDate: new Date('2024-08-30'),
        paymentMethod: 'cash'
      })
    ]);

    console.log(`✅ Created ${transactions.length} transactions`);

    // Seed Announcements
    const announcements = await Promise.all([
      storage.createAnnouncement({
        title: 'Welcome Back to School!',
        content: 'We are excited to welcome all students back for the new academic year. Classes begin September 1st, 2024.',
        type: 'general',
        targetAudience: 'all',
        publishDate: new Date('2024-08-15'),
        expiryDate: new Date('2024-09-15'),
        priority: 'normal',
        status: 'active',
        createdBy: 1
      }),
      storage.createAnnouncement({
        title: 'Parent-Teacher Conference',
        content: 'Parent-teacher conferences are scheduled for September 20-22. Please sign up for your time slots.',
        type: 'event',
        targetAudience: 'parents',
        grade: '10',
        publishDate: new Date('2024-09-01'),
        expiryDate: new Date('2024-09-25'),
        priority: 'high',
        status: 'active',
        createdBy: 1
      }),
      storage.createAnnouncement({
        title: 'Library Hours Extended',
        content: 'The library will now be open until 8 PM on weekdays to provide more study time for students.',
        type: 'academic',
        targetAudience: 'students',
        publishDate: new Date('2024-08-20'),
        priority: 'normal',
        status: 'active',
        createdBy: 1
      })
    ]);

    console.log(`✅ Created ${announcements.length} announcements`);

    // Create a sample book issue
    await storage.createBookIssue({
      bookId: books[0].id,
      studentId: students[0].id,
      issueDate: new Date('2024-08-25'),
      dueDate: new Date('2024-09-25'),
      status: 'issued',
      issuedBy: teachers[0].id
    });

    console.log(`✅ Created book issue`);

    // Create sample attendance records
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await Promise.all([
      ...students.map(student => 
        storage.createAttendance({
          studentId: student.id,
          date: today,
          status: 'present',
          teacherId: teachers[0].id
        })
      ),
      ...students.slice(0, 2).map(student => 
        storage.createAttendance({
          studentId: student.id,
          date: yesterday,
          status: 'present',
          teacherId: teachers[0].id
        })
      ),
      storage.createAttendance({
        studentId: students[2].id,
        date: yesterday,
        status: 'absent',
        remarks: 'Sick leave',
        teacherId: teachers[0].id
      })
    ]);

    console.log(`✅ Created attendance records`);

    // Create sample grades
    await Promise.all([
      storage.createGrade({
        studentId: students[0].id,
        assignmentId: assignments[0].id,
        subject: 'Mathematics',
        examType: 'assignment',
        marksObtained: '85.5',
        totalMarks: '100',
        grade: 'A',
        remarks: 'Excellent work on algebraic concepts',
        gradedBy: teachers[0].id,
        gradedAt: new Date()
      }),
      storage.createGrade({
        studentId: students[1].id,
        assignmentId: assignments[0].id,
        subject: 'Mathematics',
        examType: 'assignment',
        marksObtained: '78.0',
        totalMarks: '100',
        grade: 'B+',
        remarks: 'Good understanding, minor calculation errors',
        gradedBy: teachers[0].id,
        gradedAt: new Date()
      }),
      storage.createGrade({
        studentId: students[2].id,
        assignmentId: assignments[1].id,
        subject: 'Physics',
        examType: 'assignment',
        marksObtained: '42.0',
        totalMarks: '50',
        grade: 'A-',
        remarks: 'Excellent lab analysis and presentation',
        gradedBy: teachers[1].id,
        gradedAt: new Date()
      })
    ]);

    console.log(`✅ Created grades`);

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}