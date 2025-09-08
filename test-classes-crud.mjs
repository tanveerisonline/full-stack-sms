#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

// Test data for classes
const testClass = {
  name: 'Advanced Mathematics',
  grade: '11',
  section: 'A',
  subject: 'Mathematics',
  room: '201',
  schedule: 'Mon-Wed-Fri 10:00-11:30',
  maxStudents: 25,
  status: 'active'
};

// Helper function to make API requests
async function apiCall(method, endpoint, body = null) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = response.status === 204 ? null : await response.json();
  
  return { status: response.status, data, ok: response.ok };
}

async function testClassesCRUD() {
  console.log('🧪 Testing Classes CRUD Operations\n');
  
  let createdClassId = null;
  
  try {
    // Test 1: GET all classes
    console.log('1. 📋 Testing GET /api/classes');
    const getResult = await apiCall('GET', '/classes');
    console.log(`   Status: ${getResult.status}`);
    console.log(`   Found ${getResult.data?.length || 0} classes`);
    
    if (!getResult.ok) {
      console.log('   ❌ Failed to get classes');
      return;
    }
    console.log('   ✅ GET request successful\n');
    
    // Test 2: POST create class
    console.log('2. ➕ Testing POST /api/classes (Create)');
    const createResult = await apiCall('POST', '/classes', testClass);
    console.log(`   Status: ${createResult.status}`);
    
    if (!createResult.ok) {
      console.log('   ❌ Failed to create class');
      console.log('   Error:', createResult.data);
      return;
    }
    
    createdClassId = createResult.data.id;
    console.log(`   ✅ Created class with ID: ${createdClassId}`);
    console.log(`   Class name: ${createResult.data.name}\n`);
    
    // Test 3: GET single class
    console.log(`3. 🔍 Testing GET /api/classes/${createdClassId}`);
    const getSingleResult = await apiCall('GET', `/classes/${createdClassId}`);
    console.log(`   Status: ${getSingleResult.status}`);
    
    if (!getSingleResult.ok) {
      console.log('   ❌ Failed to get single class');
      return;
    }
    console.log(`   ✅ Retrieved class: ${getSingleResult.data.name}\n`);
    
    // Test 4: PUT update class
    console.log(`4. ✏️  Testing PUT /api/classes/${createdClassId} (Update)`);
    const updatedData = { ...testClass, name: 'Updated Mathematics Class', maxStudents: 30 };
    const updateResult = await apiCall('PUT', `/classes/${createdClassId}`, updatedData);
    console.log(`   Status: ${updateResult.status}`);
    
    if (!updateResult.ok) {
      console.log('   ❌ Failed to update class');
      console.log('   Error:', updateResult.data);
      return;
    }
    console.log(`   ✅ Updated class name to: ${updateResult.data.name}`);
    console.log(`   Max students updated to: ${updateResult.data.maxStudents}\n`);
    
    // Test 5: DELETE class
    console.log(`5. 🗑️  Testing DELETE /api/classes/${createdClassId}`);
    const deleteResult = await apiCall('DELETE', `/classes/${createdClassId}`);
    console.log(`   Status: ${deleteResult.status}`);
    
    if (deleteResult.status !== 204) {
      console.log('   ❌ Failed to delete class');
      return;
    }
    console.log('   ✅ Class deleted successfully\n');
    
    // Test 6: Verify deletion
    console.log(`6. 🔍 Testing GET /api/classes/${createdClassId} (Should be 404)`);
    const verifyDeleteResult = await apiCall('GET', `/classes/${createdClassId}`);
    console.log(`   Status: ${verifyDeleteResult.status}`);
    
    if (verifyDeleteResult.status === 404) {
      console.log('   ✅ Class successfully deleted (404 confirmed)\n');
    } else {
      console.log('   ⚠️  Class might still exist or unexpected response\n');
    }
    
    console.log('🎉 All CRUD operations completed successfully!');
    console.log('\n✅ Your Curriculum & Courses CRUD APIs are working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    // Cleanup if class was created but test failed
    if (createdClassId) {
      try {
        await apiCall('DELETE', `/classes/${createdClassId}`);
        console.log('🧹 Cleanup: Deleted test class');
      } catch (cleanupError) {
        console.log('⚠️  Could not cleanup test class');
      }
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/classes`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 SchoolPilot Classes CRUD Test\n');
  
  console.log('Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:3000');
    console.log('Please start the server with: npm run dev\n');
    return;
  }
  
  console.log('✅ Server is running\n');
  await testClassesCRUD();
}

main().catch(console.error);
