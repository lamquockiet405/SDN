# Role-Based Access Control & Features Matrix

## 🔐 Access Control Overview

### User Role Levels

1. **Anonymous (Guest)** - Not logged in
2. **User** - Regular student/user account
3. **Staff** - Staff member with room management rights
4. **Admin** - Administrative account with full system access

---

## 👤 Guest (Not Logged In)

**Available Pages:** `/`, `/login`, `/register`, `/forgot-password`

**Features:**

- ✅ Register - Create new account
- ✅ View List Rooms - Browse all available rooms
- ✅ View Detail Room - See room details, amenities, pricing
- ✅ Search Room - Search rooms by location/capacity/price
- ✅ Forgot Password - Request password reset
- ✅ Google Login - Sign in with Google account
- ✅ Login - Standard email/password login

**Redirects to:**

- Trying to access protected pages → `/login`

---

## 👤 User Dashboard (Regular Student)

**Access URL:** `/dashboard/user`
**Access:** Automatically redirected after login if role === "user"

### Available Features:

#### Authentication

- ✅ Login - Already logged in
- ✅ Login with Google - (during registration)
- ✅ Logout - Sign out button in dashboard header
- ✅ Two-Factor Authentication - In profile settings (ready to implement)
- ✅ Refresh Access Token - Automatic via interceptors

#### Profile Management

- ✅ View Profile - Display current user info
- ✅ Edit Profile - Update name, phone, profile info
- ✅ Change Password - Change account password
- 📝 View Account History - Available in history tab

#### Booking Management

- ✅ View My Bookings - See all personal bookings with status
- ✅ Create Booking - Book a room (button redirects to `/` room listing)
- ✅ Group Booking - Multiple participants per booking
- ✅ Cancel Booking - Cancel upcoming bookings
- ✅ Extend Booking Time - Extend duration of upcoming bookings
- ✅ View Booking History - View past bookings in history tab
- 📝 Check-in Room - Ready for implementation
- 📝 Check-out Room - Ready for implementation

#### Usage & Evidence

- ✅ Upload Usage Evidence - Submit evidence after booking (ready)
- ✅ View Evidence - View submitted evidence

#### Payments

- ✅ Make Payment - Process payment for bookings
- ✅ Process VNPay Payment - VNPay payment gateway integration (ready)
- ✅ Handle Payment Callback - Handle payment status callbacks (ready)
- ✅ View Payment History - See all payment transactions
- ✅ Payment Status Tracking - View payment status

#### Feedback & Ratings

- ✅ Submit Feedback - Leave feedback/reviews on rooms
- ✅ Leave Rating - Rate completed bookings
- 📝 View Rating History - Historical ratings

**Dashboard Tabs:**

1. **My Bookings** - Current and past bookings with action buttons
2. **Profile** - Account info and security settings
3. **History** - Complete booking history in table format
4. **Payments** - Payment history and transaction details

**Quick Stats:**

- Upcoming Bookings count
- Completed Bookings count
- Total Spent amount
- Total Participants count

---

## 👨‍💼 Staff Dashboard

**Access URL:** `/dashboard/staff`
**Access:** Automatically redirected after login if role === "staff"
**Who can access:** Staff members and Admins

### Available Features:

#### Authentication

- ✅ Staff Login - Already logged in
- ✅ Staff Logout - Sign out button in dashboard
- 📝 Staff Session Management - Automatic via backend

#### Room Management

- ✅ Room Management - View all rooms with cards
  - View room details
  - View capacity, location, price
  - View amenities list
  - View room status
- ✅ Change Status Room - Toggle room availability (Available/Unavailable)
- ✅ Edit Room - Modify room information
- ✅ Add New Room - Create new rooms
- 📝 Delete Room - Soft delete with recovery

#### Booking Management

- ✅ Approve Booking - Approve pending booking requests
- ✅ Reject Booking - Reject booking requests with reason
- ✅ View Booking Requests - Table of pending bookings
- 📝 Cancel Booking - Cancel active bookings

#### Time Slot Management

