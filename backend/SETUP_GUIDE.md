# Setup and Configuration Guide

Complete setup instructions for the Study Room Booking Backend API.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Google OAuth Configuration](#google-oauth-configuration)
5. [Email (Gmail) Configuration](#email-gmail-configuration)
6. [Running the Server](#running-the-server)
7. [Testing the API](#testing-the-api)
8. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### 1. Install Node.js

**Windows:**

- Download from https://nodejs.org/ (LTS version)
- Run installer
- Verify: `node --version` and `npm --version`

**macOS:**

```bash
brew install node
```

**Linux:**

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone/Setup Project

```bash
cd backend
npm install
```

### 3. Create Environment File

```bash
cp .env.example .env
```

---

## Environment Configuration

### Essential Variables

Edit `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/study-room-booking

# JWT Configuration
JWT_SECRET=your_jwt_secret_minimum_32_characters_long_random_string_here
JWT_EXPIRE=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_minimum_32_characters_long_random_string_here
REFRESH_TOKEN_EXPIRE=7d

# Google OAuth (Optional for development)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Gmail Configuration (For 2FA & Password Reset Emails)
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_specific_password

# General Configuration
OTP_EXPIRY=5m
FRONTEND_URL=http://localhost:3000
```

### Generate Secure Secrets

```bash
# Generate JWT Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Refresh Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output to copy:**

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## Database Setup

### Option 1: Local MongoDB

#### Windows

1. **Download MongoDB Community Server**
   - Visit https://www.mongodb.com/try/download/community
   - Download Windows version
   - Run installer

2. **Start MongoDB Service**

   ```bash
   net start MongoDB
   ```

3. **Verify Connection**
   ```bash
   mongosh
   ```
   Remove this from your `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/study-room-booking
   ```

#### macOS

```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start service
brew services start mongodb-community

# Connect
mongosh
```

#### Linux (Ubuntu/Debian)

```bash
# Import MongoDB GPG Key
curl https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB Repository
echo "deb https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start Service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh
```

### Option 2: MongoDB Atlas (Cloud)

#### Setup MongoDB Atlas

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up free
   - Verify email

2. **Create Project**
   - Click "Create Project"
   - Name: "Study Room Booking"
   - Create

3. **Create Cluster**
   - Click "Build a Cluster"
   - Choose "Free Tier"
   - Cloud Provider: AWS
   - Region: Choose closest to you
   - Cluster Name: "study-room-cluster"
   - Click "Create"

4. **Configure Access**
   - Click "CONNECT"
   - Add IP Address: Click "Add Current IP Address"
   - Create Database User:
     - Username: `admin`
     - Password: [Generate strong password]
     - Click "Create User"

5. **Get Connection String**
   - Choose "Connect your application"
   - Select "Node.js"
   - Copy connection string:
     ```
     mongodb+srv://admin:<password>@study-room-cluster.xxxxx.mongodb.net/study-room-booking?retryWrites=true&w=majority
     ```

6. **Update .env**
   ```env
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@study-room-cluster.xxxxx.mongodb.net/study-room-booking?retryWrites=true&w=majority
   ```

---

## Google OAuth Configuration

Required for Google login feature (optional for development).

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click project dropdown → "New Project"
3. Project name: "Study Room Booking System"
4. Click "CREATE"

### Step 2: Enable Google+ API

1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it → "ENABLE"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Name: "Study Room Backend"
5. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:5000`
6. Authorized redirect URIs:
   - `http://localhost:3000/callback`
7. Click "CREATE"
8. Copy Client ID and Secret

### Step 4: Update .env

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

---

## Email (Gmail) Configuration

For sending password reset and 2FA emails.

### Step 1: Create Gmail Account

Use existing or create new Gmail account dedicated for your app.

### Step 2: Enable 2-Step Verification

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Follow Google's verification process

### Step 3: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google generates 16-character password
4. Copy the password (spaces included)

### Step 4: Update .env

```env
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Step 5: Test Email

```bash
# In Node.js console
const email = require('./src/utils/email');
email.sendWelcomeEmail('test@example.com', 'Test User');
```

---

## Running the Server

### Development Mode (with Auto-Restart)

```bash
npm run dev
```

Expected output:

```
[nodemon] starting `node src/server.js`
Server running on port 5000
Environment: development
MongoDB Connected: localhost
```

### Production Mode

```bash
npm start
```

### Change Port

```bash
PORT=3001 npm run dev
```

---

## Testing the API

### Using cURL

#### Health Check

```bash
curl http://localhost:5000/health
```

#### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'
```

#### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

Save the returned `accessToken` and `refreshToken`.

#### Get Rooms (No Auth)

```bash
curl http://localhost:5000/api/rooms
```

#### Create Room (With Auth)

```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Study Room A",
    "capacity": 4,
    "location": "Building A",
    "pricePerHour": 50,
    "amenities": ["WiFi"],
    "rules": ["No food"]
  }'
```

### Using Postman

1. **Create new request collection**
   - File → New Collection
   - Name: "Study Room API"

2. **Set up environment variables**
   - Click "Manage Environments"
   - Create new: "Dev"
   - Variables:
     - `baseUrl`: `http://localhost:5000/api`
     - `accessToken`: (leave empty, will auto-fill after login)
     - `refreshToken`: (leave empty)

3. **Create login request**

   ```
   POST {{baseUrl}}/auth/login

   {
     "email": "test@example.com",
     "password": "TestPass123"
   }
   ```

4. **Extract tokens (Tests tab)**

   ```javascript
   if (pm.response.code === 200) {
     var jsonData = pm.response.json();
     pm.environment.set("accessToken", jsonData.accessToken);
     pm.environment.set("refreshToken", jsonData.refreshToken);
   }
   ```

5. **Create rooms request**

   ```
   POST {{baseUrl}}/rooms
   Authorization: Bearer {{accessToken}}

   {
     "name": "Room A",
     "capacity": 4,
     "location": "Floor 2",
     "pricePerHour": 50
   }
   ```

### Using VS Code REST Client

1. **Install extension:** "REST Client" by Huachao Mao

2. **Create file:** `requests.http`

3. **Add requests:**

```
### Variables
@baseUrl = http://localhost:5000/api

### Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPass123",
  "confirmPassword": "TestPass123"
}

### Login
@accessToken =

POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123"
}

### Get My Bookings
GET {{baseUrl}}/bookings
Authorization: Bearer {{accessToken}}
```

4. **Run:** Click "Send Request" above each request

---

## Verification Checklist

After setup, verify everything works:

- [ ] `npm install` completed without errors
- [ ] MongoDB connection successful (check console)
- [ ] Server running on port 5000
- [ ] Health check responds
- [ ] Can register user
- [ ] Can login and receive tokens
- [ ] Can access protected routes with token
- [ ] Can create rooms (if staff/admin)
- [ ] Can create bookings

---

## Troubleshooting

### Port 5000 Already in Use

**Windows:**

```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID 1234 /F

# Or use different port
PORT=3001 npm run dev
```

**macOS/Linux:**

```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Refused

```bash
# Check if MongoDB is running:
# Windows
Get-Service MongoDB

# macOS
brew services list

# Linux
sudo systemctl status mongod

# Start MongoDB:
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Module Not Found Error

```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Make sure `FRONTEND_URL` in `.env` matches your frontend:

```env
FRONTEND_URL=http://localhost:3000
```

Restart server after changing.

### JWT Token Errors

- Token expired? Use refresh endpoint: `POST /api/auth/refresh`
- Invalid token? Make sure to send as: `Bearer <token>`
- Check that `JWT_SECRET` hasn't changed

### Email Not Sending

- Verify Gmail account credentials
- Use App Password (not regular password)
- Check spam folder
- Enable "Less secure app access" if using regular password
- Make sure `GMAIL_PASSWORD` is correct (including spaces)

### Google OAuth Not Working

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Add redirect URIs in Google Cloud Console
- Token should be valid, not expired

### Database Quota Exceeded (Atlas)

If development free tier is full:

- Delete old databases
- Clear collections
- Create new cluster

---

## Production Deployment

### Prepare for Production

1. **Update .env for production:**

   ```env
   NODE_ENV=production
   PORT=8000
   MONGODB_URI=your_atlas_connection_string
   JWT_SECRET=very_long_random_string_minimum_32_chars
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Install PM2 (process manager):**

   ```bash
   npm install -g pm2
   ```

3. **Start with PM2:**

   ```bash
   pm2 start src/server.js --name "study-room-api"
   pm2 save
   pm2 startup
   ```

4. **Enable HTTPS:**
   - Use Let's Encrypt with Nginx reverse proxy
   - Or use platform-specific SSL (Heroku, AWS, etc.)

5. **Setup monitoring:**
   - Monitor logs and errors
   - Set up alerts for downtime
   - Regular backups

---

## Database Backup & Restore

### MongoDB Atlas (Cloud)

1. Go to cluster → "Backup"
2. Create backup manually or use scheduled
3. For restore: Select backup → "Restore"

### Local MongoDB

```bash
# Backup
mongodump --db study-room-booking --out ./backup

# Restore
mongorestore --db study-room-booking ./backup/study-room-booking
```

---

## Next Steps

1. ✅ Backend running
2. 🔧 [See QUICKSTART.md for testing](QUICKSTART.md)
3. 📖 [Read API_DOCUMENTATION.md for all endpoints](API_DOCUMENTATION.md)
4. 🚀 Connect your frontend
5. 🔒 Configure authentication in frontend
6. 📝 Setup database indexes for production
7. 📊 Implement monitoring and logging

---

## Support Resources

- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- JWT Docs: https://jwt.io
- Google OAuth: https://developers.google.com/identity
- Node.js: https://nodejs.org/docs

---

Last Updated: March 15, 2026
