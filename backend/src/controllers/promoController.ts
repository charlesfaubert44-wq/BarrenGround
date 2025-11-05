import { Request, Response } from 'express';
import { PromoModel } from '../models/Promo';
import { body, validationResult } from 'express-validator';

export async function getAllPromos(req: Request, res: Response): Promise<void> {
  try {
    const promos = await PromoModel.findAll(req.shop!.id);
    res.json(promos);
  } catch (error) {
    console.error('Get all promos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPromo(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid promo ID' });
      return;
    }

    const promo = await PromoModel.findById(id, req.shop!.id);

    if (!promo) {
      res.status(404).json({ error: 'Promo not found' });
      return;
    }

    res.json(promo);
  } catch (error) {
    console.error('Get promo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getActivePromos(req: Request, res: Response): Promise<void> {
  try {
    const promos = await PromoModel.findActive(req.shop!.id);
    res.json(promos);
  } catch (error) {
    console.error('Get active promos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const createPromoValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('image_url').trim().isURL().withMessage('Valid image URL is required'),
  body('link_url').optional().trim().isURL().withMessage('Link URL must be valid'),
  body('active').optional().isBoolean(),
  body('start_date').optional().isISO8601().withMessage('Start date must be valid'),
  body('end_date').optional().isISO8601().withMessage('End date must be valid'),
];

export async function createPromo(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const promo = await PromoModel.create(req.body);
    res.status(201).json(promo);
  } catch (error) {
    console.error('Create promo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const updatePromoValidation = [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('image_url').optional().trim().isURL(),
  body('link_url').optional().trim().isURL(),
  body('active').optional().isBoolean(),
  body('start_date').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
];

export async function updatePromo(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid promo ID' });
      return;
    }

    const promo = await PromoModel.update(id, req.body, req.shop!.id);

    if (!promo) {
      res.status(404).json({ error: 'Promo not found' });
      return;
    }

    res.json(promo);
  } catch (error) {
    console.error('Update promo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const updatePromoActiveValidation = [
  body('active').isBoolean().withMessage('Active must be a boolean'),
];

export async function updatePromoActive(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid promo ID' });
      return;
    }

    const { active } = req.body;
    const promo = await PromoModel.updateActive(id, active, req.shop!.id);

    if (!promo) {
      res.status(404).json({ error: 'Promo not found' });
      return;
    }

    res.json(promo);
  } catch (error) {
    console.error('Update promo active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deletePromo(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid promo ID' });
      return;
    }

    const success = await PromoModel.delete(id, req.shop!.id);

    if (!success) {
      res.status(404).json({ error: 'Promo not found' });
      return;
    }

    res.json({ message: 'Promo deleted successfully' });
  } catch (error) {
    console.error('Delete promo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
