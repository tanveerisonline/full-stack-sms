import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { StudentTable, StudentForm, StudentDetailModal } from '@/components/features/student';

type Student = {
  id: number;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  grade: string;
  section: string | null;
  admissionDate: string;
  parentName: string | null;
  parentContact: string | null;
  parentEmail: string | null;
  address: string | null;
  status: string;
  avatar: string | null;
  bloodGroup: string | null;
  medicalInfo: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function StudentRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Fetch students
  const { data: students = [] as Student[], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['/api/students'],
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      return apiRequest('/api/students', {
        method: 'POST',
        body: studentData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Student Added",
        description: "New student has been registered successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register student. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      return apiRequest(`/api/students/${editingStudent?.id}`, {
        method: 'PUT',
        body: studentData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Student Updated",
        description: "Student information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      setEditingStudent(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update student. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest(`/api/students/${studentId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Student Deleted",
        description: "Student has been removed from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddStudent = (studentData: any) => {
    addStudentMutation.mutate(studentData);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleUpdateStudent = (studentData: any) => {
    updateStudentMutation.mutate(studentData);
  };

  const handleDeleteStudent = (studentId: string | number) => {
    deleteStudentMutation.mutate(Number(studentId));
  };

  const handleViewStudent = (student: Student) => {
    setViewingStudent(student);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-8" data-testid="student-registration-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Student Registration & Enrollment
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Register new students and manage enrollment process
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-primary-600 hover:bg-primary-700"
          data-testid="button-add-student"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Student
        </Button>
      </div>

      {/* Students Table */}
      <StudentTable
        students={students}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        onView={handleViewStudent}
      />

      {/* Student Form Modal */}
      <StudentForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
        student={editingStudent}
        isLoading={addStudentMutation.isPending || updateStudentMutation.isPending}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={viewingStudent}
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={handleEditStudent}
      />
    </div>
  );
}
