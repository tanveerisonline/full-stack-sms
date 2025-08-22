import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/Common/Toast';
import { formatDate } from '@/utils/formatters';
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Bell, 
  Mail, 
  ArchiveRestore,
  Activity,
  Lock,
  Key,
  Server,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react';

interface SystemSetting {
  id: string;
  name: string;
  description: string;
  value: boolean | string;
  type: 'boolean' | 'text' | 'number' | 'select';
  category: 'general' | 'security' | 'notifications' | 'backup';
  options?: string[];
}

interface SystemUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  user?: string;
  action: string;
  details?: string;
}

export default function Admin() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const systemSettings: SystemSetting[] = [
    {
      id: '1',
      name: 'Allow Self Registration',
      description: 'Allow students and parents to register themselves',
      value: false,
      type: 'boolean',
      category: 'general'
    },
    {
      id: '2',
      name: 'Email Notifications',
      description: 'Send email notifications for important events',
      value: true,
      type: 'boolean',
      category: 'notifications'
    },
    {
      id: '3',
      name: 'Session Timeout',
      description: 'User session timeout in minutes',
      value: '30',
      type: 'number',
      category: 'security'
    },
    {
      id: '4',
      name: 'Auto ArchiveRestore',
      description: 'Automatically backup data daily',
      value: true,
      type: 'boolean',
      category: 'backup'
    },
    {
      id: '5',
      name: 'School Name',
      description: 'Official name of the institution',
      value: 'EduManage Pro School',
      type: 'text',
      category: 'general'
    }
  ];

  const systemUsers: SystemUser[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@school.edu',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-02-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      username: 'john.smith',
      email: 'john.smith@school.edu',
      role: 'teacher',
      status: 'active',
      lastLogin: '2024-02-15T09:15:00Z',
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '3',
      username: 'staff.user',
      email: 'staff@school.edu',
      role: 'staff',
      status: 'inactive',
      lastLogin: '2024-02-10T14:20:00Z',
      createdAt: '2024-02-01T00:00:00Z'
    }
  ];

  const systemLogs: SystemLog[] = [
    {
      id: '1',
      timestamp: '2024-02-15T10:30:00Z',
      level: 'info',
      message: 'User login successful',
      user: 'admin@school.edu',
      action: 'LOGIN',
      details: 'IP: 192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2024-02-15T09:15:00Z',
      level: 'warning',
      message: 'Failed login attempt',
      user: 'unknown',
      action: 'LOGIN_FAILED',
      details: 'IP: 192.168.1.200, Attempts: 3'
    },
    {
      id: '3',
      timestamp: '2024-02-15T08:00:00Z',
      level: 'info',
      message: 'Daily backup completed',
      action: 'BACKUP',
      details: 'Size: 2.4GB, Duration: 15 minutes'
    },
    {
      id: '4',
      timestamp: '2024-02-14T23:45:00Z',
      level: 'error',
      message: 'Database connection timeout',
      action: 'DATABASE_ERROR',
      details: 'Connection pool exhausted'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'critical':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const systemStats = {
    totalUsers: systemUsers.length,
    activeUsers: systemUsers.filter(u => u.status === 'active').length,
    totalSettings: systemSettings.length,
    enabledSettings: systemSettings.filter(s => s.type === 'boolean' && s.value === true).length,
    recentLogs: systemLogs.length,
    errorLogs: systemLogs.filter(l => l.level === 'error' || l.level === 'critical').length,
    systemUptime: '15 days, 8 hours',
    lastBackup: '2024-02-15T02:00:00Z'
  };

  const handleSettingChange = (settingId: string, value: boolean | string) => {
    addToast('Setting updated successfully!', 'success');
  };

  const handleUserAction = (action: string, userId: string) => {
    addToast(`User ${action} successfully!`, 'success');
  };

  const handleSystemAction = (action: string) => {
    addToast(`${action} initiated successfully!`, 'info');
  };

  return (
    <div className="space-y-8" data-testid="admin-page">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
          System Administration
        </h2>
        <p className="text-slate-600" data-testid="text-page-subtitle">
          Manage system settings, users, and monitor system performance
        </p>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">System Users</p>
                <p className="text-3xl font-bold text-slate-800">{systemStats.totalUsers}</p>
                <p className="text-sm text-green-600">{systemStats.activeUsers} active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">System Health</p>
                <p className="text-3xl font-bold text-green-800">Good</p>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">System Uptime</p>
                <p className="text-3xl font-bold text-slate-800">99.9%</p>
                <p className="text-sm text-blue-600">{systemStats.systemUptime}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Storage Used</p>
                <p className="text-3xl font-bold text-slate-800">42%</p>
                <p className="text-sm text-slate-600">85GB of 200GB</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">System Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Database Connection</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Email Service</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">ArchiveRestore Service</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Running</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">File Storage</span>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">75% Full</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        log.level === 'error' || log.level === 'critical' ? 'bg-red-500' :
                        log.level === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">{log.message}</p>
                        <p className="text-xs text-slate-600">{formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ArchiveRestore className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Last ArchiveRestore</h3>
                <p className="text-sm text-slate-600 mb-4">
                  {formatDate(systemStats.lastBackup)}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSystemAction('ArchiveRestore')}
                  data-testid="button-backup-now"
                >
                  ArchiveRestore Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Database</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Optimize and maintain database
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSystemAction('Database Optimization')}
                  data-testid="button-optimize-db"
                >
                  Optimize
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">System Update</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Check for system updates
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSystemAction('Update Check')}
                  data-testid="button-check-updates"
                >
                  Check Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Users</CardTitle>
                <Button data-testid="button-add-user">
                  <Users className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Last Login</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {systemUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50" data-testid={`row-user-${user.id}`}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800" data-testid={`text-username-${user.id}`}>
                              {user.username}
                            </p>
                            <p className="text-sm text-slate-600" data-testid={`text-email-${user.id}`}>
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-last-login-${user.id}`}>
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction('edited', user.id)}
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction('suspended', user.id)}
                              data-testid={`button-suspend-user-${user.id}`}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {['general', 'security', 'notifications', 'backup'].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemSettings
                    .filter(setting => setting.category === category)
                    .map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800" data-testid={`text-setting-name-${setting.id}`}>
                            {setting.name}
                          </p>
                          <p className="text-sm text-slate-600" data-testid={`text-setting-description-${setting.id}`}>
                            {setting.description}
                          </p>
                        </div>
                        <div className="ml-4">
                          {setting.type === 'boolean' ? (
                            <Switch
                              checked={setting.value as boolean}
                              onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                              data-testid={`switch-setting-${setting.id}`}
                            />
                          ) : (
                            <Input
                              value={setting.value as string}
                              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                              className="w-32"
                              data-testid={`input-setting-${setting.id}`}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-600">Require 2FA for admin accounts</p>
                  </div>
                  <Switch data-testid="switch-2fa" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Password Complexity</p>
                    <p className="text-sm text-slate-600">Enforce strong password requirements</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-password-complexity" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Login Attempt Limit</p>
                    <p className="text-sm text-slate-600">Lock account after failed attempts</p>
                  </div>
                  <Input value="5" className="w-20" data-testid="input-login-attempts" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Access Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">IP Restriction</p>
                    <p className="text-sm text-slate-600">Restrict access by IP address</p>
                  </div>
                  <Switch data-testid="switch-ip-restriction" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Session Encryption</p>
                    <p className="text-sm text-slate-600">Encrypt user session data</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-session-encryption" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">API Rate Limiting</p>
                    <p className="text-sm text-slate-600">Limit API requests per minute</p>
                  </div>
                  <Input value="100" className="w-20" data-testid="input-rate-limit" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                  onClick={() => handleSystemAction('Force Password Reset')}
                  data-testid="button-force-password-reset"
                >
                  <Lock className="w-4 h-4" />
                  <span>Force Password Reset</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                  onClick={() => handleSystemAction('Clear Sessions')}
                  data-testid="button-clear-sessions"
                >
                  <Shield className="w-4 h-4" />
                  <span>Clear All Sessions</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                  onClick={() => handleSystemAction('Security Audit')}
                  data-testid="button-security-audit"
                >
                  <Activity className="w-4 h-4" />
                  <span>Security Audit</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Logs</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" data-testid="button-export-logs">
                    Export Logs
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-clear-logs">
                    Clear Logs
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Timestamp</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Level</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Message</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {systemLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50" data-testid={`row-log-${log.id}`}>
                        <td className="px-4 py-3 text-sm text-slate-600" data-testid={`text-log-timestamp-${log.id}`}>
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getLogLevelColor(log.level)}>
                            {log.level}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-800" data-testid={`text-log-message-${log.id}`}>
                          {log.message}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-log-user-${log.id}`}>
                          {log.user || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-log-action-${log.id}`}>
                          {log.action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
