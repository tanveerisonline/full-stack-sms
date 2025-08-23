import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatPhoneNumber } from '@/utils/formatters';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  FileText,
  TrendingUp,
  Clock,
  Download,
  Printer
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  grade: string;
  rollNumber: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: string;
  avatar?: string;
  createdAt: string;
  emergencyContact?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  previousSchool?: string;
  admissionDate?: string;
}

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

function StudentProfileModal({ student, isOpen, onClose }: StudentProfileModalProps) {
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

  const handleExportProfile = () => {
    const profileData = [{
      'Student ID': student.rollNumber,
      'Name': `${student.firstName} ${student.lastName}`,
      'Email': student.email,
      'Phone': student.phone,
      'Address': student.address,
      'Date of Birth': formatDate(student.dateOfBirth),
      'Grade': student.grade,
      'Parent Name': student.parentName,
      'Parent Phone': student.parentPhone || 'N/A',
      'Parent Email': student.parentEmail || 'N/A',
      'Status': student.status,
      'Admission Date': student.admissionDate ? formatDate(student.admissionDate) : 'N/A',
      'Blood Group': student.bloodGroup || 'N/A',
      'Emergency Contact': student.emergencyContact || 'N/A',
      'Medical Conditions': student.medicalConditions || 'None',
      'Previous School': student.previousSchool || 'N/A'
    }];

    // Simple export function for single student
    const csvContent = Object.entries(profileData[0]).map(([key, value]) => `${key},${value}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.firstName}_${student.lastName}_profile.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintProfile = () => {
    window.print();
  };

  // Mock attendance and grade data
  const attendanceStats = {
    totalDays: 180,
    presentDays: 165,
    absentDays: 15,
    attendanceRate: 91.7
  };

  const recentGrades = [
    { subject: 'Mathematics', grade: 'A', marks: 92, date: '2024-02-15' },
    { subject: 'English', grade: 'B+', marks: 87, date: '2024-02-14' },
    { subject: 'Science', grade: 'A-', marks: 89, date: '2024-02-13' },
    { subject: 'History', grade: 'B', marks: 84, date: '2024-02-12' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto" data-testid="student-profile-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Student Profile</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportProfile} data-testid="button-export-profile">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintProfile} data-testid="button-print-profile">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with basic info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl">
                    {student.firstName[0]}{student.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-800" data-testid="text-student-full-name">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-slate-600 mb-2" data-testid="text-student-id">
                    Student ID: {student.rollNumber}
                  </p>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                    <span className="text-slate-600">{student.grade}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" data-testid="tab-personal-info">Personal</TabsTrigger>
              <TabsTrigger value="academic" data-testid="tab-academic-info">Academic</TabsTrigger>
              <TabsTrigger value="attendance" data-testid="tab-attendance-info">Attendance</TabsTrigger>
              <TabsTrigger value="emergency" data-testid="tab-emergency-info">Emergency</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Full Name</label>
                      <p className="text-slate-900">{student.firstName} {student.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                      <p className="text-slate-900">{formatDate(student.dateOfBirth)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Blood Group</label>
                      <p className="text-slate-900">{student.bloodGroup || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Previous School</label>
                      <p className="text-slate-900">{student.previousSchool || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <p className="text-slate-900">{student.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Phone</label>
                      <p className="text-slate-900">{formatPhoneNumber(student.phone)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Address</label>
                      <p className="text-slate-900">{student.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Admission Date</label>
                      <p className="text-slate-900">{student.admissionDate ? formatDate(student.admissionDate) : formatDate(student.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parent Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Parent/Guardian Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Parent Name</label>
                    <p className="text-slate-900">{student.parentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Parent Phone</label>
                    <p className="text-slate-900">{student.parentPhone || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Parent Email</label>
                    <p className="text-slate-900">{student.parentEmail || 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Information */}
            <TabsContent value="academic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Academic Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">A-</p>
                      <p className="text-sm text-slate-600">Overall Grade</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">87.5%</p>
                      <p className="text-sm text-slate-600">Average Score</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">12</p>
                      <p className="text-sm text-slate-600">Class Rank</p>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-4">Recent Grades</h4>
                  <div className="space-y-3">
                    {recentGrades.map((grade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{grade.subject}</p>
                          <p className="text-sm text-slate-600">{formatDate(grade.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{grade.grade}</p>
                          <p className="text-sm text-slate-600">{grade.marks}/100</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Information */}
            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Attendance Record
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{attendanceStats.attendanceRate}%</p>
                      <p className="text-sm text-slate-600">Attendance Rate</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{attendanceStats.presentDays}</p>
                      <p className="text-sm text-slate-600">Present Days</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{attendanceStats.absentDays}</p>
                      <p className="text-sm text-slate-600">Absent Days</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-600">{attendanceStats.totalDays}</p>
                      <p className="text-sm text-slate-600">Total Days</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Recent Attendance</h4>
                    {[...Array(7)].map((_, index) => {
                      const date = new Date();
                      date.setDate(date.getDate() - index);
                      const status = Math.random() > 0.1 ? 'Present' : 'Absent';
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <p className="font-medium">{formatDate(date.toISOString())}</p>
                          <Badge className={status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emergency Information */}
            <TabsContent value="emergency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Emergency Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Emergency Contact</label>
                    <p className="text-slate-900">{student.emergencyContact || student.parentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Emergency Phone</label>
                    <p className="text-slate-900">{student.parentPhone || student.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Medical Conditions</label>
                    <p className="text-slate-900">{student.medicalConditions || 'None reported'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Allergies</label>
                    <p className="text-slate-900">None reported</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}export default StudentProfileModal;
