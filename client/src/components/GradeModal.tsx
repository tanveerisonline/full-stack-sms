import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/Common/Toast';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, User } from 'lucide-react';

interface GradeModalProps {
  assignmentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock student submissions data
const mockSubmissions = [
  {
    id: 1,
    studentName: "John Doe",
    studentId: "STU001",
    submittedAt: "2025-08-23T10:30:00Z",
    status: "submitted",
    file: "john_assignment.pdf",
    comments: "Please review my work on the algebra problems."
  },
  {
    id: 2,
    studentName: "Jane Smith",
    studentId: "STU002", 
    submittedAt: "2025-08-23T14:15:00Z",
    status: "submitted",
    file: "jane_assignment.docx",
    comments: "I struggled with question 5, but tried my best."
  }
];

export function GradeModal({ assignmentId, isOpen, onClose }: GradeModalProps) {
  const { addToast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState({
    marksObtained: '',
    feedback: '',
    grade: ''
  });

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) {
      addToast('Please select a submission to grade.', 'error');
      return;
    }

    try {
      // Simulate grading API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast('Submission graded successfully!', 'success');
      setGradeData({ marksObtained: '', feedback: '', grade: '' });
      setSelectedSubmission(null);
    } catch (error) {
      addToast('Failed to grade submission.', 'error');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Assignment Submissions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Submissions List */}
          <div>
            <Label className="text-base font-semibold">Student Submissions</Label>
            <div className="grid gap-4 mt-3">
              {mockSubmissions.map((submission) => (
                <Card 
                  key={submission.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedSubmission === submission.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSubmission(submission.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{submission.studentName}</h4>
                          <p className="text-sm text-slate-600">{submission.studentId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Submitted
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {submission.comments && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-md">
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Student Comment:</span> {submission.comments}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center text-sm text-slate-600">
                      <span>Attachment: {submission.file}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Grading Section */}
          {selectedSubmission && (
            <div className="border-t pt-6">
              <Label className="text-base font-semibold">Grade Submission</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <Label htmlFor="marksObtained">Marks Obtained</Label>
                  <Input
                    id="marksObtained"
                    type="number"
                    placeholder="e.g. 85"
                    value={gradeData.marksObtained}
                    onChange={(e) => setGradeData(prev => ({ ...prev, marksObtained: e.target.value }))}
                    data-testid="input-marks-obtained"
                  />
                </div>
                <div>
                  <Label htmlFor="letterGrade">Letter Grade</Label>
                  <Select 
                    value={gradeData.grade} 
                    onValueChange={(value) => setGradeData(prev => ({ ...prev, grade: value }))}
                  >
                    <SelectTrigger data-testid="select-letter-grade">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+ (90-100)</SelectItem>
                      <SelectItem value="A">A (85-89)</SelectItem>
                      <SelectItem value="B+">B+ (80-84)</SelectItem>
                      <SelectItem value="B">B (75-79)</SelectItem>
                      <SelectItem value="C+">C+ (70-74)</SelectItem>
                      <SelectItem value="C">C (65-69)</SelectItem>
                      <SelectItem value="D">D (60-64)</SelectItem>
                      <SelectItem value="F">F (Below 60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide detailed feedback on the student's work..."
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                  data-testid="textarea-feedback"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose} data-testid="button-close-grading">
              Close
            </Button>
            <Button 
              onClick={handleGradeSubmission}
              disabled={!selectedSubmission}
              data-testid="button-save-grade"
            >
              Save Grade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}