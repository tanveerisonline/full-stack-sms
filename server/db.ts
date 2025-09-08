import { config } from 'dotenv';
import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  timezone: '+00:00', // Use UTC
  supportBigNumbers: true,
  bigNumberStrings: false,
  multipleStatements: true,
  dateStrings: true,
  charset: 'utf8mb4_unicode_ci',
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

// Create the connection pool
const connection = createPool(dbConfig);

// Test the connection
async function testConnection() {
  let conn;
  try {
    conn = await connection.getConnection();
    console.log('✅ Successfully connected to MySQL database');
    await conn.ping();
    console.log('✅ Database ping successful');
  } catch (error) {
    console.error('❌ Error connecting to MySQL database:', error);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

// Initialize database connection
testConnection().catch(console.error);

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await connection.end();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
});

// Create the Drizzle ORM instance
export const db = drizzle(connection, { 
  schema, 
  mode: 'default',
  logger: process.env.NODE_ENV === 'development'
});

export default connection;