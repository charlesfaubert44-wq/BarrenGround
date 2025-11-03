import { Request, Response } from 'express';
import { MenuItemModel } from '../models/MenuItem';
import { body, validationResult } from 'express-validator';

export async function getAllMenuItems(req: Request, res: Response): Promise<void> {
  try {
    const availableOnly = req.query.available === 'true';

    const items = availableOnly
      ? await MenuItemModel.getAvailable()
      : await MenuItemModel.getAll();

    res.json(items);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMenuItem(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid menu item ID' });
      return;
    }

    const item = await MenuItemModel.getById(id);

    if (!item) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.json(item);
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const updateAvailabilityValidation = [
  body('available').isBoolean(),
];

export async function updateMenuItemAvailability(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid menu item ID' });
      return;
    }

    const { available } = req.body;

    const item = await MenuItemModel.updateAvailability(id, available);

    if (!item) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.json(item);
  } catch (error) {
    console.error('Update menu item availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const createMenuItemValidation = [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('category').trim().isLength({ min: 1 }),
  body('image_url').optional().isURL(),
  body('available').optional().isBoolean(),
];

export async function createMenuItem(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const item = await MenuItemModel.create(req.body);

    res.status(201).json(item);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateMenuItem(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid menu item ID' });
      return;
    }

    const item = await MenuItemModel.update(id, req.body);

    if (!item) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.json(item);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteMenuItem(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid menu item ID' });
      return;
    }

    const success = await MenuItemModel.delete(id);

    if (!success) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
