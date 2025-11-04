# Testing Guide for Promo & News Backend

This guide will help you test the newly implemented Promo and News management backend.

## Prerequisites

1. Database migration completed (see MIGRATION_INSTRUCTIONS.md)
2. Backend server running
3. Employee dashboard running
4. Valid employee authentication token

## API Endpoints Overview

### Promo Endpoints

**Public Endpoints (No Authentication Required)**
- `GET /api/promos/active` - Get all active promos

**Protected Endpoints (Employee Only)**
- `GET /api/promos` - Get all promos
- `GET /api/promos/:id` - Get single promo by ID
- `POST /api/promos` - Create new promo
- `PUT /api/promos/:id` - Update promo
- `PUT /api/promos/:id/active` - Toggle promo active status
- `DELETE /api/promos/:id` - Delete promo

### News Endpoints

**Public Endpoints (No Authentication Required)**
- `GET /api/news/active` - Get all active news

**Protected Endpoints (Employee Only)**
- `GET /api/news` - Get all news
- `GET /api/news/:id` - Get single news by ID
- `POST /api/news` - Create news item
- `PUT /api/news/:id` - Update news item
- `PUT /api/news/:id/active` - Toggle news active status
- `DELETE /api/news/:id` - Delete news item

## Testing with Employee Dashboard

### Testing Promo Management

1. **Login as Employee**
   - Navigate to employee dashboard
   - Login with employee credentials

2. **View Promos**
   - Go to Promo Management page
   - Should see list of all promos (or empty state)

3. **Create New Promo**
   - Click "Add Promo" button
   - Fill in all required fields:
     - Title: "Summer Special 20% Off"
     - Description: "Get 20% off all coffee drinks this summer!"
     - Image URL: "https://example.com/summer-promo.jpg"
     - Link URL: "/menu" (optional)
     - Start Date: Select a date (optional)
     - End Date: Select a date (optional)
     - Active: Check the box
   - Click "Create Promo"
   - Should see success message and promo in list

4. **Edit Promo**
   - Click "Edit" on any promo
   - Modify some fields
   - Click "Update Promo"
   - Should see updated values

5. **Toggle Active Status**
   - Click "Deactivate" on an active promo
   - Should change to inactive
   - Click "Activate" to re-enable
   - Should change back to active

6. **Delete Promo**
   - Click "Delete" on a promo
   - Confirm deletion
   - Promo should be removed from list

### Testing News Management

1. **View News**
   - Go to News Management page
   - Should see list of all news items (or empty state)

2. **Create News Item**
   - Click "Add News" button
   - Fill in required fields:
     - Title: "New Winter Menu Available!"
     - Content: "Check out our new seasonal drinks and treats for winter."
     - Image URL: "https://example.com/winter-menu.jpg" (optional)
     - Priority: 10
     - Active: Check the box
   - Click "Create News"
   - Should see success message and news in list

3. **Edit News Item**
   - Click "Edit" on any news item
   - Modify content or priority
   - Click "Update News"
   - Should see updated values

4. **Toggle Active Status**
   - Click "Hide" on an active news item
   - Should change to inactive
   - Click "Show" to re-enable
   - Should change back to active

5. **Delete News Item**
   - Click "Delete" on a news item
   - Confirm deletion
   - News item should be removed from list

## Testing with API Client (Postman/Insomnia/curl)

### 1. Get Authentication Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@barrenground.com",
    "password": "your_password"
  }'
```

Save the token from the response.

### 2. Test Promo Endpoints

**Create Promo**
```bash
curl -X POST http://localhost:3000/api/promos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Promo",
    "description": "This is a test promotional banner",
    "image_url": "https://example.com/test.jpg",
    "link_url": "/menu",
    "active": true,
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z"
  }'
```

**Get All Promos**
```bash
curl http://localhost:3000/api/promos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Active Promos (Public)**
```bash
curl http://localhost:3000/api/promos/active
```

**Update Promo**
```bash
curl -X PUT http://localhost:3000/api/promos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Title",
    "active": false
  }'
```

**Toggle Active Status**
```bash
curl -X PUT http://localhost:3000/api/promos/1/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "active": true
  }'
```

**Delete Promo**
```bash
curl -X DELETE http://localhost:3000/api/promos/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test News Endpoints

**Create News**
```bash
curl -X POST http://localhost:3000/api/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test News",
    "content": "This is a test news announcement",
    "image_url": "https://example.com/news.jpg",
    "active": true,
    "priority": 10
  }'
```

**Get All News**
```bash
curl http://localhost:3000/api/news \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Active News (Public)**
```bash
curl http://localhost:3000/api/news/active
```

**Update News**
```bash
curl -X PUT http://localhost:3000/api/news/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated News Title",
    "priority": 20
  }'
```

**Toggle Active Status**
```bash
curl -X PUT http://localhost:3000/api/news/1/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "active": false
  }'
```

**Delete News**
```bash
curl -X DELETE http://localhost:3000/api/news/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expected Behaviors

### Authorization
- Public endpoints should work without authentication
- Protected endpoints should return 401 if no token provided
- Protected endpoints should return 403 if token is invalid

### Validation
- Creating/updating with missing required fields should return 400 with error details
- Invalid URLs should be rejected with validation error
- Invalid date formats should be rejected

### Active Promo Logic
- Only promos where:
  - `active = true`
  - `start_date` is NULL or in the past
  - `end_date` is NULL or in the future
- Should be returned by `/api/promos/active`

### News Priority
- News items should be ordered by priority (highest first)
- Then by creation date (newest first)

## Common Issues and Solutions

### Issue: 404 Not Found on /api/promos
**Solution**: Make sure backend server is running and routes are registered in server.ts

### Issue: 401 Unauthorized
**Solution**: Check that you're including the Authorization header with a valid token

### Issue: 500 Internal Server Error
**Solution**: Check backend logs for database connection issues or SQL errors

### Issue: Tables don't exist
**Solution**: Run the database migration script (see MIGRATION_INSTRUCTIONS.md)

### Issue: Frontend can't connect to backend
**Solution**: Check CORS settings in server.ts match your frontend URLs

## Success Criteria Checklist

- [ ] Database tables created successfully
- [ ] Can view all promos in employee dashboard
- [ ] Can create new promos
- [ ] Can edit existing promos
- [ ] Can toggle promo active status
- [ ] Can delete promos
- [ ] Can view all news in employee dashboard
- [ ] Can create new news items
- [ ] Can edit existing news
- [ ] Can toggle news active status
- [ ] Can delete news items
- [ ] Public endpoints work without authentication
- [ ] Protected endpoints require authentication
- [ ] Validation errors display properly
- [ ] Active promos display correctly based on date range
- [ ] News items sort by priority
