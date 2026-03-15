# API Endpoints Documentation

This document outlines all the API endpoints expected by the Study Room Booking Dashboard frontend.

## Base URL

All endpoints are relative to:

```
BASE_URL = http://localhost:3001/api
```

Configure this in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Authentication Endpoints

### POST /auth/login

Login with email and password.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response: 200 OK**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Error: 401 Unauthorized**

```json
{
  "message": "Invalid email or password"
}
```

---

### POST /auth/register

Create a new user account.

**Request:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response: 201 Created**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user456",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "user",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

**Error: 400 Bad Request**

```json
{
  "message": "Email already exists"
}
```

---

### POST /auth/logout

Logout the current user.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "message": "Logged out successfully"
}
```

---

### POST /auth/refresh

Refresh the access token using refresh token.

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response: 200 OK**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### GET /auth/me

Get current logged-in user information.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "id": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

**Error: 401 Unauthorized**

```json
{
  "message": "Invalid token"
}
```

---

## Room Endpoints

### GET /rooms

List all rooms with pagination and filtering.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `capacity` (optional): Minimum capacity
- `search` (optional): Search term

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "rooms": [
    {
      "id": "room1",
      "name": "Meeting Room A",
      "capacity": 8,
      "description": "Perfect for team meetings",
      "image": "https://example.com/room1.jpg",
      "equipment": ["Projector", "Whiteboard", "Video Conference"],
      "rating": 4.8,
      "pricePerHour": 50,
      "floor": 2,
      "isAvailable": true
    }
  ],
  "total": 25
}
```

---

### GET /rooms/{id}

Get single room details.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "id": "room1",
  "name": "Meeting Room A",
  "capacity": 8,
  "description": "Perfect for team meetings",
  "image": "https://example.com/room1.jpg",
  "equipment": ["Projector", "Whiteboard", "Video Conference"],
  "rating": 4.8,
  "pricePerHour": 50,
  "floor": 2,
  "isAvailable": true
}
```

---

### GET /rooms/{id}/availability

Get room availability for a specific date.

**Query Parameters:**

- `date`: Date in YYYY-MM-DD format

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "roomId": "room1",
  "date": "2024-03-25",
  "timeSlots": [
    {
      "id": "slot1",
      "startTime": "09:00",
      "endTime": "10:00",
      "status": "available"
    },
    {
      "id": "slot2",
      "startTime": "10:00",
      "endTime": "11:00",
      "status": "booked",
      "userId": "user456"
    }
  ]
}
```

---

### GET /rooms/{id}/check-availability

Check if a specific time slot is available.

**Query Parameters:**

- `startTime`: Start time in ISO format
- `endTime`: End time in ISO format

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "available": true
}
```

---

### GET /rooms/search

Search rooms by name or description.

**Query Parameters:**

- `q`: Search query

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
[
  {
    "id": "room1",
    "name": "Meeting Room A",
    "capacity": 8,
    "description": "Perfect for team meetings",
    "rating": 4.8,
    "pricePerHour": 50,
    "floor": 2,
    "isAvailable": true
  }
]
```

---

## Booking Endpoints

### GET /bookings

List all bookings with filtering.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): confirmed, pending, completed, cancelled
- `roomId` (optional): Filter by room

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "bookings": [
    {
      "id": "booking1",
      "userId": "user123",
      "roomId": "room1",
      "roomName": "Meeting Room A",
      "startTime": "2024-03-25 10:00",
      "endTime": "2024-03-25 12:00",
      "status": "confirmed",
      "totalPrice": 100,
      "createdAt": "2024-03-20T10:00:00Z",
      "paymentStatus": "paid"
    }
  ],
  "total": 10
}
```

---

### GET /bookings/{id}

Get booking details.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "id": "booking1",
  "userId": "user123",
  "roomId": "room1",
  "roomName": "Meeting Room A",
  "startTime": "2024-03-25 10:00",
  "endTime": "2024-03-25 12:00",
  "status": "confirmed",
  "totalPrice": 100,
  "createdAt": "2024-03-20T10:00:00Z",
  "paymentStatus": "paid"
}
```

---

### POST /bookings

Create a new booking.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request:**

```json
{
  "roomId": "room1",
  "startTime": "2024-03-25T10:00:00Z",
  "endTime": "2024-03-25T12:00:00Z"
}
```

**Response: 201 Created**

