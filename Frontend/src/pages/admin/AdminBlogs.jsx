import { useEffect, useRef, useState } from "react";
import {
  BookOpen, CalendarDays, FileText, ImagePlus,
  Layers, Loader2, Pencil, PlusCircle, Sparkles, Trash2, UserRound, X,
} from "lucide-react";
import AIDescribeButton from "../../components/ui/AIDescribeButton.jsx";
import {
  createBlog, deleteBlogById, fetchBlogs, generateBlogContent,
  updateBlogById, uploadBlogImageToS3,
} from "../../utils/blogStore.js";

/* ─── constants ─── */
const CATEGORIES = ["Community Impact", "Donor Guide", "Volunteer Stories", "Education", "Health", "General"];

const CAT = {
  "Community Impact":   { bg: "#dbeafe", color: "#1d4ed8" },
  "Donor Guide":        { bg: "#fef9c3", color: "#854d0e" },
  "Volunteer Stories":  { bg: "#dcfce7", color: "#15803d" },
  "Education":          { bg: "#ede9fe", color: "#6d28d9" },
  "Health":             { bg: "#fee2e2", color: "#991b1b" },
  "General":            { bg: "#f1f5f9", color: "#475569" },
};
const cc = (cat) => CAT[cat] || CAT["General"];

const emptyForm = { title: "", category: "Community Impact", author: "Admin Team", excerpt: "" };
const emptySections = () => [{ heading: "", body: "" }, { heading: "", body: "" }, { heading: "", body: "" }];

/* ─── injected CSS ─── */
const css = `
  @keyframes abSlideIn {
    from { opacity:0; transform:translateY(16px) scale(.98); }
    to   { opacity:1; transform:translateY(0)   scale(1);   }
  }
  @keyframes abFadeIn { from{opacity:0} to{opacity:1} }
  .ab-modal-overlay { animation: abFadeIn .18s ease forwards; }
  .ab-modal-box     { animation: abSlideIn .25s cubic-bezier(.16,1,.3,1) forwards; }
  .ab-card { transition: box-shadow .2s, border-color .2s; }
  .ab-card:hover { box-shadow: 0 8px 28px -4px rgba(0,0,0,.12); border-color:#c7d2e0; }
  .ab-card:hover .ab-card-img { transform:scale(1.04); }
  .ab-card-img { transition: transform .35s ease; }
  .ab-cat-btn { transition: all .15s ease; }
  .ab-cat-btn:hover:not(.active) { background:#f1f5f9!important; }
  .ab-modal-scroll::-webkit-scrollbar { width:5px; }
  .ab-modal-scroll::-webkit-scrollbar-track { background:#f8fafc; }
  .ab-modal-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:8px; }
  .ab-input:focus { border-color:#2563eb!important; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
`;

