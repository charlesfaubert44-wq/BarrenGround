import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function migrateScheduling() {
  try {
    console.log('Starting scheduling system migration...');

    const schemaPath = path.join(__dirname, '..', 'config', 'schema-scheduling.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (error: any) {
        // Ignore already exists errors
        if (error.code === '42P07' || error.code === '42710' || error.message.includes('already exists')) {
          console.log('⚠️  Already exists, skipping:', statement.substring(0, 50) + '...');
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Scheduling system migration completed successfully!');
    console.log('\nNew features added:');
    console.log('- Orders can be scheduled up to 7 days in advance');
    console.log('- Business hours configuration with time slot management');
    console.log('- Automatic reminder notifications 15 minutes before pickup');
    console.log('- Slot capacity management (max 20 orders per 15-minute slot)');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateScheduling();
