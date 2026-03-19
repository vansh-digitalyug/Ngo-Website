import React, { useState, useEffect, useRef } from "react";
import {
  FolderPlus, Layers, Upload, X, Image as ImageIcon, Plus,
  CheckCircle, AlertCircle, Loader2, Trash2, Eye
} from "lucide-react";
import AIDescribeButton from "../../components/ui/AIDescribeButton.jsx";
import {
  createCategory, updateCategory,
  createProgram, updateProgram,
  fetchCategories,
} from "../../services/serviceService.js";
import {
  generateUploadUrl,
  uploadfileToS3,
  getDownloadUrl,
} from "../../services/uploadService.js";

// ─── tiny helpers ──────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// Convert a string to a URL-safe slug: "Free Health Camp" → "free-health-camp"
const toSlug = (str) =>
  str.trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Track uploads in localStorage so incomplete uploads can be cleaned up
const LS_KEY = "svc_pending_uploads";
function getPending() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } }
function setPending(arr) { localStorage.setItem(LS_KEY, JSON.stringify(arr)); }
function removePending(key) { setPending(getPending().filter(k => k !== key)); }
function addPending(key) { const p = getPending(); if (!p.includes(key)) setPending([...p, key]); }

// ─── FilePreview chip ──────────────────────────────────────────────────────────
function FileChip({ file, previewUrl, onRemove }) {
  return (
    <div className="relative group flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700">
      {previewUrl ? (
        <img src={previewUrl} alt={file.name} className="w-10 h-10 object-cover rounded" />
      ) : (
        <ImageIcon size={18} className="text-slate-400" />
      )}
      <span className="max-w-[140px] truncate">{file.name}</span>
      <button type="button" onClick={onRemove}
        className="ml-auto text-slate-400 hover:text-red-500 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Uploaded key chip (shows presigned URL as preview) ───────────────────────
function UploadedChip({ s3Key, onRemove }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    getDownloadUrl(s3Key).then(setUrl).catch(() => { });
  }, [s3Key]);
  return (
    <div className="relative group flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          <img src={url} alt="uploaded" className="w-10 h-10 object-cover rounded hover:opacity-80 transition" />
        </a>
      ) : (
        <Loader2 size={18} className="animate-spin text-green-400" />
      )}
      <span className="max-w-[140px] truncate font-mono text-xs">{s3Key}</span>
      <button type="button" onClick={onRemove}
        className="ml-auto text-green-400 hover:text-red-500 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Step badge ────────────────────────────────────────────────────────────────
