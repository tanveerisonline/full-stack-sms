import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { Send, Calendar, Users, User } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailModal({ isOpen, onClose }: EmailModalProps) {
  const { addToast } = useToast();
  const students = dataService.getStudents();
  const teachers = dataService.getTeachers();
  const parents = dataService.getParents?.() || [];
  
  const [formData, setFormData] = useState({
    recipients: [] as string[],
    recipientType: 'manual' as 'manual' | 'students' | 'teachers' | 'parents',
    subject: '',
    message: '',
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    attachFiles: false
  });

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const resetForm = () => {
    setFormData({
      recipients: [],
      recipientType: 'manual',
      subject: '',
      message: '',
      isScheduled: false,
      scheduledDate: '',
      scheduledTime: '',
      priority: 'normal',
      attachFiles: false
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
      case 'students':
        return students.map(s => ({ 
          id: s.id, 
          name: `${s.firstName} ${s.lastName}`, 
          email: s.email || `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@school.edu`,
          type: 'Student'
        }));
      case 'teachers':
        return teachers.map(t => ({ 
          id: t.id, 
          name: `${t.firstName} ${t.lastName}`, 
          email: t.email || `${t.firstName.toLowerCase()}.${t.lastName.toLowerCase()}@school.edu`,
          type: 'Teacher'
        }));
      case 'parents':
        return parents.map(p => ({ 
          id: p.id, 
          name: `${p.firstName} ${p.lastName}`, 
          email: p.email || `${p.firstName.toLowerCase()}.${p.lastName.toLowerCase()}@parent.edu`,
          type: 'Parent'
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
    if (!formData.subject.trim()) {
      addToast('Subject is required', 'error');
      return;
    }
    
    if (!formData.message.trim()) {
      addToast('Message is required', 'error');
      return;
    }

    if (formData.recipientType !== 'manual' && selectedContacts.length === 0) {
      addToast('Please select at least one recipient', 'error');
      return;
    }

    if (formData.recipientType === 'manual' && formData.recipients.length === 0) {
      addToast('Please add at least one email address', 'error');
      return;
    }

    if (formData.isScheduled && (!formData.scheduledDate || !formData.scheduledTime)) {
      addToast('Please select date and time for scheduled email', 'error');
      return;
    }

    // Simulate email sending
    const recipientCount = formData.recipientType === 'manual' 
      ? formData.recipients.length 
      : selectedContacts.length;

    if (formData.isScheduled) {
      addToast(`Email scheduled for ${formData.scheduledDate} at ${formData.scheduledTime} to ${recipientCount} recipients`, 'success');
    } else {
      addToast(`Email sent successfully to ${recipientCount} recipients!`, 'success');
    }
    
    onClose();
  };

  const contacts = getContacts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Compose Email
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
              <SelectTrigger data-testid="select-recipient-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Email Entry</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="parents">Parents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manual Email Entry */}
          {formData.recipientType === 'manual' && (
            <div>
              <Label>Email Addresses (comma separated)</Label>
              <Textarea
                placeholder="email1@example.com, email2@example.com"
                value={formData.recipients.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                }))}
                data-testid="textarea-email-recipients"
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
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm font-normal">
                    Select All ({contacts.length})
                  </Label>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-4 space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={contact.id}
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={(checked) => handleContactSelect(contact.id, checked as boolean)}
                    />
                    <Label htmlFor={contact.id} className="flex-1 text-sm font-normal">
                      <div className="flex items-center justify-between">
                        <span>{contact.name}</span>
                        <div className="text-xs text-slate-500">
                          <span className="mr-2">{contact.type}</span>
                          <span>{contact.email}</span>
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

          {/* Email Subject */}
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject"
              data-testid="input-email-subject"
            />
          </div>

          {/* Email Message */}
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your message here..."
              className="min-h-[120px]"
              data-testid="textarea-email-message"
            />
          </div>

          {/* Email Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger data-testid="select-email-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="schedule-email"
                checked={formData.isScheduled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isScheduled: checked as boolean }))}
              />
              <Label htmlFor="schedule-email">Schedule Email</Label>
            </div>
          </div>

          {/* Scheduled Email Options */}
          {formData.isScheduled && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <Label htmlFor="scheduled-date">Date</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  data-testid="input-scheduled-date"
                />
              </div>
              <div>
                <Label htmlFor="scheduled-time">Time</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  data-testid="input-scheduled-time"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-email-cancel">
              Cancel
            </Button>
            <Button onClick={handleSend} data-testid="button-send-email">
              <Send className="w-4 h-4 mr-2" />
              {formData.isScheduled ? 'Schedule Email' : 'Send Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}