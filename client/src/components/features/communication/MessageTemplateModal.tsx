import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/Common/Toast';
import { Calendar, Users, FileText, Send } from 'lucide-react';

interface MessageTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateType: 'parent-teacher' | 'exam-schedule' | 'holiday' | null;
}

function MessageTemplateModal({ isOpen, onClose, templateType }: MessageTemplateModalProps) {
  const { addToast } = useToast();
  
  const getTemplateData = () => {
    switch (templateType) {
      case 'parent-teacher':
        return {
          title: 'Parent-Teacher Meeting',
          subject: 'Parent-Teacher Meeting Scheduled',
          content: 'Dear Parent/Guardian,\n\nWe are pleased to invite you to our upcoming Parent-Teacher Meeting to discuss your child\'s academic progress and development.\n\nMeeting Details:\nDate: [DATE]\nTime: [TIME]\nVenue: [VENUE]\nTeacher: [TEACHER_NAME]\n\nPlease confirm your attendance by replying to this message.\n\nBest regards,\nSchool Administration',
          icon: Users
        };
      case 'exam-schedule':
        return {
          title: 'Exam Schedule',
          subject: 'Upcoming Examination Schedule',
          content: 'Dear Students and Parents,\n\nWe are sharing the examination schedule for the upcoming [EXAM_TYPE].\n\nExam Schedule:\nSubject: [SUBJECT]\nDate: [DATE]\nTime: [TIME]\nVenue: [VENUE]\nDuration: [DURATION]\n\nImportant Instructions:\n- Report 30 minutes before the exam\n- Bring your admit card and ID\n- Mobile phones are not allowed\n\nGood luck with your preparations!\n\nBest regards,\nExamination Department',
          icon: FileText
        };
      case 'holiday':
        return {
          title: 'Holiday Notice',
          subject: 'School Holiday Announcement',
          content: 'Dear Students, Parents and Staff,\n\nWe would like to inform you about the upcoming school holiday.\n\nHoliday Details:\nOccasion: [OCCASION]\nStart Date: [START_DATE]\nEnd Date: [END_DATE]\nSchool Reopens: [REOPEN_DATE]\n\nDuring this time, the school office will be closed. For any urgent matters, please contact the emergency number provided.\n\nWe wish you a pleasant holiday!\n\nBest regards,\nSchool Administration',
          icon: Calendar
        };
      default:
        return {
          title: 'Message Template',
          subject: '',
          content: '',
          icon: Send
        };
    }
  };

  const template = getTemplateData();
  const Icon = template.icon;

  const [formData, setFormData] = useState({
    subject: template.subject,
    content: template.content,
    recipients: 'all' as 'all' | 'students' | 'parents' | 'teachers',
    priority: 'normal' as 'low' | 'normal' | 'high',
    deliveryMethod: 'email' as 'email' | 'sms' | 'notification'
  });

  const handleSend = () => {
    if (!formData.subject.trim() || !formData.content.trim()) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    addToast(`${template.title} message sent successfully!`, 'success');
    onClose();
  };

  const handlePreview = () => {
    addToast('Preview generated', 'success');
  };

  if (!templateType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {template.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Template Information</h3>
            <p className="text-blue-700 text-sm">
              This template is designed for {template.title.toLowerCase()} communications. 
              You can customize the content below and send it to the selected recipients.
            </p>
          </div>

          {/* Message Content */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter message subject"
                data-testid="input-template-subject"
              />
            </div>

            <div>
              <Label htmlFor="content">Message Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your message content"
                className="min-h-[200px]"
                data-testid="textarea-template-content"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use placeholders like [DATE], [TIME], [VENUE] to customize the message
              </p>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Recipients</Label>
              <Select value={formData.recipients} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recipients: value }))}>
                <SelectTrigger data-testid="select-template-recipients">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="parents">Parents Only</SelectItem>
                  <SelectItem value="teachers">Teachers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger data-testid="select-template-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Delivery Method</Label>
              <Select value={formData.deliveryMethod} onValueChange={(value: any) => setFormData(prev => ({ ...prev, deliveryMethod: value }))}>
                <SelectTrigger data-testid="select-delivery-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="notification">Push Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handlePreview} data-testid="button-preview-template">
              <FileText className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-template-cancel">
                Cancel
              </Button>
              <Button onClick={handleSend} data-testid="button-send-template">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}export default MessageTemplateModal;
