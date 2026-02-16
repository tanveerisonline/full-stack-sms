import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Assignment, InsertAssignment } from '@shared/schema';

// React Query hooks for assignment operations
function useAssignments() {
  return useQuery<Assignment[]>({
    queryKey: ['/api/assignments'],
  });
}

function useAssignment(id: number) {
  return useQuery<Assignment>({
    queryKey: ['/api/assignments', id],
    enabled: !!id,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertAssignment) => {
      return apiRequest('/api/assignments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAssignment> }) => {
      return apiRequest(`/api/assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/assignments/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
    },
  });
}

function useSubmitAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, studentId, submission }: { 
      assignmentId: number; 
      studentId: number; 
      submission: string; 
    }) => {
      return apiRequest(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          submission,
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
    },
  });
}

function useGradeAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, studentId, grade, feedback }: { 
      assignmentId: number; 
      studentId: number; 
      grade: number; 
      feedback?: string; 
    }) => {
      return apiRequest(`/api/assignments/${assignmentId}/grade`, {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          grade,
          feedback,
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
    },
  });
}

export default useAssignments;