import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StudentTable } from '@/components/Student/StudentTable';
import { StudentForm } from '@/components/Student/StudentForm';
import { StudentDetailModal } from '@/components/modals/StudentDetailModal';
import { useStudents } from '@/hooks/useStudents';
import { useToast } from '@/components/Common/Toast';
import { Student } from '@/types';
import { Plus } from 'lucide-react';

export default function StudentRegistration() {
  const { addToast } = useToast();
  const { students, addStudent, updateStudent, deleteStudent, isLoading } = useStudents();
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const handleAddStudent = async (studentData: any) => {
    try {
      await addStudent(studentData);
      setShowForm(false);
      addToast('Student added successfully!', 'success');
    } catch (error) {
      addToast('Failed to add student. Please try again.', 'error');
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleUpdateStudent = async (studentData: any) => {
    if (!editingStudent) return;
    
    try {
      await updateStudent(editingStudent.id, studentData);
      setShowForm(false);
      setEditingStudent(null);
      addToast('Student updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update student. Please try again.', 'error');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      addToast('Student deleted successfully!', 'success');
    } catch (error) {
      addToast('Failed to delete student. Please try again.', 'error');
    }
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
        isLoading={isLoading}
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
