import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  // Parse the DATABASE_URL to get connection details
  const dbUrl = process.env.DATABASE_URL || '';
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

  if (!match) {
    console.error('❌ Invalid DATABASE_URL format');
    console.log('Expected format: postgresql://user:password@host:port/database');
    process.exit(1);
  }

  const [, user, password, host, port, database] = match;

  // Connect to postgres database (default database) to create our database
  const client = new Client({
    user,
    password,
    host,
    port: parseInt(port),
    database: 'postgres', // Connect to default postgres database
  });

  try {
    console.log('🔄 Connecting to PostgreSQL server...');
    await client.connect();

    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [database]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Database "${database}" already exists!`);
    } else {
      console.log(`📝 Creating database "${database}"...`);
      await client.query(`CREATE DATABASE ${database}`);
      console.log(`✅ Database "${database}" created successfully!`);
    }

  } catch (error) {
    console.error('❌ Error creating database:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
