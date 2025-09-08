import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

async function dropDatabase() {
  // Connect to MySQL server without specifying a database
  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    multipleStatements: true,
  });

  try {
    console.log('Connected to MySQL server');
    
    // Drop database if it exists
    await connection.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database '${process.env.DB_NAME}' dropped successfully`);
  } catch (error) {
    console.error('❌ Error dropping database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
dropDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to drop database:', error);
    process.exit(1);
  });
