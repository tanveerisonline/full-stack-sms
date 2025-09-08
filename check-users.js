import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/db.ts';
import { users } from './shared/schemas/user.ts';
import { eq, or } from 'drizzle-orm';

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    const adminUsers = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, 'superadmin@edumanage.pro'),
          eq(users.email, 'admin@school.edu')
        )
      );

    console.log('Admin users found:');
    adminUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: "${user.role}", Active: ${user.isActive}, Approved: ${user.isApproved}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

checkUsers();
