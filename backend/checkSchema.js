require('dotenv').config();
const { Pool } = require('pg');

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Checking database schema...');

    // Check users table columns
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Users table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    // Check if any users exist
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Total users: ${userCount.rows[0].count}`);

    // Show sample user (without password)
    const sampleUser = await pool.query('SELECT id, email, name, role FROM users LIMIT 1');
    if (sampleUser.rows.length > 0) {
      console.log('\n📋 Sample user:');
      console.log(sampleUser.rows[0]);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
