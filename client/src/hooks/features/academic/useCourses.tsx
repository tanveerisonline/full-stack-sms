import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Class, InsertClass } from '@shared/schema';

function useCourses() {
  const queryClient = useQueryClient();

  // Query for fetching all courses/classes
  const { data: courses = [], isLoading, error, refetch } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
  
  // Handle errors in a useEffect or component level
  if (error) {
    console.error('Failed to fetch courses:', error);
  }

  // Mutation for creating a course
  const createMutation = useMutation({
    mutationFn: async (courseData: InsertClass) => {
      try {
        const response = await apiRequest('/api/classes', {
          method: 'POST',
          body: JSON.stringify(courseData)
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to create course: ${response.status} - ${errorData}`);
        }
        return response.json();
      } catch (error) {
        console.error('Create course error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
    },
    onError: (error) => {
      console.error('Failed to create course:', error);
    }
  });

  // Mutation for updating a course
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertClass> }) => {
      try {
        const response = await apiRequest(`/api/classes/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to update course: ${response.status} - ${errorData}`);
        }
        return response.json();
      } catch (error) {
        console.error('Update course error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
    },
    onError: (error) => {
      console.error('Failed to update course:', error);
    }
  });

  // Mutation for deleting a course
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        const response = await apiRequest(`/api/classes/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to delete course: ${response.status} - ${errorData}`);
        }
        return response;
      } catch (error) {
        console.error('Delete course error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
    },
    onError: (error) => {
      console.error('Failed to delete course:', error);
    }
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
