require('dotenv').config();
const { Pool } = require('pg');

async function checkShops() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Checking shops table...');

    // Check if shops table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'shops'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  Shops table does not exist');
      return;
    }

    // Check for shops
    const shops = await pool.query('SELECT * FROM shops');
    console.log(`\n📊 Total shops: ${shops.rows.length}`);

    if (shops.rows.length > 0) {
      console.log('\n📋 Shops:');
      shops.rows.forEach(shop => {
        console.log(`  - ${shop.id}: ${shop.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkShops();
