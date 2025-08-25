import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/formatters';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  GraduationCap,
  Briefcase,
  DollarSign,
  Edit,
  Printer,
  Download,
  X
} from 'lucide-react';
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

interface TeacherDetailModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (teacher: Teacher) => void;
}

function TeacherDetailModal({ teacher, isOpen, onClose, onEdit }: TeacherDetailModalProps) {
  if (!teacher) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = () => {
    onEdit?.(teacher);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Simple export functionality - could be enhanced
    const teacherData = {
      name: `${teacher.firstName} ${teacher.lastName}`,
      employeeId: (teacher as any).employeeId,
      email: teacher.email,
      phone: teacher.phone,
      department: (teacher as any).department,
      subject: (teacher as any).subject,
      status: teacher.status,
    };
    
    const dataStr = JSON.stringify(teacherData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teacher-${teacher.firstName}-${teacher.lastName}.json`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-teacher-detail">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Teacher Profile
            </DialogTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print-profile">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-profile">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleEdit} data-testid="button-edit-teacher">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Teacher Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={teacher.avatar ? convertToLocalUrl(teacher.avatar) : undefined} 
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                  />
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
                    {teacher.firstName[0]}{teacher.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800" data-testid="text-teacher-full-name">
                        {teacher.firstName} {teacher.lastName}
                      </h2>
                      <p className="text-slate-600" data-testid="text-teacher-id">
                        Employee ID: {(teacher as any).employeeId || 'N/A'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(teacher.status)}>
                      {teacher.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Department:</span>
                      <span className="font-medium text-slate-800" data-testid="text-teacher-department">
                        {(teacher as any).department || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Subject:</span>
                      <span className="font-medium text-slate-800" data-testid="text-teacher-subject">
                        {(teacher as any).subject || teacher.subjects?.join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" data-testid="tab-personal-info">Personal</TabsTrigger>
              <TabsTrigger value="professional" data-testid="tab-professional-info">Professional</TabsTrigger>
              <TabsTrigger value="contact" data-testid="tab-contact-info">Contact</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Personal Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Full Name</label>
                      <p className="text-slate-800" data-testid="text-full-name">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-600">Date of Birth</label>
                      <p className="text-slate-800" data-testid="text-date-of-birth">
                        {(teacher as any).dateOfBirth ? formatDate((teacher as any).dateOfBirth) : 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-800" data-testid="text-email">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-800" data-testid="text-phone">
                          {teacher.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-600">Address</label>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <p className="text-slate-800" data-testid="text-address">
                          {(teacher as any).address || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Information */}
            <TabsContent value="professional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Professional Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Department</label>
                      <p className="text-slate-800" data-testid="text-department">
                        {(teacher as any).department || 'Not assigned'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Subject(s)</label>
                      <p className="text-slate-800" data-testid="text-subjects">
                        {(teacher as any).subject || teacher.subjects?.join(', ') || 'Not assigned'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Qualification</label>
                      <p className="text-slate-800" data-testid="text-qualification">
                        {(teacher as any).qualification || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Experience</label>
                      <p className="text-slate-800" data-testid="text-experience">
                        {(teacher as any).experience ? `${(teacher as any).experience} years` : 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Hire Date</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-800" data-testid="text-hire-date">
                          {(teacher as any).hireDate ? formatDate((teacher as any).hireDate) : 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Salary</label>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-800" data-testid="text-salary">
                          {(teacher as any).salary ? `$${(teacher as any).salary}` : 'Not disclosed'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information */}
            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Primary Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-800" data-testid="text-primary-email">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Phone Number</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-800" data-testid="text-primary-phone">
                          {teacher.phone || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Address</label>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-slate-800" data-testid="text-full-address">
                            {(teacher as any).address || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TeacherDetailModal;