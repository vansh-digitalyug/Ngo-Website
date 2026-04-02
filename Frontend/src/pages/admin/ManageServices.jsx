import { useState, useEffect, useRef } from "react";
import {
  FolderOpen, Pencil, Trash2, ChevronDown, ChevronRight,
  Save, X, Plus, Upload, Image as ImageIcon, Loader2, CheckCircle,
  AlertCircle, Eye, RefreshCw, EyeOff
} from "lucide-react";
import AIDescribeButton from "../../components/ui/AIDescribeButton.jsx";
import {
  fetchCategoriesAdmin, fetchProgramsByCategoryAdmin,
  updateCategory, hideCategory, unhideCategory,
  updateProgram, hideProgram, unhideProgram, hardDeleteProgram,
} from "../../services/serviceService.js";
import {
  generateUploadUrl, uploadfileToS3, getDownloadUrl,
} from "../../services/uploadService.js";

// ─── helpers ──────────────────────────────────────────────────────────────────
const toSlug = (str) =>
  str.trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// S3 thumbnail with optional fallback icon
function S3Thumb({ s3Key, className = "w-full h-full object-cover rounded-xl", fallbackIcon }) {
  const [url, setUrl] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!s3Key) return;
    if (s3Key.startsWith("http")) { setUrl(s3Key); return; }
    getDownloadUrl(s3Key).then(setUrl).catch(() => setErr(true));
  }, [s3Key]);
  if (!s3Key || err) return fallbackIcon ?? <ImageIcon size={18} className="text-olive-400" />;
  if (!url) return <div className="w-full h-full animate-pulse bg-olive-100/40 rounded-xl" />;
  return <img src={url} alt="" className={className} />;
}

