import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Eye,
  Calendar,
  User,
  Activity,
  Database,
  RefreshCw,
  Trash2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

interface AuditLogFilters {
  page: number;
  limit: number;
  userId?: number;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface AuditStats {
  totalLogs: number;
  recentLogs: number;
  topActions: Array<{ action: string; count: number }>;
  topResourceTypes: Array<{ resourceType: string; count: number }>;
  activeUsers: Array<{
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    actionCount: number;
  }>;
}

export default function AuditLogs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch audit logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/super-admin/audit', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
      
      const response = await apiRequest(`/api/super-admin/audit?${params}`);
      return response.json();
    },
  });

  // Fetch audit statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/super-admin/audit/stats'],
    queryFn: async () => {
      const response = await apiRequest('/api/super-admin/audit/stats');
      return response.json() as Promise<AuditStats>;
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (format: 'csv' | 'json') => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && key !== 'page' && key !== 'limit') {
          params.append(key, String(value));
        }
      });
      
      const response = await apiRequest(`/api/super-admin/audit/export/${format}?${params}`);
      return { response, format };
    },
    onSuccess: async ({ response, format }) => {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: `Audit logs exported as ${format.toUpperCase()}` });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to export logs',
        variant: 'destructive'
      });
    },
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: async (days: number) => {
      const response = await apiRequest(`/api/super-admin/audit/cleanup?olderThan=${days}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/audit'] });
      toast({ 
        title: 'Success', 
        description: `Deleted ${data.deletedCount} old audit log entries` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to cleanup logs',
        variant: 'destructive'
      });
    },
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to page 1 when filters change
    }));
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800';
    if (action.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('login')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getResourceTypeIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'user': return <User className="w-4 h-4" />;
      case 'student': return <User className="w-4 h-4" />;
      case 'teacher': return <User className="w-4 h-4" />;
      case 'system_settings': return <Database className="w-4 h-4" />;
      case 'role': return <Activity className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatUserName = (log: AuditLog) => {
    if (!log.username) return 'System';
    const fullName = [log.firstName, log.lastName].filter(Boolean).join(' ');
    return fullName || log.username;
  };

  if (logsLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-600">Comprehensive system activity tracking and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate('csv')}
            disabled={exportMutation.isPending}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate('json')}
            disabled={exportMutation.isPending}
            data-testid="button-export-json"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold">{statsData.totalLogs.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last 24 Hours</p>
                  <p className="text-2xl font-bold">{statsData.recentLogs.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Action</p>
                  <p className="text-lg font-bold">{statsData.topActions[0]?.action || 'N/A'}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{statsData.activeUsers.length}</p>
                </div>
                <User className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search in actions, resources..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  data-testid="input-search"
                />
              </div>
              
              <div>
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  placeholder="e.g., create, update, delete"
                  value={filters.action || ''}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  data-testid="input-action"
                />
              </div>
              
              <div>
                <Label htmlFor="resourceType">Resource Type</Label>
                <Select value={filters.resourceType || ''} onValueChange={(value) => handleFilterChange('resourceType', value)}>
                  <SelectTrigger data-testid="select-resource-type">
                    <SelectValue placeholder="All resource types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All resource types</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="system_settings">System Settings</SelectItem>
                    <SelectItem value="access_control">Access Control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  data-testid="input-start-date"
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
              
              <div>
                <Label htmlFor="limit">Items Per Page</Label>
                <Select value={String(filters.limit)} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                  <SelectTrigger data-testid="select-limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={resetFilters} variant="outline" data-testid="button-reset-filters">
                Reset Filters
              </Button>
              <Button
                onClick={() => cleanupMutation.mutate(90)}
                variant="outline"
                disabled={cleanupMutation.isPending}
                data-testid="button-cleanup-logs"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cleanup (90+ days)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Trail
            {logsData && (
              <Badge variant="secondary">
                {logsData.pagination.totalItems} total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logsData?.logs?.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {logsData.logs.map((log: AuditLog) => (
                  <div
                    key={log.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getResourceTypeIcon(log.resourceType)}
                          <Badge className={getActionBadgeColor(log.action)}>
                            {log.action}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{formatUserName(log)}</span>
                          <span className="text-gray-500 ml-2">
                            performed action on {log.resourceType}
                            {log.resourceId && ` (ID: ${log.resourceId})`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                              data-testid={`button-view-log-${log.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Audit Log Details</DialogTitle>
                            </DialogHeader>
                            {selectedLog && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>User</Label>
                                    <p className="text-sm">{formatUserName(selectedLog)} ({selectedLog.email})</p>
                                  </div>
                                  <div>
                                    <Label>Action</Label>
                                    <p className="text-sm">{selectedLog.action}</p>
                                  </div>
                                  <div>
                                    <Label>Resource Type</Label>
                                    <p className="text-sm">{selectedLog.resourceType}</p>
                                  </div>
                                  <div>
                                    <Label>Resource ID</Label>
                                    <p className="text-sm">{selectedLog.resourceId || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label>IP Address</Label>
                                    <p className="text-sm">{selectedLog.ipAddress || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label>Timestamp</Label>
                                    <p className="text-sm">{format(new Date(selectedLog.createdAt), 'PPP pp')}</p>
                                  </div>
                                </div>
                                
                                {selectedLog.oldValues && (
                                  <div>
                                    <Label>Old Values</Label>
                                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                      {JSON.stringify(JSON.parse(selectedLog.oldValues), null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {selectedLog.newValues && (
                                  <div>
                                    <Label>New Values</Label>
                                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                      {JSON.stringify(JSON.parse(selectedLog.newValues), null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                {selectedLog.userAgent && (
                                  <div>
                                    <Label>User Agent</Label>
                                    <p className="text-xs text-gray-600">{selectedLog.userAgent}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    {log.ipAddress && (
                      <div className="mt-2 text-xs text-gray-500">
                        IP: {log.ipAddress}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {logsData.pagination && logsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Showing {((logsData.pagination.currentPage - 1) * logsData.pagination.itemsPerPage) + 1} to {Math.min(logsData.pagination.currentPage * logsData.pagination.itemsPerPage, logsData.pagination.totalItems)} of {logsData.pagination.totalItems} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                      disabled={!logsData.pagination.hasPreviousPage}
                      data-testid="button-previous-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {logsData.pagination.currentPage} of {logsData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                      disabled={!logsData.pagination.hasNextPage}
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs Found</h3>
              <p className="text-gray-600 mb-4">
                {Object.keys(filters).length > 2 
                  ? "No logs match your current filters. Try adjusting your search criteria."
                  : "No audit logs have been recorded yet."
                }
              </p>
              {Object.keys(filters).length > 2 && (
                <Button onClick={resetFilters} variant="outline" data-testid="button-clear-filters">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}