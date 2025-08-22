import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import { Student } from '@/types';
import { generateStudentId } from '@/utils/formatters';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    try {
      const studentsData = dataService.getStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'rollNumber'>) => {
    setIsLoading(true);
    try {
      const rollNumber = generateStudentId(students.length);
      const newStudent = dataService.addStudent({
        ...studentData,
        rollNumber,
        status: 'active'
      });
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    setIsLoading(true);
    try {
      const updatedStudent = dataService.updateStudent(id, updates);
      if (updatedStudent) {
        setStudents(prev => prev.map(student => 
          student.id === id ? updatedStudent : student
        ));
        return updatedStudent;
      }
      throw new Error('Student not found');
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (id: string) => {
    setIsLoading(true);
    try {
      const success = dataService.deleteStudent(id);
      if (success) {
        setStudents(prev => prev.filter(student => student.id !== id));
      } else {
        throw new Error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentById = (id: string) => {
    return students.find(student => student.id === id);
  };

  const getStudentsByGrade = (grade: string) => {
    return students.filter(student => student.grade === grade);
  };

  const searchStudents = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return students.filter(student =>
      student.firstName.toLowerCase().includes(lowercaseQuery) ||
      student.lastName.toLowerCase().includes(lowercaseQuery) ||
      student.email.toLowerCase().includes(lowercaseQuery) ||
      student.rollNumber.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    students,
    isLoading,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    getStudentsByGrade,
    searchStudents,
    refreshStudents: loadStudents
  };
}
