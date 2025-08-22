import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { GRADES } from '@/utils/constants';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  subject: string;
  grade: string;
  credits: number;
  duration: number;
  teacherId: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface CourseModalProps {
  course?: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: any) => void;
}

export function CourseModal({ course, isOpen, onClose, onSave }: CourseModalProps) {
  const { addToast } = useToast();
  const teachers = dataService.getTeachers();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    subject: '',
    grade: '',
    credits: 1,
    duration: 40,
    teacherId: '',
    status: 'active' as 'active' | 'inactive' | 'draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Computer Science', 'Physical Education',
    'Art', 'Music', 'Foreign Language', 'Economics', 'Psychology'
  ];

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        code: course.code,
        description: course.description,
        subject: course.subject,
        grade: course.grade,
        credits: course.credits,
        duration: course.duration,
        teacherId: course.teacherId,
        status: course.status
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        subject: '',
        grade: '',
        credits: 1,
        duration: 40,
        teacherId: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [course, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Course name is required';
    if (!formData.code.trim()) newErrors.code = 'Course code is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (formData.credits < 1) newErrors.credits = 'Credits must be at least 1';
    if (formData.duration < 1) newErrors.duration = 'Duration must be at least 1 hour';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    const courseData = {
      ...formData,
      id: course?.id || `course_${Date.now()}`,
      createdAt: course?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(courseData);
    addToast(course ? 'Course updated successfully!' : 'Course created successfully!', 'success');
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="course-modal">
        <DialogHeader>
          <DialogTitle>
            {course ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Advanced Mathematics"
                className={errors.name ? 'border-red-500' : ''}
                data-testid="input-course-name"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="courseCode">Course Code *</Label>
              <Input
                id="courseCode"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., MATH101"
                className={errors.code ? 'border-red-500' : ''}
                data-testid="input-course-code"
              />
              {errors.code && <p className="text-sm text-red-600 mt-1">{errors.code}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="courseDescription">Description</Label>
            <Textarea
              id="courseDescription"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the course content and objectives..."
              rows={3}
              data-testid="textarea-course-description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courseSubject">Subject *</Label>
              <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)}>
                <SelectTrigger className={errors.subject ? 'border-red-500' : ''} data-testid="select-course-subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject}</p>}
            </div>

            <div>
              <Label htmlFor="courseGrade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
                <SelectTrigger className={errors.grade ? 'border-red-500' : ''} data-testid="select-course-grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade && <p className="text-sm text-red-600 mt-1">{errors.grade}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="courseCredits">Credits *</Label>
              <Input
                id="courseCredits"
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => handleChange('credits', parseInt(e.target.value) || 1)}
                className={errors.credits ? 'border-red-500' : ''}
                data-testid="input-course-credits"
              />
              {errors.credits && <p className="text-sm text-red-600 mt-1">{errors.credits}</p>}
            </div>

            <div>
              <Label htmlFor="courseDuration">Duration (hours) *</Label>
              <Input
                id="courseDuration"
                type="number"
                min="1"
                max="200"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || 40)}
                className={errors.duration ? 'border-red-500' : ''}
                data-testid="input-course-duration"
              />
              {errors.duration && <p className="text-sm text-red-600 mt-1">{errors.duration}</p>}
            </div>

            <div>
              <Label htmlFor="courseStatus">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'draft') => handleChange('status', value)}>
                <SelectTrigger data-testid="select-course-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="courseTeacher">Instructor *</Label>
            <Select value={formData.teacherId} onValueChange={(value) => handleChange('teacherId', value)}>
              <SelectTrigger className={errors.teacherId ? 'border-red-500' : ''} data-testid="select-course-teacher">
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName} - {teacher.subjects?.join(', ') || 'No subjects assigned'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teacherId && <p className="text-sm text-red-600 mt-1">{errors.teacherId}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-course-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-course-save">
              {course ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}