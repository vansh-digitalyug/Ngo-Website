import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Edit, Save, FileText, CreditCard, Home, FolderOpen, X, Building, Mail, Phone, MapPin, Globe, Facebook, Instagram, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import AIDescribeButton from '../../components/ui/AIDescribeButton.jsx';
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
    <div className="min-h-screen bg-[#f8f7f5] p-4 sm:p-6 lg:p-8 font-sans text-[#2c2c2c] selection:bg-[#eaddc8] selection:text-[#2c2c2c]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222222]">Organization Profile</h1>
          <p className="text-[#6c6c6c] text-sm sm:text-base font-medium mt-1">Manage your organization's public information and settings</p>
        </div>
        {!isEditing ? (
          <button 
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all duration-200 shadow-sm w-full sm:w-auto"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm"
              onClick={cancelEdit}
            >
              <X size={16} /> Cancel
            </button>
            <button 
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed" 
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

      {/* Main Content Areas */}
      <div className="space-y-6 lg:space-y-8">
        
        {/* Profile View / Edit Form */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-white">
            <h2 className="text-lg font-bold text-[#222222]">Organization Information</h2>
          </div>
          
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                  {/* Read-only inputs */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#222222]">
                      Organization Name <span className="text-[11px] font-medium text-[#888888] ml-2 uppercase tracking-wider">Read only</span>
                    </label>
                    <input
                      type="text"
                      name="ngoName"
                      className="w-full px-4 py-2.5 bg-[#f0efeb] border border-gray-200 rounded-xl text-sm text-[#888888] cursor-not-allowed focus:outline-none"
                      value={formData.ngoName}
                      disabled
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#222222]">
                      Email Address <span className="text-[11px] font-medium text-[#888888] ml-2 uppercase tracking-wider">Read only</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-4 py-2.5 bg-[#f0efeb] border border-gray-200 rounded-xl text-sm text-[#888888] cursor-not-allowed focus:outline-none"
                      value={formData.email}
                      disabled
                    />
                  </div>

                  {/* Editable inputs */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#222222]">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#222222]">State</label>
                    <input
                      type="text"
                      name="state"
                      className="w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-sm font-bold text-[#222222]">Website</label>
                    <input
                      type="url"
                      name="website"
                      className="w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-sm font-bold text-[#222222]">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-bold text-[#222222]">Description</label>
                      <AIDescribeButton context="ngo" hint={formData.ngoName} onGenerated={v => setFormData(p => ({ ...p, description: v }))} />
                    </div>
                    <textarea
                      name="description"
                      className="w-full px-4 py-3 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all resize-y min-h-[120px]"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell us about your organization, mission, and impact..."
                      rows={4}
                    />
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-xs font-bold text-[#888888] uppercase tracking-wider">Social Media Links</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#222222]"><Facebook size={16} className="text-[#6c5d46]" /> Facebook</label>
                    <input
                      type="url"
                      name="social_facebook"
                      className="w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all"
                      value={formData.socialMedia.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#222222]"><Instagram size={16} className="text-[#6c5d46]" /> Instagram</label>
                    <input
                      type="url"
                      name="social_instagram"
                      className="w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all"
                      value={formData.socialMedia.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                {/* Organization Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 bg-[#f8f7f5] rounded-2xl border border-[#eaddc8]">
                  <div className="w-16 h-16 rounded-full bg-[#eaddc8] text-[#6c5d46] flex items-center justify-center text-2xl font-bold shrink-0">
                    {ngoData?.ngoName?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#222222] mb-1.5">{ngoData?.ngoName || 'Organization Name'}</h3>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6c6c6c] bg-white px-3 py-1 rounded-md border border-gray-200">
                      <Building size={14} className="text-[#6c5d46]" /> Reg: {ngoData?.regNumber || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Contact Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="p-2.5 bg-[#f8f7f5] rounded-lg text-[#6c5d46] shrink-0"><Mail size={18} /></div>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-0.5">Email</span>
                      <span className="block text-sm font-semibold text-[#222222] truncate">{ngoData?.email || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="p-2.5 bg-[#f8f7f5] rounded-lg text-[#6c5d46] shrink-0"><Phone size={18} /></div>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-0.5">Phone</span>
                      <span className="block text-sm font-semibold text-[#222222] truncate">{ngoData?.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="p-2.5 bg-[#f8f7f5] rounded-lg text-[#6c5d46] shrink-0"><MapPin size={18} /></div>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-0.5">Location</span>
                      <span className="block text-sm font-semibold text-[#222222] truncate">{ngoData?.state || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="p-2.5 bg-[#f8f7f5] rounded-lg text-[#6c5d46] shrink-0"><Globe size={18} /></div>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-0.5">Website</span>
                      {ngoData?.website ? (
                        <a href={ngoData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-semibold text-[#6c5d46] hover:text-[#453b2c] truncate hover:underline">
                          {ngoData.website.replace(/^https?:\/\//, '')} <ExternalLink size={12} className="shrink-0" />
                        </a>
                      ) : (
                        <span className="block text-sm font-semibold text-[#222222] truncate">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Address */}
                    {ngoData?.address && (
                      <div>
                        <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Full Address</h4>
                        <p className="text-sm font-medium text-[#222222] leading-relaxed bg-[#f8f7f5] p-4 rounded-xl border border-gray-100">{ngoData.address}</p>
                      </div>
                    )}

                    {/* Social Links */}
                    {(ngoData?.socialMedia?.facebook || ngoData?.socialMedia?.instagram) && (
                      <div>
                        <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-3">Social Media</h4>
                        <div className="flex flex-wrap gap-3">
                          {ngoData?.socialMedia?.facebook && (
                            <a href={ngoData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f8f7f5] text-[#222222] text-sm font-bold hover:bg-[#eaddc8] hover:text-[#6c5d46] transition-colors border border-gray-100">
                              <Facebook size={16} className="text-[#1877F2]" /> Facebook
                            </a>
                          )}
                          {ngoData?.socialMedia?.instagram && (
                            <a href={ngoData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f8f7f5] text-[#222222] text-sm font-bold hover:bg-[#eaddc8] hover:text-[#6c5d46] transition-colors border border-gray-100">
                              <Instagram size={16} className="text-[#E4405F]" /> Instagram
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">About Organization</h4>
                    <div className="text-sm font-medium text-[#222222] leading-relaxed bg-[#f8f7f5] p-5 rounded-xl border border-gray-100 min-h-[120px] whitespace-pre-line">
                      {ngoData?.description || (
                        <span className="text-[#888888] italic">No description provided. Click "Edit Profile" to add information about your organization.</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

        {/* Documents Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#222222]">Documents & Certificates</h2>
            <span className="text-[10px] font-bold text-[#5a6b46] bg-[#f0f4ea] px-2.5 py-1 rounded-md uppercase tracking-wider border border-[#d6e3c9]">Verified</span>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ngoData?.documents?.registrationCertificate && (
                <a 
                  href={`${API_BASE_URL}/uploads/${ngoData.documents.registrationCertificate}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#6c5d46] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#f8f7f5] text-[#6c5d46] group-hover:bg-[#6c5d46] group-hover:text-white transition-colors">
                    <FileText size={22} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#222222] mb-0.5">Registration Certificate</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#888888] group-hover:text-[#6c5d46] transition-colors uppercase tracking-wider">
                      View Document <ExternalLink size={10} />
                    </span>
                  </div>
                </a>
              )}

              {ngoData?.documents?.certificate12A && (
                <a 
                  href={`${API_BASE_URL}/uploads/${ngoData.documents.certificate12A}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#6c5d46] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#f8f7f5] text-[#6c5d46] group-hover:bg-[#6c5d46] group-hover:text-white transition-colors">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#222222] mb-0.5">12A Certificate</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#888888] group-hover:text-[#6c5d46] transition-colors uppercase tracking-wider">
                      View Document <ExternalLink size={10} />
                    </span>
                  </div>
                </a>
              )}

              {ngoData?.documents?.certificate80G && (
                <a 
                  href={`${API_BASE_URL}/uploads/${ngoData.documents.certificate80G}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#6c5d46] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#f8f7f5] text-[#6c5d46] group-hover:bg-[#6c5d46] group-hover:text-white transition-colors">
                    <Home size={22} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#222222] mb-0.5">80G Certificate</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#888888] group-hover:text-[#6c5d46] transition-colors uppercase tracking-wider">
                      View Document <ExternalLink size={10} />
                    </span>
                  </div>
                </a>
              )}

              {!ngoData?.documents?.registrationCertificate && !ngoData?.documents?.certificate12A && !ngoData?.documents?.certificate80G && (
                <div className="col-span-full flex flex-col items-center justify-center py-10 text-center bg-[#f8f7f5] rounded-xl border border-dashed border-gray-200">
                  <FolderOpen size={36} className="text-[#d5cfc4] mb-3" />
                  <h4 className="text-sm font-bold text-[#222222]">No documents available</h4>
                  <p className="text-xs font-medium text-[#888888] mt-1">Documents submitted during registration will appear here</p>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}