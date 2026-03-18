# 🔗 API ENDPOINT REFERENCE BY STAKEHOLDER

**Complete API endpoint mapping for all user types.**

---

## 👤 INDIVIDUAL USER / DONOR

### Authentication
```javascript
POST /api/auth/send-otp
  Body: { email }
  Response: { success, message, otpId }

POST /api/auth/register
  Body: { email, otpId, otp, name, password }
  Response: { success, token, user }

POST /api/auth/login
  Body: { email, password }
  Response: { success, token, user }

POST /api/auth/google-login
  Body: { idToken }
  Response: { success, token, user }

POST /api/auth/forgot-password
  Body: { email }
  Response: { success, message }

POST /api/auth/reset-password
  Body: { token, newPassword }
  Response: { success, message }

POST /api/auth/logout
  Headers: { Authorization: "Bearer {token}" }
  Response: { success }

POST /api/auth/send-email-verification-otp
  Headers: { Authorization: "Bearer {token}" }
  Response: { success }

POST /api/auth/verify-email-otp
  Headers: { Authorization: "Bearer {token}" }
  Body: { otp }
  Response: { success }

POST /api/auth/change-password
  Headers: { Authorization: "Bearer {token}" }
  Body: { currentPassword, newPassword }
  Response: { success }
```

### Profile Management
```javascript
GET /api/auth/profile
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, user: {...} }

PUT /api/auth/update-profile
  Headers: { Authorization: "Bearer {token}" }
  Body: { name, phone, address, city, state, avatar (form-data) }
  Response: { success, user: {...} }
```

### Browse NGOs
```javascript
GET /api/ngo
  Query: { page=1, limit=12, search="", category="", city="", state="" }
  Response: { success, ngos: [...], totalCount, totalPages }

GET /api/ngo/{id}
  Response: { success, ngo: {...} }
```

### Browse Events
```javascript
GET /api/events
  Query: { page=1, limit=12 }
  Response: { success, events: [...] }

GET /api/events/{id}
  Response: { success, event: {...} }
```

### Browse Communities
```javascript
GET /api/community/search
  Query: { 
    search="", 
    city="", 
    state="", 
    lat=", 
    lng=", 
    maxDistance=10000,
    areaType="" 
  }
  Response: { success, communities: [...] }

GET /api/community/{id}
  Response: { success, community: {...} }
```

### Browse Blogs
```javascript
GET /api/blogs
  Query: { page=1, limit=10, category="" }
  Response: { success, blogs: [...], totalCount }

GET /api/blogs/{id}
  Response: { success, blog: {...} }
```

### Browse Services & Programs
```javascript
GET /api/services/categories
  Response: { success, categories: [...] }

GET /api/services/programs
  Query: { categoryId="", page=1, limit=12 }
  Response: { success, programs: [...] }

GET /api/services/programs/{id}
  Response: { success, program: {...} }
```

### Donations
```javascript
POST /api/payment/order
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    amount, 
    ngoId, 
    serviceTitle, 
    donorName, 
    isAnonymous 
  }
  Response: { success, order: { key, amount, orderId } }

POST /api/payment/verify
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    razorpayOrderId, 
    razorpayPaymentId, 
    razorpaySignature 
  }
  Response: { success, payment: {...} }

GET /api/auth/donations
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, donations: [...] }
```

### Feedback & Reporting
```javascript
POST /api/feedback
  Headers: { Authorization: "Bearer {token}" (optional for anonymous) }
  Body: { 
    name, 
    email, 
    phone, 
    feedbackType, 
    subject, 
    message, 
    rating, 
    targetId, 
    targetName, 
    targetModel 
  }
  Response: { success, feedback: {...} }

POST /api/report
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    reportType, 
    subject, 
    description, 
    severity, 
    targetId, 
    targetName, 
    targetModel, 
    evidenceUrls: [...] 
  }
  Response: { success, report: {...} }
```

---

## 🤝 VOLUNTEER

### Authentication
Same as Individual User (see above)

### Volunteer Application
```javascript
POST /api/volunteer/apply
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    fullName, 
    email, 
    phone, 
    dob, 
    city, 
    state, 
    interests: [...], 
    mode, 
    availability, 
    experience, 
    language, 
    howHeard 
  }
  Response: { success, volunteer: {...} }

GET /api/volunteer/status
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, hasApplied, status }

GET /api/auth/volunteer
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, volunteer: {...}, status }
```

