import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Assignment, InsertAssignment } from '@shared/schema';

// React Query hooks for assignment operations
export function useAssignments() {
  return useQuery<Assignment[]>({
    queryKey: ['/api/assignments'],
  });
}

export function useAssignment(id: number) {
  return useQuery<Assignment>({
    queryKey: ['/api/assignments', id],
    enabled: !!id,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertAssignment) => {
      return apiRequest('POST', '/api/assignments', data);
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
      return apiRequest('PUT', `/api/assignments/${id}`, data);
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
      return apiRequest('DELETE', `/api/assignments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
    },
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, submissionData }: { assignmentId: number; submissionData: any }) => {
      return apiRequest('POST', `/api/assignments/${assignmentId}/submit`, submissionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
    },
  });
}

export function useGradeAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assignmentId, gradeData }: { assignmentId: number; gradeData: any }) => {
      return apiRequest('POST', `/api/assignments/${assignmentId}/grade`, gradeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
    },
  });
}