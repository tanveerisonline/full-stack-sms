import { useState, useEffect } from 'react';
import { useSuperAuth } from '@/hooks/useSuperAuth';
import SuperAdminLogin from '@/components/SuperAdminLogin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  Settings, 
  FileText, 
  Database, 
  BarChart3,
  AlertTriangle,
  Activity,
  DollarSign,
  UserPlus,
  Search,
  Server,
  Clock,
  Eye,
  Plus,
  Download
} from 'lucide-react';

// Mock data for dashboard
const systemStats = {
  totalUsers: 1247,
  activeUsers: 1156,
  totalStudents: 980,
  totalTeachers: 85,
  totalAdmins: 12,
  systemUptime: '15 days, 8 hours',
  errorLogs: 3,
  failedLogins: 12,
  revenue: 45670,
  pendingDues: 8940
};

const recentActivities = [
  {
    id: 1,
    user: 'John Smith',
    action: 'Role changed to Teacher',
    timestamp: '2025-08-23T16:30:00Z',
    type: 'role_change',
    severity: 'medium'
  },
  {
    id: 2,
    user: 'System',
    action: 'Failed login attempt from 192.168.1.100',
    timestamp: '2025-08-23T16:25:00Z',
    type: 'security',
    severity: 'high'
  },
  {
    id: 3,
    user: 'Sarah Wilson',
    action: 'Created new student record',
    timestamp: '2025-08-23T16:20:00Z',
    type: 'user_action',
    severity: 'low'
  },
  {
    id: 4,
    user: 'Mike Johnson',
    action: 'Updated system settings',
    timestamp: '2025-08-23T16:15:00Z',
    type: 'configuration',
    severity: 'medium'
  }
];

const securityAlerts = [
  {
    id: 1,
    title: 'Multiple Failed Login Attempts',
    message: '12 failed login attempts detected from IP 192.168.1.100',
    severity: 'high',
    timestamp: '2025-08-23T16:30:00Z'
  },
  {
    id: 2,
    title: 'Database Backup Overdue',
    message: 'Last backup was 25 hours ago. Backup recommended.',
    severity: 'medium',
    timestamp: '2025-08-23T14:30:00Z'
  },
  {
    id: 3,
    title: 'Disk Space Warning',
    message: 'Server disk usage at 85%. Consider cleanup.',
    severity: 'medium',
    timestamp: '2025-08-23T12:00:00Z'
  }
];

