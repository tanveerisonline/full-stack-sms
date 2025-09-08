import fs from 'fs';
import path from 'path';

const storageFile = 'E:\\SchoolPilot\\server\\storage.ts';

// Read the storage file
let content = fs.readFileSync(storageFile, 'utf8');

// Fix create operations - replace .returning() with proper insertId handling
const createOperations = [
  'createUser',
  'createStudent', 
  'createTeacher',
  'createClass',
  'createAssignment',
  'createGrade',
  'createAttendance', 
  'createBook',
  'createBookIssue',
  'createTransaction',
  'createAnnouncement',
  'createTimetableEntry',
  'createPayroll'
];

createOperations.forEach(operation => {
  // Find the table name based on operation
  const tableMap = {
    createUser: 'users',
    createStudent: 'students',
    createTeacher: 'teachers', 
    createClass: 'classes',
    createAssignment: 'assignments',
    createGrade: 'grades',
    createAttendance: 'attendance',
    createBook: 'books',
    createBookIssue: 'bookIssues',
    createTransaction: 'transactions',
    createAnnouncement: 'announcements',
    createTimetableEntry: 'timetable',
    createPayroll: 'payroll'
  };
  
  const tableName = tableMap[operation];
  if (!tableName) return;
  
  // Pattern for create operations with .returning()
  const createPattern = new RegExp(
    `async ${operation}\\([^)]+\\): Promise<[^>]+> {\\s*const \\[\\w+\\] = await db\\.insert\\(${tableName}\\)\\.values\\([^)]+\\)\\.returning\\(\\);\\s*return \\w+;`,
    'g'
  );
  
  // Replace with proper insertId handling
  content = content.replace(createPattern, (match) => {
    const paramMatch = match.match(new RegExp(`async ${operation}\\(([^)]+)\\): Promise<([^>]+)>`));
    const params = paramMatch?.[1] || 'data';
    const returnType = paramMatch?.[2] || 'any';
    
    return `async ${operation}(${params}): Promise<${returnType}> {
    const result = await db.insert(${tableName}).values(${params.includes(':') ? params.split(':')[0] : 'data'});
    // For MySQL, get the last inserted record
    const insertId = result.insertId || result[0]?.insertId;
    if (!insertId) {
      throw new Error('Failed to get insert ID for ${operation}');
    }
    const [created] = await db.select().from(${tableName}).where(eq(${tableName}.id, Number(insertId)));
    if (!created) {
      throw new Error('Failed to retrieve created record for ${operation}');
    }
    return created;`;
  });
});

// Fix update operations - replace .returning() with select after update
const updateOperations = [
  'updateStudent',
  'updateTeacher', 
  'updateClass',
  'updateAssignment',
  'updateGrade',
  'updateAttendance',
  'updateBook',
  'updateBookIssue',
  'updateTransaction',
  'updateAnnouncement',
  'updateTimetableEntry',
  'updatePayroll'
];

updateOperations.forEach(operation => {
  const tableMap = {
    updateStudent: 'students',
    updateTeacher: 'teachers',
    updateClass: 'classes',
    updateAssignment: 'assignments', 
    updateGrade: 'grades',
    updateAttendance: 'attendance',
    updateBook: 'books',
    updateBookIssue: 'bookIssues',
    updateTransaction: 'transactions',
    updateAnnouncement: 'announcements',
    updateTimetableEntry: 'timetable',
    updatePayroll: 'payroll'
  };
  
  const tableName = tableMap[operation];
  if (!tableName) return;
  
  // Pattern for update operations with .returning()
  const updatePattern = new RegExp(
    `async ${operation}\\([^)]+\\): Promise<[^>]+> {\\s*const \\[\\w+\\] = await db\\.update\\(${tableName}\\)[\\s\\S]*?\\.returning\\(\\);\\s*return \\w+;`,
    'g'
  );
  
  content = content.replace(updatePattern, (match) => {
    const paramMatch = match.match(new RegExp(`async ${operation}\\(([^)]+)\\): Promise<([^>]+)>`));
    const params = paramMatch?.[1] || 'id: number, data: any';
    const returnType = paramMatch?.[2] || 'any';
    
    return `async ${operation}(${params}): Promise<${returnType}> {
    await db.update(${tableName})
      .set({ ...${params.includes(',') ? params.split(',')[1].trim() : 'data'}, updatedAt: new Date() })
      .where(eq(${tableName}.id, id));
    // Get the updated record
    const [updated] = await db.select().from(${tableName}).where(eq(${tableName}.id, id));
    if (!updated) {
      throw new Error('Record not found for ${operation}');
    }
    return updated;`;
  });
});

// Write the fixed content back
fs.writeFileSync(storageFile, content);

console.log('✅ Fixed all CRUD operations in storage.ts');