- ✅ Create Time Slot - Define available booking time slots
- ✅ Update Time Slot - Modify existing time slots
- 📝 Delete Time Slot - Remove time slots
- ✅ View Time Slots - See all slots for each room

#### Room Usage & Monitoring

- ✅ View Room Usage History - Track room usage over time
- ✅ View Room Usage Analytics - Usage statistics and trends
- 📝 Monitor Room Status - Real-time room status

#### Evidence Review

- ✅ Review Usage Evidence - View submitted user evidence
  - Photos/videos uploaded by users
  - Mark as verified or rejected
  - Add notes/comments

#### Rating & Comments Management

- ✅ Rating Management - View and manage room ratings
- ✅ Delete Comments - Remove inappropriate comments
- ✅ Hide Comments - Show/hide user comments on rooms
- 📝 Pin Important Comments - Highlight helpful reviews

#### Reports & Issues

- ✅ View Reports - See damage/maintenance reports
- ✅ Track Issues - Monitor issue status
- ✅ Issue Resolution - Mark issues as resolved

**Dashboard Tabs:**

1. **Room Management** - Cards showing all rooms with quick actions
2. **Booking Approvals** - Table with pending requests and action buttons
3. **Reports & Issues** - Damage reports and maintenance tracking

**Quick Stats:**

- Total Rooms count
- Available Rooms count
- Pending Approvals count
- Issues Reported count

---

## 🔑 Admin Dashboard

**Access URL:** `/dashboard/admin`
**Access:** Automatically redirected after login if role === "admin"
**Who can access:** Admin users only

### Available Features:

#### System Management

- ✅ View Dashboard - Overview of system metrics
  - Total users, rooms, bookings
  - System performance stats
  - Recent activity feed

#### User Management

- ✅ View List Users - Searchable table of all users
  - Filter by role, status, email
  - Sort by join date, bookings, etc.
- ✅ Change Status User - Update user status
  - Active → Active/Inactive/Suspended
  - Bulk status changes (ready to implement)
- ✅ View User Details - Profile information
- ✅ User Registration Date - See when user joined
- ✅ Booking Count - Track user's bookings

#### Permissions & Roles

- ✅ Permissions Management - Define role permissions
  - View permission matrix
  - Assign permissions to roles
- ✅ Decentralize (Role Assignment) - Assign roles to users
  - Change user from User → Staff
  - Change user from Staff → Admin
  - Downgrade user roles
- ✅ View Role Configuration - See all role definitions

#### Audit Logging

- ✅ View Audit Log - Complete activity log
  - User, action, resource, timestamp
  - Success/failure status
  - Optional details/notes
- ✅ Search Audit Log - Advanced filtering
  - By user
  - By action type
  - By resource
  - By date range
  - By status (success/failure)
- ✅ Export Audit Log - Download audit data (ready)

#### Staff Management

- ✅ Staff Management - Dedicated staff interface
  - List all staff members
  - Staff detail cards
  - Edit staff permissions
  - Activate/Deactivate staff accounts
  - Assign rooms to staff members

#### Violation Management

- ✅ View List Users Violated - Users with rule violations
  - Violation type
  - Severity level (high/medium/low)
  - Date and details
  - Resolution status
- ✅ Track Violations - Monitor violation history
- ✅ Resolve Violations - Mark as resolved
- ✅ Violation Analytics - Trends and patterns

#### Booking Management

- ✅ Cancel Booking - Force cancel user bookings
  - With or without refund
  - Notify user of cancellation

#### Additional Features

- 📝 System Analytics - Dashboard metrics
- 📝 User Reports - Generate user reports
- 📝 Revenue Analytics - Payment and revenue tracking
- 📝 System Health - Monitor system performance

**Dashboard Tabs:**

1. **Overview** - Key metrics and recent actions
2. **Users** - Searchable user list with role/status management
3. **Staff** - Staff member cards with permission controls
4. **Audit Logs** - Complete activity log with search
5. **Violations** - User violations with tracking

**Quick Stats:**

- Total Users count
- Staff Members count
- Active Bookings count
- Total Violations count

