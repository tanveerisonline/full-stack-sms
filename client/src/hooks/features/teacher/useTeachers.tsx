import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Teacher, InsertTeacher } from '@shared/schema';

function useTeachers() {
  const queryClient = useQueryClient();

  // Query for fetching all teachers
  const { data: teachers = [], isLoading, error, refetch } = useQuery<Teacher[]>({
    queryKey: ['/api/teachers'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for creating a teacher
  const createMutation = useMutation({
    mutationFn: async (teacherData: InsertTeacher) => {
      const response = await apiRequest('POST', '/api/teachers', teacherData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
    },
  });

  // Mutation for updating a teacher
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertTeacher> }) => {
      const response = await apiRequest('PUT', `/api/teachers/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
    },
  });

  // Mutation for deleting a teacher
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
    },
  });

  // Helper functions
  const getTeacherById = (id: number) => {
    return teachers.find(teacher => teacher.id === id);
  };

  const getTeachersByDepartment = (department: string) => {
    return teachers.filter(teacher => teacher.department === department);
  };

  const getTeachersBySubject = (subject: string) => {
    return teachers.filter(teacher => teacher.subject === subject);
  };

  const searchTeachers = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return teachers.filter(teacher =>
      teacher.firstName.toLowerCase().includes(lowercaseQuery) ||
      teacher.lastName.toLowerCase().includes(lowercaseQuery) ||
      teacher.email?.toLowerCase().includes(lowercaseQuery) ||
      teacher.department?.toLowerCase().includes(lowercaseQuery) ||
      teacher.subject?.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    teachers,
    isLoading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error,
    addTeacher: createMutation.mutateAsync,
    updateTeacher: (id: number, updates: Partial<InsertTeacher>) => 
      updateMutation.mutateAsync({ id, updates }),
    deleteTeacher: deleteMutation.mutateAsync,
    getTeacherById,
    getTeachersByDepartment,
    getTeachersBySubject,
    searchTeachers,
    refreshTeachers: refetch
  };
}export default useTeachers
