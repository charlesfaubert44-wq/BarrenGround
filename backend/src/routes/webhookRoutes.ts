import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';
import express from 'express';

const router = Router();

// Stripe webhooks need raw body
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