```json
{
  "id": "booking2",
  "userId": "user123",
  "roomId": "room1",
  "roomName": "Meeting Room A",
  "startTime": "2024-03-25 10:00",
  "endTime": "2024-03-25 12:00",
  "status": "pending",
  "totalPrice": 100,
  "createdAt": "2024-03-20T11:00:00Z",
  "paymentStatus": "pending"
}
```

---

### POST /bookings/{id}/cancel

Cancel a booking.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "message": "Booking cancelled successfully",
  "booking": {
    "id": "booking1",
    "status": "cancelled"
  }
}
```

---

### GET /bookings/stats

Get booking statistics.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "totalBookings": 156,
  "bookingsToday": 12,
  "totalRevenue": 4200,
  "averageRating": 4.8
}
```

---

### GET /bookings/my-bookings

Get logged-in user's bookings.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "bookings": [
    {
      "id": "booking1",
      "userId": "user123",
      "roomId": "room1",
      "roomName": "Meeting Room A",
      "startTime": "2024-03-25 10:00",
      "endTime": "2024-03-25 12:00",
      "status": "confirmed",
      "totalPrice": 100,
      "createdAt": "2024-03-20T10:00:00Z",
      "paymentStatus": "paid"
    }
  ],
  "total": 5
}
```

---

### GET /bookings/history

Get booking history.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
[
  {
    "id": "booking1",
    "userId": "user123",
    "roomId": "room1",
    "roomName": "Meeting Room A",
    "startTime": "2024-03-25 10:00",
    "endTime": "2024-03-25 12:00",
    "status": "completed",
    "totalPrice": 100,
    "createdAt": "2024-03-20T10:00:00Z",
    "paymentStatus": "paid"
  }
]
```

---

## Payment Endpoints

### POST /payments

Process a payment.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Request:**

```json
{
  "bookingId": "booking1",
  "amount": 100
}
```

**Response: 201 Created**

```json
{
  "id": "pay1",
  "bookingId": "booking1",
  "amount": 100,
  "status": "completed",
  "transactionId": "TXN001",
  "createdAt": "2024-03-20T10:00:00Z"
}
```

---

### GET /payments

List all payments.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
[
  {
    "id": "pay1",
    "bookingId": "booking1",
    "amount": 100,
    "status": "completed",
    "transactionId": "TXN001",
    "createdAt": "2024-03-20T10:00:00Z"
  }
]
```

---

### GET /payments/{id}

Get payment details.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "id": "pay1",
  "bookingId": "booking1",
  "amount": 100,
  "status": "completed",
  "transactionId": "TXN001",
  "createdAt": "2024-03-20T10:00:00Z"
}
```

---

### POST /payments/{id}/refund

Refund a payment.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Response: 200 OK**

```json
{
  "id": "pay1",
  "bookingId": "booking1",
  "amount": 100,
  "status": "refunded",
  "transactionId": "TXN001",
  "createdAt": "2024-03-20T10:00:00Z"
}
```

---

## Error Responses

All endpoints may return the following errors:

### 400 Bad Request

Invalid request format or parameters.

```json
{
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized

Missing or invalid authentication token.

```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

User doesn't have permission to access this resource.

```json
{
  "message": "Access denied"
}
```

### 404 Not Found

Resource not found.

```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error

Server error occurred.

```json
{
  "message": "Internal server error"
}
```

---

## Headers

All requests (except login/register) should include:

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

---

## Implementation Notes

1. **Token Format**: JWT tokens should be Bearer tokens in Authorization header
2. **Date Format**: Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) for timestamps
3. **Pagination**: Default to page 1 and limit 10 if not provided
4. **CORS**: Enable CORS on your backend for http://localhost:3000
5. **Token Refresh**: On 401, automatically refresh token using /auth/refresh
6. **Rate Limiting**: Consider implementing rate limiting (optional)
7. **Caching**: Consider caching room data for better performance

---

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get rooms with token
curl -X GET http://localhost:3001/api/rooms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create booking
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "roomId":"room1",
    "startTime":"2024-03-25T10:00:00Z",
    "endTime":"2024-03-25T12:00:00Z"
  }'
```

---

## Frontend Integration

All API calls are handled through service files in `services/`:

- `authService.ts` - Authentication
- `roomService.ts` - Room management
- `bookingService.ts` - Booking management
- `paymentService.ts` - Payment management

Axios interceptors automatically handle:

- Adding Authorization headers
- Token refresh on 401
- Request/response transformation
