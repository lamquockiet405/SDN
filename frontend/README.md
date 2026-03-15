# Study Room Booking System - Dashboard

A modern, production-ready SaaS dashboard for booking study rooms built with Next.js 14, React, TypeScript, and TailwindCSS.

## 🎯 Features

### Authentication

- ✅ User registration and login
- ✅ JWT Access Token + Refresh Token authentication
- ✅ Secure token storage in localStorage
- ✅ Automatic token refresh with Axios interceptors
- ✅ Protected routes with role-based access control

### Dashboard

- 📊 Analytics dashboard with real-time stats
- 📈 Line charts for booking trends
- 🥧 Pie charts for room usage
- 📋 Interactive data tables

### Room Management

- 🏢 Browse available study rooms
- 🔍 Advanced search and filtering
- ⭐ Rating system
- 💰 Price comparison
- 📱 Equipment filtering

### Booking System

- 📅 Calendar-based booking interface
- ⏰ Time slot management
- 📋 Booking history tracking
- 🔄 Status management (Confirmed, Pending, Completed, Cancelled)
- 💳 Integrated payment tracking

### Payments

- 💰 Payment transaction history
- 📊 Revenue analytics
- 🔄 Payment status tracking
- 🧾 Invoice management

### User Management

- 👥 User administration (Admin only)
- 🔐 Role-based access control
- 📊 User activity tracking

### Additional Features

- ⭐ Feedback and reviews system
- ⚙️ User settings and preferences
- 🔔 Notification preferences
- 📱 Fully responsive mobile design
- 🌙 Modern UI with soft shadows and clean design

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React with TailwindCSS
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Charts**: Recharts
- **Icons**: Lucide React

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout with AuthProvider
│   ├── globals.css                # Global styles
│   ├── page.tsx                   # Home page (redirects to dashboard)
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── register/
│   │   └── page.tsx              # Registration page
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard analytics
│   ├── rooms/
│   │   └── page.tsx              # Room browsing with filters
│   ├── bookings/
│   │   └── page.tsx              # My bookings history
│   ├── payments/
│   │   └── page.tsx              # Payment transactions
│   ├── feedback/
│   │   └── page.tsx              # Feedback and reviews
│   ├── users/
│   │   └── page.tsx              # User management (Admin)
│   ├── settings/
│   │   └── page.tsx              # User settings
│   └── unauthorized/
│       └── page.tsx              # Unauthorized access page
│
├── components/
│   ├── Sidebar.tsx                # Navigation sidebar
│   ├── Header.tsx                 # Dashboard header
│   ├── DashboardLayout.tsx         # Layout wrapper
│   ├── ProtectedRoute.tsx          # Protected route wrapper
│   ├── StatCard.tsx               # Statistics card
│   └── RoomCard.tsx               # Room listing card
│
├── context/
│   └── AuthContext.tsx            # Authentication context
│
├── lib/
│   ├── axios.ts                   # Axios instance with interceptors
│   └── token-utils.ts             # Token management utilities
│
├── services/
│   ├── authService.ts             # Authentication API calls
│   ├── roomService.ts             # Room API calls
│   ├── bookingService.ts          # Booking API calls
│   └── paymentService.ts          # Payment API calls
│
├── types/
│   ├── user.ts                    # User types
│   ├── room.ts                    # Room types
│   └── booking.ts                 # Booking types
│
├── hooks/                         # Custom React hooks (ready for extension)
├── utils/                         # Utility functions (ready for extension)
│
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.js             # TailwindCSS configuration
├── next.config.js                 # Next.js configuration
├── postcss.config.js              # PostCSS configuration
├── package.json                   # Dependencies
└── .env.local                     # Environment variables
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

```bash
cd d:\SP26\SDN302\exam\SDN
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000
```

4. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🔐 Authentication Flow

### Login/Register

1. User submits credentials
2. API returns `accessToken` and `refreshToken`
3. Tokens stored in localStorage
4. User redirected to dashboard

