require('dotenv').config();
const { Pool } = require('pg');

async function addIndexes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Adding database indexes for performance optimization...\n');

    const indexes = [
      // Orders table - high-traffic queries
      {
        name: 'idx_orders_shop_id_status',
        sql: 'CREATE INDEX IF NOT EXISTS idx_orders_shop_id_status ON orders(shop_id, status);',
        description: 'Orders by shop and status (kitchen queue, order tracking)'
      },
      {
        name: 'idx_orders_shop_id_created_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_orders_shop_id_created_at ON orders(shop_id, created_at DESC);',
        description: 'Recent orders by shop'
      },
      {
        name: 'idx_orders_user_id_created_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON orders(user_id, created_at DESC);',
        description: 'User order history'
      },

      // Order items table - join optimization
      {
        name: 'idx_order_items_menu_item_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);',
        description: 'Order items by menu item (for analytics)'
      },

      // Menu items table
      {
        name: 'idx_menu_items_shop_id_category',
        sql: 'CREATE INDEX IF NOT EXISTS idx_menu_items_shop_id_category ON menu_items(shop_id, category);',
        description: 'Menu items by shop and category'
      },
      {
        name: 'idx_menu_items_shop_id_available',
        sql: 'CREATE INDEX IF NOT EXISTS idx_menu_items_shop_id_available ON menu_items(shop_id, available);',
        description: 'Available menu items by shop'
      },

      // Users table
      {
        name: 'idx_users_email_shop_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_users_email_shop_id ON users(email, shop_id);',
        description: 'User lookup by email and shop'
      },
      {
        name: 'idx_users_role_shop_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_users_role_shop_id ON users(role, shop_id);',
        description: 'Employee lookup by role'
      },

      // User memberships table
      {
        name: 'idx_user_memberships_user_id_status',
        sql: 'CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id_status ON user_memberships(user_id, status);',
        description: 'Active memberships by user'
      },
      {
        name: 'idx_user_memberships_shop_id_status',
        sql: 'CREATE INDEX IF NOT EXISTS idx_user_memberships_shop_id_status ON user_memberships(shop_id, status);',
        description: 'Shop membership management'
      },

      // Loyalty transactions table
      {
        name: 'idx_loyalty_transactions_user_id_created',
        sql: 'CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id_created ON loyalty_transactions(user_id, created_at DESC);',
        description: 'User loyalty history'
      },

      // Carts table (for live cart tracking)
      {
        name: 'idx_carts_shop_id_updated_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_carts_shop_id_updated_at ON carts(shop_id, updated_at DESC);',
        description: 'Active carts by shop'
      },
      {
        name: 'idx_carts_user_id_shop_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_carts_user_id_shop_id ON carts(user_id, shop_id);',
        description: 'User cart lookup'
      },
    ];

    let successCount = 0;
    let skipCount = 0;

    for (const index of indexes) {
      try {
        await pool.query(index.sql);
        console.log(`✅ ${index.name}`);
        console.log(`   ${index.description}`);
        successCount++;
      } catch (error) {
        if (error.code === '42P07') {
          // Index already exists
          console.log(`⏭️  ${index.name} (already exists)`);
          skipCount++;
        } else {
          console.log(`❌ ${index.name}: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${successCount}`);
    console.log(`   Skipped: ${skipCount}`);
    console.log(`   Total: ${indexes.length}`);
    console.log(`\n✨ Database indexes optimized!`);

  } catch (error) {
    console.error('❌ Error adding indexes:', error.message);
  } finally {
    await pool.end();
  }
}

addIndexes();
