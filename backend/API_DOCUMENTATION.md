# API Documentation - Study Room Booking System

Complete API reference for the Study Room Booking Backend.

## Base URL

```
http://localhost:5000/api
```

Production:

```
https://your-domain.com/api
```

## Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses follow a consistent JSON format:

### Success Response

```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details"
}
```

---

## Authentication Endpoints

### 1. Register User

```
POST /auth/register
```

**Description:** Create a new user account

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Error Cases:**

- 400: Missing required fields
- 400: Password mismatch
- 400: Password too short (< 6 characters)
- 400: User already exists

---

### 2. Login

```
POST /auth/login
```

**Description:** Authenticate user with email and password

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isTwoFactorEnabled": false,
    "createdAt": "2026-03-15T10:00:00Z",
    "updatedAt": "2026-03-15T10:05:00Z"
  }
}
```

**2FA Response (200 OK):**
If 2FA is enabled:

```json
{
  "success": true,
  "message": "OTP sent to email. Please verify to login.",
  "requiresOTP": true,
  "email": "john@example.com"
}
```

**Error Cases:**

- 400: Missing email or password
- 401: Invalid credentials
- 403: User account is inactive

---

### 3. Google OAuth Login

```
POST /auth/google-login
```

**Description:** Login or register using Google OAuth

**Request Body:**

```json
{
  "token": "google_id_token_from_frontend"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Google login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "googleId": "google_user_id",
    "createdAt": "2026-03-15T10:00:00Z"
  }
}
```

**Error Cases:**

- 400: Token is required
- 500: Invalid token

---

### 4. Refresh Access Token

```
POST /auth/refresh
```

**Description:** Get a new access token using refresh token

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "accessToken": "new_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Cases:**

- 400: Refresh token required
- 401: Invalid refresh token

---

### 5. Logout

```
POST /auth/logout
```

**Auth:** ✅ Required

**Description:** Logout user and invalidate refresh token

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 6. Forgot Password

```
POST /auth/forgot-password
```

**Description:** Send password reset email

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "If an account with this email exists, a password reset link has been sent"
}
```

**Note:** Response is same for existing and non-existing emails (security)

---

### 7. Reset Password

```
POST /auth/reset-password
```

**Description:** Reset password using reset token

**Request Body:**

```json
{
  "token": "reset_token_from_email_link",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Cases:**

- 400: Missing required fields
- 400: Passwords don't match
- 400: Password too short
- 400: Invalid or expired token

---

### 8. Enable Two-Factor Authentication

```
POST /auth/2fa/enable
```

**Auth:** ✅ Required

**Description:** Start 2FA setup process and get QR code

**Response (200 OK):**

```json
{
  "success": true,
  "message": "2FA setup initiated",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "secret": "JBSWY3DPEBLW64TMMQ======"
}
```

**Frontend Steps:**

1. Display QR code to user
2. User scans with authenticator app (Google Authenticator, Authy, etc.)
3. User enters OTP code
4. Call verify 2FA endpoint

---

### 9. Verify Two-Factor Authentication

```
POST /auth/2fa/verify
```

**Description:** Verify 2FA setup or login with OTP

**Request Body (Setup):**

```json
{
  "otp": "123456"
}
```

**Request Body (Login):**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "2FA verified successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    /* user data */
  }
}
```

**Error Cases:**

- 400: OTP required
- 401: Invalid or expired OTP

---

### 10. Disable Two-Factor Authentication

```
POST /auth/2fa/disable
```

**Auth:** ✅ Required

**Description:** Disable 2FA for account (requires password)

**Request Body:**

```json
{
  "password": "CurrentPassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

**Error Cases:**

- 400: Password required
- 401: Invalid password

---

## Audit Log Endpoints

### 1. Get All Audit Logs

```
GET /audit-logs?page=1&limit=20
```

**Auth:** ✅ Required | **Role:** Admin/Staff

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200 OK):**

```json
{
  "success": true,
  "count": 10,
  "total": 150,
  "pages": 15,
  "page": 1,
  "logs": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "LOGIN",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "status": "success",
      "createdAt": "2026-03-15T10:15:00Z"
    }
  ]
}
```

---

### 2. Search Audit Logs

```
GET /audit-logs/search?userId=507f1f77bcf86cd799439011&action=LOGIN&startDate=2026-03-01&endDate=2026-03-31
```

**Auth:** ✅ Required | **Role:** Admin/Staff

**Query Parameters:**

- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action (LOGIN, LOGOUT, REGISTER, PASSWORD_RESET, etc.)
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**

```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "pages": 5,
  "page": 1,
  "logs": [
    /* audit logs */
  ]
}
```

---

### 3. Get Audit Log by ID

```
GET /audit-logs/:id
```

**Auth:** ✅ Required | **Role:** Admin/Staff

**Response (200 OK):**

```json
{
  "success": true,
  "log": {
    /* audit log details */
  }
}
```

---

### 4. Delete Audit Log

```
DELETE /audit-logs/:id
```

**Auth:** ✅ Required | **Role:** Admin Only

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Audit log deleted successfully"
}
```

