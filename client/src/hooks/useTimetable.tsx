import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Timetable, InsertTimetable } from '@shared/schema';

// React Query hooks for timetable operations
export function useTimetable() {
  return useQuery<Timetable[]>({
    queryKey: ['/api/timetable'],
  });
}

export function useTimetableEntry(id: number) {
  return useQuery<Timetable>({
    queryKey: ['/api/timetable', id],
    enabled: !!id,
  });
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertTimetable) => {
      return apiRequest('POST', '/api/timetable', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
    },
  });
}

export function useUpdateTimetableEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTimetable> }) => {
      return apiRequest('PUT', `/api/timetable/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
    },
  });
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/timetable/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
    },
  });
}