import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (issueData: any) => void;
}

function IssueBookModal({ isOpen, onClose, onSave }: IssueBookModalProps) {
  const { addToast } = useToast();
  const books = dataService.getBooks();
  const students = dataService.getStudents();
  
  const [formData, setFormData] = useState({
    bookId: '',
    studentId: '',
    dueDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  const availableBooks = books.filter(book => 
    book.status === 'available' && 
    (book.availableCopies || 0) > 0
  );

  useEffect(() => {
    if (isOpen) {
      // Set default due date to 2 weeks from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      
      setFormData({
        bookId: '',
        studentId: '',
        dueDate: defaultDueDate.toISOString().split('T')[0],
        notes: ''
      });
      setStudentSearch('');
      setBookSearch('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bookId) newErrors.bookId = 'Please select a book';
    if (!formData.studentId) newErrors.studentId = 'Please select a student';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate <= today) {
      newErrors.dueDate = 'Due date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    const issueData = {
      ...formData,
      id: `issue_${Date.now()}`,
      issuedDate: new Date().toISOString(),
      status: 'issued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(issueData);
    addToast('Book issued successfully!', 'success');
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getSelectedStudent = () => {
    return students.find(s => s.id === formData.studentId);
  };

  const getSelectedBook = () => {
    return books.find(b => b.id === formData.bookId);
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredBooks = availableBooks.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.isbn.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-issue-book-modal-title">
            Issue Book
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div>
            <Label htmlFor="studentSearch">Student *</Label>
            <div className="relative">
              <Input
                id="studentSearch"
                value={getSelectedStudent() ? `${getSelectedStudent()?.firstName} ${getSelectedStudent()?.lastName}` : studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setShowStudentDropdown(true);
                  if (formData.studentId) {
                    handleChange('studentId', '');
                  }
                }}
                onFocus={() => setShowStudentDropdown(true)}
                placeholder="Search for student by name or ID..."
                className={errors.studentId ? 'border-red-500' : ''}
                data-testid="input-student-search"
              />
              {showStudentDropdown && !getSelectedStudent() && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        handleChange('studentId', student.id);
                        setStudentSearch('');
                        setShowStudentDropdown(false);
                      }}
                      data-testid={`student-option-${student.id}`}
                    >
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-sm text-gray-500">{student.grade} - ID: {student.rollNumber}</div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="px-3 py-2 text-gray-500">No students found</div>
                  )}
                </div>
              )}
            </div>
            {errors.studentId && <p className="text-sm text-red-600 mt-1">{errors.studentId}</p>}
          </div>

          {/* Book Selection */}
          <div>
            <Label htmlFor="bookSearch">Book *</Label>
            <div className="relative">
              <Input
                id="bookSearch"
                value={getSelectedBook() ? getSelectedBook()?.title : bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value);
                  setShowBookDropdown(true);
                  if (formData.bookId) {
                    handleChange('bookId', '');
                  }
                }}
                onFocus={() => setShowBookDropdown(true)}
                placeholder="Search for book by title, author, or ISBN..."
                className={errors.bookId ? 'border-red-500' : ''}
                data-testid="input-book-search"
              />
              {showBookDropdown && !getSelectedBook() && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        handleChange('bookId', book.id);
                        setBookSearch('');
                        setShowBookDropdown(false);
                      }}
                      data-testid={`book-option-${book.id}`}
                    >
                      <div className="font-medium">{book.title}</div>
                      <div className="text-sm text-gray-500">
                        by {book.author} • Available: {book.availableCopies || 0} copies
                      </div>
                    </div>
                  ))}
                  {filteredBooks.length === 0 && (
                    <div className="px-3 py-2 text-gray-500">No available books found</div>
                  )}
                </div>
              )}
            </div>
            {errors.bookId && <p className="text-sm text-red-600 mt-1">{errors.bookId}</p>}
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={errors.dueDate ? 'border-red-500' : ''}
              min={new Date().toISOString().split('T')[0]}
              data-testid="input-due-date"
            />
            {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any special instructions or notes..."
              data-testid="input-issue-notes"
            />
          </div>

          {/* Issue Summary */}
          {formData.studentId && formData.bookId && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Issue Summary</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Student:</span> {getSelectedStudent()?.firstName} {getSelectedStudent()?.lastName}</p>
                <p><span className="font-medium">Book:</span> {getSelectedBook()?.title}</p>
                <p><span className="font-medium">Author:</span> {getSelectedBook()?.author}</p>
                <p><span className="font-medium">Due Date:</span> {new Date(formData.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-issue-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-issue-book">
              Issue Book
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}export default IssueBookModal;