/* ─── StatCard ─── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "0.74rem", color: "#64748b", fontWeight: 500, letterSpacing: "0.02em" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.15 }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── ImageUpload ─── */
function ImageUpload({ preview, file, existing, onFile, onClear, fileRef }) {
  const showImg = preview || existing;
  return (
    <div>
      <label style={labelSt}>Cover Image {!existing && "*"}</label>
      {showImg ? (
        <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#000" }}>
          <img src={showImg} alt="cover" style={{ width: "100%", height: "200px", objectFit: "cover", display: "block", opacity: .93 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.45) 0%,transparent 55%)" }} />
          <button type="button" onClick={onClear} style={{
            position: "absolute", top: "10px", right: "10px",
            background: "rgba(0,0,0,.6)", border: "none", borderRadius: "50%",
            width: "30px", height: "30px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            <X size={14} />
          </button>
          <div style={{ position: "absolute", bottom: "10px", left: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
            {preview && (
              <span style={{ fontSize: "0.71rem", color: "#fff", background: "rgba(0,0,0,.45)", padding: "2px 8px", borderRadius: "5px", fontWeight: 500, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file?.name}
              </span>
            )}
            {!preview && existing && (
              <span style={{ fontSize: "0.71rem", color: "#fff", background: "rgba(0,0,0,.45)", padding: "2px 8px", borderRadius: "5px", fontWeight: 500 }}>
                Current image — click ✕ to replace
              </span>
            )}
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} style={{
          width: "100%", border: "2px dashed #d1d5db", borderRadius: "10px",
          padding: "28px 20px", cursor: "pointer", background: "#fafafa",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          transition: "all .2s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#fafafa"; }}
        >
          <div style={{ width: "46px", height: "46px", background: "#dbeafe", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImagePlus size={22} color="#2563eb" strokeWidth={1.6} />
          </div>
          <span style={{ fontWeight: 600, color: "#374151", fontSize: "0.87rem" }}>Click to upload cover image</span>
          <span style={{ fontSize: "0.74rem", color: "#9ca3af" }}>JPEG, PNG, WebP, AVIF — max 10 MB</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" style={{ display: "none" }} onChange={onFile} />
    </div>
  );
}

/* ─── AIGenerateModal ─── */
function AIGenerateModal({ onClose, onGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) { setError("Please enter a topic."); return; }
    setLoading(true); setError("");
    try {
      const data = await generateBlogContent(prompt.trim());
      onGenerated(data);
    } catch (err) {
      setError(err.message || "Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ab-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(15,23,42,.55)", backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        className="ab-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "18px",
          width: "100%", maxWidth: "520px",
          boxShadow: "0 32px 64px -12px rgba(0,0,0,.3)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 28px 18px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderRadius: "18px 18px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "9px",
              background: "#faf5ff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Sparkles size={17} color="#7c3aed" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>Generate with AI</h2>
              <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>AI will write a full blog post</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: "8px",
            width: "34px", height: "34px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ padding: "24px 28px 28px", display: "grid", gap: "16px" }}>
          <div>
            <label style={labelSt}>Blog Topic *</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. How volunteering in rural India changes lives"
              rows={4}
              className="ab-input"
              style={{ ...inputSt, resize: "vertical" }}
              autoFocus
            />
            <p style={{ margin: "5px 0 0", fontSize: "0.74rem", color: "#94a3b8" }}>
              Describe the topic, angle, or keywords you want the blog to cover.
            </p>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: "8px",
              background: "#fef2f2", border: "1px solid #fecaca",
              color: "#b91c1c", fontSize: "0.84rem", fontWeight: 500,
            }}>
              ✕ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 20px", borderRadius: "8px",
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#374151", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{
              padding: "10px 24px", borderRadius: "8px", border: "none",
              background: loading ? "#94a3b8" : "linear-gradient(135deg,#6d28d9,#7c3aed)",
              color: "#fff", fontWeight: 700, fontSize: "0.88rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "7px",
              boxShadow: loading ? "none" : "0 4px 14px rgba(109,40,217,.35)",
            }}>
              {loading
                ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Generating…</>
                : <><Sparkles size={15} /> Generate</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── BlogFormModal ─── */
function BlogFormModal({ mode, blog, prefill, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(isEdit ? {
    title: blog.title, category: blog.category,
    author: blog.author, excerpt: blog.excerpt,
  } : prefill ? {
    title: prefill.title || "", category: prefill.category || "Community Impact",
    author: "Admin Team", excerpt: prefill.excerpt || "",
  } : emptyForm);
  const [sections, setSections] = useState(
    isEdit && Array.isArray(blog.sections) && blog.sections.length > 0
      ? blog.sections
      : prefill && Array.isArray(prefill.sections) && prefill.sections.length > 0
        ? prefill.sections
        : emptySections()
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImg, setExistingImg] = useState(isEdit ? blog.coverImageUrl : null);
  const [keepExisting, setKeepExisting] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const fileRef = useRef(null);

  const updateSection = (i, field, val) =>
    setSections((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const addSection = () => setSections((prev) => [...prev, { heading: "", body: "" }]);
  const removeSection = (i) => setSections((prev) => prev.filter((_, idx) => idx !== i));

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const onFieldChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) { setMsg({ text: "Only JPEG, PNG, WebP or AVIF allowed.", ok: false }); return; }
    if (file.size > 10 * 1024 * 1024) { setMsg({ text: "Image must be under 10 MB.", ok: false }); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setKeepExisting(false);
    setMsg({ text: "", ok: true });
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImg(null);
    setKeepExisting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim()) {
      setMsg({ text: "Please fill Title and Excerpt.", ok: false }); return;
    }
    const filledSections = sections.filter((s) => s.body.trim());
    if (filledSections.length === 0) {
      setMsg({ text: "At least one section must have content.", ok: false }); return;
    }
    if (!isEdit && !imageFile) { setMsg({ text: "Please select a cover image.", ok: false }); return; }
    if (isEdit && !keepExisting && !imageFile) { setMsg({ text: "Please upload a new image or keep the existing one.", ok: false }); return; }

    setSubmitting(true); setMsg({ text: "", ok: true });
    try {
      let s3Key = undefined;
      if (imageFile) s3Key = await uploadBlogImageToS3(imageFile);

      const payload = {
        title: form.title.trim(), excerpt: form.excerpt.trim(),
        sections: sections.map((s) => ({ heading: s.heading.trim(), body: s.body.trim() })),
        author: form.author.trim() || "Admin Team",
        category: form.category,
        ...(s3Key ? { S3Imagekey: s3Key } : {}),
      };

      const saved = isEdit
        ? await updateBlogById(blog._id, payload)
        : await createBlog(payload);

      onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      setMsg({ text: err.message || (isEdit ? "Failed to update." : "Failed to publish."), ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="ab-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(15,23,42,.55)", backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px", overflowY: "auto",
      }}
    >
      <div
        className="ab-modal-box ab-modal-scroll"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "18px",
          width: "100%", maxWidth: "680px",
          maxHeight: "92vh", overflowY: "auto",
          boxShadow: "0 32px 64px -12px rgba(0,0,0,.3)",
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: "20px 28px 18px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "#fff", zIndex: 10,
          borderRadius: "18px 18px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "9px",
              background: isEdit ? "#eff6ff" : "#f0fdf4",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isEdit ? <Pencil size={17} color="#2563eb" /> : <PlusCircle size={17} color="#16a34a" />}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              {isEdit && (
                <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>
                  Editing: {blog.title.length > 40 ? blog.title.slice(0, 40) + "…" : blog.title}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: "8px",
            width: "34px", height: "34px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b",
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ padding: "24px 28px 28px", display: "grid", gap: "18px" }}>
          {/* Title */}
          <div>
            <label style={labelSt}>Blog Title *</label>
            <input name="title" value={form.title} onChange={onFieldChange}
              placeholder="Enter an engaging blog title"
              className="ab-input" style={inputSt} />
          </div>

          {/* Category + Author */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelSt}>Category</label>
              <select name="category" value={form.category} onChange={onFieldChange}
                className="ab-input" style={inputSt}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Author</label>
              <input name="author" value={form.author} onChange={onFieldChange}
                placeholder="Author name" className="ab-input" style={inputSt} />
            </div>
          </div>

          {/* Image */}
          <ImageUpload
            preview={imagePreview} file={imageFile}
            existing={keepExisting ? existingImg : null}
            onFile={onImageChange} onClear={clearImage} fileRef={fileRef}
          />

          {/* Excerpt */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
              <label style={{ ...labelSt, margin: 0 }}>
                Excerpt * <span style={{ fontWeight: 400, color: "#94a3b8" }}>(shown on blog cards)</span>
              </label>
              <AIDescribeButton context="blog-excerpt" hint={form.title} onGenerated={v => setForm(p => ({ ...p, excerpt: v }))} />
            </div>
            <textarea name="excerpt" value={form.excerpt} onChange={onFieldChange}
              placeholder="1–2 sentences that hook the reader" rows={2}
              className="ab-input" style={{ ...inputSt, resize: "vertical" }} />
          </div>

          {/* Sections */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <label style={{ ...labelSt, margin: 0 }}>
                Content Sections * <span style={{ fontWeight: 400, color: "#94a3b8" }}>(heading + content per section)</span>
              </label>
              <button type="button" onClick={addSection} style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 12px", borderRadius: "7px", border: "1px solid #bfdbfe",
                background: "#eff6ff", color: "#1d4ed8", fontWeight: 600,
                fontSize: "0.76rem", cursor: "pointer",
              }}>
                <PlusCircle size={13} /> Add Section
              </button>
            </div>
            {sections.map((sec, i) => (
              <div key={i} style={{
                border: "1px solid #e2e8f0", borderRadius: "10px",
                padding: "14px 16px", marginBottom: "10px", background: "#fafbfc",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Section {i + 1}
                  </span>
                  {sections.length > 1 && (
                    <button type="button" onClick={() => removeSection(i)} style={{
                      background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px",
                      width: "26px", height: "26px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626",
                    }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
                <input
                  value={sec.heading}
                  onChange={(e) => updateSection(i, "heading", e.target.value)}
                  placeholder="Section heading (optional)"
                  className="ab-input"
                  style={{ ...inputSt, marginBottom: "10px", fontWeight: 600 }}
                />
                <textarea
                  value={sec.body}
                  onChange={(e) => updateSection(i, "body", e.target.value)}
                  placeholder="Write the content for this section…"
                  rows={4}
                  className="ab-input"
                  style={{ ...inputSt, resize: "vertical" }}
                />
              </div>
            ))}
          </div>

          {/* Message */}
          {msg.text && (
            <div style={{
              padding: "10px 14px", borderRadius: "8px",
              background: msg.ok ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${msg.ok ? "#bbf7d0" : "#fecaca"}`,
              color: msg.ok ? "#166534" : "#b91c1c",
              fontSize: "0.84rem", fontWeight: 500,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              {msg.ok ? "✓" : "✕"} {msg.text}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 20px", borderRadius: "8px",
              border: "1px solid #e2e8f0", background: "#fff",
              color: "#374151", fontWeight: 600, fontSize: "0.88rem", cursor: "pointer",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{
              padding: "10px 24px", borderRadius: "8px", border: "none",
              background: submitting ? "#94a3b8" : isEdit
                ? "linear-gradient(135deg,#1d4ed8,#2563eb)"
                : "linear-gradient(135deg,#15803d,#16a34a)",
              color: "#fff", fontWeight: 700, fontSize: "0.88rem",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "7px",
              boxShadow: submitting ? "none" : isEdit
                ? "0 4px 14px rgba(37,99,235,.35)"
                : "0 4px 14px rgba(22,163,74,.35)",
            }}>
              {submitting
                ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> {isEdit ? "Saving…" : "Publishing…"}</>
                : isEdit ? <><Pencil size={15} /> Save Changes</> : <><PlusCircle size={15} /> Publish Post</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── BlogCard ─── */
function BlogCard({ blog, onEdit, onDelete }) {
  const c = cc(blog.category);
  return (
    <article className="ab-card" style={{
      background: "#fff", borderRadius: "14px",
      border: "1px solid #e2e8f0", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* Image — aspect ratio box so image is always fully visible */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "55%", background: "#f1f5f9", overflow: "hidden" }}>
        {blog.coverImageUrl ? (
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            className="ab-card-img"
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px", color: "#cbd5e1" }}>
            <ImagePlus size={28} strokeWidth={1.4} />
            <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>No Image</span>
          </div>
        )}
        {/* category overlay badge */}
        <span style={{
          position: "absolute", top: "10px", left: "10px",
          background: c.bg, color: c.color,
          fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.07em", padding: "3px 9px", borderRadius: "20px",
          border: `1px solid ${c.color}30`,
        }}>
          {blog.category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <h3 style={{
          margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a",
          lineHeight: 1.35, letterSpacing: "-0.01em",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p style={{
            margin: 0, fontSize: "0.82rem", color: "#64748b", lineHeight: 1.6, flex: 1,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {blog.excerpt}
          </p>
        )}

        {/* Meta */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "0.72rem", color: "#94a3b8" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <UserRound size={11} /> {blog.author}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <CalendarDays size={11} />
            {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid #f1f5f9", marginTop: "auto" }}>
          <button
            onClick={() => onEdit(blog)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: "8px",
              border: "1px solid #bfdbfe", background: "#eff6ff",
              color: "#1d4ed8", fontWeight: 700, fontSize: "0.78rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#eff6ff")}
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={() => onDelete(blog._id)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: "8px",
              border: "1px solid #fecaca", background: "#fff5f5",
              color: "#dc2626", fontWeight: 700, fontSize: "0.78rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff5f5")}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Main Page ─── */
export default function AdminBlogs() {
  const [blogs, setBlogs]               = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [filterCat, setFilterCat]       = useState("All");
  const [modal, setModal]               = useState(null); // null | { mode:"create", prefill? } | { mode:"edit", blog }
  const [aiModal, setAiModal]           = useState(false);
  const [globalMsg, setGlobalMsg]       = useState({ text: "", ok: true });

  useEffect(() => {
    fetchBlogs()
      .then(setBlogs)
      .catch(() => setGlobalMsg({ text: "Failed to load blogs.", ok: false }))
      .finally(() => setLoadingBlogs(false));
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("Permanently delete this blog post?")) return;
    try {
      await deleteBlogById(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      setGlobalMsg({ text: "Blog deleted.", ok: true });
    } catch (err) {
      setGlobalMsg({ text: err.message || "Failed to delete.", ok: false });
    }
  };

  const onSaved = (saved, isEdit) => {
    if (isEdit) {
      setBlogs((prev) => prev.map((b) => (b._id === saved._id ? saved : b)));
      setGlobalMsg({ text: "Blog updated successfully!", ok: true });
    } else {
      setBlogs((prev) => [saved, ...prev]);
      setGlobalMsg({ text: "Blog published successfully!", ok: true });
    }
  };

  const uniqueCats  = ["All", ...new Set(blogs.map((b) => b.category))];
  const filtered    = filterCat === "All" ? blogs : blogs.filter((b) => b.category === filterCat);

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <h1 className="admin-page-title" style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
            <BookOpen size={22} /> Blog Management
          </h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => { setGlobalMsg({ text: "", ok: true }); setAiModal(true); }}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "10px 18px", borderRadius: "9px", border: "1px solid #ddd6fe",
                background: "#faf5ff",
                color: "#6d28d9", fontWeight: 700, fontSize: "0.88rem",
                cursor: "pointer",
              }}
            >
              <Sparkles size={16} /> Generate with AI
            </button>
            <button
              onClick={() => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "create" }); }}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "10px 20px", borderRadius: "9px", border: "none",
                background: "linear-gradient(135deg,#15803d,#16a34a)",
                color: "#fff", fontWeight: 700, fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(22,163,74,.3)",
              }}
            >
              <PlusCircle size={16} /> New Blog Post
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px" }}>
          <StatCard icon={FileText}  label="Total Posts"  value={blogs.length} color="#0f766e" bg="#ccfbf1" />
          <StatCard icon={Layers}    label="Categories"   value={new Set(blogs.map((b) => b.category)).size} color="#7c3aed" bg="#ede9fe" />
          <StatCard icon={UserRound} label="Authors"      value={new Set(blogs.map((b) => b.author)).size}   color="#b45309" bg="#fef3c7" />
        </div>

        {/* ── Global message ── */}
        {globalMsg.text && (
          <div style={{
            padding: "10px 16px", borderRadius: "8px",
            background: globalMsg.ok ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${globalMsg.ok ? "#bbf7d0" : "#fecaca"}`,
            color: globalMsg.ok ? "#166534" : "#b91c1c",
            fontSize: "0.85rem", fontWeight: 500,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>{globalMsg.ok ? "✓" : "✕"} {globalMsg.text}</span>
            <button onClick={() => setGlobalMsg({ text: "", ok: true })} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "1rem", lineHeight: 1, padding: 0 }}>✕</button>
          </div>
        )}

        {/* ── Panel ── */}
        <div className="admin-table-wrapper" style={{ padding: 0, overflow: "hidden" }}>
          {/* Panel header + filter */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "0.97rem", fontWeight: 700, color: "#0f172a" }}>Published Posts</h2>
              <p style={{ margin: 0, fontSize: "0.73rem", color: "#64748b" }}>{filtered.length} of {blogs.length} shown</p>
            </div>
            {/* Category filter chips */}
            {!loadingBlogs && blogs.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {uniqueCats.map((cat) => (
                  <button key={cat} onClick={() => setFilterCat(cat)}
                    className={`ab-cat-btn${filterCat === cat ? " active" : ""}`}
                    style={{
                      padding: "4px 13px", borderRadius: "16px", border: "1px solid",
                      borderColor: filterCat === cat ? "#0f766e" : "#e2e8f0",
                      background: filterCat === cat ? "#0f766e" : "#fff",
                      color: filterCat === cat ? "#fff" : "#374151",
                      fontSize: "0.74rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Blog grid */}
          <div style={{ padding: "20px" }}>
            {loadingBlogs ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "60px 0", color: "#64748b" }}>
                <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "0.9rem" }}>Loading posts…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <BookOpen size={40} style={{ color: "#cbd5e1", margin: "0 auto 12px", display: "block" }} />
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0 0 16px" }}>
                  {filterCat === "All" ? "No blogs published yet." : `No posts in "${filterCat}".`}
                </p>
                <button
                  onClick={() => setModal({ mode: "create" })}
                  style={{
                    padding: "9px 20px", borderRadius: "8px", border: "none",
                    background: "#0f766e", color: "#fff",
                    fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <PlusCircle size={15} /> Create First Post
                </button>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "18px",
              }}>
                {filtered.map((blog) => (
                  <BlogCard
                    key={blog._id} blog={blog}
                    onEdit={(b) => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "edit", blog: b }); }}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── AI Generate Modal ── */}
        {aiModal && (
          <AIGenerateModal
            onClose={() => setAiModal(false)}
            onGenerated={(prefill) => {
              setAiModal(false);
              setModal({ mode: "create", prefill });
            }}
          />
        )}

        {/* ── Create / Edit Modal ── */}
        {modal && (
          <BlogFormModal
            mode={modal.mode}
            blog={modal.blog}
            prefill={modal.prefill}
            onClose={() => setModal(null)}
            onSaved={onSaved}
          />
        )}
      </div>
    </>
  );
}

/* ─── shared styles ─── */
const labelSt = {
  display: "block", marginBottom: "5px",
  fontSize: "0.79rem", fontWeight: 600, color: "#374151",
};

const inputSt = {
  width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px",
  padding: "9px 12px", fontSize: "0.9rem", color: "#0f172a",
  outline: "none", fontFamily: "inherit", background: "#fff",
  boxSizing: "border-box", transition: "border-color .15s, box-shadow .15s",
};
