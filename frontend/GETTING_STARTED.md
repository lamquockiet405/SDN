# Getting Started Guide

Welcome to the Study Room Booking Dashboard! This guide will help you set up and run the application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- **npm**: Comes with Node.js (or use yarn 3.6+)
  - Verify: `npm --version`

- **Git**: For version control
  - Download from [git-scm.com](https://git-scm.com/)

## Step 1: Clone/Navigate to Project

```bash
# Navigate to the project directory
cd d:\SP26\SDN302\exam\SDN
```

## Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This may take a few minutes. The following will be installed:
# - Next.js 14
# - React 18
# - TypeScript
# - TailwindCSS
# - Axios
# - Recharts
# - Lucide Icons
# And other dev dependencies
```

## Step 3: Configure Environment Variables

Create or update the `.env.local` file in the project root:

```bash
# .env.local

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000

# Optional: Add more as your backend requires
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

**Note**: Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive data here.

## Step 4: Run Development Server

```bash
npm run dev
```

Output should show:

```
> study-room-booking-dashboard@1.0.0 dev
> next dev

▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

## Step 5: Open in Browser

Open [http://localhost:3000](http://localhost:3000) in your web browser.

You should see the login page. Use any credentials to test (since we're using mock auth):

**Test Credentials:**

- Email: `demo@example.com`
- Password: `password123`

## Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type checking
npm run type-check

# Run ESLint linter
npm run lint
```

## Project Structure Overview

### Key Directories

```
app/                    # Next.js App Router pages
├── (auth)/             # Authentication pages (login, register)
├── dashboard/          # Main dashboard page
├── rooms/              # Room browsing page
├── bookings/           # Bookings history
├── payments/           # Payments page
└── settings/           # User settings

components/            # Reusable React components
├── Sidebar.tsx        # Navigation sidebar
├── Header.tsx         # Page header
├── ProtectedRoute.tsx # Route protection wrapper
└── ...

context/               # React Context for state management
├── AuthContext.tsx    # Authentication context

services/              # API calls
├── authService.ts     # Auth API functions
├── roomService.ts     # Room API functions
└── ...

types/                 # TypeScript type definitions
├── user.ts
├── room.ts
└── booking.ts

lib/                   # Utilities
├── axios.ts           # Axios instance with interceptors
└── token-utils.ts     # Token management
```

## First Time Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env.local` file created/updated
- [ ] Development server running (`npm run dev`)
- [ ] Browser open to http://localhost:3000
- [ ] Can see login page
- [ ] Can log in with test credentials
- [ ] Dashboard loads successfully

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
npm run dev -- -p 3001
```

Then open http://localhost:3001

### Dependencies Installation Failed

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### TypeScript Errors

```bash
# Run type check to see all errors
npm run type-check

# This helps identify type issues before running the app
```

### Style/CSS Not Loading

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run dev
```

## Environment Setup

### Required Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Your backend API URL (default: `http://localhost:3001/api`)

### Setting Up Backend API

To connect with a real backend:

1. Start your backend server (Node, Express, etc.) on port 3001
2. Ensure it has proper CORS configuration
3. Implement the required API endpoints (see API_ENDPOINTS.md)

Example backend starting on port 3001:

```bash
# In your backend directory
npm start
# Server running on http://localhost:3001
```

## Authentication Testing

The application includes mock authentication. To test the auth flow:

1. Go to login page: http://localhost:3000/login
2. Enter any email and password
3. Click "Login"
4. You'll be authenticated and redirected to dashboard
5. Token will be stored in browser localStorage

To test token refresh:

1. Open browser DevTools (F12)
2. Go to Application → LocalStorage
3. You'll see `accessToken` and `refreshToken`

## Using Mock Data

The application comes with mock data for testing. To use:

1. **Dashboard**: Shows mock stats and charts
2. **Rooms**: Browse 6 mock study rooms
3. **Bookings**: View mock booking history
4. **Payments**: View mock payment transactions
5. **Users**: Manage mock users (admin only)

### Switching to Real API Calls

When your backend is ready, update the pages to use real services:

**Before (Mock):**

```typescript
// In app/rooms/page.tsx
setRooms(mockRooms);
```

**After (Real):**

```typescript
const { rooms } = await roomService.getRooms();
setRooms(rooms);
```

## Development Tips

### Hot Module Replacement (HMR)

- Changes to files automatically reload in browser
- State is preserved when possible
- Very fast iteration

### TypeScript Support

- Full TypeScript support out of the box
- Type checking before runtime
- Great IDE autocomplete

### Component Reusability

- All components in `components/` are reusable
- Extract components from pages as they grow
- Use props for flexibility

### API Calls

- Use services in `services/` directory
- All HTTP requests go through Axios
- Interceptors handle token refresh automatically

## Next Steps

1. **Explore the codebase**
   - Start with `app/dashboard/page.tsx`
   - Check out `context/AuthContext.tsx`
   - Review `services/` folder

2. **Connect backend API**
   - Update `.env.local` with backend URL
   - Implement API endpoints
   - Test auth flow

3. **Customize for your needs**
   - Add more pages/features
   - Modify styles in `tailwind.config.js`
   - Add more services

4. **Deploy**
   - Build: `npm run build`
   - Test: `npm start`
   - Deploy to Vercel, Netlify, or your server

## Documentation Files

- **README.md** - Project overview and features
- **API_ENDPOINTS.md** - Expected API endpoints
- **ARCHITECTURE.md** - System architecture details
- **STYLES.md** - UI design system documentation

## Getting Help

### Common Issues

1. **CORS Error**: Backend CORS not configured
   - Add frontend URL to backend CORS allowed origins
   - Restart backend server

2. **401 Unauthorized**: Token issues
   - Check if API returns tokens correctly
   - Clear localStorage and re-login
   - Verify token format

3. **Module not found**: Missing dependencies
   - Run `npm install` again
   - Check imports match actual file paths
   - Verify case sensitivity (Linux/Mac are case-sensitive)

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Guide](https://tailwindcss.com/docs)

## Quick Reference

```bash
# Development
npm run dev                    # Start dev server
npm run type-check             # Check types
npm run lint                   # Run linter

# Production
npm run build                  # Build for production
npm start                      # Start production server

# Maintenance
npm install                    # Install dependencies
npm update                     # Update dependencies
npm cache clean --force        # Clear npm cache
```

## Summary

You now have a fully functional Study Room Booking Dashboard running locally!

**Next steps:**

1. Explore the application interface
2. Review the codebase structure
3. Connect your backend API
4. Customize for your specific needs

Happy coding! 🚀
