import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Search, 
  Users, 
  GraduationCap,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download
} from 'lucide-react';
import StaffForm from '@/components/features/staff/StaffForm';
import TeacherDetailModal from '@/components/features/staff/TeacherDetailModal';
import type { Teacher } from '@shared/schema';

// Convert Google Storage private URLs to local serving URLs
const convertToLocalUrl = (url: string): string => {
  if (!url) return '';
  
  // Check if it's a Google Storage private URL
  if (url.includes('storage.googleapis.com') && url.includes('/.private/')) {
    // Extract the path after /.private/
    const privatePath = url.split('/.private/')[1];
    return `/objects/${privatePath}`;
  }
  
  return url;
};

export default function HR() {
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch teachers
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['/api/teachers'],
  });

  // Fetch teacher statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/teachers/stats'],
  });

  // Type assertions for better TypeScript support
  const teachersData = teachers as Teacher[];
  const statsData = stats as any;

  // Add teacher mutation
  const addTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      return apiRequest('/api/teachers', {
        method: 'POST',
        body: teacherData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Teacher Added",
        description: "New teacher has been registered successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers/stats'] });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register teacher. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: async (teacherData: any) => {
      return apiRequest(`/api/teachers/${editingTeacher?.id}`, {
        method: 'PUT',
        body: teacherData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Teacher Updated",
        description: "Teacher information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      setEditingTeacher(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update teacher. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      return apiRequest(`/api/teachers/${teacherId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Teacher Deleted",
        description: "Teacher has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/teachers/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete teacher. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      deleteTeacherMutation.mutate(teacherId);
    }
  };

  const handleViewTeacher = (teacher: Teacher) => {
    console.log('View teacher:', teacher);
    setViewingTeacher(teacher);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTeacher(null);
  };

  const handleSubmitTeacher = (data: any) => {
    // Ensure data is properly serialized
    const teacherData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      employeeId: data.employeeId,
      department: data.department,
      subject: data.subject,
      qualification: data.qualification,
      experience: Number(data.experience) || 0,
      salary: Number(data.salary) || 0,
      hireDate: data.hireDate,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      avatar: data.avatar || '',
      status: data.status || 'active'
    };

    if (editingTeacher) {
      updateTeacherMutation.mutate(teacherData);
    } else {
      addTeacherMutation.mutate(teacherData);
    }
  };

  // Filter teachers based on search and filters
  const filteredTeachers = Array.isArray(teachersData) ? teachersData.filter((teacher: Teacher) => {
    const matchesSearch = 
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher as any).employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filterDepartment || (teacher as any).department === filterDepartment;
    const matchesStatus = !filterStatus || teacher.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  }) : [];

  const departments = Array.isArray(teachersData) ? Array.from(new Set(teachersData.map((t: Teacher) => (t as any).department).filter(Boolean))) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="text-hr-title">
              Teacher Management
            </h1>
            <p className="text-gray-600">Manage faculty members and staff registration</p>
          </div>
          <Button 
            onClick={handleAddTeacher}
            className="flex items-center gap-2"
            data-testid="button-add-teacher"
          >
            <UserPlus className="h-4 w-4" />
            Add New Teacher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-total-teachers">
                    {statsData?.total || (Array.isArray(teachersData) ? teachersData.length : 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-active-teachers">
                    {statsData?.active || (Array.isArray(teachersData) ? teachersData.filter((t: Teacher) => t.status === 'active').length : 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-departments-count">
                    {departments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-new-teachers">
                    {statsData?.newThisMonth || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-teachers"
                />
              </div>
              
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="select-filter-department"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="select-filter-status"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers List ({filteredTeachers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTeachers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading teachers...</p>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No teachers found</p>
                <p className="text-gray-500">Start by adding your first teacher</p>
                <Button 
                  onClick={handleAddTeacher} 
                  className="mt-4"
                  data-testid="button-add-first-teacher"
                >
                  Add First Teacher
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTeachers.map((teacher: Teacher) => (
                      <tr key={teacher.id} data-testid={`row-teacher-${teacher.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {teacher.avatar ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={convertToLocalUrl(teacher.avatar)}
                                  alt={`${teacher.firstName} ${teacher.lastName}`}
                                  onError={(e) => {
                                    console.log('Teacher avatar failed to load:', teacher.avatar);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-gray-600 font-medium">
                                    {teacher.firstName[0]}{teacher.lastName[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {teacher.firstName} {teacher.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {(teacher as any).employeeId || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{teacher.email}</div>
                          <div className="text-sm text-gray-500">{teacher.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{(teacher as any).department || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{(teacher as any).subject || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={teacher.status === 'active' ? 'default' : 'secondary'}
                            data-testid={`badge-status-${teacher.id}`}
                          >
                            {teacher.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTeacher(teacher)}
                              data-testid={`button-view-${teacher.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTeacher(teacher)}
                              data-testid={`button-edit-${teacher.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTeacher(String(teacher.id))}
                              className="text-red-600 hover:text-red-900"
                              data-testid={`button-delete-${teacher.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teacher Form Modal */}
        <StaffForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitTeacher}
          teacher={editingTeacher}
          isLoading={addTeacherMutation.isPending || updateTeacherMutation.isPending}
        />

        {/* Teacher Detail Modal */}
        <TeacherDetailModal
          teacher={viewingTeacher}
          isOpen={!!viewingTeacher}
          onClose={() => setViewingTeacher(null)}
          onEdit={handleEditTeacher}
        />
      </div>
    </div>
  );
}