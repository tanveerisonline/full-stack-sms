import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStudents } from '@/hooks/useStudents';
import { useToast } from '@/components/Common/Toast';
import { GRADES } from '@/utils/constants';
import { formatDate } from '@/utils/formatters';
import { Download, Printer, CreditCard, Search } from 'lucide-react';

export default function IdCards() {
  const { students } = useStudents();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
    return matchesSearch && matchesGrade && student.status === 'active';
  });

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(filteredStudents.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  const generateIdCards = () => {
    if (selectedStudents.length === 0) {
      addToast('Please select at least one student to generate ID cards.', 'warning');
      return;
    }

    // Simulate ID card generation
    addToast(`Generated ${selectedStudents.length} ID card(s) successfully!`, 'success');
    clearSelection();
  };

  const printIdCards = () => {
    if (selectedStudents.length === 0) {
      addToast('Please select at least one student to print ID cards.', 'warning');
      return;
    }

    // Simulate printing
    addToast(`Sent ${selectedStudents.length} ID card(s) to printer!`, 'success');
  };

  return (
    <div className="space-y-8" data-testid="id-cards-page">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
          ID Card System
        </h2>
        <p className="text-slate-600" data-testid="text-page-subtitle">
          Generate and manage student ID cards
        </p>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-students"
                />
              </div>
              
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-grade-filter">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={selectAllStudents} data-testid="button-select-all">
                Select All
              </Button>
              <Button variant="outline" onClick={clearSelection} data-testid="button-clear-selection">
                Clear Selection
              </Button>
            </div>
          </div>

          {selectedStudents.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800" data-testid="text-selected-count">
                  {selectedStudents.length} student(s) selected
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={generateIdCards}
                    data-testid="button-generate-cards"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Generate ID Cards
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={printIdCards}
                    data-testid="button-print-cards"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Printer Cards
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500" data-testid="text-no-students">
                No active students found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card 
              key={student.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedStudents.includes(student.id) 
                  ? 'ring-2 ring-primary-500 bg-primary-50' 
                  : ''
              }`}
              onClick={() => toggleStudentSelection(student.id)}
              data-testid={`card-student-${student.id}`}
            >
              <CardContent className="p-4">
                {/* ID Card Preview */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-lg mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold">STUDENT ID</div>
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <i className="fas fa-graduation-cap text-primary-600 text-xs"></i>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-16 h-16 border-2 border-white">
                      <AvatarImage src={student.avatar} alt={`${student.firstName} ${student.lastName}`} />
                      <AvatarFallback className="bg-white text-primary-600 font-semibold">
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate" data-testid={`text-card-name-${student.id}`}>
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-xs opacity-90" data-testid={`text-card-roll-${student.id}`}>
                        ID: {student.rollNumber}
                      </p>
                      <p className="text-xs opacity-90" data-testid={`text-card-grade-${student.id}`}>
                        {student.grade}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-primary-400">
                    <div className="flex justify-between text-xs">
                      <span>Valid Until: Dec 2024</span>
                      <span>EduManage Pro</span>
                    </div>
                  </div>
                </div>

                {/* Student Info */}
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-slate-800" data-testid={`text-student-name-${student.id}`}>
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-slate-600" data-testid={`text-student-email-${student.id}`}>
                    {student.email}
                  </p>
                  <p className="text-slate-500 text-xs">
                    DOB: {formatDate(student.dateOfBirth)}
                  </p>
                </div>

                {/* Selection Indicator */}
                {selectedStudents.includes(student.id) && (
                  <div className="mt-3 flex items-center text-primary-600 text-sm font-medium">
                    <i className="fas fa-check-circle mr-2"></i>
                    Selected for ID card generation
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
