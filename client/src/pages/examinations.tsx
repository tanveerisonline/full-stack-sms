import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/Common/Toast';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { GRADES, EXAM_TYPES } from '@/utils/constants';
import { Plus, Search, FileText, Calendar, Clock, Users, Award, AlertCircle, Download } from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  subject: string;
  grade: string;
  type: 'midterm' | 'final' | 'quiz' | 'assignment';
  date: string;
  startTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  room: string;
  invigilator: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  instructions: string;
  studentsEnrolled: number;
  studentsAppeared: number;
  createdBy: string;
  createdAt: string;
}

interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  marksObtained: number;
  grade: string;
  percentage: number;
  status: 'pass' | 'fail' | 'absent';
  submittedAt?: string;
}

export default function Examinations() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('exams');

  // Mock data
  const exams: Exam[] = [
    {
      id: '1',
      name: 'Mathematics Mid-term Examination',
      subject: 'Mathematics',
      grade: 'Grade 10',
      type: 'midterm',
      date: '2024-03-15',
      startTime: '09:00',
      duration: 120,
      totalMarks: 100,
      passingMarks: 40,
      room: 'Room 101',
      invigilator: 'Dr. Smith',
      status: 'scheduled',
      instructions: 'Scientific calculator allowed. Show all working clearly.',
      studentsEnrolled: 45,
      studentsAppeared: 0,
      createdBy: 'Admin',
      createdAt: '2024-02-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'English Literature Final Exam',
      subject: 'English',
      grade: 'Grade 11',
      type: 'final',
      date: '2024-02-28',
      startTime: '14:00',
      duration: 180,
      totalMarks: 100,
      passingMarks: 40,
      room: 'Room 201',
      invigilator: 'Mrs. Johnson',
      status: 'completed',
      instructions: 'Answer all questions. Time limit strictly enforced.',
      studentsEnrolled: 38,
      studentsAppeared: 36,
      createdBy: 'Admin',
      createdAt: '2024-01-28T14:00:00Z'
    },
    {
      id: '3',
      name: 'Physics Quiz 1',
      subject: 'Physics',
      grade: 'Grade 12',
      type: 'quiz',
      date: '2024-02-20',
      startTime: '11:00',
      duration: 60,
      totalMarks: 50,
      passingMarks: 20,
      room: 'Lab 1',
      invigilator: 'Dr. Brown',
      status: 'completed',
      instructions: 'Multiple choice questions. No calculators allowed.',
      studentsEnrolled: 32,
      studentsAppeared: 30,
      createdBy: 'Admin',
      createdAt: '2024-02-10T11:00:00Z'
    }
  ];

  const examResults: ExamResult[] = [
    {
      id: '1',
      examId: '2',
      studentId: 'STU001',
      studentName: 'Alex Johnson',
      marksObtained: 85,
      grade: 'A',
      percentage: 85,
      status: 'pass',
      submittedAt: '2024-02-28T16:45:00Z'
    },
    {
      id: '2',
      examId: '2',
      studentId: 'STU002',
      studentName: 'Sarah Davis',
      marksObtained: 92,
      grade: 'A+',
      percentage: 92,
      status: 'pass',
      submittedAt: '2024-02-28T16:30:00Z'
    },
    {
      id: '3',
      examId: '3',
      studentId: 'STU003',
      studentName: 'Michael Chen',
      marksObtained: 42,
      grade: 'B',
      percentage: 84,
      status: 'pass',
      submittedAt: '2024-02-20T11:58:00Z'
    }
  ];

  const filteredExams = exams.filter(exam => {
    const matchesSearch = 
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || exam.grade === gradeFilter;
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesType = typeFilter === 'all' || exam.type === typeFilter;
    
    return matchesSearch && matchesGrade && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalExams: exams.length,
    scheduledExams: exams.filter(e => e.status === 'scheduled').length,
    completedExams: exams.filter(e => e.status === 'completed').length,
    upcomingExams: exams.filter(e => e.status === 'scheduled' && new Date(e.date) > new Date()).length,
    avgAttendance: exams.length > 0 ? 
      Math.round((exams.reduce((sum, e) => sum + (e.studentsAppeared / e.studentsEnrolled), 0) / exams.length) * 100) : 0,
    totalStudentsExamined: examResults.length
  };

  const handleCreateExam = () => {
    addToast('Exam creation feature coming soon!', 'info');
  };

  const handleScheduleExam = () => {
    addToast('Exam scheduling feature coming soon!', 'info');
  };

  const handlePublishResults = () => {
    addToast('Result publishing feature coming soon!', 'info');
  };

  const handleExportResults = () => {
    addToast('Result export feature coming soon!', 'info');
  };

  return (
    <div className="space-y-8" data-testid="examinations-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Examination System
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage exams, schedules, and results
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleCreateExam} data-testid="button-create-exam">
            <Plus className="w-4 h-4 mr-2" />
            Create Exam
          </Button>
          <Button onClick={handleScheduleExam} data-testid="button-schedule-exam">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Exam
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Exams</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalExams}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Scheduled</p>
                <p className="text-3xl font-bold text-slate-800">{stats.scheduledExams}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-3xl font-bold text-slate-800">{stats.completedExams}</p>
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
                <p className="text-sm font-medium text-slate-600">Upcoming</p>
                <p className="text-3xl font-bold text-slate-800">{stats.upcomingExams}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Attendance</p>
                <p className="text-3xl font-bold text-slate-800">{stats.avgAttendance}%</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Examined</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalStudentsExamined}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
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
              variant={activeTab === 'exams' ? 'default' : 'outline'}
              onClick={() => setActiveTab('exams')}
              data-testid="tab-exams"
            >
              Examinations
            </Button>
            <Button
              variant={activeTab === 'schedule' ? 'default' : 'outline'}
              onClick={() => setActiveTab('schedule')}
              data-testid="tab-schedule"
            >
              Exam Schedule
            </Button>
            <Button
              variant={activeTab === 'results' ? 'default' : 'outline'}
              onClick={() => setActiveTab('results')}
              data-testid="tab-results"
            >
              Results
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'outline'}
              onClick={() => setActiveTab('analytics')}
              data-testid="tab-analytics"
            >
              Analytics
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
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-exams"
              />
            </div>
            
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-grade-filter">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {EXAM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Examinations Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {filteredExams.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500" data-testid="text-no-exams">
                  No exams found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow" data-testid={`card-exam-${exam.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800" data-testid={`text-exam-name-${exam.id}`}>
                          {exam.name}
                        </h3>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                        <Badge variant="outline" data-testid={`badge-exam-type-${exam.id}`}>
                          {exam.type}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="font-medium text-slate-700">Subject</p>
                          <p className="text-slate-600" data-testid={`text-exam-subject-${exam.id}`}>
                            {exam.subject}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">Grade</p>
                          <p className="text-slate-600" data-testid={`text-exam-grade-${exam.id}`}>
                            {exam.grade}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">Date & Time</p>
                          <p className="text-slate-600" data-testid={`text-exam-datetime-${exam.id}`}>
                            {formatDate(exam.date)} at {exam.startTime}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">Duration</p>
                          <p className="text-slate-600" data-testid={`text-exam-duration-${exam.id}`}>
                            {exam.duration} minutes
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="font-medium text-slate-700">Room</p>
                          <p className="text-slate-600" data-testid={`text-exam-room-${exam.id}`}>
                            {exam.room}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">Invigilator</p>
                          <p className="text-slate-600" data-testid={`text-exam-invigilator-${exam.id}`}>
                            {exam.invigilator}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">Total Marks</p>
                          <p className="text-slate-600" data-testid={`text-exam-marks-${exam.id}`}>
                            {exam.totalMarks} (Pass: {exam.passingMarks})
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">Enrollment</p>
                          <p className="text-slate-600" data-testid={`text-exam-enrollment-${exam.id}`}>
                            {exam.studentsEnrolled} students
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="font-medium text-slate-700 mb-1">Instructions</p>
                        <p className="text-sm text-slate-600" data-testid={`text-exam-instructions-${exam.id}`}>
                          {exam.instructions}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm" data-testid={`button-edit-exam-${exam.id}`}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-view-exam-${exam.id}`}>
                        View Details
                      </Button>
                      {exam.status === 'completed' && (
                        <Button variant="outline" size="sm" data-testid={`button-results-exam-${exam.id}`}>
                          View Results
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-200">
                    <span>Created by {exam.createdBy} on {formatDate(exam.createdAt)}</span>
                    <span>
                      {exam.status === 'completed' && 
                        `${exam.studentsAppeared}/${exam.studentsEnrolled} appeared`
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Exam Schedule Tab */}
      {activeTab === 'schedule' && (
        <Card>
          <CardHeader>
            <CardTitle>Exam Schedule Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>Interactive exam calendar coming soon!</p>
              <p className="text-sm mt-2">View and manage exam schedules in calendar format</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Examination Results</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleExportResults} data-testid="button-export-results">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={handlePublishResults} data-testid="button-publish-results">
                  <Award className="w-4 h-4 mr-2" />
                  Publish Results
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Exam</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Marks</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Percentage</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Grade</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {examResults.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No exam results available.
                      </td>
                    </tr>
                  ) : (
                    examResults.map((result) => {
                      const exam = exams.find(e => e.id === result.examId);
                      return (
                        <tr key={result.id} className="hover:bg-slate-50" data-testid={`row-result-${result.id}`}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800" data-testid={`text-result-student-${result.id}`}>
                              {result.studentName}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-slate-800" data-testid={`text-result-exam-${result.id}`}>
                              {exam?.name || 'Unknown Exam'}
                            </p>
                            <p className="text-sm text-slate-600">
                              {exam?.subject} - {exam?.grade}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center" data-testid={`text-result-marks-${result.id}`}>
                            {result.marksObtained}/{exam?.totalMarks || 100}
                          </td>
                          <td className="px-4 py-3 text-center" data-testid={`text-result-percentage-${result.id}`}>
                            {result.percentage}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={getGradeColor(result.grade)} data-testid={`badge-result-grade-${result.id}`}>
                              {result.grade}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={result.status === 'pass' ? 'bg-green-100 text-green-800' : 
                              result.status === 'fail' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                              {result.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-600" data-testid={`text-result-submitted-${result.id}`}>
                            {result.submittedAt ? formatDateTime(result.submittedAt) : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['A+', 'A', 'B', 'C', 'D', 'F'].map((grade) => {
                  const count = examResults.filter(r => r.grade === grade).length;
                  const percentage = examResults.length > 0 ? (count / examResults.length) * 100 : 0;
                  
                  return (
                    <div key={grade} className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-semibold">
                        {grade}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">Grade {grade}</span>
                          <span className="text-sm text-slate-600">{count} students</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getGradeColor(grade).includes('green') ? 'bg-green-500' : 
                              getGradeColor(grade).includes('blue') ? 'bg-blue-500' :
                              getGradeColor(grade).includes('yellow') ? 'bg-yellow-500' :
                              getGradeColor(grade).includes('orange') ? 'bg-orange-500' : 'bg-red-500'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exam Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {examResults.length > 0 ? 
                      Math.round(examResults.reduce((sum, r) => sum + r.percentage, 0) / examResults.length) : 0}%
                  </p>
                  <p className="text-sm text-blue-800">Average Score</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {examResults.filter(r => r.status === 'pass').length}
                  </p>
                  <p className="text-sm text-green-800">Students Passed</p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {examResults.filter(r => r.status === 'fail').length}
                  </p>
                  <p className="text-sm text-yellow-800">Students Failed</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {examResults.length > 0 ? 
                      Math.round((examResults.filter(r => r.status === 'pass').length / examResults.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-purple-800">Pass Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
