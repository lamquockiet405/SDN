# Postman Test Cases (Auth + Audit)

> Base URL đề xuất: `http://localhost:8386/api`
>
> Lưu ý: trong source hiện tại endpoint là `/api/auth/...` và `/api/audit-logs/...`.

---

## ✅ UC-01: Register (Guest)

**Objective:** Guest đăng ký tài khoản mới.

### Endpoint

`POST http://localhost:8386/api/auth/register`

### Postman Setup

- **Method:** POST
- **Body:** raw → JSON
- **Headers:** `Content-Type: application/json`

### Request Body

```json
{
  "name": "Test student",
  "email": "teststudent@course.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Expected Result

- **Status:** `201 Created`
- `success = true`
- message: `User registered successfully`

### Negative Test (đăng ký email trùng)

`POST http://localhost:8386/api/auth/register`

```json
{
  "name": "Test student",
  "email": "teststudent@course.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Expected Result (Duplicate)

- **Status:** `400 Bad Request`
- `success = false`
- message: `User already exists`

---

## ✅ UC-05: Forgot Password

**Objective:** Gửi yêu cầu reset password qua email.

### Endpoint

`POST http://localhost:8386/api/auth/forgot-password`

### Request Body

```json
{
  "email": "teststudent@course.com"
}
```

### Expected Result

- **Status:** `200 OK`
- `success = true`
- message: `Password reset link sent to email`

### Negative/Privacy Test (email không tồn tại)

```json
{
  "email": "notfound@course.com"
}
```

### Expected Result

- **Status:** `200 OK` (không lộ thông tin user)
- `success = true`
- message dạng: `If an account with this email exists...`

---

## ✅ UC-06: Login

**Objective:** Đăng nhập và nhận JWT tokens.

### Endpoint

`POST http://localhost:8386/api/auth/login`

### Request Body

```json
{
  "email": "teststudent@course.com",
  "password": "password123"
}
```

### Expected Result

- **Status:** `200 OK`
- `success = true`
- Có `accessToken`
- Có `refreshToken`
- Có object `user`

### ⚠️ IMPORTANT

Lưu lại:

- `accessToken` → dùng cho UC-08, UC-09, UC-13, UC-43, UC-44
- `refreshToken` → dùng cho UC-10

---

## ✅ UC-07: Login with Google

**Objective:** Đăng nhập bằng **Google ID Token (JWT)**.

### Endpoint

`POST http://localhost:8386/api/auth/google-login`

### Request Body

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MWYxNDFhYTE5ZGYwYWM5N2RhYTU1ZTYwMDc2NmM0YzUzNjRjNDIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3OTcwMzM2MzIxODQtMGM2cnA1MzAydW9nNWdiN2dqdWUyajBhNTZ1Zm5wcTMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3OTcwMzM2MzIxODQtMGM2cnA1MzAydW9nNWdiN2dqdWUyajBhNTZ1Zm5wcTMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYyMjIxMDA0ODYyODAwNjkyNTAiLCJlbWFpbCI6ImxhbXF1b2NraWV0MjQwMzIxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3NzQzMTE3ODIsIm5hbWUiOiIxMkMzXzExX0zDom0gUXXhu5FjIEtp4buHdCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJVV9rVkE5YjM2aVFXN2h6TjlKQ2RHMjlzZFA4S093b3JvVHJXbEZqRDlmMy16cHowPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IjEyQzNfMTFfTMOibSBRdeG7kWMiLCJmYW1pbHlfbmFtZSI6Iktp4buHdCIsImlhdCI6MTc3NDMxMjA4MiwiZXhwIjoxNzc0MzE1NjgyLCJqdGkiOiJmMTFlYTgzYTllZTEyMjc3MzU2MjE1ODU5MGM2ZTQ3NjZkYjFkMTRjIn0.O2U3ia74ONAhQsgxLA5lGheiYwx0UZeCIYvdkkDHvG3pun-y0kgwTtIswRXHSr1ccVd8QLc8yjPdIWI_0fNvMV_6TWjRx4Ru9sbMepIKJH8fm_4MUk-qTy0FOcjAEja97bP6IrL15RdzkOuG1bvd9biNcZvpNX4incpgKL21hksVQTEoLBPj7ThfdWeu-2Sm37k3onIgF6bq_bbl6xg09sWqxlZtS54vbwNi_L-FyibA66NWn3LaEsXESoiKA0_AlO3rt-tjfpBQF34SRkNNaX2AEuFr0_2-clBZ1AM1pjPKInDTdjOpsibZwDx216YUSQ-Wo3AnXIBX4dvnQf9NvQ"
}
```

> ⚠️ `token` ở đây là **Google ID Token JWT** (chuỗi rất dài, dạng `eyJ...`),
> **không phải** `googleId` dạng số.
>
> Theo dữ liệu trong ảnh, `googleId` kiểu `106222100486280069250` sẽ xuất hiện trong `user.googleId` sau khi login thành công.

### Expected Result

- **Status:** `200 OK`
- `success = true`
- message: `Google login successful`
- Có `accessToken`, `refreshToken`, `user`
- `user.googleId` có dạng số chuỗi (vd: `106222100486280069250`)

### Negative Test

```json
{
  "token": "invalid-token"
}
```

### Expected Result

- **Status:** `401 Unauthorized`
- `success = false`
- message: `Invalid or expired Google token`

---

## ✅ UC-08: Logout

**Objective:** Logout tài khoản đang đăng nhập.

### Endpoint

`POST http://localhost:8386/api/auth/logout`

