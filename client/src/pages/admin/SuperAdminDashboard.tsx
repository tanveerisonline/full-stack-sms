import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useSuperAuth } from '@/hooks/features/admin';
import { SuperAdminLogin } from '@/components/features/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RoleManagement from '@/components/admin/RoleManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import AuditLogs from '@/components/admin/AuditLogs';
import BackupRestore from '@/components/admin/BackupRestore';
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
  Download,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Edit2,
  Trash2,
  UserCheck
} from 'lucide-react';

// Real data interfaces
interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  systemUptime: string;
  errorLogs: number;
  failedLogins: number;
  revenue: number;
  pendingDues: number;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  type: string;
  severity: string;
  ipAddress?: string;
}

interface SecurityAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  timestamp: string;
}

export default function SuperAdminDashboard() {
  const { isAuthenticated, isLoading, user, token, loginSuccess, logout } = useSuperAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Fetch real dashboard data
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/super-admin/dashboard/stats'],
    enabled: isAuthenticated && !!token,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/super-admin/dashboard/activities'],
    enabled: isAuthenticated && !!token,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: securityData, isLoading: securityLoading } = useQuery({
    queryKey: ['/api/super-admin/dashboard/security'],
    enabled: isAuthenticated && !!token,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Use real data or fallback to defaults
  const systemStats: SystemStats = (statsData as SystemStats) || {
    totalUsers: 0,
    activeUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    systemUptime: '0 days, 0 hours',
    errorLogs: 0,
    failedLogins: 0,
    revenue: 0,
    pendingDues: 0
  };

  const recentActivities: Activity[] = (activitiesData as any)?.activities || [];
  const securityAlerts: SecurityAlert[] = (securityData as any)?.alerts || [];
  
  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // User Management Interface Component
  function UserManagementInterface() {
    const queryClient = useQueryClient();
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [newUser, setNewUser] = useState({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'student',
      phone: ''
    });

    // Fetch users from backend
    const { data: usersResponse, isLoading: usersLoading, error: usersError } = useQuery({
      queryKey: ['/api/super-admin/users'],
      retry: false,
    });

    const users = (usersResponse as any)?.users || [];

    // Delete user mutation
    const deleteUserMutation = useMutation({
      mutationFn: async (userId: string) => {
        await apiRequest(`/api/super-admin/users/${userId}`, {
          method: 'DELETE',
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
      },
    });

    // Toggle user status mutation
    const toggleUserStatusMutation = useMutation({
      mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
        const response = await apiRequest(`/api/super-admin/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({ isActive: !isActive }),
        });
        return response.json();
      },
      onSuccess: () => {
        // Force fresh data fetch
        queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
        queryClient.refetchQueries({ queryKey: ['/api/super-admin/users'] });
      },
    });

    // Add user mutation
    const addUserMutation = useMutation({
      mutationFn: async (userData: any) => {
        return await apiRequest('/api/super-admin/users', {
          method: 'POST',
          body: JSON.stringify({
            ...userData,
            isApproved: true, // Super admin created users are auto-approved
          }),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
        setShowAddUserModal(false);
        setNewUser({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          role: 'student',
          phone: ''
        });
      },
    });

    // Update user mutation
    const updateUserMutation = useMutation({
      mutationFn: async (userData: any) => {
        return await apiRequest(`/api/super-admin/users/${userData.id}`, {
          method: 'PUT',
          body: JSON.stringify(userData),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
        queryClient.refetchQueries({ queryKey: ['/api/super-admin/users'] });
        setShowEditUserModal(false);
        setEditingUser(null);
      },
    });

    // Approve user mutation
    const approveUserMutation = useMutation({
      mutationFn: async (userId: number) => {
        return await apiRequest(`/api/super-admin/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({ isApproved: true }),
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
        queryClient.refetchQueries({ queryKey: ['/api/super-admin/users'] });
      },
    });

    const handleAddUser = () => {
      if (newUser.username && newUser.email && newUser.password && newUser.firstName && newUser.lastName) {
        addUserMutation.mutate(newUser);
      }
    };

    const filteredUsers = users.filter((user: any) => 
      user.firstName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    const handleDeleteUser = (userId: string) => {
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        deleteUserMutation.mutate(userId);
      }
    };

    const handleToggleUserStatus = (user: any) => {
      const action = user.isActive ? 'deactivate' : 'activate';
      if (confirm(`Are you sure you want to ${action} this user?`)) {
        toggleUserStatusMutation.mutate({ userId: user.id, isActive: user.isActive });
      }
    };

    const handleEditUser = (user: any) => {
      setEditingUser({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone || '',
        password: '' // Don't pre-fill password for security
      });
      setShowEditUserModal(true);
    };

    const handleUpdateUser = () => {
      if (editingUser && editingUser.username && editingUser.email && editingUser.firstName && editingUser.lastName) {
        updateUserMutation.mutate(editingUser);
      }
    };

    const handleApproveUser = (userId: number) => {
      if (confirm('Are you sure you want to approve this user? They will be able to log in after approval.')) {
        approveUserMutation.mutate(userId);
      }
    };

    if (usersLoading) {
      return (
        <div className="w-full space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (usersError) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load users. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="w-full space-y-6 text-left">
        {/* Search Input */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name, email, or username..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full"
              data-testid="input-search-users"
            />
          </div>
          <Button 
            onClick={() => setShowAddUserModal(true)}
            data-testid="button-add-new-user"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">All Users ({filteredUsers.length})</h4>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {userSearchQuery ? 'No users found matching your search.' : 'No users found.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user: any) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h5 className="font-medium">
                          {user.firstName} {user.lastName}
                        </h5>
                        <Badge 
                          variant={user.isActive ? 'default' : 'destructive'}
                          data-testid={`status-${user.id}`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge 
                          variant={user.isApproved ? 'default' : 'destructive'}
                          className={user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          data-testid={`approval-${user.id}`}
                        >
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                        <Badge variant="outline" data-testid={`role-${user.id}`}>
                          {user.role?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      {user.lastLogin && (
                        <p className="text-xs text-gray-400">
                          Last login: {new Date(user.lastLogin).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!user.isApproved && (
                        <Button 
                          size="sm" 
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveUser(user.id)}
                          disabled={approveUserMutation.isPending}
                          data-testid={`button-approve-${user.id}`}
                        >
                          Approve
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant={user.isActive ? 'outline' : 'default'}
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={toggleUserStatusMutation.isPending}
                        data-testid={`button-toggle-${user.id}`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditUser(user)}
                        data-testid={`button-edit-${user.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteUserMutation.isPending}
                        data-testid={`button-delete-${user.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Add New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Enter username"
                    data-testid="input-username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email"
                    data-testid="input-email"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      placeholder="First name"
                      data-testid="input-firstname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      placeholder="Last name"
                      data-testid="input-lastname"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Enter password"
                    data-testid="input-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="select-role"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                  <Input
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => setShowAddUserModal(false)}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel-add-user"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={addUserMutation.isPending}
                  className="flex-1"
                  data-testid="button-confirm-add-user"
                >
                  {addUserMutation.isPending ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <Input
                    value={editingUser?.username || ''}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    placeholder="Enter username"
                    data-testid="input-edit-username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={editingUser?.email || ''}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    placeholder="Enter email"
                    data-testid="input-edit-email"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input
                      value={editingUser?.firstName || ''}
                      onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                      placeholder="First name"
                      data-testid="input-edit-firstname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input
                      value={editingUser?.lastName || ''}
                      onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                      placeholder="Last name"
                      data-testid="input-edit-lastname"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password (leave empty to keep current)</label>
                  <Input
                    type="password"
                    value={editingUser?.password || ''}
                    onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                    placeholder="Enter new password (optional)"
                    data-testid="input-edit-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={editingUser?.role || ''}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    data-testid="select-edit-role"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={editingUser?.phone || ''}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                    data-testid="input-edit-phone"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                  }}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel-edit-user"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  className="flex-1"
                  disabled={updateUserMutation.isPending}
                  data-testid="button-save-edit-user"
                >
                  {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  console.log('SuperAdminDashboard state:', { isAuthenticated, isLoading, user, hasToken: !!token, loginSuccess });

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

  // Show login form if not authenticated and login hasn't just succeeded
  if (!isAuthenticated) {
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
              <span className="text-sm text-gray-600">Uptime: {statsLoading ? '...' : systemStats.systemUptime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">{statsLoading ? '...' : systemStats.errorLogs} Alerts</span>
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
        {/* Collapsible Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out`}>
          <div className="p-4">
            {/* Sidebar Header with Toggle */}
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Super Admin</h2>
                    <p className="text-xs text-gray-500">System Control</p>
                  </div>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                data-testid="sidebar-toggle"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <Button
                variant={selectedTab === 'overview' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                onClick={() => setSelectedTab('overview')}
                data-testid="nav-overview"
                title={sidebarCollapsed ? 'Overview' : ''}
              >
                <BarChart3 className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3">Overview</span>}
              </Button>
              <Button
                variant={selectedTab === 'users' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                onClick={() => setSelectedTab('users')}
                data-testid="nav-user-management"
                title={sidebarCollapsed ? 'User Management' : ''}
              >
                <Users className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3">User Management</span>}
              </Button>
              <Button
                variant={selectedTab === 'roles' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                onClick={() => setSelectedTab('roles')}
                data-testid="nav-roles-permissions"
                title={sidebarCollapsed ? 'Roles & Permissions' : ''}
              >
                <Shield className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3">Roles & Permissions</span>}
              </Button>
              <Button
                variant={selectedTab === 'settings' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                onClick={() => setSelectedTab('settings')}
                data-testid="nav-system-settings"
                title={sidebarCollapsed ? 'System Settings' : ''}
              >
                <Settings className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3">System Settings</span>}
              </Button>
              <Button
                variant={selectedTab === 'audit' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                onClick={() => setSelectedTab('audit')}
                data-testid="nav-audit-logs"
                title={sidebarCollapsed ? 'Audit Logs' : ''}
              >
                <FileText className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3">Audit Logs</span>}
              </Button>
              <Button
                variant={selectedTab === 'backup' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                onClick={() => setSelectedTab('backup')}
                data-testid="nav-backup-restore"
                title={sidebarCollapsed ? 'Backup & Restore' : ''}
              >
                <Database className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3">Backup & Restore</span>}
              </Button>
              <Button
                variant={selectedTab === 'reports' ? 'default' : 'ghost'}
                className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                onClick={() => setSelectedTab('reports')}
                data-testid="nav-reports-analytics"
                title={sidebarCollapsed ? 'Reports & Analytics' : ''}
              >
                <BarChart3 className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3">Reports & Analytics</span>}
              </Button>
            </nav>

            {/* User Profile Section - only show when expanded */}
            {!sidebarCollapsed && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.[0] || 'S'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.role?.replace('_', ' ')}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Logout"
                    data-testid="logout-button"
                  >
                    <LogOut className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
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
                    <div className="text-2xl font-bold">{statsLoading ? '...' : systemStats.totalUsers.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="text-green-600">{statsLoading ? '...' : systemStats.activeUsers}</span> active
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                    <Users className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsLoading ? '...' : systemStats.totalStudents.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-1">Active enrollments</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsLoading ? '...' : systemStats.totalTeachers}</div>
                    <div className="text-xs text-gray-600 mt-1">Active staff</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsLoading ? '...' : formatCurrency(systemStats.revenue)}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="text-red-600">{statsLoading ? '...' : formatCurrency(systemStats.pendingDues)}</span> pending
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
                <Button 
                  onClick={() => setSelectedTab('users-full')}
                  data-testid="button-create-user"
                >
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
                    <Button 
                      onClick={() => setSelectedTab('users-full')}
                      data-testid="button-manage-users"
                    >
                      Manage Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === 'roles' && <RoleManagement />}

          {selectedTab === 'settings' && <SystemSettings />}

          {selectedTab === 'audit' && <AuditLogs />}

          {selectedTab === 'backup' && <BackupRestore />}

          {selectedTab === 'users-full' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <Button 
                  onClick={() => setSelectedTab('users')}
                  variant="outline"
                  data-testid="button-back-to-overview"
                >
                  Back to Overview
                </Button>
              </div>
              <UserManagementInterface />
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