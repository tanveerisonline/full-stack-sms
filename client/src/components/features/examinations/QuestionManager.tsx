import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Question, QuestionOption } from "@shared/schema";

interface QuestionManagerProps {
  examId: number;
}

interface QuestionWithOptions extends Question {
  options: QuestionOption[];
}

interface NewQuestion {
  examId: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  marks: number;
  orderIndex: number;
  explanation?: string;
}

interface NewOption {
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
  explanation?: string;
}

export function QuestionManager({ examId }: QuestionManagerProps) {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<NewQuestion>>({
    examId,
    questionType: 'multiple_choice',
    marks: 1,
    orderIndex: 1,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get questions for the exam
  const { data: questions, isLoading } = useQuery<QuestionWithOptions[]>({
    queryKey: ['/api/exams', examId, 'questions'],
    queryFn: () => apiRequest(`/api/exams/${examId}/questions`),
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (questionData: NewQuestion) => apiRequest('/api/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams', examId, 'questions'] });
      setShowAddForm(false);
      setNewQuestion({
        examId,
        questionType: 'multiple_choice',
        marks: 1,
        orderIndex: (questionsList.length || 0) + 1,
      });
      toast({
        title: "Question created",
        description: "The question has been added successfully.",
      });
    },
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<NewQuestion>) => 
      apiRequest(`/api/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams', examId, 'questions'] });
      setEditingQuestion(null);
      toast({
        title: "Question updated",
        description: "The question has been updated successfully.",
      });
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: number) => apiRequest(`/api/questions/${questionId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams', examId, 'questions'] });
      toast({
        title: "Question deleted",
        description: "The question has been removed successfully.",
      });
    },
  });

  // Create option mutation
  const createOptionMutation = useMutation({
    mutationFn: ({ questionId, ...optionData }: NewOption) => 
      apiRequest(`/api/questions/${questionId}/options`, {
        method: 'POST',
        body: JSON.stringify(optionData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams', examId, 'questions'] });
      toast({
        title: "Option added",
        description: "The option has been added successfully.",
      });
    },
  });

  // Delete option mutation
  const deleteOptionMutation = useMutation({
    mutationFn: (optionId: number) => apiRequest(`/api/question-options/${optionId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams', examId, 'questions'] });
      toast({
        title: "Option deleted",
        description: "The option has been removed successfully.",
      });
    },
  });

  const handleCreateQuestion = () => {
    if (!newQuestion.questionText || !newQuestion.questionType) {
      toast({
        title: "Invalid input",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createQuestionMutation.mutate(newQuestion as NewQuestion);
  };

  const handleUpdateQuestion = (questionId: number, data: Partial<NewQuestion>) => {
    updateQuestionMutation.mutate({ id: questionId, ...data });
  };

  const handleAddOption = (questionId: number) => {
    const question = questionsList.find((q: QuestionWithOptions) => q.id === questionId);
    if (!question) return;

    const newOption: NewOption = {
      questionId,
      optionText: `Option ${(question.options?.length || 0) + 1}`,
      isCorrect: false,
      orderIndex: (question.options?.length || 0) + 1,
    };

    createOptionMutation.mutate(newOption);
  };

  if (isLoading) {
    return <div data-testid="loading-questions">Loading questions...</div>;
  }

  // Ensure questions is always an array
  const questionsList = Array.isArray(questions) ? questions : [];

  return (
    <div className="space-y-6" data-testid="question-manager">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Question Management</h3>
        <Button 
          onClick={() => setShowAddForm(true)}
          data-testid="button-add-question"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {showAddForm && (
        <Card data-testid="form-add-question">
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea
                id="questionText"
                value={newQuestion.questionText || ''}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                placeholder="Enter the question text..."
                data-testid="input-question-text"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  value={newQuestion.questionType}
                  onValueChange={(value) => setNewQuestion({ 
                    ...newQuestion, 
                    questionType: value as NewQuestion['questionType'] 
                  })}
                >
                  <SelectTrigger data-testid="select-question-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  min="1"
                  value={newQuestion.marks || 1}
                  onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) })}
                  data-testid="input-question-marks"
                />
              </div>

              <div>
                <Label htmlFor="orderIndex">Order</Label>
                <Input
                  id="orderIndex"
                  type="number"
                  min="1"
                  value={newQuestion.orderIndex || 1}
                  onChange={(e) => setNewQuestion({ ...newQuestion, orderIndex: parseInt(e.target.value) })}
                  data-testid="input-question-order"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                value={newQuestion.explanation || ''}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                placeholder="Explain the correct answer..."
                data-testid="input-question-explanation"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreateQuestion}
                disabled={createQuestionMutation.isPending}
                data-testid="button-save-question"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Question
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                data-testid="button-cancel-question"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {questionsList.map((question: QuestionWithOptions, index: number) => (
          <Card key={question.id} data-testid={`question-card-${question.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Q{index + 1}.</span>
                  <Badge variant="secondary" data-testid={`question-type-${question.id}`}>
                    {question.questionType?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant="outline" data-testid={`question-marks-${question.id}`}>
                    {question.marks} marks
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingQuestion(question.id)}
                    data-testid={`button-edit-question-${question.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteQuestionMutation.mutate(question.id)}
                    data-testid={`button-delete-question-${question.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4" data-testid={`question-text-${question.id}`}>
                {question.questionText}
              </p>

              {question.questionType === 'multiple_choice' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Options:</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddOption(question.id)}
                      data-testid={`button-add-option-${question.id}`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                  {question.options?.map((option: QuestionOption) => (
                    <div 
                      key={option.id} 
                      className={`p-2 border rounded flex justify-between items-center ${
                        option.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                      data-testid={`option-${option.id}`}
                    >
                      <span>{option.optionText}</span>
                      <div className="flex items-center gap-2">
                        {option.isCorrect && (
                          <Badge variant="default" data-testid={`correct-option-${option.id}`}>
                            Correct
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteOptionMutation.mutate(option.id)}
                          data-testid={`button-delete-option-${option.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {question.explanation && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-medium text-blue-800">Explanation:</h4>
                  <p className="text-blue-700" data-testid={`question-explanation-${question.id}`}>
                    {question.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {questionsList.length === 0 && (
        <Card data-testid="no-questions-message">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No questions added yet. Click "Add Question" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}