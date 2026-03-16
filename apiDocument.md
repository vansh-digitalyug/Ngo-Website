# SevaIndia NGO Platform — API Documentation

All endpoints are prefixed with the base URL (e.g. `http://localhost:5000`).
Base URL is excluded from paths below.

---

## Table of Contents

1. [Authentication — `/api`](#1-authentication--api)
2. [Volunteer — `/api/volunteer`](#2-volunteer--apivolunteer)
3. [NGO — `/api/ngo`](#3-ngo--apingo)
4. [NGO Dashboard — `/api/ngo-dashboard`](#4-ngo-dashboard--apingo-dashboard)
5. [Contact — `/api/contact`](#5-contact--apicontact)
6. [KYC — `/api/kyc`](#6-kyc--apikyc)
7. [Admin — `/api/admin`](#7-admin--apiadmin)
8. [Gallery — `/api/gallery`](#8-gallery--apigallery)
9. [Payment — `/api/payment`](#9-payment--apipayment)
10. [S3 — `/api/s3`](#10-s3--apis3)
11. [Kanyadan — `/api/kanyadan`](#11-kanyadan--apikanyadan)
12. [Tasks — `/api/tasks`](#12-tasks--apitasks)
13. [Public — `/api/public`](#13-public--apipublic)
14. [Services — `/api/services`](#14-services--apiservices)
15. [Blog — `/api/blogs`](#15-blog--apiblogs)
16. [OTP — `/api/otp`](#16-otp--apiotp)
17. [Events — `/api/events`](#17-events--apievents)

---

## Auth Header Convention

Protected routes require a JWT token in one of two formats (depending on the route's middleware):

```
Authorization: Bearer <token>
```

or via HTTP-only cookie set on login. Most routes use the `Authorization` header.

---

## 1. Authentication — `/api`

### POST `/api/send-register-otp`
Send OTP to email before registration.

**Auth:** None

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{ "success": true, "message": "OTP sent to email" }
```

---

### POST `/api/register`
Register a new user (OTP must be verified first).

**Auth:** None

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword",
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "token": "<jwt>", "user": { ... } }
}
```

---

### POST `/api/login`
Login as user or NGO.

**Auth:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "loginType": "user"
}
```
> `loginType`: `"user"` | `"ngo"` | `"admin"`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "<jwt>", "user": { ... } }
}
```

---

### POST `/api/google-login`
Login or register via Google OAuth.

**Auth:** None

**Request Body:**
```json
{
  "credential": "<google_id_token>"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "token": "<jwt>", "user": { ... } }
}
```

---

### POST `/api/forgot-password`
Send password reset link to email.

**Auth:** None

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Password reset email sent" }
```

---

### POST `/api/reset-password/:token`
Reset password using token from email.

**Auth:** None

**URL Params:**
- `token` — reset token from email link

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Password reset successful" }
```

---

### GET `/api/profile`
Get currently logged-in user's profile.

**Auth:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "9876543210",
    "role": "user",
    "avatar": "...",
    "emailVerified": true
  }
}
```

---

### PUT `/api/profile`
Update current user profile (supports avatar upload).

**Auth:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name |
| `phone` | string | Phone number |
| `avatar` | file | Profile image (max 5MB, JPEG/PNG) |

**Response:** `200 OK`
```json
{ "success": true, "data": { ...updatedUser } }
```

---

### POST `/api/email-verification/send-otp`
Send email verification OTP.

**Auth:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{ "success": true, "message": "OTP sent to email" }
```

---

### POST `/api/email-verification/verify-otp`
Verify email with OTP.

**Auth:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "otp": "123456" }
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Email verified successfully" }
```

---

### POST `/api/change-password`
Change password for logged-in user.

**Auth:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Password changed successfully" }
```

---

### POST `/api/logout`
Logout and invalidate token.

**Auth:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### GET `/api/profile/donations`
Get donation history for logged-in user.

**Auth:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...donation } ] }
```

---

### GET `/api/profile/volunteer`
Get volunteer application for logged-in user.

**Auth:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{ "success": true, "data": { ...volunteerApplication } }
```

---

### GET `/api/profile/kanyadan`
Get Kanyadan applications matched by user's phone.

**Auth:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...kanyadanApplication } ] }
```

---

## 2. Volunteer — `/api/volunteer`

### GET `/api/volunteer/status`
Get current user's volunteer application status.

**Auth:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{ "success": true, "data": { "status": "pending" | "approved" | "rejected", ... } }
```

---

### POST `/api/volunteer/apply`
Submit a volunteer application.

**Auth:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "city": "Mumbai",
  "skills": ["teaching", "coding"],
  "availability": "weekends",
  "motivation": "I want to help..."
}
```

**Response:** `201 Created`
```json
{ "success": true, "message": "Application submitted", "data": { ...application } }
```

---

## 3. NGO — `/api/ngo`

### POST `/api/ngo/create`
Register a new NGO. Documents are uploaded to S3 first; pass S3 keys here.

**Auth:** Optional (links to user if logged in)

**Request Body:**
```json
{
  "name": "NGO Name",
  "email": "ngo@example.com",
  "phone": "9876543210",
  "password": "securepassword",
  "city": "Delhi",
  "state": "Delhi",
  "description": "About this NGO...",
  "registrationNumber": "REG123",
  "panNumber": "ABCDE1234F",
  "registrationCertificateKey": "s3-key/reg-cert.pdf",
  "panCardKey": "s3-key/pan.pdf",
  "logo": "s3-key/logo.jpg"
}
```

**Response:** `201 Created`
```json
{ "success": true, "message": "NGO registered successfully", "data": { ...ngo } }
```

---

### GET `/api/ngo`
Get all approved NGOs (public).

**Auth:** None

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `city` | string | Filter by city |
| `state` | string | Filter by state |

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...ngo } ], "total": 50, "page": 1 }
```

---

### GET `/api/ngo/:id`
Get a single NGO by ID.

**Auth:** None

**URL Params:**
- `id` — NGO MongoDB ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": { ...ngo } }
```

---

### GET `/api/ngo/:id/gallery`
Get gallery items for a specific NGO.

**Auth:** None

**URL Params:**
- `id` — NGO MongoDB ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...galleryItem } ] }
```

---

## 4. NGO Dashboard — `/api/ngo-dashboard`

All routes (except `/status`) require NGO authentication via `ngoToken` cookie or header.

**NGO Auth Header:**
```
Authorization: Bearer <ngo_jwt_token>
```

---

### GET `/api/ngo-dashboard/status`
Check NGO application status (no strict auth required).

**Auth:** None (uses `checkNgoStatus` middleware)

**Response:** `200 OK`
```json
{ "success": true, "data": { "status": "pending" | "approved" | "rejected" } }
```

---

### GET `/api/ngo-dashboard/dashboard`
Get NGO dashboard stats.

**Auth:** NGO Auth

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalDonations": 50000,
    "totalVolunteers": 12,
    "totalEvents": 5
  }
}
```

---

### GET `/api/ngo-dashboard/profile`
Get NGO profile.

**Auth:** NGO Auth

**Response:** `200 OK`
```json
{ "success": true, "data": { ...ngoProfile } }
```

---

### PUT `/api/ngo-dashboard/profile`
Update NGO profile.

**Auth:** NGO Auth

**Request Body:**
```json
{
  "name": "Updated NGO Name",
  "description": "Updated description",
  "phone": "9876543210",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...updatedProfile } }
```

---

### GET `/api/ngo-dashboard/gallery`
Get NGO's gallery items.

**Auth:** NGO Auth

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...galleryItem } ] }
```

---

### GET `/api/ngo-dashboard/gallery/upload-url`
Get presigned S3 URL for uploading a gallery image.

**Auth:** NGO Auth

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `filename` | string | Original filename |
| `contentType` | string | MIME type (e.g. `image/jpeg`) |

**Response:** `200 OK`
```json
{ "success": true, "data": { "uploadUrl": "https://...", "key": "ngo-gallery/..." } }
```

---

### POST `/api/ngo-dashboard/gallery`
Add a gallery item after uploading to S3.

**Auth:** NGO Auth

**Request Body:**
```json
{
  "title": "Community Event",
  "description": "Photo from event",
  "imageKey": "ngo-gallery/image.jpg",
  "type": "image"
}
```

**Response:** `201 Created`
```json
{ "success": true, "data": { ...galleryItem } }
```

---

### DELETE `/api/ngo-dashboard/gallery/:id`
Delete a gallery item.

**Auth:** NGO Auth

**URL Params:**
- `id` — Gallery item ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Gallery item deleted" }
```

---

### GET `/api/ngo-dashboard/volunteers`
Get volunteers associated with this NGO.

**Auth:** NGO Auth

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...volunteer } ] }
```

---

### POST `/api/ngo-dashboard/volunteers/add`
Add a volunteer to the NGO.

**Auth:** NGO Auth

**Request Body:**
```json
{ "volunteerId": "mongo_object_id" }
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Volunteer added" }
```

---

### PUT `/api/ngo-dashboard/volunteers/:id`
Update a volunteer's status.

**Auth:** NGO Auth

**URL Params:**
- `id` — Volunteer ObjectId

**Request Body:**
```json
{ "status": "active" | "inactive" }
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...volunteer } }
```

---

### POST `/api/ngo-dashboard/funds/request`
Request funds from admin.

**Auth:** NGO Auth

**Request Body:**
```json
{
  "amount": 50000,
  "purpose": "Medical supplies for children",
  "description": "Detailed description..."
}
```

**Response:** `201 Created`
```json
{ "success": true, "data": { ...fundRequest } }
```

---

### GET `/api/ngo-dashboard/funds`
Get this NGO's fund requests.

**Auth:** NGO Auth

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...fundRequest } ] }
```

---

### PUT `/api/ngo-dashboard/funds/:id/resolve`
Resolve a fund ticket.

**Auth:** NGO Auth

**URL Params:**
- `id` — Fund request ObjectId

**Request Body:**
```json
{ "resolution": "Funds received. Thank you." }
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...fundRequest } }
```

---

### GET `/api/ngo-dashboard/donations`
Get donation history for this NGO.

**Auth:** NGO Auth

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...donation } ] }
```

