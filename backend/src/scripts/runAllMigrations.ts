import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/barrenground',
});

interface MigrationResult {
  name: string;
  success: boolean;
  error?: string;
  skipped?: boolean;
}

async function runSQLFile(filePath: string, migrationName: string): Promise<MigrationResult> {
  try {
    console.log(`\n🔄 Running migration: ${migrationName}`);
    console.log(`   File: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${filePath}`);
      return { name: migrationName, success: false, error: 'File not found' };
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.match(/^--/));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (err: any) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists')) {
          console.log(`   ℹ️  ${err.message.split('\n')[0]} (skipping)`);
        } else {
          throw err;
        }
      }
    }

    console.log(`   ✅ ${migrationName} completed successfully`);
    return { name: migrationName, success: true };
  } catch (error: any) {
    console.error(`   ❌ ${migrationName} failed:`, error.message);
    return { name: migrationName, success: false, error: error.message };
  }
}

async function runTypeScriptMigration(scriptPath: string, migrationName: string): Promise<MigrationResult> {
  try {
    console.log(`\n🔄 Running TypeScript migration: ${migrationName}`);
    console.log(`   Script: ${scriptPath}`);

    // Import and run the migration
    const migration = await import(scriptPath);
    if (typeof migration.default === 'function') {
      await migration.default();
    } else if (typeof migration.migrate === 'function') {
      await migration.migrate();
    }

    console.log(`   ✅ ${migrationName} completed successfully`);
    return { name: migrationName, success: true };
  } catch (error: any) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`   ℹ️  Already exists (skipping)`);
      return { name: migrationName, success: true, skipped: true };
    }
    console.error(`   ❌ ${migrationName} failed:`, error.message);
    return { name: migrationName, success: false, error: error.message };
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting All Database Migrations for Barren Ground Coffee');
  console.log('================================================================\n');

  const results: MigrationResult[] = [];
  const startTime = Date.now();

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const testResult = await pool.query('SELECT current_database(), current_user, version()');
    console.log(`   ✅ Connected to: ${testResult.rows[0].current_database}`);
    console.log(`   ✅ User: ${testResult.rows[0].current_user}`);
    console.log(`   ✅ PostgreSQL version: ${testResult.rows[0].version.split(',')[0]}\n`);

    // Migration 1: Promo & News Tables
    results.push(await runSQLFile(
      path.join(__dirname, '../config/schema-promos.sql'),
      'Promo & News Tables'
    ));

    // Migration 2: User Roles (Security)
    results.push(await runSQLFile(
      path.join(__dirname, './addUserRoles.sql'),
      'User Roles (Security)'
    ));

    // Migration 3: Loyalty Points
    results.push(await runSQLFile(
      path.join(__dirname, '../config/schema-loyalty.sql'),
      'Loyalty Points System'
    ));

    // Migration 4: Order Scheduling
    results.push(await runSQLFile(
      path.join(__dirname, '../config/schema-scheduling.sql'),
      'Order Scheduling System'
    ));

    // Migration 5: Email Logging
    // This one uses a TypeScript script, so we'll run the SQL directly
    const emailSql = `
      -- Email logs table
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        success BOOLEAN NOT NULL,
        error TEXT,
        sent_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at DESC);
      CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);

      -- Add email preferences to users table
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false;

      -- Add user_email to orders for easy access
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
    `;

    try {
      console.log(`\n🔄 Running migration: Email Logging System`);
      const statements = emailSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (err: any) {
          if (!err.message.includes('already exists')) {
            throw err;
          }
        }
      }
      console.log(`   ✅ Email Logging System completed successfully`);
      results.push({ name: 'Email Logging System', success: true });
    } catch (error: any) {
      console.error(`   ❌ Email Logging System failed:`, error.message);
      results.push({ name: 'Email Logging System', success: false, error: error.message });
    }

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n\n================================================================');
    console.log('📊 Migration Summary');
    console.log('================================================================\n');

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const skipped = results.filter(r => r.skipped).length;

    console.log(`Total migrations: ${results.length}`);
    console.log(`✅ Successful: ${successful}`);
    if (skipped > 0) console.log(`ℹ️  Skipped (already exists): ${skipped}`);
    if (failed > 0) console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${duration}s\n`);

    console.log('Migration Results:');
    results.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      const status = result.skipped ? '(skipped)' : result.success ? '(success)' : '(failed)';
      console.log(`  ${index + 1}. ${icon} ${result.name} ${status}`);
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });

    if (failed === 0) {
      console.log('\n🎉 All migrations completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Create an admin user:');
      console.log('      UPDATE users SET role = \'admin\' WHERE email = \'your-email@example.com\';');
      console.log('   2. Set a strong JWT_SECRET in .env (32+ characters)');
      console.log('   3. Restart the backend server: npm run dev');
      console.log('   4. Test the new features!\n');
    } else {
      console.log('\n⚠️  Some migrations failed. Please review the errors above.');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error during migrations:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runAllMigrations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