### Task Management
```javascript
GET /api/volunteer/tasks
  Headers: { Authorization: "Bearer {token}" }
  Query: { status="", page=1, limit=10 }
  Response: { success, tasks: [...] }

GET /api/volunteer/tasks/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, task: {...} }

PUT /api/tasks/{id}/upload-media
  Headers: { Authorization: "Bearer {token}" }
  Body: { mediaUrl, mediaType: "image" | "video", volunteerNote }
  Response: { success, task: {...} }

PUT /api/tasks/{id}/complete
  Headers: { Authorization: "Bearer {token}" }
  Body: { volunteerNote }
  Response: { success, task: {...} }
```

### Gallery (View Completed Work)
```javascript
GET /api/gallery
  Query: { type="image", category="", page=1, limit=20 }
  Response: { success, images: [...], total }

GET /api/gallery/{id}
  Response: { success, item: {...} }
```

---

## 🏢 NGO ADMINISTRATOR

### Authentication
Same as Individual User (see above)

### NGO Registration & Profile
```javascript
POST /api/ngo/register
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    ngoName, 
    regType, 
    regNumber, 
    estYear, 
    darpanId, 
    panNumber, 
    description,
    state, 
    district, 
    city, 
    pincode, 
    address,
    contactName, 
    contactRole, 
    contactEmail, 
    contactPhone,
    bankAccountNumber, 
    bankIFSC, 
    bankAccountHolder 
  }
  Response: { success, ngo: {...} }

GET /api/ngo/profile
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, ngo: {...} }

PUT /api/ngo/{id}
  Headers: { Authorization: "Bearer {token}" }
  Body: { ...same as register }
  Response: { success, ngo: {...} }
```

### NGO Dashboard
```javascript
GET /api/ngo-dashboard/stats
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, stats: { totalVolunteers, totalEvents, totalDonations, ... } }
```

### Event Management
```javascript
POST /api/events
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    title, 
    description, 
    date, 
    startTime, 
    endTime, 
    location, 
    S3Imagekey, 
    category, 
    maxParticipants,
    isPublished 
  }
  Response: { success, event: {...} }

GET /api/events
  Query: { createdBy="{ngoId}", page=1, limit=12, status="" }
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, events: [...] }

GET /api/events/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, event: {...} }

PUT /api/events/{id}
  Headers: { Authorization: "Bearer {token}" }
  Body: { ...same as POST }
  Response: { success, event: {...} }

DELETE /api/events/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success }
```

### Service & Program Management
```javascript
POST /api/services/categories
  Headers: { Authorization: "Bearer {token}" }
  Body: { name, description, imageUrl }
  Response: { success, category: {...} }

GET /api/services/categories
  Headers: { Authorization: "Bearer {token}" }
  Query: { includeHidden=false }
  Response: { success, categories: [...] }

POST /api/services/programs
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    categoryId, 
    name, 
    description, 
    minAmount, 
    idealAmount, 
    isActive 
  }
  Response: { success, program: {...} }

GET /api/services/programs
  Query: { categoryId="", page=1, limit=12 }
  Response: { success, programs: [...] }

PUT /api/services/programs/{id}
  Headers: { Authorization: "Bearer {token}" }
  Body: { ...same as POST }
  Response: { success, program: {...} }
```

### Volunteer Application Review
```javascript
GET /api/admin/pending-volunteers
  Headers: { Authorization: "Bearer {token}" }
  Query: { status="Pending", page=1, limit=10 }
  Response: { success, volunteers: [...], total }

PUT /api/admin/volunteer/{id}/approve
  Headers: { Authorization: "Bearer {token}" }
  Body: { comments }
  Response: { success, volunteer: {...} }

PUT /api/admin/volunteer/{id}/reject
  Headers: { Authorization: "Bearer {token}" }
  Body: { rejectionReason, comments }
  Response: { success, volunteer: {...} }
```

### Task Management
```javascript
POST /api/tasks
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    donationId, 
    volunteerId, 
    title, 
    description, 
    adminNote 
  }
  Response: { success, task: {...} }

GET /api/tasks
  Headers: { Authorization: "Bearer {token}" }
  Query: { status="", volunteerId="", page=1, limit=10 }
  Response: { success, tasks: [...] }

GET /api/tasks/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, task: {...} }

PUT /api/tasks/{id}/status
  Headers: { Authorization: "Bearer {token}" }
  Body: { status }
  Response: { success, task: {...} }
```

### Gallery Management
```javascript
POST /api/gallery/upload
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    url, 
    type: "image" | "video", 
    category, 
    thumbnail, 
    description 
  }
  Response: { success, item: {...} }

GET /api/gallery
  Query: { category="", page=1, limit=20, approvalStatus="" }
  Response: { success, items: [...] }

PUT /api/gallery/{id}/approve
  Headers: { Authorization: "Bearer {token}" }
  Body: { approvalStatus: "approved" | "rejected" }
  Response: { success, item: {...} }

DELETE /api/gallery/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success }
```

---

## 🔐 PLATFORM ADMIN

