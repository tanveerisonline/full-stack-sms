import { useState, useEffect } from 'react';
import { AttendanceRecord } from '@/types';

function useAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const loadAttendanceRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance');
      if (response.ok) {
        const records = await response.json();
        setAttendanceRecords(records);
      }
    } catch (error) {
      console.error('Error loading attendance records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAttendance = async (attendanceData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(attendanceData.studentId),
          date: attendanceData.date,
          status: attendanceData.status,
          remarks: attendanceData.remarks || attendanceData.notes
        }),
      });
      
      if (response.ok) {
        await loadAttendanceRecords(); // Refresh data
        return await response.json();
      } else {
        throw new Error('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceByDate = (date: string) => {
    return attendanceRecords.filter(record => record.date === date);
  };

  const getAttendanceByStudent = (studentId: number) => {
    return attendanceRecords.filter(record => record.studentId === studentId);
  };

  const getAttendanceStats = (date?: string) => {
    let records = attendanceRecords;
    
    if (date) {
      records = records.filter(record => record.date === date);
    }

    const totalStudents = new Set(records.map(record => record.studentId)).size;
    const presentCount = records.filter(record => record.status === 'present').length;
    const absentCount = records.filter(record => record.status === 'absent').length;
    const lateCount = records.filter(record => record.status === 'late').length;
    const holidayCount = records.filter(record => record.status === 'holiday').length;
    
    const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

    return {
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      holidayCount,
      attendanceRate
    };
  };

  const getAttendanceByDateRange = (startDate: string, endDate: string) => {
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return recordDate >= start && recordDate <= end;
    });
  };

  const getStudentAttendanceRate = (studentId: number, startDate?: string, endDate?: string) => {
    let records = attendanceRecords.filter(record => record.studentId === studentId);
    
    if (startDate && endDate) {
      records = records.filter(record => {
        const recordDate = new Date(record.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return recordDate >= start && recordDate <= end;
      });
    }

    const totalDays = records.length;
    const presentDays = records.filter(record => record.status === 'present').length;
    
    return totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
  };

  return {
    attendanceRecords,
    isLoading,
    markAttendance,
    getAttendanceByDate,
    getAttendanceByStudent,
    getAttendanceStats,
    getAttendanceByDateRange,
    getStudentAttendanceRate,
    refreshAttendance: loadAttendanceRecords
  };
}
export { useAttendance };
export default useAttendance;
