# 👥 STAKEHOLDER REQUIREMENTS MATRIX

## QUICK REFERENCE: What Each User Type Needs (Frontend Pages Required)

---

## 1️⃣ **INDIVIDUAL USER / DONOR**

### Key Journey: Browse → Select → Donate → Track Impact

| Requirement | Frontend Page | Backend API | Status |
|-------------|--------------|-------------|--------|
| Register/Login | Auth Pages | `/api/auth/register`, `/api/auth/login` | ✅ Backend |
| Email Verification | OTP Modal | `/api/auth/verify-email-otp` | ✅ Backend |
| Browse NGOs | NGO Discovery Page | `/api/public/ngo` | ✅ Backend |
| View NGO Details | NGO Detail Page | `/api/ngo/:id` | ✅ Backend |
| Browse Services | Services Page | `/api/services/categories` | ✅ Backend |
| Browse Programs | Program Detail | `/api/services/programs` | ✅ Backend |
| Browse Events | Events Page | `/api/events` | ✅ Backend |
| Browse Communities | Community Map | `/api/community/search` | ✅ Backend |
| Read Blogs | Blog Listing Page | `/api/blogs` | ✅ Backend |
| Select Service & Amount | Donation Form | Custom form | 🚧 Frontend |
| Make Payment | Razorpay Modal | `/api/payment/order`, `/api/payment/verify` | ✅ Backend |
| Payment Confirmation | Success Page | Razorpay webhook | ✅ Backend |
| View Profile | User Dashboard | `/api/auth/profile` | ✅ Backend |
| Update Profile | Profile Edit Page | `/api/auth/update-profile` | ✅ Backend |
| View Donation History | Donation Tracker | `/api/auth/donations` | ✅ Backend |
| Track Impact | Donation Detail + Task Media | `/api/tasks?donorId=:id` | ✅ Backend |
| Submit Feedback | Feedback Form | `/api/feedback` | ✅ Backend |
| Submit Report | Report Form | `/api/report` | ✅ Backend |
| Change Password | Password Form | `/api/auth/change-password` | ✅ Backend |
| Forgot Password | Recovery Form | `/api/auth/forgot-password` | ✅ Backend |

#### Frontend Pages to Build (11 pages)
- [ ] Home/Landing Page
- [ ] Login Page
- [ ] Register Page
- [ ] Email Verification Modal
- [ ] Forgot Password Page
- [ ] Password Reset Page
- [ ] User Dashboard
- [ ] Profile Management Page
- [ ] Donation History Page
- [ ] Browse NGOs Page
- [ ] NGO Detail Page

#### Frontend Components to Build (5 reusable)
- [ ] Donation Form Modal
- [ ] Payment Modal (Razorpay)
- [ ] Feedback Form
- [ ] Report Form
- [ ] Service Selector

---

## 2️⃣ **VOLUNTEER**

### Key Journey: SignUp → Apply → Get Tasks → Complete Tasks → See Impact

| Requirement | Frontend Page | Backend API | Status |
|-------------|--------------|-------------|--------|
| Register/Login | Auth Pages | `/api/auth/register`, `/api/auth/login` | ✅ Backend |
| Submit Volunteer Application | Application Form | `/api/volunteer/apply` | ✅ Backend |
| Check Application Status | Status Dashboard | `/api/volunteer/status` | ✅ Backend |
| View Profile | Volunteer Profile | `/api/volunteer/:id` | ✅ Backend |
| View Assigned Tasks | Task List | `/api/volunteer/tasks` | ✅ Backend |
| View Task Details | Task Detail Page | `/api/volunteer/tasks/:id` | ✅ Backend |
| Upload Task Media | Media Upload Modal | `/api/tasks/:id/upload-media` | ✅ Backend |
| Submit Completed Task | Task Submission | `/api/tasks/:id/complete` | ✅ Backend |
| View Task History | Completed Tasks Gallery | `/api/gallery?uploadedBy=:id` | ✅ Backend |
| Track Impact | Impact Stats | Custom dashboard | 🚧 Frontend |
| Receive Notifications | Notification Center | Email + In-app | ✅ Backend (email) |

#### Frontend Pages to Build (6 pages)
- [ ] Login/Register Pages
- [ ] Volunteer Application Form
- [ ] Application Status Page
- [ ] Volunteer Dashboard
- [ ] Task List Page
- [ ] Task Detail & Completion Page

#### Frontend Components to Build (4 reusable)
- [ ] Application Form
- [ ] Task Card
- [ ] Media Upload Component
- [ ] Impact Gallery

---

## 3️⃣ **NGO STAFF / ADMINISTRATOR**

