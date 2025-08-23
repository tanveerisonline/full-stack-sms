import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Student, AttendanceRecord } from '@/types';
import { Save } from 'lucide-react';

interface AttendanceGridProps {
  students: Student[];
  date: string;
  existingAttendance: AttendanceRecord[];
  onSave: (attendanceData: any[]) => void;
}

interface AttendanceEntry {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  notes: string;
}

function AttendanceGrid({ students, date, existingAttendance, onSave }: AttendanceGridProps) {
  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([]);

  useEffect(() => {
    // Initialize attendance data with existing records or default to 'present'
    const initialData = students.map(student => {
      const existingRecord = existingAttendance.find(record => record.studentId === student.id);
      return {
        studentId: student.id,
        status: existingRecord?.status || 'present' as 'present' | 'absent' | 'late',
        notes: existingRecord?.notes || ''
      };
    });
    setAttendanceData(initialData);
  }, [students, existingAttendance]);

  const updateAttendance = (studentId: string, field: 'status' | 'notes', value: string) => {
    setAttendanceData(prev => 
      prev.map(entry => 
        entry.studentId === studentId 
          ? { ...entry, [field]: value }
          : entry
      )
    );
  };

  const handleSave = () => {
    const attendanceRecords = attendanceData.map(entry => ({
      studentId: entry.studentId,
      date,
      status: entry.status,
      notes: entry.notes,
      markedBy: 'current-user' // This would be the logged-in user ID
    }));
    onSave(attendanceRecords);
  };

  const getStatusCount = (status: 'present' | 'absent' | 'late') => {
    return attendanceData.filter(entry => entry.status === status).length;
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No students found for the selected class.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="attendance-grid">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600" data-testid="count-present">
            {getStatusCount('present')}
          </div>
          <div className="text-sm text-green-800">Present</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600" data-testid="count-absent">
            {getStatusCount('absent')}
          </div>
          <div className="text-sm text-red-800">Absent</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600" data-testid="count-late">
            {getStatusCount('late')}
          </div>
          <div className="text-sm text-yellow-800">Late</div>
        </div>
      </div>

      {/* Attendance Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 font-medium text-slate-600">Student</th>
              <th className="text-left px-6 py-4 font-medium text-slate-600">Roll No.</th>
              <th className="text-center px-6 py-4 font-medium text-slate-600">Present</th>
              <th className="text-center px-6 py-4 font-medium text-slate-600">Late</th>
              <th className="text-center px-6 py-4 font-medium text-slate-600">Absent</th>
              <th className="text-left px-6 py-4 font-medium text-slate-600">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student, index) => {
              const attendance = attendanceData.find(entry => entry.studentId === student.id);
              
              return (
                <tr key={student.id} className="hover:bg-slate-50" data-testid={`attendance-row-${student.id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
                        <AvatarFallback>
                          {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-800" data-testid={`student-name-${student.id}`}>
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600" data-testid={`student-roll-${student.id}`}>
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="radio"
                      name={`attendance_${student.id}`}
                      value="present"
                      checked={attendance?.status === 'present'}
                      onChange={() => updateAttendance(student.id, 'status', 'present')}
                      className="text-green-600 focus:ring-green-500"
                      data-testid={`radio-present-${student.id}`}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="radio"
                      name={`attendance_${student.id}`}
                      value="late"
                      checked={attendance?.status === 'late'}
                      onChange={() => updateAttendance(student.id, 'status', 'late')}
                      className="text-yellow-600 focus:ring-yellow-500"
                      data-testid={`radio-late-${student.id}`}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="radio"
                      name={`attendance_${student.id}`}
                      value="absent"
                      checked={attendance?.status === 'absent'}
                      onChange={() => updateAttendance(student.id, 'status', 'absent')}
                      className="text-red-600 focus:ring-red-500"
                      data-testid={`radio-absent-${student.id}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Textarea
                      placeholder="Add note..."
                      value={attendance?.notes || ''}
                      onChange={(e) => updateAttendance(student.id, 'notes', e.target.value)}
                      className="w-full min-h-[40px] resize-none"
                      rows={1}
                      data-testid={`notes-${student.id}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center space-x-2" data-testid="button-save-attendance">
          <Save className="w-4 h-4" />
          <span>Save Attendance</span>
        </Button>
      </div>
    </div>
  );
}
export default AttendanceGrid;