### Postman Setup

- **Authorization:** Bearer Token
- Token: `<accessToken_from_UC06_or_UC07>`

### Request Body

```json
{}
```

### Expected Result

- **Status:** `200 OK`
- `success = true`
- message: `Logout successful`

---

## ✅ UC-09: Two-Factor Authentication (2FA)

### 9.1 Enable 2FA

**Endpoint:** `POST http://localhost:8386/api/auth/2fa/enable`

**Authorization:** Bearer Token

**Body**

```json
{
  "password": "password123"
}
```

**Expected**

- **Status:** `200 OK`
- `success = true`
- Có `qrCode`, `secret`

### 9.2 Verify Setup 2FA

**Endpoint:** `POST http://localhost:8386/api/auth/2fa/verify-setup`

**Authorization:** Bearer Token

**Body**

```json
{
  "otp": "123456"
}
```

**Expected**

- **Status:** `200 OK`
- `success = true`
- message: `2FA enabled successfully`

### 9.3 Verify 2FA when login flow

**Endpoint:** `POST http://localhost:8386/api/auth/2fa/verify`

**Body**

```json
{
  "email": "teststudent@course.com",
  "otp": "123456"
}
```

**Expected**

- **Status:** `200 OK`
- `success = true`
- Có `accessToken`, `refreshToken`

---

## ✅ UC-10: Refresh Access Token

**Objective:** Dùng `refreshToken` để lấy access token mới.

### Endpoint

`POST http://localhost:8386/api/auth/refresh`

### Request Body

```json
{
  "refreshToken": "<refreshToken_from_UC06_or_UC07>"
}
```

### Expected Result

- **Status:** `200 OK`
- `success = true`
- Có `accessToken` mới

### Negative Test

```json
{
  "refreshToken": "invalid_refresh_token"
}
```

### Expected Result

- **Status:** `401 Unauthorized`
- `success = false`
- message: `Invalid refresh token`

---

## ✅ UC-13: Change Password

**Objective:** User đổi mật khẩu khi đã đăng nhập.

### Endpoint

`POST http://localhost:8386/api/auth/change-password`

### Postman Setup

- **Authorization:** Bearer Token
- Token: `<accessToken>`

### Request Body

```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### Expected Result

- **Status:** `200 OK`
- `success = true`
- message: `Password changed successfully`

### Negative Test (confirm mismatch)

```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword123",
  "confirmPassword": "wrongConfirm123"
}
```

### Expected Result

- **Status:** `400 Bad Request`
- `success = false`
- message: `Passwords do not match`

---

## ✅ UC-14: Create Booking

**Objective:** User tạo booking đơn.

### Endpoint

`POST http://localhost:8386/api/bookings`

### Postman Setup

- **Authorization:** Bearer Token (`user` đã login)
- **Body:** raw → JSON

### Request Body

```json
{
  "roomId": "<roomId>",
  "startTime": "2026-03-25T08:00:00.000Z",
  "endTime": "2026-03-25T10:00:00.000Z",
  "specialRequests": "Need projector"
}
```

### Expected Result

- **Status:** `201 Created`
- `success = true`
- message: `Booking created successfully`
- Có object `booking` với `status = pending`

### Negative Test

- Slot chưa được admin cấu hình hoặc không available
- **Status:** `400 Bad Request`
- message: `Selected time slot is not configured by admin` hoặc `Selected time slot is not available`

---

## ✅ UC-15: Group Booking

**Objective:** User tạo booking nhóm.

### Endpoint

`POST http://localhost:8386/api/bookings/group`

### Postman Setup

- **Authorization:** Bearer Token (`user` đã login)

### Request Body

```json
{
  "roomId": "<roomId>",
  "startTime": "2026-03-26T01:00:00.000Z",
  "endTime": "2026-03-26T03:00:00.000Z",
  "participants": ["member1@course.com", "member2@course.com"],
  "specialRequests": "Team discussion"
}
```

### Expected Result

- **Status:** `201 Created`
- `success = true`
- message: `Group booking created successfully`
- `booking.groupBooking = true`

### Negative Test