### Key Journey: Register → Verify → Setup Operations → Manage Everything

| Requirement | Frontend Page | Backend API | Status |
|-------------|--------------|-------------|--------|
| Register NGO (Multi-step) | NGO Registration Wizard | `/api/ngo/register` | ✅ Backend |
| Submit for Verification | Registration Submit | `/api/ngo/register` | ✅ Backend |
| View Verification Status | NGO Profile Status | `/api/ngo/profile` | ✅ Backend |
| Access NGO Dashboard | Dashboard Home | `/api/ngo-dashboard/stats` | ✅ Backend |
| View Statistics | Stats Dashboard | `/api/ngo-dashboard/stats` | ✅ Backend |
| Update NGO Profile | Profile Edit Form | `/api/ngo/:id/update` | ✅ Backend |
| Create Events | Event Creation Form | `/api/events` (POST) | ✅ Backend |
| Manage Events | Event List & CRUD | `/api/events` (GET, PUT, DELETE) | ✅ Backend |
| Upload Event Photos | Photo Upload | `/api/events/:id/photos` | ✅ Backend |
| Create Services | Service Creation | `/api/services/categories` (POST) | ✅ Backend |
| Manage Programs | Program CRUD | `/api/services/programs` | ✅ Backend |
| Review Volunteer Applications | Application Queue | `/api/admin/pending-volunteers` | ✅ Backend |
| Approve/Reject Volunteers | Application Review Form | `/api/admin/volunteer/:id/approve` | ✅ Backend |
| Assign Tasks to Volunteers | Task Assignment Form | `/api/tasks` (POST) | ✅ Backend |
| View Task Progress | Task Status Board | `/api/tasks?status=:status` | ✅ Backend |
| Upload to Gallery | Gallery Upload | `/api/gallery/upload` | ✅ Backend |
| Manage Gallery | Gallery Admin | `/api/gallery` (CRUD) | ✅ Backend |
| View Donations | Donation List | `/api/payment/history` | ✅ Backend |
| Download Reports | Reports Export | Custom export | 🚧 Frontend |
| Email Staff | Staff Management | Custom feature | 🚧 Frontend |

#### Frontend Pages to Build (12 pages)
- [ ] NGO Registration Wizard (5 steps)
- [ ] NGO Dashboard
- [ ] NGO Profile Management
- [ ] Event Management (List + Create + Edit)
- [ ] Service Management
- [ ] Program Management
- [ ] Volunteer Application Queue
- [ ] Task Assignment Interface
- [ ] Gallery Management
- [ ] Donation History
- [ ] Reports/Analytics

#### Frontend Components to Build (8 reusable)
- [ ] Multi-step Form Wizard
- [ ] Registration Form
- [ ] Event Form
- [ ] Service Form
- [ ] Task Assignment Modal
- [ ] Gallery Upload
- [ ] Data Table/Grid
- [ ] Stats Widget

---

## 4️⃣ **PLATFORM ADMIN**

### Key Journey: Monitor → Verify → Manage → Moderate

| Requirement | Frontend Page | Backend API | Status |
|-------------|--------------|-------------|--------|
| View Admin Dashboard | Admin Dashboard | `/api/admin/dashboard-stats` | ✅ Backend |
| Monitor Platform Stats | Stats Dashboard | `/api/admin/dashboard-stats` | ✅ Backend |
| Verify NGOs | NGO Verification Queue | `/api/admin/ngos?status=pending` | ✅ Backend |
| View NGO Details | NGO Review Modal | `/api/ngo/:id` | ✅ Backend |
| Approve NGO | Approval Button | `/api/admin/ngos/:id/verify` | ✅ Backend |
| Reject NGO | Rejection Form | `/api/admin/ngos/:id/reject` | ✅ Backend |
| Review Volunteer Apps | Volunteer Queue | `/api/admin/pending-volunteers` | ✅ Backend |
| Approve Volunteer | Approval Action | `/api/admin/volunteer/:id/approve` | ✅ Backend |
| Reject Volunteer | Rejection Form | `/api/admin/volunteer/:id/reject` | ✅ Backend |
| Manage Users | User List & Search | `/api/admin/users` | ✅ Backend |
| View User Details | User Detail Modal | `/api/admin/users/:id` | ✅ Backend |
| Edit User Info | User Edit Form | Custom endpoint | 🚧 Backend |
| Manage Contacts | Contact List | `/api/contact` | ✅ Backend |
| Update Contact Status | Status Dropdown | `/api/contact/:id/status` | ✅ Backend |
| Review Feedback | Feedback List | `/api/admin/feedback` | ✅ Backend |
| Update Feedback Status | Status Update | `/api/admin/feedback/:id/status` | ✅ Backend |
| Review Reports | Report List | `/api/admin/reports` | ✅ Backend |
| Update Report Status | Status Workflow | `/api/admin/reports/:id/status` | ✅ Backend |
| Review Kanyadan Apps | Kanyadan Queue | `/api/admin/kanyadan` | ✅ Backend |
| Approve Kanyadan App | Approval Action | `/api/admin/kanyadan/:id/status` | ✅ Backend |
| View Analytics | Analytics Dashboard | Custom endpoints | 🚧 Backend |
| Generate Reports | Report Export | Custom feature | 🚧 Frontend |
| Email Templates | Template Management | Custom feature | 🚧 Backend |
| System Settings | Settings Page | Custom feature | 🚧 Backend |

