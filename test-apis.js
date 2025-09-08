import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let superAdminToken = '';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
      },
      ...options
    };

    console.log(`\n🔍 Testing: ${config.method} ${endpoint}`);
    const response = await fetch(url, config);
    const data = await response.text();
    
    let jsonData = null;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    if (response.ok) {
      console.log(`✅ ${response.status}: Success`);
      return { success: true, status: response.status, data: jsonData };
    } else {
      console.log(`❌ ${response.status}: ${response.statusText}`);
      console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
      return { success: false, status: response.status, data: jsonData, error: response.statusText };
    }
  } catch (error) {
    console.log(`💥 Network/Connection Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test Authentication APIs
async function testAuthAPIs() {
  console.log('\n🔐 TESTING AUTHENTICATION APIs');
  console.log('=' .repeat(50));

  // Test user registration
  const registerResult = await apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    })
  });

  // Test super admin login
  const superAdminLogin = await apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'superadmin@edumanage.pro',
      password: 'superadmin123'
    })
  });

  if (superAdminLogin.success) {
    superAdminToken = superAdminLogin.data.token;
    authToken = superAdminLogin.data.token; // Set for subsequent tests
    console.log('🎯 Super admin token acquired');
  }

  // Test admin login
  const adminLogin = await apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'admin@school.edu',
      password: 'password'
    })
  });

  // Test invalid login
  const invalidLogin = await apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'invalid@example.com',
      password: 'wrongpassword'
    })
  });

  return {
    register: registerResult.success,
    superAdminLogin: superAdminLogin.success,
    adminLogin: adminLogin.success,
    invalidLogin: !invalidLogin.success // Should fail
  };
}

// Test Super Admin APIs
async function testSuperAdminAPIs() {
  console.log('\n👑 TESTING SUPER ADMIN APIs');
  console.log('=' .repeat(50));

  if (!superAdminToken) {
    console.log('❌ No super admin token available, skipping super admin tests');
    return {};
  }

  const results = {};

  // Test dashboard stats
  results.dashboardStats = await apiCall('/api/super-admin/dashboard/stats', {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });

  // Test dashboard activities
  results.dashboardActivities = await apiCall('/api/super-admin/dashboard/activities', {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });

  // Test security alerts
  results.securityAlerts = await apiCall('/api/super-admin/dashboard/security', {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });

  // Test user management
  results.getUsers = await apiCall('/api/super-admin/users', {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });

  // Test roles
  results.getRoles = await apiCall('/api/super-admin/roles', {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });

  // Test system settings
  results.getSettings = await apiCall('/api/super-admin/settings', {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });

  // Test audit logs
  results.getAuditLogs = await apiCall('/api/super-admin/audit-logs', {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });

  // Test backup functionality
  results.createBackup = await apiCall('/api/super-admin/security/backup', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });

  // Test active sessions
  results.getSessions = await apiCall('/api/super-admin/security/sessions', {
    headers: { 'Authorization': `Bearer ${superAdminToken}` }
  });

  return results;
}

// Test Core Application APIs
async function testCoreAPIs() {
  console.log('\n🏫 TESTING CORE APPLICATION APIs');
  console.log('=' .repeat(50));

  const results = {};

  // Test students API
  results.getStudents = await apiCall('/api/students');
  
  // Test teachers API
  results.getTeachers = await apiCall('/api/teachers');
  results.getTeacherStats = await apiCall('/api/teachers/stats');

  return results;
}

// Test Development APIs
async function testDevAPIs() {
  console.log('\n🛠️  TESTING DEVELOPMENT APIs');
  console.log('=' .repeat(50));

  const results = {};

  // Test create super admin
  results.createSuperAdmin = await apiCall('/api/dev/create-super-admin', {
    method: 'POST'
  });

  // Test database seeding
  results.seedDatabase = await apiCall('/api/dev/seed', {
    method: 'POST'
  });

  return results;
}

// Test File Upload APIs
async function testFileAPIs() {
  console.log('\n📁 TESTING FILE UPLOAD APIs');
  console.log('=' .repeat(50));

  const results = {};

  // Test photo upload URL generation
  results.getUploadURL = await apiCall('/api/photos/upload', {
    method: 'POST'
  });

  return results;
}

// Main testing function
async function runAllTests() {
  console.log('🚀 Starting comprehensive API testing...');
  console.log(`Testing against: ${BASE_URL}`);
  
  const allResults = {};

  try {
    // Test APIs in sequence
    allResults.auth = await testAuthAPIs();
    allResults.superAdmin = await testSuperAdminAPIs();
    allResults.core = await testCoreAPIs();
    allResults.dev = await testDevAPIs();
    allResults.files = await testFileAPIs();

    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('=' .repeat(50));
    
    let totalTests = 0;
    let passedTests = 0;
    
    function countResults(obj, prefix = '') {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'success' in value) {
          totalTests++;
          if (value.success) passedTests++;
          console.log(`${value.success ? '✅' : '❌'} ${prefix}${key}: ${value.success ? 'PASS' : 'FAIL'}`);
        } else if (typeof value === 'boolean') {
          totalTests++;
          if (value) passedTests++;
          console.log(`${value ? '✅' : '❌'} ${prefix}${key}: ${value ? 'PASS' : 'FAIL'}`);
        } else if (typeof value === 'object' && value !== null) {
          countResults(value, `${prefix}${key}.`);
        }
      });
    }
    
    countResults(allResults);
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check the output above for details.');
    }

  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
  }
}

// Check if server is running first
async function checkServerHealth() {
  console.log('🔍 Checking server health...');
  try {
    const response = await fetch(`${BASE_URL}/api/students`);
    if (response.status === 200 || response.status === 401) { // 401 is ok, means server is running
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('   Please start the server with: npm run dev');
    return false;
  }
  return false;
}

// Run the tests
(async () => {
  const serverRunning = await checkServerHealth();
  if (serverRunning) {
    await runAllTests();
  }
})();
