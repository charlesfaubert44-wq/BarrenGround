# Complete Promo & News Backend Implementation

**Priority:** 🔴 CRITICAL
**Phase:** 1 - Critical Fixes
**Estimated Time:** 4-6 hours
**Status:** pending

## Description
Frontend UI exists for Promo and News management in the employee dashboard, but the backend API is completely missing. This causes the frontend to fail when attempting CRUD operations.

## Current State
- ✅ Frontend: `employee-dashboard/src/pages/PromoManagementPage.tsx` (exists)
- ✅ Frontend: `employee-dashboard/src/pages/NewsManagementPage.tsx` (exists)
- ❌ Backend: No database tables
- ❌ Backend: No models
- ❌ Backend: No controllers
- ❌ Backend: No routes

## Tasks

### 1. Create Database Tables
- [ ] Create `backend/src/config/schema-promos.sql`
  ```sql
  CREATE TABLE promos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50), -- 'percentage', 'fixed', 'bogo'
    discount_value DECIMAL(10,2),
    code VARCHAR(50) UNIQUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    min_order_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url VARCHAR(500),
    author VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_promos_active ON promos(is_active, start_date, end_date);
  CREATE INDEX idx_promos_code ON promos(code);
  CREATE INDEX idx_news_published ON news(is_published, published_at);
  ```
- [ ] Run migration: `psql -U postgres -d barrenground -f backend/src/config/schema-promos.sql`

### 2. Create Models
- [ ] Create `backend/src/models/Promo.ts`
  - `findAll()` - Get all promos
  - `findById(id)` - Get single promo
  - `findByCode(code)` - Find promo by code
  - `findActive()` - Get active promos only
  - `create(data)` - Create new promo
  - `update(id, data)` - Update promo
  - `delete(id)` - Delete promo
  - `incrementUses(id)` - Increment usage counter
  - `validatePromo(code, orderTotal)` - Validate promo code

- [ ] Create `backend/src/models/News.ts`
  - `findAll(published_only?)` - Get all news
  - `findById(id)` - Get single news item
  - `findPublished()` - Get published news only
  - `create(data)` - Create news item
  - `update(id, data)` - Update news item
  - `delete(id)` - Delete news item
  - `publish(id)` - Publish news item
  - `unpublish(id)` - Unpublish news item

### 3. Create Controllers
- [ ] Create `backend/src/controllers/promoController.ts`
  - `getAllPromos` - GET /api/promos
  - `getPromo` - GET /api/promos/:id
  - `getActivePromos` - GET /api/promos/active
  - `validatePromoCode` - POST /api/promos/validate
  - `createPromo` - POST /api/promos (employee only)
  - `updatePromo` - PUT /api/promos/:id (employee only)
  - `deletePromo` - DELETE /api/promos/:id (employee only)

- [ ] Create `backend/src/controllers/newsController.ts`
  - `getAllNews` - GET /api/news (employee sees all, public sees published)
  - `getNewsItem` - GET /api/news/:id
  - `getPublishedNews` - GET /api/news/published
  - `createNews` - POST /api/news (employee only)
  - `updateNews` - PUT /api/news/:id (employee only)
  - `deleteNews` - DELETE /api/news/:id (employee only)
  - `publishNews` - PUT /api/news/:id/publish (employee only)

### 4. Create Routes
- [ ] Create `backend/src/routes/promoRoutes.ts`
  ```typescript
  import { Router } from 'express';
  import * as promoController from '../controllers/promoController';
  import { authenticateToken, optionalAuth } from '../middleware/auth';

  const router = Router();

  // Public routes
  router.get('/active', promoController.getActivePromos);
  router.post('/validate', promoController.validatePromoCode);

  // Employee routes
  router.get('/', authenticateToken, promoController.getAllPromos);
  router.get('/:id', authenticateToken, promoController.getPromo);
  router.post('/', authenticateToken, promoController.createPromo);
  router.put('/:id', authenticateToken, promoController.updatePromo);
  router.delete('/:id', authenticateToken, promoController.deletePromo);

  export default router;
  ```

- [ ] Create `backend/src/routes/newsRoutes.ts` (similar structure)

### 5. Register Routes in Server
- [ ] Update `backend/src/server.ts`
  ```typescript
  import promoRoutes from './routes/promoRoutes';
  import newsRoutes from './routes/newsRoutes';

  app.use('/api/promos', promoRoutes);
  app.use('/api/news', newsRoutes);
  ```

### 6. Update Frontend API Calls
- [ ] Verify `employee-dashboard/src/pages/PromoManagementPage.tsx` API calls match backend
- [ ] Verify `employee-dashboard/src/pages/NewsManagementPage.tsx` API calls match backend
- [ ] Add error handling for failed API calls
- [ ] Add loading states

### 7. Testing
- [ ] Test promo CRUD operations in employee dashboard
- [ ] Test news CRUD operations in employee dashboard
- [ ] Test promo code validation at customer checkout
- [ ] Test published news display on customer frontend
- [ ] Test authorization (only employees can manage)

## Success Criteria
- [x] Database tables created and migrated
- [x] All CRUD endpoints functional
- [x] Employee dashboard can manage promos/news
- [x] Promo codes work at checkout
- [x] Published news displays on customer site
- [x] Authorization properly enforced

## Files to Create
- `backend/src/config/schema-promos.sql`
- `backend/src/models/Promo.ts`
- `backend/src/models/News.ts`
- `backend/src/controllers/promoController.ts`
- `backend/src/controllers/newsController.ts`
- `backend/src/routes/promoRoutes.ts`
- `backend/src/routes/newsRoutes.ts`

## Files to Modify
- `backend/src/server.ts` (register routes)
- `employee-dashboard/src/pages/PromoManagementPage.tsx` (verify API calls)
- `employee-dashboard/src/pages/NewsManagementPage.tsx` (verify API calls)

## Dependencies
- None (can be done immediately)

## Notes
- Consider adding promo usage tracking table for analytics
- News could have categories/tags for better organization
- Image upload functionality not included (using URLs for now)
