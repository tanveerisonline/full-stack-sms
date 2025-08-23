import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/Common/Toast';
import { Upload, Send } from 'lucide-react';

interface SubmissionModalProps {
  assignmentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

function SubmissionModal({ assignmentId, isOpen, onClose }: SubmissionModalProps) {
  const { addToast } = useToast();
  const [submissionData, setSubmissionData] = useState({
    studentComment: '',
    attachmentFile: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionData(prev => ({
        ...prev,
        attachmentFile: e.target.files![0]
      }));
    }
  };

  const handleSubmitAssignment = async () => {
    try {
      // Simulate submission API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('Assignment submitted successfully!', 'success');
      onClose();
      setSubmissionData({ studentComment: '', attachmentFile: null });
    } catch (error) {
      addToast('Failed to submit assignment.', 'error');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div>
            <Label htmlFor="studentComment">Comments (Optional)</Label>
            <Textarea
              id="studentComment"
              placeholder="Add any comments about your submission..."
              value={submissionData.studentComment}
              onChange={(e) => setSubmissionData(prev => ({ ...prev, studentComment: e.target.value }))}
              rows={3}
              data-testid="textarea-student-comment"
            />
          </div>

          <div>
            <Label htmlFor="submissionFile">Attach File</Label>
            <Input
              id="submissionFile"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              data-testid="input-submission-file"
            />
            {submissionData.attachmentFile && (
              <p className="text-sm text-slate-600 mt-1">
                Selected: {submissionData.attachmentFile.name}
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Upload className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium text-blue-900">Submission Guidelines</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Submit before the due date to avoid late penalties</li>
                  <li>• Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-submission">
              Cancel
            </Button>
            <Button onClick={handleSubmitAssignment} data-testid="button-submit-assignment">
              <Send className="w-4 h-4 mr-2" />
              Submit Assignment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}export default SubmissionModal;
