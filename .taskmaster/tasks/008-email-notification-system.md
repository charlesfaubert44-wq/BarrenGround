# Email Notification System

**Priority:** 🟠 HIGH PRIORITY
**Phase:** 2 - High-Value Features
**Estimated Time:** 4-5 hours
**Impact:** Better customer communication, reduced no-shows
**Status:** pending

## Description
Implement comprehensive email notification system for order confirmations, status updates, membership events, and customer communication.

## Email Types Needed
1. Order confirmation (guest + authenticated)
2. Order ready for pickup
3. Membership welcome
4. Membership renewal reminder
5. Password reset
6. Loyalty points awarded
7. Scheduled order reminder

## Tasks

### 1. Choose Email Service
- [ ] Evaluate options:
  - **SendGrid** (recommended) - 100 emails/day free
  - **Mailgun** - 5,000 emails/month free
  - **AWS SES** - Cheapest for high volume
  - **Resend** - Developer-friendly

- [ ] Sign up for SendGrid
- [ ] Get API key
- [ ] Verify sender email/domain

### 2. Install Dependencies
- [ ] Install email library
  ```bash
  cd backend
  npm install @sendgrid/mail
  # or
  npm install nodemailer
  ```

### 3. Create Email Service
- [ ] Create `backend/src/services/emailService.ts`
  ```typescript
  import sgMail from '@sendgrid/mail';

  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@barrengroundcoffee.com';
  const FROM_NAME = 'Barren Ground Coffee';

  export class EmailService {
    static async sendOrderConfirmation(order: Order): Promise<void> {
      const customerEmail = order.guest_email || order.user_email;

      const msg = {
        to: customerEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `Order Confirmation #${order.id}`,
        html: await renderOrderConfirmationEmail(order),
      };

      try {
        await sgMail.send(msg);
        console.log(`Order confirmation sent to ${customerEmail}`);
      } catch (error) {
        console.error('Failed to send order confirmation:', error);
        // Don't throw - email failure shouldn't break order flow
      }
    }

    static async sendOrderReady(order: Order): Promise<void> {
      const customerEmail = order.guest_email || order.user_email;

      const msg = {
        to: customerEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Your order is ready for pickup!',
        html: await renderOrderReadyEmail(order),
      };

      await sgMail.send(msg);
    }

    static async sendScheduledOrderReminder(order: Order): Promise<void> {
      const customerEmail = order.guest_email || order.user_email;
      const pickupTime = new Date(order.scheduled_time);

      const msg = {
        to: customerEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Reminder: Your order is ready soon',
        html: await renderScheduledReminderEmail(order, pickupTime),
      };

      await sgMail.send(msg);
    }

    static async sendMembershipWelcome(user: User, plan: MembershipPlan): Promise<void> {
      const msg = {
        to: user.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `Welcome to ${plan.name}!`,
        html: await renderMembershipWelcomeEmail(user, plan),
      };

      await sgMail.send(msg);
    }

    static async sendMembershipRenewalReminder(user: User, membership: UserMembership): Promise<void> {
      const msg = {
        to: user.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Your membership renews soon',
        html: await renderMembershipRenewalEmail(user, membership),
      };

      await sgMail.send(msg);
    }

    static async sendPasswordReset(user: User, resetToken: string): Promise<void> {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const msg = {
        to: user.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: 'Reset your password',
        html: await renderPasswordResetEmail(user, resetUrl),
      };

      await sgMail.send(msg);
    }

    static async sendLoyaltyPointsEarned(user: User, points: number, orderId: number): Promise<void> {
      const msg = {
        to: user.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `You earned ${points} loyalty points!`,
        html: await renderLoyaltyPointsEmail(user, points, orderId),
      };

      await sgMail.send(msg);
    }
  }
  ```

### 4. Create Email Templates
- [ ] Create `backend/src/templates/orderConfirmation.ts`
  ```typescript
  export const renderOrderConfirmationEmail = async (order: Order): Promise<string> => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
          .order-details { background: #f5f5f5; padding: 20px; margin: 20px 0; }
          .item { border-bottom: 1px solid #ddd; padding: 10px 0; }
          .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; }
          .button { background: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>

          <p>Hi ${order.guest_name || order.user_name},</p>
          <p>Thank you for your order! We're preparing it now.</p>

          <div class="order-details">
            <h2>Order #${order.id}</h2>

            ${order.items.map(item => `
              <div class="item">
                <strong>${item.quantity}x ${item.menu_item_name}</strong>
                ${item.customizations ? `<br><small>${formatCustomizations(item.customizations)}</small>` : ''}
                <div style="float: right;">$${(item.price_snapshot * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}

            <div class="total">
              Total: $${order.total.toFixed(2)}
            </div>
          </div>

          ${order.is_scheduled ? `
            <p><strong>Pickup Time:</strong> ${new Date(order.scheduled_time).toLocaleString()}</p>
          ` : `
            <p><strong>Pickup:</strong> Ready in 15-20 minutes</p>
          `}

          ${order.tracking_token ? `
            <a href="${process.env.FRONTEND_URL}/track/${order.tracking_token}" class="button">
              Track Your Order
            </a>
          ` : ''}

          <p>See you soon!</p>
          <p>- The Barren Ground Coffee Team</p>
        </div>
      </body>
      </html>
    `;
  };
  ```

- [ ] Create similar templates for:
  - `orderReady.ts`
  - `scheduledReminder.ts`
  - `membershipWelcome.ts`
  - `membershipRenewal.ts`
  - `passwordReset.ts`
  - `loyaltyPoints.ts`

### 5. Integrate with Order Flow
- [ ] Update `backend/src/controllers/orderController.ts`
  ```typescript
  import { EmailService } from '../services/emailService';

  export const createOrder = async (req: Request, res: Response) => {
    // ... existing order creation logic

    // After order created successfully
    try {
      await EmailService.sendOrderConfirmation(order);
    } catch (error) {
      console.error('Email send failed:', error);
      // Don't fail the request
    }

    res.json({ order });
  };
  ```

- [ ] Update `backend/src/controllers/orderController.ts` (status update)
  ```typescript
  export const updateOrderStatus = async (req: Request, res: Response) => {
    // ... update status logic

    // Send email when status changes to 'ready'
    if (newStatus === 'ready') {
      try {
        await EmailService.sendOrderReady(order);
      } catch (error) {
        console.error('Email send failed:', error);
      }
    }

    res.json({ order });
  };
  ```

### 6. Integrate with Membership
- [ ] Update `backend/src/controllers/membershipController.ts`
  ```typescript
  export const subscribe = async (req: Request, res: Response) => {
    // ... subscription logic

    // Send welcome email
    const plan = await MembershipPlan.findById(subscription.plan_id);
    await EmailService.sendMembershipWelcome(user, plan);

    res.json({ subscription });
  };
  ```

### 7. Integrate with Loyalty Points
- [ ] Update `backend/src/models/LoyaltyTransaction.ts`
  ```typescript
  static async earnPoints(userId: number, orderId: number, amount: number): Promise<void> {
    // ... earn points logic

    const user = await User.findById(userId);

    // Send email notification
    if (amount >= 100) { // Only notify for significant points
      await EmailService.sendLoyaltyPointsEarned(user, amount, orderId);
    }
  }
  ```

### 8. Password Reset Flow
- [ ] Create `backend/src/controllers/authController.ts` additions
  ```typescript
  export const requestPasswordReset = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If email exists, reset link sent' });
    }

    // Generate reset token (JWT with 1 hour expiry)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Send reset email
    await EmailService.sendPasswordReset(user, resetToken);

    res.json({ message: 'If email exists, reset link sent' });
  };

  export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid token type');
      }

      // Update password
      await User.updatePassword(decoded.userId, newPassword);

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
    }
  };
  ```

### 9. Email Preferences
- [ ] Add to users table
  ```sql
  ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT true;
  ALTER TABLE users ADD COLUMN marketing_emails BOOLEAN DEFAULT false;
  ```

- [ ] Check preference before sending
  ```typescript
  static async sendOrderReady(order: Order): Promise<void> {
    if (order.user_id) {
      const user = await User.findById(order.user_id);
      if (!user.email_notifications) {
        return; // User opted out
      }
    }

    // Send email...
  }
  ```

### 10. Testing
- [ ] Test order confirmation email (guest + user)
- [ ] Test order ready notification
- [ ] Test scheduled order reminder
- [ ] Test membership welcome
- [ ] Test password reset flow
- [ ] Test loyalty points email
- [ ] Test with real email addresses
- [ ] Test email formatting on mobile
- [ ] Test unsubscribe links

### 11. Monitoring & Logging
- [ ] Create `backend/src/utils/emailLogger.ts`
  ```typescript
  export const logEmailSent = async (
    type: string,
    recipient: string,
    success: boolean,
    error?: string
  ) => {
    await pool.query(`
      INSERT INTO email_logs (type, recipient, success, error, sent_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [type, recipient, success, error]);
  };
  ```

- [ ] Create email logs table
  ```sql
  CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    success BOOLEAN NOT NULL,
    error TEXT,
    sent_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_email_logs_sent ON email_logs(sent_at DESC);
  CREATE INDEX idx_email_logs_type ON email_logs(type);
  ```

## Success Criteria
- [x] Order confirmation emails sent automatically
- [x] Order ready notifications work
- [x] Scheduled order reminders sent
- [x] Membership emails functional
- [x] Password reset flow working
- [x] Emails render properly on desktop and mobile
- [x] Users can opt out of notifications
- [x] Email delivery monitored/logged

## Files to Create
- `backend/src/services/emailService.ts`
- `backend/src/templates/orderConfirmation.ts`
- `backend/src/templates/orderReady.ts`
- `backend/src/templates/scheduledReminder.ts`
- `backend/src/templates/membershipWelcome.ts`
- `backend/src/templates/membershipRenewal.ts`
- `backend/src/templates/passwordReset.ts`
- `backend/src/templates/loyaltyPoints.ts`
- `backend/src/utils/emailLogger.ts`

## Files to Modify
- `backend/src/controllers/orderController.ts`
- `backend/src/controllers/membershipController.ts`
- `backend/src/controllers/authController.ts`
- `backend/src/models/LoyaltyTransaction.ts`

## Environment Variables
```
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=orders@barrengroundcoffee.com
FRONTEND_URL=https://barrengroundcoffee.com
```

## Dependencies
- @sendgrid/mail

## Future Enhancements
- SMS notifications (Twilio)
- Push notifications
- Email templates with drag-and-drop editor
- A/B testing email content
- Transactional email analytics
- Unsubscribe preferences page
