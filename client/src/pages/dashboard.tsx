import { useEffect } from 'react';
import { GraduationCap, Users, CheckCircle, DollarSign, Plus, Calendar, Receipt, BarChart3, Megaphone } from 'lucide-react';
import { StatsCard } from '@/components/Common/StatsCard';
import { QuickActions } from '@/components/Common/QuickActions';
import { EnrollmentChart } from '@/components/Charts/EnrollmentChart';
import { FinancialChart } from '@/components/Charts/FinancialChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { addToast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Initialize with mock data if no data exists
    const students = dataService.getStudents();
    if (students.length === 0) {
      dataService.initializeWithMockData();
    }
    
    // Welcome message
    setTimeout(() => {
      addToast('Welcome to EduManage Pro!', 'success');
    }, 1000);
  }, [addToast]);

  const stats = dataService.getDashboardStats();

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'add-student':
        setLocation('/students');
        break;
      case 'schedule-class':
        setLocation('/academic/scheduling');
        break;
      case 'take-attendance':
        setLocation('/attendance');
        break;
      case 'generate-invoice':
        setLocation('/financial');
        break;
      case 'view-reports':
        setLocation('/reports');
        break;
      case 'send-notice':
        setLocation('/communication');
        break;
      default:
        addToast('Feature coming soon!', 'info');
    }
  };

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-dashboard-title">
          Executive Dashboard
        </h2>
        <p className="text-slate-600" data-testid="text-dashboard-subtitle">
          Welcome back, Dr. Smith. Here's what's happening at your school today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          change="+5.2% from last month"
          changeType="positive"
          icon={<GraduationCap className="w-6 h-6 text-blue-600" />}
        />
        <StatsCard
          title="Teaching Staff"
          value={stats.totalTeachers}
          change="+2 new hires"
          changeType="positive"
          icon={<Users className="w-6 h-6 text-green-600" />}
        />
        <StatsCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          change="+1.2% this week"
          changeType="positive"
          icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change="+12.5% growth"
          changeType="positive"
          icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EnrollmentChart />
        <RecentActivity />
      </div>

      {/* Financial Chart */}
      <FinancialChart />

      {/* Quick Actions */}
      <QuickActions onAction={handleQuickAction} />
    </div>
  );
}
