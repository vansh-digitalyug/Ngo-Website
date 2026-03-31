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

const CAT_COLORS = {
  "Community Impact":  "bg-blue-100 text-blue-700 border-blue-200",
  "Donor Guide":       "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Volunteer Stories": "bg-green-100 text-green-700 border-green-200",
  "Education":         "bg-purple-100 text-purple-700 border-purple-200",
  "Health":            "bg-red-100 text-red-600 border-red-200",
  "General":           "bg-gray-100 text-gray-600 border-gray-200",
};
const catCls = (cat) => CAT_COLORS[cat] || CAT_COLORS["General"];

const emptyForm = { title: "", category: "Community Impact", author: "Admin Team", excerpt: "" };
const emptySections = () => [{ heading: "", body: "" }, { heading: "", body: "" }, { heading: "", body: "" }];

/* ─── StatCard ─── */
function StatCard({ icon: Icon, label, value, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium m-0">{label}</p>
        <p className="text-3xl font-black text-gray-900 m-0 leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ─── ImageUpload ─── */
function ImageUpload({ preview, file, existing, onFile, onClear, fileRef }) {
  const showImg = preview || existing;
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        Cover Image {!existing && <span className="text-red-500">*</span>}
      </label>
      {showImg ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
          <img src={showImg} alt="cover" className="w-full h-48 object-cover opacity-90 block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 border-0 cursor-pointer flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X size={13} />
          </button>
          <div className="absolute bottom-2.5 left-3">
            {preview && (
              <span className="text-[11px] text-white bg-black/45 px-2 py-0.5 rounded font-medium max-w-[200px] truncate block">
                {file?.name}
              </span>
            )}
            {!preview && existing && (
              <span className="text-[11px] text-white bg-black/45 px-2 py-0.5 rounded font-medium">
                Current image — click ✕ to replace
              </span>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-7 px-5 cursor-pointer bg-gray-50 hover:border-[#2d5a1b] hover:bg-green-50 flex flex-col items-center gap-2 transition-all"
        >
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
            <ImagePlus size={20} className="text-blue-600" strokeWidth={1.6} />
          </div>
          <span className="font-semibold text-gray-700 text-sm">Click to upload cover image</span>
          <span className="text-xs text-gray-400">JPEG, PNG, WebP, AVIF — max 10 MB</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}

/* ─── AIGenerateModal ─── */
function AIGenerateModal({ onClose, onGenerated }) {
  const [prompt,  setPrompt]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

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
      className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
        style={{ animation: "abSlideIn .25s cubic-bezier(.16,1,.3,1) forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Sparkles size={17} className="text-purple-600" />
            </div>
            <div>
              <h2 className="m-0 text-base font-black text-gray-900">Generate with AI</h2>
              <p className="m-0 text-xs text-gray-400 mt-0.5">AI will write a full blog post</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 border-0 cursor-pointer flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Blog Topic <span className="text-red-500">*</span></label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. How volunteering in rural India changes lives"
              rows={4}
              autoFocus
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#2d5a1b] resize-vertical transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1 m-0">Describe the topic, angle, or keywords you want the blog to cover.</p>
          </div>

          {error && (
            <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              ✕ {error}
            </div>
          )}

          <div className="flex gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl border-0 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold text-sm cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                : <><Sparkles size={14} /> Generate</>
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
  const [sections,     setSections]     = useState(
    isEdit && Array.isArray(blog.sections) && blog.sections.length > 0
      ? blog.sections
      : prefill && Array.isArray(prefill.sections) && prefill.sections.length > 0
        ? prefill.sections
        : emptySections()
  );
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImg,  setExistingImg]  = useState(isEdit ? blog.coverImageUrl : null);
  const [keepExisting, setKeepExisting] = useState(isEdit);
  const [submitting,   setSubmitting]   = useState(false);
  const [msg,          setMsg]          = useState({ text: "", ok: true });
  const fileRef = useRef(null);

  const updateSection = (i, field, val) =>
    setSections((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const addSection    = () => setSections((prev) => [...prev, { heading: "", body: "" }]);
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
    if (isEdit && !keepExisting && !imageFile) {
      setMsg({ text: "Please upload a new image or keep the existing one.", ok: false }); return;
    }
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
      const saved = isEdit ? await updateBlogById(blog._id, payload) : await createBlog(payload);
      onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      setMsg({ text: err.message || (isEdit ? "Failed to update." : "Failed to publish."), ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#2d5a1b] transition-colors bg-white box-border";

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto"
        style={{ animation: "abSlideIn .25s cubic-bezier(.16,1,.3,1) forwards" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEdit ? "bg-blue-50" : "bg-green-50"}`}>
              {isEdit ? <Pencil size={16} className="text-blue-600" /> : <PlusCircle size={16} className="text-green-600" />}
            </div>
            <div>
              <h2 className="m-0 text-base font-black text-gray-900">
                {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              {isEdit && (
                <p className="m-0 text-xs text-gray-400 mt-0.5">
                  {blog.title.length > 40 ? blog.title.slice(0, 40) + "…" : blog.title}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 border-0 cursor-pointer flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Blog Title <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={onFieldChange}
              placeholder="Enter an engaging blog title"
              className={inputCls} />
          </div>

          {/* Category + Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={onFieldChange} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Author</label>
              <input name="author" value={form.author} onChange={onFieldChange}
                placeholder="Author name" className={inputCls} />
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600 m-0">
                Excerpt <span className="text-red-500">*</span>{" "}
                <span className="text-gray-400 font-normal">(shown on blog cards)</span>
              </label>
              <AIDescribeButton context="blog-excerpt" hint={form.title} onGenerated={(v) => setForm((p) => ({ ...p, excerpt: v }))} />
            </div>
            <textarea name="excerpt" value={form.excerpt} onChange={onFieldChange}
              placeholder="1–2 sentences that hook the reader" rows={2}
              className={`${inputCls} resize-vertical`} />
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-600 m-0">
                Content Sections <span className="text-red-500">*</span>{" "}
                <span className="text-gray-400 font-normal">(heading + content per section)</span>
              </label>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <PlusCircle size={13} /> Add Section
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {sections.map((sec, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Section {i + 1}</span>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(i)}
                        className="w-6 h-6 rounded-md bg-red-50 border border-red-200 cursor-pointer flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <input
                    value={sec.heading}
                    onChange={(e) => updateSection(i, "heading", e.target.value)}
                    placeholder="Section heading (optional)"
                    className={`${inputCls} mb-2.5 font-semibold`}
                  />
                  <textarea
                    value={sec.body}
                    onChange={(e) => updateSection(i, "body", e.target.value)}
                    placeholder="Write the content for this section…"
                    rows={4}
                    className={`${inputCls} resize-vertical`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          {msg.text && (
            <div className={`px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 ${
              msg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {msg.ok ? "✓" : "✕"} {msg.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 rounded-xl border-0 text-white font-bold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors ${
                isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-[#2d5a1b] hover:bg-[#1f3f12]"
              }`}
            >
              {submitting
                ? <><Loader2 size={14} className="animate-spin" /> {isEdit ? "Saving…" : "Publishing…"}</>
                : isEdit
                  ? <><Pencil size={14} /> Save Changes</>
                  : <><PlusCircle size={14} /> Publish Post</>
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
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">

      {/* Cover image */}
      <div className="relative w-full bg-gray-100 overflow-hidden" style={{ paddingBottom: "55%" }}>
        {blog.coverImageUrl ? (
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover hover:scale-[1.04] transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
            <ImagePlus size={28} strokeWidth={1.4} />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}
        {/* Category badge */}
        <span className={`absolute top-2.5 left-2.5 inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${catCls(blog.category)}`}>
          {blog.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="m-0 text-[15px] font-black text-gray-900 leading-snug line-clamp-2">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="m-0 text-sm text-gray-500 leading-relaxed flex-1 line-clamp-2">
            {blog.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <UserRound size={11} /> {blog.author}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={11} />
            {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
          <button
            onClick={() => onEdit(blog)}
            className="flex-1 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={() => onDelete(blog._id)}
            className="flex-1 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-500 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Main Page ─── */
export default function AdminBlogs() {
  const [blogs,        setBlogs]        = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [filterCat,    setFilterCat]    = useState("All");
  const [modal,        setModal]        = useState(null);
  const [aiModal,      setAiModal]      = useState(false);
  const [globalMsg,    setGlobalMsg]    = useState({ text: "", ok: true });

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

  const uniqueCats = ["All", ...new Set(blogs.map((b) => b.category))];
  const filtered   = filterCat === "All" ? blogs : blogs.filter((b) => b.category === filterCat);

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      {/* keyframe for modals */}
      <style>{`@keyframes abSlideIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[1.8rem] sm:text-[2.4rem] font-black text-gray-900 leading-tight m-0">
              Blog Management
            </h1>
            <p className="text-sm text-gray-500 mt-1 m-0">Write, publish, and manage all blog posts.</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => { setGlobalMsg({ text: "", ok: true }); setAiModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 font-semibold text-sm hover:bg-purple-100 cursor-pointer transition-colors"
            >
              <Sparkles size={15} /> Generate with AI
            </button>
            <button
              onClick={() => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "create" }); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-0 bg-[#2d5a1b] hover:bg-[#1f3f12] text-white font-semibold text-sm cursor-pointer transition-colors shadow-sm"
            >
              <PlusCircle size={15} /> New Blog Post
            </button>
          </div>
        </div>

        {/* ══ STATS ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
          <StatCard icon={FileText}  label="Total Posts"  value={blogs.length}                                  iconBg="bg-teal-100"   iconColor="text-teal-600" />
          <StatCard icon={Layers}    label="Categories"   value={new Set(blogs.map((b) => b.category)).size}   iconBg="bg-purple-100" iconColor="text-purple-600" />
          <StatCard icon={UserRound} label="Authors"      value={new Set(blogs.map((b) => b.author)).size}     iconBg="bg-amber-100"  iconColor="text-amber-600" />
        </div>

        {/* ══ GLOBAL MESSAGE ══ */}
        {globalMsg.text && (
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium mb-5 ${
            globalMsg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <span>{globalMsg.ok ? "✓" : "✕"} {globalMsg.text}</span>
            <button
              onClick={() => setGlobalMsg({ text: "", ok: true })}
              className="border-0 bg-transparent cursor-pointer text-inherit text-base leading-none p-0 ml-4 hover:opacity-70"
            >✕</button>
          </div>
        )}

        {/* ══ PANEL ══ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Panel header + category filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
            <div>
              <h2 className="m-0 text-[15px] font-bold text-gray-900">Published Posts</h2>
              <p className="m-0 text-xs text-gray-400 mt-0.5">{filtered.length} of {blogs.length} shown</p>
            </div>
            {!loadingBlogs && blogs.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {uniqueCats.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                      filterCat === cat
                        ? "bg-[#2d5a1b] border-[#2d5a1b] text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Blog grid */}
          <div className="p-4 sm:p-5">
            {loadingBlogs ? (
              <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-sm">Loading posts…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm m-0 mb-4">
                  {filterCat === "All" ? "No blogs published yet." : `No posts in "${filterCat}".`}
                </p>
                <button
                  onClick={() => setModal({ mode: "create" })}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border-0 bg-[#2d5a1b] text-white font-semibold text-sm cursor-pointer hover:bg-[#1f3f12] transition-colors"
                >
                  <PlusCircle size={15} /> Create First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filtered.map((blog) => (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    onEdit={(b) => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "edit", blog: b }); }}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══ AI Generate Modal ══ */}
        {aiModal && (
          <AIGenerateModal
            onClose={() => setAiModal(false)}
            onGenerated={(prefill) => { setAiModal(false); setModal({ mode: "create", prefill }); }}
          />
        )}

        {/* ══ Create / Edit Modal ══ */}
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
    </div>
  );
}
