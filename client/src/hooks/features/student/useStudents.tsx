import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { generateStudentId } from '@/utils/formatters';
import type { Student } from '@shared/schema';
import type { InsertStudent } from '@shared/schema';

function useStudents() {
  const queryClient = useQueryClient();

  // Query for fetching all students
  const { data: students = [], isLoading, error, refetch } = useQuery<Student[]>({
    queryKey: ['/api/students'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for creating a student
  const createMutation = useMutation({
    mutationFn: async (studentData: Omit<InsertStudent, 'rollNumber'>) => {
      // Generate a unique roll number based on timestamp to avoid conflicts
      const rollNumber = `STU${Date.now().toString().slice(-6)}`;
      const response = await apiRequest('POST', '/api/students', {
        ...studentData,
        rollNumber,
        status: 'active'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
    },
  });

  // Mutation for updating a student
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertStudent> }) => {
      const response = await apiRequest('PUT', `/api/students/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
    },
  });

  // Mutation for deleting a student
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
    },
  });

  // Helper functions
  const getStudentById = (id: number) => {
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
      student.email?.toLowerCase().includes(lowercaseQuery) ||
      student.rollNumber.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    students,
    isLoading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error,
    addStudent: createMutation.mutateAsync,
    updateStudent: (id: number, updates: Partial<InsertStudent>) => 
      updateMutation.mutateAsync({ id, updates }),
    deleteStudent: deleteMutation.mutateAsync,
    getStudentById,
    getStudentsByGrade,
    searchStudents,
    refreshStudents: refetch
  };
}
export default useStudents;