#### Frontend Pages to Build (10 pages)
- [ ] Admin Dashboard
- [ ] NGO Verification Queue
- [ ] User Management
- [ ] Volunteer Application Queue
- [ ] Contact Management
- [ ] Feedback & Report Moderation
- [ ] Kanyadan Application Management
- [ ] Analytics Dashboard
- [ ] Community Verification (if needed)
- [ ] System Settings

#### Frontend Components to Build (7 reusable)
- [ ] Data Table with Sorting/Filtering
- [ ] Status Badge
- [ ] Approval Modal with Feedback
- [ ] Queue List Item
- [ ] Chart/Graph Components
- [ ] Date Range Picker
- [ ] Export Button

---

## 5️⃣ **COMMUNITY LEADER**

### Key Journey: Register Community → Manage Activities → Track Progress

| Requirement | Frontend Page | Backend API | Status |
|-------------|--------------|-------------|--------|
| Register Community | Community Registration Form | `/api/community` (POST) | ✅ Backend |
| View Community Profile | Community Detail | `/api/community/:id` | ✅ Backend |
| Edit Community Info | Profile Edit Form | `/api/community/:id` (PUT) | ✅ Backend |
| Upload Cover Image | Image Upload | Custom endpoint | 🚧 Backend |
| View Community Dashboard | Community Dashboard | `/api/community/:id?stats=true` | ✅ Backend |
| View Stats | Stats Widget | Custom calculation | 🚧 Frontend |
| Create Activity | Activity Form | `/api/community/:id/activities` (POST) | ✅ Backend |
| Manage Activities | Activity List & CRUD | `/api/community/:id/activities` | ✅ Backend |
| Assign Responsibilities | Task Assignment | `/api/community/:id/responsibilities` | ✅ Backend |
| Track Completion | Status Board | `/api/community/:id/responsibilities` | ✅ Backend |
| View Members | Member List | Custom feature | 🚧 Backend |
| Send Notifications | Notifications | Custom feature | 🚧 Backend |

#### Frontend Pages to Build (6 pages)
- [ ] Community Registration Form
- [ ] Community Profile/Dashboard
- [ ] Activity Management
- [ ] Responsibility Management
- [ ] Stats & Progress Dashboard
- [ ] Member Management (optional)

#### Frontend Components to Build (4 reusable)
- [ ] Community Form
- [ ] Activity Card
- [ ] Responsibility Card
- [ ] Progress Widget

---

## 6️⃣ **PUBLIC / VISITOR** (Unauthenticated)

### Key Journey: Discover → Learn → Choose to Register

| Requirement | Frontend Page | Backend API | Status |
|-------------|--------------|-------------|--------|
| View Homepage | Home/Landing Page | Public endpoints | ✅ Backend |
| Browse NGOs | NGO Listing | `/api/public/ngo` | ✅ Backend |
| Search NGOs | NGO Search | `/api/public/ngo?search=` | ✅ Backend |
| Filter NGOs | NGO Filters | `/api/public/ngo?city=&state=` | ✅ Backend |
| View NGO Details | NGO Detail Page | `/api/ngo/:id` | ✅ Backend |
| Browse Events | Event Listing | `/api/events` | ✅ Backend |
| View Event Details | Event Detail Modal | `/api/events/:id` | ✅ Backend |
| Browse Blogs | Blog Listing | `/api/blogs` | ✅ Backend |
| Read Blog Article | Blog Detail Page | `/api/blogs/:id` | ✅ Backend |
| Filter Blog by Category | Blog Category Filter | `/api/blogs?category=` | ✅ Backend |
| Browse Communities | Community Map View | `/api/community/search` | ✅ Backend |
| Search Communities | Community Search | `/api/community/search?search=` | ✅ Backend |
| Geo-filter Communities | Community Geo-filter | `/api/community/search?lat=&lng=` | ✅ Backend |
| View Community Pages | Community Detail | `/api/community/:id` | ✅ Backend |
| Browse Services | Services Listing | `/api/services/categories` | ✅ Backend |
| View Programs | Program Detail | `/api/services/programs/:id` | ✅ Backend |
| Submit Contact Form | Contact Page | `/api/contact` | ✅ Backend |
| View About Page | About/How It Works | Static page | 🚧 Frontend |
| Learn Process | Info Pages | Static pages | 🚧 Frontend |
| Register/Login Links | Auth Links | Navigation | 🚧 Frontend |

