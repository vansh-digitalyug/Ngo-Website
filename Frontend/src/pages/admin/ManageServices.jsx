import { useState, useEffect, useRef } from "react";
import {
  FolderOpen, Pencil, Trash2, ChevronDown, ChevronRight,
  Save, X, Plus, Upload, Image as ImageIcon, Loader2, CheckCircle,
  AlertCircle, Eye, RefreshCw, EyeOff
} from "lucide-react";
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

// Thumbnail that lazy-loads a presigned URL from an S3 key
function S3Thumb({ s3Key, className = "w-14 h-14 object-cover rounded-lg" }) {
  const [url, setUrl] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!s3Key) return;
    if (s3Key.startsWith("http")) { setUrl(s3Key); return; }
    getDownloadUrl(s3Key).then(setUrl).catch(() => setErr(true));
  }, [s3Key]);
  if (!s3Key) return <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center"><ImageIcon size={18} className="text-slate-300" /></div>;
  if (err) return <div className="w-14 h-14 rounded-lg bg-red-50 flex items-center justify-center"><ImageIcon size={18} className="text-red-300" /></div>;
  if (!url) return <div className="w-14 h-14 rounded-lg bg-slate-100 animate-pulse" />;
  return <img src={url} alt="" className={className} />;
}

// Inline toast
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      ${toast.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-700"}`}>
      {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition";
const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1";

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
      await updateCategory(category._id, {
        name, description,
        ...(imageUrl !== undefined && { imageUrl }),
      });
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><Pencil size={16} className="text-indigo-500" /> Edit Category</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description *</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Cover Image (optional — replaces current)</label>
            <div className="flex items-center gap-3">
              <S3Thumb s3Key={category.imageUrl} />
              {coverFile ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <img src={coverPreview} alt="" className="w-10 h-10 object-cover rounded" />
                  <span className="truncate max-w-[120px]">{coverFile.name}</span>
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }}><X size={13} className="text-red-400" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current.click()}
                  className="flex items-center gap-2 text-sm text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg px-3 py-2 transition">
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
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving || !name.trim() || !description.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition">
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

  // Auto-generate href based on title when href is empty
  const autoHref = (() => {
    const titleSlug = toSlug(form.title);
    const existing = program.href || "";
    // Preserve the category part of the existing href if it exists
    if (existing) {
      const parts = existing.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return `/${parts.slice(0, -1).join("/")}/${titleSlug}`;
      }
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

      // Upload new cover
      if (coverFile) {
        const location = `services/program/${program._id}`;
        const { uploadUrl, key } = await generateUploadUrl(coverFile.type, coverFile.name, location);
        await uploadfileToS3(coverFile, uploadUrl);
        updates.imagekeys = key;
        setUploadProgress(p => ({ ...p, done: p.done + 1 }));
      }

      // Upload new gallery images
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-base flex items-center gap-2"><Pencil size={16} className="text-indigo-500" /> Edit Program</h2>
          <button onClick={onClose}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Short Description *</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Full Description</label>
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
                <span className="ml-1 text-slate-400 font-normal normal-case tracking-normal">— leave blank to keep current</span>
              </label>
              <input value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))}
                placeholder={program.href || autoHref || "/services/..."}
                className={inputCls} />
              {(form.href || program.href) && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Will save as: <code className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">{form.href.trim() || program.href}</code>
                </p>
              )}
            </div>
          </div>

          {/* Cover image */}
          <div>
            <label className={labelCls}>Cover Image</label>
            <div className="flex items-center gap-3">
              <S3Thumb s3Key={program.imagekeys} />
              {coverFile ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <img src={coverPreview} alt="" className="w-10 h-10 object-cover rounded" />
                  <span className="truncate max-w-[120px]">{coverFile.name}</span>
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }}><X size={13} className="text-red-400" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => coverRef.current.click()}
                  className="flex items-center gap-2 text-sm text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg px-3 py-2 transition">
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
                    <S3Thumb s3Key={key} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setExistingGallery(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
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
                    <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg border-2 border-indigo-300" />
                    <button type="button" onClick={() => setGalleryFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => galleryRef.current.click()}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg px-3 py-2 transition">
              <Plus size={14} /> Add gallery images
            </button>
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={e => {
              setGalleryFiles(prev => [...prev, ...Array.from(e.target.files)]);
              e.target.value = "";
            }} />
          </div>

          {/* Upload progress */}
          {uploadProgress && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
              <div className="flex justify-between text-xs font-semibold text-indigo-600 mb-1.5">
                <span>Uploading images…</span>
                <span>{uploadProgress.done}/{uploadProgress.total}</span>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.description.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
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
    <div className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition group ${isHidden ? "bg-slate-50/60 opacity-60" : "bg-white"}`}>
      <S3Thumb s3Key={program.imagekeys} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-800 text-sm truncate">{program.title}</p>
          {isHidden && <span className="text-[10px] font-semibold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full shrink-0">Hidden</span>}
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">{program.description}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {program.href && (
            <a href={program.href} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700 font-mono bg-indigo-50 px-1.5 py-0.5 rounded truncate max-w-[220px]">
              <Eye size={10} /> {program.href}
            </a>
          )}
          {program.galleryImageKeys?.length > 0 && (
            <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              {program.galleryImageKeys.length} gallery img{program.galleryImageKeys.length !== 1 ? "s" : ""}
            </span>
          )}
          {program.cta && (
            <span className="text-[11px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">{program.cta}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        {!isHidden && (
          <button onClick={() => onEdit(program)}
            className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition" title="Edit">
            <Pencil size={15} />
          </button>
        )}
        {isHidden ? (
          <>
            <button onClick={() => onUnhide(program)}
              className="p-2 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition" title="Unhide">
              <Eye size={15} />
            </button>
            <button onClick={() => onHardDelete(program)}
              className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition" title="Delete permanently">
              <Trash2 size={15} />
            </button>
          </>
        ) : (
          <button onClick={() => onHide(program)}
            className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition" title="Hide">
            <EyeOff size={15} />
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
      .catch(() => { })
      .finally(() => setLoadingProgs(false));
  };

  useEffect(() => {
    if (!open) return;
    loadPrograms();
  }, [open, category._id, showHidden]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${isHidden ? "bg-slate-50 border-slate-300 opacity-70" : "bg-white border-slate-200"}`}>
      {/* Category header */}
      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none hover:bg-slate-50 transition"
        onClick={() => setOpen(o => !o)}>
        <S3Thumb s3Key={category.imageUrl} className="w-12 h-12 object-cover rounded-xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-800 text-sm">{category.name}</p>
            {isHidden && <span className="text-[10px] font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Hidden</span>}
          </div>
          <p className="text-xs text-slate-400 truncate">{category.description}</p>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-slate-400 mr-2">{programs.length} program{programs.length !== 1 ? "s" : ""}</span>
          {!isHidden && (
            <button onClick={() => onEditCat(category)}
              className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition" title="Edit">
              <Pencil size={15} />
            </button>
          )}
          {isHidden ? (
            <button onClick={() => onUnhideCat(category)}
              className="p-2 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition" title="Unhide">
              <Eye size={15} />
            </button>
          ) : (
            <button onClick={() => onHideCat(category)}
              className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition" title="Hide">
              <EyeOff size={15} />
            </button>
          )}
        </div>
        <div className="text-slate-300">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </div>

      {/* Programs list */}
      {open && (
        <div className="border-t border-slate-100">
          {loadingProgs ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading programs…
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No programs in this category.</div>
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
// CONFIRM DELETE DIALOG
// ══════════════════════════════════════════════════════════════════════════════
function ConfirmDialog({ title, subtitle, confirmLabel = "Confirm", confirmClass = "bg-red-500 hover:bg-red-600", icon, iconBg = "bg-red-100", onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className={`w-14 h-14 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {icon ?? <Trash2 size={24} className="text-red-500" />}
        </div>
        <h3 className="font-bold text-slate-800 text-base mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition ${confirmClass}`}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : null} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function ManageServices() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const [toast, setToast]           = useState(null);

  // Modal / action state
  const [editingCat, setEditingCat]         = useState(null);
  const [editingProg, setEditingProg]       = useState(null); // { prog, refresh }
  const [hidingCat, setHidingCat]           = useState(null);
  const [unhidingCat, setUnhidingCat]       = useState(null);
  const [hidingProg, setHidingProg]         = useState(null); // { prog, refresh }
  const [unhidingProg, setUnhidingProg]     = useState(null); // { prog, refresh }
  const [hardDeletingProg, setHardDeletingProg] = useState(null); // { prog, refresh }
  const [actionLoading, setActionLoading]   = useState(false);

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

  // ── Hide category ──────────────────────────────────────────────────
  const confirmHideCat = async () => {
    if (!hidingCat) return;
    setActionLoading(true);
    try {
      await hideCategory(hidingCat._id);
      showToast("success", `Category "${hidingCat.name}" hidden`);
      setHidingCat(null);
      loadCategories();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to hide category");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Unhide category ────────────────────────────────────────────────
  const confirmUnhideCat = async () => {
    if (!unhidingCat) return;
    setActionLoading(true);
    try {
      await unhideCategory(unhidingCat._id);
      showToast("success", `Category "${unhidingCat.name}" is now visible`);
      setUnhidingCat(null);
      loadCategories();
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to unhide category");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Hide program ───────────────────────────────────────────────────
  const confirmHideProg = async () => {
    if (!hidingProg) return;
    setActionLoading(true);
    try {
      await hideProgram(hidingProg.prog._id);
      showToast("success", `Program "${hidingProg.prog.title}" hidden`);
      hidingProg.refresh();
      setHidingProg(null);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to hide program");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Unhide program ─────────────────────────────────────────────────
  const confirmUnhideProg = async () => {
    if (!unhidingProg) return;
    setActionLoading(true);
    try {
      await unhideProgram(unhidingProg.prog._id);
      showToast("success", `Program "${unhidingProg.prog.title}" is now visible`);
      unhidingProg.refresh();
      setUnhidingProg(null);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to unhide program");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Hard delete program ────────────────────────────────────────────
  const confirmHardDeleteProg = async () => {
    if (!hardDeletingProg) return;
    setActionLoading(true);
    try {
      await hardDeleteProgram(hardDeletingProg.prog._id);
      showToast("success", `Program "${hardDeletingProg.prog.title}" permanently deleted`);
      hardDeletingProg.refresh();
      setHardDeletingProg(null);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Failed to delete program");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Modals */}
      {editingCat && (
        <EditCategoryModal
          category={editingCat}
          onClose={() => setEditingCat(null)}
          onSaved={() => { setEditingCat(null); showToast("success", "Category updated!"); loadCategories(); }}
        />
      )}
      {editingProg && (
        <EditProgramModal
          program={editingProg.prog}
          onClose={() => setEditingProg(null)}
          onSaved={() => { setEditingProg(null); showToast("success", "Program updated!"); editingProg.refresh(); }}
        />
      )}
      {hidingCat && (
        <ConfirmDialog
          title={`Hide "${hidingCat.name}"?`}
          subtitle="This will hide the category and all its programs from the public site. You can unhide it anytime."
          confirmLabel="Hide"
          confirmClass="bg-amber-500 hover:bg-amber-600"
          icon={<EyeOff size={24} className="text-amber-500" />}
          iconBg="bg-amber-100"
          onConfirm={confirmHideCat}
          onCancel={() => setHidingCat(null)}
          loading={actionLoading}
        />
      )}
      {unhidingCat && (
        <ConfirmDialog
          title={`Unhide "${unhidingCat.name}"?`}
          subtitle="This will make the category and its active programs visible on the public site again."
          confirmLabel="Unhide"
          confirmClass="bg-green-600 hover:bg-green-700"
          icon={<Eye size={24} className="text-green-600" />}
          iconBg="bg-green-100"
          onConfirm={confirmUnhideCat}
          onCancel={() => setUnhidingCat(null)}
          loading={actionLoading}
        />
      )}
      {hidingProg && (
        <ConfirmDialog
          title={`Hide "${hidingProg.prog.title}"?`}
          subtitle="The program will be hidden from the public site. You can unhide it anytime."
          confirmLabel="Hide"
          confirmClass="bg-amber-500 hover:bg-amber-600"
          icon={<EyeOff size={24} className="text-amber-500" />}
          iconBg="bg-amber-100"
          onConfirm={confirmHideProg}
          onCancel={() => setHidingProg(null)}
          loading={actionLoading}
        />
      )}
      {unhidingProg && (
        <ConfirmDialog
          title={`Unhide "${unhidingProg.prog.title}"?`}
          subtitle="The program will be visible on the public site again."
          confirmLabel="Unhide"
          confirmClass="bg-green-600 hover:bg-green-700"
          icon={<Eye size={24} className="text-green-600" />}
          iconBg="bg-green-100"
          onConfirm={confirmUnhideProg}
          onCancel={() => setUnhidingProg(null)}
          loading={actionLoading}
        />
      )}
      {hardDeletingProg && (
        <ConfirmDialog
          title={`Permanently delete "${hardDeletingProg.prog.title}"?`}
          subtitle="This cannot be undone. The program will be removed from the database forever."
          confirmLabel="Delete Forever"
          confirmClass="bg-red-500 hover:bg-red-600"
          icon={<Trash2 size={24} className="text-red-500" />}
          iconBg="bg-red-100"
          onConfirm={confirmHardDeleteProg}
          onCancel={() => setHardDeletingProg(null)}
          loading={actionLoading}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manage Services</h1>
            <p className="text-slate-500 text-sm mt-1">Edit, hide, or restore categories and programs.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHidden(h => !h)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${showHidden ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
              {showHidden ? <Eye size={15} /> : <EyeOff size={15} />}
              {showHidden ? "Showing hidden" : "Show hidden"}
            </button>
            <button onClick={loadCategories}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <Loader2 size={22} className="animate-spin" /> Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <FolderOpen size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-500">No categories found</p>
            <p className="text-sm text-slate-400 mt-1">Add some categories from the "Add Services" page.</p>
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
                onEditProg={(prog, refresh) => setEditingProg({ prog, refresh })}
                onHideProg={(prog, refresh) => setHidingProg({ prog, refresh })}
                onUnhideProg={(prog, refresh) => setUnhidingProg({ prog, refresh })}
                onHardDeleteProg={(prog, refresh) => setHardDeletingProg({ prog, refresh })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
