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
      return apiRequest('/api/timetable', 'POST', data);
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
      return apiRequest(`/api/timetable/${id}`, 'PUT', data);
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
      return apiRequest(`/api/timetable/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
    },
  });
}