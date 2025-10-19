# NoobWriter Platform - API Documentation

## Authentication APIs

### Sign Up
```typescript
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}

Response: 201 Created
{
  "user": { ... },
  "session": { ... }
}
```

### Sign In
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": { ... },
  "session": { ... }
}
```

### OAuth (Google)
```typescript
GET /auth/google
Redirects to Google OAuth
```

## Payment APIs

### Create Coin Purchase Order
```typescript
POST /api/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "coinPackage": {
    "coins": 500,
    "price": 449,
    "bonus": 50
  },
  "userId": "uuid"
}

Response: 200 OK
{
  "order": {
    "id": "order_xxx",
    "amount": 44900,
    "currency": "INR",
    "receipt": "order_userid_timestamp"
  }
}
```

### Verify Payment
```typescript
PUT /api/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "userId": "uuid"
}

Response: 200 OK
{
  "success": true
}
```

### Razorpay Webhook
```typescript
POST /api/webhook/razorpay
X-Razorpay-Signature: <signature>
Content-Type: application/json

{
  "event": "payment.captured",
  "payload": { ... }
}

Response: 200 OK
{
  "status": "ok"
}
```

## Series APIs

### Get All Series
```typescript
GET /api/series?page=1&limit=20&genre=fantasy&contentType=novel

Response: 200 OK
{
  "series": [...],
  "total": 100,
  "page": 1,
  "hasMore": true
}
```

### Get Series by ID
```typescript
GET /api/series/:id

Response: 200 OK
{
  "id": "uuid",
  "title": "My Novel",
  "description": "...",
  "author": { ... },
  "chapters": [...],
  "stats": { ... }
}
```

### Create Series
```typescript
POST /api/series
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Novel",
  "description": "...",
  "contentType": "novel",
  "genres": ["fantasy", "adventure"],
  "tags": ["magic", "hero"]
}

Response: 201 Created
{
  "id": "uuid",
  "slug": "my-novel",
  ...
}
```

## Chapter APIs

### Get Chapter
```typescript
GET /api/series/:seriesId/chapters/:chapterId

Response: 200 OK
{
  "id": "uuid",
  "title": "Chapter 1",
  "content": "...",
  "isPremium": true,
  "coinPrice": 10,
  "isUnlocked": false
}
```

### Create Chapter
```typescript
POST /api/series/:seriesId/chapters
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Chapter 1",
  "content": "...",
  "isPremium": true,
  "coinPrice": 10,
  "scheduledAt": "2024-10-20T00:00:00Z"
}

Response: 201 Created
{ ... }
```

### Unlock Chapter
```typescript
POST /api/chapters/:id/unlock
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "remainingCoins": 490
}
```

## Wallet APIs

### Get Wallet Balance
```typescript
GET /api/wallet
Authorization: Bearer <token>

Response: 200 OK
{
  "coinBalance": 500,
  "totalEarned": 1000,
  "totalSpent": 500
}
```

### Get Transaction History
```typescript
GET /api/wallet/transactions?page=1&limit=20

Response: 200 OK
{
  "transactions": [...],
  "total": 50,
  "page": 1
}
```

## User APIs

### Get Profile
```typescript
GET /api/user/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "reader",
  ...
}
```

### Update Profile
```typescript
PATCH /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "Jane Doe",
  "bio": "I love reading!"
}

Response: 200 OK
{ ... }
```

### Get Reading Library
```typescript
GET /api/user/library?type=favorites

Response: 200 OK
{
  "series": [...],
  "total": 10
}
```

## Comment APIs

### Get Comments
```typescript
GET /api/chapters/:id/comments?page=1&limit=20

Response: 200 OK
{
  "comments": [...],
  "total": 100,
  "page": 1
}
```

### Create Comment
```typescript
POST /api/chapters/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great chapter!",
  "parentId": null
}

Response: 201 Created
{ ... }
```

## Rating APIs

### Rate Series
```typescript
POST /api/series/:id/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Amazing story!"
}

Response: 201 Created
{ ... }
```

## Error Responses

All APIs return standard error responses:

```typescript
Response: 400 Bad Request
{
  "error": "Invalid input data"
}

Response: 401 Unauthorized
{
  "error": "Authentication required"
}

Response: 403 Forbidden
{
  "error": "Insufficient permissions"
}

Response: 404 Not Found
{
  "error": "Resource not found"
}

Response: 500 Internal Server Error
{
  "error": "Server error occurred"
}
```

## Rate Limiting

- **Anonymous**: 100 requests per hour
- **Authenticated**: 1000 requests per hour
- **Writer/Admin**: 5000 requests per hour

## Pagination

All list endpoints support pagination:

```
?page=1&limit=20
```

Default: page=1, limit=20
Max limit: 100

## Filtering

Series and chapters support filtering:

```
?genre=fantasy&status=ongoing&contentType=novel
```

## Sorting

```
?sortBy=createdAt&order=desc
```

Options:
- `sortBy`: createdAt, updatedAt, views, rating, title
- `order`: asc, desc
