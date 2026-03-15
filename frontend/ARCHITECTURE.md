# Architecture & Design Decisions

This document explains the architecture and key design decisions of the Study Room Booking Dashboard.

## System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 Frontend                       │
├─────────────────────────────────────────────────────────────┤
│  Pages (App Router)    │  Components    │  Services          │
│  - Dashboard           │  - Sidebar     │  - authService     │
│  - Rooms               │  - Header      │  - roomService     │
│  - Bookings            │  - Cards       │  - bookingService  │
│  - Payments            │  - Layout      │  - paymentService  │
└─────────────┬───────────────────────────────────────────────┘
              │
              │  Axios HTTP Client
              │  (with JWT interceptors)
              │
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Node/Express/etc)                 │
├─────────────────────────────────────────────────────────────┤
│  - Authentication (JWT)                                     │
│  - Room Management                                          │
│  - Booking System                                           │
│  - Payment Processing                                       │
│  - User Management                                          │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Rationale

### Next.js 14 (App Router)

- **Why**: Server-side rendering, static generation, API routes
- **Benefits**:
  - Superior SEO for public pages
  - Automatic code splitting
  - Built-in optimization
  - Intuitive file-based routing

### TypeScript

- **Why**: Type safety and better developer experience
- **Benefits**:
  - Catch errors at compile time
  - Better IDE autocomplete
  - Self-documenting code
  - Easier refactoring

### React Context API

- **Why**: Simple, lightweight state management
- **Benefits**:
  - No external dependencies
  - Built into React
  - Perfect for auth state
  - Less boilerplate than Redux

### TailwindCSS

- **Why**: Utility-first CSS framework
- **Benefits**:
  - Rapid UI development
  - Consistent design system
  - Small bundle size
  - Easy customization

### Axios

- **Why**: Promise-based HTTP client
- **Benefits**:
  - Request/response interceptors
  - Automatic request cancellation
  - Request timeout management
  - Request data transformation

## Authentication Architecture

### Token-Based (JWT)

```
User                          Frontend                      Backend
  │                              │                            │
  ├─ Login ──────────────────────>│                            │
  │                              ├─ POST /auth/login ────────>│
  │                              │                            │
  │                              │<─ {accessToken, ...} ──────┤
  │                              │                            │
  │                  Store tokens in localStorage             │
  │                              │                            │
  ├─ Request ────────────────────>│                            │
  │                              ├─ GET /rooms with token ───>│
  │                              │<─ 200 OK with data ────────┤
  │                              │                            │
  │<─ Response ───────────────────┤                            │
```

### Token Refresh Flow

```
Scenario: Access token expired

User Request                 Interceptor                  Backend
      │                           │                         │
      ├─ API Call ───────────────>│                         │
      │                           ├─ Add Authorization ────>│
      │                           │<─ 401 Unauthorized ────┤
      │                           │                         │
      │                  Queue requests                      │
      │                           ├─ POST /auth/refresh ───>│
      │                           │<─ New accessToken ──────┤
      │                           │                         │
      │                  Retry original request              │
      │                           ├─ With new token ───────>│
      │                           │<─ 200 OK ──────────────┤
      │<─ Response ───────────────┤                         │
```

## State Management Strategy

### Authentication State (Global)

```typescript
Context: AuthContext
├── user: User | null
├── isLoading: boolean
├── isAuthenticated: boolean
├── error: string | null
├── login(): Promise<void>
├── register(): Promise<void>
├── logout(): Promise<void>
├── refreshUser(): Promise<void>
└── clearError(): void
```

### Page-Level State (Local)

```typescript
// Each page manages its own state
State: Data, Filters, Loading, Error
├── useEffect() - Fetch data on mount
├── useState() - Manage filters/search
├── Derived state - Computed values
└── Callback - Handle user interactions
```

### Why This Approach?

- Global auth state needed across entire app
- Page state keeps components focused
- Easy to test individual pages
- Scales well as app grows
- Can transition to Redux/Zustand if needed

## API Integration Pattern

### Service Architecture

```typescript
// services/roomService.ts
export const roomService = {
  async getRooms(params?: GetRoomsParams) {
    const response = await api.get("/rooms", { params });
    return response.data;
  },

  async getRoomById(id: string) {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // ... more methods
};
```

### Page Usage Pattern

```typescript
// app/rooms/page.tsx
export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const { rooms } = await roomService.getRooms();
      setRooms(rooms);
    };

    fetchRooms();
  }, []);

  // ... render rooms
}
```

### Benefits

- Clear separation of concerns
- Testable API calls
- Reusable across components
- Easy to cache/optimize
- Type-safe responses

## Component Structure

### Layout Components

```
App
├── Sidebar (Navigation)
├── Header (Page info)
└── Main Content
    ├── Dashboard
    ├── Rooms
    ├── Bookings
    └── ...
```

### Component Hierarchy

