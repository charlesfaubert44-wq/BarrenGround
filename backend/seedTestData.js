require('dotenv').config();
const { Pool } = require('pg');

const menuData = [
  // Hot Coffee
  { name: 'Espresso', description: 'Rich and bold double shot of premium espresso', price: 3.50, category: 'coffee', available: true },
  { name: 'Cappuccino', description: 'Classic espresso with velvety steamed milk and foam', price: 4.50, category: 'coffee', available: true },
  { name: 'Latte', description: 'Smooth espresso with perfectly steamed milk', price: 4.75, category: 'coffee', available: true },
  { name: 'Americano', description: 'Bold espresso diluted with hot water', price: 3.75, category: 'coffee', available: true },
  { name: 'Mocha', description: 'Rich chocolate and espresso with steamed milk', price: 5.25, category: 'coffee', available: true },

  // Drip Coffee
  { name: 'House Drip Coffee', description: 'Our signature medium roast, smooth and balanced', price: 2.50, category: 'drip-coffee', available: true },
  { name: 'Dark Roast', description: 'Bold and robust dark roast for the adventurous', price: 2.75, category: 'drip-coffee', available: true },

  // Cold Drinks
  { name: 'Iced Latte', description: 'Espresso and cold milk over ice', price: 5.25, category: 'cold-drinks', available: true },
  { name: 'Cold Brew', description: 'Smooth, naturally sweet cold-steeped coffee', price: 4.75, category: 'cold-drinks', available: true },

  // Specialty Drinks
  { name: 'Chai Latte', description: 'Spiced tea with steamed milk and honey', price: 4.75, category: 'specialty', available: true },
  { name: 'Matcha Latte', description: 'Premium Japanese green tea with steamed milk', price: 5.50, category: 'specialty', available: true },
  { name: 'Hot Chocolate', description: 'Rich Belgian chocolate with steamed milk', price: 4.25, category: 'specialty', available: true },

  // Pastries
  { name: 'Butter Croissant', description: 'Buttery, flaky French pastry baked fresh daily', price: 3.50, category: 'pastries', available: true },
  { name: 'Chocolate Croissant', description: 'Flaky croissant filled with rich dark chocolate', price: 4.25, category: 'pastries', available: true },
  { name: 'Blueberry Muffin', description: 'Fresh blueberries in a moist vanilla muffin', price: 3.75, category: 'pastries', available: true },
];

async function seedDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to database...');

    // First, check if the menu_items table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'menu_items'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('📝 Creating menu_items table...');
      await pool.query(`
        CREATE TABLE menu_items (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          available BOOLEAN DEFAULT true,
          image_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Table created successfully');
    } else {
      console.log('✅ Table already exists');
    }

    // Clear existing menu items
    console.log('🗑️  Clearing existing menu items...');
    await pool.query('DELETE FROM menu_items');

    // Insert test data
    console.log('📝 Inserting test menu items...');
    for (const item of menuData) {
      await pool.query(
        'INSERT INTO menu_items (name, description, price, category, available) VALUES ($1, $2, $3, $4, $5)',
        [item.name, item.description, item.price, item.category, item.available]
      );
    }

    console.log(`✅ Successfully seeded ${menuData.length} menu items!`);

    // Verify
    const result = await pool.query('SELECT COUNT(*) FROM menu_items');
    console.log(`📊 Total items in database: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Details:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
