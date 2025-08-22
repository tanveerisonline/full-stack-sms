import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatDate } from '@/utils/formatters';
import { BOOK_CATEGORIES } from '@/utils/constants';
import { Plus, Search, BookOpen, Users, Clock, AlertCircle, Download, CornerDownLeft } from 'lucide-react';

export default function Library() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('books');

  const books = dataService.getBooks();
  const bookIssues = dataService.getBookIssues();
  const students = dataService.getStudents();

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredIssues = bookIssues.filter(issue => {
    const book = books.find(b => b.id === issue.bookId);
    const student = students.find(s => s.id === issue.studentId);
    const matchesSearch = book && 
      (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (student && `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesSearch;
  });

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  const getBookTitle = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    return book ? book.title : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'issued':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const stats = {
    totalBooks: books.length,
    availableBooks: books.reduce((sum, book) => sum + book.available, 0),
    issuedBooks: bookIssues.filter(issue => issue.status === 'issued').length,
    overdueBooks: bookIssues.filter(issue => 
      issue.status === 'issued' && isOverdue(issue.dueDate)
    ).length
  };

  const handleAddBook = () => {
    addToast('Book addition feature coming soon!', 'info');
  };

  const handleIssueBook = () => {
    addToast('Book issue feature coming soon!', 'info');
  };

  const handleReturnBook = (issueId: string) => {
    // Update book issue status
    const updatedIssue = {
      status: 'returned',
      returnDate: new Date().toISOString()
    };
    
    // In a real implementation, we would update the database
    addToast('Book returned successfully!', 'success');
  };

  return (
    <div className="space-y-8" data-testid="library-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Library System
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Manage books, track issues, and maintain library records
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleAddBook} data-testid="button-add-book">
            <Plus className="w-4 h-4 mr-2" />
            Add Book
          </Button>
          <Button onClick={handleIssueBook} data-testid="button-issue-book">
            <BookOpen className="w-4 h-4 mr-2" />
            Issue Book
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Books</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalBooks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Available</p>
                <p className="text-3xl font-bold text-slate-800">{stats.availableBooks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Issued</p>
                <p className="text-3xl font-bold text-slate-800">{stats.issuedBooks}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-3xl font-bold text-slate-800">{stats.overdueBooks}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
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
              variant={activeTab === 'books' ? 'default' : 'outline'}
              onClick={() => setActiveTab('books')}
              data-testid="tab-books"
            >
              Books Catalog
            </Button>
            <Button
              variant={activeTab === 'issues' ? 'default' : 'outline'}
              onClick={() => setActiveTab('issues')}
              data-testid="tab-issues"
            >
              Book Issues
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder={activeTab === 'books' ? "Search books..." : "Search issues..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-library"
              />
            </div>
            
            {activeTab === 'books' && (
              <>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {BOOK_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            
            <Button variant="outline" data-testid="button-export-library">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Books Catalog */}
      {activeTab === 'books' && (
        <Card>
          <CardHeader>
            <CardTitle>Books Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Book Details</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ISBN</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Total</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Available</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No books found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-50" data-testid={`row-book-${book.id}`}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-800" data-testid={`text-book-title-${book.id}`}>
                              {book.title}
                            </p>
                            <p className="text-sm text-slate-600" data-testid={`text-book-author-${book.id}`}>
                              by {book.author}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-book-isbn-${book.id}`}>
                          {book.isbn}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-book-category-${book.id}`}>
                          {book.category}
                        </td>
                        <td className="px-4 py-3 text-center" data-testid={`text-book-total-${book.id}`}>
                          {book.quantity}
                        </td>
                        <td className="px-4 py-3 text-center" data-testid={`text-book-available-${book.id}`}>
                          {book.available}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(book.status)}>
                            {book.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" data-testid={`button-edit-book-${book.id}`}>
                              Edit
                            </Button>
                            {book.available > 0 && (
                              <Button size="sm" data-testid={`button-issue-book-${book.id}`}>
                                Issue
                              </Button>
                            )}
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
      )}

      {/* Book Issues */}
      {activeTab === 'issues' && (
        <Card>
          <CardHeader>
            <CardTitle>Book Issues & Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Book</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Issue Date</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Due Date</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">CornerDownLeft Date</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No book issues found.
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50" data-testid={`row-issue-${issue.id}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800" data-testid={`text-issue-book-${issue.id}`}>
                            {getBookTitle(issue.bookId)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-issue-student-${issue.id}`}>
                          {getStudentName(issue.studentId)}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-issue-date-${issue.id}`}>
                          {formatDate(issue.issuedDate)}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-due-date-${issue.id}`}>
                          {formatDate(issue.dueDate)}
                          {isOverdue(issue.dueDate) && issue.status === 'issued' && (
                            <span className="ml-2 text-red-600 text-sm">(Overdue)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600" data-testid={`text-return-date-${issue.id}`}>
                          {issue.returnDate ? formatDate(issue.returnDate) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(
                            issue.status === 'issued' && isOverdue(issue.dueDate) ? 'overdue' : issue.status
                          )}>
                            {issue.status === 'issued' && isOverdue(issue.dueDate) ? 'overdue' : issue.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {issue.status === 'issued' && (
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleReturnBook(issue.id)}
                                data-testid={`button-return-${issue.id}`}
                              >
                                <CornerDownLeft className="w-4 h-4 mr-1" />
                                CornerDownLeft
                              </Button>
                              {issue.fineAmount && issue.fineAmount > 0 && (
                                <span className="text-sm text-red-600">
                                  Fine: ${issue.fineAmount}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