#### Frontend Pages to Build (12 pages)
- [ ] Home/Landing Page
- [ ] NGO Listing & Search
- [ ] NGO Detail Page
- [ ] Event Listing & Detail
- [ ] Blog Listing & Article
- [ ] Community Map & List
- [ ] Community Detail Page
- [ ] Services Page
- [ ] Program Detail Page
- [ ] Contact Form Page
- [ ] About/How It Works Page
- [ ] FAQ Page (Optional)

#### Frontend Components to Build (7 reusable)
- [ ] NGO Card
- [ ] Event Card
- [ ] Blog Card
- [ ] Community Card
- [ ] Service Card
- [ ] Program Card
- [ ] Search/Filter Widget

---

## 📊 SUMMARY TABLE

| User Type | # Pages | # Components | Priority | Timeline |
|-----------|---------|-------------|----------|----------|
| Public Visitor | 12 | 7 | 🔴 HIGH | 2-3 wks |
| Individual Donor | 11 | 5 | 🔴 HIGH | 2-3 wks |
| Volunteer | 6 | 4 | 🟡 MEDIUM | 1.5-2 wks |
| NGO Staff | 12 | 8 | 🟡 MEDIUM | 3-4 wks |
| Platform Admin | 10 | 7 | 🟡 MEDIUM | 2-3 wks |
| Community Leader | 6 | 4 | 🟢 LOW | 1.5-2 wks |
| **TOTAL** | **57** | **35** | | **12-18 wks** |

---

## 🎯 BUILD PRIORITY ORDER

### Week 1-2: Foundations
1. **Navigation & Layout** - Header, footer, sidebar components
2. **Auth Pages** - Register, login, password reset
3. **Home Page** - Landing page with hero section

### Week 2-3: Core Discovery
4. **NGO Listing & Detail** - Browse NGOs
5. **Blog Pages** - Read articles
6. **Community Discovery** - Map-based community explorer

### Week 3-4: User Features
7. **User Dashboard** - Profile, donations, volunteer status
8. **Donation Flow** - Payment integration

### Week 4-5: Volunteer Features
9. **Volunteer Application** - Apply as volunteer
10. **Task Management** - View and submit tasks

### Week 5-7: NGO Admin
11. **NGO Registration** - Multi-step onboarding
12. **NGO Dashboard** - Manage everything

### Week 7-9: Admin Panel
13. **Admin Dashboard** - Statistics and management
14. **Verification Queues** - NGO and volunteer verification

### Week 9-10: Community Features
15. **Community Leader** - Community management

### Week 10-12: Polish & Testing
16. **Testing, optimization, and deployment**

---

## ✨ KEY IMPLEMENTATION NOTES

### API Integration Tips
- All APIs require authentication except public routes
- Use JWT token from auth endpoints
- Include `Authorization: Bearer <token>` header
- Handle 401 (Unauthorized) errors with redirect to login
- Handle 400 (Bad Request) with form validation messages
- Handle 500 errors with user-friendly messages

### File Upload Handling
- Use S3 presigned URLs for file uploads
- Backend returns S3 key, frontend generates presigned URL
- Images expire in 7 days (presigned URLs)
- Always validate file types and sizes

### Real-time Features Missing
- Notifications: Currently email-only (add Socket.io if needed)
- Chat: Not implemented (in-app messaging)
- Live Location: Map updates in real-time
- Activity Feed: Basic implementation exists

### Security Considerations
- **XSS Prevention**: Sanitize HTML input (especially blog content)
- **CSRF Protection**: Already handled by httpOnly cookies
- **Rate Limiting**: Applied (300 req/15 min per IP)
- **Validation**: Implement client-side validation
- **Sensitive Data**: Don't log passwords or tokens

---

## 🚀 START BUILDING!

**Pick any user type and build their journey.** The backend is ready for all of them!

Recommended flow:
1. Start with **Public Visitor** pages (easiest)
2. Move to **Individual Donor** (most value)
3. Expand to **NGO & Admin** (core management)
4. Polish everything else

Good luck! 🎉
