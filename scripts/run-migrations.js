import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: '.env' });

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  // Create a connection to the database
  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'school_pilot',
    multipleStatements: true,
  });

  try {
    const db = drizzle(connection);
    
    console.log('Running migrations...');
    
    // Run migrations
    await migrate(db, { 
      migrationsFolder: path.join(__dirname, '../drizzle/mysql-migrations') 
    });
    
    console.log('Migrations completed successfully');
    
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the migrations
runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  });
