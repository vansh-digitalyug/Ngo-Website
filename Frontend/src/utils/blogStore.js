const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchBlogs() {
  const res = await fetch(`${API_BASE_URL}/api/blogs/get-all-blog`);
  if (!res.ok) throw new Error("Failed to fetch blogs");
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

export async function createBlog({ title, content, sections, S3Imagekey, excerpt, category, author }) {
  const res = await fetch(`${API_BASE_URL}/api/blogs/create-blog`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ title, content, sections, S3Imagekey, excerpt, category, author }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create blog");
  return json.data;
}

export async function updateBlogById(id, updates) {
  const res = await fetch(`${API_BASE_URL}/api/blogs/update-blog/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update blog");
  return json.data;
}

export async function deleteBlogById(id) {
  const res = await fetch(`${API_BASE_URL}/api/blogs/delete-blog/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete blog");
  return true;
}

export async function generateBlogContent(prompt) {
  const res = await fetch(`${API_BASE_URL}/api/blogs/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ prompt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to generate blog content");
  return json.data;
}

export async function uploadBlogImageToS3(file) {
  // Step 1: Get presigned upload URL from backend
  const urlRes = await fetch(`${API_BASE_URL}/api/s3/generate-upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    credentials: "include",
    body: JSON.stringify({ fileName: file.name, fileType: file.type, location: "blogs" }),
  });
  const urlJson = await urlRes.json();
  if (!urlRes.ok) throw new Error(urlJson.message || "Failed to get upload URL");
  const { uploadUrl, key } = urlJson.data;

  // Step 2: Upload file directly to S3
  const s3Res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!s3Res.ok) throw new Error("Failed to upload image to S3");

  return key; // Return the S3 key to store in the database
}

const starterBlogs = [
  {
    id: "seed-1",
    title: "How One Community Kitchen Served 12,000 Meals in 90 Days",
    excerpt: "A volunteer-led kitchen in Jaipur scaled quickly with local donations and transparent reporting.",
    content:
      "When food insecurity rose sharply last winter, a local network of volunteers and NGOs launched a neighborhood kitchen model. The initiative focused on daily meal kits for elderly citizens, single mothers, and migrant workers.\n\nWithin three months, the team served over 12,000 meals by pairing micro-donations with local vendor partnerships. Real-time updates and public expense sheets helped maintain donor trust.\n\nThe model is now being replicated in nearby districts with stronger last-mile logistics and volunteer onboarding.",
    coverImage:
      "https://images.unsplash.com/photo-1593113598332-cd59a93a9fe6?q=80&w=1400&auto=format&fit=crop",
    author: "SevaIndia Editorial",
    category: "Community Impact",
    publishedAt: new Date("2026-02-10T10:00:00.000Z").toISOString(),
  },
  {
    id: "seed-2",
    title: "Five Practical Ways to Verify an NGO Before Donating",
    excerpt: "A checklist for checking credibility, fund usage transparency, and reporting discipline.",
    content:
      "Trust-based giving should still be evidence-based. Start with legal registration, annual filings, and board transparency.\n\nReview whether the NGO publishes project-level updates, not just campaign marketing. High-quality organizations track outcomes, not just activity counts.\n\nFinally, check how quickly they acknowledge donations and provide receipts. Predictable communication is often a strong indicator of governance quality.",
    coverImage:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1400&auto=format&fit=crop",
    author: "SevaIndia Research Desk",
    category: "Donor Guide",
    publishedAt: new Date("2026-01-28T09:20:00.000Z").toISOString(),
  },
];

function parseBlogs(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === "object" && item.id && item.title);
  } catch {
    return [];
  }
}

function sortNewestFirst(blogs) {
  return [...blogs].sort((a, b) => {
    const aTime = new Date(a.publishedAt || 0).getTime();
    const bTime = new Date(b.publishedAt || 0).getTime();
    return bTime - aTime;
  });
}

export function getBlogs() {
  const fromStorage = parseBlogs(localStorage.getItem(BLOG_STORAGE_KEY) || "[]");
  if (fromStorage.length === 0) {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(starterBlogs));
    return sortNewestFirst(starterBlogs);
  }
  return sortNewestFirst(fromStorage);
}

export function saveBlogs(blogs) {
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(sortNewestFirst(blogs)));
}

export function addBlog(blogInput) {
  const blogs = getBlogs();
  const newBlog = {
    id: `blog-${Date.now()}`,
    title: String(blogInput.title || "").trim(),
    excerpt: String(blogInput.excerpt || "").trim(),
    content: String(blogInput.content || "").trim(),
    coverImage: String(blogInput.coverImage || "").trim(),
    author: String(blogInput.author || "Admin Team").trim(),
    category: String(blogInput.category || "General").trim(),
    publishedAt: new Date().toISOString(),
  };

  const next = [newBlog, ...blogs];
  saveBlogs(next);
  return newBlog;
}

export function deleteBlog(id) {
  const blogs = getBlogs();
  const next = blogs.filter((blog) => blog.id !== id);
  saveBlogs(next);
}