---

## 5. Contact — `/api/contact`

### POST `/api/contact`
Submit a contact/inquiry message (public).

**Auth:** None

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "9876543210",
  "subject": "Donation query",
  "message": "I want to know more about donations..."
}
```

**Response:** `201 Created`
```json
{ "success": true, "message": "Message sent successfully" }
```

---

### GET `/api/contact/all`
Get all contact submissions (admin).

**Auth:** `Authorization: Bearer <token>` (admin)

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...contact } ] }
```

---

### GET `/api/contact/:id`
Get a single contact by ID.

**Auth:** `Authorization: Bearer <token>` (admin)

**URL Params:**
- `id` — Contact ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": { ...contact } }
```

---

### PUT `/api/contact/:id/status`
Update contact status.

**Auth:** `Authorization: Bearer <token>` (admin)

**URL Params:**
- `id` — Contact ObjectId

**Request Body:**
```json
{ "status": "pending" | "resolved" | "in-progress" }
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...contact } }
```

---

### POST `/api/contact/:id/reply`
Reply to a contact message via email.

**Auth:** `Authorization: Bearer <token>` (admin)

**URL Params:**
- `id` — Contact ObjectId

**Request Body:**
```json
{ "message": "Thank you for reaching out..." }
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Reply sent" }
```

---

### DELETE `/api/contact/:id`
Delete a contact message.

**Auth:** `Authorization: Bearer <token>` (admin)

**URL Params:**
- `id` — Contact ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Contact deleted" }
```

