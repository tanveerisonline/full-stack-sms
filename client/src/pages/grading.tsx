import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GradingModal } from '@/components/GradingModal';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatDate } from '@/utils/formatters';
import { exportToCSV } from '@/utils/csvExport';
import { GRADES } from '@/utils/constants';
import { Trophy, Search, FileText, TrendingUp, Award, Users, Plus, Eye, Download, Printer } from 'lucide-react';

export default function Grading() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [grades, setGrades] = useState(dataService.getGrades());
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const students = dataService.getStudents();
  const assignments = dataService.getAssignments();
  const exams = dataService.getExams();

  const filteredGrades = grades.filter(grade => {
    const student = students.find(s => s.id === grade.studentId);
    const matchesSearch = student && 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || 
      (student && student.grade === selectedGrade);
    const matchesSubject = selectedSubject === 'all' || 
      grade.subject === selectedSubject;
    
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
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

  const subjects = Array.from(new Set(grades.map(g => g.subject)));
  const stats = {
    totalGrades: grades.length,
    averagePercentage: grades.length > 0 ? 
      Math.round(grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length) : 0,
    aGrades: grades.filter(g => g.grade === 'A').length,
    pendingGrades: assignments.filter(a => a.status === 'published').length,
  };

  const handleGradeEntry = (student?: any) => {
    setSelectedStudent(student || null);
    setIsGradingModalOpen(true);
  };

  const handleSaveGrade = (gradeData: any) => {
    setGrades(prev => [...prev, gradeData]);
  };

  const handleReportCard = () => {
    try {
      const selectedStudents = selectedStudent ? [selectedStudent] : students;
      
      const reportData = selectedStudents.map(student => {
        const studentGrades = grades.filter(g => g.studentId === student.id);
        const subjects = Array.from(new Set(studentGrades.map(g => g.subject)));
        
        const subjectAverages = subjects.map(subject => {
          const subjectGrades = studentGrades.filter(g => g.subject === subject);
          const avgPercentage = subjectGrades.length > 0 
            ? Math.round(subjectGrades.reduce((sum, g) => sum + parseFloat(g.percentage?.toString() || '0'), 0) / subjectGrades.length)
            : 0;
          return `${subject}: ${avgPercentage}%`;
        }).join(', ');

        const overallAverage = studentGrades.length > 0
          ? Math.round(studentGrades.reduce((sum, g) => sum + parseFloat(g.percentage?.toString() || '0'), 0) / studentGrades.length)
          : 0;

        return {
          'Student ID': student.rollNumber,
          'Name': `${student.firstName} ${student.lastName}`,
          'Grade': student.grade,
          'Section': student.section,
          'Subject Averages': subjectAverages || 'No grades recorded',
          'Overall Average': `${overallAverage}%`,
          'Total Subjects': subjects.length,
          'Total Assessments': studentGrades.length
        };
      });
      
      exportToCSV(reportData, `report_cards_${new Date().toISOString().split('T')[0]}`);
      addToast('Report cards generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to generate report cards.', 'error');
    }
  };

  const handleViewFullGrades = (student: any) => {
    const studentGrades = grades.filter(g => g.studentId === student.id);
    
    if (studentGrades.length === 0) {
      addToast('No grades found for this student.', 'info');
      return;
    }

    try {
      const exportData = studentGrades.map(grade => ({
        'Date': formatDate(grade.createdAt || new Date().toISOString()),
        'Subject': grade.subject,
        'Type': grade.gradeType || grade.type || 'Assessment',
        'Score': `${grade.score || grade.marks || 0}/${grade.totalMarks || grade.total || 100}`,
        'Percentage': `${grade.percentage || 0}%`,
        'Grade': grade.grade,
        'Comments': grade.comments || 'No comments'
      }));
      
      exportToCSV(exportData, `${student.firstName}_${student.lastName}_grades`);
      addToast(`${student.firstName}'s complete grade report exported!`, 'success');
    } catch (error) {
      addToast('Failed to export student grades.', 'error');
    }
  };

  return (
    <div className="space-y-8" data-testid="grading-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Grading & Assessment
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage grades, assessments, and student performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleGradeEntry()} data-testid="button-grade-entry">
            <Plus className="w-4 h-4 mr-2" />
            Enter Grades
          </Button>
          <Button variant="outline" onClick={handleReportCard} data-testid="button-report-card">
            <Download className="w-4 h-4 mr-2" />
            Generate Report Card
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Grades</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalGrades}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Class Average</p>
                <p className="text-3xl font-bold text-slate-800">{stats.averagePercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">A Grades</p>
                <p className="text-3xl font-bold text-slate-800">{stats.aGrades}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Grades</p>
                <p className="text-3xl font-bold text-slate-800">{stats.pendingGrades}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-students"
              />
            </div>
            
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
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
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-subject-filter">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Subject</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Marks</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Percentage</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">Grade</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Comments</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredGrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No grades found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50" data-testid={`row-grade-${grade.id}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800" data-testid={`text-student-name-${grade.id}`}>
                          {getStudentName(grade.studentId)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-subject-${grade.id}`}>
                        {grade.subject}
                      </td>
                      <td className="px-4 py-3 text-center" data-testid={`text-marks-${grade.id}`}>
                        {grade.marks}/{grade.totalMarks}
                      </td>
                      <td className="px-4 py-3 text-center" data-testid={`text-percentage-${grade.id}`}>
                        {grade.percentage}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={getGradeColor(grade.grade)} data-testid={`badge-grade-${grade.id}`}>
                          {grade.grade}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-comments-${grade.id}`}>
                        {grade.comments || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-date-${grade.id}`}>
                        {formatDate(grade.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['A', 'B', 'C', 'D', 'F'].map((gradeLevel) => {
                const count = grades.filter(g => g.grade === gradeLevel).length;
                const percentage = grades.length > 0 ? (count / grades.length) * 100 : 0;
                
                return (
                  <div key={gradeLevel} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-semibold">
                      {gradeLevel}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">Grade {gradeLevel}</span>
                        <span className="text-sm text-slate-600">{count} students</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getGradeColor(gradeLevel).includes('green') ? 'bg-green-500' : 
                            getGradeColor(gradeLevel).includes('blue') ? 'bg-blue-500' :
                            getGradeColor(gradeLevel).includes('yellow') ? 'bg-yellow-500' :
                            getGradeColor(gradeLevel).includes('orange') ? 'bg-orange-500' : 'bg-red-500'}`}
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
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects.map((subject) => {
                const subjectGrades = grades.filter(g => g.subject === subject);
                const avgPercentage = subjectGrades.length > 0 ? 
                  Math.round(subjectGrades.reduce((sum, g) => sum + g.percentage, 0) / subjectGrades.length) : 0;
                
                return (
                  <div key={subject} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{subject}</p>
                      <p className="text-sm text-slate-600">{subjectGrades.length} assessments</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-800">{avgPercentage}%</p>
                      <p className="text-sm text-slate-600">Class Average</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-student-grades-title">Student Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  data-testid="input-search-students"
                />
              </div>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-48" data-testid="select-filter-grade">
                  <SelectValue placeholder="Filter by grade" />
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
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48" data-testid="select-filter-subject">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grades Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-700">Student</th>
                    <th className="text-left p-4 font-medium text-slate-700">Grade</th>
                    <th className="text-left p-4 font-medium text-slate-700">Subject</th>
                    <th className="text-left p-4 font-medium text-slate-700">Latest Assessment</th>
                    <th className="text-left p-4 font-medium text-slate-700">Grade</th>
                    <th className="text-left p-4 font-medium text-slate-700">Percentage</th>
                    <th className="text-left p-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(student => {
                      const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
                      return matchesSearch && matchesGrade;
                    })
                    .map((student) => {
                      const studentGrades = grades.filter(g => g.studentId === student.id);
                      const latestGrade = studentGrades.length > 0 ? studentGrades[studentGrades.length - 1] : null;
                      const averagePercentage = studentGrades.length > 0 
                        ? Math.round(studentGrades.reduce((sum, g) => sum + parseFloat(g.percentage?.toString() || '0'), 0) / studentGrades.length)
                        : 0;

                      return (
                        <tr key={student.id} className="border-t border-slate-200 hover:bg-slate-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-slate-800" data-testid={`student-name-${student.id}`}>
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-slate-600">ID: {student.rollNumber}</p>
                            </div>
                          </td>
                          <td className="p-4 text-slate-700">{student.grade}</td>
                          <td className="p-4 text-slate-700">
                            {latestGrade ? latestGrade.subject : 'No assessments'}
                          </td>
                          <td className="p-4 text-slate-700">
                            {latestGrade ? 
                              `${latestGrade.gradeType || latestGrade.type || 'Assessment'} - ${formatDate(latestGrade.createdAt || new Date().toISOString())}` 
                              : 'No assessments'
                            }
                          </td>
                          <td className="p-4">
                            {latestGrade ? (
                              <Badge className={getGradeColor(latestGrade.grade)} data-testid={`grade-badge-${student.id}`}>
                                {latestGrade.grade}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-700">
                            {averagePercentage > 0 ? `${averagePercentage}%` : '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleGradeEntry(student)}
                                data-testid={`button-add-grade-${student.id}`}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Grade
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewFullGrades(student)}
                                disabled={studentGrades.length === 0}
                                data-testid={`button-view-grades-${student.id}`}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Full Grades
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              
              {students.filter(student => {
                const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
                return matchesSearch && matchesGrade;
              }).length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No students found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grading Modal */}
      <GradingModal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        onSave={handleSaveGrade}
        selectedStudent={selectedStudent}
      />
    </div>
  );
}
