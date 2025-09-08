import { insertTeacherSchema } from './shared/schemas/teacher.js';

const testData = {
  firstName: "Tanveer",
  lastName: "Ahmad", 
  email: "tanveer16161@gmail.com",
  phone: "9796161668",
  employeeId: "T001",
  department: "Administration",
  subject: "Mathematics",
  qualification: "b tech",
  experience: 3,
  salary: "50000.00",
  hireDate: "2025-09-01",
  dateOfBirth: "2004-01-08",
  address: "Srinagar greftrtr ",
  avatar: "",
  status: "active"
};

try {
  console.log('Testing teacher data validation...');
  const result = insertTeacherSchema.parse(testData);
  console.log('✅ Validation passed:', result);
} catch (error) {
  console.error('❌ Validation failed:', error.errors || error.message);
}
