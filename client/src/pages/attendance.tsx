import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AttendanceGrid } from '@/components/features/attendance';
import { useAttendance } from '@/hooks/features/attendance';
import { useStudents } from '@/hooks/features/student';
import { useToast } from '@/components/Common/Toast';
import { GRADES } from '@/utils/constants';
import { formatDate, formatPercentage } from '@/utils/formatters';
import { exportToCSV } from '@/utils/csvExport';
import { CheckCircle, Calendar, Clock, Download, Printer } from 'lucide-react';

export default function Attendance() {
  const { addToast } = useToast();
  const { students } = useStudents();
  const { attendanceRecords, markAttendance, getAttendanceStats, loadAttendanceRecords } = useAttendance();
  
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load attendance when grade, section, or date changes
  useEffect(() => {
    loadAttendanceRecords(selectedGrade, selectedSection, selectedDate);
  }, [selectedGrade, selectedSection, selectedDate]);

  const filteredStudents = students.filter(student => 
    student.grade === selectedGrade && student.status === 'active'
  );

  const todayAttendance = attendanceRecords.filter(record => 
    record.date === selectedDate
  );

  const stats = getAttendanceStats(selectedDate);

  const handleMarkAttendance = async (attendanceData: any[]) => {
    try {
      for (const record of attendanceData) {
        await markAttendance({
          ...record,
          grade: selectedGrade,
          section: selectedSection
        });
      }
      // Refresh attendance data after submission
      await loadAttendanceRecords(selectedGrade, selectedSection, selectedDate);
      addToast('Attendance marked successfully!', 'success');
    } catch (error) {
      addToast('Failed to mark attendance. Please try again.', 'error');
    }
  };

  const handleExport = () => {
    try {
      const exportData = filteredStudents.map(student => {
        const studentAttendance = attendanceRecords.filter(record => 
          record.studentId === student.id && record.date === selectedDate
        );
        const attendance = studentAttendance[0];
        
        return {
          'Student ID': student.rollNumber,
          'Name': `${student.firstName} ${student.lastName}`,
          'Grade': student.grade,
          'Date': selectedDate,
          'Status': attendance ? attendance.status : 'Not marked',
          'Notes': attendance?.remarks || 'N/A'
        };
      });
      
      exportToCSV(exportData, `attendance_${selectedGrade}_${selectedDate}`);
      addToast('Attendance exported successfully!', 'success');
    } catch (error) {
      addToast('Failed to export attendance.', 'error');
    }
  };

  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      const printContent = `
        <html>
          <head>
            <title>Attendance Report - ${selectedGrade} Section ${selectedSection}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .present { color: green; font-weight: bold; }
              .absent { color: red; font-weight: bold; }
              .late { color: orange; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>EduManage Pro - Attendance Report</h2>
              <h3>${selectedGrade} Section ${selectedSection}</h3>
              <p>Date: ${selectedDate}</p>
            </div>
            <div class="info">
              <p><strong>Total Students:</strong> ${filteredStudents.length}</p>
              <p><strong>Present:</strong> ${stats.presentCount}</p>
              <p><strong>Absent:</strong> ${stats.absentCount}</p>
              <p><strong>Late:</strong> ${stats.lateCount}</p>
              <p><strong>Attendance Rate:</strong> ${stats.attendanceRate}%</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStudents.map(student => {
                  const attendance = attendanceRecords.find(record => 
                    record.studentId === student.id && record.date === selectedDate
                  );
                  const status = attendance?.status || 'Not marked';
                  const statusClass = status === 'present' ? 'present' : 
                                    status === 'absent' ? 'absent' : 
                                    status === 'late' ? 'late' : '';
                  
                  return `
                    <tr>
                      <td>${student.rollNumber}</td>
                      <td>${student.firstName} ${student.lastName}</td>
                      <td class="${statusClass}">${status}</td>
                      <td>${attendance?.remarks || 'N/A'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      addToast('Attendance report sent to printer!', 'success');
    } catch (error) {
      addToast('Failed to print attendance report.', 'error');
    }
  };

  return (
    <div className="space-y-8" data-testid="attendance-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Attendance System
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Track and manage student attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} data-testid="button-export-attendance">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handlePrint} data-testid="button-print-attendance">
            <Printer className="w-4 h-4 mr-2" />
            Printer
          </Button>
        </div>
      </div>

      {/* Attendance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Today's Attendance</p>
                <p className="text-3xl font-bold text-slate-800">
                  {formatPercentage(stats.attendanceRate)}
                </p>
                <p className="text-sm text-green-600">
                  {stats.presentCount} of {stats.totalStudents} present
                </p>
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
                <p className="text-sm font-medium text-slate-600">This Week Average</p>
                <p className="text-3xl font-bold text-slate-800">92.8%</p>
                <p className="text-sm text-red-600">-1.2% from last week</p>
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
                <p className="text-sm font-medium text-slate-600">Late Arrivals</p>
                <p className="text-3xl font-bold text-slate-800">{stats.lateCount}</p>
                <p className="text-sm text-yellow-600">Students today</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Selection and Attendance Grid */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <CardTitle>Mark Attendance</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-40" data-testid="select-grade">
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
              
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-32" data-testid="select-section">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
                data-testid="input-date"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <AttendanceGrid
            students={filteredStudents}
            date={selectedDate}
            existingAttendance={todayAttendance}
            onSave={handleMarkAttendance}
          />
        </CardContent>
      </Card>

      {/* Recent Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(7)].map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() - index);
              const dateStr = date.toISOString().split('T')[0];
              const dayStats = getAttendanceStats(dateStr);
              
              return (
                <div key={dateStr} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {formatDate(dateStr)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Present</p>
                      <p className="font-semibold text-green-600">{dayStats.presentCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Absent</p>
                      <p className="font-semibold text-red-600">{dayStats.absentCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Late</p>
                      <p className="font-semibold text-yellow-600">{dayStats.lateCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Rate</p>
                      <p className="font-semibold text-slate-800">
                        {formatPercentage(dayStats.attendanceRate)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
