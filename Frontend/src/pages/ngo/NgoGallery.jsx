import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Upload, Trash2, Image, CheckCircle, FolderOpen, Info, X, AlertCircle, Eye, Clock, XCircle, Camera } from 'lucide-react';
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
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    file: null
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' });
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setUploadForm(prev => ({ ...prev, file }));
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.file) { setMessage({ type: 'error', text: 'Please select a file to upload' }); return; }
    if (!uploadForm.title.trim()) { setMessage({ type: 'error', text: 'Please enter a title for the image' }); return; }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const file = uploadForm.file;
      const uuid = crypto.randomUUID();

      // Step 1 — get presigned S3 upload URL (scoped to this NGO's S3 folder)
      const urlRes = await fetch(
        `${API_BASE_URL}/api/ngo-dashboard/gallery/upload-url?fileName=${encodeURIComponent(uuid)}&fileType=${encodeURIComponent(file.type)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
          title: uploadForm.title.trim(),
          description: uploadForm.description.trim(),
          category: uploadForm.category,
        }),
      });
      const data = await saveRes.json();

      if (saveRes.ok) {
        setMessage({ type: 'success', text: 'Image uploaded! It will be visible after admin approval.' });
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
    setUploadForm({ title: '', description: '', category: 'Other', file: null });
    setPreviewUrl(null);
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
          <p>Upload and manage photos showcasing your organization's work</p>
        </div>
        <button 
          className="ngo-btn ngo-btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={16} /> Upload Image
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
            <span className="stat-text">Total Images</span>
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
            <h2>Your Images</h2>
            <span className="section-badge">{gallery.length} items</span>
          </div>
          <div className="ngo-section-body">
            <div className="ngo-gallery-grid">
              {gallery.map((item) => {
                const badge = getStatusBadge(item.approvalStatus);
                return (
                  <div key={item._id} className="ngo-gallery-item">
                    <img
                      src={getImgUrl(item.url)}
                      alt={item.title || 'Gallery image'}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                      }}
                    />
                    <span className={`ngo-gallery-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                    <div className="ngo-gallery-overlay">
                      <h4>{item.title || 'Untitled'}</h4>
                      <p>{item.description || ''}</p>
                      <div className="gallery-item-actions">
                        <button
                          className="gallery-action-btn view"
                          onClick={() => window.open(getImgUrl(item.url), '_blank')}
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
              <h4>No images uploaded yet</h4>
              <p>Upload photos to showcase your organization's work and impact on your public profile</p>
              <button 
                className="ngo-btn ngo-btn-primary"
                style={{ marginTop: '20px' }}
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={16} /> Upload First Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="ngo-modal-overlay" onClick={closeUploadModal}>
          <div className="ngo-modal ngo-modal-upload" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Camera size={22} className="modal-header-icon" /> Upload New Image</h2>
              <button className="modal-close" onClick={closeUploadModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="upload-form">
              {/* Image Upload Area */}
              <div className="ngo-form-group">
                <label className="form-label">Image <span className="required">*</span></label>
                <div 
                  className={`upload-box ${previewUrl ? 'has-preview' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  {previewUrl ? (
                    <div className="preview-container">
                      <img src={previewUrl} alt="Preview" className="image-preview" />
                      <button 
                        type="button"
                        className="remove-preview-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl(null);
                          setUploadForm(prev => ({ ...prev, file: null }));
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
                      <p className="upload-hint">JPEG, PNG, GIF, WebP up to 5MB</p>
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
                  placeholder="Enter image title"
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
                  {uploading ? 'Saving...' : 'Save Image'}
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
          <li>Upload high-quality images that showcase your activities and impact</li>
          <li>All images require admin approval before appearing publicly</li>
          <li>Maximum file size: 5MB per image</li>
          <li>Supported formats: JPEG, PNG, GIF, WebP</li>
          <li>Avoid uploading images with sensitive personal information</li>
        </ul>
      </div>
    </div>
  );
}
