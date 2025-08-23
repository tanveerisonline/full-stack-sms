import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatDate } from '@/utils/formatters';
import { exportToCSV } from '@/utils/csvExport';
import { Eye, Edit, Trash2, Download, Plus } from 'lucide-react';

interface StudentGradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

export function StudentGradesModal({ isOpen, onClose, student }: StudentGradesModalProps) {
  const { addToast } = useToast();
  const [grades, setGrades] = useState(dataService.getGrades());
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');

  if (!student) return null;

  const studentGrades = grades.filter(g => g.studentId === student.id);
  const subjects = Array.from(new Set(studentGrades.map(g => g.subject)));
  const gradeTypes = Array.from(new Set(studentGrades.map(g => g.gradeType || g.type || 'Assessment')));

  const filteredGrades = studentGrades.filter(grade => {
    const matchesSubject = filterSubject === 'all' || grade.subject === filterSubject;
    const matchesType = filterType === 'all' || (grade.gradeType || grade.type) === filterType;
    return matchesSubject && matchesType;
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': return 'bg-green-100 text-green-800';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800';
      case 'C+': case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D+': case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOverallStats = () => {
    if (studentGrades.length === 0) return { average: 0, totalGrades: 0, highestGrade: '-', lowestGrade: '-' };
    
    const validGrades = studentGrades.filter(g => g.percentage && !isNaN(parseFloat(g.percentage.toString())));
    const average = validGrades.length > 0 
      ? Math.round(validGrades.reduce((sum, g) => sum + parseFloat(g.percentage.toString()), 0) / validGrades.length)
      : 0;
    
    const percentages = validGrades.map(g => parseFloat(g.percentage.toString())).sort((a, b) => b - a);
    
    return {
      average,
      totalGrades: studentGrades.length,
      highestGrade: percentages.length > 0 ? `${percentages[0]}%` : '-',
      lowestGrade: percentages.length > 0 ? `${percentages[percentages.length - 1]}%` : '-'
    };
  };

  const stats = calculateOverallStats();

  const handleExport = () => {
    try {
      const exportData = filteredGrades.map(grade => ({
        'Date': formatDate(grade.createdAt || new Date().toISOString()),
        'Subject': grade.subject,
        'Type': grade.gradeType || grade.type || 'Assessment',
        'Score': `${grade.score || grade.marks || 0}/${grade.totalMarks || grade.total || 100}`,
        'Percentage': `${grade.percentage || 0}%`,
        'Grade': grade.grade,
        'Comments': grade.comments || 'No comments'
      }));

      exportToCSV(exportData, `${student.firstName}_${student.lastName}_detailed_grades`);
      addToast('Student grades exported successfully!', 'success');
    } catch (error) {
      addToast('Failed to export grades', 'error');
    }
  };

  const handleEdit = (gradeId: string) => {
    addToast('Edit functionality would open grade edit modal', 'info');
  };

  const handleDelete = (gradeId: string) => {
    setGrades(prev => prev.filter(g => g.id !== gradeId));
    addToast('Grade deleted successfully', 'success');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Complete Grades - {student.firstName} {student.lastName}
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-student-grades">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Student Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {student.firstName} {student.lastName}</p>
                <p><span className="font-medium">Grade:</span> {student.grade}</p>
                <p><span className="font-medium">Roll Number:</span> {student.rollNumber}</p>
                <p><span className="font-medium">Email:</span> {student.email}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Academic Performance</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="font-medium">Overall Average:</span> {stats.average}%</p>
                <p><span className="font-medium">Total Grades:</span> {stats.totalGrades}</p>
                <p><span className="font-medium">Highest Score:</span> {stats.highestGrade}</p>
                <p><span className="font-medium">Lowest Score:</span> {stats.lowestGrade}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger data-testid="select-filter-subject">
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
            <div className="flex-1">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger data-testid="select-filter-type">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {gradeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grades Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200">
              <h3 className="font-medium text-slate-800">Grade History ({filteredGrades.length} records)</h3>
            </div>
            
            {filteredGrades.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No grades found for the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-slate-700">Date</th>
                      <th className="text-left p-3 font-medium text-slate-700">Subject</th>
                      <th className="text-left p-3 font-medium text-slate-700">Type</th>
                      <th className="text-left p-3 font-medium text-slate-700">Score</th>
                      <th className="text-left p-3 font-medium text-slate-700">Percentage</th>
                      <th className="text-left p-3 font-medium text-slate-700">Grade</th>
                      <th className="text-left p-3 font-medium text-slate-700">Comments</th>
                      <th className="text-left p-3 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.map((grade, index) => (
                      <tr key={grade.id || index} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="p-3 text-sm">
                          {formatDate(grade.createdAt || new Date().toISOString())}
                        </td>
                        <td className="p-3 text-sm font-medium">{grade.subject}</td>
                        <td className="p-3 text-sm">{grade.gradeType || grade.type || 'Assessment'}</td>
                        <td className="p-3 text-sm">
                          {grade.score || grade.marks || 0}/{grade.totalMarks || grade.total || 100}
                        </td>
                        <td className="p-3 text-sm font-medium">{grade.percentage || 0}%</td>
                        <td className="p-3">
                          <Badge className={getGradeColor(grade.grade)}>
                            {grade.grade}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm">{grade.comments || '-'}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(grade.id)}
                              data-testid={`button-edit-grade-${grade.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(grade.id)}
                              data-testid={`button-delete-grade-${grade.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose} data-testid="button-close-grades">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}