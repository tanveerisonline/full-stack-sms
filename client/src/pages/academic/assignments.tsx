import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssignmentModal } from '@/components/AssignmentModal';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { exportToCSV } from '@/utils/csvExport';
import { GRADES } from '@/utils/constants';
import { Plus, Search, FileText, Calendar, CheckCircle, Clock, AlertCircle, Download, Edit } from 'lucide-react';

export default function Assignments() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  
  const teachers = dataService.getTeachers();

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || assignment.grade === gradeFilter;
    
    return matchesSearch && matchesStatus && matchesGrade;
  });

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'closed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [assignments, setAssignments] = useState(dataService.getAssignments());
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'closed') return false;
    return new Date(dueDate) < new Date();
  };

  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    setIsModalOpen(true);
  };

  const handleEditAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleSaveAssignment = (assignmentData: any) => {
    if (selectedAssignment) {
      setAssignments(prev => prev.map(a => a.id === assignmentData.id ? assignmentData : a));
    } else {
      setAssignments(prev => [...prev, assignmentData]);
    }
  };

  const handleExportAssignments = () => {
    try {
      const exportData = filteredAssignments.map(assignment => ({
        'Title': assignment.title,
        'Subject': assignment.subject,
        'Grade': assignment.grade,
        'Total Marks': assignment.totalMarks,
        'Due Date': formatDate(assignment.dueDate),
        'Status': assignment.status,
        'Teacher': getTeacherName(assignment.teacherId),
        'Description': assignment.description,
        'Created Date': formatDate(assignment.createdAt)
      }));
      
      exportToCSV(exportData, 'assignments_list');
      addToast('Assignments exported successfully!', 'success');
    } catch (error) {
      addToast('Failed to export assignments.', 'error');
    }
  };

  const stats = {
    total: assignments.length,
    published: assignments.filter(a => a.status === 'published').length,
    draft: assignments.filter(a => a.status === 'draft').length,
    overdue: assignments.filter(a => isOverdue(a.dueDate, a.status)).length,
  };

  return (
    <div className="space-y-8" data-testid="assignments-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Assignment Hub
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Create and manage student assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAssignments} data-testid="button-export-assignments">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateAssignment} data-testid="button-create-assignment">
            <Plus className="w-5 h-5 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Assignments</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
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
                <p className="text-sm font-medium text-slate-600">Published</p>
                <p className="text-3xl font-bold text-slate-800">{stats.published}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Draft</p>
                <p className="text-3xl font-bold text-slate-800">{stats.draft}</p>
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
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-3xl font-bold text-slate-800">{stats.overdue}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
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
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-assignments"
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500" data-testid="text-no-assignments">
                No assignments found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow" data-testid={`card-assignment-${assignment.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(assignment.status)}
                      <h3 className="text-lg font-semibold text-slate-800" data-testid={`text-assignment-title-${assignment.id}`}>
                        {assignment.title}
                      </h3>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      {isOverdue(assignment.dueDate, assignment.status) && (
                        <Badge className="bg-red-100 text-red-800">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-slate-600 mb-4" data-testid={`text-assignment-description-${assignment.id}`}>
                      {assignment.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-slate-700">Subject</p>
                        <p className="text-slate-600" data-testid={`text-assignment-subject-${assignment.id}`}>
                          {assignment.subject}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">Grade</p>
                        <p className="text-slate-600" data-testid={`text-assignment-grade-${assignment.id}`}>
                          {assignment.grade}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">Total Marks</p>
                        <p className="text-slate-600" data-testid={`text-assignment-marks-${assignment.id}`}>
                          {assignment.totalMarks}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">Due Date</p>
                        <p className="text-slate-600" data-testid={`text-assignment-due-${assignment.id}`}>
                          {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>
                          Created by {getTeacherName(assignment.teacherId)} on {formatDate(assignment.createdAt)}
                        </span>
                        <span>
                          Updated {formatDateTime(assignment.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditAssignment(assignment)}
                      data-testid={`button-edit-assignment-${assignment.id}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-view-submissions-${assignment.id}`}>
                      Submissions
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-grade-assignment-${assignment.id}`}>
                      Grade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        assignment={selectedAssignment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAssignment}
      />
    </div>
  );
}
