const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE = "/Users/apple/NGO/Ngo-Website/Backend";

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Created:", filePath);
}

// ── ENVIRONMENTS ──────────────────────────────────────────────────────────────

const devEnv = `name: Development
values:
  - key: baseUrl
    value: 'http://localhost:5000'
    enabled: true
    type: default
  - key: adminToken
    value: ''
    enabled: true
    type: default
  - key: userToken
    value: ''
    enabled: true
    type: default
  - key: ngoToken
    value: ''
    enabled: true
    type: default
  - key: userId
    value: ''
    enabled: true
    type: default
  - key: ngoId
    value: ''
    enabled: true
    type: default
  - key: contactId
    value: ''
    enabled: true
    type: default
  - key: blogId
    value: ''
    enabled: true
    type: default
  - key: eventId
    value: ''
    enabled: true
    type: default
  - key: paymentOrderId
    value: ''
    enabled: true
    type: default
  - key: taskId
    value: ''
    enabled: true
    type: default
  - key: volunteerApplicationId
    value: ''
    enabled: true
    type: default
  - key: kanyadanApplicationId
    value: ''
    enabled: true
    type: default
  - key: categoryId
    value: ''
    enabled: true
    type: default
  - key: programId
    value: ''
    enabled: true
    type: default
`;

const prodEnv = `name: Production
values:
  - key: baseUrl
    value: 'https://api.digitalyuginnovation.com'
    enabled: true
    type: default
  - key: adminToken
    value: ''
    enabled: true
    type: default
  - key: userToken
    value: ''
    enabled: true
    type: default
  - key: ngoToken
    value: ''
    enabled: true
    type: default
  - key: userId
    value: ''
    enabled: true
    type: default
  - key: ngoId
    value: ''
    enabled: true
    type: default
  - key: contactId
    value: ''
    enabled: true
    type: default
  - key: blogId
    value: ''
    enabled: true
    type: default
  - key: eventId
    value: ''
    enabled: true
    type: default
  - key: paymentOrderId
    value: ''
    enabled: true
    type: default
  - key: taskId
    value: ''
    enabled: true
    type: default
  - key: volunteerApplicationId
    value: ''
    enabled: true
    type: default
  - key: kanyadanApplicationId
    value: ''
    enabled: true
    type: default
  - key: categoryId
    value: ''
    enabled: true
    type: default
  - key: programId
    value: ''
    enabled: true
    type: default
`;

writeFile(path.join(BASE, "postman/environments/Development.yaml"), devEnv);
writeFile(path.join(BASE, "postman/environments/Production.yaml"), prodEnv);

// ── COLLECTION DEFINITION ─────────────────────────────────────────────────────

const collectionDef = `$kind: collection
name: NGO Website Backend API
description: |-
  Comprehensive API collection for the NGO Website Backend. Covers Auth, Admin, NGO, Volunteer, Contact, Payment, Blogs, Events, Kanyadan Yojna, Public, Services, Gallery, OTP, KYC, Tasks, and S3 endpoints.
variables:
  - key: userToken
    value: ''
  - key: adminToken
    value: ''
  - key: ngoToken
    value: ''
  - key: userId
    value: ''
  - key: ngoId
    value: ''
  - key: contactId
    value: ''
  - key: blogId
    value: ''
  - key: eventId
    value: ''
  - key: paymentOrderId
    value: ''
  - key: taskId
    value: ''
  - key: volunteerApplicationId
    value: ''
  - key: kanyadanApplicationId
    value: ''
  - key: categoryId
    value: ''
  - key: programId
    value: ''
`;

const COLL = path.join(BASE, "postman/collections/NGO Website Backend API");
writeFile(path.join(COLL, ".resources/definition.yaml"), collectionDef);

// ── HELPER ────────────────────────────────────────────────────────────────────
function req(folder, filename, content) {
  const dir = folder ? path.join(COLL, folder) : COLL;
  writeFile(path.join(dir, filename + ".request.yaml"), content);
}

// ── AUTH FOLDER ───────────────────────────────────────────────────────────────

