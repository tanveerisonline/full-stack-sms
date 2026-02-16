import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Search, 
  Calendar,
  Download,
  Plus,
  Eye,
  FileText,
  Calculator,
  TrendingUp,
  Users
} from 'lucide-react';

const payrollSchema = z.object({
  teacherId: z.string().min(1, 'Teacher is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.string().min(4, 'Year is required'),
  basicSalary: z.number().min(0, 'Basic salary must be positive'),
  allowances: z.number().min(0, 'Allowances must be positive'),
  deductions: z.number().min(0, 'Deductions must be positive'),
  overtime: z.number().min(0, 'Overtime must be positive'),
  bonus: z.number().min(0, 'Bonus must be positive'),
  notes: z.string().optional(),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface PayrollRecord {
  id: number;
  teacherId: number;
  teacherName: string;
  employeeId: string;
  month: string;
  year: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  overtime: number;
  bonus: number;
  grossSalary: number;
  netSalary: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
  notes?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollManagement() {
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      teacherId: '',
      month: '',
      year: new Date().getFullYear().toString(),
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      overtime: 0,
      bonus: 0,
      notes: '',
    },
  });

  // Fetch teachers for dropdown
  const { data: teachers = [] } = useQuery({
    queryKey: ['/api/teachers'],
  });

  // Fetch payroll records
  const { data: payrollRecords = [], isLoading } = useQuery({
    queryKey: ['/api/payroll'],
  });

  // Fetch payroll statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/payroll/stats'],
  });

  // Type assertions for better TypeScript support
  const payrollData = payrollRecords as PayrollRecord[];
  const statsData = stats as any;
  const teachersData = teachers as any[];

  // Create payroll mutation
  const createPayrollMutation = useMutation({
    mutationFn: async (payrollData: any) => {
      return apiRequest('/api/payroll', {
        method: 'POST',
        body: JSON.stringify(payrollData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Payroll Created",
        description: "Payroll record has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/stats'] });
      setShowPayrollForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create",
        description: error.message || "Failed to create payroll record.",
        variant: "destructive",
      });
    },
  });

  // Update payroll status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/payroll/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Payroll status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: PayrollFormData) => {
    // Calculate gross and net salary
    const basicSal = Number(data.basicSalary) || 0;
    const allowances = Number(data.allowances) || 0;
    const deductions = Number(data.deductions) || 0;
    const overtime = Number(data.overtime) || 0;
    const bonus = Number(data.bonus) || 0;
    
    const grossSalary = basicSal + allowances + overtime + bonus;
    const netSalary = grossSalary - deductions;

    // Ensure proper data serialization with string values as expected by schema
    const payrollData = {
      teacherId: Number(data.teacherId),
      month: data.month,
      year: data.year,
      basicSalary: basicSal.toString(),
      allowances: allowances.toString(),
      deductions: deductions.toString(),
      overtime: overtime.toString(),
      bonus: bonus.toString(),
      grossSalary: grossSalary.toString(),
      netSalary: netSalary.toString(),
      notes: data.notes || ''
    };
    createPayrollMutation.mutate(payrollData);
  };

  const handleViewDetails = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = (recordId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: recordId, status: newStatus });
  };

  // Filter records
  const filteredRecords = payrollData.filter((record: PayrollRecord) => {
    const matchesSearch = 
      record.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !filterMonth || record.month === filterMonth;
    const matchesYear = !filterYear || record.year === filterYear;
    
    return matchesSearch && matchesMonth && matchesYear;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="text-payroll-title">
              Payroll Management
            </h1>
            <p className="text-gray-600">Manage teacher salaries and payroll records</p>
          </div>
          <Button 
            onClick={() => setShowPayrollForm(true)}
            className="flex items-center gap-2"
            data-testid="button-create-payroll"
          >
            <Plus className="h-4 w-4" />
            Create Payroll
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Monthly</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-total-monthly">
                    ${statsData?.totalMonthly?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid This Month</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-paid-count">
                    {statsData?.paidThisMonth || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calculator className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-pending-count">
                    {statsData?.pending || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Salary</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-avg-salary">
                    ${statsData?.averageSalary?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by teacher name or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-payroll"
                />
              </div>
              
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                data-testid="select-filter-month"
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
                data-testid="select-filter-year"
              >
                <option value="">All Years</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Records ({filteredRecords.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading payroll records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No payroll records found</p>
                <Button 
                  onClick={() => setShowPayrollForm(true)} 
                  className="mt-4"
                  data-testid="button-create-first-payroll"
                >
                  Create First Payroll
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Gross Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Net Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record: PayrollRecord) => (
                      <tr key={record.id} data-testid={`row-payroll-${record.id}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.teacherName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {record.employeeId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.month} {record.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${record.grossSalary.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${record.netSalary.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(record)}
                              data-testid={`button-view-${record.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {record.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(record.id, 'approved')}
                                className="text-blue-600"
                                data-testid={`button-approve-${record.id}`}
                              >
                                Approve
                              </Button>
                            )}
                            {record.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(record.id, 'paid')}
                                className="text-green-600"
                                data-testid={`button-pay-${record.id}`}
                              >
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Payroll Modal */}
        <Dialog open={showPayrollForm} onOpenChange={setShowPayrollForm}>
          <DialogContent className="max-w-2xl" data-testid="dialog-payroll-form">
            <DialogHeader>
              <DialogTitle>Create Payroll Record</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="teacherId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-teacher">
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachersData.map((teacher: any) => (
                              <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                {teacher.firstName} {teacher.lastName} - {teacher.employeeId}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-month">
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="2024" 
                            {...field} 
                            data-testid="input-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basicSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Basic Salary</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="50000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-basic-salary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowances"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allowances</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="5000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-allowances"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deductions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deductions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="2000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-deductions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overtime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overtime</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="1000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-overtime"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bonus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonus</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="3000" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-bonus"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Additional notes..." 
                          {...field} 
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPayrollForm(false)}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPayrollMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit"
                  >
                    {createPayrollMutation.isPending ? 'Creating...' : 'Create Payroll'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Payroll Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl" data-testid="dialog-payroll-details">
            <DialogHeader>
              <DialogTitle>Payroll Details</DialogTitle>
            </DialogHeader>
            
            {selectedRecord && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teacher</label>
                    <p className="text-lg">{selectedRecord.teacherName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Period</label>
                    <p className="text-lg">{selectedRecord.month} {selectedRecord.year}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Salary Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Basic Salary:</span>
                      <span>${selectedRecord.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Allowances:</span>
                      <span>${selectedRecord.allowances.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overtime:</span>
                      <span>${selectedRecord.overtime.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus:</span>
                      <span>${selectedRecord.bonus.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Gross Salary:</span>
                      <span>${selectedRecord.grossSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Deductions:</span>
                      <span>-${selectedRecord.deductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Net Salary:</span>
                      <span>${selectedRecord.netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="mt-1">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}