```json
{
  "roomId": "<roomId>",
  "startTime": "2026-03-26T01:00:00.000Z",
  "endTime": "2026-03-26T03:00:00.000Z",
  "participants": ["member1@course.com"]
}
```

- **Status:** `400 Bad Request`
- message: `Group booking requires at least 2 participants`

---

## ✅ UC-16: Cancel Booking (User/Admin)

**Objective:** User (owner) hoặc admin hủy booking.

### Endpoint

`PATCH http://localhost:8386/api/bookings/:id/cancel`

### Postman Setup

- **Authorization:** Bearer Token

### Request Body

```json
{
  "reason": "Change schedule"
}
```

### Expected Result

- **Status:** `200 OK`
- `success = true`
- message: `Booking cancelled successfully`
- `booking.status = cancelled`

### Negative Test

- User không phải owner và không phải admin
- **Status:** `403 Forbidden`
- message: `Not authorized to cancel this booking`

---

e`

- Có `bookings`, `total`, `pages`, `page`

---

## ✅ UC-30: Approve Booking

**Objective:** Admin/Staff duyệt booking pending.

### Endpoint

`PATCH http://localhost:8386/api/bookings/:id/approve`

### Postman Setup

- **Authorization:** Bearer Token (role `admin` hoặc `staff`)

### Expected Result

- **Status:** `200 OK`
- `success = true`
- message: `Booking approved`
- `booking.status = approved`

### Negative Test

- Booking không ở trạng thái có thể duyệt (không phải pending)
- **Status:** `400 Bad Request`
- message dạng: `Cannot approve booking in status ...`

---

## ✅ UC-31: Reject Booking

**Objective:** Admin/Staff từ chối booking pending.

### Endpoint

`PATCH http://localhost:8386/api/bookings/:id/reject`

### Postman Setup

- **Authorization:** Bearer Token (role `admin` hoặc `staff`)

### Request Body

```json
{
  "reason": "Room maintenance"
}
```

### Expected Result

- **Status:** `200 OK`
- `success = true`
- message: `Booking rejected`
- `booking.status = rejected`

### Negative Test

- Booking không ở trạng thái có thể reject
- **Status:** `400 Bad Request`
- message dạng: `Cannot reject booking in status ...`

---

## ✅ UC-47: Cancel Booking (Admin Force Cancel)

**Objective:** Admin force cancel booking.

### Endpoint

`PATCH http://localhost:8386/api/bookings/:id/force-cancel`

### Postman Setup

- **Authorization:** Bearer Token (role `admin`)

### Request Body

```json
{
  "reason": "Policy violation"
}
```

### Expected Result

- **Status:** `200 OK`
- `success = true`
- message: `Booking cancelled successfully`
- `booking.status = cancelled`

### Negative Test

- Dùng token role `staff` hoặc `user`
- **Status:** `403 Forbidden`
- message: `Access denied. Admin role required.`

---

## ✅ UC-43: View Audit Log

**Objective:** Admin/Staff xem danh sách audit logs.

`POST http://localhost:8386/api/auth/login`
{
"email": "kiet1@gmail.com",
"password": "123456"
}

### Endpoint

`GET http://localhost:8386/api/audit-logs?page=1&limit=20`

### Postman Setup

- **Authorization:** Bearer Token
- Token phải thuộc role `admin` hoặc `staff`

### Expected Result

- **Status:** `200 OK`
- `success = true`
- Có `logs`, `total`, `pages`, `page`

### Negative Test (role user thường)

- **Expected:** `403 Forbidden` (không đủ quyền)

---

## ✅ UC-44: Search Audit Log

**Objective:** Admin/Staff lọc audit logs theo điều kiện.

### Endpoint

`GET http://localhost:8386/api/audit-logs/search?action=LOGIN&startDate=2026-03-01&endDate=2026-03-31&page=1&limit=20`

### Query Params có thể dùng

- `userId`
- `action`
- `startDate` (YYYY-MM-DD)
- `endDate` (YYYY-MM-DD)
- `page`
- `limit`

### Postman Setup

- **Authorization:** Bearer Token
- Token role `admin` hoặc `staff`

### Expected Result

- **Status:** `200 OK`
- `success = true`
- Trả về `logs` đã lọc theo params

---

## Quick Run Order (khuyến nghị)

1. UC-01 Register
2. UC-06 Login
3. UC-14 Create Booking
4. UC-15 Group Booking
5. UC-30 Approve Booking (admin/staff)
6. UC-17 Check-in Room
7. UC-18 Check-out Room
8. UC-16 Cancel Booking (owner/admin)
9. UC-21 View Booking History
10. UC-47 Cancel Booking (admin force cancel)
11. UC-10 Refresh Token
12. UC-08 Logout
13. UC-09 2FA (enable/verify)
14. UC-13 Change Password
15. UC-43 View Audit Log
16. UC-44 Search Audit Log
17. UC-05 Forgot Password
18. UC-07 Google Login
