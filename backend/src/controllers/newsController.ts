import { Request, Response } from 'express';
import { NewsModel } from '../models/News';
import { body, validationResult } from 'express-validator';

export async function getAllNews(req: Request, res: Response): Promise<void> {
  try {
    const news = await NewsModel.findAll();
    res.json(news);
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getNewsItem(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid news ID' });
      return;
    }

    const news = await NewsModel.findById(id);

    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    res.json(news);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getActiveNews(req: Request, res: Response): Promise<void> {
  try {
    const news = await NewsModel.findActive();
    res.json(news);
  } catch (error) {
    console.error('Get active news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const createNewsValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('image_url').optional().trim().isURL().withMessage('Image URL must be valid'),
  body('active').optional().isBoolean(),
  body('priority').optional().isInt({ min: 0, max: 100 }).withMessage('Priority must be between 0 and 100'),
];

export async function createNews(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const news = await NewsModel.create(req.body);
    res.status(201).json(news);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const updateNewsValidation = [
  body('title').optional().trim().isLength({ min: 1 }),
  body('content').optional().trim().isLength({ min: 1 }),
  body('image_url').optional().trim().isURL(),
  body('active').optional().isBoolean(),
  body('priority').optional().isInt({ min: 0, max: 100 }),
];

export async function updateNews(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid news ID' });
      return;
    }

    const news = await NewsModel.update(id, req.body);

    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    res.json(news);
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const updateNewsActiveValidation = [
  body('active').isBoolean().withMessage('Active must be a boolean'),
];

export async function updateNewsActive(req: Request, res: Response): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid news ID' });
      return;
    }

    const { active } = req.body;
    const news = await NewsModel.updateActive(id, active);

    if (!news) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    res.json(news);
  } catch (error) {
    console.error('Update news active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteNews(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid news ID' });
      return;
    }

    const success = await NewsModel.delete(id);

    if (!success) {
      res.status(404).json({ error: 'News not found' });
      return;
    }

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
