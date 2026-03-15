# Dashboard Access Guide

## Staff Dashboard

**URL:** `http://localhost:3000/dashboard/staff`

### Who Can Access?

- Staff members (role: "staff")
- Admins (role: "admin")

### What Can They Do?

1. **Room Management**
   - Browse all study rooms
   - Toggle availability status
   - Edit room details
   - Add new rooms

2. **Booking Approvals**
   - View pending booking requests
   - Approve bookings
   - Reject bookings
   - Track booking status

3. **Reports & Issues**
   - View damage reports
   - Track maintenance requests
   - Monitor room cleanliness issues
   - View severity levels

### Key Statistics

- Total Rooms
- Available Rooms
- Pending Approvals
- Issues Reported

---

## Admin Dashboard

**URL:** `http://localhost:3000/dashboard/admin`

### Who Can Access?

- Admins only (role: "admin")

### What Can They Do?

1. **Overview**
   - System performance metrics
   - Recent user actions
   - Dashboard statistics

2. **User Management**
   - Search users by name/email
   - View all users
   - Change user roles
   - Update user status (active/inactive/suspended)

3. **Staff Management**
   - List all staff members
   - Edit staff permissions
   - Activate/Deactivate staff accounts

4. **Audit Logs**
   - Search audit logs
   - Filter by user/action/resource
   - View timestamps
   - Track system activities

5. **Violations**
   - View all user violations
   - Filter by severity (high/medium/low)
   - Mark violations as resolved
   - Track violation history

### Key Statistics

- Total Users
- Staff Members
- Active Bookings
- Total Violations

---

## Testing Dashboard Access

### Test Case 1: Staff Member Login

1. Register with staff role
2. Login with staff account
3. Navigate to `/dashboard/staff` ✅
4. Navigate to `/dashboard/admin` ❌ (Should redirect to /unauthorized)

### Test Case 2: Admin Login

1. Register/Login with admin account
2. Navigate to `/dashboard/admin` ✅
3. Navigate to `/dashboard/staff` ✅ (Admin can access both)

### Test Case 3: Regular User Login

1. Register as regular user (default role)
2. Login with user account
3. Navigate to `/dashboard/staff` ❌ (Should redirect to /unauthorized)
4. Navigate to `/dashboard/admin` ❌ (Should redirect to /unauthorized)

### Test Case 4: Not Authenticated

1. Don't login
2. Navigate to `/dashboard/staff` ❌ (Should redirect to /login)
3. Navigate to `/dashboard/admin` ❌ (Should redirect to /login)

---

## Features by Role

### Staff Features (UC_27-UC_39)

- ✅ Room management (list, toggle availability)
- ✅ Booking approval/rejection workflow
- ✅ Time slot management interface
- ✅ Room usage monitoring
- ✅ Report/issue tracking
- ✅ Evidence review system
- ✅ Rating management (ready for API)

### Admin Features (UC_40-UC_49)

- ✅ System overview dashboard
- ✅ User management (list, status, role changes)
- ✅ Audit log viewing and search
- ✅ Permission management interface
- ✅ Role assignment functionality
- ✅ Staff account management
- ✅ Violation tracking and resolution

---

## Default Test Credentials

Since backend authentication is running:

### Admin Account (Create via API first)

- Email: admin@university.com
- Password: AdminPassword123!
- Access: `/dashboard/admin`

### Staff Account (Create via API first)

- Email: staff@university.com
- Password: StaffPassword123!
- Access: `/dashboard/staff`

### Regular User Account

- Email: student@university.com
- Password: StudentPassword123!
- Access: `/dashboard` (generic dashboard only)

---

## Troubleshooting

**Issue: Page shows loading spinner indefinitely**

- Check if you're authenticated
- Check browser console for errors
- Verify AuthContext is working

**Issue: Redirect to /unauthorized**

- Your role doesn't have access
- Check user.role in AuthContext
- Make sure you're logged in with correct role

**Issue: Redirect to /login**

- You're not authenticated
- Session may have expired
- Login again with valid credentials

**Issue: Data not loading**

- Check browser Network tab for API calls
- Verify backend is running (localhost:5000)
- Check for API endpoint errors

---

## Keyboard Shortcuts (Optional Features)

- None implemented yet (can be added later)

---

## Mobile Responsiveness

- ✅ Responsive grid layouts
- ✅ Mobile-friendly tables
- ✅ Touch-friendly buttons
- ✅ Responsive navigation tabs
- ✅ Mobile-optimized search inputs

---

## Dark Mode

- Not currently implemented
- Can be added through Tailwind dark mode

---

## Performance Optimizations Ready

- Pagination for large datasets
- Search/filter optimization
- Lazy loading for images
- Table virtualization (for many rows)
