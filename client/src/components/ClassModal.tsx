import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { GRADES, SUBJECTS } from '@/utils/constants';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: any) => void;
  selectedDay?: number;
  selectedTime?: string;
}

export function ClassModal({ isOpen, onClose, onSave, selectedDay, selectedTime }: ClassModalProps) {
  const { addToast } = useToast();
  const teachers = dataService.getTeachers();
  const courses = dataService.getCourses();
  
  const [formData, setFormData] = useState({
    subject: '',
    teacherId: '',
    room: '',
    grade: 'Grade 10',
    section: 'A',
    dayOfWeek: selectedDay || 1,
    startTime: selectedTime?.split(' - ')[0] || '08:00',
    endTime: selectedTime?.split(' - ')[1] || '09:00',
    status: 'scheduled' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjects = courses.length > 0 ? Array.from(new Set(courses.map(c => c.subject))) : SUBJECTS;
  const rooms = [
    'Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203',
    'Laboratory A', 'Laboratory B', 'Computer Lab', 'Library', 'Auditorium',
    'Gymnasium', 'Art Room', 'Music Room'
  ];

  const days = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    if (selectedDay && selectedTime) {
      setFormData(prev => ({
        ...prev,
        dayOfWeek: selectedDay,
        startTime: selectedTime.split(' - ')[0],
        endTime: selectedTime.split(' - ')[1]
      }));
    }
  }, [selectedDay, selectedTime]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (!formData.room) newErrors.room = 'Room is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    const classData = {
      ...formData,
      id: `class_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(classData);
    addToast('Class scheduled successfully!', 'success');
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
      <DialogContent className="max-w-md" data-testid="class-modal">
        <DialogHeader>
          <DialogTitle>Schedule New Class</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="classSubject">Subject *</Label>
            <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)}>
              <SelectTrigger className={errors.subject ? 'border-red-500' : ''} data-testid="select-class-subject">
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
            <Label htmlFor="classTeacher">Teacher *</Label>
            <Select value={formData.teacherId} onValueChange={(value) => handleChange('teacherId', value)}>
              <SelectTrigger className={errors.teacherId ? 'border-red-500' : ''} data-testid="select-class-teacher">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teacherId && <p className="text-sm text-red-600 mt-1">{errors.teacherId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="classGrade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
                <SelectTrigger data-testid="select-class-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="classSection">Section</Label>
              <Select value={formData.section} onValueChange={(value) => handleChange('section', value)}>
                <SelectTrigger data-testid="select-class-section">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="classRoom">Room *</Label>
            <Select value={formData.room} onValueChange={(value) => handleChange('room', value)}>
              <SelectTrigger className={errors.room ? 'border-red-500' : ''} data-testid="select-class-room">
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.room && <p className="text-sm text-red-600 mt-1">{errors.room}</p>}
          </div>

          <div>
            <Label htmlFor="classDay">Day</Label>
            <Select value={formData.dayOfWeek.toString()} onValueChange={(value) => handleChange('dayOfWeek', parseInt(value))}>
              <SelectTrigger data-testid="select-class-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                data-testid="input-start-time"
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                data-testid="input-end-time"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-class-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-class-save">
              Schedule Class
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}