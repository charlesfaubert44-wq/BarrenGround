# Promo & News API Reference

Quick reference guide for the Promo and News API endpoints.

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Promo API

### Get All Promos
**Endpoint:** `GET /api/promos`
**Auth:** Required
**Description:** Get all promotional banners (for employee dashboard)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Summer Special",
    "description": "20% off all drinks",
    "image_url": "https://example.com/promo.jpg",
    "link_url": "/menu",
    "active": true,
    "start_date": "2024-06-01T00:00:00Z",
    "end_date": "2024-08-31T23:59:59Z",
    "created_at": "2024-05-15T10:00:00Z",
    "updated_at": "2024-05-15T10:00:00Z"
  }
]
```

### Get Active Promos
**Endpoint:** `GET /api/promos/active`
**Auth:** Public (no auth required)
**Description:** Get currently active promos for customer display

**Response:** Same format as above, filtered by active status and date range

### Get Promo by ID
**Endpoint:** `GET /api/promos/:id`
**Auth:** Required

**Response:** Single promo object

### Create Promo
**Endpoint:** `POST /api/promos`
**Auth:** Required

**Request Body:**
```json
{
  "title": "Summer Special",
  "description": "20% off all drinks",
  "image_url": "https://example.com/promo.jpg",
  "link_url": "/menu",  // optional
  "active": true,
  "start_date": "2024-06-01T00:00:00Z",  // optional
  "end_date": "2024-08-31T23:59:59Z"  // optional
}
```

**Validation:**
- `title`: Required, non-empty string
- `description`: Required, non-empty string
- `image_url`: Required, valid URL
- `link_url`: Optional, must be valid URL if provided
- `active`: Optional, boolean
- `start_date`: Optional, ISO 8601 date
- `end_date`: Optional, ISO 8601 date

**Response:** Created promo object with 201 status

### Update Promo
**Endpoint:** `PUT /api/promos/:id`
**Auth:** Required

**Request Body:** Partial promo object (all fields optional)
```json
{
  "title": "Updated Title",
  "active": false
}
```

**Response:** Updated promo object

### Toggle Promo Active Status
**Endpoint:** `PUT /api/promos/:id/active`
**Auth:** Required

**Request Body:**
```json
{
  "active": true
}
```

**Response:** Updated promo object

### Delete Promo
**Endpoint:** `DELETE /api/promos/:id`
**Auth:** Required

**Response:**
```json
{
  "message": "Promo deleted successfully"
}
```

## News API

### Get All News
**Endpoint:** `GET /api/news`
**Auth:** Required
**Description:** Get all news items (for employee dashboard)

**Response:**
```json
[
  {
    "id": 1,
    "title": "New Menu Available",
    "content": "Check out our new seasonal drinks!",
    "image_url": "https://example.com/news.jpg",
    "active": true,
    "priority": 10,
    "created_at": "2024-05-15T10:00:00Z",
    "updated_at": "2024-05-15T10:00:00Z"
  }
]
```

### Get Active News
**Endpoint:** `GET /api/news/active`
**Auth:** Public (no auth required)
**Description:** Get active news for customer display

**Response:** Same format as above, filtered by active status, sorted by priority

### Get News by ID
**Endpoint:** `GET /api/news/:id`
**Auth:** Required

**Response:** Single news object

### Create News
**Endpoint:** `POST /api/news`
**Auth:** Required

**Request Body:**
```json
{
  "title": "New Menu Available",
  "content": "Check out our new seasonal drinks!",
  "image_url": "https://example.com/news.jpg",  // optional
  "active": true,
  "priority": 10  // optional, default 0
}
```

**Validation:**
- `title`: Required, non-empty string
- `content`: Required, non-empty string
- `image_url`: Optional, must be valid URL if provided
- `active`: Optional, boolean
- `priority`: Optional, integer 0-100

**Response:** Created news object with 201 status

### Update News
**Endpoint:** `PUT /api/news/:id`
**Auth:** Required

**Request Body:** Partial news object (all fields optional)
```json
{
  "title": "Updated Title",
  "priority": 20
}
```

**Response:** Updated news object

### Toggle News Active Status
**Endpoint:** `PUT /api/news/:id/active`
**Auth:** Required

**Request Body:**
```json
{
  "active": true
}
```

**Response:** Updated news object

### Delete News
**Endpoint:** `DELETE /api/news/:id`
**Auth:** Required

**Response:**
```json
{
  "message": "News deleted successfully"
}
```

## Error Responses

### 400 Bad Request
Invalid input or validation error
```json
{
  "error": "Invalid promo ID"
}
```

Or with validation details:
```json
{
  "errors": [
    {
      "msg": "Title is required",
      "param": "title",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
Missing authentication token
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
Invalid or expired token
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
Resource not found
```json
{
  "error": "Promo not found"
}
```

### 500 Internal Server Error
Server-side error
```json
{
  "error": "Internal server error"
}
```

## Notes

- All timestamps are in ISO 8601 format with timezone
- Active promos are filtered by date range (start_date and end_date)
- News items are sorted by priority (highest first), then by created_at (newest first)
- All protected endpoints require employee authentication
- Public endpoints (/active) can be accessed without authentication
