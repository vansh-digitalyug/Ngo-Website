import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Edit, Save, FileText, CreditCard, Home, FolderOpen, X, Building, Mail, Phone, MapPin, Globe, Facebook, Instagram, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from './NgoLayout';


export default function NgoProfile() {
  const { ngoData, setNgoData } = useOutletContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    ngoName: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: ''
    }
  });

  useEffect(() => {
    if (ngoData) {
      setFormData({
        ngoName: ngoData.ngoName || '',
        description: ngoData.description || '',
        email: ngoData.email || '',
        phone: ngoData.phone || '',
        address: ngoData.address || '',
        state: ngoData.state || '',
        website: ngoData.website || '',
        socialMedia: {
          facebook: ngoData.socialMedia?.facebook || '',
          instagram: ngoData.socialMedia?.instagram || ''
        }
      });
    }
  }, [ngoData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social_')) {
      const platform = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setNgoData(data.ngo);
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (ngoData) {
      setFormData({
        ngoName: ngoData.ngoName || '',
        description: ngoData.description || '',
        email: ngoData.email || '',
        phone: ngoData.phone || '',
        address: ngoData.address || '',
        state: ngoData.state || '',
        website: ngoData.website || '',
        socialMedia: {
          facebook: ngoData.socialMedia?.facebook || '',
          instagram: ngoData.socialMedia?.instagram || ''
        }
      });
    }
  };

  return (
    <div className="ngo-profile-page">
      {/* Page Header */}
      <div className="ngo-page-header">
        <div className="page-header-content">
          <h1>Organization Profile</h1>
          <p>Manage your organization's public information and settings</p>
        </div>
        {!isEditing ? (
          <button className="ngo-btn ngo-btn-primary" onClick={() => setIsEditing(true)}>
            <Edit size={16} /> Edit Profile
          </button>
        ) : (
          <div className="header-actions">
            <button className="ngo-btn ngo-btn-secondary" onClick={cancelEdit}>
              <X size={16} /> Cancel
            </button>
            <button 
              className="ngo-btn ngo-btn-primary" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        )}
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`ngo-alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="alert-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Profile View / Edit Form */}
      <div className="ngo-profile-content">
        <div className="ngo-section">
          <div className="ngo-section-header">
            <h2>Organization Information</h2>
          </div>
          <div className="ngo-section-body">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="ngo-profile-form">
                <div className="form-grid">
                  <div className="ngo-form-group">
                    <label>Organization Name <span className="label-note">Read only</span></label>
                    <input
                      type="text"
                      name="ngoName"
                      className="ngo-form-input disabled"
                      value={formData.ngoName}
                      disabled
                    />
                  </div>

                  <div className="ngo-form-group">
                    <label>Email Address <span className="label-note">Read only</span></label>
                    <input
                      type="email"
                      name="email"
                      className="ngo-form-input disabled"
                      value={formData.email}
                      disabled
                    />
                  </div>

                  <div className="ngo-form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="ngo-form-input"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="ngo-form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      className="ngo-form-input"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                    />
                  </div>

                  <div className="ngo-form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      className="ngo-form-input"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="ngo-form-group full-width">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      className="ngo-form-input"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="ngo-form-group full-width">
                    <label>Description</label>
                    <textarea
                      name="description"
                      className="ngo-form-input ngo-form-textarea"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell us about your organization, mission, and impact..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="form-section-divider">
                  <span>Social Media Links</span>
                </div>
                
                <div className="form-grid">
                  <div className="ngo-form-group">
                    <label><Facebook size={14} /> Facebook</label>
                    <input
                      type="url"
                      name="social_facebook"
                      className="ngo-form-input"
                      value={formData.socialMedia.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="ngo-form-group">
                    <label><Instagram size={14} /> Instagram</label>
                    <input
                      type="url"
                      name="social_instagram"
                      className="ngo-form-input"
                      value={formData.socialMedia.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="profile-view">
                {/* Organization Header Card */}
                <div className="profile-header-card">
                  <div className="profile-avatar">
                    {ngoData?.ngoName?.charAt(0) || 'N'}
                  </div>
                  <div className="profile-header-info">
                    <h3>{ngoData?.ngoName || 'Organization Name'}</h3>
                    <span className="profile-reg-number">
                      <Building size={14} /> Reg: {ngoData?.regNumber || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="profile-details-grid">
                  <div className="profile-detail-item">
                    <div className="detail-icon"><Mail size={18} /></div>
                    <div className="detail-content">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{ngoData?.email || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="detail-icon"><Phone size={18} /></div>
                    <div className="detail-content">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{ngoData?.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="detail-icon"><MapPin size={18} /></div>
                    <div className="detail-content">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{ngoData?.state || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <div className="detail-icon"><Globe size={18} /></div>
                    <div className="detail-content">
                      <span className="detail-label">Website</span>
                      {ngoData?.website ? (
                        <a href={ngoData.website} target="_blank" rel="noopener noreferrer" className="detail-link">
                          {ngoData.website.replace(/^https?:\/\//, '')} <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="detail-value">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address */}
                {ngoData?.address && (
                  <div className="profile-address-section">
                    <h4>Full Address</h4>
                    <p>{ngoData.address}</p>
                  </div>
                )}

                {/* Description */}
                <div className="profile-description-section">
                  <h4>About Organization</h4>
                  <p>{ngoData?.description || 'No description provided. Click "Edit Profile" to add information about your organization.'}</p>
                </div>

                {/* Social Links */}
                {(ngoData?.socialMedia?.facebook || ngoData?.socialMedia?.instagram) && (
                  <div className="profile-social-section">
                    <h4>Social Media</h4>
                    <div className="social-links">
                      {ngoData?.socialMedia?.facebook && (
                        <a href={ngoData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                          <Facebook size={16} /> Facebook
                        </a>
                      )}
                      {ngoData?.socialMedia?.instagram && (
                        <a href={ngoData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                          <Instagram size={16} /> Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="ngo-section">
          <div className="ngo-section-header">
            <h2>Documents & Certificates</h2>
            <span className="section-badge">Verified</span>
          </div>
          <div className="ngo-section-body">
            <div className="documents-grid">
              {ngoData?.documents?.registrationCertificate && (
                <a 
                  href={`${API_BASE_URL}/uploads/${ngoData.documents.registrationCertificate}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="document-card"
                >
                  <div className="document-icon purple">
                    <FileText size={24} />
                  </div>
                  <div className="document-info">
                    <span className="document-title">Registration Certificate</span>
                    <span className="document-action">View Document <ExternalLink size={12} /></span>
                  </div>
                </a>
              )}

              {ngoData?.documents?.certificate12A && (
                <a 
                  href={`${API_BASE_URL}/uploads/${ngoData.documents.certificate12A}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="document-card"
                >
                  <div className="document-icon blue">
                    <CreditCard size={24} />
                  </div>
                  <div className="document-info">
                    <span className="document-title">12A Certificate</span>
                    <span className="document-action">View Document <ExternalLink size={12} /></span>
                  </div>
                </a>
              )}

              {ngoData?.documents?.certificate80G && (
                <a 
                  href={`${API_BASE_URL}/uploads/${ngoData.documents.certificate80G}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="document-card"
                >
                  <div className="document-icon green">
                    <Home size={24} />
                  </div>
                  <div className="document-info">
                    <span className="document-title">80G Certificate</span>
                    <span className="document-action">View Document <ExternalLink size={12} /></span>
                  </div>
                </a>
              )}

              {!ngoData?.documents?.registrationCertificate && !ngoData?.documents?.certificate12A && !ngoData?.documents?.certificate80G && (
                <div className="ngo-empty-state compact">
                  <FolderOpen size={40} strokeWidth={1.5} />
                  <h4>No documents available</h4>
                  <p>Documents submitted during registration will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
