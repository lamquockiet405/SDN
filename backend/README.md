# Study Room Booking System - Backend API

A comprehensive RESTful API backend for a Study Room Booking System built with Node.js, Express, MongoDB, and implementing JWT authentication, OAuth, 2FA, and audit logging.

## Features

- ✅ **User Authentication**
  - Email/Password registration and login
  - Google OAuth 2.0 integration
  - JWT access tokens (15 minutes)
  - Refresh tokens (7 days)
  - Password reset functionality

- ✅ **Two-Factor Authentication (2FA)**
  - TOTP-based 2FA with QR code generation
  - OTP verification via email
  - Optional 2FA for enhanced security

- ✅ **Role-Based Access Control**
  - User, Staff, and Admin roles
  - Role-based route protection
  - Permission-based endpoints

- ✅ **Audit Logging**
  - Comprehensive audit trail for all user actions
  - Track login, logout, registration, password reset
  - Search and filter audit logs
  - IP address and user agent tracking

- ✅ **Study Room Management**
  - Create, read, update, delete rooms
  - Filter rooms by capacity, location, price
  - Room amenities and rules management

- ✅ **Booking System**
  - Create and manage room bookings
  - Conflict detection for overlapping bookings
  - Payment status tracking
  - Booking history and cancellations

- ✅ **Security**
  - Password hashing with bcryptjs
  - CORS enabled
  - Input validation
  - Error handling

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **speakeasy** - TOTP/OTP generation
- **google-auth-library** - Google OAuth
- **nodemailer** - Email sending
- **dotenv** - Environment variables

## Project Structure

```
src/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   ├── auth.controller.js       # Authentication logic
│   ├── audit.controller.js      # Audit log management
│   ├── room.controller.js       # Room management
│   └── booking.controller.js    # Booking management
├── middleware/
│   ├── auth.middleware.js       # JWT verification
│   └── role.middleware.js       # Role-based authorization
├── models/
│   ├── User.js            # User schema
│   ├── AuditLog.js        # Audit log schema
│   ├── Room.js            # Room schema
│   └── Booking.js         # Booking schema
├── routes/
│   ├── auth.routes.js     # Authentication endpoints
│   ├── audit.routes.js    # Audit log endpoints
│   ├── room.routes.js     # Room endpoints
│   └── booking.routes.js  # Booking endpoints
├── utils/
│   ├── generateToken.js   # JWT token generation
│   ├── otp.js             # OTP/2FA utilities
│   ├── email.js           # Email sending utilities
│   └── helpers.js         # Helper functions
└── server.js              # Express app and listening
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone and navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create .env file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` and update:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong random secret for JWT
   - `REFRESH_TOKEN_SECRET` - A strong random secret for refresh tokens
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
   - `GMAIL_USER` & `GMAIL_PASSWORD` - Gmail app password for sending emails
   - `FRONTEND_URL` - Your frontend URL (default: http://localhost:3000)

5. **Start development server**

   ```bash
   npm run dev
   ```

   Or production mode:

   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint           | Description               | Auth |
| ------ | ------------------ | ------------------------- | ---- |
| POST   | `/register`        | Register new user         | ❌   |
| POST   | `/login`           | User login                | ❌   |
| POST   | `/google-login`    | Google OAuth login        | ❌   |
| POST   | `/logout`          | User logout               | ✅   |
| POST   | `/refresh`         | Refresh access token      | ❌   |
| POST   | `/forgot-password` | Send password reset email | ❌   |
| POST   | `/reset-password`  | Reset password            | ❌   |
| POST   | `/2fa/enable`      | Enable 2FA                | ✅   |
| POST   | `/2fa/verify`      | Verify OTP/2FA code       | ❌   |
| POST   | `/2fa/disable`     | Disable 2FA               | ✅   |

### Audit Logs (`/api/audit-logs`)

| Method | Endpoint  | Description         | Auth | Role        |
| ------ | --------- | ------------------- | ---- | ----------- |
| GET    | `/`       | Get all audit logs  | ✅   | Admin/Staff |
| GET    | `/search` | Search audit logs   | ✅   | Admin/Staff |
| GET    | `/:id`    | Get audit log by ID | ✅   | Admin/Staff |
| DELETE | `/:id`    | Delete audit log    | ✅   | Admin       |

### Rooms (`/api/rooms`)

| Method | Endpoint | Description    | Auth | Role        |
| ------ | -------- | -------------- | ---- | ----------- |
| GET    | `/`      | Get all rooms  | ❌   | -           |
| GET    | `/:id`   | Get room by ID | ❌   | -           |
| POST   | `/`      | Create room    | ✅   | Admin/Staff |
| PUT    | `/:id`   | Update room    | ✅   | Admin/Staff |
| DELETE | `/:id`   | Delete room    | ✅   | Admin       |

### Bookings (`/api/bookings`)

| Method | Endpoint        | Description       | Auth | Role             |
| ------ | --------------- | ----------------- | ---- | ---------------- |
| POST   | `/`             | Create booking    | ✅   | User             |
| GET    | `/`             | Get user bookings | ✅   | User             |
| GET    | `/:id`          | Get booking by ID | ✅   | User/Admin/Staff |
| PUT    | `/:id`          | Update booking    | ✅   | User/Admin/Staff |
| DELETE | `/:id`          | Cancel booking    | ✅   | User/Admin/Staff |
| GET    | `/room/:roomId` | Get room bookings | ✅   | Admin/Staff      |

## Authentication

### Access Token

- Expires in: 15 minutes
- Sent in Authorization header: `Bearer <token>`

### Refresh Token

- Expires in: 7 days
- Used to obtain new access token without re-login

### Example Request with Authentication

```javascript
const config = {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
};
axios.get("/api/bookings", config);
```

## Request/Response Examples

### Register

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Login

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-03-15T10:00:00Z"
  }
}
```

### Create Booking

**Request:**

```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "startTime": "2026-03-20T10:00:00Z",
  "endTime": "2026-03-20T12:00:00Z",
  "specialRequests": "Need projector",
  "participants": ["John Doe", "Jane Smith"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "roomId": {...},
    "startTime": "2026-03-20T10:00:00Z",
    "endTime": "2026-03-20T12:00:00Z",
    "totalPrice": 100,
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2026-03-15T10:30:00Z"
  }
}
```

### Get Audit Logs

**Request:**

```
GET /api/audit-logs?page=1&limit=20
Headers: Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "count": 5,
  "total": 42,
  "pages": 9,
  "page": 1,
  "logs": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": {...},
      "action": "LOGIN",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "status": "success",
      "createdAt": "2026-03-15T10:15:00Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Room not found"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Error creating booking",
  "error": "Details about the error"
}
```

## Environment Setup Guide

### 1. MongoDB Setup

**Option 1: Local MongoDB**

```bash
# Install MongoDB
# Start MongoDB service
mongod

