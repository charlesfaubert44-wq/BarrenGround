import sgMail from '@sendgrid/mail';
import { OrderWithItems } from '../models/Order';
import { User } from '../models/User';
import { MembershipPlan } from '../models/MembershipPlan';
import { UserMembership } from '../models/UserMembership';
import { Shop } from '../models/Shop';
import {
  renderOrderConfirmationEmail,
  renderOrderReadyEmail,
  renderScheduledReminderEmail,
  renderMembershipWelcomeEmail,
  renderMembershipRenewalEmail,
  renderPasswordResetEmail,
  renderLoyaltyPointsEmail
} from '../templates/emailTemplates';
import { logEmailSent } from '../utils/emailLogger';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8890';

export class EmailService {
  /**
   * Get SendGrid client for shop
   */
  private static getSendGridForShop(shop: Shop): typeof sgMail | null {
    const apiKey = shop.sendgrid_api_key || process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      console.warn(`No SendGrid API key for shop ${shop.id}`);
      return null;
    }

    // Create new instance per shop
    const client = require('@sendgrid/mail');
    client.setApiKey(apiKey);
    return client;
  }
  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(order: OrderWithItems, shop: Shop): Promise<void> {
    const customerEmail = order.guest_email || order.user_email;

    if (!customerEmail) {
      console.warn('Cannot send order confirmation: no customer email');
      return;
    }

    const client = this.getSendGridForShop(shop);
    if (!client) {
      console.log(`📧 [MOCK] Order confirmation email would be sent to ${customerEmail} for shop ${shop.id}`);
      await logEmailSent('order_confirmation', customerEmail, true, 'SendGrid not configured - mock send');
      return;
    }

    const fromEmail = shop.email_from || process.env.FROM_EMAIL || 'noreply@example.com';
    const fromName = shop.email_from_name || shop.display_name;

    try {
      const msg = {
        to: customerEmail,
        from: { email: fromEmail, name: fromName },
        subject: `Order Confirmation #${order.id} - ${shop.display_name}`,
        html: renderOrderConfirmationEmail(order),
      };

      await client.send(msg);
      await logEmailSent('order_confirmation', customerEmail, true);
      console.log(`✅ Order confirmation email sent to ${customerEmail} via ${shop.id}'s SendGrid`);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      await logEmailSent('order_confirmation', customerEmail, false, error instanceof Error ? error.message : String(error));
      // Don't throw - email failure shouldn't break order flow
    }
  }

  /**
   * Send order ready notification
   */
  static async sendOrderReady(order: OrderWithItems, shop: Shop): Promise<void> {
    const customerEmail = order.guest_email || order.user_email;

    if (!customerEmail) {
      console.warn('Cannot send order ready email: no customer email');
      return;
    }

    const client = this.getSendGridForShop(shop);
    if (!client) {
      console.log(`📧 [MOCK] Order ready email would be sent to ${customerEmail} for shop ${shop.id}`);
      await logEmailSent('order_ready', customerEmail, true, 'SendGrid not configured - mock send');
      return;
    }

    const fromEmail = shop.email_from || process.env.FROM_EMAIL || 'noreply@example.com';
    const fromName = shop.email_from_name || shop.display_name;

    try {
      const msg = {
        to: customerEmail,
        from: { email: fromEmail, name: fromName },
        subject: `Your order is ready for pickup! - ${shop.display_name}`,
        html: renderOrderReadyEmail(order),
      };

      await client.send(msg);
      await logEmailSent('order_ready', customerEmail, true);
      console.log(`✅ Order ready email sent to ${customerEmail} via ${shop.id}'s SendGrid`);
    } catch (error) {
      console.error('Failed to send order ready email:', error);
      await logEmailSent('order_ready', customerEmail, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send scheduled order reminder
   */
  static async sendScheduledOrderReminder(order: OrderWithItems, shop: Shop): Promise<void> {
    const customerEmail = order.guest_email || order.user_email;

    if (!customerEmail) {
      console.warn('Cannot send scheduled reminder: no customer email');
      return;
    }

    if (!order.pickup_time) {
      console.warn('Cannot send scheduled reminder: no pickup time');
      return;
    }

    const client = this.getSendGridForShop(shop);
    if (!client) {
      console.log(`📧 [MOCK] Scheduled reminder email would be sent to ${customerEmail} for shop ${shop.id}`);
      await logEmailSent('scheduled_reminder', customerEmail, true, 'SendGrid not configured - mock send');
      return;
    }

    const fromEmail = shop.email_from || process.env.FROM_EMAIL || 'noreply@example.com';
    const fromName = shop.email_from_name || shop.display_name;

    try {
      const msg = {
        to: customerEmail,
        from: { email: fromEmail, name: fromName },
        subject: `Reminder: Your order is ready soon - ${shop.display_name}`,
        html: renderScheduledReminderEmail(order, new Date(order.pickup_time)),
      };

      await client.send(msg);
      await logEmailSent('scheduled_reminder', customerEmail, true);
      console.log(`✅ Scheduled reminder email sent to ${customerEmail} via ${shop.id}'s SendGrid`);
    } catch (error) {
      console.error('Failed to send scheduled reminder email:', error);
      await logEmailSent('scheduled_reminder', customerEmail, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send membership welcome email
   */
  static async sendMembershipWelcome(user: User, plan: MembershipPlan, shop: Shop): Promise<void> {
    const client = this.getSendGridForShop(shop);
    if (!client) {
      console.log(`📧 [MOCK] Membership welcome email would be sent to ${user.email} for shop ${shop.id}`);
      await logEmailSent('membership_welcome', user.email, true, 'SendGrid not configured - mock send');
      return;
    }

    const fromEmail = shop.email_from || process.env.FROM_EMAIL || 'noreply@example.com';
    const fromName = shop.email_from_name || shop.display_name;

    try {
      const msg = {
        to: user.email,
        from: { email: fromEmail, name: fromName },
        subject: `Welcome to ${plan.name}! - ${shop.display_name}`,
        html: renderMembershipWelcomeEmail(user, plan),
      };

      await client.send(msg);
      await logEmailSent('membership_welcome', user.email, true);
      console.log(`✅ Membership welcome email sent to ${user.email} via ${shop.id}'s SendGrid`);
    } catch (error) {
      console.error('Failed to send membership welcome email:', error);
      await logEmailSent('membership_welcome', user.email, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send membership renewal reminder
   */
  static async sendMembershipRenewalReminder(user: User, membership: UserMembership, shop: Shop): Promise<void> {
    const client = this.getSendGridForShop(shop);
    if (!client) {
      console.log(`📧 [MOCK] Membership renewal email would be sent to ${user.email} for shop ${shop.id}`);
      await logEmailSent('membership_renewal', user.email, true, 'SendGrid not configured - mock send');
      return;
    }

    const fromEmail = shop.email_from || process.env.FROM_EMAIL || 'noreply@example.com';
    const fromName = shop.email_from_name || shop.display_name;

    try {
      const msg = {
        to: user.email,
        from: { email: fromEmail, name: fromName },
        subject: `Your membership renews soon - ${shop.display_name}`,
        html: renderMembershipRenewalEmail(user, membership),
      };

      await client.send(msg);
      await logEmailSent('membership_renewal', user.email, true);
      console.log(`✅ Membership renewal email sent to ${user.email} via ${shop.id}'s SendGrid`);
    } catch (error) {
      console.error('Failed to send membership renewal email:', error);
      await logEmailSent('membership_renewal', user.email, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(user: User, resetToken: string, shop: Shop): Promise<void> {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const client = this.getSendGridForShop(shop);
    if (!client) {
      console.log(`📧 [MOCK] Password reset email would be sent to ${user.email} for shop ${shop.id}`);
      console.log(`📧 Reset URL: ${resetUrl}`);
      await logEmailSent('password_reset', user.email, true, 'SendGrid not configured - mock send');
      return;
    }

    const fromEmail = shop.email_from || process.env.FROM_EMAIL || 'noreply@example.com';
    const fromName = shop.email_from_name || shop.display_name;

    try {
      const msg = {
        to: user.email,
        from: { email: fromEmail, name: fromName },
        subject: `Reset your password - ${shop.display_name}`,
        html: renderPasswordResetEmail(user, resetUrl),
      };

      await client.send(msg);
      await logEmailSent('password_reset', user.email, true);
      console.log(`✅ Password reset email sent to ${user.email} via ${shop.id}'s SendGrid`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      await logEmailSent('password_reset', user.email, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send loyalty points earned notification
   */
  static async sendLoyaltyPointsEarned(user: User, points: number, orderId: number, shop: Shop): Promise<void> {
    const client = this.getSendGridForShop(shop);
    if (!client) {
      console.log(`📧 [MOCK] Loyalty points email would be sent to ${user.email} for shop ${shop.id}`);
      await logEmailSent('loyalty_points', user.email, true, 'SendGrid not configured - mock send');
      return;
    }

    const fromEmail = shop.email_from || process.env.FROM_EMAIL || 'noreply@example.com';
    const fromName = shop.email_from_name || shop.display_name;

    try {
      const msg = {
        to: user.email,
        from: { email: fromEmail, name: fromName },
        subject: `You earned ${points} loyalty points! - ${shop.display_name}`,
        html: renderLoyaltyPointsEmail(user, points, orderId),
      };

      await client.send(msg);
      await logEmailSent('loyalty_points', user.email, true);
      console.log(`✅ Loyalty points email sent to ${user.email} via ${shop.id}'s SendGrid`);
    } catch (error) {
      console.error('Failed to send loyalty points email:', error);
      await logEmailSent('loyalty_points', user.email, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send pickup reminder (alias for sendScheduledOrderReminder with flexible params)
   */
  static async sendPickupReminder(params: {
    email: string;
    name: string;
    orderId: number;
    scheduledTime: Date;
    items: any[];
    total: number;
    shop: Shop;
  }): Promise<void> {
    // Create a minimal order object for the reminder
    const orderLike: OrderWithItems = {
      id: params.orderId,
      guest_email: params.email,
      guest_name: params.name,
      total: params.total,
      pickup_time: params.scheduledTime,
      items: params.items,
      customer_name: params.name,
    } as OrderWithItems;

    await this.sendScheduledOrderReminder(orderLike, params.shop);
  }
}
