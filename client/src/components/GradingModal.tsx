import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';

interface GradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gradeData: any) => void;
  selectedStudent?: any;
}

export function GradingModal({ isOpen, onClose, onSave, selectedStudent }: GradingModalProps) {
  const { addToast } = useToast();
  const courses = dataService.getCourses();
  const assignments = dataService.getAssignments();
  
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    subject: '',
    assignmentId: '',
    gradeType: 'assignment' as 'assignment' | 'exam' | 'quiz' | 'project',
    score: '',
    totalMarks: '100',
    percentage: '',
    grade: '',
    comments: '',
    examDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const gradeTypes = [
    { value: 'assignment', label: 'Assignment' },
    { value: 'exam', label: 'Exam' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'project', label: 'Project' }
  ];

  const subjects = Array.from(new Set(courses.map(c => c.subject)));

  useEffect(() => {
    if (selectedStudent && isOpen) {
      setFormData(prev => ({
        ...prev,
        studentId: selectedStudent.id,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`
      }));
    } else if (!selectedStudent) {
      setFormData({
        studentId: '',
        studentName: '',
        subject: '',
        assignmentId: '',
        gradeType: 'assignment',
        score: '',
        totalMarks: '100',
        percentage: '',
        grade: '',
        comments: '',
        examDate: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [selectedStudent, isOpen]);

  const calculateGrade = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  };

  const handleScoreChange = (score: string) => {
    const scoreNum = parseFloat(score);
    const totalNum = parseFloat(formData.totalMarks);
    
    if (!isNaN(scoreNum) && !isNaN(totalNum) && totalNum > 0) {
      const percentage = ((scoreNum / totalNum) * 100).toFixed(2);
      const grade = calculateGrade(scoreNum, totalNum);
      
      setFormData(prev => ({
        ...prev,
        score,
        percentage,
        grade
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        score,
        percentage: '',
        grade: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId) newErrors.studentId = 'Student is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.gradeType) newErrors.gradeType = 'Grade type is required';
    if (!formData.score) newErrors.score = 'Score is required';
    if (!formData.totalMarks) newErrors.totalMarks = 'Total marks is required';
    
    const score = parseFloat(formData.score);
    const total = parseFloat(formData.totalMarks);
    
    if (isNaN(score) || score < 0) newErrors.score = 'Score must be a valid positive number';
    if (isNaN(total) || total <= 0) newErrors.totalMarks = 'Total marks must be a valid positive number';
    if (!isNaN(score) && !isNaN(total) && score > total) newErrors.score = 'Score cannot exceed total marks';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    const gradeData = {
      ...formData,
      id: `grade_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(gradeData);
    addToast('Grade recorded successfully!', 'success');
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const filteredAssignments = assignments.filter(assignment => 
    assignment.subject === formData.subject
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-grading-modal-title">
            Enter Grade
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentName">Student *</Label>
              <Input
                id="studentName"
                value={formData.studentName}
                readOnly
                className="bg-gray-50"
                data-testid="input-student-name"
              />
              {errors.studentId && <p className="text-sm text-red-600 mt-1">{errors.studentId}</p>}
            </div>

            <div>
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
              {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gradeType">Grade Type *</Label>
              <Select value={formData.gradeType} onValueChange={(value: any) => handleChange('gradeType', value)}>
                <SelectTrigger className={errors.gradeType ? 'border-red-500' : ''} data-testid="select-grade-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gradeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gradeType && <p className="text-sm text-red-600 mt-1">{errors.gradeType}</p>}
            </div>

            {formData.gradeType === 'assignment' && (
              <div>
                <Label htmlFor="assignment">Assignment</Label>
                <Select value={formData.assignmentId} onValueChange={(value) => handleChange('assignmentId', value)}>
                  <SelectTrigger data-testid="select-assignment">
                    <SelectValue placeholder="Select assignment (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAssignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.gradeType === 'exam' && (
              <div>
                <Label htmlFor="examDate">Exam Date</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => handleChange('examDate', e.target.value)}
                  data-testid="input-exam-date"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="score">Score *</Label>
              <Input
                id="score"
                type="number"
                step="0.01"
                value={formData.score}
                onChange={(e) => handleScoreChange(e.target.value)}
                className={errors.score ? 'border-red-500' : ''}
                data-testid="input-score"
              />
              {errors.score && <p className="text-sm text-red-600 mt-1">{errors.score}</p>}
            </div>

            <div>
              <Label htmlFor="totalMarks">Total Marks *</Label>
              <Input
                id="totalMarks"
                type="number"
                step="0.01"
                value={formData.totalMarks}
                onChange={(e) => handleChange('totalMarks', e.target.value)}
                className={errors.totalMarks ? 'border-red-500' : ''}
                data-testid="input-total-marks"
              />
              {errors.totalMarks && <p className="text-sm text-red-600 mt-1">{errors.totalMarks}</p>}
            </div>

            <div>
              <Label htmlFor="percentage">Percentage</Label>
              <Input
                id="percentage"
                value={formData.percentage ? `${formData.percentage}%` : ''}
                readOnly
                className="bg-gray-50"
                data-testid="input-percentage"
              />
            </div>

            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                value={formData.grade}
                readOnly
                className="bg-gray-50"
                data-testid="input-grade"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => handleChange('comments', e.target.value)}
              placeholder="Additional comments about the grade..."
              className="min-h-[80px]"
              data-testid="textarea-comments"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-grade-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-grade-save">
              Save Grade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}