# Connection string in .env
MONGODB_URI=mongodb://localhost:27017/study-room-booking
```

**Option 2: MongoDB Atlas**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/study-room-booking
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs
6. Copy Client ID and Secret to `.env`

### 3. Gmail App Password

1. Enable 2-Step Verification on Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate app password for "Mail" and "Windows Computer"
4. Use this password in `.env` as `GMAIL_PASSWORD`

## Development

### Watch Mode

Auto-restart server on file changes:

```bash
npm run dev
```

### Testing API

Use tools like:

- **Postman** - GUI API testing
- **Insomnia** - REST API client
- **cURL** - Command-line tool
- **Axios** - JavaScript HTTP client (for frontend testing)

### Common Issues

**MongoDB Connection Error**

- Ensure MongoDB is running
- Check connection string in `.env`
- Verify credentials if using Atlas

**JWT Token Expired**

- Use refresh token to get new access token
- POST `/api/auth/refresh` with refresh token

**CORS Errors**

- Check `FRONTEND_URL` in `.env`
- Verify CORS middleware settings in `server.js`

**Email Not Sending**

- Enable "Less secure app access" if using regular Gmail
- Use Gmail App Password instead
- Check SMTP settings

## Security Recommendations

1. **Environment Variables**
   - Never commit `.env` to version control
   - Use `.env.example` as template
   - Use strong random values for secrets

2. **Database**
   - Use MongoDB Atlas or secure hosting
   - Enable authentication
   - Use IP whitelisting

3. **HTTPS**
   - Always use HTTPS in production
   - Implement SSL/TLS certificates

4. **Rate Limiting**
   - Implement rate limiting on sensitive endpoints
   - Use express-rate-limit package

5. **Input Validation**
   - Validate all user inputs
   - Use express-validator for schema validation

6. **Logging & Monitoring**
   - Implement comprehensive logging
   - Monitor failed login attempts
   - Track API usage

## Deployment

### Heroku

```bash
heroku login
heroku create your-app-name
git push heroku main
```

### AWS/GCP/Azure

Follow platform-specific deployment guides

### Environment Variables

Set production values for:

- JWT secrets (use strong random strings)
- Database URL (use managed service)
- OAuth credentials
- Email configuration
- Frontend URL

## Contributing

1. Create feature branch: `git checkout -b feature/AmazingFeature`
2. Commit changes: `git commit -m 'Add AmazingFeature'`
3. Push to branch: `git push origin feature/AmazingFeature`
4. Open Pull Request

## License

MIT License - feel free to use this project

## Support

For issues or questions:

- Check error messages and logs
- Review API documentation
- Check environment configuration
- Test with Postman/Insomnia first

## Future Enhancements

- [ ] Email verification for registration
- [ ] Password strength meter
- [ ] Session management
- [ ] WebSocket notifications for bookings
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] SMS OTP for 2FA
- [ ] Backup authentication methods
- [ ] Account recovery options
- [ ] User profile management
- [ ] Review and rating system
