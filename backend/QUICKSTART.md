# Quick Start Guide - Study Room Booking Backend

Get your backend running in 5 minutes!

## Prerequisites

- Node.js v14+ installed
- MongoDB running locally or MongoDB Atlas account
- Git

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/study-room-booking
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars_very_random
JWT_EXPIRE=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_minimum_32_chars_very_random
REFRESH_TOKEN_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_specific_password
OTP_EXPIRY=5m
FRONTEND_URL=http://localhost:3000
```

## Step 3: Start MongoDB

### Option A: Local MongoDB

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Option B: MongoDB Atlas (Cloud)

Skip this if using local MongoDB. Connection string included in .env

## Step 4: Start the Server

Development (with auto-restart):

```bash
npm run dev
```

Production:

```bash
npm start
```

You should see:

```
Server running on port 5000
Environment: development
MongoDB Connected: localhost
```

## Step 5: Test the API

### Health Check

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-03-15T10:00:00Z"
}
```

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

Response will include `accessToken` and `refreshToken`.

### Get Rooms (No Auth Required)

```bash
curl http://localhost:5000/api/rooms
```

### Create Room (Auth Required)

```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Study Room A",
    "description": "Quiet room for 4 people",
    "capacity": 4,
    "location": "Building A, Floor 2",
    "amenities": ["WiFi", "AC"],
    "pricePerHour": 50,
    "rules": ["No food", "Silence required"]
  }'
```

## Recommended Tools for Testing

### 1. Postman

- Import API collection
- Set environment variables
- Test all endpoints

### 2. Insomnia

- REST API client
- Built-in auth support
- Good for development

### 3. VS Code REST Client

Install extension: `REST Client`
Create `requests.http` file:

```
### Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js    # Auth logic
│   │   ├── audit.controller.js   # Audit logs
│   │   ├── room.controller.js    # Room management
│   │   └── booking.controller.js # Bookings
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── role.middleware.js    # Role authorization
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── AuditLog.js           # Audit log schema
│   │   ├── Room.js               # Room schema
│   │   └── Booking.js            # Booking schema
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoints
│   │   ├── audit.routes.js       # Audit endpoints
│   │   ├── room.routes.js        # Room endpoints
│   │   └── booking.routes.js     # Booking endpoints
│   ├── utils/
│   │   ├── generateToken.js      # JWT utilities
│   │   ├── otp.js                # OTP/2FA utilities
│   │   ├── email.js              # Email utilities
│   │   └── helpers.js            # Helper functions
│   └── server.js                 # Main app file
├── .env                          # Environment variables
├── .env.example                  # Example env
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── README.md                     # Full documentation
└── API_DOCUMENTATION.md          # API reference
```

## Common Issues & Solutions

### MongoDB Connection Error

```
Error connecting to MongoDB: connect ECONNREFUSED
```

**Solution:**

- Ensure MongoDB is running
- Check connection string in .env
- If using MongoDB Atlas, update MONGODB_URI with cluster URL

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution:**

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or use different port
PORT=5001 npm run dev
```

### Module Not Found

```
Error: Cannot find module 'express'
```

**Solution:**

```bash
npm install
# or delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### JWT Token Expired

When accessing protected route:

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Solution:**

- Use your refreshToken to get new accessToken
- POST to /api/auth/refresh with refreshToken

### CORS Error

```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin
'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**

- Update FRONTEND_URL in .env to match your frontend URL
- Restart server

### Email Not Sending

2FA or password reset emails not arriving
**Solution:**

- Use Gmail App Password (not regular password)
- Enable "Less secure app access" if using regular Gmail
- Check GMAIL_USER and GMAIL_PASSWORD in .env
- Check spam folder

## Next Steps

1. **Create sample data:**
   - Create 3-4 study rooms
   - Make some test bookings
   - Check audit logs

2. **Test authentication:**
   - Register a user
   - Login and save tokens
   - Access protected routes
   - Test token refresh

3. **Test 2FA:**
   - Enable 2FA on your account
   - Scan QR code with Google Authenticator
   - Verify OTP code

4. **Connect Frontend:**
   - Update frontend API URL to http://localhost:5000/api
   - Import API endpoints
   - Test full flow from frontend

## Database Reset

To start fresh:

```bash
# Connect to MongoDB
mongosh

# Select database
use study-room-booking

# Drop all collections
db.dropDatabase()

# Exit
exit
```

Or via MongoDB Compass:

1. Open MongoDB Compass
2. Connect to your database
3. Right-click database → Delete Database

## Environment-Specific Configuration

### Development

```
NODE_ENV=development
DEBUG=true
```

### Production

```
NODE_ENV=production
MONGODB_URI=<production_atlas_uri>
JWT_SECRET=<long_random_secret>
FRONTEND_URL=https://yourdomain.com
```

## Folder Structure Details

### src/config/

Database and external service configurations

### src/controllers/

Business logic for each feature:

- Request validation
- Database operations
- Response formatting

### src/middleware/

Function wrappers that run before controllers:

- Authentication check
- Authorization/roles
- Error handling
- Logging & monitoring

### src/models/

MongoDB schema definitions using Mongoose:

- Data validation
- Default values
- Pre/post hooks
- Custom methods

### src/routes/

API endpoint definitions:

- HTTP methods and paths
- Controller mappings
- Middleware connections

### src/utils/

Helper functions used across controllers:

- Token generation
- Email sending
- OTP verification
- Common utilities

## API Base URL

Development:

```
http://localhost:5000/api
```

Protected endpoints need Authorization header:

```
Authorization: Bearer <access_token>
```

## Key Endpoints Quick Reference

| Function        | Method | Endpoint       |
| --------------- | ------ | -------------- |
| Register        | POST   | /auth/register |
| Login           | POST   | /auth/login    |
| Logout          | POST   | /auth/logout   |
| Refresh Token   | POST   | /auth/refresh  |
| Get Rooms       | GET    | /rooms         |
| Create Booking  | POST   | /bookings      |
| Get My Bookings | GET    | /bookings      |
| View Audit Logs | GET    | /audit-logs    |

## Support

- **Server on correct port?** Check in browser: http://localhost:5000/health
- **Database connected?** Check console output during server start
- **Token not valid?** Use refresh endpoint to get new token
- **Still having issues?** Check the full README.md for detailed debugging

---

Ready to build! 🚀 For full documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
