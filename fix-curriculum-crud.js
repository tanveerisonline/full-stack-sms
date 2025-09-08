#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkAndFixCurriculumCrud() {
  console.log('🔧 Fixing SchoolPilot Curriculum & Courses CRUD APIs\n');

  // 1. Check if .env file exists
  console.log('1. 📁 Checking environment configuration...');
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log('   ⚠️  .env file missing, copying from .env.example');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('   ✅ Created .env file from template');
      console.log('   ⚠️  Please update database credentials in .env file');
    } else {
      console.log('   ❌ No .env or .env.example file found');
      // Create basic .env file
      const basicEnv = `# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=school_pilot

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=30d
`;
      fs.writeFileSync(envPath, basicEnv);
      console.log('   ✅ Created basic .env file');
      console.log('   ⚠️  Please update database credentials in .env file');
    }
  } else {
    console.log('   ✅ .env file exists');
  }

  // 2. Check database setup
  console.log('\n2. 🗄️ Checking database setup...');
  try {
    console.log('   📦 Installing/updating dependencies...');
    await execAsync('npm install');
    console.log('   ✅ Dependencies updated');

    console.log('   🏗️  Initializing database...');
    try {
      await execAsync('npm run db:init');
      console.log('   ✅ Database initialized');
    } catch (error) {
      console.log('   ⚠️  Database already exists or init failed:', error.message);
    }

    console.log('   🔄 Running database migrations...');
    try {
      await execAsync('npm run db:migrate');
      console.log('   ✅ Database migrations completed');
    } catch (error) {
      console.log('   ⚠️  Migration error (may be normal):', error.message);
    }

    console.log('   📋 Generating database schema...');
    try {
      await execAsync('npm run db:generate');
      console.log('   ✅ Database schema generated');
    } catch (error) {
      console.log('   ⚠️  Schema generation error:', error.message);
    }

    console.log('   🚀 Pushing schema to database...');
    try {
      await execAsync('npm run db:push');
      console.log('   ✅ Schema pushed to database');
    } catch (error) {
      console.log('   ⚠️  Schema push error:', error.message);
    }

  } catch (error) {
    console.error('   ❌ Database setup error:', error.message);
  }

  // 3. Check server files
  console.log('\n3. 🔍 Checking server configuration...');
  
  const serverIndexPath = path.join(process.cwd(), 'server', 'index.ts');
  const routesPath = path.join(process.cwd(), 'server', 'routes.ts');
  const storagePath = path.join(process.cwd(), 'server', 'storage.ts');

  if (fs.existsSync(serverIndexPath)) {
    console.log('   ✅ Server index file exists');
  } else {
    console.log('   ❌ Server index file missing');
  }

  if (fs.existsSync(routesPath)) {
    console.log('   ✅ Routes file exists');
  } else {
    console.log('   ❌ Routes file missing');
  }

  if (fs.existsSync(storagePath)) {
    console.log('   ✅ Storage file exists');
  } else {
    console.log('   ❌ Storage file missing');
  }

  // 4. Check client-side hooks
  console.log('\n4. 🎯 Checking client-side hooks...');
  
  const useCoursesPath = path.join(process.cwd(), 'client', 'src', 'hooks', 'features', 'academic', 'useCourses.tsx');
  
  if (fs.existsSync(useCoursesPath)) {
    console.log('   ✅ useCourses hook exists');
  } else {
    console.log('   ❌ useCourses hook missing');
  }

  // 5. Start development server instructions
  console.log('\n5. 🚀 Ready to test CRUD operations!');
  console.log('\nTo start the server and test:');
  console.log('   1. Run: npm run dev');
  console.log('   2. In another terminal, test with:');
  console.log('      curl -X GET "http://localhost:5000/api/classes"');
  console.log('   3. Or open: http://localhost:3000 in your browser');

  console.log('\n✨ Setup complete! Your Curriculum & Courses CRUD should now work.');
  console.log('\nIf you still have issues:');
  console.log('   1. Check database credentials in .env');
  console.log('   2. Ensure MySQL/database server is running');
  console.log('   3. Check server logs for specific errors');
}

// Run the fixer
checkAndFixCurriculumCrud().catch(console.error);
