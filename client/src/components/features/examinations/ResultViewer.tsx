import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Award, Users, BarChart, Download, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import type { ExamResult } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ResultViewerProps {
  examId: number;
}

export function ResultViewer({ examId }: ResultViewerProps) {
  const [sortBy, setSortBy] = useState<string>('percentage');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<number | null>(null);

  // Get results for the exam
  const { data: results, isLoading } = useQuery<ExamResult[]>({
    queryKey: ['/api/exams', examId, 'results'],
    queryFn: () => apiRequest(`/api/exams/${examId}/results`),
  });

  // Get detailed result data
  const { data: resultDetails } = useQuery<ExamResult>({
    queryKey: ['/api/results', selectedResult],
    queryFn: () => selectedResult ? apiRequest(`/api/results/${selectedResult}`) : null,
    enabled: !!selectedResult,
  });

  const sortedResults = results?.sort((a: ExamResult, b: ExamResult) => {
    switch (sortBy) {
      case 'percentage':
        return (parseFloat(b.percentage || '0') - parseFloat(a.percentage || '0'));
      case 'score':
        return (parseFloat(b.totalScore || '0') - parseFloat(a.totalScore || '0'));
      case 'time':
        return (b.timeSpent || 0) - (a.timeSpent || 0);
      case 'student':
        return a.studentId - b.studentId;
      default:
        return 0;
    }
  }) || [];

  const filteredResults = sortedResults.filter((result: ExamResult) => {
    const matchesSearch = searchTerm === '' || 
      result.studentId.toString().includes(searchTerm) ||
      result.id.toString().includes(searchTerm);
    return matchesSearch;
  });

  // Calculate statistics
  const totalResults = results?.length || 0;
  const passedResults = results?.filter((r: ExamResult) => r.passed).length || 0;
  const averageScore = totalResults > 0 ? 
    results.reduce((sum: number, r: ExamResult) => sum + (parseFloat(r.totalScore || '0')), 0) / totalResults : 0;
  const averagePercentage = totalResults > 0 ? 
    results.reduce((sum: number, r: ExamResult) => sum + (parseFloat(r.percentage || '0')), 0) / totalResults : 0;
  const highestScore = totalResults > 0 ? 
    Math.max(...results.map((r: ExamResult) => parseFloat(r.totalScore || '0'))) : 0;
  const lowestScore = totalResults > 0 ? 
    Math.min(...results.map((r: ExamResult) => parseFloat(r.totalScore || '0'))) : 0;

  // Grade distribution
  const gradeDistribution = results?.reduce((acc: Record<string, number>, result: ExamResult) => {
    const percentage = parseFloat(result.percentage || '0');
    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {}) || {};

  if (isLoading) {
    return <div data-testid="loading-results">Loading results...</div>;
  }

  return (
    <div className="space-y-6" data-testid="result-viewer">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Exam Results</h3>
        <Button variant="outline" data-testid="button-export-results">
          <Download className="w-4 h-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="total-results-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Results</p>
                <p className="text-2xl font-bold" data-testid="total-results-count">
                  {totalResults}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="pass-rate-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600" data-testid="pass-rate">
                  {totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0}%
                </p>
              </div>
              <Award className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="average-score-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="average-score">
                  {Math.round(averageScore * 100) / 100}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="average-percentage-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average %</p>
                <p className="text-2xl font-bold text-purple-600" data-testid="average-percentage">
                  {Math.round(averagePercentage * 100) / 100}%
                </p>
              </div>
              <BarChart className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card data-testid="grade-distribution-card">
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="flex items-center gap-4">
                <span className="w-8 font-medium" data-testid={`grade-${grade}`}>
                  {grade}
                </span>
                <div className="flex-1">
                  <Progress 
                    value={totalResults > 0 ? ((count as number) / totalResults) * 100 : 0}
                    className="h-2"
                    data-testid={`progress-${grade}`}
                  />
                </div>
                <span className="text-sm text-gray-600" data-testid={`count-${grade}`}>
                  {count} ({totalResults > 0 ? Math.round(((count as number) / totalResults) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <div className="flex gap-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48" data-testid="sort-results">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage (High to Low)</SelectItem>
            <SelectItem value="score">Score (High to Low)</SelectItem>
            <SelectItem value="time">Time Spent</SelectItem>
            <SelectItem value="student">Student ID</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search by student ID or result ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
          data-testid="search-results"
        />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" data-testid="tab-results-list">Results List</TabsTrigger>
          <TabsTrigger value="details" data-testid="tab-result-details">Result Details</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredResults.map((result: ExamResult, index: number) => (
            <Card 
              key={result.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedResult(result.id)}
              data-testid={`result-card-${result.id}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" data-testid={`result-rank-${result.id}`}>
                        #{index + 1}
                      </span>
                      <span className="font-medium" data-testid={`result-student-${result.id}`}>
                        Student ID: {result.studentId}
                      </span>
                      <Badge 
                        variant={result.passed ? "default" : "destructive"}
                        data-testid={`result-status-${result.id}`}
                      >
                        {result.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600" data-testid={`result-answers-${result.id}`}>
                      Correct Answers: {result.correctAnswers}/{result.totalQuestions}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-lg font-bold" data-testid={`result-score-${result.id}`}>
                      {result.totalScore}/{result.maxScore}
                    </div>
                    <div className="text-sm text-gray-600" data-testid={`result-percentage-${result.id}`}>
                      {result.percentage}%
                    </div>
                    {result.timeSpent !== undefined && (
                      <div className="text-sm text-gray-600" data-testid={`result-time-${result.id}`}>
                        Time: {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <Progress 
                    value={parseFloat(result.percentage || '0')}
                    className="h-2"
                    data-testid={`result-progress-${result.id}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredResults.length === 0 && (
            <Card data-testid="no-results-message">
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No results found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedResult && resultDetails ? (
            <Card data-testid="result-details">
              <CardHeader>
                <CardTitle>Result Details #{selectedResult}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Student Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div data-testid="detail-student-id">
                        <strong>Student ID:</strong> {resultDetails.studentId}
                      </div>
                      <div data-testid="detail-score">
                        <strong>Score:</strong> {resultDetails.totalScore}/{resultDetails.maxScore}
                      </div>
                      <div data-testid="detail-percentage">
                        <strong>Percentage:</strong> {resultDetails.percentage}%
                      </div>
                      <div data-testid="detail-status">
                        <strong>Status:</strong> 
                        <Badge 
                          className={`ml-2 ${resultDetails.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {resultDetails.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Question Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div data-testid="detail-correct-answers">
                        <strong>Correct Answers:</strong> {resultDetails.correctAnswers}
                      </div>
                      <div data-testid="detail-total-questions">
                        <strong>Total Questions:</strong> {resultDetails.totalQuestions}
                      </div>
                      <div data-testid="detail-accuracy">
                        <strong>Accuracy:</strong> {resultDetails.totalQuestions > 0 ? 
                          Math.round((resultDetails.correctAnswers / resultDetails.totalQuestions) * 100) : 0}%
                      </div>
                      <div data-testid="detail-time-spent">
                        <strong>Time Spent:</strong> {resultDetails.timeSpent ? 
                          `${Math.floor(resultDetails.timeSpent / 60)}m ${resultDetails.timeSpent % 60}s` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Performance Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Score</span>
                      <span>{resultDetails.percentage}%</span>
                    </div>
                    <Progress value={parseFloat(resultDetails.percentage || '0')} className="h-3" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600" data-testid="detail-created-at">
                    Result generated: {formatDistanceToNow(new Date(resultDetails.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="select-result-message">
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Select a result from the list to view details.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="score-analytics-card">
              <CardHeader>
                <CardTitle>Score Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between" data-testid="highest-score">
                    <span>Highest Score:</span>
                    <span className="font-bold text-green-600">{highestScore}</span>
                  </div>
                  <div className="flex justify-between" data-testid="lowest-score">
                    <span>Lowest Score:</span>
                    <span className="font-bold text-red-600">{lowestScore}</span>
                  </div>
                  <div className="flex justify-between" data-testid="average-score-analytics">
                    <span>Average Score:</span>
                    <span className="font-bold text-blue-600">{Math.round(averageScore * 100) / 100}</span>
                  </div>
                  <div className="flex justify-between" data-testid="score-range">
                    <span>Score Range:</span>
                    <span className="font-bold">{highestScore - lowestScore}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="performance-metrics-card">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between" data-testid="students-passed">
                    <span>Students Passed:</span>
                    <span className="font-bold text-green-600">{passedResults}</span>
                  </div>
                  <div className="flex justify-between" data-testid="students-failed">
                    <span>Students Failed:</span>
                    <span className="font-bold text-red-600">{totalResults - passedResults}</span>
                  </div>
                  <div className="flex justify-between" data-testid="completion-rate">
                    <span>Completion Rate:</span>
                    <span className="font-bold text-blue-600">100%</span>
                  </div>
                  <div className="flex justify-between" data-testid="class-average">
                    <span>Class Average:</span>
                    <span className="font-bold">{Math.round(averagePercentage * 100) / 100}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}