export default function SuperAdminDashboard() {
  const { isAuthenticated, isLoading, user, token } = useSuperAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  console.log('SuperAdminDashboard state:', { isAuthenticated, isLoading, user, hasToken: !!token });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'super_admin') {
    return <SuperAdminLogin />;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Complete system control and monitoring</p>
          </div>
          
          {/* System Health Indicators */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Uptime: {systemStats.systemUptime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">{systemStats.errorLogs} Alerts</span>
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div className="mt-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users, logs, settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-global-search"
            />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={selectedTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedTab('overview')}
              data-testid="nav-overview"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Overview
            </Button>
            <Button
              variant={selectedTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedTab('users')}
              data-testid="nav-user-management"
            >
              <Users className="w-4 h-4 mr-3" />
              User Management
            </Button>
            <Button
              variant={selectedTab === 'roles' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedTab('roles')}
              data-testid="nav-roles-permissions"
            >
              <Shield className="w-4 h-4 mr-3" />
              Roles & Permissions
            </Button>
            <Button
              variant={selectedTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedTab('settings')}
              data-testid="nav-system-settings"
            >
              <Settings className="w-4 h-4 mr-3" />
              System Settings
            </Button>
            <Button
              variant={selectedTab === 'audit' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedTab('audit')}
              data-testid="nav-audit-logs"
            >
              <FileText className="w-4 h-4 mr-3" />
              Audit Logs
            </Button>
            <Button
              variant={selectedTab === 'backup' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedTab('backup')}
              data-testid="nav-backup-restore"
            >
              <Database className="w-4 h-4 mr-3" />
              Backup & Restore
            </Button>
            <Button
              variant={selectedTab === 'reports' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedTab('reports')}
              data-testid="nav-reports-analytics"
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Reports & Analytics
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Alerts */}
              {securityAlerts.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">Security Alerts</h2>
                  {securityAlerts.map((alert) => (
                    <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm mt-1">{alert.message}</p>
                          </div>
                          <Badge variant="outline" className="ml-4">
                            {alert.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="text-green-600">{systemStats.activeUsers}</span> active
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                    <Users className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.totalStudents.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-1">Active enrollments</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.totalTeachers}</div>
                    <div className="text-xs text-gray-600 mt-1">Active staff</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${systemStats.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="text-red-600">${systemStats.pendingDues}</span> pending
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.severity === 'high' ? 'bg-red-500' :
                            activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-600">by {activity.user}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-logs">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Logs
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="h-20 flex flex-col items-center justify-center" data-testid="button-add-user">
                        <UserPlus className="w-6 h-6 mb-2" />
                        <span className="text-sm">Add User</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center" data-testid="button-configure-roles">
                        <Shield className="w-6 h-6 mb-2" />
                        <span className="text-sm">Configure Roles</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center" data-testid="button-view-logs">
                        <FileText className="w-6 h-6 mb-2" />
                        <span className="text-sm">View Logs</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center" data-testid="button-backup-now">
                        <Database className="w-6 h-6 mb-2" />
                        <span className="text-sm">Backup Now</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {selectedTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <Button data-testid="button-create-user">
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-600 mb-4">Create, edit, and manage all user accounts with full CRUD operations.</p>
                    <Button data-testid="button-manage-users">Manage Users</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
                <Button data-testid="button-create-role">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Role Management</h3>
                    <p className="text-gray-600 mb-4">Configure roles and permissions for system access control.</p>
                    <Button data-testid="button-configure-permissions">Configure Permissions</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
              
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="sms">SMS Gateway</TabsTrigger>
                  <TabsTrigger value="email">Email Service</TabsTrigger>
                  <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">School Name</label>
                        <Input defaultValue="EduManage Pro School" data-testid="input-school-name" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Admin Email</label>
                        <Input defaultValue="admin@edumanage.pro" data-testid="input-admin-email" />
                      </div>
                      <Button data-testid="button-save-general-settings">Save Settings</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sms">
                  <Card>
                    <CardHeader>
                      <CardTitle>SMS Gateway Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Provider</label>
                        <Input placeholder="Twilio, SMS API, etc." data-testid="input-sms-provider" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">API Key</label>
                        <Input type="password" placeholder="Enter API key" data-testid="input-sms-api-key" />
                      </div>
                      <Button data-testid="button-save-sms-settings">Save SMS Settings</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="email">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Service Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">SMTP Host</label>
                        <Input placeholder="smtp.gmail.com" data-testid="input-smtp-host" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">SMTP Port</label>
                        <Input placeholder="587" data-testid="input-smtp-port" />
                      </div>
                      <Button data-testid="button-save-email-settings">Save Email Settings</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="payment">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Gateway Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Payment Provider</label>
                        <Input placeholder="Stripe, PayPal, etc." data-testid="input-payment-provider" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">API Key</label>
                        <Input type="password" placeholder="Enter API key" data-testid="input-payment-api-key" />
                      </div>
                      <Button data-testid="button-save-payment-settings">Save Payment Settings</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {selectedTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
                <Button variant="outline" data-testid="button-export-logs">
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Trail</h3>
                    <p className="text-gray-600 mb-4">View comprehensive logs of all system activities and changes.</p>
                    <Button data-testid="button-view-audit-logs">View Audit Logs</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === 'backup' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Backup & Restore</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Backup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">Last backup: 25 hours ago</p>
                    <div className="space-y-2">
                      <Button className="w-full" data-testid="button-backup-database">
                        <Database className="w-4 h-4 mr-2" />
                        Backup Now
                      </Button>
                      <Button variant="outline" className="w-full" data-testid="button-schedule-backup">
                        <Clock className="w-4 h-4 mr-2" />
                        Schedule Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Restore</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">Restore from backup files</p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" data-testid="button-restore-database">
                        <Database className="w-4 h-4 mr-2" />
                        Restore Database
                      </Button>
                      <Button variant="outline" className="w-full" data-testid="button-view-backups">
                        <Eye className="w-4 h-4 mr-2" />
                        View Backup History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {selectedTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Analytics</h3>
                    <p className="text-gray-600 mb-4">Comprehensive reports and analytics for system performance.</p>
                    <Button data-testid="button-view-analytics">View Analytics</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}