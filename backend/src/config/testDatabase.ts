import { Pool } from 'pg';

/**
 * Test database configuration
 * Uses a separate test database to avoid polluting development data
 */
export const getTestPool = (): Pool => {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  return new Pool({
    connectionString: testDatabaseUrl,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
};

/**
 * Clean up test data after each test
 */
export const cleanupTestData = async (pool: Pool): Promise<void> => {
  await pool.query('DELETE FROM order_items');
  await pool.query('DELETE FROM orders');
  await pool.query('DELETE FROM user_memberships');
  await pool.query('DELETE FROM payment_methods');
  await pool.query('DELETE FROM users WHERE email LIKE \'%@test.com\'');
  await pool.query('DELETE FROM menu_items WHERE name LIKE \'Test %\'');
};

/**
 * Close all database connections
 */
export const closeTestDatabase = async (pool: Pool): Promise<void> => {
  await pool.end();
};
