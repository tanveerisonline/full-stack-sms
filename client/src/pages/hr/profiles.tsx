import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  GraduationCap,
  DollarSign,
  Building,
  User
} from 'lucide-react';

interface Teacher {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  department: string;
  subject: string;
  qualification: string;
  experience: number;
  salary: number;
  hireDate: string;
  status: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TeacherProfiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch teachers
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['/api/teachers'],
  });

  // Type assertion for better TypeScript support
  const teachersData = teachers as Teacher[];

  // Filter teachers based on search
  const filteredTeachers = teachersData.filter((teacher: Teacher) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      teacher.firstName.toLowerCase().includes(searchLower) ||
      teacher.lastName.toLowerCase().includes(searchLower) ||
      teacher.email.toLowerCase().includes(searchLower) ||
      teacher.employeeId.toLowerCase().includes(searchLower) ||
      teacher.department.toLowerCase().includes(searchLower)
    );
  });

  const handleViewProfile = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowProfileModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="text-profiles-title">
            Teacher Profiles
          </h1>
          <p className="text-gray-600">View detailed profiles and information of all teachers</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search teachers by name, email, employee ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-teachers"
              />
            </div>
          </CardContent>
        </Card>

        {/* Teachers Grid */}
        {isLoadingTeachers ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading teacher profiles...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No teachers found</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher: Teacher) => (
              <Card key={teacher.id} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-teacher-${teacher.id}`}>
                <CardContent className="p-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {teacher.avatar ? (
                        <img
                          src={teacher.avatar}
                          alt={`${teacher.firstName} ${teacher.lastName}`}
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-lg">
                            {teacher.firstName[0]}{teacher.lastName[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {teacher.employeeId}</p>
                      <Badge 
                        variant={teacher.status === 'active' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {teacher.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{teacher.department}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{teacher.subject}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{teacher.phone}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleViewProfile(teacher)}
                    className="w-full"
                    variant="outline"
                    data-testid={`button-view-profile-${teacher.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Profile Details Modal */}
        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-teacher-profile">
            <DialogHeader>
              <DialogTitle data-testid="text-modal-title">
                Teacher Profile Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedTeacher && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {selectedTeacher.avatar ? (
                      <img
                        src={selectedTeacher.avatar}
                        alt={`${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow">
                        <span className="text-gray-600 font-medium text-2xl">
                          {selectedTeacher.firstName[0]}{selectedTeacher.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </h2>
                    <p className="text-gray-600">Employee ID: {selectedTeacher.employeeId}</p>
                    <div className="mt-2">
                      <Badge 
                        variant={selectedTeacher.status === 'active' ? 'default' : 'secondary'}
                        className="text-sm"
                      >
                        {selectedTeacher.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{new Date(selectedTeacher.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <div className="flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedTeacher.email}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <div className="flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedTeacher.phone}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedTeacher.address}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Professional Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <div className="flex items-center mt-1">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedTeacher.department}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Subject</label>
                        <div className="flex items-center mt-1">
                          <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedTeacher.subject}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Qualification</label>
                        <p className="mt-1">{selectedTeacher.qualification}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Experience</label>
                        <p className="mt-1">{selectedTeacher.experience} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Hire Date</label>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{new Date(selectedTeacher.hireDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Salary</label>
                        <div className="flex items-center mt-1">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          <span>${selectedTeacher.salary.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}