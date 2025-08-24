import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  UserPlus,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeUsers: number;
  monthlyRevenue: number;
  attendanceRate: number;
  pendingApprovals: number;
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  type: string;
  icon: string;
}

interface FinancialData {
  currentMonth: number;
  lastMonth: number;
  growth: number;
  pendingDues: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  // Fetch dashboard statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/activities'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch financial data
  const { data: financialData, isLoading: financialLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/financial'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const stats: DashboardStats = statsData?.stats || {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    attendanceRate: 0,
    pendingApprovals: 0
  };

  const activities: Activity[] = activitiesData?.activities || [];
  const financial: FinancialData = financialData || {
    currentMonth: 0,
    lastMonth: 0,
    growth: 0,
    pendingDues: 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'user-plus': return <UserPlus className="h-4 w-4" />;
      case 'graduation-cap': return <GraduationCap className="h-4 w-4" />;
      case 'dollar-sign': return <DollarSign className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
          </div>
          <div className="flex items-center gap-4">
            {stats.pendingApprovals > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {stats.pendingApprovals} pending approvals
              </Badge>
            )}
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.totalStudents.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Active registrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.totalTeachers}
              </div>
              <p className="text-xs text-muted-foreground">Faculty members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.totalClasses}
              </div>
              <p className="text-xs text-muted-foreground">Across all grades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialLoading ? '...' : formatCurrency(financial.currentMonth)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {financial.growth > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    +{financial.growth.toFixed(1)}% from last month
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                    {financial.growth.toFixed(1)}% from last month
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Additional Stats */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : `${stats.attendanceRate}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">Students present today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '...' : stats.activeUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className="mt-0.5 text-gray-500">
                          {getActivityIcon(activity.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activities</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex flex-col" 
                onClick={() => navigate('/students')}
                data-testid="button-manage-students"
              >
                <Users className="h-6 w-6 mb-2" />
                Manage Students
              </Button>
              <Button 
                className="h-20 flex flex-col" 
                variant="outline"
                onClick={() => navigate('/hr')}
                data-testid="button-manage-teachers"
              >
                <GraduationCap className="h-6 w-6 mb-2" />
                Manage Teachers
              </Button>
              <Button 
                className="h-20 flex flex-col" 
                variant="outline"
                onClick={() => navigate('/academic/curriculum')}
                data-testid="button-view-classes"
              >
                <BookOpen className="h-6 w-6 mb-2" />
                View Classes
              </Button>
              <Button 
                className="h-20 flex flex-col" 
                variant="outline"
                onClick={() => navigate('/financial')}
                data-testid="button-financial-reports"
              >
                <DollarSign className="h-6 w-6 mb-2" />
                Financial Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}