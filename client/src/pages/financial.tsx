import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from '@/utils/constants';
import { Plus, Search, Download, Receipt, DollarSign, TrendingUp, AlertCircle, Clock } from 'lucide-react';

export default function Financial() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const transactions = dataService.getTransactions();
  const students = dataService.getStudents();

  const filteredTransactions = transactions.filter(transaction => {
    const student = students.find(s => s.id === transaction.studentId);
    const matchesSearch = student && 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    const statusConfig = TRANSACTION_STATUS.find(s => s.value === status);
    return statusConfig ? statusConfig.color : 'bg-gray-100 text-gray-800';
  };

  const stats = {
    totalRevenue: transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0),
    pendingAmount: transactions
      .filter(t => t.status === 'pending' || t.status === 'overdue')
      .reduce((sum, t) => sum + t.amount, 0),
    collectedToday: transactions
      .filter(t => t.status === 'paid' && 
        new Date(t.paidDate || t.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, t) => sum + t.amount, 0),
    overdueCount: transactions.filter(t => t.status === 'overdue').length
  };

  const handleAddTransaction = () => {
    addToast('Transaction creation feature coming soon!', 'info');
  };

  const handleGenerateInvoice = () => {
    addToast('Invoice generation feature coming soon!', 'info');
  };

  const handleExport = () => {
    addToast('Financial export feature coming soon!', 'info');
  };

  const handlePayment = (transactionId: string) => {
    const updatedTransaction = dataService.updateTransaction(transactionId, {
      status: 'paid',
      paidDate: new Date().toISOString()
    });
    
    if (updatedTransaction) {
      addToast('Payment recorded successfully!', 'success');
    }
  };

  return (
    <div className="space-y-8" data-testid="financial-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Financial Management
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage fees, payments, and financial reports
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleAddTransaction} data-testid="button-add-transaction">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
          <Button onClick={handleGenerateInvoice} data-testid="button-generate-invoice">
            <Receipt className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-800">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-sm text-green-600">+12.5% this month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Payments</p>
                <p className="text-3xl font-bold text-slate-800">
                  {formatCurrency(stats.pendingAmount)}
                </p>
                <p className="text-sm text-yellow-600">{stats.overdueCount} overdue</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Collected Today</p>
                <p className="text-3xl font-bold text-slate-800">
                  {formatCurrency(stats.collectedToday)}
                </p>
                <p className="text-sm text-green-600">
                  {transactions.filter(t => t.status === 'paid' && 
                    new Date(t.paidDate || t.createdAt).toDateString() === new Date().toDateString()).length} payments
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Collection Rate</p>
                <p className="text-3xl font-bold text-slate-800">
                  {transactions.length > 0 ? 
                    Math.round((transactions.filter(t => t.status === 'paid').length / transactions.length) * 100) : 0}%
                </p>
                <p className="text-sm text-green-600">+2.3% this week</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-transactions"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {TRANSACTION_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExport} data-testid="button-export-financial">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Transaction ID</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50" data-testid={`row-transaction-${transaction.id}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800" data-testid={`text-student-name-${transaction.id}`}>
                          {getStudentName(transaction.studentId)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-transaction-id-${transaction.id}`}>
                        #{transaction.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800" data-testid={`text-amount-${transaction.id}`}>
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-type-${transaction.id}`}>
                        {TRANSACTION_TYPES.find(t => t.value === transaction.type)?.label || transaction.type}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600" data-testid={`text-due-date-${transaction.id}`}>
                        {formatDate(transaction.dueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {transaction.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePayment(transaction.id)}
                              data-testid={`button-pay-${transaction.id}`}
                            >
                              Record Payment
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-view-${transaction.id}`}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              Revenue chart will be displayed here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TRANSACTION_STATUS.map((status) => {
                const count = transactions.filter(t => t.status === status.value).length;
                const percentage = transactions.length > 0 ? (count / transactions.length) * 100 : 0;
                
                return (
                  <div key={status.value} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${status.color.includes('green') ? 'bg-green-500' :
                        status.color.includes('yellow') ? 'bg-yellow-500' :
                        status.color.includes('red') ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                      <span className="text-sm font-medium text-slate-700">{status.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-800">{count}</span>
                      <span className="text-xs text-slate-600 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
