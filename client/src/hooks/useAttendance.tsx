import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { AttendanceRecord } from '@/types';

export function useAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const loadAttendanceRecords = () => {
    try {
      const records = dataService.getAttendanceRecords();
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  };

  const markAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const newRecord = dataService.addAttendanceRecord(attendanceData);
      setAttendanceRecords(prev => {
        // Remove existing record for same student and date, then add new one
        const filtered = prev.filter(record => 
          !(record.studentId === attendanceData.studentId && record.date === attendanceData.date)
        );
        return [...filtered, newRecord];
      });
      return newRecord;
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

  const getAttendanceByStudent = (studentId: string) => {
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
    
    const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

    return {
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
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

  const getStudentAttendanceRate = (studentId: string, startDate?: string, endDate?: string) => {
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