### Automatic Token Refresh

1. Request sent with `accessToken` in Authorization header
2. If API returns 401 (unauthorized)
3. Axios interceptor pauses requests
4. Calls `/auth/refresh` endpoint with `refreshToken`
5. Updates tokens in localStorage
6. Resumes & retries original request
7. Queue handles multiple requests during refresh

### Logout

1. Clear tokens from localStorage
2. Redirect to login page
3. No further requests can be made

## 🔗 API Endpoints Expected

The frontend expects these API endpoints to exist:

### Authentication

- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new account
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info

### Rooms

- `GET /rooms` - List all rooms with pagination
- `GET /rooms/{id}` - Get single room details
- `GET /rooms/{id}/availability` - Get room availability
- `GET /rooms/{id}/check-availability` - Check specific slot
- `GET /rooms/search` - Search rooms

### Bookings

- `GET /bookings` - List all bookings
- `GET /bookings/{id}` - Get booking details
- `POST /bookings` - Create new booking
- `POST /bookings/{id}/cancel` - Cancel booking
- `GET /bookings/stats` - Get booking statistics
- `GET /bookings/my-bookings` - Get user's bookings
- `GET /bookings/history` - Get booking history

### Payments

- `POST /payments` - Process payment
- `GET /payments` - List payments
- `GET /payments/{id}` - Get payment details
- `POST /payments/{id}/refund` - Refund payment

## 🎨 UI Design System

### Colors

- **Primary**: `#3B82F6` (Blue)
- **Secondary**: `#1E293B` (Dark)
- **Accent**: `#06B6D4` (Cyan)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Danger**: `#EF4444` (Red)

### Components

- **Card Border Radius**: `12px`
- **Button Border Radius**: `8px`
- **Shadows**: Soft, subtle box shadows with hover effects
- **Spacing**: 4px grid system (consistent with Tailwind)

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:

- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar (768px+)
- **Mobile**: Hidden sidebar with hamburger menu (<768px)

## 🔄 State Management

### Context API

- **AuthContext**: Manages user authentication state, login/logout functions
- Provides global auth state to entire app

### Local Component State

- Each page manages its own data fetching and filtering
- Ready to integrate with Redux/Zustand for complex state

## 🧪 Mock Data

The application currently uses mock data for demonstration. To connect to a real API:

1. Update `.env.local` with your API URL
2. Uncomment actual API calls in pages (currently commented with mock data)
3. Remove mock data initialization

Example conversion (in `app/dashboard/page.tsx`):

```typescript
// Before (mock):
setStats({ totalBookings: 156, ... });

// After (API):
const data = await bookingService.getStats();
setStats(data);
```

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Refresh token rotation
- ✅ Automatic 401 handling
- ✅ Protected routes (ProtectedRoute component)
- ✅ Role-based access control (admin vs user)
- ✅ Secure token storage (localStorage with server-side validation)
- ✅ CORS enabled for safe cross-origin requests

## 📝 Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000
```

## 🚨 Common Issues & Solutions

### CORS Errors

- Ensure your backend API has CORS enabled
- Add your frontend URL to CORS allowed origins
- Verify API base URL in `.env.local`

### 401 Unauthorized Loop

- Check if refresh token is valid
- Verify token expiration times
- Clear localStorage and re-login
- Check browser network tab for API responses

### Changes Not Reflecting

- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Restart dev server (`npm run dev`)

### Type Errors

- Run `npm install` to ensure all types are installed
- Clear `.next` folder and rebuild
- Check tsconfig.json paths

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com)

## 🤝 Contributing

This is a demo/starter project. Feel free to extend it with:

- Additional pages and features
- Real API integration
- User notifications/toasts
- Data export functionality
- Advanced analytics
- Calendar integrations

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 📞 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review component documentation in code comments
3. Check the mock data to understand expected data structures

---

**Happy Coding! 🎉**
