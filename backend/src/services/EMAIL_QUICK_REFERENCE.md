# Email Service Quick Reference

Quick guide for developers working with the email notification system.

## Import the Service

```typescript
import { EmailService } from '../services/emailService';
```

## Send Emails

### 1. Order Confirmation
```typescript
const order: OrderWithItems = await OrderModel.create(...);
await EmailService.sendOrderConfirmation(order);
```

### 2. Order Ready
```typescript
const order: OrderWithItems = await OrderModel.getById(orderId);
await EmailService.sendOrderReady(order);
```

### 3. Scheduled Reminder
```typescript
const order: OrderWithItems = await OrderModel.getById(orderId);
await EmailService.sendScheduledOrderReminder(order);
```

### 4. Membership Welcome
```typescript
const user: User = await UserModel.findById(userId);
const plan: MembershipPlan = await MembershipPlanModel.findById(planId);
await EmailService.sendMembershipWelcome(user, plan);
```

### 5. Membership Renewal
```typescript
const user: User = await UserModel.findById(userId);
const membership: UserMembership = await UserMembershipModel.findById(membershipId);
await EmailService.sendMembershipRenewalReminder(user, membership);
```

### 6. Password Reset
```typescript
const user: User = await UserModel.findByEmail(email);
const resetToken: string = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
await EmailService.sendPasswordReset(user, resetToken);
```

### 7. Loyalty Points
```typescript
const user: User = await UserModel.findById(userId);
await EmailService.sendLoyaltyPointsEarned(user, 150, orderId);
```

## Error Handling Pattern

**ALWAYS use try-catch and never fail the main operation:**

```typescript
try {
  await EmailService.sendOrderConfirmation(order);
} catch (error) {
  console.error('Failed to send email:', error);
  // Continue - don't throw
}
```

## Check Email Logs

```typescript
import { getRecentEmailLogs, getEmailStats } from '../utils/emailLogger';

// Get recent logs
const logs = await getRecentEmailLogs(50);

// Get statistics
const stats = await getEmailStats(7); // last 7 days
```

## Environment Variables

```bash
SENDGRID_API_KEY=SG.xxx          # Required for sending
FROM_EMAIL=orders@shop.com        # Sender email
EMAIL_FROM_NAME="Shop Name"       # Sender name
FRONTEND_URL=http://localhost:8890 # For links in emails
SHOP_NAME="Shop Name"             # Optional
SHOP_EMAIL=hello@shop.com         # Optional
```

## Mock Mode

If `SENDGRID_API_KEY` is not configured:
- Emails are logged to console
- Sends are recorded in database as "mock"
- No actual emails sent
- Perfect for development

## Common Patterns

### In Controllers (After Creating Resource)
```typescript
// Create resource first
const order = await OrderModel.create(orderData);

// Send email asynchronously
try {
  await EmailService.sendOrderConfirmation(order);
} catch (error) {
  console.error('Email error:', error);
}

// Return response
res.status(201).json({ order });
```

### On Status Change
```typescript
// Update status
const order = await OrderModel.updateStatus(id, 'ready');

// Send notification
if (status === 'ready') {
  try {
    const fullOrder = await OrderModel.getById(id);
    if (fullOrder) {
      await EmailService.sendOrderReady(fullOrder);
    }
  } catch (error) {
    console.error('Email error:', error);
  }
}
```

### With User Preferences (Future)
```typescript
const user = await UserModel.findById(userId);

// Check if user wants emails
if (user.email_notifications) {
  await EmailService.sendOrderReady(order);
}
```

## Testing

### Test Single Email
```typescript
// In your test file or script
const testOrder = {
  id: 123,
  guest_email: 'test@example.com',
  guest_name: 'Test User',
  total: 15.99,
  items: [/* ... */],
  // ... other fields
};

await EmailService.sendOrderConfirmation(testOrder);
```

### Check Console
Look for:
```
✅ Order confirmation email sent to test@example.com
```
or in mock mode:
```
📧 [MOCK] Order confirmation email would be sent to test@example.com
```

## Troubleshooting

### Email Not Sending
1. Check `SENDGRID_API_KEY` in .env
2. Verify API key starts with "SG."
3. Check console for error messages
4. Query email_logs table for failures

### Mock Mode When Not Expected
- Ensure SENDGRID_API_KEY is set
- Restart server after updating .env
- Check for initialization message in console

### Email Logs
```sql
-- Recent failures
SELECT * FROM email_logs
WHERE success = false
ORDER BY sent_at DESC
LIMIT 20;

-- Count by type
SELECT type, COUNT(*) as count
FROM email_logs
WHERE sent_at >= NOW() - INTERVAL '24 hours'
GROUP BY type;
```

## TypeScript Types

```typescript
import { OrderWithItems } from '../models/Order';
import { User } from '../models/User';
import { MembershipPlan } from '../models/MembershipPlan';
import { UserMembership } from '../models/UserMembership';

// All EmailService methods are async and return Promise<void>
```

## Best Practices

1. **Always use try-catch** around email sends
2. **Never fail operations** because email failed
3. **Log errors** for debugging
4. **Check email_logs** for delivery issues
5. **Test in mock mode** during development
6. **Monitor SendGrid quota** in production
7. **Respect user preferences** (when implemented)

## Need Help?

See full documentation: `backend/EMAIL_SETUP.md`
