import sgMail from '@sendgrid/mail';
import { OrderWithItems } from '../models/Order';
import { User } from '../models/User';
import { MembershipPlan } from '../models/MembershipPlan';
import { UserMembership } from '../models/UserMembership';
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

// Initialize SendGrid only if API key is provided
let sendgridConfigured = false;
const sendgridApiKey = process.env.SENDGRID_API_KEY;

if (sendgridApiKey && sendgridApiKey.startsWith('SG.')) {
  try {
    sgMail.setApiKey(sendgridApiKey);
    sendgridConfigured = true;
    console.log('✅ SendGrid email service initialized successfully');
  } catch (error) {
    console.warn('⚠️  SendGrid initialization failed:', error);
  }
} else {
  console.warn('⚠️  SendGrid is not configured. Email notifications will be logged only.');
  console.warn('   To enable emails, set SENDGRID_API_KEY in your .env file');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@barrengroundcoffee.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Barren Ground Coffee';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8890';

export class EmailService {
  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(order: OrderWithItems): Promise<void> {
    const customerEmail = order.guest_email || order.user_email;

    if (!customerEmail) {
      console.warn('Cannot send order confirmation: no customer email');
      return;
    }

    try {
      const msg = {
        to: customerEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `Order Confirmation #${order.id}`,
        html: renderOrderConfirmationEmail(order),
      };

      if (sendgridConfigured) {
        await sgMail.send(msg);
        await logEmailSent('order_confirmation', customerEmail, true);
        console.log(`✅ Order confirmation email sent to ${customerEmail}`);
      } else {
        console.log(`📧 [MOCK] Order confirmation email would be sent to ${customerEmail}`);
        await logEmailSent('order_confirmation', customerEmail, true, 'SendGrid not configured - mock send');
      }
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      await logEmailSent('order_confirmation', customerEmail, false, error instanceof Error ? error.message : String(error));
      // Don't throw - email failure shouldn't break order flow
    }
  }

  /**
   * Send order ready notification
   */
  static async sendOrderReady(order: OrderWithItems): Promise<void> {
    const customerEmail = order.guest_email || order.user_email;

    if (!customerEmail) {
      console.warn('Cannot send order ready email: no customer email');
      return;
    }

    try {
      const msg = {
        to: customerEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Your order is ready for pickup!',
        html: renderOrderReadyEmail(order),
      };

      if (sendgridConfigured) {
        await sgMail.send(msg);
        await logEmailSent('order_ready', customerEmail, true);
        console.log(`✅ Order ready email sent to ${customerEmail}`);
      } else {
        console.log(`📧 [MOCK] Order ready email would be sent to ${customerEmail}`);
        await logEmailSent('order_ready', customerEmail, true, 'SendGrid not configured - mock send');
      }
    } catch (error) {
      console.error('Failed to send order ready email:', error);
      await logEmailSent('order_ready', customerEmail, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send scheduled order reminder
   */
  static async sendScheduledOrderReminder(order: OrderWithItems): Promise<void> {
    const customerEmail = order.guest_email || order.user_email;

    if (!customerEmail) {
      console.warn('Cannot send scheduled reminder: no customer email');
      return;
    }

    if (!order.pickup_time) {
      console.warn('Cannot send scheduled reminder: no pickup time');
      return;
    }

    try {
      const msg = {
        to: customerEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Reminder: Your order is ready soon',
        html: renderScheduledReminderEmail(order, new Date(order.pickup_time)),
      };

      if (sendgridConfigured) {
        await sgMail.send(msg);
        await logEmailSent('scheduled_reminder', customerEmail, true);
        console.log(`✅ Scheduled reminder email sent to ${customerEmail}`);
      } else {
        console.log(`📧 [MOCK] Scheduled reminder email would be sent to ${customerEmail}`);
        await logEmailSent('scheduled_reminder', customerEmail, true, 'SendGrid not configured - mock send');
      }
    } catch (error) {
      console.error('Failed to send scheduled reminder email:', error);
      await logEmailSent('scheduled_reminder', customerEmail, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send membership welcome email
   */
  static async sendMembershipWelcome(user: User, plan: MembershipPlan): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `Welcome to ${plan.name}!`,
        html: renderMembershipWelcomeEmail(user, plan),
      };

      if (sendgridConfigured) {
        await sgMail.send(msg);
        await logEmailSent('membership_welcome', user.email, true);
        console.log(`✅ Membership welcome email sent to ${user.email}`);
      } else {
        console.log(`📧 [MOCK] Membership welcome email would be sent to ${user.email}`);
        await logEmailSent('membership_welcome', user.email, true, 'SendGrid not configured - mock send');
      }
    } catch (error) {
      console.error('Failed to send membership welcome email:', error);
      await logEmailSent('membership_welcome', user.email, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send membership renewal reminder
   */
  static async sendMembershipRenewalReminder(user: User, membership: UserMembership): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Your membership renews soon',
        html: renderMembershipRenewalEmail(user, membership),
      };

      if (sendgridConfigured) {
        await sgMail.send(msg);
        await logEmailSent('membership_renewal', user.email, true);
        console.log(`✅ Membership renewal email sent to ${user.email}`);
      } else {
        console.log(`📧 [MOCK] Membership renewal email would be sent to ${user.email}`);
        await logEmailSent('membership_renewal', user.email, true, 'SendGrid not configured - mock send');
      }
    } catch (error) {
      console.error('Failed to send membership renewal email:', error);
      await logEmailSent('membership_renewal', user.email, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      const msg = {
        to: user.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Reset your password',
        html: renderPasswordResetEmail(user, resetUrl),
      };

      if (sendgridConfigured) {
        await sgMail.send(msg);
        await logEmailSent('password_reset', user.email, true);
        console.log(`✅ Password reset email sent to ${user.email}`);
      } else {
        console.log(`📧 [MOCK] Password reset email would be sent to ${user.email}`);
        console.log(`📧 Reset URL: ${resetUrl}`);
        await logEmailSent('password_reset', user.email, true, 'SendGrid not configured - mock send');
      }
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      await logEmailSent('password_reset', user.email, false, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Send loyalty points earned notification
   */
  static async sendLoyaltyPointsEarned(user: User, points: number, orderId: number): Promise<void> {
    try {
      const msg = {
        to: user.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `You earned ${points} loyalty points!`,
        html: renderLoyaltyPointsEmail(user, points, orderId),
      };

      if (sendgridConfigured) {
        await sgMail.send(msg);
        await logEmailSent('loyalty_points', user.email, true);
        console.log(`✅ Loyalty points email sent to ${user.email}`);
      } else {
        console.log(`📧 [MOCK] Loyalty points email would be sent to ${user.email}`);
        await logEmailSent('loyalty_points', user.email, true, 'SendGrid not configured - mock send');
      }
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

    await this.sendScheduledOrderReminder(orderLike);
  }
}
