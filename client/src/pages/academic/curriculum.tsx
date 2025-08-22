import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CourseModal } from '@/components/CourseModal';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatDate } from '@/utils/formatters';
import { exportToCSV } from '@/utils/csvExport';
import { Plus, Search, BookOpen, Clock, Users, Award, Download, Edit, Trash2 } from 'lucide-react';

export default function Curriculum() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState(dataService.getCourses());
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const teachers = dataService.getTeachers();

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned';
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      addToast('Course deleted successfully!', 'success');
    }
  };

  const handleSaveCourse = (courseData: any) => {
    if (selectedCourse) {
      // Update existing course
      setCourses(prev => prev.map(c => c.id === courseData.id ? courseData : c));
    } else {
      // Add new course
      setCourses(prev => [...prev, courseData]);
    }
  };

  const handleExportCourses = () => {
    try {
      const exportData = filteredCourses.map(course => ({
        'Course Code': course.code,
        'Course Name': course.name,
        'Subject': course.subject,
        'Grade': course.grade,
        'Credits': course.credits,
        'Duration (hours)': course.duration,
        'Instructor': getTeacherName(course.teacherId),
        'Status': course.status,
        'Description': course.description,
        'Created Date': formatDate(course.createdAt)
      }));
      
      exportToCSV(exportData, 'courses_list');
      addToast('Courses exported successfully!', 'success');
    } catch (error) {
      addToast('Failed to export courses.', 'error');
    }
  };

  return (
    <div className="space-y-8" data-testid="curriculum-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Curriculum & Courses
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage academic curriculum and course offerings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCourses} data-testid="button-export-courses">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddCourse} data-testid="button-add-course">
            <Plus className="w-5 h-5 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Courses</p>
                <p className="text-3xl font-bold text-slate-800">{courses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Courses</p>
                <p className="text-3xl font-bold text-slate-800">
                  {courses.filter(c => c.status === 'active').length}
                </p>
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
                <p className="text-sm font-medium text-slate-600">Total Credits</p>
                <p className="text-3xl font-bold text-slate-800">
                  {courses.reduce((sum, course) => sum + course.credits, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Instructors</p>
                <p className="text-3xl font-bold text-slate-800">{teachers.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search courses by name, code, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-courses"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500" data-testid="text-no-courses">
                No courses found matching your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow" data-testid={`card-course-${course.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-course-name-${course.id}`}>
                      {course.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1" data-testid={`text-course-code-${course.id}`}>
                      {course.code}
                    </p>
                  </div>
                  <Badge 
                    variant={course.status === 'active' ? 'default' : 'secondary'}
                    className={course.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600" data-testid={`text-course-description-${course.id}`}>
                  {course.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-700">Grade</p>
                    <p className="text-slate-600" data-testid={`text-course-grade-${course.id}`}>
                      {course.grade}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Credits</p>
                    <p className="text-slate-600" data-testid={`text-course-credits-${course.id}`}>
                      {course.credits}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Subject</p>
                    <p className="text-slate-600" data-testid={`text-course-subject-${course.id}`}>
                      {course.subject}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Duration</p>
                    <p className="text-slate-600" data-testid={`text-course-duration-${course.id}`}>
                      {course.duration}h
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Instructor</p>
                  <p className="text-sm text-slate-600" data-testid={`text-course-instructor-${course.id}`}>
                    {getTeacherName(course.teacherId)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleEditCourse(course)}
                    data-testid={`button-edit-course-${course.id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 hover:text-red-700" 
                    onClick={() => handleDeleteCourse(course.id)}
                    data-testid={`button-delete-course-${course.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Course Modal */}
      <CourseModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
      />
    </div>
  );
}
