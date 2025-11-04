import { OrderWithItems } from '../models/Order';
import { User } from '../models/User';
import { MembershipPlan } from '../models/MembershipPlan';
import { UserMembership } from '../models/UserMembership';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8890';
const SHOP_NAME = process.env.SHOP_NAME || 'Barren Ground Coffee';

/**
 * Base email template with consistent styling
 */
const emailBaseTemplate = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SHOP_NAME}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #654321 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .order-details {
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .item {
      border-bottom: 1px solid #e0e0e0;
      padding: 12px 0;
      display: flex;
      justify-content: space-between;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-details {
      flex: 1;
    }
    .item-name {
      font-weight: 600;
      color: #333;
    }
    .item-customizations {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
    }
    .item-price {
      font-weight: 600;
      color: #8B4513;
      white-space: nowrap;
      margin-left: 16px;
    }
    .total {
      font-size: 18px;
      font-weight: 700;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid #8B4513;
      text-align: right;
      color: #8B4513;
    }
    .button {
      display: inline-block;
      background: #8B4513;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
      transition: background 0.3s;
    }
    .button:hover {
      background: #654321;
    }
    .info-box {
      background: #e8f4fd;
      border-left: 4px solid #2196F3;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .success-box {
      background: #e8f5e9;
      border-left: 4px solid #4CAF50;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #8B4513;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      .content {
        padding: 20px 16px;
      }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
`;

/**
 * Format customizations object into readable string
 */
const formatCustomizations = (customizations: Record<string, string> | undefined): string => {
  if (!customizations || Object.keys(customizations).length === 0) {
    return '';
  }
  return Object.entries(customizations)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
};

/**
 * Order Confirmation Email
 */
export const renderOrderConfirmationEmail = (order: OrderWithItems): string => {
  const customerName = order.guest_name || order.customer_name || 'Valued Customer';
  const isScheduled = order.pickup_time && new Date(order.pickup_time) > new Date();

  const content = `
    <div class="container">
      <div class="header">
        <h1>Order Confirmation</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>Thank you for your order! We're preparing it now.</p>

        <div class="order-details">
          <h2 style="margin-top: 0; color: #333; font-size: 18px;">Order #${order.id}</h2>

          ${order.items.map(item => `
            <div class="item">
              <div class="item-details">
                <div class="item-name">${item.quantity}x ${item.menu_item_name}</div>
                ${item.customizations ? `<div class="item-customizations">${formatCustomizations(item.customizations)}</div>` : ''}
              </div>
              <div class="item-price">$${(item.price_snapshot * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}

          <div class="total">
            Total: $${order.total.toFixed(2)}
          </div>
        </div>

        ${isScheduled ? `
          <div class="info-box">
            <strong>Scheduled Pickup:</strong><br>
            ${new Date(order.pickup_time!).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        ` : `
          <div class="success-box">
            <strong>Ready for pickup in 15-20 minutes</strong>
          </div>
        `}

        ${order.tracking_token ? `
          <div style="text-align: center;">
            <a href="${FRONTEND_URL}/track/${order.tracking_token}" class="button">
              Track Your Order
            </a>
          </div>
        ` : ''}

        <p>See you soon!</p>
        <p style="color: #666; margin-top: 30px;">- The ${SHOP_NAME} Team</p>
      </div>

      <div class="footer">
        <p>${SHOP_NAME}</p>
        <p>Questions? <a href="mailto:${process.env.SHOP_EMAIL || 'hello@barrengroundcoffee.com'}">Contact us</a></p>
      </div>
    </div>
  `;

  return emailBaseTemplate(content);
};

/**
 * Order Ready Email
 */
export const renderOrderReadyEmail = (order: OrderWithItems): string => {
  const customerName = order.guest_name || order.customer_name || 'Valued Customer';

  const content = `
    <div class="container">
      <div class="header">
        <h1>Your Order is Ready!</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>Great news! Your order is ready for pickup.</p>

        <div class="success-box">
          <strong>Order #${order.id}</strong><br>
          ${order.items.length} item${order.items.length > 1 ? 's' : ''} ready for pickup
        </div>

        <div class="order-details">
          ${order.items.map(item => `
            <div class="item">
              <div class="item-details">
                <div class="item-name">${item.quantity}x ${item.menu_item_name}</div>
              </div>
            </div>
          `).join('')}
        </div>

        ${order.tracking_token ? `
          <div style="text-align: center;">
            <a href="${FRONTEND_URL}/track/${order.tracking_token}" class="button">
              View Order Status
            </a>
          </div>
        ` : ''}

        <p>Please pick up your order at your earliest convenience. We look forward to seeing you!</p>
        <p style="color: #666; margin-top: 30px;">- The ${SHOP_NAME} Team</p>
      </div>

      <div class="footer">
        <p>${SHOP_NAME}</p>
        <p>Questions? <a href="mailto:${process.env.SHOP_EMAIL || 'hello@barrengroundcoffee.com'}">Contact us</a></p>
      </div>
    </div>
  `;

  return emailBaseTemplate(content);
};

/**
 * Scheduled Order Reminder Email
 */
export const renderScheduledReminderEmail = (order: OrderWithItems, pickupTime: Date): string => {
  const customerName = order.guest_name || order.customer_name || 'Valued Customer';

  const content = `
    <div class="container">
      <div class="header">
        <h1>Order Reminder</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>This is a friendly reminder about your scheduled order.</p>

        <div class="info-box">
          <strong>Pickup Time:</strong><br>
          ${pickupTime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </div>

        <div class="order-details">
          <h3 style="margin-top: 0; font-size: 16px;">Order #${order.id}</h3>
          ${order.items.map(item => `
            <div class="item">
              <div class="item-details">
                <div class="item-name">${item.quantity}x ${item.menu_item_name}</div>
              </div>
            </div>
          `).join('')}
        </div>

        ${order.tracking_token ? `
          <div style="text-align: center;">
            <a href="${FRONTEND_URL}/track/${order.tracking_token}" class="button">
              Track Your Order
            </a>
          </div>
        ` : ''}

        <p>We're looking forward to serving you!</p>
        <p style="color: #666; margin-top: 30px;">- The ${SHOP_NAME} Team</p>
      </div>

      <div class="footer">
        <p>${SHOP_NAME}</p>
        <p>Need to make changes? <a href="mailto:${process.env.SHOP_EMAIL || 'hello@barrengroundcoffee.com'}">Contact us</a></p>
      </div>
    </div>
  `;

  return emailBaseTemplate(content);
};

/**
 * Membership Welcome Email
 */
export const renderMembershipWelcomeEmail = (user: User, plan: MembershipPlan): string => {
  const content = `
    <div class="container">
      <div class="header">
        <h1>Welcome to ${plan.name}!</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for subscribing to <strong>${plan.name}</strong>! We're thrilled to have you as a member.</p>

        <div class="success-box">
          <h3 style="margin-top: 0;">Your Membership Benefits:</h3>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li><strong>${plan.coffees_per_interval} coffee${plan.coffees_per_interval > 1 ? 's' : ''}</strong> per ${plan.interval}</li>
            <li>One coffee per day</li>
            <li>Exclusive member perks</li>
            <li>Easy online ordering</li>
          </ul>
        </div>

        <div class="info-box">
          <strong>How to redeem your coffees:</strong>
          <ol style="margin: 8px 0; padding-left: 20px;">
            <li>Log in to your account</li>
            <li>Add a coffee to your cart</li>
            <li>Select "Use Membership" at checkout</li>
            <li>Pick up your coffee - no payment needed!</li>
          </ol>
        </div>

        <div style="text-align: center;">
          <a href="${FRONTEND_URL}/menu" class="button">
            Order Your First Coffee
          </a>
        </div>

        <p>If you have any questions about your membership, feel free to reach out to us.</p>
        <p style="color: #666; margin-top: 30px;">- The ${SHOP_NAME} Team</p>
      </div>

      <div class="footer">
        <p>${SHOP_NAME}</p>
        <p>Questions? <a href="mailto:${process.env.SHOP_EMAIL || 'hello@barrengroundcoffee.com'}">Contact us</a></p>
        <p><a href="${FRONTEND_URL}/account/membership">Manage your membership</a></p>
      </div>
    </div>
  `;

  return emailBaseTemplate(content);
};

/**
 * Membership Renewal Reminder Email
 */
export const renderMembershipRenewalEmail = (user: User, membership: UserMembership): string => {
  const renewalDate = new Date(membership.current_period_end);
  const daysUntilRenewal = Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const content = `
    <div class="container">
      <div class="header">
        <h1>Membership Renewal Reminder</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your membership will automatically renew in <strong>${daysUntilRenewal} day${daysUntilRenewal > 1 ? 's' : ''}</strong>.</p>

        <div class="info-box">
          <strong>Renewal Date:</strong><br>
          ${renewalDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        ${membership.coffees_remaining > 0 ? `
          <div class="warning-box">
            <strong>Don't forget!</strong> You still have <strong>${membership.coffees_remaining} coffee${membership.coffees_remaining > 1 ? 's' : ''}</strong> remaining in your current period.
          </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${FRONTEND_URL}/account/membership" class="button">
            Manage Membership
          </a>
        </div>

        <p>Your membership will automatically renew unless you cancel before the renewal date.</p>
        <p style="color: #666; margin-top: 30px;">- The ${SHOP_NAME} Team</p>
      </div>

      <div class="footer">
        <p>${SHOP_NAME}</p>
        <p>Questions? <a href="mailto:${process.env.SHOP_EMAIL || 'hello@barrengroundcoffee.com'}">Contact us</a></p>
        <p><a href="${FRONTEND_URL}/account/membership">Cancel anytime</a></p>
      </div>
    </div>
  `;

  return emailBaseTemplate(content);
};

/**
 * Password Reset Email
 */
export const renderPasswordResetEmail = (user: User, resetUrl: string): string => {
  const content = `
    <div class="container">
      <div class="header">
        <h1>Reset Your Password</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>We received a request to reset your password for your ${SHOP_NAME} account.</p>

        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">
            Reset Password
          </a>
        </div>

        <div class="warning-box">
          <strong>Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
        </div>

        <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>

        <p style="font-size: 13px; color: #666; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #8B4513; word-break: break-all;">${resetUrl}</a>
        </p>

        <p style="color: #666; margin-top: 30px;">- The ${SHOP_NAME} Team</p>
      </div>

      <div class="footer">
        <p>${SHOP_NAME}</p>
        <p>Questions? <a href="mailto:${process.env.SHOP_EMAIL || 'hello@barrengroundcoffee.com'}">Contact us</a></p>
      </div>
    </div>
  `;

  return emailBaseTemplate(content);
};

/**
 * Loyalty Points Earned Email
 */
export const renderLoyaltyPointsEmail = (user: User, points: number, orderId: number): string => {
  const content = `
    <div class="container">
      <div class="header">
        <h1>You Earned Points!</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Great news! You've earned loyalty points on your recent order.</p>

        <div class="success-box" style="text-align: center;">
          <h2 style="margin: 0; color: #4CAF50; font-size: 36px;">+${points}</h2>
          <p style="margin: 8px 0 0 0; font-size: 18px;">Loyalty Points</p>
        </div>

        <div class="info-box">
          <strong>Order #${orderId}</strong><br>
          Keep earning points with every purchase!
        </div>

        <div style="text-align: center;">
          <a href="${FRONTEND_URL}/account/rewards" class="button">
            View Your Points
          </a>
        </div>

        <p>Your loyalty points can be redeemed for free items and exclusive rewards. Check your account to see what's available!</p>
        <p style="color: #666; margin-top: 30px;">- The ${SHOP_NAME} Team</p>
      </div>

      <div class="footer">
        <p>${SHOP_NAME}</p>
        <p>Questions? <a href="mailto:${process.env.SHOP_EMAIL || 'hello@barrengroundcoffee.com'}">Contact us</a></p>
      </div>
    </div>
  `;

  return emailBaseTemplate(content);
};
