import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Class, InsertClass } from '@shared/schema';

function useCourses() {
  const queryClient = useQueryClient();

  // Query for fetching all courses/classes
  const { data: courses = [], isLoading, error, refetch } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for creating a course
  const createMutation = useMutation({
    mutationFn: async (courseData: InsertClass) => {
      const response = await apiRequest('POST', '/api/classes', courseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
    },
  });

  // Mutation for updating a course
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertClass> }) => {
      const response = await apiRequest('PUT', `/api/classes/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
    },
  });

  // Mutation for deleting a course
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
    },
  });

  // Helper functions
  const getCourseById = (id: number) => {
    return courses.find(course => course.id === id);
  };

  const getCoursesByGrade = (grade: string) => {
    return courses.filter(course => course.grade === grade);
  };

  const getCoursesByTeacher = (teacherId: number) => {
    return courses.filter(course => course.teacherId === teacherId);
  };

  const searchCourses = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return courses.filter(course =>
      course.name.toLowerCase().includes(lowercaseQuery) ||
      course.subject.toLowerCase().includes(lowercaseQuery) ||
      course.grade.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    courses,
    isLoading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error,
    addCourse: createMutation.mutateAsync,
    updateCourse: (id: number, updates: Partial<InsertClass>) => 
      updateMutation.mutateAsync({ id, updates }),
    deleteCourse: deleteMutation.mutateAsync,
    getCourseById,
    getCoursesByGrade,
    getCoursesByTeacher,
    searchCourses,
    refreshCourses: refetch
  };
}export default useCourses