req("Auth", "Send Register OTP", `$kind: http-request
name: Send Register OTP
method: POST
url: '{{baseUrl}}/api/send-register-otp'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "email": "testuser@example.com",
      "name": "Test User"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

req("Auth", "Register User", `$kind: http-request
name: Register User
method: POST
url: '{{baseUrl}}/api/register'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Test User",
      "email": "testuser@example.com",
      "password": "Test@1234",
      "otp": "123456"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 201", () => pm.response.to.have.status(201));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      pm.test("Token present", () => pm.expect(pm.response.json().data.token).to.be.a("string"));
      if (pm.response.json().data?.token) pm.collectionVariables.set("userToken", pm.response.json().data.token);
`);

req("Auth", "Login User", `$kind: http-request
name: Login User
method: POST
url: '{{baseUrl}}/api/login'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "email": "testuser@example.com",
      "password": "Test@1234"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      pm.test("Token present", () => pm.expect(pm.response.json().data.token).to.be.a("string"));
      if (pm.response.json().data?.token) pm.collectionVariables.set("userToken", pm.response.json().data.token);
      if (pm.response.json().data?.id) pm.collectionVariables.set("userId", pm.response.json().data.id);
`);

req("Auth", "Login - Missing Fields", `$kind: http-request
name: 'Login - Missing Fields'
method: POST
url: '{{baseUrl}}/api/login'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "email": "testuser@example.com"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 400", () => pm.response.to.have.status(400));
      pm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);
`);

req("Auth", "Login - Wrong Password", `$kind: http-request
name: 'Login - Wrong Password'
method: POST
url: '{{baseUrl}}/api/login'
order: 5000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "email": "testuser@example.com",
      "password": "WrongPass"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401 or 400", () => pm.expect([400, 401]).to.include(pm.response.code));
      pm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);
`);

req("Auth", "Get Profile", `$kind: http-request
name: Get Profile
method: GET
url: '{{baseUrl}}/api/profile'
order: 6000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      pm.test("Email present", () => pm.expect(pm.response.json().data.email).to.be.a("string"));
`);

req("Auth", "Get Profile - No Auth", `$kind: http-request
name: 'Get Profile - No Auth'
method: GET
url: '{{baseUrl}}/api/profile'
order: 7000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401", () => pm.response.to.have.status(401));
`);

req("Auth", "Forgot Password", `$kind: http-request
name: Forgot Password
method: POST
url: '{{baseUrl}}/api/forgot-password'
order: 8000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "email": "testuser@example.com"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

