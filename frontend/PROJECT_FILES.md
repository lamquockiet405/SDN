# Project Files & Directory Structure

Complete reference of all files created for the Study Room Booking Dashboard.

## 📋 Configuration Files

### Core Framework Configuration

- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript configuration with path aliases
- **`next.config.js`** - Next.js configuration
- **`tailwind.config.js`** - Tailwind CSS theme and plugins
- **`postcss.config.js`** - PostCSS configuration for Tailwind
- **`.gitignore`** - Git ignore patterns
- **`.env.local`** - Environment variables (local development)

## 📚 Documentation Files

### Main Documentation

- **`README.md`** - Project overview, features, and quick start
- **`GETTING_STARTED.md`** - Detailed setup and installation guide
- **`API_ENDPOINTS.md`** - Complete API endpoint documentation
- **`ARCHITECTURE.md`** - System architecture and design decisions
- **`PROJECT_FILES.md`** - This file (file structure reference)

## 🎨 Styling

### Global Styles

```
app/
└── globals.css           # TailwindCSS directives and global styles
```

## 🔑 Authentication & Context

### Auth Context

```
context/
└── AuthContext.tsx       # React Context for global auth state
                          # - User state management
                          # - Login/Register/Logout functions
                          # - useAuth() hook
```

### Authentication Library

```
lib/
├── axios.ts              # Axios instance with interceptors
│                         # - Request interceptor (add auth token)
│                         # - Response interceptor (handle 401, refresh token)
│                         # - Request queuing during refresh
│                         # - Automatic retry logic
│
└── token-utils.ts        # Token management utilities
                          # - Get/Set/Clear tokens
                          # - Get/Set/Clear user info
                          # - Check authentication status
```

## 📡 API Services

### Service Layer

```
services/
├── authService.ts        # Authentication API calls
│                         # - login(credentials)
│                         # - register(data)
│                         # - logout()
│                         # - refreshToken()
│                         # - getCurrentUser()
│
├── roomService.ts        # Room management API calls
│                         # - getRooms(params)
│                         # - getRoomById(id)
│                         # - getAvailability(roomId, date)
│                         # - checkAvailability(roomId, startTime, endTime)
│                         # - searchRooms(query)
│
├── bookingService.ts     # Booking management API calls
│                         # - getBookings(params)
│                         # - getBookingById(id)
│                         # - createBooking(data)
│                         # - cancelBooking(id)
│                         # - getStats()
│                         # - getUserBookings(page, limit)
│                         # - getBookingHistory()
│
└── paymentService.ts     # Payment management API calls
                          # - processPayment(bookingId, amount)
                          # - getPayments()
                          # - getPaymentById(id)
                          # - refundPayment(id)
```

## 🎯 Type Definitions

### TypeScript Types

```
types/
├── user.ts               # User-related types
│                         # - User interface
│                         # - AuthResponse
│                         # - LoginRequest
│                         # - RegisterRequest
│
├── room.ts               # Room-related types
│                         # - Room interface
│                         # - RoomAvailability
│                         # - TimeSlot
│
└── booking.ts            # Booking-related types
                          # - Booking interface
                          # - BookingRequest
                          # - BookingStats
```

## 🪝 Custom Hooks

### React Hooks

```
hooks/
└── useAsync.ts           # Utility hooks
                          # - useAsync() - Handle async operations
                          # - usePagination() - Manage pagination
                          # - useDebounce() - Debounce values
```

## 🧩 Components

### Layout Components

```
components/
├── DashboardLayout.tsx   # Main dashboard layout wrapper
│                         # - Combines Sidebar + Header + Content
│                         # - Protected route wrapper
│                         # - Responsive container
│
├── Sidebar.tsx           # Navigation sidebar
│                         # - Menu links
│                         # - User info display
│                         # - Logout button
│                         # - Mobile responsive (hamburger menu)
│
└── Header.tsx            # Page header
                          # - Page title
                          # - User greeting
                          # - Notifications
                          # - User profile menu
```

### Feature Components

```
components/
├── ProtectedRoute.tsx    # Protected route wrapper
│                         # - Auth check
│                         # - Role-based access
│                         # - Loading state
│                         # - Redirect logic
│
├── StatCard.tsx          # Statistics card component
│                         # - Title and value display
│                         # - Icon and color variants
│                         # - Optional trend indicator
│
└── RoomCard.tsx          # Room listing card
                          # - Room image placeholder
                          # - Room info (name, capacity, price)
                          # - Equipment tags
                          # - Rating display
                          # - Availability status
                          # - Book button
```

## 📄 Pages

### Authentication Pages

```
app/
├── login/
│   └── page.tsx          # Login page
│                         # - Email & password form
│                         # - Form validation
│                         # - Error display
│                         # - Register link
│                         # - Social login placeholder
│
└── register/
    └── page.tsx          # Registration page
                          # - Name, email, password form
                          # - Password confirmation
                          # - Form validation
                          # - Login link
                          # - Terms acceptance
```

### Main Application Pages