---

## 6. KYC — `/api/kyc`

### POST `/api/kyc/aadhaar-otp`
Request OTP for Aadhaar verification.

**Auth:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "aadhaarNumber": "123456789012" }
```

**Response:** `200 OK`
```json
{ "success": true, "message": "OTP sent to Aadhaar-linked mobile" }
```

---

### POST `/api/kyc/verify-aadhaar`
Verify Aadhaar using OTP.

**Auth:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "aadhaarNumber": "123456789012",
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Aadhaar verified successfully" }
```

---

### POST `/api/kyc/verify-pan`
Verify PAN card.

**Auth:** `Authorization: Bearer <token>`

**Request Body:**
```json
{ "panNumber": "ABCDE1234F" }
```

**Response:** `200 OK`
```json
{ "success": true, "message": "PAN verified successfully" }
```

---

## 7. Admin — `/api/admin`

All routes except `/admin/login` require Admin JWT token.

**Admin Auth Header:**
```
Authorization: Bearer <admin_token>
```

---

### POST `/api/admin/login`
Admin login.

**Auth:** None

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpassword",
  "loginType": "admin"
}
```

**Response:** `200 OK`
```json
{ "success": true, "data": { "token": "<jwt>", "user": { "role": "admin", ... } } }
```

---

### GET `/api/admin/dashboard`
Get dashboard statistics.

**Auth:** Admin

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalUsers": 500,
    "totalNgos": 30,
    "totalDonations": 1500000,
    "totalVolunteers": 80,
    "pendingContacts": 5
  }
}
```

---

### GET `/api/admin/ngos`
Get all NGOs.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...ngo } ] }
```

---

### PUT `/api/admin/ngos/:id/status`
Update NGO approval status.

**Auth:** Admin

**URL Params:** `id` — NGO ObjectId

**Request Body:**
```json
{ "status": "approved" | "rejected" | "pending" }
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...ngo } }
```

---

### DELETE `/api/admin/ngos/:id`
Delete an NGO.

**Auth:** Admin

**URL Params:** `id` — NGO ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "NGO deleted" }
```

---

### GET `/api/admin/volunteers`
Get all volunteer applications.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...volunteer } ] }
```

---

### PUT `/api/admin/volunteers/:id/status`
Update volunteer application status.

**Auth:** Admin

**URL Params:** `id` — Volunteer ObjectId

**Request Body:**
```json
{ "status": "approved" | "rejected" | "pending" }
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...volunteer } }
```

---

### DELETE `/api/admin/volunteers/:id`
Delete a volunteer application.

**Auth:** Admin

**URL Params:** `id` — Volunteer ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Volunteer deleted" }
```

---

### GET `/api/admin/contacts`
Get all contact messages.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...contact } ] }
```

---

### PUT `/api/admin/contacts/:id/status`
Update contact message status.

**Auth:** Admin

**URL Params:** `id` — Contact ObjectId

**Request Body:**
```json
{ "status": "pending" | "resolved" | "in-progress" }
```

**Response:** `200 OK`

---

### DELETE `/api/admin/contacts/:id`
Delete a contact message.

**Auth:** Admin

**URL Params:** `id` — Contact ObjectId

**Response:** `200 OK`

---

### GET `/api/admin/users`
Get all registered users.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...user } ] }
```

---

