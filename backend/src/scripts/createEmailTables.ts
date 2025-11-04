import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createEmailTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');

    // Create email_logs table
    console.log('📝 Creating email_logs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        success BOOLEAN NOT NULL,
        error TEXT,
        sent_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    console.log('📝 Creating indexes on email_logs...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at DESC);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
    `);

    // Add email preferences to users table
    console.log('📝 Adding email preferences to users table...');

    // Check if columns already exist before adding
    const checkColumns = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('email_notifications', 'marketing_emails');
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);

    if (!existingColumns.includes('email_notifications')) {
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN email_notifications BOOLEAN DEFAULT true;
      `);
      console.log('✅ Added email_notifications column to users table');
    } else {
      console.log('ℹ️  email_notifications column already exists');
    }

    if (!existingColumns.includes('marketing_emails')) {
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN marketing_emails BOOLEAN DEFAULT false;
      `);
      console.log('✅ Added marketing_emails column to users table');
    } else {
      console.log('ℹ️  marketing_emails column already exists');
    }

    // Check if user_email column exists in orders table
    const checkOrdersColumns = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders'
      AND column_name = 'user_email';
    `);

    if (checkOrdersColumns.rows.length === 0) {
      await pool.query(`
        ALTER TABLE orders
        ADD COLUMN user_email VARCHAR(255);
      `);
      console.log('✅ Added user_email column to orders table');

      // Populate user_email from users table for existing orders
      await pool.query(`
        UPDATE orders o
        SET user_email = u.email
        FROM users u
        WHERE o.user_id = u.id AND o.user_email IS NULL;
      `);
      console.log('✅ Populated user_email for existing orders');
    } else {
      console.log('ℹ️  user_email column already exists in orders table');
    }

    console.log('✅ Email tables and preferences setup complete!');

  } catch (error) {
    console.error('❌ Error setting up email tables:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  } finally {
    await pool.end();
  }
}

createEmailTables();
