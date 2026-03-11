import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Upload, Trash2, Image, CheckCircle, FolderOpen, Info, X, AlertCircle, Eye, Clock, XCircle, Camera, Video, Play } from 'lucide-react';
import { API_BASE_URL } from './NgoLayout';
import './ngo.css';

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
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.',err});
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', class: 'pending' },
      approved: { text: 'Approved', class: 'approved' },
      rejected: { text: 'Rejected', class: 'rejected' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="ngo-loading-screen">
        <div className="ngo-loading-spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="ngo-gallery-page">
      {/* Page Header */}
      <div className="ngo-page-header">
        <div className="page-header-content">
          <h1>Media Gallery</h1>
          <p>Upload and manage photos and videos showcasing your organization's work</p>
        </div>
        <button
          className="ngo-btn ngo-btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={16} /> Upload Media
        </button>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`ngo-alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="alert-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="gallery-stats-row">
        <div className="gallery-stat">
          <div className="stat-icon purple"><Image size={18} /></div>
          <div className="stat-info">
            <span className="stat-number">{gallery.length}</span>
            <span className="stat-text">Total Media</span>
          </div>
        </div>
        <div className="gallery-stat">
          <div className="stat-icon green"><CheckCircle size={18} /></div>
          <div className="stat-info">
            <span className="stat-number">{gallery.filter(i => i.approvalStatus === 'approved').length}</span>
            <span className="stat-text">Approved</span>
          </div>
        </div>
        <div className="gallery-stat">
          <div className="stat-icon orange"><Clock size={18} /></div>
          <div className="stat-info">
            <span className="stat-number">{gallery.filter(i => i.approvalStatus === 'pending').length}</span>
            <span className="stat-text">Pending Review</span>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {gallery.length > 0 ? (
        <div className="ngo-section">
          <div className="ngo-section-header">
            <h2>Your Media</h2>
            <span className="section-badge">{gallery.length} items</span>
          </div>
          <div className="ngo-section-body">
            <div className="ngo-gallery-grid">
              {gallery.map((item) => {
                const badge = getStatusBadge(item.approvalStatus);
                return (
                  <div key={item._id} className="ngo-gallery-item">
                    {item.type === 'video' ? (
                      <video
                        src={getImgUrl(item.url)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        preload="metadata"
                        muted
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <img
                        src={getImgUrl(item.url)}
                        alt={item.title || 'Gallery image'}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                        }}
                      />
                    )}
                    {item.type === 'video' && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <Play size={18} color="white" fill="white" />
                      </div>
                    )}
                    <span className={`ngo-gallery-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                    <div className="ngo-gallery-overlay">
                      <h4>{item.title || 'Untitled'}</h4>
                      <p>{item.description || ''}</p>
                      <div className="gallery-item-actions">
                        <button
                          className="gallery-action-btn view"
                          onClick={() => setLightbox({ url: getImgUrl(item.url), title: item.title, type: item.type })}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="gallery-action-btn delete"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 size={14} />
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
        <div className="ngo-section">
          <div className="ngo-section-body">
            <div className="ngo-empty-state">
              <Image size={56} strokeWidth={1.5} />
              <h4>No media uploaded yet</h4>
              <p>Upload photos or videos to showcase your organization's work and impact on your public profile</p>
              <button
                className="ngo-btn ngo-btn-primary"
                style={{ marginTop: '20px' }}
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={16} /> Upload First Media
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
          >
            <X size={22} />
          </button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {lightbox.type === 'video' ? (
              <video
                src={lightbox.url}
                controls
                autoPlay
                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', background: '#000' }}
              />
            ) : (
              <img
                src={lightbox.url}
                alt={lightbox.title}
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }}
                onError={e => { e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found'; }}
              />
            )}
            {lightbox.title && (
              <p style={{ margin: 0, color: 'white', fontWeight: '600', fontSize: '15px' }}>{lightbox.title}</p>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="ngo-modal-overlay" onClick={closeUploadModal}>
          <div className="ngo-modal ngo-modal-upload" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Camera size={22} className="modal-header-icon" /> Upload Image or Video</h2>
              <button className="modal-close" onClick={closeUploadModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="upload-form">
              {/* Image Upload Area */}
              <div className="ngo-form-group">
                <label className="form-label">Image or Video <span className="required">*</span></label>
                <div
                  className={`upload-box ${previewUrl ? 'has-preview' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  {previewUrl ? (
                    <div className="preview-container">
                      {previewType === 'video' ? (
                        <video src={previewUrl} className="image-preview" controls style={{ background: '#000' }} />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="image-preview" />
                      )}
                      <button
                        type="button"
                        className="remove-preview-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl(null);
                          setPreviewType('image');
                          setUploadForm(prev => ({ ...prev, file: null, fileType: '' }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={36} className="upload-icon" />
                      <p className="upload-text">Click to browse or drag file</p>
                      <p className="upload-hint">Images (JPEG, PNG, GIF, WebP) or Videos (MP4, WebM) up to 100MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Field */}
              <div className="ngo-form-group">
                <label className="form-label">Title <span className="required">*</span></label>
                <input
                  type="text"
                  className="ngo-form-input"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                  required
                />
              </div>

              {/* Category Field */}
              <div className="ngo-form-group">
                <label className="form-label">Category</label>
                <select
                  className="ngo-form-input ngo-form-select"
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description Field */}
              <div className="ngo-form-group">
                <label className="form-label">Description <span className="optional">(Optional)</span></label>
                <textarea
                  className="ngo-form-input ngo-form-textarea"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief context about this image..."
                  rows={3}
                />
              </div>

              {/* Modal Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="ngo-btn ngo-btn-cancel"
                  onClick={closeUploadModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`ngo-btn ngo-btn-submit ${uploading ? 'disabled' : ''}`}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guidelines Card */}
      <div className="ngo-tips-card" style={{ marginTop: '28px' }}>
        <div className="tips-header">
          <Info size={18} />
          <h4>Gallery Guidelines</h4>
        </div>
        <ul className="tips-list">
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
