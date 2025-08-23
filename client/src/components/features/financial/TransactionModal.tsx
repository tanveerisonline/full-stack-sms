import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from '@/utils/constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: any) => void;
  transaction?: any;
}

function TransactionModal({ isOpen, onClose, onSave, transaction }: TransactionModalProps) {
  const { addToast } = useToast();
  const students = dataService.getStudents();
  
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'tuition' as string,
    amount: '',
    description: '',
    dueDate: '',
    status: 'pending' as 'paid' | 'pending' | 'overdue' | 'refunded'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        studentId: transaction.studentId || '',
        type: transaction.type || 'tuition',
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        dueDate: transaction.dueDate?.split('T')[0] || '',
        status: transaction.status || 'pending'
      });
    } else if (!transaction) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 30);
      
      setFormData({
        studentId: '',
        type: 'tuition',
        amount: '',
        description: '',
        dueDate: defaultDueDate.toISOString().split('T')[0],
        status: 'pending'
      });
    }
    setStudentSearch('');
    setErrors({});
  }, [transaction, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId) newErrors.studentId = 'Please select a student';
    if (!formData.type) newErrors.type = 'Transaction type is required';
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      id: transaction?.id || `transaction_${Date.now()}`,
      createdAt: transaction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(transactionData);
    addToast(transaction ? 'Transaction updated successfully!' : 'Transaction added successfully!', 'success');
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

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-transaction-modal-title">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Transaction Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''} data-testid="select-transaction-type">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className={errors.amount ? 'border-red-500' : ''}
                placeholder="0.00"
                data-testid="input-transaction-amount"
              />
              {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={errors.dueDate ? 'border-red-500' : ''}
                data-testid="input-due-date"
              />
              {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => handleChange('status', value)}>
                <SelectTrigger data-testid="select-transaction-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional details about this transaction..."
              className="min-h-[80px]"
              data-testid="textarea-transaction-description"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-transaction-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-transaction-save">
              {transaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}export default TransactionModal;
