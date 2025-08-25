import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { db } from '../db';
import { users, students, teachers, classes, transactions, attendance } from '@shared/schema';
import { eq, count, sum, desc, and, gte, sql } from 'drizzle-orm';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

// Apply authentication to all routes
router.use(authenticateToken);
router.use(requireRole(['admin', 'Administrator', 'super_admin', 'Super Administrator']));

// Dashboard statistics
router.get('/dashboard/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get student count
    const [studentStats] = await db
      .select({ count: count() })
      .from(students);

    // Get teacher count  
    const [teacherStats] = await db
      .select({ count: count() })
      .from(teachers);

    // Get active user count
    const [activeUserStats] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    // Get class count
    const [classStats] = await db
      .select({ count: count() })
      .from(classes);

    // Get revenue for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [revenueStats] = await db
      .select({ 
        total: sum(transactions.amount)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'fee_payment'),
          gte(transactions.createdAt, currentMonth)
        )
      );

    // Get attendance percentage for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAttendance] = await db
      .select({
        total: count(),
        present: sum(sql`CASE WHEN ${attendance.status} = 'present' THEN 1 ELSE 0 END`)
      })
      .from(attendance)
      .where(
        and(
          gte(attendance.date, today.toISOString().split('T')[0]),
          sql`${attendance.date} < ${tomorrow.toISOString().split('T')[0]}`
        )
      );

    const attendanceRate = todayAttendance.total > 0 
      ? Math.round((Number(todayAttendance.present) / todayAttendance.total) * 100)
      : 0;

    // Get recent activity (last 10 students registered)
    const recentStudents = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        createdAt: students.createdAt
      })
      .from(students)
      .orderBy(desc(students.createdAt))
      .limit(5);

    // Get pending approvals count
    const [pendingApprovals] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isApproved, false));

    res.json({
      stats: {
        totalStudents: studentStats.count,
        totalTeachers: teacherStats.count,
        totalClasses: classStats.count,
        activeUsers: activeUserStats.count,
        monthlyRevenue: Number(revenueStats.total) || 0,
        attendanceRate,
        pendingApprovals: pendingApprovals.count
      },
      recentActivity: recentStudents.map(student => ({
        id: student.id,
        action: `New student registered: ${student.firstName} ${student.lastName}`,
        timestamp: student.createdAt,
        type: 'student_registration'
      }))
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent activities
router.get('/dashboard/activities', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get recent student registrations
    const recentStudents = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        createdAt: students.createdAt
      })
      .from(students)
      .orderBy(desc(students.createdAt))
      .limit(10);

    // Get recent teacher additions
    const recentTeachers = await db
      .select({
        id: teachers.id,
        firstName: teachers.firstName,
        lastName: teachers.lastName,
        createdAt: teachers.createdAt
      })
      .from(teachers)
      .orderBy(desc(teachers.createdAt))
      .limit(5);

    // Get recent transactions
    const recentTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        type: transactions.type,
        createdAt: transactions.createdAt,
        studentId: transactions.studentId
      })
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    const activities = [
      ...recentStudents.map(student => ({
        id: `student-${student.id}`,
        action: `New student registered: ${student.firstName} ${student.lastName}`,
        timestamp: student.createdAt,
        type: 'student_registration',
        icon: 'user-plus'
      })),
      ...recentTeachers.map(teacher => ({
        id: `teacher-${teacher.id}`,
        action: `New teacher added: ${teacher.firstName} ${teacher.lastName}`,
        timestamp: teacher.createdAt,
        type: 'teacher_addition',
        icon: 'graduation-cap'
      })),
      ...recentTransactions.map(transaction => ({
        id: `transaction-${transaction.id}`,
        action: `Payment received: $${transaction.amount} (${transaction.type})`,
        timestamp: transaction.createdAt,
        type: 'payment',
        icon: 'dollar-sign'
      }))
    ];

    // Sort by timestamp and limit to 15 most recent
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      activities: activities.slice(0, 15)
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch recent activities' });
  }
});

// Get financial summary
router.get('/dashboard/financial', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Current month revenue
    const [currentRevenue] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'fee_payment'),
          gte(transactions.createdAt, currentMonth)
        )
      );

    // Last month revenue
    const [lastRevenue] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'fee_payment'),
          gte(transactions.createdAt, lastMonth),
          sql`${transactions.createdAt} < ${currentMonth}`
        )
      );

    // Pending dues
    const [pendingDues] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(eq(transactions.status, 'pending'));

    const current = Number(currentRevenue.total) || 0;
    const last = Number(lastRevenue.total) || 0;
    const growth = last > 0 ? ((current - last) / last) * 100 : 0;

    res.json({
      currentMonth: current,
      lastMonth: last,
      growth: Math.round(growth * 100) / 100,
      pendingDues: Number(pendingDues.total) || 0
    });

  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ message: 'Failed to fetch financial summary' });
  }
});

export default router;