function StepBadge({ step, current, done }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all";
  if (done) return <div className={`${base} bg-green-500 text-white`}><CheckCircle size={16} /></div>;
  if (step === current) return <div className={`${base} bg-indigo-600 text-white ring-4 ring-indigo-100`}>{step}</div>;
  return <div className={`${base} bg-slate-200 text-slate-500`}>{step}</div>;
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AddServices() {
  const [mode, setMode] = useState("program"); // "category" | "program"
  const [step, setStep] = useState(1);         // 1 = fill form | 2 = uploading | 3 = done
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);    // { type, msg }

  /* ── Category form state ──────────────────────────────────────────── */
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [catCoverFile, setCatCoverFile] = useState(null);
  const [catCoverPreview, setCatCoverPreview] = useState(null);
  const [savedCatKey, setSavedCatKey] = useState(null);   // after upload
  const catCoverRef = useRef();

  /* ── Program form state ───────────────────────────────────────────── */
  const [progForm, setProgForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    fullDescription: "",
    donationTitle: "",
    cta: "Help Now",
    href: "",
  });

  // Auto-derive href from category name + title whenever either changes
  const autoHref = (() => {
    const cat = categories.find(c => c._id === progForm.categoryId);
    const catSlug = cat ? toSlug(cat.name) : "";
    const titleSlug = toSlug(progForm.title);
    return catSlug && titleSlug ? `/services/${catSlug}/${titleSlug}` : "";
  })();
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]); // [{id, file, preview}]
  const [savedCoverKey, setSavedCoverKey] = useState(null);
  const [savedGalleryKeys, setSavedGalleryKeys] = useState([]);
  const coverRef = useRef();
  const galleryRef = useRef();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => { fetchCategories().then(setCategories).catch(() => { }); }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── File pickers ─────────────────────────────────────────────────────
  const pickCatCover = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCatCoverFile(f);
    setCatCoverPreview(URL.createObjectURL(f));
    e.target.value = "";
  };

  const pickCover = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
    e.target.value = "";
  };

  const pickGallery = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [
      ...prev,
      ...files.map(f => ({ id: uid(), file: f, preview: URL.createObjectURL(f) })),
    ]);
    e.target.value = "";
  };

  // ── Reset entire form ───────────────────────────────────────────────
  const resetAll = () => {
    setCatForm({ name: "", description: "" });
    setCatCoverFile(null); setCatCoverPreview(null); setSavedCatKey(null);
    setProgForm({ categoryId: "", title: "", description: "", fullDescription: "", donationTitle: "", cta: "Help Now", href: "" });
    setCoverFile(null); setCoverPreview(null); setSavedCoverKey(null);
    setGalleryFiles([]); setSavedGalleryKeys([]);
    setStep(1); setProgress({ done: 0, total: 0 }); setStatusMsg("");
  };

  // ════════════════════════════════════════════════════════════════════
  // SUBMIT – the main orchestration function
  // ════════════════════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setStep(2);
    setStatusMsg("Creating record…");

    try {
      if (mode === "category") {
        await submitCategory();
      } else {
        await submitProgram();
      }
      setStatusMsg("Done!");
      setStep(3);
      showToast("success", `${mode === "category" ? "Category" : "Program"} created successfully!`);
    } catch (err) {
      console.error(err);
      showToast("error", err?.response?.data?.message || err.message || "Something went wrong");
      setStep(1);
      setStatusMsg("");
    } finally {
      setUploading(false);
    }
  };

  // ─── Category submit ────────────────────────────────────────────────
  const submitCategory = async () => {
    // 1. Create without image
    setStatusMsg("Creating category record…");
    const created = await createCategory({ name: catForm.name, description: catForm.description });
    const catId = created._id;

    // 2. Upload cover if selected
    if (catCoverFile) {
      const location = `services/category/${catId}`;
      setProgress({ done: 0, total: 1 });
      setStatusMsg("Uploading cover image… (1/1)");

      const { uploadUrl, key } = await generateUploadUrl(catCoverFile.type, catCoverFile.name, location);
      addPending(key);
      await uploadfileToS3(catCoverFile, uploadUrl);
      setProgress({ done: 1, total: 1 });

      // 3. Save key in DB
      setStatusMsg("Saving image key to database…");
      await updateCategory(catId, { imageUrl: key });
      removePending(key);
      setSavedCatKey(key);
    }
  };

  // ─── Program submit ─────────────────────────────────────────────────
  const submitProgram = async () => {
    const resolvedHref = progForm.href.trim() || autoHref || null;

    // 1. Create without images
    setStatusMsg("Creating program record…");
    const created = await createProgram({
      title: progForm.title,
      description: progForm.description,
      fullDescription: progForm.fullDescription,
      categoryId: progForm.categoryId,
      donationTitle: progForm.donationTitle,
      cta: progForm.cta,
      href: resolvedHref,
    });
    const progId = created._id;

    const totalFiles = (coverFile ? 1 : 0) + galleryFiles.length;
    setProgress({ done: 0, total: totalFiles });

    // If no images selected, we're done
    if (totalFiles === 0) {
      setStatusMsg("Program created — no images to upload.");
      return;
    }

    let covKey = null;
    let galKeys = [];

    // 2. Upload cover image
    if (coverFile) {
      setStatusMsg(`Uploading cover image… (1/${totalFiles})`);
      const location = `services/program/${progId}`;
      const { uploadUrl, key } = await generateUploadUrl(coverFile.type, coverFile.name, location);
      addPending(key);
      await uploadfileToS3(coverFile, uploadUrl);
      setProgress(p => ({ ...p, done: p.done + 1 }));
      covKey = key;
      removePending(key);
      setSavedCoverKey(key);
    }

    // 3. Upload gallery images one by one
    for (let i = 0; i < galleryFiles.length; i++) {
      const item = galleryFiles[i];
      const imgNum = (coverFile ? 1 : 0) + i + 1;
      setStatusMsg(`Uploading gallery image ${imgNum}/${totalFiles}…`);
      const location = `services/program/${progId}/galleryImage`;
      const { uploadUrl, key } = await generateUploadUrl(item.file.type, item.file.name, location);
      addPending(key);
      await uploadfileToS3(item.file, uploadUrl);
      setProgress(p => ({ ...p, done: p.done + 1 }));
      galKeys.push(key);
      removePending(key);
      setSavedGalleryKeys(prev => [...prev, key]);
    }

    // 4. Save image keys in DB via update
    setStatusMsg("Saving image keys to database…");
    if (covKey || galKeys.length > 0) {
      await updateProgram(progId, {
        ...(covKey && { imagekeys: covKey }),
        ...(galKeys.length > 0 && { galleryImageKeys: galKeys }),
      });
    }
  };

  // ── Shared textarea / input styles ──────────────────────────────────
  const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1";

  // ════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Add Service</h1>
          <p className="text-slate-500 mt-1 text-sm">Create a new program or category for the services section.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-3 mb-8">
          <StepBadge step={1} current={step} done={step > 1} />
          <span className={`text-sm font-medium ${step === 1 ? "text-indigo-600" : "text-slate-400"}`}>Fill Details</span>
          <div className="flex-1 h-px bg-slate-200" />
          <StepBadge step={2} current={step} done={step > 2} />
          <span className={`text-sm font-medium ${step === 2 ? "text-indigo-600" : "text-slate-400"}`}>Uploading</span>
          <div className="flex-1 h-px bg-slate-200" />
          <StepBadge step={3} current={step} done={step === 3} />
          <span className={`text-sm font-medium ${step === 3 ? "text-green-600" : "text-slate-400"}`}>Done</span>
        </div>

        {/* ── Success screen ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {mode === "category" ? "Category" : "Program"} Created!
            </h2>
            <p className="text-slate-500 text-sm mb-2">
              {mode === "category"
                ? catCoverFile ? "Cover image uploaded and saved to database." : "Category saved to database."
                : (() => {
                  const total = (savedCoverKey ? 1 : 0) + savedGalleryKeys.length;
                  return total > 0
                    ? `${total} image${total > 1 ? "s" : ""} uploaded and saved to database.`
                    : "Program saved to database (no images uploaded).";
                })()
              }
            </p>

            {/* Simple uploaded count — no spinning presigned-URL chips */}
            {(savedCoverKey || savedGalleryKeys.length > 0 || savedCatKey) && (
              <div className="flex flex-wrap justify-center gap-2 mb-6 mt-4">
                {savedCatKey && (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    <CheckCircle size={12} /> Category cover image
                  </span>
                )}
                {savedCoverKey && (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    <CheckCircle size={12} /> Program cover image
                  </span>
                )}
                {savedGalleryKeys.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    <CheckCircle size={12} /> {savedGalleryKeys.length} gallery image{savedGalleryKeys.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}

            <button onClick={resetAll}
              className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
              <Plus size={16} /> Add Another Service
            </button>
          </div>
        )}

        {/* ── Main form (steps 1 & 2) ── */}
        {step !== 3 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Mode toggle */}
            <div className="flex border-b border-slate-100">
              <button type="button"
                onClick={() => { setMode("program"); resetAll(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
                  ${mode === "program" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>
                <Layers size={16} /> Add Program
              </button>
              <button type="button"
                onClick={() => { setMode("category"); resetAll(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors
                  ${mode === "category" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"}`}>
                <FolderPlus size={16} /> Add Category
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* ═══ CATEGORY FORM ═══ */}
              {mode === "category" && (
                <>
                  <div>
                    <label className={labelCls}>Category Name *</label>
                    <input required value={catForm.name}
                      onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Orphanage Programs"
                      className={inputCls} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls} style={{ margin: 0 }}>Description *</label>
                      <AIDescribeButton context="service-category" hint={catForm.name} onGenerated={v => setCatForm(f => ({ ...f, description: v }))} />
                    </div>
                    <textarea required rows={3} value={catForm.description}
                      onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Short description of this category..."
                      className={`${inputCls} resize-none`} />
                  </div>

                  {/* Cover image */}
                  <div>
                    <label className={labelCls}>Cover Image</label>
                    {catCoverFile ? (
                      <div className="flex flex-wrap gap-2">
                        <FileChip file={catCoverFile} previewUrl={catCoverPreview}
                          onRemove={() => { setCatCoverFile(null); setCatCoverPreview(null); }} />
                      </div>
                    ) : (
                      <button type="button" onClick={() => catCoverRef.current.click()}
                        className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-8 flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors group">
                        <div className="w-12 h-12 bg-slate-50 group-hover:bg-indigo-50 rounded-full flex items-center justify-center transition-colors">
                          <Upload size={20} />
                        </div>
                        <span className="text-sm font-medium">Click to select cover image</span>
                        <span className="text-xs">JPG, PNG, WEBP supported</span>
                      </button>
                    )}
                    <input ref={catCoverRef} type="file" accept="image/*" className="hidden" onChange={pickCatCover} />
                  </div>
                </>
              )}

              {/* ═══ PROGRAM FORM ═══ */}
              {mode === "program" && (
                <>
                  {/* Category picker */}
                  <div>
                    <label className={labelCls}>Category *</label>
                    <select required value={progForm.categoryId}
                      onChange={e => setProgForm(f => ({ ...f, categoryId: e.target.value }))}
                      className={inputCls}>
                      <option value="">— Select a category —</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className={labelCls}>Program Title *</label>
                    <input required value={progForm.title}
                      onChange={e => setProgForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Education for Orphans"
                      className={inputCls} />
                  </div>

                  {/* Short description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls} style={{ margin: 0 }}>Short Description *</label>
                      <AIDescribeButton context="service-program" hint={progForm.title} onGenerated={v => setProgForm(f => ({ ...f, description: v }))} />
                    </div>
                    <textarea required rows={2} value={progForm.description}
                      onChange={e => setProgForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief summary shown on the services listing..."
                      className={`${inputCls} resize-none`} />
                  </div>

                  {/* Full description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls} style={{ margin: 0 }}>Full Description</label>
                      <AIDescribeButton context="service-program-full" hint={progForm.title} onGenerated={v => setProgForm(f => ({ ...f, fullDescription: v }))} />
                    </div>
                    <textarea rows={5} value={progForm.fullDescription}
                      onChange={e => setProgForm(f => ({ ...f, fullDescription: e.target.value }))}
                      placeholder="Detailed description shown on the program page..."
                      className={`${inputCls} resize-none`} />
                  </div>

                  {/* CTA row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Donation Title</label>
                      <input value={progForm.donationTitle}
                        onChange={e => setProgForm(f => ({ ...f, donationTitle: e.target.value }))}
                        placeholder="e.g. Support a Child"
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>CTA Button Text</label>
                      <input value={progForm.cta}
                        onChange={e => setProgForm(f => ({ ...f, cta: e.target.value }))}
                        placeholder="Help Now"
                        className={inputCls} />
                    </div>
                  </div>


                  {/* Href */}
                  <div>
                    <label className={labelCls}>
                      Link (href)
                      <span className="ml-1 text-slate-400 font-normal normal-case tracking-normal">
                        — leave blank to auto-generate
                      </span>
                    </label>
                    <input
                      value={progForm.href}
                      onChange={e => setProgForm(f => ({ ...f, href: e.target.value }))}
                      placeholder={autoHref || "/services/category/program-title"}
                      className={inputCls}
                    />
                    {/* Live preview */}
                    {(autoHref || progForm.href) && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-medium text-slate-400">Will save as:</span>
                        <code className={`px-2 py-0.5 rounded font-mono ${progForm.href.trim() ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                          {progForm.href.trim() || autoHref}
                        </code>
                        {!progForm.href.trim() && (
                          <span className="text-amber-500 italic">(auto-generated)</span>
                        )}
                      </p>
                    )}
                  </div>


                  {/* Cover image */}
                  <div>
                    <label className={labelCls}>Cover Image</label>
                    {coverFile ? (
                      <div className="flex flex-wrap gap-2">
                        <FileChip file={coverFile} previewUrl={coverPreview}
                          onRemove={() => { setCoverFile(null); setCoverPreview(null); }} />
                      </div>
                    ) : (
                      <button type="button" onClick={() => coverRef.current.click()}
                        className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors group">
                        <div className="w-10 h-10 bg-slate-50 group-hover:bg-indigo-50 rounded-full flex items-center justify-center transition-colors">
                          <Upload size={18} />
                        </div>
                        <span className="text-sm font-medium">Click to select cover image</span>
                      </button>
                    )}
                    <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={pickCover} />
                  </div>

                  {/* Gallery images */}
                  <div>
                    <label className={labelCls}>Gallery Images</label>
                    <p className="text-xs text-slate-400 mb-2">
                      These will be stored at <code className="bg-slate-100 px-1 rounded">services/program/&#123;id&#125;/galleryImage</code> and displayed on the program's detail page (not the admin gallery).
                    </p>

                    {galleryFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {galleryFiles.map(item => (
                          <FileChip key={item.id} file={item.file} previewUrl={item.preview}
                            onRemove={() => setGalleryFiles(prev => prev.filter(g => g.id !== item.id))} />
                        ))}
                      </div>
                    )}

                    <button type="button" onClick={() => galleryRef.current.click()}
                      className="inline-flex items-center gap-2 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                      <Plus size={15} /> Add Gallery Images
                    </button>
                    <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={pickGallery} />
                  </div>
                </>
              )}

              {/* Upload progress panel (step 2) */}
              {step === 2 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3 text-indigo-700 text-sm">
                    <Loader2 size={18} className="animate-spin flex-shrink-0" />
                    <span className="font-medium">{statusMsg || "Processing…"}</span>
                  </div>
                  {progress.total > 0 && (
                    <>
                      <div className="flex justify-between text-xs font-semibold text-indigo-600">
                        <span>Images uploaded</span>
                        <span>{progress.done}/{progress.total}</span>
                      </div>
                      <div className="w-full bg-indigo-100 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(progress.done / progress.total) * 100}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button type="button" onClick={resetAll} disabled={uploading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                Reset
              </button>
              <button type="submit" disabled={uploading}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm">
                {uploading ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing…</>
                ) : (
                  <><Upload size={16} /> Submit &amp; Upload</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
