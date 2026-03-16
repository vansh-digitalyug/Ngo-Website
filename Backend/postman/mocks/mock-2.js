/**
 * NGO Website Backend API - Postman Collection Setup Script
 * Run: node postman/mocks/ngo-setup-script/mock.js
 * This script creates all collection YAML files and environments.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE = path.resolve(__dirname, "../../..");

function mkdirp(dir) { fs.mkdirSync(dir, { recursive: true }); }
function write(rel, content) {
  const abs = path.join(BASE, rel);
  mkdirp(path.dirname(abs));
  fs.writeFileSync(abs, content, "utf8");
  console.log("✓", rel);
}

// ─── ENVIRONMENTS ─────────────────────────────────────────────────────────────

write("postman/environments/Development.yaml", [
  "name: Development",
  "values:",
  "  - { key: baseUrl,                  value: 'http://localhost:5000', enabled: true, type: default }",
  "  - { key: adminToken,               value: '',                      enabled: true, type: default }",
  "  - { key: userToken,                value: '',                      enabled: true, type: default }",
  "  - { key: ngoToken,                 value: '',                      enabled: true, type: default }",
  "  - { key: userId,                   value: '',                      enabled: true, type: default }",
  "  - { key: ngoId,                    value: '',                      enabled: true, type: default }",
  "  - { key: contactId,                value: '',                      enabled: true, type: default }",
  "  - { key: blogId,                   value: '',                      enabled: true, type: default }",
  "  - { key: eventId,                  value: '',                      enabled: true, type: default }",
  "  - { key: paymentOrderId,           value: '',                      enabled: true, type: default }",
  "  - { key: taskId,                   value: '',                      enabled: true, type: default }",
  "  - { key: volunteerApplicationId,   value: '',                      enabled: true, type: default }",
  "  - { key: kanyadanApplicationId,    value: '',                      enabled: true, type: default }",
  "  - { key: categoryId,               value: '',                      enabled: true, type: default }",
  "  - { key: programId,                value: '',                      enabled: true, type: default }",
].join("\n"));

write("postman/environments/Production.yaml", [
  "name: Production",
  "values:",
  "  - { key: baseUrl,                  value: 'https://api.digitalyuginnovation.com', enabled: true, type: default }",
  "  - { key: adminToken,               value: '',                      enabled: true, type: default }",
  "  - { key: userToken,                value: '',                      enabled: true, type: default }",
  "  - { key: ngoToken,                 value: '',                      enabled: true, type: default }",
  "  - { key: userId,                   value: '',                      enabled: true, type: default }",
  "  - { key: ngoId,                    value: '',                      enabled: true, type: default }",
  "  - { key: contactId,                value: '',                      enabled: true, type: default }",
  "  - { key: blogId,                   value: '',                      enabled: true, type: default }",
  "  - { key: eventId,                  value: '',                      enabled: true, type: default }",
  "  - { key: paymentOrderId,           value: '',                      enabled: true, type: default }",
  "  - { key: taskId,                   value: '',                      enabled: true, type: default }",
  "  - { key: volunteerApplicationId,   value: '',                      enabled: true, type: default }",
  "  - { key: kanyadanApplicationId,    value: '',                      enabled: true, type: default }",
  "  - { key: categoryId,               value: '',                      enabled: true, type: default }",
  "  - { key: programId,                value: '',                      enabled: true, type: default }",
].join("\n"));

// ─── COLLECTION DEFINITION ────────────────────────────────────────────────────

const COLL = "postman/collections/NGO Website Backend API";

write(`${COLL}/.resources/definition.yaml`, `$kind: collection
name: NGO Website Backend API
description: Comprehensive API collection for the NGO Website Backend. Covers Auth, Admin, NGO, Volunteer, Contact, Payment, Blogs, Events, Kanyadan Yojna, Public, Services, Gallery, OTP, KYC, Tasks, and S3 endpoints.
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
`);

// ─── HELPER ───────────────────────────────────────────────────────────────────

function req(folder, name, method, url, authToken, bodyJson, tests, order, queryParams) {
  const safeName = name.replace(/[/\\:*?"<>|]/g, "-");
  const filePath = `${COLL}/${folder}/${safeName}.request.yaml`;
  const needsName = safeName !== name;

  let lines = [`$kind: http-request`];
  if (needsName) lines.push(`name: '${name.replace(/'/g, "''")}'`);
  lines.push(`method: ${method}`);
  lines.push(`url: '${url}'`);
  lines.push(`order: ${order}`);

  if (authToken) {
    lines.push(`auth:`);
    lines.push(`  type: bearer`);
    lines.push(`  credentials:`);
    lines.push(`    - key: token`);
    lines.push(`      value: '${authToken}'`);
  }

  if (bodyJson || method === "POST" || method === "PUT" || method === "PATCH") {
    if (bodyJson) {
      lines.push(`headers:`);
      lines.push(`  - key: Content-Type`);
      lines.push(`    value: application/json`);
      lines.push(`body:`);
      lines.push(`  type: json`);
      lines.push(`  content: |-`);
      bodyJson.split("\n").forEach(l => lines.push(`    ${l}`));
    }
  }

  if (queryParams) {
    lines.push(`queryParams:`);
    queryParams.forEach(p => {
      lines.push(`  - key: ${p.key}`);
      lines.push(`    value: ${p.value}`);
    });
  }

  if (tests) {
    lines.push(`scripts:`);
    lines.push(`  - type: afterResponse`);
    lines.push(`    language: text/javascript`);
    lines.push(`    code: |-`);
    tests.split("\n").forEach(l => lines.push(`      ${l}`));
  }

  write(filePath, lines.join("\n") + "\n");
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

req("Auth", "Send Register OTP", "POST", "{{baseUrl}}/api/send-register-otp", null,
  `{\n  "email": "testuser@example.com",\n  "name": "Test User"\n}`,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  1000);

req("Auth", "Register User", "POST", "{{baseUrl}}/api/register", null,
  `{\n  "name": "Test User",\n  "email": "testuser@example.com",\n  "password": "Test@1234",\n  "otp": "123456"\n}`,
  `pm.test("Status is 201", () => pm.response.to.have.status(201));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\npm.test("Token present", () => pm.expect(pm.response.json().data.token).to.be.a("string"));\nif (pm.response.json().data?.token) pm.collectionVariables.set("userToken", pm.response.json().data.token);`,
  2000);

req("Auth", "Login User", "POST", "{{baseUrl}}/api/login", null,
  `{\n  "email": "testuser@example.com",\n  "password": "Test@1234"\n}`,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\npm.test("Token present", () => pm.expect(pm.response.json().data.token).to.be.a("string"));\nif (pm.response.json().data?.token) pm.collectionVariables.set("userToken", pm.response.json().data.token);\nif (pm.response.json().data?.id) pm.collectionVariables.set("userId", pm.response.json().data.id);`,
  3000);

req("Auth", "Login - Missing Fields", "POST", "{{baseUrl}}/api/login", null,
  `{\n  "email": "testuser@example.com"\n}`,
  `pm.test("Status is 400", () => pm.response.to.have.status(400));\npm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);`,
  4000);

req("Auth", "Login - Wrong Password", "POST", "{{baseUrl}}/api/login", null,
  `{\n  "email": "testuser@example.com",\n  "password": "WrongPass"\n}`,
  `pm.test("Status is 401 or 400", () => pm.expect([400, 401]).to.include(pm.response.code));\npm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);`,
  5000);

req("Auth", "Get Profile", "GET", "{{baseUrl}}/api/profile", "{{userToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\npm.test("Email present", () => pm.expect(pm.response.json().data.email).to.be.a("string"));`,
  6000);

req("Auth", "Get Profile - No Auth", "GET", "{{baseUrl}}/api/profile", null, null,
  `pm.test("Status is 401", () => pm.response.to.have.status(401));`,
  7000);

req("Auth", "Forgot Password", "POST", "{{baseUrl}}/api/forgot-password", null,
  `{\n  "email": "testuser@example.com"\n}`,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  8000);

req("Auth", "Change Password", "POST", "{{baseUrl}}/api/change-password", "{{userToken}}",
  `{\n  "currentPassword": "Test@1234",\n  "newPassword": "NewPass@5678"\n}`,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  9000);

req("Auth", "Logout", "POST", "{{baseUrl}}/api/logout", "{{userToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  10000);

req("Auth", "Get User Donations", "GET", "{{baseUrl}}/api/profile/donations", "{{userToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  11000);

req("Auth", "Get User Volunteer Status", "GET", "{{baseUrl}}/api/profile/volunteer", "{{userToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  12000);

req("Auth", "Get User Kanyadan Applications", "GET", "{{baseUrl}}/api/profile/kanyadan", "{{userToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  13000);

// ─── ADMIN ────────────────────────────────────────────────────────────────────

req("Admin", "Admin Login", "POST", "{{baseUrl}}/api/admin/login", null,
  `{\n  "email": "admin@sevaindia.com",\n  "password": "Admin@1234"\n}`,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\nif (pm.response.json().data?.token) pm.collectionVariables.set("adminToken", pm.response.json().data.token);`,
  1000);

req("Admin", "Admin Login - Wrong Credentials", "POST", "{{baseUrl}}/api/admin/login", null,
  `{\n  "email": "admin@sevaindia.com",\n  "password": "WrongPass"\n}`,
  `pm.test("Status is 401 or 400", () => pm.expect([400, 401]).to.include(pm.response.code));\npm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);`,
  2000);

req("Admin", "Get Dashboard Stats", "GET", "{{baseUrl}}/api/admin/dashboard", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  3000);

req("Admin", "Get All NGOs (Admin)", "GET", "{{baseUrl}}/api/admin/ngos", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data is array", () => pm.expect(pm.response.json().data).to.be.an("array"));`,
  4000);

req("Admin", "Get All Volunteers (Admin)", "GET", "{{baseUrl}}/api/admin/volunteers", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  5000);

req("Admin", "Get All Contacts (Admin)", "GET", "{{baseUrl}}/api/admin/contacts", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  6000);

req("Admin", "Get All Users (Admin)", "GET", "{{baseUrl}}/api/admin/users", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  7000);

req("Admin", "Get All Fund Requests (Admin)", "GET", "{{baseUrl}}/api/admin/funds", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  8000);

req("Admin", "Get All Donations (Admin)", "GET", "{{baseUrl}}/api/admin/donations", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  9000);

req("Admin", "Get Donations By NGO (Admin)", "GET", "{{baseUrl}}/api/admin/donations/by-ngo", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  10000);

req("Admin", "Get All Kanyadan Applications (Admin)", "GET", "{{baseUrl}}/api/admin/kanyadan", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  11000);

req("Admin", "Get Kanyadan Stats (Admin)", "GET", "{{baseUrl}}/api/admin/kanyadan/stats", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  12000);

req("Admin", "Admin - No Auth", "GET", "{{baseUrl}}/api/admin/dashboard", null, null,
  `pm.test("Status is 401", () => pm.response.to.have.status(401));`,
  13000);

// ─── NGO ──────────────────────────────────────────────────────────────────────

req("NGO", "Create NGO", "POST", "{{baseUrl}}/api/ngo/create", null,
  `{\n  "ngoName": "Test NGO",\n  "regType": "Trust",\n  "regNumber": "REG123456",\n  "estYear": 2010,\n  "panNumber": "ABCDE1234F",\n  "description": "A test NGO for API testing",\n  "state": "Maharashtra",\n  "district": "Pune",\n  "city": "Pune",\n  "pincode": "411001",\n  "address": "123 Test Street",\n  "contactName": "John Doe",\n  "contactRole": "Director",\n  "phone": "9876543210",\n  "email": "testngo@example.com",\n  "registrationCertificate": "s3-key/reg-cert.pdf",\n  "agreeToTerms": true\n}`,
  `pm.test("Status is 201", () => pm.response.to.have.status(201));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\nif (pm.response.json().data?._id) pm.collectionVariables.set("ngoId", pm.response.json().data._id);`,
  1000);

req("NGO", "Get All NGOs", "GET", "{{baseUrl}}/api/ngo/", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data is array", () => pm.expect(pm.response.json().data).to.be.an("array"));`,
  2000);

req("NGO", "Get NGO By ID", "GET", "{{baseUrl}}/api/ngo/{{ngoId}}", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\npm.test("NGO ID present", () => pm.expect(pm.response.json().data._id).to.be.a("string"));`,
  3000);

req("NGO", "Get NGO Gallery", "GET", "{{baseUrl}}/api/ngo/{{ngoId}}/gallery", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  4000);

req("NGO", "Get NGO By Invalid ID", "GET", "{{baseUrl}}/api/ngo/invalidid123", null, null,
  `pm.test("Status is 400 or 404", () => pm.expect([400, 404]).to.include(pm.response.code));`,
  5000);

// ─── VOLUNTEER ────────────────────────────────────────────────────────────────

const volBody = `{\n  "fullName": "Test Volunteer",\n  "email": "volunteer@example.com",\n  "phone": "9876543210",\n  "dob": "1995-06-15",\n  "city": "Mumbai",\n  "state": "Maharashtra",\n  "interests": ["Education", "Health"],\n  "mode": "Online",\n  "availability": "Weekends",\n  "occupation": "Engineer",\n  "education": "B.Tech",\n  "skills": ["Teaching", "Coding"],\n  "idType": "Aadhaar",\n  "idNumber": "234567890123",\n  "emergencyName": "Jane Doe",\n  "emergencyPhone": "9876543211",\n  "bgCheck": true,\n  "motivation": "I want to help society",\n  "declaration": true\n}`;

req("Volunteer", "Apply as Volunteer", "POST", "{{baseUrl}}/api/volunteer/apply", "{{userToken}}", volBody,
  `pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  1000);

req("Volunteer", "Apply Volunteer - Invalid Aadhaar", "POST", "{{baseUrl}}/api/volunteer/apply", "{{userToken}}",
  volBody.replace('"234567890123"', '"012345678901"'),
  `pm.test("Status is 400", () => pm.response.to.have.status(400));\npm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);`,
  2000);

req("Volunteer", "Apply Volunteer - Invalid ID Type", "POST", "{{baseUrl}}/api/volunteer/apply", "{{userToken}}",
  volBody.replace('"Aadhaar"', '"Passport"'),
  `pm.test("Status is 400", () => pm.response.to.have.status(400));\npm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);`,
  3000);

req("Volunteer", "Get Volunteer Status", "GET", "{{baseUrl}}/api/volunteer/status", "{{userToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  4000);

req("Volunteer", "Apply Volunteer - No Auth", "POST", "{{baseUrl}}/api/volunteer/apply", null,
  `{}`,
  `pm.test("Status is 401", () => pm.response.to.have.status(401));`,
  5000);

// ─── CONTACT ──────────────────────────────────────────────────────────────────

req("Contact", "Submit Contact Form", "POST", "{{baseUrl}}/api/contact/", null,
  `{\n  "name": "Test User",\n  "email": "test@example.com",\n  "subject": "Test Inquiry",\n  "message": "This is a test message for the contact form.",\n  "privacyAccepted": true\n}`,
  `pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\nif (pm.response.json().data?._id) pm.collectionVariables.set("contactId", pm.response.json().data._id);`,
  1000);

req("Contact", "Submit Contact - Missing Fields", "POST", "{{baseUrl}}/api/contact/", null,
  `{\n  "name": "Test User"\n}`,
  `pm.test("Status is 400", () => pm.response.to.have.status(400));\npm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);`,
  2000);

req("Contact", "Get All Contacts (Admin)", "GET", "{{baseUrl}}/api/contact/all", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  3000);

req("Contact", "Get Contact By ID (Admin)", "GET", "{{baseUrl}}/api/contact/{{contactId}}", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  4000);

// ─── PAYMENT ──────────────────────────────────────────────────────────────────

req("Payment", "Create Payment Order", "POST", "{{baseUrl}}/api/payment/order", null,
  `{\n  "amount": 500,\n  "currency": "INR",\n  "receipt": "receipt_test_001",\n  "ngoId": "{{ngoId}}",\n  "serviceTitle": "Education Support",\n  "donorName": "Test Donor"\n}`,
  `pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\nconst orderId = pm.response.json().data?.orderId || pm.response.json().data?.id;\nif (orderId) pm.collectionVariables.set("paymentOrderId", orderId);`,
  1000);

req("Payment", "Create Order - Missing Amount", "POST", "{{baseUrl}}/api/payment/order", null,
  `{\n  "currency": "INR"\n}`,
  `pm.test("Status is 400", () => pm.response.to.have.status(400));\npm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);`,
  2000);

req("Payment", "Get Payment History", "GET", "{{baseUrl}}/api/payment/history", "{{userToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  3000);

req("Payment", "Get Payment History - No Auth", "GET", "{{baseUrl}}/api/payment/history", null, null,
  `pm.test("Status is 401", () => pm.response.to.have.status(401));`,
  4000);

// ─── BLOGS ────────────────────────────────────────────────────────────────────

req("Blogs", "Get All Blogs", "GET", "{{baseUrl}}/api/blogs/get-all-blog", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  1000);

req("Blogs", "Get Blog By ID", "GET", "{{baseUrl}}/api/blogs/get-blog/{{blogId}}", null, null,
  `pm.test("Status is 200 or 404", () => pm.expect([200, 404]).to.include(pm.response.code));`,
  2000);

req("Blogs", "Create Blog (Admin)", "POST", "{{baseUrl}}/api/blogs/create-blog", "{{adminToken}}",
  `{\n  "title": "Test Blog Post",\n  "content": "This is a test blog post content for API testing.",\n  "category": "General",\n  "tags": ["test", "api"]\n}`,
  `pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\nif (pm.response.json().data?._id) pm.collectionVariables.set("blogId", pm.response.json().data._id);`,
  3000);

req("Blogs", "Create Blog - No Auth", "POST", "{{baseUrl}}/api/blogs/create-blog", null,
  `{\n  "title": "Unauthorized Blog"\n}`,
  `pm.test("Status is 401", () => pm.response.to.have.status(401));`,
  4000);

req("Blogs", "Delete Blog (Admin)", "DELETE", "{{baseUrl}}/api/blogs/delete-blog/{{blogId}}", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  5000);

// ─── EVENTS ───────────────────────────────────────────────────────────────────

req("Events", "Get All Events", "GET", "{{baseUrl}}/api/events/", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  1000);

req("Events", "Get Event By ID", "GET", "{{baseUrl}}/api/events/{{eventId}}", null, null,
  `pm.test("Status is 200 or 404", () => pm.expect([200, 404]).to.include(pm.response.code));`,
  2000);

req("Events", "Create Event", "POST", "{{baseUrl}}/api/events/create", "{{userToken}}",
  `{\n  "title": "Test Event",\n  "description": "A test event for API testing",\n  "date": "2026-06-15",\n  "location": "Mumbai, Maharashtra",\n  "category": "Education"\n}`,
  `pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\nif (pm.response.json().data?._id) pm.collectionVariables.set("eventId", pm.response.json().data._id);`,
  3000);

req("Events", "Create Event - No Auth", "POST", "{{baseUrl}}/api/events/create", null,
  `{\n  "title": "Unauthorized Event"\n}`,
  `pm.test("Status is 401", () => pm.response.to.have.status(401));`,
  4000);

req("Events", "Delete Event", "DELETE", "{{baseUrl}}/api/events/{{eventId}}", "{{userToken}}", null,
  `pm.test("Status is 200 or 204", () => pm.expect([200, 204]).to.include(pm.response.code));`,
  5000);

// ─── KANYADAN YOJNA ───────────────────────────────────────────────────────────

req("Kanyadan Yojna", "Submit Kanyadan Application", "POST", "{{baseUrl}}/api/kanyadan/apply", null,
  `{\n  "guardianName": "Ram Kumar",\n  "mobile": "9876543210",\n  "state": "Uttar Pradesh",\n  "district": "Lucknow",\n  "village": "Aliganj",\n  "girlName": "Priya Kumar",\n  "girlAge": 18,\n  "annualIncome": 120000,\n  "howHeard": "Social Media",\n  "message": "Requesting support for my daughter's marriage."\n}`,
  `pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\nif (pm.response.json().data?._id) pm.collectionVariables.set("kanyadanApplicationId", pm.response.json().data._id);`,
  1000);

req("Kanyadan Yojna", "Submit Kanyadan - Missing Guardian Name", "POST", "{{baseUrl}}/api/kanyadan/apply", null,
  `{\n  "mobile": "9876543210",\n  "state": "UP"\n}`,
  `pm.test("Status is 400", () => pm.response.to.have.status(400));\npm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);`,
  2000);

req("Kanyadan Yojna", "Submit Kanyadan - Missing Mobile", "POST", "{{baseUrl}}/api/kanyadan/apply", null,
  `{\n  "guardianName": "Ram Kumar"\n}`,
  `pm.test("Status is 400", () => pm.response.to.have.status(400));\npm.test("Success false", () => pm.expect(pm.response.json().success).to.be.false);`,
  3000);

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

req("Public", "Get Public Stats", "GET", "{{baseUrl}}/api/public/stats", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  1000);

req("Public", "Get All Categories (Public)", "GET", "{{baseUrl}}/api/public/categories", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  2000);

req("Public", "Get All Programs (Public)", "GET", "{{baseUrl}}/api/public/programs", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  3000);

// ─── SERVICES ─────────────────────────────────────────────────────────────────

req("Services", "Get All Services", "GET", "{{baseUrl}}/api/services/", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  1000);

req("Services", "Get All Categories", "GET", "{{baseUrl}}/api/services/categories", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  2000);

req("Services", "Get All Programs", "GET", "{{baseUrl}}/api/services/programs", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  3000);

req("Services", "Create Category (Admin)", "POST", "{{baseUrl}}/api/services/admin/categories", "{{adminToken}}",
  `{\n  "name": "Test Category",\n  "description": "A test service category"\n}`,
  `pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\nif (pm.response.json().data?._id) pm.collectionVariables.set("categoryId", pm.response.json().data._id);`,
  4000);

req("Services", "Create Program (Admin)", "POST", "{{baseUrl}}/api/services/admin/programs", "{{adminToken}}",
  `{\n  "title": "Test Program",\n  "description": "A test program",\n  "categoryId": "{{categoryId}}",\n  "href": "/test-program"\n}`,
  `pm.test("Status is 200 or 201", () => pm.expect([200, 201]).to.include(pm.response.code));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);\nif (pm.response.json().data?._id) pm.collectionVariables.set("programId", pm.response.json().data._id);`,
  5000);

req("Services", "Create Category - No Auth", "POST", "{{baseUrl}}/api/services/admin/categories", null,
  `{\n  "name": "Unauthorized Category"\n}`,
  `pm.test("Status is 401", () => pm.response.to.have.status(401));`,
  6000);

// ─── GALLERY ──────────────────────────────────────────────────────────────────

req("Gallery", "Get Images (Public)", "GET", "{{baseUrl}}/api/gallery/images", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  1000);

req("Gallery", "Get Videos (Public)", "GET", "{{baseUrl}}/api/gallery/videos", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  2000);

req("Gallery", "Get Gallery Categories", "GET", "{{baseUrl}}/api/gallery/categories", null, null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  3000);

req("Gallery", "Get All Gallery Items (Admin)", "GET", "{{baseUrl}}/api/gallery/admin/all", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  4000);

// ─── OTP ──────────────────────────────────────────────────────────────────────

req("OTP", "Send Phone OTP", "POST", "{{baseUrl}}/api/otp/send-phone", null,
  `{\n  "phone": "9876543210"\n}`,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Success true", () => pm.expect(pm.response.json().success).to.be.true);`,
  1000);

req("OTP", "Verify Phone OTP", "POST", "{{baseUrl}}/api/otp/verify-phone", null,
  `{\n  "phone": "9876543210",\n  "otp": "123456"\n}`,
  `pm.test("Status is 200 or 400", () => pm.expect([200, 400]).to.include(pm.response.code));`,
  2000);

// ─── KYC ──────────────────────────────────────────────────────────────────────

req("KYC", "Request Aadhaar OTP", "POST", "{{baseUrl}}/api/kyc/aadhaar-otp", "{{userToken}}",
  `{\n  "aadhaarNumber": "234567890123"\n}`,
  `pm.test("Status is 200 or 400", () => pm.expect([200, 400]).to.include(pm.response.code));\npm.test("Success field present", () => pm.expect(pm.response.json()).to.have.property("success"));`,
  1000);

req("KYC", "Verify PAN", "POST", "{{baseUrl}}/api/kyc/verify-pan", "{{userToken}}",
  `{\n  "panNumber": "ABCDE1234F"\n}`,
  `pm.test("Status is 200 or 400", () => pm.expect([200, 400]).to.include(pm.response.code));\npm.test("Success field present", () => pm.expect(pm.response.json()).to.have.property("success"));`,
  2000);

req("KYC", "KYC - No Auth", "POST", "{{baseUrl}}/api/kyc/aadhaar-otp", null,
  `{\n  "aadhaarNumber": "234567890123"\n}`,
  `pm.test("Status is 401", () => pm.response.to.have.status(401));`,
  3000);

// ─── TASKS ────────────────────────────────────────────────────────────────────

req("Tasks", "Get Admin Donations", "GET", "{{baseUrl}}/api/tasks/admin/donations", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Data present", () => pm.expect(pm.response.json()).to.have.property("data"));`,
  1000);

req("Tasks", "Get All Tasks (Admin)", "GET", "{{baseUrl}}/api/tasks/admin/all", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  2000);

req("Tasks", "Get Approved Volunteers (Admin)", "GET", "{{baseUrl}}/api/tasks/admin/volunteers", "{{adminToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  3000);

req("Tasks", "Get My Volunteer Tasks", "GET", "{{baseUrl}}/api/tasks/volunteer/my-tasks", "{{userToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  4000);

req("Tasks", "Get Donor Tasks", "GET", "{{baseUrl}}/api/tasks/donor/my-tasks", "{{userToken}}", null,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));`,
  5000);

req("Tasks", "Tasks - No Auth", "GET", "{{baseUrl}}/api/tasks/admin/all", null, null,
  `pm.test("Status is 401", () => pm.response.to.have.status(401));`,
  6000);

// ─── S3 ───────────────────────────────────────────────────────────────────────

req("S3", "Generate Upload URL", "POST", "{{baseUrl}}/api/s3/generate-upload-url", null,
  `{\n  "fileName": "test-document.pdf",\n  "fileType": "application/pdf",\n  "folder": "ngo-docs"\n}`,
  `pm.test("Status is 200", () => pm.response.to.have.status(200));\npm.test("Upload URL present", () => pm.expect(pm.response.json().data?.uploadUrl || pm.response.json().data?.url).to.be.a("string"));`,
  1000);

req("S3", "Get File URL", "GET", "{{baseUrl}}/api/s3/get-url", null, null,
  `pm.test("Status is 200 or 400", () => pm.expect([200, 400]).to.include(pm.response.code));`,
  2000, [{ key: "key", value: "test-document.pdf" }]);

console.log("\n✅ All collection files created successfully!");
console.log("📁 Collection: postman/collections/NGO Website Backend API/");
console.log("🌍 Environments: postman/environments/Development.yaml, Production.yaml");

// @endpoint GET /health
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "NGO collection files created successfully" }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Mock server running on port", process.env.PORT || 3000);
});
