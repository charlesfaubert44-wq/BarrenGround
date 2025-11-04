import { Client } from 'pg';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function testConnection() {
  console.log('🔐 PostgreSQL Connection Test\n');

  const password = await question('Enter your PostgreSQL password for user "postgres": ');

  const client = new Client({
    user: 'postgres',
    password: password,
    host: 'localhost',
    port: 5483,
    database: 'postgres',
  });

  try {
    console.log('\n🔄 Testing connection...');
    await client.connect();
    console.log('✅ Connection successful!\n');

    // Test query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result.rows[0].version);

    // List databases
    const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log('\n📁 Available databases:');
    dbResult.rows.forEach(row => console.log('  -', row.datname));

    console.log('\n✅ Everything looks good!');
    console.log('\n📝 Update your backend/.env file with this connection string:');
    console.log(`DATABASE_URL=postgresql://postgres:${password}@localhost:5483/barrenground`);

  } catch (error) {
    console.error('\n❌ Connection failed!');
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure you entered the correct password');
    console.log('2. The password was set when you installed PostgreSQL');
    console.log('3. If you forgot it, see instructions to reset it below\n');
  } finally {
    await client.end();
    rl.close();
  }
}

testConnection();
