/**
 * uploadImages.js — Bulk S3 image uploader + DB updater
 *
 * HOW IT WORKS:
 *   1. Calls POST /api/s3/generate-upload-url  → gets { uploadUrl, key }
 *   2. PUTs the local file binary to uploadUrl  (presigned S3 URL)
 *   3. ONLY IF the PUT succeeds → updates the DB with the key
 *      If the PUT fails the key is NEVER stored in DB
 *
 * BEFORE RUNNING:
 *   - Make sure the backend server is running  (npm run dev)
 *   - Place your images in Frontend/src/assets/images/<category>/
 *   - Fill the UPLOADS array below
 *
 * RUN:
 *   node seed/uploadImages.js
 *
 * OPTIONAL — override server URL:
 *   API_BASE=http://localhost:5000  node seed/uploadImages.js
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import Category from "../models/Services.Category.models.js";
import Program from "../models/Services.Program.models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Backend base URL — change if your server runs on a different port
const API_BASE = process.env.API_BASE || "http://localhost:5000";

// Root of frontend assets so you can use short relative paths
const IMAGES_ROOT = path.resolve(__dirname, "../../Frontend/src/assets/images");

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURE YOUR UPLOADS HERE
// ─────────────────────────────────────────────────────────────────────────────
//
//  file        — path relative to  Frontend/src/assets/images/
//                e.g. "women/widow.png"
//
//  location    — S3 sub-folder inside "Uploads/"
//                e.g. "services/programs"   →  key = Uploads/services/programs/widow.png
//
//  collection  — "program" | "category"
//
//  match       — MongoDB query to find the document
//                e.g. { title: "Hope for Widowed Women" }
//                     { name:  "Women Empowerment" }
//
//  field       — which DB field to update:
//                  "imagekeys"        → Program cover image  (replaces current value)
//                  "galleryImageKeys" → Program carousel     (appends, no duplicates)
//                  "imageUrl"         → Category cover image (replaces current value)
//
// ─────────────────────────────────────────────────────────────────────────────
const UPLOADS = [

  // ═══════════════════════════════════════════════════════════════════════════
  // WOMEN EMPOWERMENT
  // ═══════════════════════════════════════════════════════════════════════════

  // Cover image — Hope for Widowed Women
  {
    file:       "women/widow.png",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Hope for Widowed Women" },
    field:      "imagekeys",
  },

  // Gallery — Hope for Widowed Women
  { file: "women/empowerment/image1.png", location: "services/programs/gallery", collection: "program", match: { title: "Hope for Widowed Women" }, field: "galleryImageKeys" },
  { file: "women/empowerment/image2.png", location: "services/programs/gallery", collection: "program", match: { title: "Hope for Widowed Women" }, field: "galleryImageKeys" },
  { file: "women/empowerment/image3.png", location: "services/programs/gallery", collection: "program", match: { title: "Hope for Widowed Women" }, field: "galleryImageKeys" },
  { file: "women/empowerment/image4.png", location: "services/programs/gallery", collection: "program", match: { title: "Hope for Widowed Women" }, field: "galleryImageKeys" },
  { file: "women/empowerment/image5.png", location: "services/programs/gallery", collection: "program", match: { title: "Hope for Widowed Women" }, field: "galleryImageKeys" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ORPHAN
  // ═══════════════════════════════════════════════════════════════════════════

  // Cover — Education Support
  {
    file:       "orphanage/education.jpg",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Education Support" },
    field:      "imagekeys",
  },

  // Gallery — Education Support
  { file: "orphanage/education/image1.png", location: "services/programs/gallery", collection: "program", match: { title: "Education Support" }, field: "galleryImageKeys" },
  { file: "orphanage/education/image2.png", location: "services/programs/gallery", collection: "program", match: { title: "Education Support" }, field: "galleryImageKeys" },
  { file: "orphanage/education/image3.png", location: "services/programs/gallery", collection: "program", match: { title: "Education Support" }, field: "galleryImageKeys" },
  { file: "orphanage/education/image4.png", location: "services/programs/gallery", collection: "program", match: { title: "Education Support" }, field: "galleryImageKeys" },
  { file: "orphanage/education/image5.png", location: "services/programs/gallery", collection: "program", match: { title: "Education Support" }, field: "galleryImageKeys" },

  // Cover — Nutritious Meal Program
  {
    file:       "orphanage/food.webp",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Nutritious Meal Program" },
    field:      "imagekeys",
  },

  // Gallery — Nutritious Meal Program
  { file: "orphanage/meal/image1.png",   location: "services/programs/gallery", collection: "program", match: { title: "Nutritious Meal Program" }, field: "galleryImageKeys" },
  { file: "orphanage/meal/image2.png",   location: "services/programs/gallery", collection: "program", match: { title: "Nutritious Meal Program" }, field: "galleryImageKeys" },
  { file: "orphanage/meal/image3.png",   location: "services/programs/gallery", collection: "program", match: { title: "Nutritious Meal Program" }, field: "galleryImageKeys" },
  { file: "orphanage/meal/image 4.png",  location: "services/programs/gallery", collection: "program", match: { title: "Nutritious Meal Program" }, field: "galleryImageKeys" },
  { file: "orphanage/meal/image5.png",   location: "services/programs/gallery", collection: "program", match: { title: "Nutritious Meal Program" }, field: "galleryImageKeys" },

  // Cover — Health & Medical Care
  {
    file:       "orphanage/health.jpg",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Health & Medical Care" },
    field:      "imagekeys",
  },

  // Gallery — Health & Medical Care
  { file: "orphanage/medical/image1.png", location: "services/programs/gallery", collection: "program", match: { title: "Health & Medical Care" }, field: "galleryImageKeys" },
  { file: "orphanage/medical/image2.png", location: "services/programs/gallery", collection: "program", match: { title: "Health & Medical Care" }, field: "galleryImageKeys" },
  { file: "orphanage/medical/image3.png", location: "services/programs/gallery", collection: "program", match: { title: "Health & Medical Care" }, field: "galleryImageKeys" },
  { file: "orphanage/medical/image4.png", location: "services/programs/gallery", collection: "program", match: { title: "Health & Medical Care" }, field: "galleryImageKeys" },
  { file: "orphanage/medical/image5.png", location: "services/programs/gallery", collection: "program", match: { title: "Health & Medical Care" }, field: "galleryImageKeys" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ELDERLY
  // ═══════════════════════════════════════════════════════════════════════════

  // Cover — Daily Meal Care
  {
    file:       "elderly/food.jpg",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Daily Meal Care" },
    field:      "imagekeys",
  },

  // Cover — Dignified Living Support
  {
    file:       "elderly/living.jpg",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Dignified Living Support" },
    field:      "imagekeys",
  },

  // Cover — Medical Assistance
  {
    file:       "elderly/medical.webp",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Medical Assistance" },
    field:      "imagekeys",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMUNITY SAFETY
  // ═══════════════════════════════════════════════════════════════════════════

  // Cover — Helmet Distribution Drive
  {
    file:       "communitySafety/helmet.png",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Helmet Distribution Drive" },
    field:      "imagekeys",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL WELFARE
  // ═══════════════════════════════════════════════════════════════════════════

  // Cover — Kanyadan Yojna
  {
    file:       "socialWelfare/kanyadan.png",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Kanyadan Yojna — LIC Support" },
    field:      "imagekeys",
  },

  // Gallery — Kanyadan Yojna
  { file: "socialWelfare/Kanyadan/hero.png",      location: "services/programs/gallery", collection: "program", match: { title: "Kanyadan Yojna — LIC Support" }, field: "galleryImageKeys" },
  { file: "socialWelfare/Kanyadan/Beggining.png", location: "services/programs/gallery", collection: "program", match: { title: "Kanyadan Yojna — LIC Support" }, field: "galleryImageKeys" },
  { file: "socialWelfare/Kanyadan/Help.png",      location: "services/programs/gallery", collection: "program", match: { title: "Kanyadan Yojna — LIC Support" }, field: "galleryImageKeys" },
  { file: "socialWelfare/Kanyadan/Support.png",   location: "services/programs/gallery", collection: "program", match: { title: "Kanyadan Yojna — LIC Support" }, field: "galleryImageKeys" },
  { file: "socialWelfare/Kanyadan/Future.png",    location: "services/programs/gallery", collection: "program", match: { title: "Kanyadan Yojna — LIC Support" }, field: "galleryImageKeys" },

  // Cover — Dignified Last Rites
  {
    file:       "socialWelfare/rites.png",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Dignified Last Rites" },
    field:      "imagekeys",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEDICAL SUPPORT
  // ═══════════════════════════════════════════════════════════════════════════

  // Cover — Free Health Camp Checkups
  {
    file:       "Medical/camp.jpg",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Free Health Camp Checkups" },
    field:      "imagekeys",
  },

  // Cover — Cancer Treatment Support
  {
    file:       "Medical/cancer.png",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Cancer Treatment Support" },
    field:      "imagekeys",
  },

  // Cover — Kidney Dialysis Support
  {
    file:       "Medical/kidney.jpg",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Kidney Dialysis Support" },
    field:      "imagekeys",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INFRASTRUCTURE DEVELOPMENT
  // ═══════════════════════════════════════════════════════════════════════════

  // Cover — Road Construction
  {
    file:       "infrastructure/road.jpg",
    location:   "services/programs",
    collection: "program",
    match:      { title: "Road Construction" },
    field:      "imagekeys",
  },

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
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — ask the backend for a presigned upload URL + S3 key
// ─────────────────────────────────────────────────────────────────────────────
async function getPresignedUrl(fileName, fileType, location) {
  const res = await fetch(`${API_BASE}/api/s3/generate-upload-url`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ fileName, fileType, location }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`generate-upload-url failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  // API returns: { success, data: { uploadUrl, key } }
  return { uploadUrl: json.data.uploadUrl, key: json.data.key };
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — PUT the file binary to the presigned S3 URL
// ─────────────────────────────────────────────────────────────────────────────
async function uploadToPresignedUrl(uploadUrl, filePath, mimeType) {
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
// STEP 3 — only on successful upload: update the DB with the key
// ─────────────────────────────────────────────────────────────────────────────
async function updateDB(collection, match, field, s3Key) {
  const Model = collection === "category" ? Category : Program;

  const doc = await Model.findOne(match);
  if (!doc) throw new Error(`No ${collection} found for: ${JSON.stringify(match)}`);

  if (field === "galleryImageKeys") {
    if (!doc.galleryImageKeys.includes(s3Key)) {
      doc.galleryImageKeys.push(s3Key);
    }
  } else {
    doc[field] = s3Key;
  }

  await doc.save();
  return doc._id;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const run = async () => {
  const active = UPLOADS.filter(e => e && e.file);

  if (active.length === 0) {
    console.log("\n⚠️  No uploads configured.");
    console.log("   Uncomment entries in the UPLOADS array inside seed/uploadImages.js\n");
    process.exit(0);
  }

  await connectDB();
  console.log(`\n📤 Processing ${active.length} upload(s) via ${API_BASE}\n`);

  let passed = 0;
  let failed  = 0;

  for (const entry of active) {
    const absPath  = path.resolve(IMAGES_ROOT, entry.file);
    const fileName = path.basename(absPath);
    const ext      = path.extname(absPath).toLowerCase();
    const mime     = MIME[ext];

    process.stdout.write(`  ⏳ ${entry.file} … `);

    try {
      // ── Validate ────────────────────────────────────────────────────────
      if (!fs.existsSync(absPath)) throw new Error(`File not found: ${absPath}`);
      if (!mime) throw new Error(`Unsupported type "${ext}". Allowed: ${Object.keys(MIME).join(", ")}`);
      if (!["program", "category"].includes(entry.collection)) throw new Error(`collection must be "program" or "category"`);
      if (!entry.field) throw new Error(`field is required`);
      if (!entry.match || !Object.keys(entry.match).length) throw new Error(`match query cannot be empty`);

      // ── Step 1: get presigned URL + key from the backend ────────────────
      const { uploadUrl, key } = await getPresignedUrl(fileName, mime, entry.location || "services/programs");

      // ── Step 2: upload file to S3 ────────────────────────────────────────
      await uploadToPresignedUrl(uploadUrl, absPath, mime);

      // ── Step 3: upload succeeded → save key to DB ────────────────────────
      const docId = await updateDB(entry.collection, entry.match, entry.field, key);

      console.log("✅");
      console.log(`     S3 key  : ${key}`);
      console.log(`     Updated : ${entry.collection} [${docId}] → ${entry.field}\n`);
      passed++;

    } catch (err) {
      console.log("❌");
      console.error(`     Error   : ${err.message}\n`);
      failed++;
    }
  }

  console.log("────────────────────────────────────────");
  console.log(`✅ Passed: ${passed}   ❌ Failed: ${failed}`);
  console.log("────────────────────────────────────────\n");

  process.exit(failed > 0 ? 1 : 0);
};

run();