---

## Room Endpoints

### 1. Get All Rooms

```
GET /rooms?page=1&limit=10&capacity=4&location=Building%20A&minPrice=20&maxPrice=100
```

**Auth:** ❌ Not Required

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `capacity` (optional): Minimum capacity
- `location` (optional): Location search
- `minPrice` (optional): Minimum price per hour
- `maxPrice` (optional): Maximum price per hour

**Response (200 OK):**

```json
{
  "success": true,
  "count": 5,
  "total": 12,
  "pages": 3,
  "page": 1,
  "rooms": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Study Room A",
      "description": "Quiet study room",
      "capacity": 4,
      "location": "Building A, Floor 2",
      "amenities": ["WiFi", "AC", "Whiteboard"],
      "pricePerHour": 50,
      "availability": true,
      "rules": ["No food", "Follow silence policy"],
      "createdAt": "2026-03-15T10:00:00Z"
    }
  ]
}
```

---

### 2. Get Room by ID

```
GET /rooms/:id
```

**Auth:** ❌ Not Required

**Response (200 OK):**

```json
{
  "success": true,
  "room": {
    /* room details */
  }
}
```

---

### 3. Create Room

```
POST /rooms
```

**Auth:** ✅ Required | **Role:** Admin/Staff

**Request Body:**

```json
{
  "name": "Study Room A",
  "description": "Quiet study room for small groups",
  "capacity": 4,
  "location": "Building A, Floor 2",
  "amenities": ["WiFi", "AC", "Whiteboard", "Projector"],
  "pricePerHour": 50,
  "rules": ["No food", "Follow silence policy", "Return ID card on exit"],
  "image": "https://example.com/room-a.jpg"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Room created successfully",
  "room": {
    /* room details with _id */
  }
}
```

---

### 4. Update Room

```
PUT /rooms/:id
```

**Auth:** ✅ Required | **Role:** Admin/Staff

**Request Body:** (All fields optional)

```json
{
  "name": "Study Room A",
  "capacity": 5,
  "pricePerHour": 55,
  "availability": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Room updated successfully",
  "room": {
    /* updated room details */
  }
}
```

---

### 5. Delete Room

```
DELETE /rooms/:id
```

