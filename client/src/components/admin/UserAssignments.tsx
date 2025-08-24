import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, UserCheck, UserX, Shield, Users } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  isApproved: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
}

export default function UserAssignments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState<string>('');

  // Fetch eligible users (approved and active)
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/super-admin/roles/users/eligible', userSearchTerm],
    queryFn: async () => {
      const response = await apiRequest(`/api/super-admin/roles/users/eligible?search=${userSearchTerm}`);
      return response.json();
    },
  });

  // Fetch roles for assignment
  const { data: rolesData } = useQuery({
    queryKey: ['/api/super-admin/roles'],
    queryFn: async () => {
      const response = await apiRequest('/api/super-admin/roles');
      return response.json();
    },
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number; roleId: number }) => {
      const response = await apiRequest('/api/super-admin/roles/assign', {
        method: 'POST',
        body: JSON.stringify({ userId, roleId }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/roles/users/eligible'] });
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedRoleForAssignment('');
      toast({ title: 'Success', description: 'Role assigned successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to assign role', variant: 'destructive' });
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('/api/super-admin/roles/remove', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/roles/users/eligible'] });
      toast({ title: 'Success', description: 'Role removed successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to remove role', variant: 'destructive' });
    },
  });

  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const handleConfirmAssign = () => {
    if (selectedUser && selectedRoleForAssignment) {
      assignRoleMutation.mutate({
        userId: selectedUser.id,
        roleId: parseInt(selectedRoleForAssignment)
      });
    }
  };

  const handleRemoveRole = (userId: number) => {
    if (confirm('Are you sure you want to remove this user\'s role? They will be set to the default user role.')) {
      removeRoleMutation.mutate(userId);
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin':
      case 'super administrator':
        return 'bg-red-100 text-red-800';
      case 'admin':
      case 'administrator':
        return 'bg-orange-100 text-orange-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'parent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const users = usersData?.users || [];
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData?.roles || []);

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Role Assignments
          </h2>
          <p className="text-gray-600">Assign roles to approved and active users</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-users"
            />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {usersLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Eligible Users Found</h3>
            <p className="text-gray-600">
              {userSearchTerm ? 'No users match your search criteria.' : 'No approved and active users available for role assignment.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user: User) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900" data-testid={`text-username-${user.id}`}>
                        {getUserDisplayName(user)}
                      </h3>
                      <p className="text-sm text-gray-600" data-testid={`text-email-${user.id}`}>
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`} data-testid={`badge-role-${user.id}`}>
                        {user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {user.status}
                    </Badge>
                    {user.isApproved && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        Approved
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssignRole(user)}
                      data-testid={`button-assign-role-${user.id}`}
                      className="flex items-center gap-1"
                    >
                      <UserCheck className="h-3 w-3" />
                      Assign Role
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveRole(user.id)}
                      data-testid={`button-remove-role-${user.id}`}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <UserX className="h-3 w-3" />
                      Remove Role
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Role Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">User Details</h4>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {getUserDisplayName(selectedUser)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current Role:</strong> {selectedUser.role}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Role
                </label>
                <Select value={selectedRoleForAssignment} onValueChange={setSelectedRoleForAssignment}>
                  <SelectTrigger data-testid="select-role-assignment">
                    <SelectValue placeholder="Choose a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: Role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{role.name}</div>
                            {role.description && (
                              <div className="text-sm text-gray-500">{role.description}</div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                  data-testid="button-cancel-assign"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAssign}
                  disabled={!selectedRoleForAssignment || assignRoleMutation.isPending}
                  data-testid="button-confirm-assign"
                >
                  {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}