import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, XCircle, User, Calendar, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import type { ExamSubmission } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface SubmissionTrackerProps {
  examId: number;
}

interface SubmissionWithDetails extends ExamSubmission {
  answers?: any[];
}

export function SubmissionTracker({ examId }: SubmissionTrackerProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);

  // Get submissions for the exam
  const { data: submissions, isLoading } = useQuery<ExamSubmission[]>({
    queryKey: ['/api/exams', examId, 'submissions'],
    queryFn: () => apiRequest(`/api/exams/${examId}/submissions`),
  });

  // Get detailed submission data
  const { data: submissionDetails } = useQuery<SubmissionWithDetails>({
    queryKey: ['/api/submissions', selectedSubmission],
    queryFn: () => selectedSubmission ? apiRequest(`/api/submissions/${selectedSubmission}`) : null,
    enabled: !!selectedSubmission,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'started':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'graded':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
      case 'started':
        return <Clock className="w-4 h-4" />;
      case 'not_started':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredSubmissions = submissions?.filter((submission: ExamSubmission) => {
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      submission.studentId.toString().includes(searchTerm) ||
      submission.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  }) || [];

  const statusCounts = submissions?.reduce((acc: Record<string, number>, submission: ExamSubmission) => {
    acc[submission.status] = (acc[submission.status] || 0) + 1;
    return acc;
  }, {}) || {};

  if (isLoading) {
    return <div data-testid="loading-submissions">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6" data-testid="submission-tracker">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Submission Tracking</h3>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="total-submissions-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold" data-testid="total-submissions-count">
                  {submissions?.length || 0}
                </p>
              </div>
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="completed-submissions-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600" data-testid="completed-submissions-count">
                  {statusCounts['completed'] || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="in-progress-submissions-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="in-progress-submissions-count">
                  {statusCounts['in_progress'] || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="graded-submissions-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Graded</p>
                <p className="text-2xl font-bold text-purple-600" data-testid="graded-submissions-count">
                  {statusCounts['graded'] || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="started">Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search by student ID or submission ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          data-testid="search-submissions"
        />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" data-testid="tab-list">Submission List</TabsTrigger>
          <TabsTrigger value="details" data-testid="tab-details">Submission Details</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredSubmissions.map((submission: ExamSubmission) => (
            <Card 
              key={submission.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedSubmission(submission.id)}
              data-testid={`submission-card-${submission.id}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" data-testid={`submission-id-${submission.id}`}>
                        Submission #{submission.id}
                      </span>
                      <Badge 
                        className={getStatusColor(submission.status)}
                        data-testid={`submission-status-${submission.id}`}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(submission.status)}
                          {submission.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600" data-testid={`student-id-${submission.id}`}>
                      Student ID: {submission.studentId}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span data-testid={`submission-date-${submission.id}`}>
                        {submission.startedAt ? 
                          formatDistanceToNow(new Date(submission.startedAt), { addSuffix: true }) : 
                          'Not started'
                        }
                      </span>
                    </div>
                    {submission.timeSpent !== undefined && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Timer className="w-4 h-4" />
                        <span data-testid={`time-spent-${submission.id}`}>
                          {Math.floor((submission.timeSpent || 0) / 60)}m {(submission.timeSpent || 0) % 60}s
                        </span>
                      </div>
                    )}
                    {submission.totalScore && (
                      <div className="text-sm font-medium" data-testid={`submission-score-${submission.id}`}>
                        Score: {submission.totalScore}/{submission.maxScore}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredSubmissions.length === 0 && (
            <Card data-testid="no-submissions-message">
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No submissions found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedSubmission && submissionDetails ? (
            <Card data-testid="submission-details">
              <CardHeader>
                <CardTitle>Submission Details #{selectedSubmission}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div data-testid="detail-student-id">
                        <strong>Student ID:</strong> {submissionDetails.studentId}
                      </div>
                      <div data-testid="detail-status">
                        <strong>Status:</strong> 
                        <Badge className={`ml-2 ${getStatusColor(submissionDetails.status)}`}>
                          {submissionDetails.status?.toString().replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div data-testid="detail-started-at">
                        <strong>Started:</strong> {submissionDetails.startedAt ? 
                          new Date(submissionDetails.startedAt).toLocaleString() : 'Not started'}
                      </div>
                      <div data-testid="detail-submitted-at">
                        <strong>Submitted:</strong> {submissionDetails.submittedAt ? 
                          new Date(submissionDetails.submittedAt).toLocaleString() : 'Not submitted'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-2 text-sm">
                      {submissionDetails.totalScore && (
                        <div data-testid="detail-score">
                          <strong>Score:</strong> {submissionDetails.totalScore}/{submissionDetails.maxScore}
                        </div>
                      )}
                      {submissionDetails.percentage && (
                        <div data-testid="detail-percentage">
                          <strong>Percentage:</strong> {submissionDetails.percentage}%
                        </div>
                      )}
                      <div data-testid="detail-time-spent">
                        <strong>Time Spent:</strong> {submissionDetails.timeSpent ? 
                          `${Math.floor(submissionDetails.timeSpent / 60)}m ${submissionDetails.timeSpent % 60}s` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {submissionDetails.answers && submissionDetails.answers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Answers ({submissionDetails.answers.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {submissionDetails.answers.map((answer: any, index: number) => (
                        <div 
                          key={answer.id || index} 
                          className="p-3 border rounded"
                          data-testid={`answer-${index}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm">
                                <strong>Question {index + 1}:</strong>
                              </p>
                              <p className="text-sm mt-1" data-testid={`answer-text-${index}`}>
                                {answer.answerText || answer.selectedOptionId ? 
                                  (answer.answerText || `Option ${answer.selectedOptionId}`) : 
                                  'No answer provided'
                                }
                              </p>
                            </div>
                            <div className="text-right">
                              {answer.marksAwarded !== undefined && (
                                <span 
                                  className={`text-sm font-medium ${
                                    answer.isCorrect ? 'text-green-600' : 'text-red-600'
                                  }`}
                                  data-testid={`answer-marks-${index}`}
                                >
                                  {answer.marksAwarded}/{answer.maxMarks}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="select-submission-message">
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Select a submission from the list to view details.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}