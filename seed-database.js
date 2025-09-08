import dotenv from 'dotenv';
dotenv.config();

import { seedDatabase } from './server/seed.ts';

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    await seedDatabase();
    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
