require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function createEmployee() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to database...');

    // Employee credentials
    const email = 'admin@barrenground.com';
    const password = 'admin123';
    const name = 'Admin User';
    const role = 'admin';
    const shop_id = 'barrenground';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('📝 Creating users table...');
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'customer',
          phone VARCHAR(20),
          loyalty_points INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Users table created');
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Employee user already exists');
      console.log('📧 Email:', email);
      console.log('🔑 Password: admin123');
      return;
    }

    // Insert employee user
    await pool.query(
      'INSERT INTO users (email, password_hash, name, role, shop_id) VALUES ($1, $2, $3, $4, $5)',
      [email, hashedPassword, name, role, shop_id]
    );

    console.log('✅ Employee user created successfully!');
    console.log('');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', role);
    console.log('');
    console.log('You can now login to the employee dashboard at:');
    console.log('https://employee-dashboard-flame-pi.vercel.app');

  } catch (error) {
    console.error('❌ Error creating employee:', error.message);
    console.error('Details:', error);
  } finally {
    await pool.end();
  }
}

createEmployee();