---

## 🔄 Role Transition Workflow

```
Guest (Anonymous)
  ↓ [Register] → User Account Created
  ↓ [Login]

User (Regular)
  ↓ [Promoted by Admin] → Staff Account
  ↓ [Full access to User features + Staff features]

Staff Member
  ↓ [Promoted by Admin] → Admin Account
  ↓ [Full access to all features]

Admin
  ↓ [Can demote to] → Staff or User
```

---

## 🔐 Feature Access Matrix

| Feature            | Guest | User | Staff | Admin |
| ------------------ | ----- | ---- | ----- | ----- |
| Register           | ✅    | ❌   | ❌    | ❌    |
| Login              | ✅    | ✅   | ✅    | ✅    |
| Logout             | ❌    | ✅   | ✅    | ✅    |
| View Rooms         | ✅    | ✅   | ✅    | ✅    |
| Search Rooms       | ✅    | ✅   | ✅    | ✅    |
| Create Booking     | ❌    | ✅   | ✅    | ✅    |
| Cancel Booking     | ❌    | ✅   | ✅    | ✅    |
| View Profile       | ❌    | ✅   | ✅    | ✅    |
| Edit Profile       | ❌    | ✅   | ✅    | ✅    |
| View Bookings      | ❌    | ✅   | ✅    | ✅    |
| Manage Rooms       | ❌    | ❌   | ✅    | ✅    |
| Approve Bookings   | ❌    | ❌   | ✅    | ✅    |
| Manage Users       | ❌    | ❌   | ❌    | ✅    |
| Assign Roles       | ❌    | ❌   | ❌    | ✅    |
| View Audit Logs    | ❌    | ❌   | ❌    | ✅    |
| Manage Permissions | ❌    | ❌   | ❌    | ✅    |

---

## 📍 Login Redirect Logic

```javascript
// After successful login:

if (user.role === "admin") {
  redirect → /dashboard/admin
}

else if (user.role === "staff") {
  redirect → /dashboard/staff
}

else {
  redirect → /dashboard/user  // Default user role
}

// Failed login:
redirect → /login (with error message)
```

---

## 🛡️ Protected Routes

### Route Protection Summary

| Route              | Protected | Required Role      | Fallback                                            |
| ------------------ | --------- | ------------------ | --------------------------------------------------- |
| `/`                | ❌ No     | None               | Shows marketing for guests, redirects authenticated |
| `/login`           | ❌ No     | None               | Redirects authenticated users away                  |
| `/register`        | ❌ No     | None               | Redirects authenticated users away                  |
| `/dashboard/user`  | ✅ Yes    | user, staff, admin | `/login`                                            |
| `/dashboard/staff` | ✅ Yes    | staff, admin       | `/unauthorized`                                     |
| `/dashboard/admin` | ✅ Yes    | admin              | `/unauthorized`                                     |

---

## 🔔 Push Notifications (Ready for Implementation)

- Booking approval notifications
- Room availability alerts
- Payment confirmations
- Violation notifications
- Staff announcements

---

## 📱 Mobile Responsive Design

All dashboards are fully responsive:

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

---

## ⚙️ Configuration

### Role IDs

```
"user" = 1    // Regular user
"staff" = 2   // Staff member
"admin" = 3   // Administrator
```

### Permission Scopes

```
"user:read" = View own data
"user:write" = Edit own data
"staff:read" = View staff features
"staff:write" = Modify rooms/bookings
"admin:read" = View all data
"admin:write" = Manage all data
"admin:delete" = Delete any resource
```

---

## 🚀 Next Implementation Steps

1. ✅ Home page role-based redirects
2. ✅ User dashboard with features
3. ✅ Admin dashboard implementation
4. ✅ Staff dashboard implementation
5. ⏳ Connect all dashboard features to backend APIs
6. ⏳ Add real-time notifications
7. ⏳ Implement role-based feature flags
8. ⏳ Add audit logging to all actions
9. ⏳ Implement permission inheritance
10. ⏳ Add role-based API endpoint restrictions