req("Auth", "Change Password", `$kind: http-request
name: Change Password
method: POST
url: '{{baseUrl}}/api/change-password'
order: 9000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "currentPassword": "Test@1234",
      "newPassword": "NewPass@5678"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

req("Auth", "Logout", `$kind: http-request
name: Logout
method: POST
url: '{{baseUrl}}/api/logout'
order: 10000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

req("Auth", "Get User Donations", `$kind: http-request
name: Get User Donations
method: GET
url: '{{baseUrl}}/api/profile/donations'
order: 11000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Auth", "Get User Volunteer Status", `$kind: http-request
name: Get User Volunteer Status
method: GET
url: '{{baseUrl}}/api/profile/volunteer'
order: 12000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Auth", "Get User Kanyadan Applications", `$kind: http-request
name: Get User Kanyadan Applications
method: GET
url: '{{baseUrl}}/api/profile/kanyadan'
order: 13000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

// ── ADMIN FOLDER ──────────────────────────────────────────────────────────────

req("Admin", "Admin Login", `$kind: http-request
name: Admin Login
method: POST
url: '{{baseUrl}}/api/admin/login'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "email": "admin@sevaindia.com",
      "password": "Admin@1234"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      if (pm.response.json().data?.token) pm.collectionVariables.set("adminToken", pm.response.json().data.token);
`);

req("Admin", "Admin Login - Wrong Credentials", `$kind: http-request
name: 'Admin Login - Wrong Credentials'
method: POST
url: '{{baseUrl}}/api/admin/login'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "email": "admin@sevaindia.com",
      "password": "WrongPass"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401 or 400", () => pm.expect([400, 401]).to.include(pm.response.code));
      pm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);
`);

req("Admin", "Get Dashboard Stats", `$kind: http-request
name: Get Dashboard Stats
method: GET
url: '{{baseUrl}}/api/admin/dashboard'
order: 3000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Admin", "Get All NGOs (Admin)", `$kind: http-request
name: 'Get All NGOs (Admin)'
method: GET
url: '{{baseUrl}}/api/admin/ngos'
order: 4000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data is array", () => pm.expect(pm.response.json().data).to.be.an("array"));
`);

req("Admin", "Get All Volunteers (Admin)", `$kind: http-request
name: 'Get All Volunteers (Admin)'
method: GET
url: '{{baseUrl}}/api/admin/volunteers'
order: 5000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Admin", "Get All Contacts (Admin)", `$kind: http-request
name: 'Get All Contacts (Admin)'
method: GET
url: '{{baseUrl}}/api/admin/contacts'
order: 6000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Admin", "Get All Users (Admin)", `$kind: http-request
name: 'Get All Users (Admin)'
method: GET
url: '{{baseUrl}}/api/admin/users'
order: 7000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Admin", "Get All Fund Requests (Admin)", `$kind: http-request
name: 'Get All Fund Requests (Admin)'
method: GET
url: '{{baseUrl}}/api/admin/funds'
order: 8000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Admin", "Get All Donations (Admin)", `$kind: http-request
name: 'Get All Donations (Admin)'
method: GET
url: '{{baseUrl}}/api/admin/donations'
order: 9000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Admin", "Get Donations By NGO (Admin)", `$kind: http-request
name: 'Get Donations By NGO (Admin)'
method: GET
url: '{{baseUrl}}/api/admin/donations/by-ngo'
order: 10000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Admin", "Get All Kanyadan Applications (Admin)", `$kind: http-request
name: 'Get All Kanyadan Applications (Admin)'
method: GET
url: '{{baseUrl}}/api/admin/kanyadan'
order: 11000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Admin", "Get Kanyadan Stats (Admin)", `$kind: http-request
name: 'Get Kanyadan Stats (Admin)'
method: GET
url: '{{baseUrl}}/api/admin/kanyadan/stats'
order: 12000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Admin", "Admin - No Auth", `$kind: http-request
name: 'Admin - No Auth'
method: GET
url: '{{baseUrl}}/api/admin/dashboard'
order: 13000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401", () => pm.response.to.have.status(401));
`);

// ── NGO FOLDER ────────────────────────────────────────────────────────────────

req("NGO", "Create NGO", `$kind: http-request
name: Create NGO
method: POST
url: '{{baseUrl}}/api/ngo/create'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "ngoName": "Test NGO",
      "regType": "Trust",
      "regNumber": "REG123456",
      "estYear": 2010,
      "panNumber": "ABCDE1234F",
      "description": "A test NGO for API testing",
      "state": "Maharashtra",
      "district": "Pune",
      "city": "Pune",
      "pincode": "411001",
      "address": "123 Test Street",
      "contactName": "John Doe",
      "contactRole": "Director",
      "phone": "9876543210",
      "email": "testngo@example.com",
      "registrationCertificate": "s3-key/reg-cert.pdf",
      "agreeToTerms": true
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 201", () => pm.response.to.have.status(201));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      if (pm.response.json().data?._id) pm.collectionVariables.set("ngoId", pm.response.json().data._id);
`);

req("NGO", "Get All NGOs", `$kind: http-request
name: Get All NGOs
method: GET
url: '{{baseUrl}}/api/ngo/'
order: 2000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data is array", () => pm.expect(pm.response.json().data).to.be.an("array"));
`);

req("NGO", "Get NGO By ID", `$kind: http-request
name: Get NGO By ID
method: GET
url: '{{baseUrl}}/api/ngo/{{ngoId}}'
order: 3000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      pm.test("NGO ID present", () => pm.expect(pm.response.json().data._id).to.be.a("string"));
`);

req("NGO", "Get NGO Gallery", `$kind: http-request
name: Get NGO Gallery
method: GET
url: '{{baseUrl}}/api/ngo/{{ngoId}}/gallery'
order: 4000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

req("NGO", "Get NGO By Invalid ID", `$kind: http-request
name: Get NGO By Invalid ID
method: GET
url: '{{baseUrl}}/api/ngo/invalidid123'
order: 5000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 400 or 404", () => pm.expect([400, 404]).to.include(pm.response.code));
`);

// ── VOLUNTEER FOLDER ──────────────────────────────────────────────────────────

req("Volunteer", "Apply as Volunteer", `$kind: http-request
name: Apply as Volunteer
method: POST
url: '{{baseUrl}}/api/volunteer/apply'
order: 1000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "fullName": "Test Volunteer",
      "email": "volunteer@example.com",
      "phone": "9876543210",
      "dob": "1995-06-15",
      "city": "Mumbai",
      "state": "Maharashtra",
      "interests": ["Education", "Health"],
      "mode": "Online",
      "availability": "Weekends",
      "occupation": "Engineer",
      "education": "B.Tech",
      "skills": ["Teaching", "Coding"],
      "idType": "Aadhaar",
      "idNumber": "234567890123",
      "emergencyName": "Jane Doe",
      "emergencyPhone": "9876543211",
      "bgCheck": true,
      "motivation": "I want to help society",
      "declaration": true
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

req("Volunteer", "Apply Volunteer - Invalid Aadhaar", `$kind: http-request
name: 'Apply Volunteer - Invalid Aadhaar'
method: POST
url: '{{baseUrl}}/api/volunteer/apply'
order: 2000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "fullName": "Test Volunteer",
      "email": "volunteer@example.com",
      "phone": "9876543210",
      "dob": "1995-06-15",
      "city": "Mumbai",
      "state": "Maharashtra",
      "interests": ["Education", "Health"],
      "mode": "Online",
      "availability": "Weekends",
      "occupation": "Engineer",
      "education": "B.Tech",
      "skills": ["Teaching", "Coding"],
      "idType": "Aadhaar",
      "idNumber": "012345678901",
      "emergencyName": "Jane Doe",
      "emergencyPhone": "9876543211",
      "bgCheck": true,
      "motivation": "I want to help society",
      "declaration": true
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 400", () => pm.response.to.have.status(400));
      pm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);
`);

req("Volunteer", "Apply Volunteer - Invalid ID Type", `$kind: http-request
name: 'Apply Volunteer - Invalid ID Type'
method: POST
url: '{{baseUrl}}/api/volunteer/apply'
order: 3000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "fullName": "Test Volunteer",
      "email": "volunteer@example.com",
      "phone": "9876543210",
      "dob": "1995-06-15",
      "city": "Mumbai",
      "state": "Maharashtra",
      "interests": ["Education", "Health"],
      "mode": "Online",
      "availability": "Weekends",
      "occupation": "Engineer",
      "education": "B.Tech",
      "skills": ["Teaching", "Coding"],
      "idType": "Passport",
      "idNumber": "234567890123",
      "emergencyName": "Jane Doe",
      "emergencyPhone": "9876543211",
      "bgCheck": true,
      "motivation": "I want to help society",
      "declaration": true
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 400", () => pm.response.to.have.status(400));
      pm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);
`);

req("Volunteer", "Get Volunteer Status", `$kind: http-request
name: Get Volunteer Status
method: GET
url: '{{baseUrl}}/api/volunteer/status'
order: 4000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

req("Volunteer", "Apply Volunteer - No Auth", `$kind: http-request
name: 'Apply Volunteer - No Auth'
method: POST
url: '{{baseUrl}}/api/volunteer/apply'
order: 5000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {}
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401", () => pm.response.to.have.status(401));
`);

// ── CONTACT FOLDER ────────────────────────────────────────────────────────────

req("Contact", "Submit Contact Form", `$kind: http-request
name: Submit Contact Form
method: POST
url: '{{baseUrl}}/api/contact/'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Test User",
      "email": "test@example.com",
      "subject": "Test Inquiry",
      "message": "This is a test message for the contact form.",
      "privacyAccepted": true
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      if (pm.response.json().data?._id) pm.collectionVariables.set("contactId", pm.response.json().data._id);
`);

req("Contact", "Submit Contact - Missing Fields", `$kind: http-request
name: 'Submit Contact - Missing Fields'
method: POST
url: '{{baseUrl}}/api/contact/'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Test User"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 400", () => pm.response.to.have.status(400));
      pm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);
`);

req("Contact", "Get All Contacts (Admin)", `$kind: http-request
name: 'Get All Contacts (Admin)'
method: GET
url: '{{baseUrl}}/api/contact/all'
order: 3000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Contact", "Get Contact By ID (Admin)", `$kind: http-request
name: 'Get Contact By ID (Admin)'
method: GET
url: '{{baseUrl}}/api/contact/{{contactId}}'
order: 4000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

// ── PAYMENT FOLDER ────────────────────────────────────────────────────────────

req("Payment", "Create Payment Order", `$kind: http-request
name: Create Payment Order
method: POST
url: '{{baseUrl}}/api/payment/order'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "amount": 500,
      "currency": "INR",
      "receipt": "receipt_test_001",
      "ngoId": "{{ngoId}}",
      "serviceTitle": "Education Support",
      "donorName": "Test Donor"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      const orderId = pm.response.json().data?.orderId || pm.response.json().data?.id;
      if (orderId) pm.collectionVariables.set("paymentOrderId", orderId);
`);

req("Payment", "Create Order - Missing Amount", `$kind: http-request
name: 'Create Order - Missing Amount'
method: POST
url: '{{baseUrl}}/api/payment/order'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "currency": "INR"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 400", () => pm.response.to.have.status(400));
      pm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);
`);

req("Payment", "Get Payment History", `$kind: http-request
name: Get Payment History
method: GET
url: '{{baseUrl}}/api/payment/history'
order: 3000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Payment", "Get Payment History - No Auth", `$kind: http-request
name: 'Get Payment History - No Auth'
method: GET
url: '{{baseUrl}}/api/payment/history'
order: 4000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401", () => pm.response.to.have.status(401));
`);

// ── BLOGS FOLDER ──────────────────────────────────────────────────────────────

req("Blogs", "Get All Blogs", `$kind: http-request
name: Get All Blogs
method: GET
url: '{{baseUrl}}/api/blogs/get-all-blog'
order: 1000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Blogs", "Get Blog By ID", `$kind: http-request
name: Get Blog By ID
method: GET
url: '{{baseUrl}}/api/blogs/get-blog/{{blogId}}'
order: 2000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 404", () => pm.expect([200, 404]).to.include(pm.response.code));
`);

req("Blogs", "Create Blog (Admin)", `$kind: http-request
name: 'Create Blog (Admin)'
method: POST
url: '{{baseUrl}}/api/blogs/create-blog'
order: 3000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Test Blog Post",
      "content": "This is a test blog post content for API testing.",
      "category": "General",
      "tags": ["test", "api"]
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      if (pm.response.json().data?._id) pm.collectionVariables.set("blogId", pm.response.json().data._id);
`);

req("Blogs", "Create Blog - No Auth", `$kind: http-request
name: 'Create Blog - No Auth'
method: POST
url: '{{baseUrl}}/api/blogs/create-blog'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Unauthorized Blog"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401", () => pm.response.to.have.status(401));
`);

req("Blogs", "Delete Blog (Admin)", `$kind: http-request
name: 'Delete Blog (Admin)'
method: DELETE
url: '{{baseUrl}}/api/blogs/delete-blog/{{blogId}}'
order: 5000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

// ── EVENTS FOLDER ─────────────────────────────────────────────────────────────

req("Events", "Get All Events", `$kind: http-request
name: Get All Events
method: GET
url: '{{baseUrl}}/api/events/'
order: 1000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Events", "Get Event By ID", `$kind: http-request
name: Get Event By ID
method: GET
url: '{{baseUrl}}/api/events/{{eventId}}'
order: 2000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 404", () => pm.expect([200, 404]).to.include(pm.response.code));
`);

req("Events", "Create Event", `$kind: http-request
name: Create Event
method: POST
url: '{{baseUrl}}/api/events/create'
order: 3000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Test Event",
      "description": "A test event for API testing",
      "date": "2026-06-15",
      "location": "Mumbai, Maharashtra",
      "category": "Education"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      if (pm.response.json().data?._id) pm.collectionVariables.set("eventId", pm.response.json().data._id);
`);

req("Events", "Create Event - No Auth", `$kind: http-request
name: 'Create Event - No Auth'
method: POST
url: '{{baseUrl}}/api/events/create'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Unauthorized Event"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401", () => pm.response.to.have.status(401));
`);

req("Events", "Delete Event", `$kind: http-request
name: Delete Event
method: DELETE
url: '{{baseUrl}}/api/events/{{eventId}}'
order: 5000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 204", () => pm.expect([200, 204]).to.include(pm.response.code));
`);

// ── KANYADAN YOJNA FOLDER ─────────────────────────────────────────────────────

req("Kanyadan Yojna", "Submit Kanyadan Application", `$kind: http-request
name: Submit Kanyadan Application
method: POST
url: '{{baseUrl}}/api/kanyadan/apply'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "guardianName": "Ram Kumar",
      "mobile": "9876543210",
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "village": "Aliganj",
      "girlName": "Priya Kumar",
      "girlAge": 18,
      "annualIncome": 120000,
      "howHeard": "Social Media",
      "message": "Requesting support for my daughter's marriage."
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      if (pm.response.json().data?._id) pm.collectionVariables.set("kanyadanApplicationId", pm.response.json().data._id);
`);

req("Kanyadan Yojna", "Submit Kanyadan - Missing Guardian Name", `$kind: http-request
name: 'Submit Kanyadan - Missing Guardian Name'
method: POST
url: '{{baseUrl}}/api/kanyadan/apply'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "mobile": "9876543210",
      "state": "UP"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 400", () => pm.response.to.have.status(400));
      pm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);
`);

req("Kanyadan Yojna", "Submit Kanyadan - Missing Mobile", `$kind: http-request
name: 'Submit Kanyadan - Missing Mobile'
method: POST
url: '{{baseUrl}}/api/kanyadan/apply'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "guardianName": "Ram Kumar"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 400", () => pm.response.to.have.status(400));
      pm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);
`);

// ── PUBLIC FOLDER ─────────────────────────────────────────────────────────────

req("Public", "Get Public Stats", `$kind: http-request
name: Get Public Stats
method: GET
url: '{{baseUrl}}/api/public/stats'
order: 1000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Public", "Get All Categories (Public)", `$kind: http-request
name: 'Get All Categories (Public)'
method: GET
url: '{{baseUrl}}/api/public/categories'
order: 2000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Public", "Get All Programs (Public)", `$kind: http-request
name: 'Get All Programs (Public)'
method: GET
url: '{{baseUrl}}/api/public/programs'
order: 3000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

// ── SERVICES FOLDER ───────────────────────────────────────────────────────────

req("Services", "Get All Services", `$kind: http-request
name: Get All Services
method: GET
url: '{{baseUrl}}/api/services/'
order: 1000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

req("Services", "Get All Categories", `$kind: http-request
name: Get All Categories
method: GET
url: '{{baseUrl}}/api/services/categories'
order: 2000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Services", "Get All Programs", `$kind: http-request
name: Get All Programs
method: GET
url: '{{baseUrl}}/api/services/programs'
order: 3000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Services", "Create Category (Admin)", `$kind: http-request
name: 'Create Category (Admin)'
method: POST
url: '{{baseUrl}}/api/services/admin/categories'
order: 4000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Test Category",
      "description": "A test service category"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      if (pm.response.json().data?._id) pm.collectionVariables.set("categoryId", pm.response.json().data._id);
`);

req("Services", "Create Program (Admin)", `$kind: http-request
name: 'Create Program (Admin)'
method: POST
url: '{{baseUrl}}/api/services/admin/programs'
order: 5000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Test Program",
      "description": "A test program",
      "categoryId": "{{categoryId}}",
      "href": "/test-program"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
      if (pm.response.json().data?._id) pm.collectionVariables.set("programId", pm.response.json().data._id);
`);

req("Services", "Create Category - No Auth", `$kind: http-request
name: 'Create Category - No Auth'
method: POST
url: '{{baseUrl}}/api/services/admin/categories'
order: 6000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Unauthorized Category"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401", () => pm.response.to.have.status(401));
`);

// ── GALLERY FOLDER ────────────────────────────────────────────────────────────

req("Gallery", "Get Images (Public)", `$kind: http-request
name: 'Get Images (Public)'
method: GET
url: '{{baseUrl}}/api/gallery/images'
order: 1000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Gallery", "Get Videos (Public)", `$kind: http-request
name: 'Get Videos (Public)'
method: GET
url: '{{baseUrl}}/api/gallery/videos'
order: 2000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Gallery", "Get Gallery Categories", `$kind: http-request
name: Get Gallery Categories
method: GET
url: '{{baseUrl}}/api/gallery/categories'
order: 3000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Gallery", "Get All Gallery Items (Admin)", `$kind: http-request
name: 'Get All Gallery Items (Admin)'
method: GET
url: '{{baseUrl}}/api/gallery/admin/all'
order: 4000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

// ── OTP FOLDER ────────────────────────────────────────────────────────────────

req("OTP", "Send Phone OTP", `$kind: http-request
name: Send Phone OTP
method: POST
url: '{{baseUrl}}/api/otp/send-phone'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "phone": "9876543210"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);
`);

req("OTP", "Verify Phone OTP", `$kind: http-request
name: Verify Phone OTP
method: POST
url: '{{baseUrl}}/api/otp/verify-phone'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "phone": "9876543210",
      "otp": "123456"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 400", () => pm.expect([200, 400]).to.include(pm.response.code));
`);

// ── KYC FOLDER ────────────────────────────────────────────────────────────────

req("KYC", "Request Aadhaar OTP", `$kind: http-request
name: Request Aadhaar OTP
method: POST
url: '{{baseUrl}}/api/kyc/aadhaar-otp'
order: 1000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "aadhaarNumber": "234567890123"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 400", () => pm.expect([200, 400]).to.include(pm.response.code));
      pm.test("Success field present", () => pm.expect(pm.response.json()).to.have.property("success"));
`);

req("KYC", "Verify PAN", `$kind: http-request
name: Verify PAN
method: POST
url: '{{baseUrl}}/api/kyc/verify-pan'
order: 2000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "panNumber": "ABCDE1234F"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 400", () => pm.expect([200, 400]).to.include(pm.response.code));
      pm.test("Success field present", () => pm.expect(pm.response.json()).to.have.property("success"));
`);

req("KYC", "KYC - No Auth", `$kind: http-request
name: 'KYC - No Auth'
method: POST
url: '{{baseUrl}}/api/kyc/aadhaar-otp'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "aadhaarNumber": "234567890123"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401", () => pm.response.to.have.status(401));
`);

// ── TASKS FOLDER ──────────────────────────────────────────────────────────────

req("Tasks", "Get Admin Donations", `$kind: http-request
name: Get Admin Donations
method: GET
url: '{{baseUrl}}/api/tasks/admin/donations'
order: 1000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));
`);

req("Tasks", "Get All Tasks (Admin)", `$kind: http-request
name: 'Get All Tasks (Admin)'
method: GET
url: '{{baseUrl}}/api/tasks/admin/all'
order: 2000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Tasks", "Get Approved Volunteers (Admin)", `$kind: http-request
name: 'Get Approved Volunteers (Admin)'
method: GET
url: '{{baseUrl}}/api/tasks/admin/volunteers'
order: 3000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{adminToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Tasks", "Get My Volunteer Tasks", `$kind: http-request
name: Get My Volunteer Tasks
method: GET
url: '{{baseUrl}}/api/tasks/volunteer/my-tasks'
order: 4000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Tasks", "Get Donor Tasks", `$kind: http-request
name: Get Donor Tasks
method: GET
url: '{{baseUrl}}/api/tasks/donor/my-tasks'
order: 5000
auth:
  type: bearer
  credentials:
    - key: token
      value: '{{userToken}}'
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
`);

req("Tasks", "Tasks - No Auth", `$kind: http-request
name: 'Tasks - No Auth'
method: GET
url: '{{baseUrl}}/api/tasks/admin/all'
order: 6000
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 401", () => pm.response.to.have.status(401));
`);

// ── S3 FOLDER ─────────────────────────────────────────────────────────────────

req("S3", "Generate Upload URL", `$kind: http-request
name: Generate Upload URL
method: POST
url: '{{baseUrl}}/api/s3/generate-upload-url'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "fileName": "test-document.pdf",
      "fileType": "application/pdf",
      "folder": "ngo-docs"
    }
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200", () => pm.response.to.have.status(200));
      pm.test("Upload URL present", () => pm.expect(pm.response.json().data?.uploadUrl || pm.response.json().data?.url).to.be.a("string"));
`);

req("S3", "Get File URL", `$kind: http-request
name: Get File URL
method: GET
url: '{{baseUrl}}/api/s3/get-url'
order: 2000
queryParams:
  - key: key
    value: test-document.pdf
scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
      pm.test("Status is 200 or 400", () => pm.expect([200, 400]).to.include(pm.response.code));
`);

console.log("\\n✅ All files created successfully!");

// @endpoint GET /health
const server = http.createServer((req, res) => {
  const { method, url } = req;
  if (method === "GET" && url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "NGO collection files created" }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT || 3000);
});
