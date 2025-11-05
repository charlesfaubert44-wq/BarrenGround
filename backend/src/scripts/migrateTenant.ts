/**
 * Multi-Tenancy Migration Script
 *
 * This script helps migrate existing single-tenant data to multi-tenant structure
 *
 * Usage:
 *   npx ts-node src/scripts/migrateTenant.ts
 */

import pool from '../config/database';
import { v4 as uuidv4 } from 'crypto';

interface MigrationStats {
  usersUpdated: number;
  ordersUpdated: number;
  menuItemsUpdated: number;
  membershipsUpdated: number;
  loyaltyPointsUpdated: number;
  paymentMethodsUpdated: number;
  scheduledOrdersUpdated: number;
}

async function runMigration() {
  console.log('🚀 Starting Multi-Tenancy Migration...\n');

  const DEFAULT_SHOP_ID = 'barrenground';
  const stats: MigrationStats = {
    usersUpdated: 0,
    ordersUpdated: 0,
    menuItemsUpdated: 0,
    membershipsUpdated: 0,
    loyaltyPointsUpdated: 0,
    paymentMethodsUpdated: 0,
    scheduledOrdersUpdated: 0,
  };

  try {
    // Step 1: Check if shops table exists
    console.log('Step 1: Checking shops table...');
    const shopsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'shops'
      );
    `);

    if (!shopsTableCheck.rows[0].exists) {
      console.error('❌ Shops table does not exist!');
      console.log('Please create shops table first using schema-shops.sql');
      process.exit(1);
    }
    console.log('✅ Shops table exists\n');

    // Step 2: Check if default shop exists
    console.log(`Step 2: Checking for default shop (${DEFAULT_SHOP_ID})...`);
    const defaultShop = await pool.query(
      'SELECT id FROM shops WHERE id = $1',
      [DEFAULT_SHOP_ID]
    );

    if (defaultShop.rows.length === 0) {
      console.log(`⚠️  Default shop not found. Creating ${DEFAULT_SHOP_ID}...`);
      await pool.query(`
        INSERT INTO shops (
          id, name, display_name, email, features, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
      `, [
        DEFAULT_SHOP_ID,
        DEFAULT_SHOP_ID,
        'Barren Ground Coffee',
        'hello@barrengroundcoffee.com',
        JSON.stringify({
          membership: true,
          loyalty: true,
          scheduling: true,
          delivery: false,
          catering: true
        }),
        'active'
      ]);
      console.log('✅ Default shop created\n');
    } else {
      console.log('✅ Default shop exists\n');
    }

    // Step 3: Migrate users
    console.log('Step 3: Migrating users...');
    const usersResult = await pool.query(`
      UPDATE users
      SET shop_id = $1
      WHERE shop_id IS NULL
      RETURNING id
    `, [DEFAULT_SHOP_ID]);
    stats.usersUpdated = usersResult.rowCount || 0;
    console.log(`✅ Updated ${stats.usersUpdated} users\n`);

    // Step 4: Migrate orders
    console.log('Step 4: Migrating orders...');
    const ordersResult = await pool.query(`
      UPDATE orders
      SET shop_id = $1
      WHERE shop_id IS NULL
      RETURNING id
    `, [DEFAULT_SHOP_ID]);
    stats.ordersUpdated = ordersResult.rowCount || 0;
    console.log(`✅ Updated ${stats.ordersUpdated} orders\n`);

    // Step 5: Migrate menu items
    console.log('Step 5: Migrating menu items...');
    const menuItemsResult = await pool.query(`
      UPDATE menu_items
      SET shop_id = $1
      WHERE shop_id IS NULL
      RETURNING id
    `, [DEFAULT_SHOP_ID]);
    stats.menuItemsUpdated = menuItemsResult.rowCount || 0;
    console.log(`✅ Updated ${stats.menuItemsUpdated} menu items\n`);

    // Step 6: Migrate memberships (if table exists)
    console.log('Step 6: Migrating memberships...');
    try {
      const membershipsResult = await pool.query(`
        UPDATE memberships
        SET shop_id = $1
        WHERE shop_id IS NULL
        RETURNING id
      `, [DEFAULT_SHOP_ID]);
      stats.membershipsUpdated = membershipsResult.rowCount || 0;
      console.log(`✅ Updated ${stats.membershipsUpdated} memberships\n`);
    } catch (error: any) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log('⚠️  Memberships table not found (skipping)\n');
      } else {
        throw error;
      }
    }

    // Step 7: Migrate loyalty points (if table exists)
    console.log('Step 7: Migrating loyalty points...');
    try {
      const loyaltyResult = await pool.query(`
        UPDATE loyalty_points
        SET shop_id = $1
        WHERE shop_id IS NULL
        RETURNING id
      `, [DEFAULT_SHOP_ID]);
      stats.loyaltyPointsUpdated = loyaltyResult.rowCount || 0;
      console.log(`✅ Updated ${stats.loyaltyPointsUpdated} loyalty point records\n`);
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('⚠️  Loyalty points table not found (skipping)\n');
      } else {
        throw error;
      }
    }

    // Step 8: Migrate payment methods (if table exists)
    console.log('Step 8: Migrating payment methods...');
    try {
      const paymentMethodsResult = await pool.query(`
        UPDATE payment_methods
        SET shop_id = $1
        WHERE shop_id IS NULL
        RETURNING id
      `, [DEFAULT_SHOP_ID]);
      stats.paymentMethodsUpdated = paymentMethodsResult.rowCount || 0;
      console.log(`✅ Updated ${stats.paymentMethodsUpdated} payment methods\n`);
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('⚠️  Payment methods table not found (skipping)\n');
      } else {
        throw error;
      }
    }

    // Step 9: Migrate scheduled orders (if table exists)
    console.log('Step 9: Migrating scheduled orders...');
    try {
      const scheduledOrdersResult = await pool.query(`
        UPDATE scheduled_orders
        SET shop_id = $1
        WHERE shop_id IS NULL
        RETURNING id
      `, [DEFAULT_SHOP_ID]);
      stats.scheduledOrdersUpdated = scheduledOrdersResult.rowCount || 0;
      console.log(`✅ Updated ${stats.scheduledOrdersUpdated} scheduled orders\n`);
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('⚠️  Scheduled orders table not found (skipping)\n');
      } else {
        throw error;
      }
    }

    // Step 10: Verify migration
    console.log('Step 10: Verifying migration...');
    const verification = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE shop_id IS NULL) as users_null,
        (SELECT COUNT(*) FROM orders WHERE shop_id IS NULL) as orders_null,
        (SELECT COUNT(*) FROM menu_items WHERE shop_id IS NULL) as menu_items_null
    `);

    const nullCounts = verification.rows[0];
    if (nullCounts.users_null > 0 || nullCounts.orders_null > 0 || nullCounts.menu_items_null > 0) {
      console.log('⚠️  Warning: Some records still have NULL shop_id:');
      console.log(`   - Users: ${nullCounts.users_null}`);
      console.log(`   - Orders: ${nullCounts.orders_null}`);
      console.log(`   - Menu Items: ${nullCounts.menu_items_null}`);
    } else {
      console.log('✅ All records have shop_id assigned\n');
    }

    // Print summary
    console.log('📊 Migration Summary:');
    console.log('=' .repeat(50));
    console.log(`Users migrated:           ${stats.usersUpdated}`);
    console.log(`Orders migrated:          ${stats.ordersUpdated}`);
    console.log(`Menu items migrated:      ${stats.menuItemsUpdated}`);
    console.log(`Memberships migrated:     ${stats.membershipsUpdated}`);
    console.log(`Loyalty points migrated:  ${stats.loyaltyPointsUpdated}`);
    console.log(`Payment methods migrated: ${stats.paymentMethodsUpdated}`);
    console.log(`Scheduled orders migrated: ${stats.scheduledOrdersUpdated}`);
    console.log('=' .repeat(50));

    console.log('\n✅ Migration completed successfully!');
    console.log(`\nAll migrated data assigned to shop: ${DEFAULT_SHOP_ID}`);
    console.log('\nNext steps:');
    console.log('1. Verify data in database');
    console.log('2. Test API with X-Shop-ID header');
    console.log('3. Run MULTI_TENANCY_TESTING_CHECKLIST.md');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
