// Academic Management Hooks
export { default as useAssignments } from './useAssignments';
export { default as useCourses } from './useCourses';
export { default as useTimetable } from './useTimetable';

// Timetable-specific hooks (re-exported from useTimetable)
export { useCreateTimetableEntry, useUpdateTimetableEntry, useDeleteTimetableEntry } from './useTimetable';

// Assignment-specific hooks (re-exported from useAssignments)
export { useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from './useAssignments';