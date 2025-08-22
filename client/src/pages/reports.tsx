import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EnrollmentChart } from '@/components/Charts/EnrollmentChart';
import { FinancialChart } from '@/components/Charts/FinancialChart';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatCurrency, formatDate, formatPercentage } from '@/utils/formatters';
import { Download, FileText, TrendingUp, Calendar, Filter, Eye, Share2, Search } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'financial' | 'administrative' | 'student' | 'attendance';
  type: 'summary' | 'detailed' | 'analytical';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on-demand';
  status: 'available' | 'generating' | 'scheduled';
  lastGenerated?: string;
  nextScheduled?: string;
  size?: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

export default function Reports() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock reports data
  const reports: Report[] = [
    {
      id: '1',
      name: 'Student Enrollment Report',
      description: 'Comprehensive report on student enrollment trends and statistics',
      category: 'student',
      type: 'analytical',
      frequency: 'monthly',
      status: 'available',
      lastGenerated: '2024-02-01T09:00:00Z',
      nextScheduled: '2024-03-01T09:00:00Z',
      size: '2.4 MB',
      format: 'pdf'
    },
    {
      id: '2',
      name: 'Financial Summary Report',
      description: 'Monthly financial performance and revenue analysis',
      category: 'financial',
      type: 'summary',
      frequency: 'monthly',
      status: 'available',
      lastGenerated: '2024-02-01T10:00:00Z',
      nextScheduled: '2024-03-01T10:00:00Z',
      size: '1.8 MB',
      format: 'excel'
    },
    {
      id: '3',
      name: 'Attendance Analytics',
      description: 'Student attendance patterns and trends analysis',
      category: 'attendance',
      type: 'analytical',
      frequency: 'weekly',
      status: 'available',
      lastGenerated: '2024-02-12T08:00:00Z',
      nextScheduled: '2024-02-19T08:00:00Z',
      size: '856 KB',
      format: 'pdf'
    },
    {
      id: '4',
      name: 'Academic Performance Report',
      description: 'Detailed analysis of student academic performance by grade and subject',
      category: 'academic',
      type: 'detailed',
      frequency: 'quarterly',
      status: 'generating',
      nextScheduled: '2024-03-31T12:00:00Z',
      format: 'pdf'
    },
    {
      id: '5',
      name: 'Staff Directory Export',
      description: 'Complete list of all staff members with contact information',
      category: 'administrative',
      type: 'summary',
      frequency: 'on-demand',
      status: 'available',
      lastGenerated: '2024-02-10T14:30:00Z',
      size: '324 KB',
      format: 'csv'
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'administrative':
        return 'bg-purple-100 text-purple-800';
      case 'student':
        return 'bg-yellow-100 text-yellow-800';
      case 'attendance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalReports: reports.length,
    availableReports: reports.filter(r => r.status === 'available').length,
    scheduledReports: reports.filter(r => r.status === 'scheduled').length,
    generatingReports: reports.filter(r => r.status === 'generating').length
  };

  // Get dashboard statistics
  const dashboardStats = dataService.getDashboardStats();

  const handleGenerateReport = (reportId: string) => {
    addToast('Report generation started!', 'info');
  };

  const handleDownloadReport = (reportId: string) => {
    addToast('Report download started!', 'success');
  };

  const handleScheduleReport = () => {
    addToast('Report scheduling feature coming soon!', 'info');
  };

  const handleCustomReport = () => {
    addToast('Custom report builder coming soon!', 'info');
  };

  return (
    <div className="space-y-8" data-testid="reports-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Reporting & Analytics
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Generate comprehensive reports and analyze school data
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleCustomReport} data-testid="button-custom-report">
            <FileText className="w-4 h-4 mr-2" />
            Custom Report
          </Button>
          <Button onClick={handleScheduleReport} data-testid="button-schedule-report">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Reports</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalReports}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Available</p>
                <p className="text-3xl font-bold text-slate-800">{stats.availableReports}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Generating</p>
                <p className="text-3xl font-bold text-slate-800">{stats.generatingReports}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Scheduled</p>
                <p className="text-3xl font-bold text-slate-800">{stats.scheduledReports}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-4">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setActiveTab('dashboard')}
              data-testid="tab-dashboard"
            >
              Analytics Dashboard
            </Button>
            <Button
              variant={activeTab === 'reports' ? 'default' : 'outline'}
              onClick={() => setActiveTab('reports')}
              data-testid="tab-reports"
            >
              Generated Reports
            </Button>
            <Button
              variant={activeTab === 'scheduled' ? 'default' : 'outline'}
              onClick={() => setActiveTab('scheduled')}
              data-testid="tab-scheduled"
            >
              Scheduled Reports
            </Button>
            <Button
              variant={activeTab === 'custom' ? 'default' : 'outline'}
              onClick={() => setActiveTab('custom')}
              data-testid="tab-custom"
            >
              Custom Reports
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Analytics Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Students Enrolled</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardStats.totalStudents}</p>
                    <p className="text-sm text-green-600">+5.2% this month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-slate-800">{formatCurrency(dashboardStats.monthlyRevenue)}</p>
                    <p className="text-sm text-green-600">+12.5% growth</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Attendance Rate</p>
                    <p className="text-3xl font-bold text-slate-800">{formatPercentage(dashboardStats.attendanceRate)}</p>
                    <p className="text-sm text-green-600">+1.2% this week</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Classes</p>
                    <p className="text-3xl font-bold text-slate-800">{dashboardStats.activeClasses}</p>
                    <p className="text-sm text-blue-600">Running today</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EnrollmentChart />
            <FinancialChart />
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Average Grade</span>
                    <span className="font-semibold text-slate-800">B+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Pass Rate</span>
                    <span className="font-semibold text-slate-800">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Improvement Rate</span>
                    <span className="font-semibold text-green-600">+3.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Collection Rate</span>
                    <span className="font-semibold text-slate-800">96.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Pending Fees</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(dashboardStats.pendingFees)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Revenue Growth</span>
                    <span className="font-semibold text-green-600">+12.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Classroom Usage</span>
                    <span className="font-semibold text-slate-800">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Library Books</span>
                    <span className="font-semibold text-slate-800">{dashboardStats.libraryBooks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Staff Utilization</span>
                    <span className="font-semibold text-slate-800">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Generated Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-reports"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-type-filter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500" data-testid="text-no-reports">
                    No reports found matching your criteria.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow" data-testid={`card-report-${report.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800" data-testid={`text-report-name-${report.id}`}>
                            {report.name}
                          </h3>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge className={getCategoryColor(report.category)} variant="outline">
                            {report.category}
                          </Badge>
                          <Badge variant="outline" className="uppercase" data-testid={`badge-report-format-${report.id}`}>
                            {report.format}
                          </Badge>
                        </div>
                        
                        <p className="text-slate-600 mb-4" data-testid={`text-report-description-${report.id}`}>
                          {report.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-slate-700">Type</p>
                            <p className="text-slate-600" data-testid={`text-report-type-${report.id}`}>
                              {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">Frequency</p>
                            <p className="text-slate-600" data-testid={`text-report-frequency-${report.id}`}>
                              {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">Last Generated</p>
                            <p className="text-slate-600" data-testid={`text-report-last-${report.id}`}>
                              {report.lastGenerated ? formatDate(report.lastGenerated) : 'Never'}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">Size</p>
                            <p className="text-slate-600" data-testid={`text-report-size-${report.id}`}>
                              {report.size || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {report.status === 'available' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleDownloadReport(report.id)}
                              data-testid={`button-download-report-${report.id}`}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              data-testid={`button-view-report-${report.id}`}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              data-testid={`button-share-report-${report.id}`}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </>
                        )}
                        {report.status === 'scheduled' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleGenerateReport(report.id)}
                            data-testid={`button-generate-report-${report.id}`}
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Generate Now
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {report.nextScheduled && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                          Next scheduled: {formatDate(report.nextScheduled)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>Scheduled reports management coming soon!</p>
              <p className="text-sm mt-2">Configure automatic report generation schedules</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Reports Tab */}
      {activeTab === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Report Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Filter className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p>Custom report builder coming soon!</p>
              <p className="text-sm mt-2">Create custom reports with drag-and-drop interface</p>
              <Button className="mt-4" onClick={handleCustomReport}>
                Launch Report Builder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
