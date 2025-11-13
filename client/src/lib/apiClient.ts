// API Client for backend integration
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get authentication token from localStorage
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // Include authentication token if available
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string): Promise<void> {
    await this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Students
  async getStudents() {
    return this.get('/students');
  }

  async getStudent(id: number) {
    return this.get(`/students/${id}`);
  }

  async createStudent(student: any) {
    return this.post('/students', student);
  }

  async updateStudent(id: number, student: any) {
    return this.put(`/students/${id}`, student);
  }

  async deleteStudent(id: number) {
    return this.delete(`/students/${id}`);
  }

  // Teachers
  async getTeachers() {
    return this.get('/teachers');
  }

  async createTeacher(teacher: any) {
    return this.post('/teachers', teacher);
  }

  async updateTeacher(id: number, teacher: any) {
    return this.put(`/teachers/${id}`, teacher);
  }

  async deleteTeacher(id: number) {
    return this.delete(`/teachers/${id}`);
  }

  // Books
  async getBooks() {
    return this.get('/books');
  }

  async getBook(id: number) {
    return this.get(`/books/${id}`);
  }

  async createBook(book: any) {
    return this.post('/books', book);
  }

  async updateBook(id: number, book: any) {
    return this.put(`/books/${id}`, book);
  }

  async deleteBook(id: number) {
    return this.delete(`/books/${id}`);
  }

  // Book Issues
  async getBookIssues() {
    return this.get('/book-issues');
  }

  async createBookIssue(bookIssue: any) {
    return this.post('/book-issues', bookIssue);
  }

  async updateBookIssue(id: number, bookIssue: any) {
    return this.put(`/book-issues/${id}`, bookIssue);
  }

  async deleteBookIssue(id: number) {
    return this.delete(`/book-issues/${id}`);
  }

  // Transactions
  async getTransactions() {
    return this.get('/transactions');
  }

  async createTransaction(transaction: any) {
    return this.post('/transactions', transaction);
  }

  async updateTransaction(id: number, transaction: any) {
    return this.put(`/transactions/${id}`, transaction);
  }

  async deleteTransaction(id: number) {
    return this.delete(`/transactions/${id}`);
  }

  // Assignments
  async getAssignments() {
    return this.get('/assignments');
  }

  async createAssignment(assignment: any) {
    return this.post('/assignments', assignment);
  }

  async updateAssignment(id: number, assignment: any) {
    return this.put(`/assignments/${id}`, assignment);
  }

  async deleteAssignment(id: number) {
    return this.delete(`/assignments/${id}`);
  }

  // Grades
  async getGrades() {
    return this.get('/grades');
  }

  async createGrade(grade: any) {
    return this.post('/grades', grade);
  }

  async updateGrade(id: number, grade: any) {
    return this.put(`/grades/${id}`, grade);
  }

  async deleteGrade(id: number) {
    return this.delete(`/grades/${id}`);
  }

  // Attendance
  async getAttendance() {
    return this.get('/attendance');
  }

  async createAttendance(attendance: any) {
    return this.post('/attendance', attendance);
  }

  async updateAttendance(id: number, attendance: any) {
    return this.put(`/attendance/${id}`, attendance);
  }

  async deleteAttendance(id: number) {
    return this.delete(`/attendance/${id}`);
  }

  // Announcements
  async getAnnouncements() {
    return this.get('/announcements');
  }

  async createAnnouncement(announcement: any) {
    return this.post('/announcements', announcement);
  }

  async updateAnnouncement(id: number, announcement: any) {
    return this.put(`/announcements/${id}`, announcement);
  }

  async deleteAnnouncement(id: number) {
    return this.delete(`/announcements/${id}`);
  }

  // Timetable
  async getTimetable() {
    return this.get('/timetable');
  }

  async createTimetableEntry(timetableEntry: any) {
    return this.post('/timetable', timetableEntry);
  }

  async updateTimetableEntry(id: number, timetableEntry: any) {
    return this.put(`/timetable/${id}`, timetableEntry);
  }

  async deleteTimetableEntry(id: number) {
    return this.delete(`/timetable/${id}`);
  }
}

export const apiClient = new ApiClient();