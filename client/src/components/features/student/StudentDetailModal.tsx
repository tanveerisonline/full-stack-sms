import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Student } from '@/types';
import { formatDate, formatPhoneNumber } from '@/utils/formatters';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  GraduationCap,
  Users,
  Edit,
  Printer,
  Download
} from 'lucide-react';

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

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (student: Student) => void;
}

function StudentDetailModal({ student, isOpen, onClose, onEdit }: StudentDetailModalProps) {
  if (!student) return null;

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

  const handleEdit = () => {
    if (onEdit) {
      onEdit(student);
    }
    onClose();
  };

  // Mock additional data that would come from related services
  const attendanceData = {
    totalDays: 180,
    presentDays: 170,
    absentDays: 7,
    lateDays: 3,
    attendanceRate: 94.4
  };

  const gradeData = [
    { subject: 'Mathematics', grade: 'A', marks: '92/100' },
    { subject: 'English', grade: 'B+', marks: '87/100' },
    { subject: 'Science', grade: 'A-', marks: '89/100' },
    { subject: 'History', grade: 'B', marks: '82/100' },
    { subject: 'Physical Education', grade: 'A', marks: '95/100' }
  ];

  const recentActivities = [
    { date: '2024-02-15', activity: 'Submitted Mathematics Assignment', type: 'academic' },
    { date: '2024-02-14', activity: 'Attended Parent-Teacher Meeting', type: 'meeting' },
    { date: '2024-02-13', activity: 'Participated in Science Fair', type: 'event' },
    { date: '2024-02-12', activity: 'Library Book Borrowed: "Advanced Physics"', type: 'library' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-student-detail">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Student Profile
            </DialogTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" data-testid="button-print-profile">
                <Printer className="w-4 h-4 mr-2" />
                Printer
              </Button>
              <Button variant="outline" size="sm" data-testid="button-download-profile">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleEdit} data-testid="button-edit-student">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={student.avatar ? convertToLocalUrl(student.avatar) : undefined} 
                    alt={`${student.firstName} ${student.lastName}`}
                    onError={(e) => {
                      console.log('Avatar image failed to load:', student.avatar);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
                    {student.firstName[0]}{student.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800" data-testid="text-student-full-name">
                        {student.firstName} {student.lastName}
                      </h2>
                      <p className="text-slate-600" data-testid="text-student-id">
                        Student ID: {student.rollNumber}
                      </p>
                    </div>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Grade:</span>
                      <span className="font-medium text-slate-800" data-testid="text-student-grade">
                        {student.grade}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Enrolled:</span>
                      <span className="font-medium text-slate-800" data-testid="text-enrollment-date">
                        {formatDate(student.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" data-testid="tab-personal">Personal Info</TabsTrigger>
              <TabsTrigger value="academic" data-testid="tab-academic">Academic</TabsTrigger>
              <TabsTrigger value="attendance" data-testid="tab-attendance">Attendance</TabsTrigger>
              <TabsTrigger value="activities" data-testid="tab-activities">Activities</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Personal Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Full Name</label>
                      <p className="text-slate-800" data-testid="text-personal-name">
                        {student.firstName} {student.lastName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                      <p className="text-slate-800" data-testid="text-personal-dob">
                        {formatDate(student.dateOfBirth)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-800" data-testid="text-personal-email">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-800" data-testid="text-personal-phone">
                          {formatPhoneNumber(student.phone)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700">Address</label>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                        <p className="text-slate-800" data-testid="text-personal-address">
                          {student.address}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Guardian Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Guardian Name</label>
                      <p className="text-slate-800" data-testid="text-guardian-name">
                        {student.parentName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700">Contact Number</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-800" data-testid="text-guardian-contact">
                          {formatPhoneNumber(student.parentContact)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700">Relationship</label>
                      <p className="text-slate-800">Parent/Guardian</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700">Emergency Contact</label>
                      <p className="text-slate-800">Same as above</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Academic Information */}
            <TabsContent value="academic" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Grades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {gradeData.map((grade, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-800" data-testid={`text-subject-${index}`}>
                              {grade.subject}
                            </p>
                            <p className="text-sm text-slate-600" data-testid={`text-marks-${index}`}>
                              {grade.marks}
                            </p>
                          </div>
                          <Badge 
                            className={grade.grade.startsWith('A') ? 'bg-green-100 text-green-800' : 
                                     grade.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' : 
                                     'bg-yellow-100 text-yellow-800'}
                            data-testid={`badge-grade-${index}`}
                          >
                            {grade.grade}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Academic Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Overall GPA:</span>
                      <span className="font-semibold text-slate-800">3.8/4.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Class Rank:</span>
                      <span className="font-semibold text-slate-800">5th out of 45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subjects Enrolled:</span>
                      <span className="font-semibold text-slate-800">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Credits Earned:</span>
                      <span className="font-semibold text-slate-800">28/30</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Attendance */}
            <TabsContent value="attendance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600" data-testid="text-attendance-rate">
                        {attendanceData.attendanceRate}%
                      </div>
                      <p className="text-sm text-slate-600">Overall Attendance Rate</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total School Days:</span>
                        <span className="font-semibold text-slate-800" data-testid="text-total-days">
                          {attendanceData.totalDays}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Days Present:</span>
                        <span className="font-semibold text-green-600" data-testid="text-present-days">
                          {attendanceData.presentDays}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Days Absent:</span>
                        <span className="font-semibold text-red-600" data-testid="text-absent-days">
                          {attendanceData.absentDays}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Late Arrivals:</span>
                        <span className="font-semibold text-yellow-600" data-testid="text-late-days">
                          {attendanceData.lateDays}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p>Attendance chart will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activities */}
            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'academic' ? 'bg-blue-500' :
                          activity.type === 'meeting' ? 'bg-green-500' :
                          activity.type === 'event' ? 'bg-purple-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800" data-testid={`text-activity-${index}`}>
                            {activity.activity}
                          </p>
                          <p className="text-sm text-slate-600" data-testid={`text-activity-date-${index}`}>
                            {formatDate(activity.date)}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
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
export default StudentDetailModal;