```
DashboardLayout
├── Sidebar
│   ├── Logo
│   ├── NavLinks
│   └── UserInfo
├── Header
│   ├── PageTitle
│   ├── Notifications
│   └── UserMenu
└── Content
    ├── Page-specific components
    └── Reusable components
        ├── StatCard
        ├── RoomCard
        ├── Tables
        └── Forms
```

## Data Flow

### Example: Browsing Rooms

```
User                Page                Service          Backend
 │                   │                    │                │
 ├─ Visit /rooms ───>│                    │                │
 │                   │ useEffect() ───────>│                │
 │                   │                    ├─ GET /rooms ──>│
 │                   │                    │<─ Room data ───┤
 │                   │ setRooms() ◄───────┤                │
 │                   │                    │                │
 │ (Render rooms)    │                    │                │
 │<──────────────────┤                    │                │
 │                   │                    │                │
 ├─ Filter rooms ───>│ useState() ────────>│ (Filter local) │
 │                   │ setFilteredRooms()  │                │
 │<──────────────────┤                    │                │
```

## Security Architecture

### Protected Routes

```
User visits /dashboard
        │
        ├─→ ProtectedRoute checks auth
        │   ├─ No token? → Redirect to /login
        │   ├─ Has role check?
        │   │   ├─ Wrong role? → Redirect to /unauthorized
        │   │   └─ Correct role? → Render page
        │   └─ Still loading? → Show spinner
        │
        └─→ Display protected content
```

### Token Security

1. **Storage**: localStorage (accessible via JS, but secure for tokens)
2. **Sending**: Authorization header (not exposed in query strings)
3. **Refresh**: Automatic before expiry (handled by interceptor)
4. **Clear**: On logout (prevents unauthorized access)

### CORS Handling

```
Frontend (http://localhost:3000)
           │
           │ Request with credentials
           │
Backend (http://localhost:3001)
           │
           ├─ Check CORS headers
           ├─ Validate Origin
           ├─ Return allowed headers
           │
Frontend   │
   ✓ Request allowed if CORS configured
   ✗ Request blocked if not configured
```

## Performance Optimizations

### Code Splitting

- Page-based splitting (automatic with Next.js)
- Component lazy loading (when needed)
- API endpoint splitting by service

### Caching Strategies

- localStorage for auth tokens
- Browser cache for room images
- SWR/Reactive queries (ready for implementation)

### Bundle Optimization

- Tree shaking (unused code removed)
- Minification (production build)
- Image optimization (Next.js Image component)

## Error Handling Strategy

### Three-Level Error Handling

```
Level 1: API Errors (Axios Interceptor)
├── 401 → Auto refresh token
├── 403 → Redirect to unauthorized
├── 404 → Show not found error
└── 500 → Show server error

Level 2: Service Errors
├── Try-catch in services
├── Return error in response
└── Log to monitoring

Level 3: Component Errors
├── Error state management
├── User-friendly messages
└── Recovery options
```

## Deployment Architecture

### Development

```
npm run dev
→ http://localhost:3000 (hot reload)
→ Connected to localhost API
```

### Production

```
npm run build
→ Optimized bundle
→ npm start or deploy to Vercel
→ Connected to production API
```

## Scaling Considerations

### If App Grows

1. **State Management**: Migrate to Redux/Zustand
2. **Data Fetching**: Add React Query/SWR
3. **Component Library**: Create shared component library
4. **Testing**: Add Jest/Vitest + React Testing Library
5. **E2E Testing**: Add Cypress/Playwright
6. **Monitoring**: Add Sentry/Datadog
7. **Analytics**: Add Google Analytics/Segment
8. **CI/CD**: Add GitHub Actions/Jenkins
9. **Documentation**: Add Storybook
10. **Performance**: Add performance monitoring

## Design Decisions

### Why React Context over Redux?

- App is relatively small
- No complex state mutations
- Redux adds unnecessary complexity

### Why localStorage for tokens?

- Simple and sufficient for this app
- XSS risk exists but mitigated by framework
- Alternative: httpOnly cookies (needs backend support)

### Why mock data in development?

- Allows frontend development without backend
- Rapid prototyping and testing
- Easy to replace with real data

### Why services pattern?

- Single responsibility principle
- Easy to test
- Reusable across components
- Clear data flow

## Future Architecture Improvements

1. **API Caching**: Implement React Query with stale-while-revalidate
2. **Real-time Updates**: WebSocket for live booking updates
3. **Offline Support**: Service workers for offline availability
4. **Dark Mode**: Add theme provider and dark mode toggle
5. **Internationalization**: Multi-language support
6. **Analytics**: User behavior tracking
7. **A/B Testing**: Feature flags and experimentation
8. **Micro-frontend**: Module federation for large teams

---

## Related Documentation

- [Getting Started Guide](./GETTING_STARTED.md)
- [API Endpoints](./API_ENDPOINTS.md)
- [Component Documentation](./COMPONENTS.md)