### GET `/api/admin/funds`
Get all NGO fund requests.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...fundRequest } ] }
```

---

### PUT `/api/admin/funds/:id/status`
Update fund request status.

**Auth:** Admin

**URL Params:** `id` — Fund request ObjectId

**Request Body:**
```json
{ "status": "approved" | "rejected" | "pending" }
```

**Response:** `200 OK`

---

### GET `/api/admin/donations`
Get all donations.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...donation } ] }
```

---

### GET `/api/admin/donations/by-ngo`
Get donations grouped by NGO.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { "ngo": {...}, "total": 50000 } ] }
```

---

### GET `/api/admin/kanyadan`
Get all Kanyadan Yojna applications.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...application } ] }
```

---

### GET `/api/admin/kanyadan/stats`
Get Kanyadan application statistics.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": { "total": 100, "pending": 30, "approved": 60, "rejected": 10 } }
```

---

### PUT `/api/admin/kanyadan/:id/status`
Update Kanyadan application status.

**Auth:** Admin

**URL Params:** `id` — Application ObjectId

**Request Body:**
```json
{ "status": "approved" | "rejected" | "pending" }
```

**Response:** `200 OK`

---

### DELETE `/api/admin/kanyadan/:id`
Delete a Kanyadan application.

**Auth:** Admin

**URL Params:** `id` — Application ObjectId

**Response:** `200 OK`

---

### POST `/api/admin/categories`
Create a service category.

**Auth:** Admin

**Request Body:**
```json
{
  "name": "Education",
  "description": "Educational programs",
  "imageKey": "s3-key/category-image.jpg"
}
```

**Response:** `201 Created`
```json
{ "success": true, "data": { ...category } }
```

---

### GET `/api/admin/categories`
Get all service categories.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...category } ] }
```

---

### POST `/api/admin/programs`
Create a service program.

**Auth:** Admin

**Request Body:** See [POST `/api/services/admin/programs`](#post-apiservicesadminprograms)

**Response:** `201 Created`

---

### GET `/api/admin/categories/:categoryId/programs`
Get programs for a category.

**Auth:** Admin

**URL Params:** `categoryId` — Category ObjectId

**Response:** `200 OK`

---

### GET `/api/admin/programs`
Get all programs.

**Auth:** Admin

**Response:** `200 OK`

---

### GET `/api/admin/programs/:programId`
Get program by ID.

**Auth:** Admin

**URL Params:** `programId` — Program ObjectId

**Response:** `200 OK`

---

### GET `/api/admin/programs/title/:title`
Get program by title.

**Auth:** Admin

**URL Params:** `title` — Program title (URL encoded)

**Response:** `200 OK`

---

### PUT `/api/admin/programs/:programId`
Update a program.

**Auth:** Admin

**URL Params:** `programId` — Program ObjectId

**Request Body:** See [PUT `/api/services/admin/programs/:programId`](#put-apiservicesadminprogramsprogramid)

**Response:** `200 OK`

---

### DELETE `/api/admin/programs/:programId`
Soft delete a program (sets isActive = false).

**Auth:** Admin

**URL Params:** `programId` — Program ObjectId

**Response:** `200 OK`

---

### DELETE `/api/admin/categories/:categoryId`
Delete a service category.

**Auth:** Admin

**URL Params:** `categoryId` — Category ObjectId

**Response:** `200 OK`

---

## 8. Gallery — `/api/gallery`

### GET `/api/gallery/images`
Get all approved gallery images (public, paginated).

**Auth:** None

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `category` | string | Filter by category (case-sensitive enum value) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "images": [ { "_id": "...", "title": "...", "imageUrl": "...", "category": "...", ... } ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

---

### GET `/api/gallery/videos`
Get all approved gallery videos (public, paginated).

**Auth:** None

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `category` | string | Filter by category |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "videos": [ { ... } ], "total": 20, "page": 1, "totalPages": 1 }
}
```

---

### GET `/api/gallery/categories`
Get categories with item counts.

**Auth:** None

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | `"image"` or `"video"` (optional) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ { "category": "Food Distribution", "count": 25 } ]
}
```

---

### GET `/api/gallery/search`
Search gallery items by title or description.

**Auth:** None

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (matches title and description) |
| `type` | string | `"image"` or `"video"` (optional) |
| `category` | string | Filter by category (optional) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "items": [ { ... } ], "total": 10, "page": 1 }
}
```

---

### GET `/api/gallery/admin/all`
Get all gallery items including unapproved ones (admin).

**Auth:** Admin

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `type` | string | `"image"` or `"video"` |
| `status` | string | `"pending"` \| `"approved"` \| `"rejected"` |

**Response:** `200 OK`

---

### POST `/api/gallery/admin/image`
Upload a new gallery image (admin).

**Auth:** Admin

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `image` | file | Image file (JPEG/PNG/GIF/WebP, max 10MB) |
| `title` | string | Image title |
| `description` | string | Description |
| `category` | string | Category name |
| `tags` | string | Comma-separated tags |

**Response:** `201 Created`
```json
{ "success": true, "data": { ...galleryItem } }
```

---

### POST `/api/gallery/admin/video`
Add a gallery video with optional thumbnail (admin).

**Auth:** Admin

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `thumbnail` | file | Thumbnail image (optional, max 10MB) |
| `title` | string | Video title |
| `description` | string | Description |
| `videoUrl` | string | Video URL (YouTube, Vimeo, etc.) |
| `category` | string | Category name |
| `tags` | string | Comma-separated tags |

**Response:** `201 Created`

---

### PUT `/api/gallery/admin/:id`
Update a gallery item (admin).

**Auth:** Admin

**URL Params:** `id` — Gallery item ObjectId

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "Events",
  "tags": ["community", "health"]
}
```

