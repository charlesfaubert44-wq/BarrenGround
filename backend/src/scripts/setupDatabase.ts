import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');

    // Read the schema file
    const schemaPath = join(__dirname, '..', 'config', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    console.log('📝 Running schema SQL...');

    // Execute the schema
    await pool.query(schema);

    console.log('✅ Database setup complete!');
    console.log('📊 Menu items, membership plans, and tables created successfully.');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  } finally {
    await pool.end();
  }
}

setupDatabase();