**Auth:** ✅ Required | **Role:** Admin Only

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Room deleted successfully"
}
```

---

## Booking Endpoints

### 1. Create Booking

```
POST /bookings
```

**Auth:** ✅ Required

**Request Body:**

```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "startTime": "2026-03-20T10:00:00Z",
  "endTime": "2026-03-20T12:00:00Z",
  "specialRequests": "Need projector and whiteboard markers",
  "participants": ["John Doe", "Jane Smith", "Bob Johnson"]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "roomId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Study Room A",
      "pricePerHour": 50
    },
    "startTime": "2026-03-20T10:00:00Z",
    "endTime": "2026-03-20T12:00:00Z",
    "totalPrice": 100,
    "status": "pending",
    "paymentStatus": "pending",
    "specialRequests": "Need projector and whiteboard markers",
    "participants": ["John Doe", "Jane Smith", "Bob Johnson"],
    "createdAt": "2026-03-15T10:30:00Z"
  }
}
```

**Error Cases:**

- 400: Missing required fields
- 400: End time not after start time
- 404: Room not found
- 400: Room not available for selected time slot

---

### 2. Get User Bookings

```
GET /bookings?page=1&limit=10&status=pending
```

**Auth:** ✅ Required

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled)

**Response (200 OK):**

```json
{
  "success": true,
  "count": 3,
  "total": 5,
  "pages": 1,
  "page": 1,
  "bookings": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "roomId": {
        /* room details */
      },
      "startTime": "2026-03-20T10:00:00Z",
      "endTime": "2026-03-20T12:00:00Z",
      "totalPrice": 100,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2026-03-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Booking by ID

```
GET /bookings/:id
```

**Auth:** ✅ Required (Own booking or Admin/Staff)

**Response (200 OK):**

```json
{
  "success": true,
  "booking": {
    /* booking details */
  }
}
```

---

### 4. Update Booking

```
PUT /bookings/:id
```

**Auth:** ✅ Required (Own booking or Admin/Staff)

**Request Body:**

```json
{
  "startTime": "2026-03-20T11:00:00Z",
  "endTime": "2026-03-20T13:00:00Z",
  "specialRequests": "Need projector",
  "participants": ["John Doe", "Jane Smith"],
  "status": "confirmed",
  "paymentStatus": "completed"
}
```

**Notes:**

- Users can only update time and special requests
- Admin/Staff can also update status and paymentStatus
- Price recalculated if time changes

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": {
    /* updated booking details */
  }
}
```

---

### 5. Cancel Booking

```
DELETE /bookings/:id
```

**Auth:** ✅ Required (Own booking or Admin/Staff)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

**Error Cases:**

- 404: Booking not found
- 403: Not authorized
- 400: Cannot cancel completed/cancelled booking

---

### 6. Get Room Bookings

```
GET /bookings/room/:roomId?startDate=2026-03-01&endDate=2026-03-31
```

**Auth:** ✅ Required | **Role:** Admin/Staff

**Query Parameters:**

- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**

```json
{
  "success": true,
  "count": 8,
  "total": 20,
  "pages": 3,
  "page": 1,
  "bookings": [
    /* bookings for room */
  ]
}
```

---

## HTTP Status Codes

| Code | Name         | Usage                                |
| ---- | ------------ | ------------------------------------ |
| 200  | OK           | Successful GET, PUT, DELETE          |
| 201  | Created      | Successful POST creating resource    |
| 400  | Bad Request  | Invalid input/validation error       |
| 401  | Unauthorized | Missing/invalid authentication       |
| 403  | Forbidden    | Authenticated but lacking permission |
| 404  | Not Found    | Resource doesn't exist               |
| 500  | Server Error | Backend error                        |

---

## Common Error Messages

```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

## Rate Limiting (Recommended)

Implement rate limiting for production:

- 3 login attempts per 15 minutes per IP
- 5 password reset requests per hour per email
- 100 requests per minute per user token

---

## Data Types

### DateTime Format

ISO 8601: `2026-03-15T10:00:00Z`

### ObjectId

MongoDB ObjectId: `507f1f77bcf86cd799439011`

### Enums

**User Roles:**

- `user` - Regular user
- `staff` - Staff member
- `admin` - Administrator

**Booking Status:**

- `pending` - Awaiting confirmation
- `confirmed` - Confirmed by admin
- `completed` - Booking completed
- `cancelled` - Booking cancelled

**Payment Status:**

- `pending` - Payment pending
- `completed` - Payment completed
- `failed` - Payment failed
- `refunded` - Payment refunded

**Audit Actions:**

- `LOGIN` - User login
- `LOGOUT` - User logout
- `REGISTER` - User registration
- `PASSWORD_RESET` - Password reset
- `2FA_ENABLE` - 2FA enabled
- `2FA_DISABLE` - 2FA disabled
- `GOOGLE_LOGIN` - Google OAuth login
- `REFRESH_TOKEN` - Token refresh

---

## Testing with Postman

1. Import the API endpoints
2. Set `{{baseUrl}}` variable to `http://localhost:5000/api`
3. Set `{{accessToken}}` after login
4. Set `{{refreshToken}}` after login
5. Use Authorization Bearer token in headers

### Login Request:

```
POST {{baseUrl}}/auth/login
Body: {
  "email": "test@example.com",
  "password": "password123"
}
```

### Save Tokens:

In Tests tab after login:

```javascript
var jsonData = pm.response.json();
pm.environment.set("accessToken", jsonData.accessToken);
pm.environment.set("refreshToken", jsonData.refreshToken);
```

---

## Frontend Integration Example

```javascript
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });
      localStorage.setItem("accessToken", data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

## Version History

- **v1.0.0** (March 15, 2026) - Initial release
  - Authentication & authorization
  - 2FA support
  - Booking system
  - Audit logging
  - Room management
