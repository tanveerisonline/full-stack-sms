import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/Common/Toast';
import { useTeachers } from '@/hooks/useTeachers';
import { GRADES } from '@/utils/constants';
import type { Class, InsertClass } from '@shared/schema';

interface CourseModalProps {
  course?: Class | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: InsertClass) => void;
}

export function CourseModal({ course, isOpen, onClose, onSave }: CourseModalProps) {
  const { addToast } = useToast();
  const { teachers } = useTeachers();
  
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    subject: '',
    teacherId: null as number | null,
    room: '',
    schedule: '',
    maxStudents: 30,
    currentStudents: 0,
    status: 'active' as 'active' | 'inactive'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Computer Science', 'Physical Education',
    'Art', 'Music', 'Foreign Language', 'Economics', 'Psychology'
  ];

  const sections = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        grade: course.grade,
        section: course.section || '',
        subject: course.subject,
        teacherId: course.teacherId,
        room: course.room || '',
        schedule: course.schedule || '',
        maxStudents: course.maxStudents || 30,
        currentStudents: course.currentStudents || 0,
        status: course.status as 'active' | 'inactive'
      });
    } else {
      setFormData({
        name: '',
        grade: '',
        section: '',
        subject: '',
        teacherId: null,
        room: '',
        schedule: '',
        maxStudents: 30,
        currentStudents: 0,
        status: 'active'
      });
    }
    setErrors({});
  }, [course, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (formData.maxStudents < 1) newErrors.maxStudents = 'Max students must be at least 1';
    if (formData.currentStudents < 0) newErrors.currentStudents = 'Current students cannot be negative';
    if (formData.currentStudents > formData.maxStudents) {
      newErrors.currentStudents = 'Current students cannot exceed max students';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    const courseData: InsertClass = {
      name: formData.name,
      grade: formData.grade,
      section: formData.section || null,
      subject: formData.subject,
      teacherId: formData.teacherId,
      room: formData.room || null,
      schedule: formData.schedule || null,
      maxStudents: formData.maxStudents,
      currentStudents: formData.currentStudents,
      status: formData.status
    };

    onSave(courseData);
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTeacherName = (teacherId: number | null) => {
    if (!teacherId) return 'No teacher assigned';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown teacher';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {course ? 'Edit Class' : 'Add New Class'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Advanced Mathematics"
                className={errors.name ? 'border-red-500' : ''}
                data-testid="input-class-name"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)}>
                <SelectTrigger className={errors.subject ? 'border-red-500' : ''} data-testid="select-subject">
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
              {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
                <SelectTrigger className={errors.grade ? 'border-red-500' : ''} data-testid="select-grade">
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
              {errors.grade && <p className="text-sm text-red-500">{errors.grade}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select 
                value={formData.section || 'none'} 
                onValueChange={(value) => handleChange('section', value === 'none' ? '' : value)}
              >
                <SelectTrigger data-testid="select-section">
                  <SelectValue placeholder="Select section (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No section</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Select 
                value={formData.teacherId?.toString() || 'none'} 
                onValueChange={(value) => handleChange('teacherId', value === 'none' ? null : parseInt(value))}
              >
                <SelectTrigger data-testid="select-teacher">
                  <SelectValue placeholder="Select teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No teacher assigned</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.firstName} {teacher.lastName} - {teacher.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => handleChange('room', e.target.value)}
                placeholder="e.g., Room 101"
                data-testid="input-room"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students *</Label>
              <Input
                id="maxStudents"
                type="number"
                min="1"
                value={formData.maxStudents}
                onChange={(e) => handleChange('maxStudents', parseInt(e.target.value) || 1)}
                className={errors.maxStudents ? 'border-red-500' : ''}
                data-testid="input-max-students"
              />
              {errors.maxStudents && <p className="text-sm text-red-500">{errors.maxStudents}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentStudents">Current Students</Label>
              <Input
                id="currentStudents"
                type="number"
                min="0"
                value={formData.currentStudents}
                onChange={(e) => handleChange('currentStudents', parseInt(e.target.value) || 0)}
                className={errors.currentStudents ? 'border-red-500' : ''}
                data-testid="input-current-students"
              />
              {errors.currentStudents && <p className="text-sm text-red-500">{errors.currentStudents}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Textarea
              id="schedule"
              value={formData.schedule}
              onChange={(e) => handleChange('schedule', e.target.value)}
              placeholder="e.g., Mon, Wed, Fri 9:00-10:00 AM"
              rows={2}
              data-testid="textarea-schedule"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save">
              {course ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}