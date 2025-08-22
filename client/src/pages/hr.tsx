import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/utils/formatters';
import { Plus, Search, Users, DollarSign, Calendar, Award, Mail, Phone, MapPin } from 'lucide-react';

export default function HR() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('staff');

  const teachers = dataService.getTeachers();
  
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const departments = Array.from(new Set(teachers.map(t => t.subjects?.[0] || 'General')));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalStaff: teachers.length,
    activeStaff: teachers.filter(t => t.status === 'active').length,
    onLeave: 0, // No 'on-leave' status in Teacher type
    averageSalary: teachers.length > 0 ? 
      Math.round(teachers.reduce((sum, t) => sum + (t.salary || 0), 0) / teachers.length) : 0
  };

  const handleAddStaff = () => {
    addToast('Staff addition feature coming soon!', 'info');
  };

  const handlePayroll = () => {
    addToast('Payroll management feature coming soon!', 'info');
  };

  const handleAttendance = () => {
    addToast('Staff attendance feature coming soon!', 'info');
  };

  return (
    <div className="space-y-8" data-testid="hr-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Human Resources
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage staff, payroll, and HR operations
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleAddStaff} data-testid="button-add-staff">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
          <Button onClick={handlePayroll} data-testid="button-payroll">
            <DollarSign className="w-4 h-4 mr-2" />
            Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Staff</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalStaff}</p>
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
                <p className="text-sm font-medium text-slate-600">Active Staff</p>
                <p className="text-3xl font-bold text-slate-800">{stats.activeStaff}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">On Leave</p>
                <p className="text-3xl font-bold text-slate-800">{stats.onLeave}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Salary</p>
                <p className="text-3xl font-bold text-slate-800">
                  {formatCurrency(stats.averageSalary)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-4">
            <Button
              variant={activeTab === 'staff' ? 'default' : 'outline'}
              onClick={() => setActiveTab('staff')}
              data-testid="tab-staff"
            >
              Staff Directory
            </Button>
            <Button
              variant={activeTab === 'attendance' ? 'default' : 'outline'}
              onClick={() => setActiveTab('attendance')}
              data-testid="tab-attendance"
            >
              Staff Attendance
            </Button>
            <Button
              variant={activeTab === 'payroll' ? 'default' : 'outline'}
              onClick={() => setActiveTab('payroll')}
              data-testid="tab-payroll"
            >
              Payroll
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-staff"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleAttendance} data-testid="button-mark-attendance">
              <Calendar className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Directory */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500" data-testid="text-no-staff">
                  No staff members found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-md transition-shadow" data-testid={`card-teacher-${teacher.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={teacher.avatar} alt={`${teacher.firstName} ${teacher.lastName}`} />
                        <AvatarFallback className="bg-primary-100 text-primary-700">
                          {teacher.firstName[0]}{teacher.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-800" data-testid={`text-teacher-name-${teacher.id}`}>
                          {teacher.firstName} {teacher.lastName}
                        </h3>
                        <p className="text-sm text-slate-600" data-testid={`text-teacher-id-${teacher.id}`}>
                          ID: {teacher.id}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(teacher.status)}>
                      {teacher.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600" data-testid={`text-teacher-subject-${teacher.id}`}>
                        {teacher.subjects?.join(', ') || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600" data-testid={`text-teacher-email-${teacher.id}`}>
                        {teacher.email}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600" data-testid={`text-teacher-phone-${teacher.id}`}>
                        {formatPhoneNumber(teacher.phone)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600" data-testid={`text-teacher-salary-${teacher.id}`}>
                        {formatCurrency(teacher.salary || 0)}/month
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Joined: {formatDate(teacher.createdAt)}</span>
                      <span>{teacher.experience || 0} years exp.</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-teacher-${teacher.id}`}>
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" data-testid={`button-edit-teacher-${teacher.id}`}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Staff Attendance */}
      {activeTab === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle>Staff Attendance - {formatDate(new Date().toISOString())}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round((stats.activeStaff / stats.totalStaff) * 100)}%
                    </p>
                    <p className="text-sm text-slate-600">Present Today</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.onLeave}</p>
                    <p className="text-sm text-slate-600">On Leave</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">8.5h</p>
                    <p className="text-sm text-slate-600">Avg. Hours</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p>Staff attendance tracking feature coming soon!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payroll */}
      {activeTab === 'payroll' && (
        <Card>
          <CardHeader>
            <CardTitle>Payroll Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(teachers.reduce((sum, t) => sum + (t.salary || 0), 0))}
                    </p>
                    <p className="text-sm text-slate-600">Total Monthly Payroll</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {teachers.filter(t => t.status === 'active').length}
                    </p>
                    <p className="text-sm text-slate-600">Staff to Pay</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatDate(new Date().toISOString())}
                    </p>
                    <p className="text-sm text-slate-600">Next Payroll Date</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center py-8 text-slate-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p>Detailed payroll management feature coming soon!</p>
                <Button className="mt-4" onClick={handlePayroll}>
                  Process Payroll
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