### Admin Dashboard
```javascript
GET /api/admin/dashboard-stats
  Headers: { Authorization: "Bearer {token}" }
  Response: { 
    success, 
    stats: { 
      totalUsers, 
      totalNgos, 
      pendingNgos, 
      verifiedNgos, 
      totalVolunteers, 
      pendingVolunteers, 
      totalContacts, 
      newContacts 
    },
    recent: { users, ngos, volunteers, contacts }
  }
```

### NGO Verification
```javascript
GET /api/admin/ngos
  Headers: { Authorization: "Bearer {token}" }
  Query: { status="pending" | "verified", page=1, limit=10 }
  Response: { success, ngos: [...], total }

GET /api/ngo/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, ngo: {...} }

PUT /api/admin/ngos/{id}/verify
  Headers: { Authorization: "Bearer {token}" }
  Body: { comments, certificate }
  Response: { success, ngo: {...} }

PUT /api/admin/ngos/{id}/reject
  Headers: { Authorization: "Bearer {token}" }
  Body: { rejectionReason, comments }
  Response: { success, ngo: {...} }

PUT /api/admin/ngo/{id}/suspend
  Headers: { Authorization: "Bearer {token}" }
  Body: { reason }
  Response: { success, ngo: {...} }

PUT /api/admin/ngo/{id}/reactivate
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, ngo: {...} }
```

### Volunteer Application Review
```javascript
GET /api/admin/pending-volunteers
  Headers: { Authorization: "Bearer {token}" }
  Query: { status="Pending", page=1, limit=10 }
  Response: { success, volunteers: [...], total }

PUT /api/admin/volunteer/{id}/approve
  Headers: { Authorization: "Bearer {token}" }
  Body: { comments }
  Response: { success, volunteer: {...} }

PUT /api/admin/volunteer/{id}/reject
  Headers: { Authorization: "Bearer {token}" }
  Body: { rejectionReason, comments }
  Response: { success, volunteer: {...} }
```

### User Management
```javascript
GET /api/admin/users
  Headers: { Authorization: "Bearer {token}" }
  Query: { role="", page=1, limit=10, search="" }
  Response: { success, users: [...], total }

GET /api/admin/users/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, user: {...} }

PUT /api/admin/users/{id}
  Headers: { Authorization: "Bearer {token}" }
  Body: { name, email, phone, address, city, state, role }
  Response: { success, user: {...} }
```

### Contact Management
```javascript
GET /api/contact
  Headers: { Authorization: "Bearer {token}" }
  Query: { status="", page=1, limit=10 }
  Response: { success, contacts: [...], total }

GET /api/contact/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, contact: {...} }

PUT /api/contact/{id}/status
  Headers: { Authorization: "Bearer {token}" }
  Body: { status: "New" | "Replied" | "Closed" }
  Response: { success, contact: {...} }

POST /api/contact/{id}/reply
  Headers: { Authorization: "Bearer {token}" }
  Body: { reply }
  Response: { success, contact: {...} }
```

### Feedback Moderation
```javascript
GET /api/admin/feedback
  Headers: { Authorization: "Bearer {token}" }
  Query: { feedbackType="", page=1, limit=10 }
  Response: { success, feedback: [...], total }

GET /api/feedback/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, feedback: {...} }

PUT /api/admin/feedback/{id}/status
  Headers: { Authorization: "Bearer {token}" }
  Body: { status: "pending" | "acknowledged" | "resolved" }
  Response: { success, feedback: {...} }
```

### Report Moderation
```javascript
GET /api/admin/reports
  Headers: { Authorization: "Bearer {token}" }
  Query: { reportType="", severity="", status="", page=1, limit=10 }
  Response: { success, reports: [...], total }

GET /api/report/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, report: {...} }

PUT /api/admin/reports/{id}/status
  Headers: { Authorization: "Bearer {token}" }
  Body: { status: "pending" | "investigating" | "resolved" | "dismissed" }
  Response: { success, report: {...} }

PUT /api/admin/report/{id}/escalate
  Headers: { Authorization: "Bearer {token}" }
  Body: { escalationDetails }
  Response: { success, report: {...} }
```

### Kanyadan Management
```javascript
GET /api/admin/kanyadan
  Headers: { Authorization: "Bearer {token}" }
  Query: { status="", page=1, limit=10 }
  Response: { success, applications: [...], total }

GET /api/kanyadan/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success, application: {...} }

PUT /api/admin/kanyadan/{id}/status
  Headers: { Authorization: "Bearer {token}" }
  Body: { status: "Pending" | "Approved" | "Rejected", comments }
  Response: { success, application: {...} }
```

---

## 👨‍💼 COMMUNITY LEADER

