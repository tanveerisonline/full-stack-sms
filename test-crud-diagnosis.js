const { createConnection } = require('mysql2/promise');
const fetch = require('node-fetch');

// Database configuration (adjust as needed)
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_password', // Update with actual password
  database: 'schoolpilot_db', // Update with actual database name
  port: 3306
};

// Test database connectivity
async function testDatabaseConnection() {
  try {
    const connection = await createConnection(DB_CONFIG);
    console.log('✅ Database connection successful');
    
    // Check if classes table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'classes'");
    if (tables.length > 0) {
      console.log('✅ Classes table exists');
      
      // Check table structure
      const [columns] = await connection.execute("DESCRIBE classes");
      console.log('📋 Classes table structure:', columns.map(col => `${col.Field}: ${col.Type}`));
      
      // Check if there are any records
      const [records] = await connection.execute("SELECT COUNT(*) as count FROM classes");
      console.log('📊 Number of classes in database:', records[0].count);
    } else {
      console.log('❌ Classes table does not exist');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Test API endpoints (assuming server is running on port 5000)
async function testApiEndpoints() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('\n=== Testing API Endpoints ===');
  
  // Test GET /api/classes
  try {
    const response = await fetch(`${baseUrl}/api/classes`);
    console.log(`GET /api/classes - Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Classes retrieved: ${data.length} records`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Error response: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ GET /api/classes failed:', error.message);
  }
  
  // Test POST /api/classes (create)
  try {
    const newClass = {
      name: 'Test Math Class',
      grade: '10',
      section: 'A',
      subject: 'Mathematics',
      teacherId: null,
      room: '101',
      schedule: 'Mon-Wed-Fri 10:00-11:00',
      maxStudents: 30,
      status: 'active'
    };
    
    const response = await fetch(`${baseUrl}/api/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass)
    });
    
    console.log(`POST /api/classes - Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Class created successfully:', data);
      
      // Test PUT /api/classes/:id (update)
      const updatedClass = { ...newClass, name: 'Updated Math Class' };
      const updateResponse = await fetch(`${baseUrl}/api/classes/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClass)
      });
      
      console.log(`PUT /api/classes/${data.id} - Status: ${updateResponse.status}`);
      if (updateResponse.ok) {
        console.log('✅ Class updated successfully');
      } else {
        const errorText = await updateResponse.text();
        console.log(`❌ Update error: ${errorText}`);
      }
      
      // Test DELETE /api/classes/:id
      const deleteResponse = await fetch(`${baseUrl}/api/classes/${data.id}`, {
        method: 'DELETE'
      });
      
      console.log(`DELETE /api/classes/${data.id} - Status: ${deleteResponse.status}`);
      if (deleteResponse.status === 204) {
        console.log('✅ Class deleted successfully');
      } else {
        const errorText = await deleteResponse.text();
        console.log(`❌ Delete error: ${errorText}`);
      }
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Create error: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ POST /api/classes failed:', error.message);
  }
}

// Main function
async function main() {
  console.log('🔍 SchoolPilot CRUD Diagnosis\n');
  
  // Test database first
  await testDatabaseConnection();
  
  // Test API endpoints
  await testApiEndpoints();
  
  console.log('\n✨ Diagnosis complete!');
}

main().catch(console.error);
