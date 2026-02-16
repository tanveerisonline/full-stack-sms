import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StudentProfileModal } from '@/components/features/student';
import { useStudents } from '@/hooks/features/student';
import { formatDate, formatPhoneNumber } from '@/utils/formatters';
import { exportToCSV } from '@/utils/csvExport';
import { useToast } from '@/components/Common/Toast';
import { Search, Mail, Phone, MapPin, Calendar, User, Download } from 'lucide-react';

export default function StudentProfiles() {
  const { students } = useStudents();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
   student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewProfile = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleExportProfiles = () => {
    try {
      const exportData = filteredStudents.map(student => ({
        'Student ID': student.rollNumber,
        'Name': `${student.firstName} ${student.lastName}`,
        'Email': student.email,
        'Phone': student.phone,
        'Grade': student.grade,
        'Status': student.status,
        'Parent Name': student.parentName,
        'Address': student.address,
        'Date of Birth': formatDate(student.dateOfBirth),
        'Enrollment Date': formatDate(student.createdAt)
      }));
      
      exportToCSV(exportData, 'student_profiles');
      addToast('Student profiles exported successfully!', 'success');
    } catch (error) {
      addToast('Failed to export student profiles.', 'error');
    }
  };

  return (
    <div className="space-y-8" data-testid="student-profiles-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Student Profiles
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            View and manage detailed student information
          </p>
        </div>
        <Button variant="outline" onClick={handleExportProfiles} data-testid="button-export-profiles">
          <Download className="w-4 h-4 mr-2" />
          Export Profiles
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search students by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-profiles"
            />
          </div>
        </CardContent>
      </Card>

      {/* Student Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-slate-500" data-testid="text-no-students">
                No students found matching your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow" data-testid={`card-student-profile-${student.id}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={student.avatar || undefined} alt={`${student.firstName} ${student.lastName}`} />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-800" data-testid={`text-student-name-${student.id}`}>
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-slate-600" data-testid={`text-student-roll-${student.id}`}>
                        {student.rollNumber}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600" data-testid={`text-student-email-${student.id}`}>
                      {student.email}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600" data-testid={`text-student-phone-${student.id}`}>
                      {formatPhoneNumber(student.phone)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600" data-testid={`text-student-grade-${student.id}`}>
                      {student.grade}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 truncate" data-testid={`text-student-address-${student.id}`} title={student.address || undefined}>
                      {student.address}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600" data-testid={`text-student-parent-${student.id}`}>
                      {student.parentName}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Enrolled: {formatDate(student.createdAt)}</span>
                    <span>DOB: {formatDate(student.dateOfBirth)}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleViewProfile(student)}
                  data-testid={`button-view-profile-${student.id}`}
                >
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
