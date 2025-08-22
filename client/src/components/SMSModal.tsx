import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { MessageSquare, Calendar, Phone } from 'lucide-react';

interface SMSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SMSModal({ isOpen, onClose }: SMSModalProps) {
  const { addToast } = useToast();
  const students = dataService.getStudents();
  const teachers = dataService.getTeachers();
  const parents = dataService.getParents?.() || [];
  
  const [formData, setFormData] = useState({
    recipients: [] as string[],
    recipientType: 'parents' as 'parents' | 'teachers' | 'staff' | 'manual',
    message: '',
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: ''
  });

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const resetForm = () => {
    setFormData({
      recipients: [],
      recipientType: 'parents',
      message: '',
      isScheduled: false,
      scheduledDate: '',
      scheduledTime: ''
    });
    setSelectedContacts([]);
    setSelectAll(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const getContacts = () => {
    switch (formData.recipientType) {
      case 'parents':
        return parents.map(p => ({ 
          id: p.id, 
          name: `${p.firstName} ${p.lastName}`, 
          phone: p.phone || `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          type: 'Parent',
          relation: p.studentId ? `Parent of ${students.find(s => s.id === p.studentId)?.firstName || 'Student'}` : 'Parent'
        }));
      case 'teachers':
        return teachers.map(t => ({ 
          id: t.id, 
          name: `${t.firstName} ${t.lastName}`, 
          phone: t.phone || `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          type: 'Teacher',
          relation: `Teacher - ${t.subjects?.join(', ') || 'Various subjects'}`
        }));
      case 'staff':
        return teachers.filter(t => t.role === 'admin' || t.role === 'staff').map(t => ({ 
          id: t.id, 
          name: `${t.firstName} ${t.lastName}`, 
          phone: t.phone || `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          type: 'Staff',
          relation: t.role || 'Staff Member'
        }));
      default:
        return [];
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedContacts(getContacts().map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleContactSelect = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
      setSelectAll(false);
    }
  };

  const handleSend = () => {
    if (!formData.message.trim()) {
      addToast('Message is required', 'error');
      return;
    }

    if (formData.message.length > 160) {
      addToast('SMS message must be 160 characters or less', 'error');
      return;
    }

    if (formData.recipientType !== 'manual' && selectedContacts.length === 0) {
      addToast('Please select at least one recipient', 'error');
      return;
    }

    if (formData.recipientType === 'manual' && formData.recipients.length === 0) {
      addToast('Please add at least one phone number', 'error');
      return;
    }

    if (formData.isScheduled && (!formData.scheduledDate || !formData.scheduledTime)) {
      addToast('Please select date and time for scheduled SMS', 'error');
      return;
    }

    const recipientCount = formData.recipientType === 'manual' 
      ? formData.recipients.length 
      : selectedContacts.length;

    if (formData.isScheduled) {
      addToast(`SMS scheduled for ${formData.scheduledDate} at ${formData.scheduledTime} to ${recipientCount} recipients`, 'success');
    } else {
      addToast(`SMS sent successfully to ${recipientCount} recipients!`, 'success');
    }
    
    onClose();
  };

  const contacts = getContacts();
  const remainingChars = 160 - formData.message.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send SMS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipient Type Selection */}
          <div>
            <Label>Recipient Type</Label>
            <Select 
              value={formData.recipientType} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, recipientType: value }))}
            >
              <SelectTrigger data-testid="select-sms-recipient-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parents">Parents</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="staff">Staff Members</SelectItem>
                <SelectItem value="manual">Manual Phone Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manual Phone Entry */}
          {formData.recipientType === 'manual' && (
            <div>
              <Label>Phone Numbers (comma separated)</Label>
              <Textarea
                placeholder="+1234567890, +0987654321"
                value={formData.recipients.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  recipients: e.target.value.split(',').map(phone => phone.trim()).filter(Boolean)
                }))}
                data-testid="textarea-sms-recipients"
              />
            </div>
          )}

          {/* Contact Selection */}
          {formData.recipientType !== 'manual' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Select Recipients</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="select-all-sms"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all-sms" className="text-sm font-normal">
                    Select All ({contacts.length})
                  </Label>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-4 space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sms-${contact.id}`}
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={(checked) => handleContactSelect(contact.id, checked as boolean)}
                    />
                    <Label htmlFor={`sms-${contact.id}`} className="flex-1 text-sm font-normal">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-xs text-slate-500">{contact.relation}</div>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {contact.phone}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
              {selectedContacts.length > 0 && (
                <p className="text-sm text-slate-600 mt-2">
                  {selectedContacts.length} recipient(s) selected
                </p>
              )}
            </div>
          )}

          {/* SMS Message */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-message">Message *</Label>
              <span className={`text-sm ${remainingChars < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                {remainingChars} characters remaining
              </span>
            </div>
            <Textarea
              id="sms-message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your SMS message here (max 160 characters)..."
              className={`min-h-[100px] ${remainingChars < 0 ? 'border-red-500' : ''}`}
              data-testid="textarea-sms-message"
            />
          </div>

          {/* Schedule SMS Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="schedule-sms"
              checked={formData.isScheduled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isScheduled: checked as boolean }))}
            />
            <Label htmlFor="schedule-sms">Schedule SMS</Label>
          </div>

          {/* Scheduled SMS Options */}
          {formData.isScheduled && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <Label htmlFor="sms-scheduled-date">Date</Label>
                <Input
                  id="sms-scheduled-date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  data-testid="input-sms-scheduled-date"
                />
              </div>
              <div>
                <Label htmlFor="sms-scheduled-time">Time</Label>
                <Input
                  id="sms-scheduled-time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  data-testid="input-sms-scheduled-time"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-sms-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={remainingChars < 0}
              data-testid="button-send-sms"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {formData.isScheduled ? 'Schedule SMS' : 'Send SMS'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}