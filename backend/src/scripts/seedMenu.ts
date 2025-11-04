import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const menuData = [
  // Hot Coffee
  { name: 'Espresso', description: 'Rich and bold double shot of premium espresso', price: 3.50, category: 'coffee' },
  { name: 'Cappuccino', description: 'Classic espresso with velvety steamed milk and foam', price: 4.50, category: 'coffee' },
  { name: 'Latte', description: 'Smooth espresso with perfectly steamed milk', price: 4.75, category: 'coffee' },
  { name: 'Americano', description: 'Bold espresso diluted with hot water', price: 3.75, category: 'coffee' },
  { name: 'Mocha', description: 'Rich chocolate and espresso with steamed milk', price: 5.25, category: 'coffee' },
  { name: 'Flat White', description: 'Double ristretto shots with microfoam milk', price: 4.75, category: 'coffee' },
  { name: 'Cortado', description: 'Equal parts espresso and steamed milk', price: 4.25, category: 'coffee' },
  { name: 'Macchiato', description: 'Espresso marked with a dollop of foam', price: 3.75, category: 'coffee' },

  // Drip Coffee
  { name: 'House Drip Coffee', description: 'Our signature medium roast, smooth and balanced', price: 2.50, category: 'drip-coffee' },
  { name: 'Dark Roast', description: 'Bold and robust dark roast for the adventurous', price: 2.75, category: 'drip-coffee' },
  { name: 'Blonde Roast', description: 'Light and bright with subtle citrus notes', price: 2.50, category: 'drip-coffee' },
  { name: 'Pour Over', description: 'Single-origin coffee brewed to perfection', price: 4.50, category: 'drip-coffee' },
  { name: 'French Press', description: 'Full-bodied and aromatic coffee experience', price: 4.00, category: 'drip-coffee' },

  // Cold Drinks
  { name: 'Iced Latte', description: 'Espresso and cold milk over ice', price: 5.25, category: 'cold-drinks' },
  { name: 'Iced Americano', description: 'Espresso and cold water over ice', price: 4.25, category: 'cold-drinks' },
  { name: 'Cold Brew', description: 'Smooth, naturally sweet cold-steeped coffee', price: 4.75, category: 'cold-drinks' },
  { name: 'Nitro Cold Brew', description: 'Creamy cold brew infused with nitrogen', price: 5.50, category: 'cold-drinks' },
  { name: 'Iced Mocha', description: 'Chocolate, espresso, and milk over ice', price: 5.75, category: 'cold-drinks' },
  { name: 'Iced Caramel Latte', description: 'Espresso, milk, and caramel over ice', price: 5.75, category: 'cold-drinks' },
  { name: 'Vanilla Iced Coffee', description: 'House coffee with vanilla and cream over ice', price: 4.50, category: 'cold-drinks' },
  { name: 'Frappe', description: 'Blended iced coffee drink with whipped cream', price: 6.00, category: 'cold-drinks' },

  // Specialty Drinks
  { name: 'Chai Latte', description: 'Spiced tea with steamed milk and honey', price: 4.75, category: 'specialty' },
  { name: 'Matcha Latte', description: 'Premium Japanese green tea with steamed milk', price: 5.50, category: 'specialty' },
  { name: 'Hot Chocolate', description: 'Rich Belgian chocolate with steamed milk', price: 4.25, category: 'specialty' },
  { name: 'White Mocha', description: 'Espresso with white chocolate and steamed milk', price: 5.50, category: 'specialty' },
  { name: 'Caramel Macchiato', description: 'Vanilla, espresso, milk, and caramel drizzle', price: 5.50, category: 'specialty' },
  { name: 'Honey Lavender Latte', description: 'Espresso with honey, lavender, and milk', price: 5.75, category: 'specialty' },
  { name: 'Pumpkin Spice Latte', description: 'Seasonal favorite with pumpkin and spices', price: 5.75, category: 'specialty' },
  { name: 'London Fog', description: 'Earl Grey tea with vanilla and steamed milk', price: 4.50, category: 'specialty' },

  // Pastries
  { name: 'Butter Croissant', description: 'Buttery, flaky French pastry baked fresh daily', price: 3.50, category: 'pastries' },
  { name: 'Chocolate Croissant', description: 'Flaky croissant filled with rich dark chocolate', price: 4.25, category: 'pastries' },
  { name: 'Almond Croissant', description: 'Croissant with almond cream and sliced almonds', price: 4.50, category: 'pastries' },
  { name: 'Blueberry Muffin', description: 'Fresh blueberries in a moist vanilla muffin', price: 3.75, category: 'pastries' },
  { name: 'Chocolate Chip Muffin', description: 'Double chocolate muffin with chocolate chips', price: 3.75, category: 'pastries' },
  { name: 'Banana Nut Muffin', description: 'Moist banana muffin with walnuts', price: 3.75, category: 'pastries' },
  { name: 'Cinnamon Roll', description: 'Warm cinnamon roll with cream cheese frosting', price: 4.50, category: 'pastries' },
  { name: 'Scone', description: 'Buttery scone with your choice of flavor', price: 3.50, category: 'pastries' },
  { name: 'Danish', description: 'Flaky pastry with fruit or cheese filling', price: 4.00, category: 'pastries' },
  { name: 'Donut', description: 'Fresh daily donuts in various flavors', price: 2.75, category: 'pastries' },
  { name: 'Biscotti', description: 'Crunchy twice-baked Italian cookie', price: 2.50, category: 'pastries' },
  { name: 'Cookie', description: 'Fresh-baked cookies - chocolate chip or oatmeal', price: 2.75, category: 'pastries' },

  // Food
  { name: 'Bagel with Cream Cheese', description: 'Toasted bagel with your choice of cream cheese', price: 4.50, category: 'food' },
  { name: 'Breakfast Sandwich', description: 'Egg, cheese, and your choice of meat on a bagel', price: 6.50, category: 'food' },
  { name: 'Avocado Toast', description: 'Smashed avocado on artisan bread with toppings', price: 7.50, category: 'food' },
  { name: 'Granola Bowl', description: 'House-made granola with yogurt and fresh fruit', price: 6.75, category: 'food' },
  { name: 'Oatmeal', description: 'Steel-cut oats with brown sugar and toppings', price: 5.50, category: 'food' },
  { name: 'Turkey & Swiss Sandwich', description: 'Fresh turkey, swiss cheese, lettuce, and tomato', price: 8.50, category: 'food' },
  { name: 'Caprese Sandwich', description: 'Fresh mozzarella, tomato, basil, and balsamic', price: 8.00, category: 'food' },
  { name: 'Grilled Cheese', description: 'Classic grilled cheese on sourdough bread', price: 6.50, category: 'food' },
  { name: 'Veggie Wrap', description: 'Hummus, fresh veggies, and greens in a wrap', price: 7.50, category: 'food' },
  { name: 'Chicken Caesar Wrap', description: 'Grilled chicken, romaine, parmesan, and caesar', price: 8.50, category: 'food' },
  { name: 'Fruit Cup', description: 'Fresh seasonal fruit selection', price: 4.50, category: 'food' },
  { name: 'Yogurt Parfait', description: 'Greek yogurt layered with granola and berries', price: 5.50, category: 'food' },
];

async function seedMenu() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');

    // Clear existing menu items
    console.log('🗑️  Clearing existing menu items...');
    await pool.query('DELETE FROM menu_items');

    // Insert new menu items
    console.log('📝 Inserting menu items...');

    for (const item of menuData) {
      await pool.query(
        'INSERT INTO menu_items (name, description, price, category, available) VALUES ($1, $2, $3, $4, $5)',
        [item.name, item.description, item.price, item.category, true]
      );
    }

    console.log(`✅ Successfully added ${menuData.length} menu items!`);
    console.log('📊 Categories:');
    console.log('   ☕ Coffee: 8 items');
    console.log('   🌿 Drip Coffee: 5 items');
    console.log('   🧊 Cold Drinks: 8 items');
    console.log('   ✨ Specialty: 8 items');
    console.log('   🥐 Pastries: 12 items');
    console.log('   🍳 Food: 12 items');

  } catch (error) {
    console.error('❌ Error seeding menu:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  } finally {
    await pool.end();
  }
}

seedMenu();
