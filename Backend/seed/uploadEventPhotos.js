/**
 * uploadEventPhotos.js — Bulk past-event photo uploader
 *
 * HOW IT WORKS:
 *   1. Logs in as admin  →  gets JWT token
 *   2. For each entry in UPLOADS:
 *        a. Calls POST /api/s3/generate-upload-url  → { uploadUrl, key }
 *        b. PUTs the local file binary to the presigned S3 URL
 *        c. ONLY on success → calls POST /api/events/:eventId/photos
 *           to register the S3 key against the event in MongoDB
 *
 * BEFORE RUNNING:
 *   - Make sure the backend server is running  (npm run dev)
 *   - Set ADMIN_EMAIL / ADMIN_PASSWORD in .env  (or edit defaults below)
 *   - Fill the UPLOADS array below with your event photos
 *   - Each file path is relative to:  Frontend/src/assets/images/
 *
 * RUN:
 *   node seed/uploadEventPhotos.js
 *
 * OPTIONAL env overrides:
 *   API_BASE=http://localhost:5000  node seed/uploadEventPhotos.js
 */

import path        from "path";
import fs          from "fs";
import { fileURLToPath } from "url";
import "../config/loadEnv.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const API_BASE    = process.env.API_BASE    || "http://localhost:5000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASS  = process.env.ADMIN_PASSWORD || "admin123";

// Root of frontend assets so you can use short relative paths
const IMAGES_ROOT = path.resolve(__dirname, "../../Frontend/src/assets/images");

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURE YOUR EVENT PHOTO UPLOADS HERE
// ─────────────────────────────────────────────────────────────────────────────
//
//  eventId  — MongoDB _id of the event  (from /api/events/admin/all)
//  file     — path relative to  Frontend/src/assets/images/
//             e.g.  "socialWelfare/Kanyadan/hero.png"
//  caption  — optional text shown under the photo
//  location — S3 sub-folder (default: "events/photos")
//             key stored in DB → Uploads/events/photos/<filename>
//
// ─────────────────────────────────────────────────────────────────────────────
const UPLOADS = [

  // ── Example: Kanyadan event photos ───────────────────────────────────────
  // {
  //   eventId: "664abc123def456789000001",
  //   file:    "socialWelfare/Kanyadan/hero.png",
  //   caption: "Opening ceremony",
  // },
  // {
  //   eventId: "664abc123def456789000001",
  //   file:    "socialWelfare/Kanyadan/Beggining.png",
  //   caption: "Beginning of the event",
  // },
  // {
  //   eventId: "664abc123def456789000001",
  //   file:    "socialWelfare/Kanyadan/Help.png",
  //   caption: "Volunteers helping families",
  // },
  // {
  //   eventId: "664abc123def456789000001",
  //   file:    "socialWelfare/Kanyadan/Support.png",
  //   caption: "Community support",
  // },
  // {
  //   eventId: "664abc123def456789000001",
  //   file:    "socialWelfare/Kanyadan/Future.png",
  //   caption: "Building a better future",
  // },

  // ── Example: Orphan Education event ──────────────────────────────────────
  // {
  //   eventId: "664abc123def456789000002",
  //   file:    "orphanage/education/image1.png",
  //   caption: "Students receiving supplies",
  // },
  // {
  //   eventId: "664abc123def456789000002",
  //   file:    "orphanage/education/image2.png",
  // },

  // ── Example: Medical camp ─────────────────────────────────────────────────
  // {
  //   eventId: "664abc123def456789000003",
  //   file:    "Medical/camp.jpg",
  //   caption: "Free health checkup camp",
  // },

];

// ─────────────────────────────────────────────────────────────────────────────
// MIME map
// ─────────────────────────────────────────────────────────────────────────────
const MIME = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".avif": "image/avif",
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 0 — login as admin and get JWT token
// ─────────────────────────────────────────────────────────────────────────────
async function adminLogin() {
  const res  = await fetch(`${API_BASE}/api/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin login failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const token = json.token || json.data?.token || json.accessToken;
  if (!token) throw new Error("Login succeeded but no token in response: " + JSON.stringify(json));
  return token;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — ask the backend for a presigned upload URL + S3 key
// ─────────────────────────────────────────────────────────────────────────────
async function getPresignedUrl(token, fileName, fileType, location) {
  const res = await fetch(`${API_BASE}/api/s3/generate-upload-url`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ fileName, fileType, location }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`generate-upload-url failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return { uploadUrl: json.data.uploadUrl, key: json.data.key };
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — PUT the file binary to the presigned S3 URL
// ─────────────────────────────────────────────────────────────────────────────
async function uploadToS3(uploadUrl, filePath, mimeType) {
  const fileBuffer = fs.readFileSync(filePath);

  const res = await fetch(uploadUrl, {
    method:  "PUT",
    headers: { "Content-Type": mimeType },
    body:    fileBuffer,
  });

  if (!res.ok) {
    throw new Error(`S3 PUT failed (${res.status}): ${res.statusText}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — register the S3 key against the event in MongoDB
// ─────────────────────────────────────────────────────────────────────────────
async function registerPhoto(token, eventId, s3Key, caption) {
  const res = await fetch(`${API_BASE}/api/events/${eventId}/photos`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      photos: [{ S3Imagekey: s3Key, caption: caption || "" }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Register photo failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const run = async () => {
  const active = UPLOADS.filter(e => e && e.file && e.eventId);

  if (active.length === 0) {
    console.log("\n  No uploads configured.");
    console.log("  Uncomment entries in the UPLOADS array inside seed/uploadEventPhotos.js\n");
    process.exit(0);
  }

  // Login
  let token;
  try {
    token = await adminLogin();
    console.log(`\n  Logged in as admin (${ADMIN_EMAIL})`);
  } catch (err) {
    console.error(`\n  Login error: ${err.message}\n`);
    process.exit(1);
  }

  console.log(`  Processing ${active.length} photo upload(s) via ${API_BASE}\n`);

  let passed = 0;
  let failed  = 0;

  for (const entry of active) {
    const absPath  = path.resolve(IMAGES_ROOT, entry.file);
    const fileName = path.basename(absPath);
    const ext      = path.extname(absPath).toLowerCase();
    const mime     = MIME[ext];
    const location = entry.location || "events/photos";

    process.stdout.write(`  ... ${entry.file} (event: ${entry.eventId}) ... `);

    try {
      // Validate
      if (!fs.existsSync(absPath))
        throw new Error(`File not found: ${absPath}`);
      if (!mime)
        throw new Error(`Unsupported type "${ext}". Allowed: ${Object.keys(MIME).join(", ")}`);

      // Step 1 — presigned URL
      const { uploadUrl, key } = await getPresignedUrl(token, fileName, mime, location);

      // Step 2 — upload to S3
      await uploadToS3(uploadUrl, absPath, mime);

      // Step 3 — register in DB via event photos API
      await registerPhoto(token, entry.eventId, key, entry.caption);

      console.log("OK");
      console.log(`       S3 key : ${key}`);
      if (entry.caption) console.log(`       Caption: ${entry.caption}`);
      console.log();
      passed++;

    } catch (err) {
      console.log("FAILED");
      console.error(`       Error  : ${err.message}\n`);
      failed++;
    }
  }

  console.log("----------------------------------------");
  console.log(`  Passed: ${passed}   Failed: ${failed}`);
  console.log("----------------------------------------\n");

  process.exit(failed > 0 ? 1 : 0);
};

run();
