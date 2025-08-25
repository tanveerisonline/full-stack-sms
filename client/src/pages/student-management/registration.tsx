import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StudentForm } from '@/components/features/student';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus } from 'lucide-react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  grade: string;
  dateOfBirth: string;
  address: string;
  parentName: string;
  parentContact: string;
  avatar?: string;
}

export default function StudentRegistration() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddStudent = async (studentData: any) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/students', {
        method: 'POST',
        body: studentData,
      });
      setShowForm(false);
      toast({
        title: "Student Added",
        description: "New student has been registered successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleUpdateStudent = async (studentData: any) => {
    if (!editingStudent) return;
    
    setIsLoading(true);
    try {
      await apiRequest(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        body: studentData,
      });
      setShowForm(false);
      setEditingStudent(null);
      toast({
        title: "Student Updated",
        description: "Student information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

      {/* Student Form Modal */}
      <StudentForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
        student={editingStudent}
        isLoading={isLoading}
      />
    </div>
  );
}
