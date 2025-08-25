import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Users, BookOpen, Plus, Eye, Edit, Trash2, BarChart3, FileText } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

// Type definitions
interface Exam {
  id: number;
  title: string;
  description?: string;
  subject: string;
  class: string;
  teacherId: number;
  totalMarks: number;
  duration: number;
  instructions?: string;
  status: string;
  startTime?: string;
  endTime?: string;
  allowLateSubmission: boolean;
  showResultsAfterSubmission: boolean;
  shuffleQuestions: boolean;
  maxAttempts: number;
  passingMarks?: number;
  createdAt: string;
  updatedAt: string;
}

interface ExamStats {
  examId: number;
  examTitle: string;
  totalStudentsAttempted: number;
  totalStudentsCompleted: number;
  averageScore: number;
  passRate: number;
  highestScore: number;
  lowestScore: number;
  totalQuestions: number;
  totalMarks: number;
  status: string;
}

// Form schema for creating/updating exams
const examFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  class: z.string().min(1, "Class is required"),
  teacherId: z.number().positive("Teacher ID must be positive"),
  totalMarks: z.number().min(0, "Total marks must be non-negative"),
  duration: z.number().positive("Duration must be positive"),
  instructions: z.string().optional(),
  status: z.enum(['draft', 'published', 'completed', 'cancelled']).default('draft'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  allowLateSubmission: z.boolean().default(false),
  showResultsAfterSubmission: z.boolean().default(false),
  shuffleQuestions: z.boolean().default(false),
  maxAttempts: z.number().positive().default(1),
  passingMarks: z.number().optional(),
});

type ExamFormData = z.infer<typeof examFormSchema>;

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function ExaminationPage() {
  const [activeTab, setActiveTab] = useState("exams");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch exams
  const { data: exams = [], isLoading: isLoadingExams } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  // Form setup
  const form = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      class: "",
      teacherId: 1, // Default teacher ID - should be dynamic
      totalMarks: 100,
      duration: 60,
      instructions: "",
      status: "draft",
      startTime: "",
      endTime: "",
      allowLateSubmission: false,
      showResultsAfterSubmission: false,
      shuffleQuestions: false,
      maxAttempts: 1,
      passingMarks: undefined,
    },
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: async (data: ExamFormData) => {
      return apiRequest("/api/exams", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      setIsCreateModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive",
      });
    },
  });

  // Update exam mutation
  const updateExamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExamFormData> }) => {
      return apiRequest(`/api/exams/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      setEditingExam(null);
      form.reset();
      toast({
        title: "Success",
        description: "Exam updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update exam",
        variant: "destructive",
      });
    },
  });

  // Delete exam mutation
  const deleteExamMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/exams/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete exam",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExamFormData) => {
    if (editingExam) {
      updateExamMutation.mutate({ id: editingExam.id, data });
    } else {
      createExamMutation.mutate(data);
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    form.reset({
      title: exam.title,
      description: exam.description || "",
      subject: exam.subject,
      class: exam.class,
      teacherId: exam.teacherId,
      totalMarks: exam.totalMarks,
      duration: exam.duration,
      instructions: exam.instructions || "",
      status: exam.status as any,
      startTime: exam.startTime ? format(new Date(exam.startTime), "yyyy-MM-dd'T'HH:mm") : "",
      endTime: exam.endTime ? format(new Date(exam.endTime), "yyyy-MM-dd'T'HH:mm") : "",
      allowLateSubmission: exam.allowLateSubmission,
      showResultsAfterSubmission: exam.showResultsAfterSubmission,
      shuffleQuestions: exam.shuffleQuestions,
      maxAttempts: exam.maxAttempts,
      passingMarks: exam.passingMarks || undefined,
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      deleteExamMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingExam(null);
    form.reset();
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="examination-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Examination System</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage exams, questions, and results</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-exam-button">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle data-testid="exam-modal-title">
                {editingExam ? "Edit Exam" : "Create New Exam"}
              </DialogTitle>
              <DialogDescription>
                {editingExam ? "Update exam details" : "Create a new exam for students"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Math Midterm Exam" {...field} data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Mathematics" {...field} data-testid="input-subject" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Input placeholder="10A" {...field} data-testid="input-class" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Marks</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            data-testid="input-total-marks"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            data-testid="input-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Exam description..." 
                          {...field} 
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Exam instructions for students..." 
                          {...field} 
                          data-testid="textarea-instructions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                            data-testid="input-start-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                            data-testid="input-end-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Attempts</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            data-testid="input-max-attempts"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeModal} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createExamMutation.isPending || updateExamMutation.isPending}
                    data-testid="button-save"
                  >
                    {editingExam ? "Update" : "Create"} Exam
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="exams" data-testid="tab-exams">Exams</TabsTrigger>
          <TabsTrigger value="questions" data-testid="tab-questions">Questions</TabsTrigger>
          <TabsTrigger value="submissions" data-testid="tab-submissions">Submissions</TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-4">
          {isLoadingExams ? (
            <div className="text-center py-8">Loading exams...</div>
          ) : exams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No exams found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get started by creating your first exam
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} data-testid="create-first-exam">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Exam
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-md transition-shadow" data-testid={`exam-card-${exam.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <CardDescription>{exam.subject} • {exam.class}</CardDescription>
                      </div>
                      <Badge className={statusColors[exam.status as keyof typeof statusColors]}>
                        {exam.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {exam.duration}m
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {exam.totalMarks} marks
                      </div>
                    </div>
                    
                    {exam.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {exam.description}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Created {formatDistanceToNow(new Date(exam.createdAt))} ago
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(exam)}
                          data-testid={`edit-exam-${exam.id}`}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(exam.id)}
                          data-testid={`delete-exam-${exam.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" data-testid={`view-questions-${exam.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          Questions
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`view-stats-${exam.id}`}>
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Stats
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Question Management</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Question management interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Student Submissions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Submission tracking interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Exam Results</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Results and analytics interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}