**Response:** `200 OK`

---

### PUT `/api/gallery/admin/:id/approve`
Approve a gallery item.

**Auth:** Admin

**URL Params:** `id` — Gallery item ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Gallery item approved" }
```

---

### PUT `/api/gallery/admin/:id/reject`
Reject a gallery item.

**Auth:** Admin

**URL Params:** `id` — Gallery item ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Gallery item rejected" }
```

---

### DELETE `/api/gallery/admin/:id`
Delete a gallery item.

**Auth:** Admin

**URL Params:** `id` — Gallery item ObjectId

**Response:** `200 OK`

---

### POST `/api/gallery/admin/bulk-delete`
Delete multiple gallery items at once.

**Auth:** Admin

**Request Body:**
```json
{ "ids": ["id1", "id2", "id3"] }
```

**Response:** `200 OK`
```json
{ "success": true, "message": "3 items deleted" }
```

---

## 9. Payment — `/api/payment`

### POST `/api/payment/order`
Create a Razorpay order.

**Auth:** Optional (links to user if logged in)

**Request Body:**
```json
{
  "amount": 500,
  "currency": "INR",
  "ngoId": "mongo_object_id",
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "donorPhone": "9876543210",
  "message": "For a good cause"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "orderId": "order_Xxxxxxx",
    "amount": 50000,
    "currency": "INR",
    "keyId": "rzp_test_..."
  }
}
```

---

### POST `/api/payment/verify`
Verify Razorpay payment signature after checkout.

**Auth:** None

**Request Body:**
```json
{
  "razorpay_order_id": "order_Xxxxxxx",
  "razorpay_payment_id": "pay_Xxxxxxx",
  "razorpay_signature": "signature_hash"
}
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Payment verified successfully" }
```

---

### POST `/api/payment/webhook`
Razorpay webhook endpoint.

**Auth:** None (raw body — Razorpay signature verified internally)

**Headers:**
```
x-razorpay-signature: <signature>
Content-Type: application/json
```

**Response:** `200 OK`

---

### GET `/api/payment/history`
Get payment history for logged-in user.

**Auth:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...payment } ] }
```

---

## 10. S3 — `/api/s3`

### POST `/api/s3/generate-upload-url`
Get a presigned S3 PUT URL for uploading a file directly from the browser.

**Auth:** None

**Request Body:**
```json
{
  "filename": "document.pdf",
  "contentType": "application/pdf",
  "folder": "ngo-documents"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "key": "ngo-documents/1234567890-document.pdf"
  }
}
```

---

### GET `/api/s3/get-url`
Get a short-lived presigned GET URL for a private S3 object.

**Auth:** None

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `key` | string | S3 object key |

**Response:** `200 OK`
```json
{ "success": true, "data": { "url": "https://s3.amazonaws.com/..." } }
```

---

## 11. Kanyadan — `/api/kanyadan`

### POST `/api/kanyadan/apply`
Submit a Kanyadan Yojna application (public).

**Auth:** None

**Request Body:**
```json
{
  "applicantName": "Ramesh Kumar",
  "phone": "9876543210",
  "email": "ramesh@example.com",
  "address": "123 Main Street, Delhi",
  "state": "Delhi",
  "city": "New Delhi",
  "pincode": "110001",
  "daughterName": "Priya Kumar",
  "daughterAge": 22,
  "marriageDate": "2025-06-15",
  "income": 25000,
  "aadharNumber": "123456789012",
  "bankAccount": "1234567890",
  "ifscCode": "SBIN0001234",
  "documents": {
    "aadharKey": "s3-key/aadhar.pdf",
    "incomeProofKey": "s3-key/income.pdf"
  }
}
```

**Response:** `201 Created`
```json
{ "success": true, "message": "Application submitted successfully", "data": { ...application } }
```

---

## 12. Tasks — `/api/tasks`

All routes require authentication (`Authorization: Bearer <token>`).

---

### GET `/api/tasks/admin/donations`
Get list of paid donations (for task creation).

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...donation } ] }
```

---

### GET `/api/tasks/admin/all`
Get all tasks.

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...task } ] }
```

---

### GET `/api/tasks/admin/volunteers`
Get list of approved volunteers (for task assignment).

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { "_id": "...", "name": "...", "email": "..." } ] }
```

---