// Toast
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      ${toast.type === "success"
        ? "bg-olive-50 border border-olive-200 text-olive-800"
        : "bg-red-50 border border-red-200 text-red-700"}`}>
      {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
      <button onClick={onClose} className="cursor-pointer border-0 bg-transparent"><X size={14} /></button>
    </div>
  );
}

// Shared input/label styles
const inputCls = "w-full rounded-xl border border-beige-200 bg-beige-50 px-3 py-2.5 text-sm text-olive-900 placeholder-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-400 focus:border-olive-400 transition";
const labelCls = "block text-[10px] font-bold text-olive-500 uppercase tracking-widest mb-1.5";

// ══════════════════════════════════════════════════════════════════════════════
// EDIT CATEGORY MODAL
// ══════════════════════════════════════════════════════════════════════════════
function EditCategoryModal({ category, onClose, onSaved }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = undefined;
      if (coverFile) {
        const location = `services/category/${category._id}`;
        const { uploadUrl, key } = await generateUploadUrl(coverFile.type, coverFile.name, location);
        await uploadfileToS3(coverFile, uploadUrl);
        imageUrl = key;
      }
      await updateCategory(category._id, { name, description, ...(imageUrl !== undefined && { imageUrl }) });
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige-100">
          <h2 className="font-bold text-olive-900 text-base flex items-center gap-2">
            <Pencil size={16} className="text-olive-600" /> Edit Category
          </h2>
          <button onClick={onClose} className="cursor-pointer border-0 bg-transparent text-olive-400 hover:text-olive-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls} style={{ margin: 0 }}>Description *</label>
              <AIDescribeButton context="service-category" hint={name} onGenerated={setDescription} />
            </div>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Cover Image (optional — replaces current)</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-lime rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                <S3Thumb s3Key={category.imageUrl} fallbackIcon={<FolderOpen size={20} className="text-olive-700" />} />
              </div>
              {coverFile ? (
                <div className="flex items-center gap-2 bg-beige-50 border border-beige-200 rounded-xl px-3 py-2 text-sm">
                  <img src={coverPreview} alt="" className="w-10 h-10 object-cover rounded-lg" />
                  <span className="truncate max-w-[120px] text-olive-700">{coverFile.name}</span>
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="border-0 bg-transparent cursor-pointer">
                    <X size={13} className="text-red-400" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current.click()}
                  className="flex items-center gap-2 text-sm text-olive-700 border border-beige-200 hover:bg-beige-50 rounded-xl px-3 py-2 transition cursor-pointer bg-transparent">
                  <Upload size={14} /> Change image
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files[0]; if (!f) return;
                setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); e.target.value = "";
              }} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-olive-600 border border-beige-200 hover:bg-beige-50 transition cursor-pointer bg-transparent">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !name.trim() || !description.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-olive-900 hover:bg-olive-800 text-lime disabled:opacity-50 transition cursor-pointer border-0">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT PROGRAM MODAL
// ══════════════════════════════════════════════════════════════════════════════
function EditProgramModal({ program, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: program.title || "",
    description: program.description || "",
    fullDescription: program.fullDescription || "",
    donationTitle: program.donationTitle || "",
    cta: program.cta || "Help Now",
    href: program.href || "",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState(program.galleryImageKeys || []);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const coverRef = useRef();
  const galleryRef = useRef();

  const autoHref = (() => {
    const titleSlug = toSlug(form.title);
    const existing = program.href || "";
    if (existing) {
      const parts = existing.split("/").filter(Boolean);
      if (parts.length >= 2) return `/${parts.slice(0, -1).join("/")}/${titleSlug}`;
    }
    return "";
  })();

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = { ...form };
      if (!updates.href.trim()) updates.href = autoHref || null;
      const totalFiles = (coverFile ? 1 : 0) + galleryFiles.length;
      if (totalFiles > 0) setUploadProgress({ done: 0, total: totalFiles });

      if (coverFile) {
        const location = `services/program/${program._id}`;
        const { uploadUrl, key } = await generateUploadUrl(coverFile.type, coverFile.name, location);
        await uploadfileToS3(coverFile, uploadUrl);
        updates.imagekeys = key;
        setUploadProgress(p => ({ ...p, done: p.done + 1 }));
      }
      if (galleryFiles.length > 0) {
        const newKeys = [];
        for (const f of galleryFiles) {
          const location = `services/program/${program._id}/galleryImage`;
          const { uploadUrl, key } = await generateUploadUrl(f.type, f.name, location);
          await uploadfileToS3(f, uploadUrl);
          newKeys.push(key);
          setUploadProgress(p => ({ ...p, done: p.done + 1 }));
        }
        updates.galleryImageKeys = [...existingGallery, ...newKeys];
      } else {
        updates.galleryImageKeys = existingGallery;
      }
      await updateProgram(program._id, updates);
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige-100">
          <h2 className="font-bold text-olive-900 text-base flex items-center gap-2">
            <Pencil size={16} className="text-olive-600" /> Edit Program
          </h2>
          <button onClick={onClose} className="cursor-pointer border-0 bg-transparent text-olive-400 hover:text-olive-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} />
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls} style={{ margin: 0 }}>Short Description *</label>
                <AIDescribeButton context="service-program" hint={form.title} onGenerated={v => setForm(f => ({ ...f, description: v }))} />
              </div>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} />
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls} style={{ margin: 0 }}>Full Description</label>
                <AIDescribeButton context="service-program-full" hint={form.title} onGenerated={v => setForm(f => ({ ...f, fullDescription: v }))} />
              </div>
              <textarea rows={4} value={form.fullDescription} onChange={e => setForm(f => ({ ...f, fullDescription: e.target.value }))} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Donation Title</label>
              <input value={form.donationTitle} onChange={e => setForm(f => ({ ...f, donationTitle: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>CTA Button</label>
              <input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>
                Link (href)
                <span className="ml-1 text-olive-300 font-normal normal-case tracking-normal">— leave blank to keep current</span>
              </label>
              <input value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))}
                placeholder={program.href || autoHref || "/services/..."} className={inputCls} />
              {(form.href || program.href) && (
                <p className="mt-1.5 text-xs text-olive-400">
                  Will save as: <code className="bg-olive-50 text-olive-700 px-1.5 py-0.5 rounded">{form.href.trim() || program.href}</code>
                </p>
              )}
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className={labelCls}>Cover Image</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-beige-100 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                <S3Thumb s3Key={program.imagekeys} fallbackIcon={<ImageIcon size={18} className="text-olive-400" />} />
              </div>
              {coverFile ? (
                <div className="flex items-center gap-2 bg-beige-50 border border-beige-200 rounded-xl px-3 py-2 text-sm">
                  <img src={coverPreview} alt="" className="w-10 h-10 object-cover rounded-lg" />
                  <span className="truncate max-w-[120px] text-olive-700">{coverFile.name}</span>
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="border-0 bg-transparent cursor-pointer">
                    <X size={13} className="text-red-400" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => coverRef.current.click()}
                  className="flex items-center gap-2 text-sm text-olive-700 border border-beige-200 hover:bg-beige-50 rounded-xl px-3 py-2 transition cursor-pointer bg-transparent">
                  <Upload size={14} /> {program.imagekeys ? "Replace" : "Add"} cover
                </button>
              )}
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files[0]; if (!f) return;
                setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); e.target.value = "";
              }} />
            </div>
          </div>

          {/* Gallery images */}
          <div>
            <label className={labelCls}>Gallery Images ({existingGallery.length} existing)</label>
            {existingGallery.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {existingGallery.map((key, i) => (
                  <div key={key} className="relative group">
                    <div className="w-16 h-16 bg-beige-100 rounded-xl overflow-hidden">
                      <S3Thumb s3Key={key} className="w-full h-full object-cover" />
                    </div>
                    <button type="button"
                      onClick={() => setExistingGallery(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer border-0">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {galleryFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {galleryFiles.map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-xl border-2 border-olive-300" />
                    <button type="button" onClick={() => setGalleryFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer border-0">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => galleryRef.current.click()}
              className="inline-flex items-center gap-2 text-sm text-olive-700 border border-beige-200 hover:bg-beige-50 rounded-xl px-3 py-2 transition cursor-pointer bg-transparent">
              <Plus size={14} /> Add gallery images
            </button>
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={e => {
              setGalleryFiles(prev => [...prev, ...Array.from(e.target.files)]);
              e.target.value = "";
            }} />
          </div>

          {/* Upload progress */}
          {uploadProgress && (
            <div className="bg-olive-50 border border-olive-100 rounded-xl p-3">
              <div className="flex justify-between text-xs font-semibold text-olive-600 mb-1.5">
                <span>Uploading images…</span>
                <span>{uploadProgress.done}/{uploadProgress.total}</span>
              </div>
              <div className="w-full bg-olive-100 rounded-full h-1.5">
                <div className="bg-olive-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-5">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-olive-600 border border-beige-200 hover:bg-beige-50 transition cursor-pointer bg-transparent">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.description.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-olive-900 hover:bg-olive-800 text-lime disabled:opacity-50 transition cursor-pointer border-0">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG
// ══════════════════════════════════════════════════════════════════════════════
function ConfirmDialog({ title, subtitle, confirmLabel = "Confirm", confirmClass = "bg-red-500 hover:bg-red-600", icon, iconBg = "bg-red-100", onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className={`w-14 h-14 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {icon ?? <Trash2 size={24} className="text-red-500" />}
        </div>
        <h3 className="font-bold text-olive-900 text-base mb-1">{title}</h3>
        <p className="text-sm text-olive-500 mb-6">{subtitle}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel}
            className="px-5 py-2 rounded-xl border border-beige-200 text-sm font-semibold text-olive-600 hover:bg-beige-50 transition cursor-pointer bg-transparent">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition cursor-pointer border-0 ${confirmClass}`}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : null} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROGRAM ROW
// ══════════════════════════════════════════════════════════════════════════════
function ProgramRow({ program, onEdit, onHide, onUnhide, onHardDelete }) {
  const isHidden = !program.isActive;
  return (
    <div className={`bg-white rounded-2xl border border-beige-100 flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 transition
      ${isHidden ? "opacity-50" : ""}`}>

      {/* Thumbnail */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-beige-100 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
        <S3Thumb s3Key={program.imagekeys} className="w-full h-full object-cover"
          fallbackIcon={<ImageIcon size={14} className="text-olive-400" />} />
      </div>

      {/* Title + hidden badge */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-olive-900 text-sm truncate leading-tight">{program.title}</p>
        {/* Mobile: show gallery count below title */}
        {program.galleryImageKeys?.length > 0 && (
          <p className="sm:hidden text-[10px] text-olive-400 mt-0.5">
            {program.galleryImageKeys.length} gallery imgs
          </p>
        )}
        {isHidden && (
          <span className="sm:hidden inline-block text-[10px] font-bold bg-beige-200 text-olive-500 px-2 py-0.5 rounded-full mt-0.5">Hidden</span>
        )}
      </div>

      {/* Desktop: meta badges + hidden badge */}
      <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
        {isHidden && (
          <span className="text-[10px] font-bold bg-beige-200 text-olive-500 px-2 py-0.5 rounded-full">Hidden</span>
        )}
        {program.galleryImageKeys?.length > 0 && (
          <span className="text-[10px] font-semibold text-olive-400 uppercase tracking-wider">
            {program.galleryImageKeys.length} Gallery Imgs
          </span>
        )}
      </div>

      {/* Divider — desktop only */}
      <div className="hidden sm:block w-px h-5 bg-beige-200 flex-shrink-0" />

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        {!isHidden && (
          <button onClick={() => onEdit(program)}
            className="w-8 h-8 rounded-full hover:bg-beige-100 flex items-center justify-center text-olive-400 hover:text-olive-700 transition cursor-pointer border-0 bg-transparent"
            title="Edit">
            <Pencil size={14} />
          </button>
        )}
        {isHidden ? (
          <>
            <button onClick={() => onUnhide(program)}
              className="w-8 h-8 rounded-full hover:bg-olive-50 flex items-center justify-center text-olive-400 hover:text-olive-700 transition cursor-pointer border-0 bg-transparent"
              title="Unhide">
              <Eye size={14} />
            </button>
            <button onClick={() => onHardDelete(program)}
              className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-olive-400 hover:text-red-500 transition cursor-pointer border-0 bg-transparent"
              title="Delete permanently">
              <Trash2 size={14} />
            </button>
          </>
        ) : (
          <button onClick={() => onHide(program)}
            className="w-8 h-8 rounded-full hover:bg-beige-100 flex items-center justify-center text-olive-400 hover:text-olive-700 transition cursor-pointer border-0 bg-transparent"
            title="Hide">
            <Eye size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORY CARD (collapsible)
// ══════════════════════════════════════════════════════════════════════════════
function CategoryCard({ category, showHidden, onEditCat, onHideCat, onUnhideCat, onEditProg, onHideProg, onUnhideProg, onHardDeleteProg }) {
  const [open, setOpen] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [loadingProgs, setLoadingProgs] = useState(false);
  const isHidden = !category.isActive;

  const loadPrograms = () => {
    setLoadingProgs(true);
    fetchProgramsByCategoryAdmin(category._id, showHidden)
      .then(setPrograms)
      .catch(() => {})
      .finally(() => setLoadingProgs(false));
  };

  useEffect(() => {
    if (!open) return;
    loadPrograms();
  }, [open, category._id, showHidden]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`rounded-3xl border overflow-hidden transition ${isHidden ? "border-beige-200 opacity-60" : "border-beige-200"} bg-beige-100`}>

      {/* Category header */}
      <div
        className="flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-5 cursor-pointer select-none hover:bg-beige-200/40 transition"
        onClick={() => setOpen(o => !o)}
      >
        {/* Lime icon box */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-lime rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 mt-0.5">
          <S3Thumb
            s3Key={category.imageUrl}
            className="w-full h-full object-cover"
            fallbackIcon={<FolderOpen size={20} className="text-olive-700" />}
          />
        </div>

        {/* Info + actions */}
        <div className="flex-1 min-w-0">
          {/* Top row: name + action buttons */}
          <div className="flex items-start justify-between gap-2">
            {/* Name + badges */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <h3 className="text-base sm:text-xl font-extrabold text-olive-900 leading-tight">{category.name}</h3>
                {isHidden && (
                  <span className="text-[10px] font-bold bg-beige-300 text-olive-500 px-2 py-0.5 rounded-full">Hidden</span>
                )}
              </div>
              <span className="inline-block text-[10px] font-bold bg-beige-200 text-olive-600 px-2.5 py-1 rounded-full uppercase tracking-wider mb-1.5">
                {programs.length} {programs.length === 1 ? "Program" : "Programs"}
              </span>
              <p className="hidden sm:block text-sm text-olive-500 line-clamp-2 leading-relaxed">{category.description}</p>
            </div>

            {/* Action buttons — always horizontal */}
            <div
              className="flex flex-row items-center gap-1.5 flex-shrink-0"
              onClick={e => e.stopPropagation()}
            >
              {!isHidden && (
                <button
                  onClick={() => onEditCat(category)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-beige-200 hover:bg-beige-300 flex items-center justify-center text-olive-600 transition cursor-pointer border-0"
                  title="Edit">
                  <Pencil size={14} />
                </button>
              )}
              {isHidden ? (
                <button
                  onClick={() => onUnhideCat(category)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-beige-200 hover:bg-beige-300 flex items-center justify-center text-olive-600 transition cursor-pointer border-0"
                  title="Unhide">
                  <Eye size={14} />
                </button>
              ) : (
                <button
                  onClick={() => onHideCat(category)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-beige-200 hover:bg-beige-300 flex items-center justify-center text-olive-600 transition cursor-pointer border-0"
                  title="Hide">
                  <Eye size={14} />
                </button>
              )}
              {/* Chevron — hidden on mobile to save space */}
              <button
                onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
                className="hidden sm:flex w-9 h-9 rounded-full bg-beige-200 hover:bg-beige-300 items-center justify-center text-olive-600 transition cursor-pointer border-0">
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Programs list */}
      {open && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 border-t border-beige-200/60 pt-3">
          {loadingProgs ? (
            <div className="flex items-center justify-center gap-2 py-8 text-olive-400 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading programs…
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-8 text-olive-400 text-sm">No programs in this category.</div>
          ) : (
            programs.map(prog => (
              <ProgramRow
                key={prog._id}
                program={prog}
                onEdit={(p) => onEditProg(p, loadPrograms)}
                onHide={(p) => onHideProg(p, loadPrograms)}
                onUnhide={(p) => onUnhideProg(p, loadPrograms)}
                onHardDelete={(p) => onHardDeleteProg(p, loadPrograms)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function ManageServices() {
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showHidden, setShowHidden]   = useState(false);
  const [toast, setToast]             = useState(null);

  const [editingCat, setEditingCat]             = useState(null);
  const [editingProg, setEditingProg]           = useState(null);
  const [hidingCat, setHidingCat]               = useState(null);
  const [unhidingCat, setUnhidingCat]           = useState(null);
  const [hidingProg, setHidingProg]             = useState(null);
  const [unhidingProg, setUnhidingProg]         = useState(null);
  const [hardDeletingProg, setHardDeletingProg] = useState(null);
  const [actionLoading, setActionLoading]       = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCategories = () => {
    setLoading(true);
    fetchCategoriesAdmin(showHidden)
      .then(setCategories)
      .catch(() => showToast("error", "Failed to load categories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, [showHidden]); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmHideCat = async () => {
    if (!hidingCat) return;
    setActionLoading(true);
    try {
      await hideCategory(hidingCat._id);
      showToast("success", `Category "${hidingCat.name}" hidden`);
      setHidingCat(null); loadCategories();
    } catch (err) { showToast("error", err?.response?.data?.message || "Failed to hide category"); }
    finally { setActionLoading(false); }
  };

  const confirmUnhideCat = async () => {
    if (!unhidingCat) return;
    setActionLoading(true);
    try {
      await unhideCategory(unhidingCat._id);
      showToast("success", `Category "${unhidingCat.name}" is now visible`);
      setUnhidingCat(null); loadCategories();
    } catch (err) { showToast("error", err?.response?.data?.message || "Failed to unhide category"); }
    finally { setActionLoading(false); }
  };

  const confirmHideProg = async () => {
    if (!hidingProg) return;
    setActionLoading(true);
    try {
      await hideProgram(hidingProg.prog._id);
      showToast("success", `Program "${hidingProg.prog.title}" hidden`);
      hidingProg.refresh(); setHidingProg(null);
    } catch (err) { showToast("error", err?.response?.data?.message || "Failed to hide program"); }
    finally { setActionLoading(false); }
  };

  const confirmUnhideProg = async () => {
    if (!unhidingProg) return;
    setActionLoading(true);
    try {
      await unhideProgram(unhidingProg.prog._id);
      showToast("success", `Program "${unhidingProg.prog.title}" is now visible`);
      unhidingProg.refresh(); setUnhidingProg(null);
    } catch (err) { showToast("error", err?.response?.data?.message || "Failed to unhide program"); }
    finally { setActionLoading(false); }
  };

  const confirmHardDeleteProg = async () => {
    if (!hardDeletingProg) return;
    setActionLoading(true);
    try {
      await hardDeleteProgram(hardDeletingProg.prog._id);
      showToast("success", `Program "${hardDeletingProg.prog.title}" permanently deleted`);
      hardDeletingProg.refresh(); setHardDeletingProg(null);
    } catch (err) { showToast("error", err?.response?.data?.message || "Failed to delete program"); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Modals */}
      {editingCat && (
        <EditCategoryModal category={editingCat} onClose={() => setEditingCat(null)}
          onSaved={() => { setEditingCat(null); showToast("success", "Category updated!"); loadCategories(); }} />
      )}
      {editingProg && (
        <EditProgramModal program={editingProg.prog} onClose={() => setEditingProg(null)}
          onSaved={() => { setEditingProg(null); showToast("success", "Program updated!"); editingProg.refresh(); }} />
      )}
      {hidingCat && (
        <ConfirmDialog title={`Hide "${hidingCat.name}"?`}
          subtitle="This will hide the category and all its programs from the public site."
          confirmLabel="Hide" confirmClass="bg-amber-500 hover:bg-amber-600"
          icon={<EyeOff size={24} className="text-amber-500" />} iconBg="bg-amber-100"
          onConfirm={confirmHideCat} onCancel={() => setHidingCat(null)} loading={actionLoading} />
      )}
      {unhidingCat && (
        <ConfirmDialog title={`Unhide "${unhidingCat.name}"?`}
          subtitle="This will make the category and its active programs visible again."
          confirmLabel="Unhide" confirmClass="bg-olive-600 hover:bg-olive-700"
          icon={<Eye size={24} className="text-olive-600" />} iconBg="bg-olive-100"
          onConfirm={confirmUnhideCat} onCancel={() => setUnhidingCat(null)} loading={actionLoading} />
      )}
      {hidingProg && (
        <ConfirmDialog title={`Hide "${hidingProg.prog.title}"?`}
          subtitle="The program will be hidden from the public site. You can unhide it anytime."
          confirmLabel="Hide" confirmClass="bg-amber-500 hover:bg-amber-600"
          icon={<EyeOff size={24} className="text-amber-500" />} iconBg="bg-amber-100"
          onConfirm={confirmHideProg} onCancel={() => setHidingProg(null)} loading={actionLoading} />
      )}
      {unhidingProg && (
        <ConfirmDialog title={`Unhide "${unhidingProg.prog.title}"?`}
          subtitle="The program will be visible on the public site again."
          confirmLabel="Unhide" confirmClass="bg-olive-600 hover:bg-olive-700"
          icon={<Eye size={24} className="text-olive-600" />} iconBg="bg-olive-100"
          onConfirm={confirmUnhideProg} onCancel={() => setUnhidingProg(null)} loading={actionLoading} />
      )}
      {hardDeletingProg && (
        <ConfirmDialog title={`Permanently delete "${hardDeletingProg.prog.title}"?`}
          subtitle="This cannot be undone. The program will be removed forever."
          confirmLabel="Delete Forever" confirmClass="bg-red-500 hover:bg-red-600"
          icon={<Trash2 size={24} className="text-red-500" />} iconBg="bg-red-100"
          onConfirm={confirmHardDeleteProg} onCancel={() => setHardDeletingProg(null)} loading={actionLoading} />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-olive-500 mb-1">Management Dashboard</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-olive-900 leading-tight m-0">Manage Services</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowHidden(h => !h)}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer
              ${showHidden
                ? "border-olive-400 bg-olive-50 text-olive-700"
                : "border-beige-300 bg-white text-olive-600 hover:bg-beige-50"}`}>
            <Eye size={14} />
            <span className="hidden xs:inline">{showHidden ? "Showing hidden" : "Show hidden"}</span>
            <span className="xs:hidden">{showHidden ? "Hidden" : "Hidden"}</span>
          </button>
          <button onClick={loadCategories}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-beige-300 bg-white text-xs sm:text-sm font-semibold text-olive-600 hover:bg-beige-50 transition cursor-pointer">
            <RefreshCw size={14} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-24 text-olive-400">
          <Loader2 size={22} className="animate-spin" /> Loading categories…
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-beige-300">
          <FolderOpen size={40} className="mx-auto text-olive-300 mb-3" />
          <p className="font-bold text-olive-500">No categories found</p>
          <p className="text-sm text-olive-400 mt-1">Add some categories from the "Add Services" page.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map(cat => (
            <CategoryCard
              key={cat._id}
              category={cat}
              showHidden={showHidden}
              onEditCat={setEditingCat}
              onHideCat={setHidingCat}
              onUnhideCat={setUnhidingCat}
              onEditProg={(p, refresh) => setEditingProg({ prog: p, refresh })}
              onHideProg={(p, refresh) => setHidingProg({ prog: p, refresh })}
              onUnhideProg={(p, refresh) => setUnhidingProg({ prog: p, refresh })}
              onHardDeleteProg={(p, refresh) => setHardDeletingProg({ prog: p, refresh })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
