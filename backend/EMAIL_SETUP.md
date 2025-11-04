# Email Notification System Setup

This document explains how to set up and use the email notification system for BarrenGround Coffee.

## Overview

The email notification system sends automated emails for:
1. **Order Confirmation** - Sent when customer places order
2. **Order Ready** - Sent when order status changes to 'ready'
3. **Scheduled Order Reminder** - Sent before scheduled pickup time
4. **Membership Welcome** - Sent when user subscribes to membership
5. **Membership Renewal Reminder** - Sent before membership renews
6. **Password Reset** - Sent when user requests password reset
7. **Loyalty Points Earned** - Sent when significant points awarded (>=100)

## Setup Instructions

### 1. Sign Up for SendGrid

1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day)
3. Verify your sender email address
4. Create an API key with "Mail Send" permissions

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
FROM_EMAIL=orders@barrengroundcoffee.com
EMAIL_FROM_NAME="Barren Ground Coffee"
FRONTEND_URL=http://localhost:8890

# Optional: Shop information (uses defaults if not set)
SHOP_NAME="Barren Ground Coffee"
SHOP_EMAIL=hello@barrengroundcoffee.com
```

### 3. Run Database Migration

Create the email logging tables and add user preferences:

```bash
cd backend
npx ts-node src/scripts/createEmailTables.ts
```

This creates:
- `email_logs` table for tracking email sends
- `email_notifications` column on users table
- `marketing_emails` column on users table

### 4. Verify Setup

Start your backend server:

```bash
npm run dev
```

Look for this message in console:
```
✅ SendGrid email service initialized successfully
```

If SendGrid is not configured, you'll see:
```
⚠️  SendGrid is not configured. Email notifications will be logged only.
```

## Testing Emails

### Test Order Confirmation
```bash
# Place an order through the API
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "guest_email": "test@example.com",
    "guest_name": "Test User",
    "items": [...]
  }'
```

### Test Password Reset
```bash
# Request password reset
curl -X POST http://localhost:5000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Mock Mode (Development)

If SendGrid is not configured, emails will run in "mock mode":
- Email content is logged to console
- Email attempts are logged to database
- No actual emails are sent
- Perfect for development/testing without using email quota

## Email Templates

All email templates are in `src/templates/emailTemplates.ts` with:
- Responsive HTML design
- Mobile-friendly layout
- Consistent branding
- Professional styling

## Email Logging

All email sends are logged to the `email_logs` table:

```sql
SELECT * FROM email_logs
ORDER BY sent_at DESC
LIMIT 50;
```

View email statistics:
```sql
SELECT
  type,
  COUNT(*) as total_sent,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed
FROM email_logs
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY type;
```

## User Email Preferences

Users can opt out of emails via their account settings. Two preferences:

1. **email_notifications** (default: true)
   - Order confirmations, order ready, scheduled reminders
   - Essential transactional emails

2. **marketing_emails** (default: false)
   - Promotional content, newsletters
   - Marketing communications

Note: Password reset emails are always sent (security requirement).

## API Endpoints

### Password Reset Flow

**1. Request Reset:**
```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**2. Reset Password:**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

## Email Service Architecture

### EmailService Class
Located in `src/services/emailService.ts`:
- Handles all email sending logic
- Graceful error handling (never breaks app flow)
- Automatic logging of all sends
- Mock mode for development

### Email Templates
Located in `src/templates/emailTemplates.ts`:
- Reusable base template
- Individual templates for each email type
- Dynamic content rendering
- Mobile-responsive design

### Email Logger
Located in `src/utils/emailLogger.ts`:
- Logs every email attempt
- Tracks success/failure
- Records error messages
- Provides analytics queries

## Integration Points

### Order Flow
- **After order created**: Send confirmation email
- **Status changed to 'ready'**: Send ready notification
- Integrated in `src/controllers/orderController.ts`

### Membership Flow
- **After subscription created**: Send welcome email
- Integrated in `src/controllers/membershipController.ts`

### Auth Flow
- **Password reset requested**: Send reset link
- Integrated in `src/controllers/authController.ts`

### Loyalty Points
- **Significant points earned**: Send notification (>=100 points)
- Can be integrated in loyalty transaction model

## Error Handling

Email failures are handled gracefully:
```typescript
try {
  await EmailService.sendOrderConfirmation(order);
} catch (error) {
  console.error('Failed to send email:', error);
  // Order is still created - email failure doesn't break flow
}
```

## Production Considerations

### SendGrid Limits
- Free tier: 100 emails/day
- First paid tier: 40,000 emails/month for $19.95
- Monitor your usage in SendGrid dashboard

### Email Deliverability
1. **Verify your domain** for better deliverability
2. **Set up SPF/DKIM** records
3. **Monitor bounce rates** in SendGrid
4. **Keep email list clean** (remove invalid addresses)

### Rate Limiting
Password reset requests are rate-limited to prevent abuse:
- 5 requests per 15 minutes per IP
- Implemented in `src/middleware/rateLimiter.ts`

### Security
- Password reset tokens expire in 1 hour
- Tokens are JWT signed with JWT_SECRET
- User existence is never revealed
- All emails logged for audit trail

## Troubleshooting

### Emails Not Sending

1. **Check SendGrid API Key**
   ```bash
   echo $SENDGRID_API_KEY
   # Should start with "SG."
   ```

2. **Check Console Logs**
   - Look for "✅ SendGrid initialized"
   - Check for email send errors

3. **Verify Sender Email**
   - Must be verified in SendGrid dashboard
   - Domain verification recommended

4. **Check Email Logs**
   ```sql
   SELECT * FROM email_logs WHERE success = false ORDER BY sent_at DESC;
   ```

### Test Email Rendering

Use a service like [Litmus](https://litmus.com/) or [Email on Acid](https://www.emailonacid.com/) to test:
- Mobile rendering
- Email client compatibility
- Spam score

## Future Enhancements

Potential improvements:
- [ ] SMS notifications (Twilio integration)
- [ ] Push notifications
- [ ] Email template editor
- [ ] A/B testing
- [ ] Unsubscribe preferences page
- [ ] Email analytics dashboard
- [ ] Scheduled reminder jobs (cron)

## Support

For issues with the email system:
1. Check console logs for errors
2. Review email_logs table for failures
3. Verify SendGrid dashboard for API errors
4. Contact SendGrid support for delivery issues
