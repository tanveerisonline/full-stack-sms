import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Download, 
  Upload,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Shield,
  Info,
  FileText,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface Backup {
  filename: string;
  name: string;
  description: string;
  size: number;
  createdAt: string;
  lastModified: string;
  createdBy: number | null;
  createdByUsername: string;
  isPreRestore?: boolean;
}

interface BackupStatus {
  status: string;
  backupCount: number;
  totalSize: number;
  backupDirectory: string;
  pgDumpAvailable: boolean;
  pgRestoreAvailable: boolean;
  databaseConnected: boolean;
  maxBackupAge: number;
  maxBackupCount: number;
}

export default function BackupRestore() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');

  // Fetch backups
  const { data: backupsData, isLoading: backupsLoading } = useQuery({
    queryKey: ['/api/super-admin/backup'],
    queryFn: async () => {
      const response = await apiRequest('/api/super-admin/backup');
      return response.json();
    },
  });

  // Fetch backup status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/super-admin/backup/status'],
    queryFn: async () => {
      const response = await apiRequest('/api/super-admin/backup/status');
      return response.json() as Promise<BackupStatus>;
    },
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async (data: { name?: string; description?: string }) => {
      const response = await apiRequest('/api/super-admin/backup/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/backup'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/backup/status'] });
      setCreateDialogOpen(false);
      setBackupName('');
      setBackupDescription('');
      toast({ title: 'Success', description: 'Database backup created successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create backup',
        variant: 'destructive'
      });
    },
  });

  // Restore backup mutation
  const restoreBackupMutation = useMutation({
    mutationFn: async (data: { filename: string; confirmRestore: boolean }) => {
      const response = await apiRequest('/api/super-admin/backup/restore', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/backup'] });
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
      setConfirmRestore(false);
      toast({ 
        title: 'Success', 
        description: 'Database restored successfully! A pre-restore backup was created automatically.',
        duration: 7000
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to restore backup',
        variant: 'destructive'
      });
    },
  });

  // Download backup mutation
  const downloadBackupMutation = useMutation({
    mutationFn: async (filename: string) => {
      const response = await apiRequest(`/api/super-admin/backup/download/${filename}`);
      return { response, filename };
    },
    onSuccess: async ({ response, filename }) => {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: 'Success', description: 'Backup downloaded successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to download backup',
        variant: 'destructive'
      });
    },
  });

  // Delete backup mutation
  const deleteBackupMutation = useMutation({
    mutationFn: async (filename: string) => {
      const response = await apiRequest(`/api/super-admin/backup/${filename}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/backup'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/backup/status'] });
      toast({ title: 'Success', description: 'Backup deleted successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete backup',
        variant: 'destructive'
      });
    },
  });

  // Cleanup backups mutation
  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/super-admin/backup/cleanup', {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/backup'] });
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/backup/status'] });
      toast({ title: 'Success', description: 'Old backups cleaned up successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to cleanup backups',
        variant: 'destructive'
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: BackupStatus) => {
    if (!status.databaseConnected) return 'bg-red-100 text-red-800';
    if (!status.pgDumpAvailable || !status.pgRestoreAvailable) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (status: BackupStatus) => {
    if (!status.databaseConnected) return 'Database Disconnected';
    if (!status.pgDumpAvailable || !status.pgRestoreAvailable) return 'Tools Missing';
    return 'Operational';
  };

  if (backupsLoading || statusLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
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
          <h2 className="text-2xl font-bold text-gray-900">Backup & Restore</h2>
          <p className="text-gray-600">Manage database backups and restore operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-backup">
                <Database className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Database Backup</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="backup-name">Backup Name (Optional)</Label>
                  <Input
                    id="backup-name"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    placeholder="e.g., Monthly Backup"
                    data-testid="input-backup-name"
                  />
                </div>
                <div>
                  <Label htmlFor="backup-description">Description (Optional)</Label>
                  <Textarea
                    id="backup-description"
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                    placeholder="Describe this backup..."
                    data-testid="textarea-backup-description"
                  />
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This will create a complete backup of all database tables and data. 
                    The process may take a few minutes depending on the database size.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  data-testid="button-cancel-backup"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createBackupMutation.mutate({ 
                    name: backupName || undefined, 
                    description: backupDescription || undefined 
                  })}
                  disabled={createBackupMutation.isPending}
                  data-testid="button-confirm-backup"
                >
                  {createBackupMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Create Backup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="outline"
            onClick={() => cleanupMutation.mutate()}
            disabled={cleanupMutation.isPending}
            data-testid="button-cleanup-backups"
          >
            {cleanupMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Cleanup Old
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      {statusData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <Badge className={getStatusColor(statusData)}>
                    {getStatusText(statusData)}
                  </Badge>
                </div>
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Backups</p>
                  <p className="text-2xl font-bold">{statusData.backupCount}</p>
                </div>
                <Database className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold">{formatFileSize(statusData.totalSize)}</p>
                </div>
                <HardDrive className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Retention</p>
                  <p className="text-lg font-bold">{statusData.maxBackupAge} days</p>
                  <p className="text-xs text-gray-500">Max {statusData.maxBackupCount} files</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Requirements Check */}
      {statusData && (!statusData.pgDumpAvailable || !statusData.pgRestoreAvailable || !statusData.databaseConnected) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">System Requirements Issues:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {!statusData.databaseConnected && <li>Database connection failed</li>}
                {!statusData.pgDumpAvailable && <li>pg_dump tool not available</li>}
                {!statusData.pgRestoreAvailable && <li>pg_restore tool not available</li>}
              </ul>
              <p className="text-sm">Please contact your system administrator to resolve these issues.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Available Backups
            {backupsData && (
              <Badge variant="secondary">
                {backupsData.backups.length} backups
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backupsData?.backups?.length > 0 ? (
            <div className="space-y-4">
              {backupsData.backups.map((backup: Backup) => (
                <div
                  key={backup.filename}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{backup.name}</h3>
                        {backup.isPreRestore && (
                          <Badge variant="outline" className="text-xs">
                            Pre-restore
                          </Badge>
                        )}
                      </div>
                      {backup.description && (
                        <p className="text-sm text-gray-600 mb-2">{backup.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(backup.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {formatFileSize(backup.size)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {backup.createdByUsername}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBackupMutation.mutate(backup.filename)}
                        disabled={downloadBackupMutation.isPending}
                        data-testid={`button-download-${backup.filename}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBackup(backup)}
                            disabled={!statusData?.databaseConnected || !statusData?.pgRestoreAvailable}
                            data-testid={`button-restore-${backup.filename}`}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              Restore Database
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Warning:</strong> This will completely replace your current database 
                                with the backup data. All current data will be lost. A pre-restore backup 
                                will be created automatically.
                              </AlertDescription>
                            </Alert>
                            
                            {selectedBackup && (
                              <div className="space-y-2">
                                <p><strong>Backup:</strong> {selectedBackup.name}</p>
                                <p><strong>Created:</strong> {format(new Date(selectedBackup.createdAt), 'PPP pp')}</p>
                                <p><strong>Size:</strong> {formatFileSize(selectedBackup.size)}</p>
                                {selectedBackup.description && (
                                  <p><strong>Description:</strong> {selectedBackup.description}</p>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="confirm-restore"
                                checked={confirmRestore}
                                onChange={(e) => setConfirmRestore(e.target.checked)}
                                className="rounded"
                              />
                              <label htmlFor="confirm-restore" className="text-sm">
                                I understand this will replace all current data
                              </label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedBackup(null);
                                setConfirmRestore(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                if (selectedBackup) {
                                  restoreBackupMutation.mutate({
                                    filename: selectedBackup.filename,
                                    confirmRestore: true
                                  });
                                }
                              }}
                              disabled={!confirmRestore || restoreBackupMutation.isPending}
                              data-testid="button-confirm-restore"
                            >
                              {restoreBackupMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                              Restore Database
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBackupMutation.mutate(backup.filename)}
                        disabled={deleteBackupMutation.isPending}
                        data-testid={`button-delete-${backup.filename}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Backups Found</h3>
              <p className="text-gray-600 mb-4">Create your first database backup to get started.</p>
              <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-backup">
                <Database className="w-4 h-4 mr-2" />
                Create First Backup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}