import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Shield, Users, Settings, Search } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PermissionCategory {
  [key: string]: string[];
}

export default function RoleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [selectAllPermissions, setSelectAllPermissions] = useState(false);

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/super-admin/roles', searchTerm],
    queryFn: async () => {
      const response = await apiRequest(`/api/super-admin/roles?search=${searchTerm}`);
      const data = await response.json();
      console.log('Roles API Response:', data);
      console.log('Is Array:', Array.isArray(data));
      console.log('Array length:', data?.length);
      return data;
    },
  });

  // Fetch permissions
  const { data: permissionsData } = useQuery({
    queryKey: ['/api/super-admin/roles/permissions/list'],
    queryFn: async () => {
      const response = await apiRequest('/api/super-admin/roles/permissions/list');
      const data = await response.json();
      console.log('Permissions API Response:', data);
      return data;
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      const response = await apiRequest('/api/super-admin/roles', {
        method: 'POST',
        body: JSON.stringify(roleData),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/roles'] });
      queryClient.refetchQueries({ queryKey: ['/api/super-admin/roles'] });
      setShowCreateModal(false);
      setNewRole({ name: '', description: '', permissions: [] });
      toast({ title: 'Success', description: 'Role created successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create role',
        variant: 'destructive'
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      const response = await apiRequest(`/api/super-admin/roles/${roleData.id}`, {
        method: 'PUT',
        body: JSON.stringify(roleData),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/roles'] });
      queryClient.refetchQueries({ queryKey: ['/api/super-admin/roles'] });
      setShowEditModal(false);
      setEditingRole(null);
      toast({ title: 'Success', description: 'Role updated successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update role',
        variant: 'destructive'
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const response = await apiRequest(`/api/super-admin/roles/${roleId}`, {
        method: 'DELETE',
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/roles'] });
      queryClient.refetchQueries({ queryKey: ['/api/super-admin/roles'] });
      toast({ title: 'Success', description: 'Role deleted successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete role',
        variant: 'destructive'
      });
    },
  });

  // Toggle role status mutation
  const toggleRoleStatusMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const response = await apiRequest(`/api/super-admin/roles/${roleId}/toggle-status`, {
        method: 'PATCH',
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/roles'] });
      queryClient.refetchQueries({ queryKey: ['/api/super-admin/roles'] });
      toast({ title: 'Success', description: 'Role status updated successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update role status',
        variant: 'destructive'
      });
    },
  });

  // Initialize default roles mutation
  const initializeRolesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/super-admin/roles/initialize', {
        method: 'POST',
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/roles'] });
      toast({ title: 'Success', description: 'Default roles initialized successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to initialize roles',
        variant: 'destructive'
      });
    },
  });

  const handleCreateRole = () => {
    if (newRole.name.trim()) {
      createRoleMutation.mutate(newRole);
    }
  };

  const handleUpdateRole = () => {
    if (editingRole && editingRole.name.trim()) {
      updateRoleMutation.mutate(editingRole);
    }
  };

  const handleDeleteRole = (roleId: number) => {
    if (confirm('Are you sure you want to permanently delete this role? This action cannot be undone.')) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleToggleRoleStatus = (roleId: number) => {
    toggleRoleStatusMutation.mutate(roleId);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole({ ...role });
    setShowEditModal(true);
  };

  const handlePermissionToggle = (permission: string, isCreating: boolean = false) => {
    if (isCreating) {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    } else if (editingRole) {
      setEditingRole(prev => prev ? {
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      } : null);
    }
  };

  const handleSelectAllPermissions = (isCreating: boolean = false) => {
    const allPermissions = permissionsData?.permissions || [];
    if (isCreating) {
      if (newRole.permissions.length === allPermissions.length) {
        setNewRole(prev => ({ ...prev, permissions: [] }));
        setSelectAllPermissions(false);
      } else {
        setNewRole(prev => ({ ...prev, permissions: [...allPermissions] }));
        setSelectAllPermissions(true);
      }
    } else if (editingRole) {
      if (editingRole.permissions.length === allPermissions.length) {
        setEditingRole(prev => prev ? ({ ...prev, permissions: [] }) : null);
      } else {
        setEditingRole(prev => prev ? ({ ...prev, permissions: [...allPermissions] }) : null);
      }
    }
  };

  const handleSelectCategoryPermissions = (categoryPermissions: string[], isCreating: boolean = false) => {
    if (isCreating) {
      const hasAllCategoryPerms = categoryPermissions.every(perm => newRole.permissions.includes(perm));
      if (hasAllCategoryPerms) {
        setNewRole(prev => ({
          ...prev,
          permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
        }));
      } else {
        setNewRole(prev => ({
          ...prev,
          permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
        }));
      }
    } else if (editingRole) {
      const hasAllCategoryPerms = categoryPermissions.every(perm => editingRole.permissions.includes(perm));
      if (hasAllCategoryPerms) {
        setEditingRole(prev => prev ? ({
          ...prev,
          permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
        }) : null);
      } else {
        setEditingRole(prev => prev ? ({
          ...prev,
          permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
        }) : null);
      }
    }
  };

  const PermissionSelector = ({ 
    selectedPermissions, 
    onToggle, 
    categories,
    onSelectAll,
    onSelectCategory,
    isCreating = false
  }: { 
    selectedPermissions: string[], 
    onToggle: (permission: string) => void,
    categories: PermissionCategory,
    onSelectAll: () => void,
    onSelectCategory: (categoryPermissions: string[]) => void,
    isCreating?: boolean
  }) => {
    const allPermissions = Object.values(categories).flat();
    const isAllSelected = allPermissions.every(perm => selectedPermissions.includes(perm));
    
    return (
      <div className="space-y-6">
        {/* Global Select All */}
        <div className="border-b pb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all-permissions"
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all-permissions" className="font-semibold text-gray-900">
              Select All Permissions ({selectedPermissions.length}/{allPermissions.length})
            </Label>
          </div>
        </div>

        {Object.entries(categories).map(([category, permissions]) => {
          const categorySelected = permissions.every(perm => selectedPermissions.includes(perm));
          const categoryPartiallySelected = permissions.some(perm => selectedPermissions.includes(perm));
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-gray-900">{category}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`select-${category}`}
                    checked={categorySelected}
                    ref={(el) => {
                      if (el) el.indeterminate = categoryPartiallySelected && !categorySelected;
                    }}
                    onCheckedChange={() => onSelectCategory(permissions)}
                  />
                  <Label htmlFor={`select-${category}`} className="text-sm font-medium">
                    Select All
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pl-6">
                {permissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={selectedPermissions.includes(permission)}
                      onCheckedChange={() => onToggle(permission)}
                    />
                    <Label htmlFor={permission} className="text-sm text-gray-600">
                      {permission.replace(/[_:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (rolesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="role-management">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => initializeRolesMutation.mutate()}
            variant="outline"
            disabled={initializeRolesMutation.isPending}
            data-testid="button-initialize-roles"
          >
            <Settings className="w-4 h-4 mr-2" />
            Initialize Default Roles
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-role">
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                    data-testid="input-role-name"
                  />
                </div>
                <div>
                  <Label htmlFor="role-description">Description</Label>
                  <Textarea
                    id="role-description"
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter role description"
                    data-testid="textarea-role-description"
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  {permissionsData?.categories && (
                    <PermissionSelector
                      selectedPermissions={newRole.permissions}
                      onToggle={(permission) => handlePermissionToggle(permission, true)}
                      categories={permissionsData.categories}
                      onSelectAll={() => handleSelectAllPermissions(true)}
                      onSelectCategory={(categoryPermissions) => handleSelectCategoryPermissions(categoryPermissions, true)}
                      isCreating={true}
                    />
                  )}
                  {!permissionsData?.categories && (
                    <div className="text-center py-4 text-gray-500">
                      Loading permissions...
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRole}
                    disabled={createRoleMutation.isPending || !newRole.name.trim()}
                    data-testid="button-save-role"
                  >
                    {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-roles"
          />
        </div>
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(rolesData) ? rolesData : []).map((role: Role) => (
          <Card key={role.id} className="h-full" data-testid={`role-card-${role.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{role.name}</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant={role.isActive ? 'default' : 'secondary'}>
                    {role.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              {role.description && (
                <p className="text-sm text-gray-600">{role.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Permissions ({role.permissions?.length || 0})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {role.permissions?.slice(0, 6).map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission.replace(/[_:]/g, ' ')}
                    </Badge>
                  ))}
                  {role.permissions?.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Created: {new Date(role.createdAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditRole(role)}
                    data-testid={`button-edit-role-${role.id}`}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={role.isActive ? "secondary" : "default"}
                    onClick={() => handleToggleRoleStatus(role.id)}
                    data-testid={`button-toggle-role-${role.id}`}
                  >
                    {role.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteRole(role.id)}
                    data-testid={`button-delete-role-${role.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <Label htmlFor="edit-role-description">Description</Label>
                <Textarea
                  id="edit-role-description"
                  value={editingRole.description || ''}
                  onChange={(e) => setEditingRole(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  placeholder="Enter role description"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                {permissionsData?.categories && (
                  <PermissionSelector
                    selectedPermissions={editingRole.permissions || []}
                    onToggle={(permission) => handlePermissionToggle(permission, false)}
                    categories={permissionsData.categories}
                    onSelectAll={() => handleSelectAllPermissions(false)}
                    onSelectCategory={(categoryPermissions) => handleSelectCategoryPermissions(categoryPermissions, false)}
                    isCreating={false}
                  />
                )}
                {!permissionsData?.categories && (
                  <div className="text-center py-4 text-gray-500">
                    Loading permissions...
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateRole}
                  disabled={updateRoleMutation.isPending || !editingRole.name.trim()}
                >
                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {(!rolesLoading && (!rolesData || (Array.isArray(rolesData) && rolesData.length === 0))) && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first role or initializing default roles.</p>
            <Button
              onClick={() => initializeRolesMutation.mutate()}
              disabled={initializeRolesMutation.isPending}
            >
              Initialize Default Roles
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}