### POST `/api/tasks/admin/create`
Create and assign a new task.

**Auth:** Admin

**Request Body:**
```json
{
  "title": "Food distribution drive",
  "description": "Distribute food packets in Dharavi",
  "volunteerId": "volunteer_mongo_id",
  "donationId": "donation_mongo_id",
  "deadline": "2025-04-30",
  "location": "Dharavi, Mumbai"
}
```

**Response:** `201 Created`
```json
{ "success": true, "data": { ...task } }
```

---

### DELETE `/api/tasks/admin/:id`
Delete a task.

**Auth:** Admin

**URL Params:** `id` — Task ObjectId

**Response:** `200 OK`

---

### GET `/api/tasks/admin/task/:id`
Get task details for admin view.

**Auth:** Admin

**URL Params:** `id` — Task ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": { ...task } }
```

---

### GET `/api/tasks/volunteer/my-tasks`
Get tasks assigned to the logged-in volunteer.

**Auth:** `Authorization: Bearer <token>` (volunteer)

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...task } ] }
```

---

### PUT `/api/tasks/volunteer/:id/start`
Mark a task as in-progress.

**Auth:** `Authorization: Bearer <token>` (volunteer)

**URL Params:** `id` — Task ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Task started", "data": { "status": "in_progress" } }
```

---

### PUT `/api/tasks/volunteer/:id/complete`
Complete a task and upload completion media.

**Auth:** `Authorization: Bearer <token>` (volunteer)

**URL Params:** `id` — Task ObjectId

**Request Body:**
```json
{
  "completionNote": "Task completed successfully",
  "mediaUrls": ["s3-key/proof1.jpg", "s3-key/proof2.jpg"]
}
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Task completed", "data": { "status": "completed" } }
```

---

### GET `/api/tasks/volunteer/task/:id`
Get task details for volunteer view.

**Auth:** `Authorization: Bearer <token>` (volunteer)

**URL Params:** `id` — Task ObjectId

**Response:** `200 OK`

---

### GET `/api/tasks/volunteer/task-stats`
Get task statistics for the volunteer's dashboard.

**Auth:** `Authorization: Bearer <token>` (volunteer)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 2,
    "inProgress": 3,
    "completed": 5
  }
}
```

---

### GET `/api/tasks/donor/my-tasks`
Get completed tasks linked to the logged-in donor's donations.

**Auth:** `Authorization: Bearer <token>` (user/donor)

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...task } ] }
```

---

## 13. Public — `/api/public`

### GET `/api/public/stats`
Get public platform statistics (for home page).

**Auth:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalDonations": 1500000,
    "totalNgos": 30,
    "totalVolunteers": 80,
    "totalBeneficiaries": 5000
  }
}
```

---

### GET `/api/public/categories`
Get all active service categories.

**Auth:** None

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...category } ] }
```

---

### GET `/api/public/programs`
Get all active service programs.

**Auth:** None

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...program } ] }
```

---

### GET `/api/public/programs/:programId`
Get a single program by ID.

**Auth:** None

**URL Params:** `programId` — Program ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": { ...program } }
```

---

### GET `/api/public/categories/:categoryId/programs`
Get all programs for a specific category.

**Auth:** None

**URL Params:** `categoryId` — Category ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...program } ] }
```

---

## 14. Services — `/api/services`

### GET `/api/services`
Get all active categories with their programs (used by the frontend service page).

**Auth:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Education",
      "description": "...",
      "imageUrl": "https://...",
      "programs": [
        {
          "_id": "...",
          "title": "Scholarship Program",
          "description": "...",
          "imagekeys": "https://signed-s3-url...",
          "galleryImageKeys": ["https://...", "https://..."],
          "href": "/services/scholarship",
          "cta": "Apply Now"
        }
      ]
    }
  ]
}
```

---

### GET `/api/services/categories`
Get all active categories.

**Auth:** None

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...category } ] }
```

---

### GET `/api/services/categories/:categoryId`
Get a single category by ID.

**Auth:** None

**URL Params:** `categoryId` — Category ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": { ...category } }
```

---

### GET `/api/services/programs`
Get all active programs.

**Auth:** None

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...program } ] }
```

---

### GET `/api/services/programs/by-title/:title`
Get a program by its title (case-insensitive).

**Auth:** None

**URL Params:** `title` — Program title (URL encoded)

**Response:** `200 OK`
```json
{ "success": true, "data": { ...program } }
```

---

### GET `/api/services/programs/by-href`
Get a program by its URL href.

**Auth:** None

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `href` | string | The program's href path (e.g. `/services/scholarship`) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    ...program,
    "coverUrl": "https://signed-s3-url...",
    "galleryUrls": ["https://...", "https://..."]
  }
}
```

---

### GET `/api/services/programs/:programId`
Get a single program by ID.

**Auth:** None

**URL Params:** `programId` — Program ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": { ...program } }
```

---

### GET `/api/services/categories/:categoryId/programs`
Get all programs for a category.

**Auth:** None