```
app/
├── page.tsx              # Home page (redirect to dashboard)
│
├── dashboard/
│   └── page.tsx          # Dashboard analytics page
│                         # - Stat cards (4 metrics)
│                         # - Line chart (booking trend)
│                         # - Pie chart (room usage)
│                         # - Recent rooms table
│
├── rooms/
│   └── page.tsx          # Room browsing page
│                         # - Search bar
│                         # - Filters (capacity, price, availability)
│                         # - Room grid/cards
│                         # - Mock 6 rooms with full details
│
├── bookings/
│   └── page.tsx          # My bookings page
│                         # - Search and status filters
│                         # - Bookings table
│                         # - Status indicators
│                         # - Payment status display
│
├── payments/
│   └── page.tsx          # Payments page
│                         # - Summary cards (total, completed, pending)
│                         # - Search and filters
│                         # - Payments transaction table
│                         # - Status tracking
│
├── feedback/
│   └── page.tsx          # Feedback & reviews page
│                         # - Stats (total reviews, avg rating, 5-star count)
│                         # - Search feedback
│                         # - Feedback list with ratings
│
├── users/
│   └── page.tsx          # User management page (Admin only)
│                         # - User stats (total, admins, regular)
│                         # - Search users
│                         # - Users table
│                         # - Admin toggle
│                         # - Delete functionality
│
├── settings/
│   └── page.tsx          # User settings page
│                         # - Tabbed interface (Profile, Security, Notifications, Privacy)
│                         # - Profile editing
│                         # - Password change
│                         # - Notification preferences
│                         # - Privacy settings
│
├── unauthorized/
│   └── page.tsx          # Access denied page
│                         # - Error message
│                         # - Back to dashboard link
│
└── layout.tsx            # Root layout
                          # - AuthProvider wrapper
                          # - Global metadata
```

## 📊 File Statistics

### Total Files Created: 40+

**By Category:**

- Configuration Files: 8
- Documentation: 5
- Type Definitions: 3
- Services: 4
- Components: 7
- Pages: 10
- Hooks: 1
- Context: 1
- Library: 2
- Styles: 1

### Lines of Code: ~6000+

**By Feature:**

- Authentication: ~1500 lines
- Components: ~1200 lines
- Services: ~800 lines
- Pages: ~2500+ lines

## 🗺️ Complete Directory Tree

```
study-room-booking-dashboard/
│
├── 📁 app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home redirect
│   ├── globals.css                   # Global styles
│   ├── 📁 login/
│   │   └── page.tsx
│   ├── 📁 register/
│   │   └── page.tsx
│   ├── 📁 dashboard/
│   │   └── page.tsx
│   ├── 📁 rooms/
│   │   └── page.tsx
│   ├── 📁 bookings/
│   │   └── page.tsx
│   ├── 📁 payments/
│   │   └── page.tsx
│   ├── 📁 feedback/
│   │   └── page.tsx
│   ├── 📁 users/
│   │   └── page.tsx
│   ├── 📁 settings/
│   │   └── page.tsx
│   └── 📁 unauthorized/
│       └── page.tsx
│
├── 📁 components/
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── ProtectedRoute.tsx
│   ├── StatCard.tsx
│   └── RoomCard.tsx
│
├── 📁 context/
│   └── AuthContext.tsx
│
├── 📁 services/
│   ├── authService.ts
│   ├── roomService.ts
│   ├── bookingService.ts
│   └── paymentService.ts
│
├── 📁 types/
│   ├── user.ts
│   ├── room.ts
│   └── booking.ts
│
├── 📁 lib/
│   ├── axios.ts
│   └── token-utils.ts
│
├── 📁 hooks/
│   └── useAsync.ts
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 next.config.js
├── 📄 tailwind.config.js
├── 📄 postcss.config.js
├── 📄 .env.local
├── 📄 .gitignore
│
├── 📖 README.md
├── 📖 GETTING_STARTED.md
├── 📖 API_ENDPOINTS.md
├── 📖 ARCHITECTURE.md
└── 📖 PROJECT_FILES.md
```

## 🔄 Dependencies Included

### Core Framework

- `next` (^14.0.0)
- `react` (^18.2.0)
- `react-dom` (^18.2.0)

### HTTP & Data

- `axios` (^1.6.0)

### UI & Styling

- `tailwindcss` (^3.4.0)
- `lucide-react` (^0.293.0)

### Data Visualization

- `recharts` (^2.10.0)

### Utilities

- `date-fns` (^2.30.0)
- `javascript-time-ago` (^2.5.9)
- `react-time-ago` (^7.7.6)

### Development

- `typescript` (^5.3.0)
- `@types/node`, `@types/react`, `@types/react-dom`
- `eslint`, `eslint-config-next`
- `autoprefixer`, `postcss`

## 🚀 Quick Navigation

### For Development Setup

→ Start with [GETTING_STARTED.md](./GETTING_STARTED.md)

### To Understand Architecture

→ Read [ARCHITECTURE.md](./ARCHITECTURE.md)

### To Integrate Backend

→ Reference [API_ENDPOINTS.md](./API_ENDPOINTS.md)

### For Main Features

→ Check [README.md](./README.md)

### For Quick Reference

→ You're reading [PROJECT_FILES.md](./PROJECT_FILES.md)

## 📝 File Modification Checklist

After cloning/downloading, verify these files exist:

- ✅ Configuration (8 files)
- ✅ Documentation (5 files)
- ✅ Components (6 files)
- ✅ Services (4 files)
- ✅ Types (3 files)
- ✅ Pages (10 files)
- ✅ Context (1 file)
- ✅ Utilities (3 files)

If any are missing, they should be created as shown in this reference.

---

**Total Project Setup: Complete & Ready for Development! 🎉**
