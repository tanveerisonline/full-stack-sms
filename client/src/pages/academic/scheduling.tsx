import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ClassModal } from '@/components/ClassModal';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { exportToCSV } from '@/utils/csvExport';
import { GRADES } from '@/utils/constants';
import { Plus, Calendar, Clock, MapPin, User, Download } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const TIME_SLOTS = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
  '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00'
];

export default function Scheduling() {
  const { addToast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [schedules, setSchedules] = useState(dataService.getClassSchedules());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  
  const courses = dataService.getCourses();
  const teachers = dataService.getTeachers();

  const filteredSchedules = schedules.filter(schedule => 
    schedule.grade === selectedGrade && schedule.section === selectedSection
  );

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'TBA';
  };

  const getScheduleForSlot = (dayOfWeek: number, timeSlot: string) => {
    const [startTime] = timeSlot.split(' - ');
    return filteredSchedules.find(schedule => 
      schedule.dayOfWeek === dayOfWeek && schedule.startTime === startTime
    );
  };

  const handleAddClass = () => {
    setSelectedDay(undefined);
    setSelectedTime(undefined);
    setIsModalOpen(true);
  };

  const handleCellClick = (dayOfWeek: number, timeSlot: string) => {
    setSelectedDay(dayOfWeek);
    setSelectedTime(timeSlot);
    setIsModalOpen(true);
  };

  const handleSaveClass = (classData: any) => {
    setSchedules(prev => [...prev, classData]);
  };

  const handleExportSchedule = () => {
    try {
      const exportData = filteredSchedules.map(schedule => ({
        'Day': DAYS_OF_WEEK[schedule.dayOfWeek],
        'Time': `${schedule.startTime} - ${schedule.endTime}`,
        'Subject': schedule.subject,
        'Teacher': getTeacherName(schedule.teacherId),
        'Room': schedule.room,
        'Grade': schedule.grade,
        'Section': schedule.section
      }));
      
      exportToCSV(exportData, `schedule_${selectedGrade}_${selectedSection}`);
      addToast('Schedule exported successfully!', 'success');
    } catch (error) {
      addToast('Failed to export schedule.', 'error');
    }
  };

  return (
    <div className="space-y-8" data-testid="scheduling-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Class Scheduling
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage class schedules and timetables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportSchedule} data-testid="button-export-schedule">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddClass} data-testid="button-add-class">
            <Plus className="w-5 h-5 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Grade</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger data-testid="select-grade">
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
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger data-testid="select-section">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" data-testid="button-export-schedule">
                <Calendar className="w-4 h-4 mr-2" />
                Export Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-timetable-title">
            Weekly Timetable - {selectedGrade} Section {selectedSection}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-slate-200 p-3 bg-slate-50 text-left font-medium text-slate-700">
                    Time
                  </th>
                  {DAYS_OF_WEEK.slice(1, 7).map((day, index) => (
                    <th key={day} className="border border-slate-200 p-3 bg-slate-50 text-center font-medium text-slate-700">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border border-slate-200 p-3 font-medium text-slate-700 bg-slate-50">
                      {timeSlot}
                    </td>
                    {DAYS_OF_WEEK.slice(1, 7).map((day, dayIndex) => {
                      const schedule = getScheduleForSlot(dayIndex + 1, timeSlot);
                      return (
                        <td key={`${day}-${timeSlot}`} className="border border-slate-200 p-2">
                          {schedule ? (
                            <div 
                              className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:bg-blue-100 transition-colors cursor-pointer"
                              onClick={() => handleCellClick(dayIndex + 1, timeSlot)}
                              data-testid={`schedule-cell-${dayIndex}-${timeSlot.replace(/[:\s-]/g, '')}`}
                            >
                              <div className="font-medium text-blue-900 text-sm mb-1">
                                {schedule.subject}
                              </div>
                              <div className="flex items-center text-xs text-blue-700 mb-1">
                                <User className="w-3 h-3 mr-1" />
                                {getTeacherName(schedule.teacherId)}
                              </div>
                              <div className="flex items-center text-xs text-blue-700">
                                <MapPin className="w-3 h-3 mr-1" />
                                {schedule.room}
                              </div>
                              <Badge 
                                variant="outline" 
                                className="mt-1 text-xs border-blue-300 text-blue-700"
                              >
                                {schedule.status}
                              </Badge>
                            </div>
                          ) : (
                            <div 
                              className="h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:border-slate-300 transition-colors cursor-pointer"
                              onClick={() => handleCellClick(dayIndex + 1, timeSlot)}
                              data-testid={`empty-slot-${dayIndex}-${timeSlot.replace(/[:\s-]/g, '')}`}
                            >
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Classes This Week</p>
                <p className="text-3xl font-bold text-slate-800">
                  {filteredSchedules.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Hours</p>
                <p className="text-3xl font-bold text-slate-800">
                  {filteredSchedules.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Subjects</p>
                <p className="text-3xl font-bold text-slate-800">
                  {new Set(filteredSchedules.map(s => s.subject)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Modal */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClass}
        selectedDay={selectedDay}
        selectedTime={selectedTime}
      />
    </div>
  );
}