**URL Params:** `categoryId` — Category ObjectId

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `includeHidden` | string | `"true"` to include inactive programs |

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...program } ] }
```

---

### GET `/api/services/admin/categories`
Get all categories (including hidden if requested).

**Auth:** Admin

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `includeHidden` | string | `"true"` to include inactive categories |

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...category } ] }
```

---

### POST `/api/services/admin/categories`
Create a new service category.

**Auth:** Admin

**Request Body:**
```json
{
  "name": "Healthcare",
  "description": "Medical support programs",
  "imageKey": "s3-key/healthcare.jpg"
}
```

**Response:** `201 Created`
```json
{ "success": true, "data": { "_id": "...", "name": "Healthcare", ... } }
```

---

### PUT `/api/services/admin/categories/:categoryId`
Update a service category.

**Auth:** Admin

**URL Params:** `categoryId` — Category ObjectId

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "imageUrl": "s3-key/new-image.jpg"
}
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...updatedCategory } }
```

---

### PUT `/api/services/admin/categories/:categoryId/hide`
Hide a category (sets isActive = false; also hides all its programs).

**Auth:** Admin

**URL Params:** `categoryId` — Category ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Category hidden successfully" }
```

---

### PUT `/api/services/admin/categories/:categoryId/unhide`
Unhide a category (sets isActive = true).

**Auth:** Admin

**URL Params:** `categoryId` — Category ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Category unhidden successfully" }
```

---

### DELETE `/api/services/admin/categories/:categoryId`
Permanently delete a category.

**Auth:** Admin

**URL Params:** `categoryId` — Category ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Category deleted successfully" }
```

---

### POST `/api/services/admin/programs`
Create a new service program.

**Auth:** Admin

**Request Body:**
```json
{
  "title": "Free Medical Camp",
  "description": "Short description of the program",
  "fullDescription": "Detailed HTML or text description...",
  "categoryId": "category_mongo_id",
  "imagekeys": "s3-key/cover.jpg",
  "galleryImageKeys": ["s3-key/img1.jpg", "s3-key/img2.jpg"],
  "donationTitle": "Support this program",
  "cta": "Donate Now",
  "href": "/services/medical-camp"
}
```

**Response:** `201 Created`
```json
{ "success": true, "data": { "_id": "...", "title": "Free Medical Camp", ... } }
```

---

### PUT `/api/services/admin/programs/:programId`
Update a service program.

**Auth:** Admin

**URL Params:** `programId` — Program ObjectId

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated short description",
  "fullDescription": "Updated full description",
  "categoryId": "new_category_id",
  "imagekeys": "s3-key/new-cover.jpg",
  "galleryImageKeys": ["s3-key/img1.jpg"],
  "donationTitle": "Updated donation title",
  "cta": "Help Now",
  "href": "/services/updated-slug"
}
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...updatedProgram } }
```

---

### PUT `/api/services/admin/programs/:programId/hide`
Hide a program (sets isActive = false).

**Auth:** Admin

**URL Params:** `programId` — Program ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Program hidden successfully" }
```

---

### PUT `/api/services/admin/programs/:programId/unhide`
Unhide a program (sets isActive = true).

**Auth:** Admin

**URL Params:** `programId` — Program ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Program unhidden successfully" }
```

---

### DELETE `/api/services/admin/programs/:programId`
Soft delete a program (sets isActive = false).

**Auth:** Admin

**URL Params:** `programId` — Program ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Program deleted successfully" }
```

---

### DELETE `/api/services/admin/programs/:programId/hard`
Permanently delete a program from the database.

**Auth:** Admin

**URL Params:** `programId` — Program ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Program permanently deleted successfully" }
```

---

## 15. Blog — `/api/blogs`

### GET `/api/blogs/get-all-blog`
Get all published blog posts (public).

**Auth:** None

**Response:** `200 OK`
```json
{ "success": true, "data": [ { "_id": "...", "title": "...", "content": "...", "author": "...", "createdAt": "..." } ] }
```

---

### GET `/api/blogs/get-blog/:id`
Get a single blog post by ID (public).

**Auth:** None

**URL Params:** `id` — Blog ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": { ...blog } }
```

---

### POST `/api/blogs/create-blog`
Create a new blog post (admin).

**Auth:** Admin

**Request Body:**
```json
{
  "title": "Blog Title",
  "content": "Blog content in HTML or Markdown...",
  "coverImage": "s3-key/blog-cover.jpg",
  "tags": ["education", "health"],
  "summary": "Short summary of the blog"
}
```

**Response:** `201 Created`
```json
{ "success": true, "data": { ...blog } }
```

---

### PUT `/api/blogs/update-blog/:id`
Update a blog post (admin).

**Auth:** Admin

**URL Params:** `id` — Blog ObjectId

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "coverImage": "s3-key/new-cover.jpg",
  "tags": ["community"],
  "summary": "Updated summary"
}
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...updatedBlog } }
```

---

### DELETE `/api/blogs/delete-blog/:id`
Delete a blog post (admin).

**Auth:** Admin

**URL Params:** `id` — Blog ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Blog deleted successfully" }
```

