import cron from 'node-cron';
import { OrderModel } from '../models/Order';
import { EmailService } from '../services/emailService';
import { ShopModel } from '../models/Shop';

/**
 * Order Reminder Job
 * Runs every 5 minutes to check for orders that need reminder notifications
 * Sends reminders 15 minutes before scheduled pickup time
 */
export function startOrderReminderJob() {
  // Run every 5 minutes: '*/5 * * * *'
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('[Order Reminders] Running reminder check...');

      // Get orders that need reminders
      const orders = await OrderModel.getOrdersNeedingReminders();

      if (orders.length === 0) {
        console.log('[Order Reminders] No orders need reminders at this time');
        return;
      }

      console.log(`[Order Reminders] Found ${orders.length} orders needing reminders`);

      // Send reminders for each order
      for (const order of orders) {
        try {
          // Determine customer email
          const customerEmail = order.guest_email || order.user_email;

          if (!customerEmail) {
            console.warn(`[Order Reminders] No email found for order #${order.id}, skipping`);
            continue;
          }

          // Fetch shop for this order
          const shop = await ShopModel.findById(order.shop_id);
          if (!shop) {
            console.warn(`[Order Reminders] Shop not found for order #${order.id}, skipping`);
            continue;
          }

          // Send reminder email
          await EmailService.sendPickupReminder({
            email: customerEmail,
            name: order.customer_name,
            orderId: order.id,
            scheduledTime: order.scheduled_time!,
            items: order.items,
            total: order.total,
            shop: shop,
          });

          // Mark reminder as sent
          await OrderModel.markReminderSent(order.id);

          console.log(`[Order Reminders] Sent reminder for order #${order.id} to ${customerEmail}`);
        } catch (error) {
          console.error(`[Order Reminders] Failed to send reminder for order #${order.id}:`, error);
          // Continue with next order even if one fails
        }
      }

      console.log('[Order Reminders] Reminder check completed');
    } catch (error) {
      console.error('[Order Reminders] Error in reminder job:', error);
    }
  });

  console.log('[Order Reminders] Job started - will run every 5 minutes');
}

/**
 * Alternative: Manual reminder check (useful for testing)
 */
export async function checkAndSendReminders() {
  const orders = await OrderModel.getOrdersNeedingReminders();

  for (const order of orders) {
    const customerEmail = order.guest_email || order.user_email;

    if (!customerEmail) continue;

    // Fetch shop for this order
    const shop = await ShopModel.findById(order.shop_id);
    if (!shop) {
      console.warn(`Shop not found for order #${order.id}, skipping`);
      continue;
    }

    await EmailService.sendPickupReminder({
      email: customerEmail,
      name: order.customer_name,
      orderId: order.id,
      scheduledTime: order.scheduled_time!,
      items: order.items,
      total: order.total,
      shop: shop,
    });

    await OrderModel.markReminderSent(order.id);
  }

  return orders.length;
}
