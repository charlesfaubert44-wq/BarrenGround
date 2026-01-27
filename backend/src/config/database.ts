import { Pool } from 'pg';

// Determine pool size based on environment
// - Traditional deployment (Dokploy/Docker): Use larger pool
// - Serverless (Vercel): Use single connection
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
const poolSize = isServerless ? 1 : parseInt(process.env.DB_POOL_SIZE || '10', 10);

// SSL configuration:
// - DB_SSL=false: Disable SSL (for Docker internal networks)
// - DB_SSL=true or production default: Enable SSL with rejectUnauthorized: false
const sslEnabled = process.env.DB_SSL !== 'false' && process.env.NODE_ENV === 'production';
const sslConfig = sslEnabled ? { rejectUnauthorized: false } : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
  max: poolSize,
  idleTimeoutMillis: isServerless ? 10000 : 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('Database connected');
});

pool.on('error', (err: Error) => {
  console.error('Unexpected database error:', err);
  // Don't exit in serverless - let function restart naturally
});

export default pool;
