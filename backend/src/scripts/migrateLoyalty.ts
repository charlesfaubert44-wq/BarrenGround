import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function migrateLoyalty() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');

    // Read the loyalty schema file
    const schemaPath = join(__dirname, '..', 'config', 'schema-loyalty.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    console.log('📝 Running loyalty system migration...');

    // Execute the schema
    await pool.query(schema);

    console.log('✅ Loyalty system migration complete!');
    console.log('📊 Loyalty transactions table and user columns added successfully.');

  } catch (error) {
    console.error('❌ Error migrating loyalty system:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  } finally {
    await pool.end();
  }
}

migrateLoyalty();
