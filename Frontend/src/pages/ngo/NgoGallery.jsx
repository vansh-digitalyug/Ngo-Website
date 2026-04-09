import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Upload, Trash2, Image, CheckCircle, FolderOpen, Info, X, AlertCircle, Eye, Clock, Camera, Play } from 'lucide-react';
import { API_BASE_URL } from './NgoLayout';

// Resolve gallery image URL — handles full S3 URLs, legacy local paths, and bare filenames
const getImgUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/300x300?text=No+Image';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/uploads/gallery/${url}`;
};

const CATEGORIES = [
  "Food Distribution", "Medical Camps", "Education Programs",
  "Elder Care", "Women Empowerment", "Events", "Volunteer Activities", "Other"
];

export default function NgoGallery() {
  const { ngoData } = useOutletContext();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState('image');
  const [lightbox, setLightbox] = useState(null); // { url, title, type }
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    file: null,
    fileType: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/gallery`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setGallery(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const isVideoFile = (file) => file.type.startsWith('video/');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please select a valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG)' });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 100MB' });
      return;
    }
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setPreviewType(isVideoFile(file) ? 'video' : 'image');
    setUploadForm(prev => ({ ...prev, file, fileType: file.type }));
    setMessage({ type: '', text: '' });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.file) { setMessage({ type: 'error', text: 'Please select a file to upload' }); return; }
    if (!uploadForm.title.trim()) { setMessage({ type: 'error', text: 'Please enter a title' }); return; }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const file = uploadForm.file;
      
      // Step 1 — get presigned S3 upload URL via dedicated S3 API
      const urlRes = await fetch(`${API_BASE_URL}/api/s3/generate-upload-url`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, location: `gallery/${ngoData.ngoS3Id}` }),
      });
      if (!urlRes.ok) { const e = await urlRes.json(); throw new Error(e.message || 'Failed to get upload URL'); }
      const { data: { uploadUrl, key } } = await urlRes.json();

      // Step 2 — upload file directly to S3
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!s3Res.ok) throw new Error('Failed to upload to S3');

      // Step 3 — save S3 key to backend
      const saveRes = await fetch(`${API_BASE_URL}/api/ngo-dashboard/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s3Key: key,
          fileType: uploadForm.fileType,
          title: uploadForm.title.trim(),
          description: uploadForm.description.trim(),
          category: uploadForm.category,
        }),
      });
      const data = await saveRes.json();

      if (saveRes.ok) {
        const isVideo = uploadForm.fileType?.startsWith('video/');
        setMessage({ type: 'success', text: `${isVideo ? 'Video' : 'Image'} uploaded! It will be visible after admin approval.` });
        setGallery(prev => [data.data, ...prev]);
        closeUploadModal();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save image' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadForm({ title: '', description: '', category: 'Other', file: null, fileType: '' });
    setPreviewUrl(null);
    setPreviewType('image');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/gallery/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setGallery(prev => prev.filter(item => item._id !== itemId));
        setMessage({ type: 'success', text: 'Image deleted successfully' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Failed to delete image' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return { text: 'Approved', styles: 'bg-[#f0f4ea] text-[#5a6b46] border border-[#d6e3c9]' };
      case 'rejected': return { text: 'Rejected', styles: 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]' };
      default: return { text: 'Pending', styles: 'bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-[#eaddc8] border-t-[#6c5d46] rounded-full animate-spin"></div>
        <p className="text-[#888888] font-medium">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] p-4 sm:p-6 lg:p-8 font-sans text-[#2c2c2c] selection:bg-[#eaddc8] selection:text-[#2c2c2c]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222222]">Media Gallery</h1>
          <p className="text-[#6c6c6c] text-sm sm:text-base font-medium mt-1">Upload and manage photos and videos showcasing your organization's work</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all duration-200 shadow-sm w-full sm:w-auto shrink-0"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={16} /> Upload Media
        </button>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`flex items-center justify-between p-4 mb-6 rounded-xl text-sm font-bold ${
          message.type === 'success' ? 'bg-[#f0f4ea] text-[#5a6b46] border border-[#d6e3c9]' : 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="p-1 hover:bg-white/50 rounded-md transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <Image size={24} />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-[#222222]">{gallery.length}</span>
            <span className="block text-xs font-bold text-[#888888] uppercase tracking-wider mt-0.5">Total Media</span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-50 text-green-600 shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-[#222222]">{gallery.filter(i => i.approvalStatus === 'approved').length}</span>
            <span className="block text-xs font-bold text-[#888888] uppercase tracking-wider mt-0.5">Approved</span>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-[#222222]">{gallery.filter(i => i.approvalStatus === 'pending').length}</span>
            <span className="block text-xs font-bold text-[#888888] uppercase tracking-wider mt-0.5">Pending Review</span>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {gallery.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#222222]">Your Media</h2>
            <span className="px-3 py-1 bg-[#f8f7f5] text-[#6c5d46] text-xs font-bold rounded-md border border-[#eaddc8]">{gallery.length} items</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gallery.map((item) => {
                const badge = getStatusBadge(item.approvalStatus);
                return (
                  <div key={item._id} className="group relative rounded-xl overflow-hidden bg-[#f8f7f5] border border-gray-200 aspect-square shadow-sm hover:shadow-md transition-shadow">
                    {item.type === 'video' ? (
                      <video
                        src={getImgUrl(item.url)}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <img
                        src={getImgUrl(item.url)}
                        alt={item.title || 'Gallery image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                        }}
                      />
                    )}
                    
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play size={20} className="text-white ml-1" fill="currentColor" />
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-sm z-10 ${badge.styles}`}>
                      {badge.text}
                    </span>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h4 className="text-white text-sm font-bold truncate mb-1">{item.title || 'Untitled'}</h4>
                      {item.description && <p className="text-gray-200 text-xs line-clamp-2 mb-3">{item.description}</p>}
                      
                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold backdrop-blur-sm transition-colors"
                          onClick={() => setLightbox({ url: getImgUrl(item.url), title: item.title, type: item.type })}
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          className="flex items-center justify-center w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-[#f8f7f5] rounded-full flex items-center justify-center text-[#d5cfc4] mb-4">
            <Image size={32} strokeWidth={1.5} />
          </div>
          <h4 className="text-lg font-bold text-[#222222] mb-2">No media uploaded yet</h4>
          <p className="text-sm font-medium text-[#888888] max-w-sm mb-6">Upload photos or videos to showcase your organization's work and impact on your public profile</p>
          <button
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6c5d46] text-white rounded-xl text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload size={16} /> Upload First Media
          </button>
        </div>
      )}

      {/* Media Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center p-4 sm:p-8"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
          <div onClick={e => e.stopPropagation()} className="relative flex flex-col items-center max-w-full max-h-full">
            {lightbox.type === 'video' ? (
              <video
                src={lightbox.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg bg-black outline-none"
              />
            ) : (
              <img
                src={lightbox.url}
                alt={lightbox.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onError={e => { e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found'; }}
              />
            )}
            {lightbox.title && (
              <p className="mt-4 text-white text-base font-semibold">{lightbox.title}</p>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-[#222222]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-100 animate-in fade-in duration-200" onClick={closeUploadModal}>
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h2 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                <Camera size={20} className="text-[#6c5d46]" /> Upload Image or Video
              </h2>
              <button onClick={closeUploadModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="uploadForm" onSubmit={handleUpload} className="space-y-5">
                {/* Image Upload Area */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#222222]">Image or Video <span className="text-red-500">*</span></label>
                  <div
                    className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                      ${previewUrl ? 'border-[#eaddc8] bg-[#f8f7f5]' : 'border-gray-300 hover:border-[#6c5d46] bg-[#f8f7f5]'}`}
                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {previewUrl ? (
                      <div className="relative w-full aspect-video flex items-center justify-center bg-black/5">
                        {previewType === 'video' ? (
                          <video src={previewUrl} className="max-w-full max-h-full object-contain" controls />
                        ) : (
                          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                        )}
                        <button
                          type="button"
                          className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewUrl(null);
                            setPreviewType('image');
                            setUploadForm(prev => ({ ...prev, file: null, fileType: '' }));
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#6c5d46] mb-3">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-bold text-[#222222] mb-1">Click to browse or drag file</p>
                        <p className="text-xs font-medium text-[#888888]">Images (JPEG, PNG, WebP) or Videos (MP4) up to 100MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title Field */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#222222]">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter title"
                    required
                  />
                </div>

                {/* Category Field */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#222222]">Category</label>
                  <select
                    className="w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all appearance-none cursor-pointer"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description Field */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#222222]">Description <span className="text-[11px] font-medium text-[#888888] ml-1 uppercase tracking-wider">(Optional)</span></label>
                  <textarea
                    className="w-full px-4 py-3 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all resize-y min-h-[100px]"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief context about this image..."
                    rows={3}
                  />
                </div>
              </form>
            </div>
            
            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                className="px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
                onClick={closeUploadModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="uploadForm"
                className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Save Media'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Card */}
      <div className="mt-8 bg-[#f8f7f5] border border-[#eaddc8] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-white rounded-lg text-[#6c5d46] shadow-sm"><Info size={16} /></div>
          <h4 className="text-sm font-bold text-[#222222]">Gallery Guidelines</h4>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm font-medium text-[#6c6c6c] list-disc list-inside">
          <li>Upload high-quality images or videos that showcase your activities and impact</li>
          <li>All uploads require admin approval before appearing publicly</li>
          <li>Maximum file size: 100MB per file</li>
          <li>Supported image formats: JPEG, PNG, GIF, WebP, AVIF</li>
          <li>Supported video formats: MP4, WebM, OGG, MOV</li>
          <li>Avoid uploading content with sensitive personal information</li>
        </ul>
      </div>
    </div>
  );
}