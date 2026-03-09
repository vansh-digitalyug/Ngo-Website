import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUser,
  FaMapMarkerAlt,
  FaCamera,
  FaHeart,
  FaHandHoldingHeart,
  FaSignOutAlt,
  FaDownload,
  FaSpinner,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaClipboardList,
  FaSync
} from 'react-icons/fa';
import './profile.css';

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const readStoredUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      if (parsed.data && typeof parsed.data === 'object') return parsed.data;
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

const persistUserToStorage = (profile) => {
  if (!profile) return;
  try {
    localStorage.setItem('user', JSON.stringify(profile));
  } catch {
    const fallbackProfile = { ...profile };
    if (typeof fallbackProfile.avatar === 'string' && fallbackProfile.avatar.startsWith('data:')) {
      fallbackProfile.avatar = null;
    }
    try {
      localStorage.setItem('user', JSON.stringify(fallbackProfile));
    } catch { /* quota exceeded */ }
  }
};

const toPersonalFormState = (profile) => ({
  name: profile?.name || '',
  phone: profile?.phone || '',
  address: profile?.address || '',
  city: profile?.city || '',
  state: profile?.state || '',
});

// ─── Receipt generator ────────────────────────────────────────────────────────
const downloadReceipt = (donation, userName) => {
  const date = new Date(donation.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const time = new Date(donation.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
  const receiptNo = donation.razorpayPaymentId || donation.receipt || `RCP-${donation._id?.slice(-8).toUpperCase()}`;
  const amount = Number(donation.amount).toLocaleString('en-IN');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Donation Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f5f5f5; }
    .receipt { max-width: 600px; margin: 30px auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .header { background: #2E7D32; color: #fff; padding: 24px 32px; text-align: center; }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.85; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 20px; padding: 3px 14px; font-size: 12px; margin-top: 10px; }
    .body { padding: 28px 32px; }
    .thank { text-align: center; font-size: 15px; color: #374151; margin-bottom: 24px; }
    .thank strong { color: #2E7D32; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
    td:first-child { color: #6b7280; width: 40%; }
    td:last-child { color: #111827; font-weight: 500; }
    .amount-row td { font-size: 18px; font-weight: 700; color: #2E7D32; border-top: 2px solid #e5e7eb; padding-top: 14px; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
    @media print { body { background: #fff; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>SevaIndia</h1>
      <p>Official Donation Receipt</p>
      <div class="badge">Tax Exemption Under Section 80G</div>
    </div>
    <div class="body">
      <p class="thank">Thank you, <strong>${userName || 'Donor'}</strong>, for your generous contribution!</p>
      <table>
        <tr><td>Receipt No.</td><td>${receiptNo}</td></tr>
        <tr><td>Donor Name</td><td>${donation.donorName || userName || 'Anonymous'}</td></tr>
        <tr><td>Program / Cause</td><td>${donation.serviceTitle || 'General Donation'}</td></tr>
        <tr><td>Date</td><td>${date}</td></tr>
        <tr><td>Time</td><td>${time}</td></tr>
        <tr><td>Payment ID</td><td>${donation.razorpayPaymentId || 'N/A'}</td></tr>
        <tr><td>Order ID</td><td>${donation.razorpayOrderId || 'N/A'}</td></tr>
        <tr><td>Currency</td><td>${donation.currency || 'INR'}</td></tr>
        <tr class="amount-row"><td>Amount Paid</td><td>₹${amount}</td></tr>
      </table>
    </div>
    <div class="footer">This is a computer-generated receipt. No signature required. | SevaIndia NGO Platform</div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onafterprint = () => URL.revokeObjectURL(url);
  }
};

// ─── Status badge helper ──────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    'Approved': { icon: <FaCheckCircle />, cls: 'success' },
    'Pending': { icon: <FaClock />, cls: 'pending' },
    'Under Review': { icon: <FaClock />, cls: 'review' },
    'Rejected': { icon: <FaTimesCircle />, cls: 'danger' },
  };
  const { icon, cls } = map[status] || { icon: null, cls: '' };
  return <span className={`status-pill ${cls}`}>{icon} {status}</span>;
};

// ─── Component ────────────────────────────────────────────────────────────────
const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState(toPersonalFormState(null));
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveNotice, setSaveNotice] = useState({ type: '', message: '' });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changePasswordNotice, setChangePasswordNotice] = useState({ type: '', message: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Data states
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [volunteerData, setVolunteerData] = useState(null);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [kanyadanApps, setKanyadanApps] = useState([]);
  const [kanyadanLoading, setKanyadanLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const cachedUser = readStoredUser();
    if (cachedUser) {
      setUser(cachedUser);
      setProfileForm(toPersonalFormState(cachedUser));
      setAvatarPreview(cachedUser.avatar || '');
    }

    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success || !data?.data) throw new Error(data?.message || 'Unable to fetch profile');
        if (!isMounted) return;
        setUser(data.data);
        setProfileForm(toPersonalFormState(data.data));
        setAvatarPreview(data.data.avatar || '');
        setSelectedAvatarFile(null);
        persistUserToStorage(data.data);
        window.dispatchEvent(new Event('authChanged'));
      } catch (error) {
        if (!cachedUser) console.error('Profile fetch failed:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    // Fetch kanyadan on mount to decide whether to show the tab
    fetch(`${API_BASE_URL}/api/profile/kanyadan`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => { if (isMounted && d?.success) setKanyadanApps(d.data || []); })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Fetch donations when tab is opened
  const fetchDonations = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setDonationsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/donations`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setDonations(data.data || []);
    } catch { /* silent */ } finally {
      setDonationsLoading(false);
    }
  }, []);

  // Fetch volunteer data when tab is opened
  const fetchVolunteer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setVolunteerLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/volunteer`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setVolunteerData(data.data);
    } catch { /* silent */ } finally {
      setVolunteerLoading(false);
    }
  }, []);

  // Fetch kanyadan status when overview is shown
  const fetchKanyadan = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setKanyadanLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/kanyadan`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setKanyadanApps(data.data || []);
    } catch { /* silent */ } finally {
      setKanyadanLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'donations' && donations.length === 0) fetchDonations();
    if (activeTab === 'volunteer') fetchVolunteer();
    if (activeTab === 'kanyadan') fetchKanyadan();
  }, [activeTab, donations.length, fetchDonations, fetchKanyadan, fetchVolunteer]);

  const handleProfileInputChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSaveNotice({ type: 'error', message: 'Please select a valid image file.' });
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveNotice({ type: 'error', message: 'Image size should be up to 5MB only.' });
      event.target.value = '';
      return;
    }
    setSelectedAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCancelPersonalInfo = () => {
    setProfileForm(toPersonalFormState(user));
    setAvatarPreview(user?.avatar || '');
    setSelectedAvatarFile(null);
    setSaveNotice({ type: '', message: '' });
  };

  const handleSavePersonalInfo = async (event) => {
    event.preventDefault();
    setSaveNotice({ type: '', message: '' });
    const token = localStorage.getItem('token');
    if (!token) { setSaveNotice({ type: 'error', message: 'Please log in again to update profile.' }); return; }
    const cleanName = profileForm.name.trim();
    if (!cleanName) { setSaveNotice({ type: 'error', message: 'Full name is required.' }); return; }
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', cleanName);
      formData.append('phone', profileForm.phone.trim());
      formData.append('address', profileForm.address.trim());
      formData.append('city', profileForm.city.trim());
      formData.append('state', profileForm.state.trim());
      if (selectedAvatarFile) formData.append('avatar', selectedAvatarFile);

      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success || !data?.data) throw new Error(data?.message || 'Failed to save profile changes');
      setUser(data.data);
      setProfileForm(toPersonalFormState(data.data));
      setAvatarPreview(data.data.avatar || '');
      setSelectedAvatarFile(null);
      persistUserToStorage(data.data);
      window.dispatchEvent(new Event('authChanged'));
      setSaveNotice({ type: 'success', message: 'Changes saved successfully.' });
    } catch (error) {
      setSaveNotice({ type: 'error', message: error.message || 'Unable to save profile changes.' });
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    if (!saveNotice.message) return undefined;
    const timer = setTimeout(() => setSaveNotice({ type: '', message: '' }), 2500);
    return () => clearTimeout(timer);
  }, [saveNotice.message]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.dispatchEvent(new Event('authChanged'));
    window.location.href = '/login';
  };

  const openChangePasswordModal = () => {
    setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setChangePasswordNotice({ type: '', message: '' });
    setShowChangePasswordModal(true);
  };

  const closeChangePasswordModal = () => {
    if (changingPassword) return;
    setShowChangePasswordModal(false);
    setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setChangePasswordNotice({ type: '', message: '' });
  };

  const handleChangePasswordInput = (field, value) => {
    setChangePasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePasswordSubmit = async (event) => {
    event.preventDefault();
    setChangePasswordNotice({ type: '', message: '' });
    const token = localStorage.getItem('token');
    if (!token) { setChangePasswordNotice({ type: 'error', message: 'Please log in again to change password.' }); return; }
    const { currentPassword, newPassword, confirmPassword } = changePasswordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordNotice({ type: 'error', message: 'All password fields are required.' }); return;
    }
    if (newPassword.length < 6) {
      setChangePasswordNotice({ type: 'error', message: 'New password must be at least 6 characters long.' }); return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordNotice({ type: 'error', message: 'New password and confirm password must match.' }); return;
    }
    if (currentPassword === newPassword) {
      setChangePasswordNotice({ type: 'error', message: 'New password must be different from current password.' }); return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Unable to change password');
      closeChangePasswordModal();
      setSaveNotice({ type: 'success', message: data.message || 'Password changed successfully.' });
    } catch (error) {
      setChangePasswordNotice({ type: 'error', message: error.message || 'Unable to change password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading profile-loading-animated">
        <div className="profile-loader-ring">
          <FaSpinner className="spinner-icon" />
        </div>
        <p>Loading profile...</p>
        <span>Setting up your dashboard</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-loading">
        <p>Please log in to view your profile.</p>
        <Link to="/login" className="btn-donate-now">Go to Login</Link>
      </div>
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const userState = user.state || 'Not Provided';
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Recently Joined';
  const visibleAvatar = avatarPreview || user.avatar || '';

  // Determine if the user is an approved volunteer
  const isVolunteer = volunteerData && volunteerData.status === 'Approved';

  // --- RENDER FUNCTIONS ---

  const renderSidebar = () => (
    <aside className="profile-sidebar">
      <div className="user-short-profile">
        <div className="sidebar-avatar">
          {visibleAvatar ? <img src={visibleAvatar} alt="Profile" /> : userInitial}
        </div>
        <h3>{user.name || 'User'}</h3>
        <p className="user-email-mini">{user.email || 'Not Available'}</p>
        {isVolunteer && (
          <span className="volunteer-badge-sidebar"><FaStar /> Volunteer</span>
        )}
      </div>

      <nav className="sidebar-nav">
        <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <FaUser className="nav-icon" /> Overview
        </button>
        <button className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
          <FaUser className="nav-icon" /> Personal Info
        </button>
        <button className={`nav-item ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>
          <FaHeart className="nav-icon" /> Donation History
        </button>
        {kanyadanApps.length > 0 && (
          <button className={`nav-item ${activeTab === 'kanyadan' ? 'active' : ''}`} onClick={() => setActiveTab('kanyadan')}>
            <FaClipboardList className="nav-icon" /> Kanyadan Status
          </button>
        )}
        {isVolunteer ? (
          <button className={`nav-item ${activeTab === 'volunteer' ? 'active' : ''}`} onClick={() => setActiveTab('volunteer')}>
            <FaHandHoldingHeart className="nav-icon" /> Volunteer Dashboard
          </button>
        ) : null}
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="nav-icon" /> Logout
        </button>
      </nav>
    </aside>
  );

  const renderOverview = () => (
    <div className="tab-content fade-in">
      <h2>Profile Overview</h2>

      <div className="overview-card">
        <div className="overview-top">
          <div className="overview-avatar-large">
            {visibleAvatar ? <img src={visibleAvatar} alt="Profile" /> : userInitial}
          </div>
          <div className="overview-details">
            <div className="name-header">
              <h3>{user.name || 'User'}</h3>
              {isVolunteer && <span className="volunteer-tag"><FaStar /> Volunteer</span>}
            </div>
            <div className="detail-grid">
              <div className="detail-item"><label>Email</label><span>{user.email || 'Not Available'}</span></div>
              <div className="detail-item"><label>Phone</label><span>{user.phone || 'Not Provided'}</span></div>
              <div className="detail-item"><label>Member Since</label><span>{memberSince}</span></div>
              <div className="detail-item"><label>State</label><span>{userState}</span></div>
              {user.city && <div className="detail-item"><label>City</label><span>{user.city}</span></div>}
              {user.address && <div className="detail-item full-width"><label>Address</label><span>{user.address}</span></div>}
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderPersonalInfo = () => (
    <div className="tab-content fade-in">
      <h2>Personal Information</h2>
      <p className="sub-text">Update your photo and personal details here.</p>

      {saveNotice.message && activeTab === 'personal' && (
        <div className={`inline-notice ${saveNotice.type === 'success' ? 'notice-success' : 'notice-error'}`}>
          {saveNotice.message}
        </div>
      )}

      <form className="personal-form" onSubmit={handleSavePersonalInfo}>
        <div className="avatar-upload-section">
          <div className="avatar-preview">
            {visibleAvatar ? <img src={visibleAvatar} alt="Preview" /> : userInitial}
          </div>
          <div className="avatar-actions">
            <h4>Profile Picture</h4>
            <p>PNG, JPG up to 5MB</p>
            <label htmlFor="file-upload" className="btn-upload">
              <FaCamera /> Upload New Picture
            </label>
            <input type="file" id="file-upload" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarFileChange} hidden />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={profileForm.name} readOnly style={{ background: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" value={profileForm.phone} onChange={(e) => handleProfileInputChange('phone', e.target.value)} />
          </div>
          <div className="form-group full-width">
            <label>Address</label>
            <div className="input-icon-wrapper">
              <FaMapMarkerAlt className="input-icon" />
              <input type="text" value={profileForm.address} onChange={(e) => handleProfileInputChange('address', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>City</label>
            <input type="text" value={profileForm.city} onChange={(e) => handleProfileInputChange('city', e.target.value)} />
          </div>
          <div className="form-group">
            <label>State</label>
            <input type="text" value={profileForm.state} onChange={(e) => handleProfileInputChange('state', e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-secondary" type="button" onClick={openChangePasswordModal}>Change Password</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-cancel" type="button" onClick={handleCancelPersonalInfo} disabled={savingProfile}>Cancel</button>
            <button className="btn-save" type="submit" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderDonations = () => (
    <div className="tab-content fade-in">
      <h2>Donation History</h2>

      {donationsLoading ? (
        <div className="loading-inline"><FaSpinner className="spinner-icon" /> Loading donations...</div>
      ) : donations.length > 0 ? (
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Program / Cause</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td><strong>{item.serviceTitle || 'General Donation'}</strong></td>
                  <td>₹{Number(item.amount).toLocaleString('en-IN')}</td>
                  <td><span className="status-pill success">Paid</span></td>
                  <td>
                    <button className="btn-download-receipt" onClick={() => downloadReceipt(item, user?.name)}>
                      <FaDownload /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-icon"><FaHeart /></div>
          <h3>Ready to make a difference?</h3>
          <p>You haven't made any donations yet. Your support can change lives.</p>
          <Link to="/donate" className="btn-donate-now">Donate Now</Link>
        </div>
      )}
    </div>
  );

  const incomeLabel = (val) => ({
    'below1L': 'Below ₹1 Lakh',
    '1to1.5L': '₹1 Lakh – ₹1.5 Lakh',
    '1.5to2L': '₹1.5 Lakh – ₹2 Lakh',
    '2to2.5L': '₹2 Lakh – ₹2.5 Lakh',
  }[val] || val);

  const renderKanyadan = () => (
    <div className="tab-content fade-in">
      <div className="kanyadan-tab-header">
        <h2>Kanyadan Yojna Status</h2>
        <button className="btn-refresh" onClick={fetchKanyadan} disabled={kanyadanLoading} title="Refresh">
          <FaSync className={kanyadanLoading ? 'spin' : ''} />
        </button>
      </div>

      {kanyadanLoading ? (
        <div className="loading-inline"><FaSpinner className="spinner-icon" /> Loading applications...</div>
      ) : kanyadanApps.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon"><FaClipboardList /></div>
          <h3>No Application Found</h3>
          <p>You haven't submitted a Kanyadan Yojna application yet. Apply to enroll your daughter in this programme.</p>
          <Link to="/services/welfare/kanyadan" className="btn-donate-now">Apply Now</Link>
        </div>
      ) : (
        <div className="kanyadan-apps-list">
          {kanyadanApps.map((app) => (
            <div key={app._id} className="kanyadan-detail-card">
              {/* Status banner */}
              <div className={`kanyadan-status-banner kanyadan-banner-${app.status.toLowerCase().replace(' ', '-')}`}>
                <StatusBadge status={app.status} />
                <span className="kanyadan-applied-date">
                  Applied: {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Details grid */}
              <div className="kanyadan-detail-grid">
                <div className="kd-section">
                  <h4>Girl's Details</h4>
                  <div className="vinfo-list">
                    <div className="vinfo-item"><span>Name</span><strong>{app.girlName}</strong></div>
                    <div className="vinfo-item"><span>Age</span><strong>{app.girlAge} year{app.girlAge !== 1 ? 's' : ''}</strong></div>
                  </div>
                </div>

                <div className="kd-section">
                  <h4>Guardian Details</h4>
                  <div className="vinfo-list">
                    <div className="vinfo-item"><span>Guardian Name</span><strong>{app.guardianName}</strong></div>
                    <div className="vinfo-item"><span>Annual Income</span><strong>{incomeLabel(app.annualIncome)}</strong></div>
                  </div>
                </div>

                <div className="kd-section">
                  <h4>Location</h4>
                  <div className="vinfo-list">
                    <div className="vinfo-item"><span>District</span><strong>{app.district}</strong></div>
                    <div className="vinfo-item"><span>State</span><strong>{app.state}</strong></div>
                  </div>
                </div>
              </div>

              {/* Admin note */}
              {app.adminNote && (
                <div className="kanyadan-admin-note">
                  <strong>Message from Admin:</strong> {app.adminNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVolunteerDashboard = () => {
    if (volunteerLoading) {
      return (
        <div className="tab-content fade-in">
          <h2>Volunteer Dashboard</h2>
          <div className="loading-inline"><FaSpinner className="spinner-icon" /> Loading volunteer data...</div>
        </div>
      );
    }

    if (!volunteerData) {
      return (
        <div className="tab-content fade-in">
          <h2>Volunteer Dashboard</h2>
          <div className="empty-state-card">
            <div className="empty-icon"><FaHandHoldingHeart /></div>
            <h3>Not a volunteer yet</h3>
            <p>Join our volunteer program and make a difference in communities.</p>
            <Link to="/services/volunteer" className="btn-donate-now">Apply Now</Link>
          </div>
        </div>
      );
    }

    const dobFormatted = volunteerData.dob
      ? new Date(volunteerData.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'Not Provided';

    const joinDate = volunteerData.createdAt
      ? new Date(volunteerData.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : 'Unknown';

    return (
      <div className="tab-content fade-in">
        <h2>Volunteer Dashboard</h2>

        {/* Volunteer hero card */}
        <div className="volunteer-hero-card">
          <div className="volunteer-hero-avatar">
            {visibleAvatar ? <img src={visibleAvatar} alt="Profile" /> : userInitial}
          </div>
          <div className="volunteer-hero-info">
            <h3>{volunteerData.fullName}</h3>
            <div className="volunteer-hero-tags">
              <StatusBadge status={volunteerData.status} />
              {volunteerData.role && (
                <span className="role-tag"><FaStar /> {volunteerData.role}</span>
              )}
            </div>
            <p className="volunteer-since">Volunteer since {joinDate}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="volunteer-info-grid">
          <div className="volunteer-info-section">
            <h4>Personal Information</h4>
            <div className="vinfo-list">
              <div className="vinfo-item"><span>Email</span><strong>{volunteerData.email}</strong></div>
              <div className="vinfo-item"><span>Phone</span><strong>{volunteerData.phone}</strong></div>
              <div className="vinfo-item"><span>Date of Birth</span><strong>{dobFormatted}</strong></div>
              <div className="vinfo-item"><span>Occupation</span><strong>{volunteerData.occupation || 'Not Provided'}</strong></div>
              <div className="vinfo-item"><span>Education</span><strong>{volunteerData.education || 'Not Provided'}</strong></div>
            </div>
          </div>

          <div className="volunteer-info-section">
            <h4>Location & Area</h4>
            <div className="vinfo-list">
              <div className="vinfo-item"><span>City</span><strong>{volunteerData.city}</strong></div>
              <div className="vinfo-item"><span>State</span><strong>{volunteerData.state}</strong></div>
              {volunteerData.assignedArea && (
                <div className="vinfo-item"><span>Assigned Area</span><strong>{volunteerData.assignedArea}</strong></div>
              )}
            </div>
          </div>

          <div className="volunteer-info-section">
            <h4>Preferences</h4>
            <div className="vinfo-list">
              <div className="vinfo-item"><span>Mode</span><strong>{volunteerData.mode || 'On-site'}</strong></div>
              <div className="vinfo-item"><span>Availability</span><strong>{volunteerData.availability || 'Not Specified'}</strong></div>
              {volunteerData.skills && (
                <div className="vinfo-item"><span>Skills</span><strong>{volunteerData.skills}</strong></div>
              )}
            </div>
          </div>

          {volunteerData.interests?.length > 0 && (
            <div className="volunteer-info-section full-width">
              <h4>Areas of Interest</h4>
              <div className="interest-tags">
                {volunteerData.interests.map((interest) => (
                  <span key={interest} className="interest-tag">{interest}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="profile-layout">
      {saveNotice.message && (
        <div className={`save-toast ${saveNotice.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {saveNotice.message}
        </div>
      )}

      {showChangePasswordModal && (
        <div className="password-modal-overlay" onClick={closeChangePasswordModal}>
          <div className="password-modal-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="password-close-btn" onClick={closeChangePasswordModal} disabled={changingPassword} aria-label="Close">×</button>
            <h3 className="password-modal-title">Change Password</h3>
            <p className="password-modal-subtitle">Enter your current password and choose a new secure password.</p>
            {changePasswordNotice.message && (
              <div className={`password-notice ${changePasswordNotice.type === 'success' ? 'password-notice-success' : 'password-notice-error'}`}>
                {changePasswordNotice.message}
              </div>
            )}
            <form className="password-form" onSubmit={handleChangePasswordSubmit}>
              <input className="password-input" type="password" placeholder="Current password" value={changePasswordForm.currentPassword} onChange={(e) => handleChangePasswordInput('currentPassword', e.target.value)} disabled={changingPassword} required />
              <input className="password-input" type="password" placeholder="New password (min 6 chars)" value={changePasswordForm.newPassword} onChange={(e) => handleChangePasswordInput('newPassword', e.target.value)} disabled={changingPassword} required />
              <input className="password-input" type="password" placeholder="Confirm new password" value={changePasswordForm.confirmPassword} onChange={(e) => handleChangePasswordInput('confirmPassword', e.target.value)} disabled={changingPassword} required />
              <button className="password-submit-btn" type="submit" disabled={changingPassword}>{changingPassword ? 'Updating...' : 'Update Password'}</button>
            </form>
          </div>
        </div>
      )}

      <div className="profile-container">
        {renderSidebar()}
        <main className="profile-main">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'donations' && renderDonations()}
          {activeTab === 'kanyadan' && renderKanyadan()}
          {activeTab === 'volunteer' && renderVolunteerDashboard()}
        </main>
      </div>
    </div>
  );
};

export default Profile;
