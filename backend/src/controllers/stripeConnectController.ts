import { Request, Response } from 'express';
import { createConnectAccountLink } from '../services/stripeConnect';

export async function createOnboardingLink(req: Request, res: Response): Promise<void> {
  try {
    if (!req.shop) {
      res.status(500).json({ error: 'Shop context not found' });
      return;
    }

    // Only admins can access
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const url = await createConnectAccountLink(req.shop);

    if (!url) {
      res.status(500).json({ error: 'Failed to create onboarding link' });
      return;
    }

    res.json({ url });
  } catch (error) {
    console.error('Create onboarding link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
