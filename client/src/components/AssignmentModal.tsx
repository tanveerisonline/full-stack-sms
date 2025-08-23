import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/Common/Toast';
import { useTeachers } from '@/hooks/useTeachers';
import { useCourses } from '@/hooks/useCourses';
import { GRADES, SUBJECTS } from '@/utils/constants';
import type { Assignment, InsertAssignment } from '@shared/schema';

interface AssignmentModalProps {
  assignment?: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: InsertAssignment) => void;
}

export function AssignmentModal({ assignment, isOpen, onClose, onSave }: AssignmentModalProps) {
  const { addToast } = useToast();
  const { teachers = [] } = useTeachers();
  const { courses = [] } = useCourses();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    section: '',
    totalMarks: 100,
    dueDate: '',
    teacherId: null as number | null,
    status: 'active' as const,
    instructions: '',
    attachments: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjects = courses.length > 0 ? Array.from(new Set(courses.map(c => c.subject))) : SUBJECTS;

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        description: assignment.description || '',
        subject: assignment.subject,
        grade: assignment.grade,
        section: assignment.section || '',
        totalMarks: assignment.totalMarks || 100,
        dueDate: assignment.dueDate,
        teacherId: assignment.teacherId,
        status: 'active' as const,
        instructions: assignment.instructions || '',
        attachments: assignment.attachments || ''
      });
    } else {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setFormData({
        title: '',
        description: '',
        subject: '',
        grade: '',
        section: '',
        totalMarks: 100,
        dueDate: nextWeek.toISOString().split('T')[0],
        teacherId: null,
        status: 'active',
        instructions: '',
        attachments: ''
      });
    }
    setErrors({});
  }, [assignment, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Assignment title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (formData.totalMarks < 1) newErrors.totalMarks = 'Total marks must be at least 1';

    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      newErrors.dueDate = 'Due date cannot be in the past';
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

    const assignmentData = {
      ...formData,
      id: assignment?.id || `assignment_${Date.now()}`,
      dueDate: new Date(formData.dueDate).toISOString(),
      createdAt: assignment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(assignmentData);
    addToast(assignment ? 'Assignment updated successfully!' : 'Assignment created successfully!', 'success');
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
      <DialogContent className="max-w-2xl" data-testid="assignment-modal">
        <DialogHeader>
          <DialogTitle>
            {assignment ? 'Edit Assignment' : 'Create New Assignment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="assignmentTitle">Assignment Title *</Label>
            <Input
              id="assignmentTitle"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Algebra Problem Set Chapter 5"
              className={errors.title ? 'border-red-500' : ''}
              data-testid="input-assignment-title"
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="assignmentDescription">Description *</Label>
            <Textarea
              id="assignmentDescription"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide detailed instructions for the assignment..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
              data-testid="textarea-assignment-description"
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignmentSubject">Subject *</Label>
              <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)}>
                <SelectTrigger className={errors.subject ? 'border-red-500' : ''} data-testid="select-assignment-subject">
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
              <Label htmlFor="assignmentGrade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
                <SelectTrigger className={errors.grade ? 'border-red-500' : ''} data-testid="select-assignment-grade">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignmentMarks">Total Marks *</Label>
              <Input
                id="assignmentMarks"
                type="number"
                min="1"
                max="1000"
                value={formData.totalMarks}
                onChange={(e) => handleChange('totalMarks', parseInt(e.target.value) || 100)}
                className={errors.totalMarks ? 'border-red-500' : ''}
                data-testid="input-assignment-marks"
              />
              {errors.totalMarks && <p className="text-sm text-red-600 mt-1">{errors.totalMarks}</p>}
            </div>

            <div>
              <Label htmlFor="assignmentDueDate">Due Date *</Label>
              <Input
                id="assignmentDueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={errors.dueDate ? 'border-red-500' : ''}
                data-testid="input-assignment-due-date"
              />
              {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignmentTeacher">Teacher *</Label>
              <Select value={formData.teacherId?.toString() || ''} onValueChange={(value) => handleChange('teacherId', parseInt(value))}>
                <SelectTrigger className={errors.teacherId ? 'border-red-500' : ''} data-testid="select-assignment-teacher">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teacherId && <p className="text-sm text-red-600 mt-1">{errors.teacherId}</p>}
            </div>

            <div>
              <Label htmlFor="assignmentStatus">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => handleChange('status', value)}>
                <SelectTrigger data-testid="select-assignment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-assignment-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-assignment-save">
              {assignment ? 'Update Assignment' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}