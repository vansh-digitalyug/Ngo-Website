const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── PUBLIC ─────────────────────────────────────────────────────────────────
// Backend now resolves S3Imagekey → imageUrl (signed URL) server-side

export async function fetchPublicEvents() {
  const res = await fetch(`${API_BASE_URL}/api/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

export async function fetchEventById(id) {
  const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
  if (!res.ok) throw new Error("Event not found");
  const json = await res.json();
  return json.data || null;
}

export async function fetchEventPhotos(id) {
  const res = await fetch(`${API_BASE_URL}/api/events/${id}/photos`);
  if (!res.ok) throw new Error("Failed to fetch photos");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

// ─── ADMIN ONLY ──────────────────────────────────────────────────────────────

export async function adminFetchAllEvents() {
  const res = await fetch(`${API_BASE_URL}/api/events/admin/all`, {
    headers: authHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

export async function adminTogglePublish(id) {
  const res = await fetch(`${API_BASE_URL}/api/events/admin/${id}/publish`, {
    method: "PATCH",
    headers: authHeaders(),
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to toggle publish");
  return json.data;
}

// ─── AUTHENTICATED ───────────────────────────────────────────────────────────

export async function createEvent(data, isNgo = false) {
  const endpoint = isNgo ? "/api/events/ngo/create" : "/api/events/create";
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create event");
  return json.data; // backend now includes imageUrl
}

export async function updateEvent(id, data, isNgo = false) {
  const endpoint = isNgo ? `/api/events/ngo/${id}` : `/api/events/${id}`;
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update event");
  return json.data; // backend now includes imageUrl
}

export async function deleteEvent(id, isNgo = false) {
  const endpoint = isNgo ? `/api/events/ngo/${id}` : `/api/events/${id}`;
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers: authHeaders(),
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete event");
  return true;
}

export async function fetchMyEvents(isNgo = false) {
  const endpoint = isNgo ? "/api/events/ngo/my-events" : "/api/events/my-events";
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: authHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch your events");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

// ─── S3 IMAGE UPLOAD ─────────────────────────────────────────────────────────
// Step 1: Get presigned PUT URL from backend
// Step 2: Upload directly to S3 from browser
// Step 3: Return the S3 key to store in DB via createEvent / updateEvent

export async function uploadEventImageToS3(file) {
  // Step 1: Request a presigned upload URL
  const urlRes = await fetch(`${API_BASE_URL}/api/s3/generate-upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      location: "events",
    }),
  });
  const urlJson = await urlRes.json();
  if (!urlRes.ok) throw new Error(urlJson.message || "Failed to get upload URL");

  const { uploadUrl, key } = urlJson.data;

  // Step 2: Upload file directly to S3 using the presigned URL
  const s3Res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!s3Res.ok) throw new Error("Failed to upload image to S3");

  // Step 3: Return the key — caller includes it as S3Imagekey in event payload
  return key;
}

// ─── EVENT PHOTOS ─────────────────────────────────────────────────────────────

export async function addEventPhotos(eventId, photos, isNgo = false) {
  const endpoint = isNgo
    ? `/api/events/ngo/${eventId}/photos`
    : `/api/events/${eventId}/photos`;
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ photos }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to add photos");
  return json.data;
}