### Community Management
```javascript
POST /api/community
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    name, 
    areaType, 
    description, 
    address, 
    pincode, 
    city, 
    district, 
    state, 
    location: { type: "Point", coordinates: [longitude, latitude] },
    population, 
    tags: [...] 
  }
  Response: { success, community: {...} }

GET /api/community/{id}
  Response: { success, community: {...} }

PUT /api/community/{id}
  Headers: { Authorization: "Bearer {token}" }
  Body: { ...same as POST }
  Response: { success, community: {...} }

GET /api/community/search
  Query: { search="", lat="", lng="", state="", city="" }
  Response: { success, communities: [...] }
```

### Community Activities
```javascript
POST /api/community/{id}/activities
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    title, 
    description, 
    date, 
    location, 
    type, 
    participants: [...] 
  }
  Response: { success, activity: {...} }

GET /api/community/{id}/activities
  Headers: { Authorization: "Bearer {token}" }
  Query: { page=1, limit=10 }
  Response: { success, activities: [...] }

PUT /api/community/activities/{id}
  Headers: { Authorization: "Bearer {token}" }
  Body: { ...same as POST }
  Response: { success, activity: {...} }

DELETE /api/community/activities/{id}
  Headers: { Authorization: "Bearer {token}" }
  Response: { success }
```

### Community Responsibilities
```javascript
POST /api/community/{id}/responsibilities
  Headers: { Authorization: "Bearer {token}" }
  Body: { 
    title, 
    description, 
    assignedTo, 
    dueDate, 
    priority 
  }
  Response: { success, responsibility: {...} }

GET /api/community/{id}/responsibilities
  Headers: { Authorization: "Bearer {token}" }
  Query: { status="", page=1, limit=10 }
  Response: { success, responsibilities: [...] }

PUT /api/community/responsibilities/{id}
  Headers: { Authorization: "Bearer {token}" }
  Body: { status, progress, notes }
  Response: { success, responsibility: {...} }
```

---

## 🌐 PUBLIC (Unauthenticated)

### Browse NGOs
```javascript
GET /api/public/ngo
  Query: { page=1, limit=12, search="", category="", city="", state="" }
  Response: { success, ngos: [...], totalCount }
```

### Browse Events
```javascript
GET /api/events
  Query: { page=1, limit=12, isPublished=true }
  Response: { success, events: [...] }

GET /api/events/{id}
  Response: { success, event: {...} }
```

### Browse Blogs
```javascript
GET /api/blogs
  Query: { page=1, limit=10, category="" }
  Response: { success, blogs: [...] }

GET /api/blogs/{id}
  Response: { success, blog: {...} }
```

### Browse Communities
```javascript
GET /api/community/search
  Query: { search="", city="", state="", lat="", lng="" }
  Response: { success, communities: [...] }

GET /api/community/{id}
  Response: { success, community: {...} }
```

### Browse Services
```javascript
GET /api/services/categories
  Response: { success, categories: [...] }

GET /api/services/programs
  Query: { categoryId="", page=1, limit=12 }
  Response: { success, programs: [...] }
```

### Contact Form
```javascript
POST /api/contact
  Body: { name, email, subject, message, phone }
  Response: { success, contact: {...} }
```

### Feedback & Reports
```javascript
POST /api/feedback
  Body: { name, email, feedbackType, subject, message, rating }
  Response: { success, feedback: {...} }
```

---

## 📝 NOTES

### Authentication Headers
All endpoints marked with `Headers: { Authorization: "Bearer {token}" }` require authentication.

Token is obtained from:
- `POST /api/auth/register` → returns `token`
- `POST /api/auth/login` → returns `token`
- `POST /api/auth/google-login` → returns `token`

Include in all requests:
```javascript
Authorization: Bearer <token>
Content-Type: application/json
```

### File Upload Handling
For endpoints with file uploads (images, videos):
1. First POST to generate presigned S3 URL
2. PUT to S3 directly with the file
3. Return S3 key to backend in final endpoint

Example:
```javascript
// Get presigned URL
POST /api/s3/get-presigned-url
Body: { fileName, fileType }
Response: { presignedUrl, key }

// Upload to S3 directly
PUT <presignedUrl>
Body: <binary file data>

// Confirm in backend
POST /api/gallery/upload
Body: { url: "<s3-key>", ... }
```

### Pagination
All list endpoints support:
- `page`: Starting from 1
- `limit`: Items per page (default 10-20)
- Response includes `total` and `totalPages`

### Sorting & Filtering
Most list endpoints support:
- `sort`: Field name (e.g., `createdAt`)
- `order`: `asc` or `desc`
- Field-specific filters (e.g., `status`, `city`, `category`)

---

**Start building with confidence! All endpoints are ready for integration.** 🚀