---

## 16. OTP — `/api/otp`

### POST `/api/otp/send-phone`
Send OTP to a phone number via SMS.

**Auth:** None

**Request Body:**
```json
{ "phone": "9876543210" }
```

**Response:** `200 OK`
```json
{ "success": true, "message": "OTP sent to phone" }
```

---

### POST `/api/otp/verify-phone`
Verify phone OTP.

**Auth:** None

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{ "success": true, "message": "Phone verified successfully" }
```

---

## 17. Events — `/api/events`

### GET `/api/events`
Get all published events (public).

**Auth:** None

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:** `200 OK`
```json
{ "success": true, "data": [ { "_id": "...", "title": "...", "description": "...", "date": "...", "location": "...", "isPublished": true } ] }
```

---

### GET `/api/events/:id`
Get a single event by ID (public).

**Auth:** None

**URL Params:** `id` — Event ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": { ...event } }
```

---

### GET `/api/events/:id/photos`
Get photos for a past event (public).

**Auth:** None

**URL Params:** `id` — Event ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": [ { "_id": "...", "url": "...", "caption": "..." } ] }
```

---

### GET `/api/events/admin/all`
Get all events including unpublished (admin).

**Auth:** Admin

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...event } ] }
```

---

### PATCH `/api/events/admin/:id/publish`
Toggle event publish status.

**Auth:** Admin

**URL Params:** `id` — Event ObjectId

**Response:** `200 OK`
```json
{ "success": true, "data": { "isPublished": true } }
```

---

### GET `/api/events/my-events`
Get events created by the logged-in user.

**Auth:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...event } ] }
```

---

### POST `/api/events/create`
Create a new event (authenticated user/volunteer).

**Auth:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Tree Plantation Drive",
  "description": "Planting 500 trees in Aarey Colony",
  "date": "2025-07-15",
  "time": "09:00 AM",
  "location": "Aarey Colony, Mumbai",
  "coverImage": "s3-key/event-cover.jpg",
  "maxParticipants": 100
}
```

**Response:** `201 Created`
```json
{ "success": true, "data": { ...event } }
```

---

### PUT `/api/events/:id`
Update an event (owner).

**Auth:** `Authorization: Bearer <token>`

**URL Params:** `id` — Event ObjectId

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Event Title",
  "description": "Updated description",
  "date": "2025-08-10",
  "location": "New Location"
}
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...updatedEvent } }
```

---

### DELETE `/api/events/:id`
Delete an event (owner).

**Auth:** `Authorization: Bearer <token>`

**URL Params:** `id` — Event ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Event deleted successfully" }
```

---

### POST `/api/events/:id/photos`
Add photos to a past event.

**Auth:** `Authorization: Bearer <token>`

**URL Params:** `id` — Event ObjectId

**Request Body:**
```json
{
  "photos": [
    { "key": "s3-key/photo1.jpg", "caption": "Opening ceremony" },
    { "key": "s3-key/photo2.jpg", "caption": "Volunteers in action" }
  ]
}
```

**Response:** `200 OK`
```json
{ "success": true, "data": { ...event } }
```

---

### DELETE `/api/events/:id/photos/:photoId`
Delete a photo from an event.

**Auth:** `Authorization: Bearer <token>`

**URL Params:**
- `id` — Event ObjectId
- `photoId` — Photo ObjectId

**Response:** `200 OK`
```json
{ "success": true, "message": "Photo deleted" }
```

---

### GET `/api/events/ngo/my-events`
Get events created by the logged-in NGO.

**Auth:** NGO Auth

**Response:** `200 OK`
```json
{ "success": true, "data": [ { ...event } ] }
```

---

### POST `/api/events/ngo/create`
Create an event as an NGO.

**Auth:** NGO Auth

**Request Body:** Same as [POST `/api/events/create`](#post-apieventscreate)

**Response:** `201 Created`

---

### PUT `/api/events/ngo/:id`
Update an NGO event.

**Auth:** NGO Auth

**URL Params:** `id` — Event ObjectId

**Request Body:** Same as [PUT `/api/events/:id`](#put-apieventsid)

**Response:** `200 OK`

---

### DELETE `/api/events/ngo/:id`
Delete an NGO event.

**Auth:** NGO Auth

**URL Params:** `id` — Event ObjectId

**Response:** `200 OK`

---

### POST `/api/events/ngo/:id/photos`
Add photos to an NGO event.

**Auth:** NGO Auth

**URL Params:** `id` — Event ObjectId

**Request Body:** Same as [POST `/api/events/:id/photos`](#post-apieventsidphotos)

**Response:** `200 OK`

---

### DELETE `/api/events/ngo/:id/photos/:photoId`
Delete a photo from an NGO event.

**Auth:** NGO Auth

**URL Params:**
- `id` — Event ObjectId
- `photoId` — Photo ObjectId

**Response:** `200 OK`

---

## Common Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad request / validation error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient role/permissions) |
| `404` | Resource not found |
| `409` | Conflict (duplicate resource) |
| `500` | Internal server error |
