import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import PersonalInfo from './components/PersonalInfo';
import Donations from './components/Donations';
import Kanyadan from './components/Kanyadan';
import DonorTasks from './components/DonorTasks';
import VolunteerDashboard from './components/VolunteerDashboard';
import MyFeedbacks from './components/MyFeedbacks';
import EventUpdates from './components/EventUpdates';
import RegisteredEvents from './components/RegisteredEvents';
import RecentActivity from './components/RecentActivity';
import { PROFILE_VALIDATION, toPersonalFormState } from './utils/validation';
import { readStoredUser, persistUserToStorage, getApiUrl } from './utils/helpers.jsx';

const Profile = () => {
  const navigate = useNavigate();
  const { page } = useParams();
  const API_BASE_URL = getApiUrl();

  // ─── Tab & UI State ───────────────────────────────────────────
  const validTabs = ['overview', 'personal', 'donations', 'kanyadan', 'tasks', 'volunteer', 'feedback', 'eventUpdates', 'events', 'recentActivity'];
  const activeTab = validTabs.includes(page) ? page : 'overview';
  
  const setActiveTab = (tab) => {
    if (validTabs.includes(tab)) {
      navigate(`/profile/${tab}`);
    }
  };
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ─── Profile Form State ───────────────────────────────────────
  const [profileForm, setProfileForm] = useState(toPersonalFormState(null));
  const [formErrors, setFormErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveNotice, setSaveNotice] = useState({ type: '', message: '' });

  // ─── Password Modal State ──────────────────────────────────────
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changePasswordNotice, setChangePasswordNotice] = useState({ type: '', message: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // ─── Data States ──────────────────────────────────────────────
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [volunteerData, setVolunteerData] = useState(null);
  const [kanyadanApps, setKanyadanApps] = useState([]);
  const [kanyadanLoading, setKanyadanLoading] = useState(false);
  const [donorTasks, setDonorTasks] = useState([]);
  const [donorTasksLoading, setDonorTasksLoading] = useState(false);
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [volunteerTasksLoading, setVolunteerTasksLoading] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [eventNotifications, setEventNotifications] = useState([]);
  const [eventNotificationsLoading, setEventNotificationsLoading] = useState(false);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [eventRegistrationsLoading, setEventRegistrationsLoading] = useState(false);

  // ─── Initial Load ─────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Redirect to overview if no valid page specified
    if (!page || !validTabs.includes(page)) {
      navigate('/profile/overview', { replace: true });
      return;
    }
    
    const cachedUser = readStoredUser();
    if (cachedUser) {
      setUser(cachedUser);
      setProfileForm(toPersonalFormState(cachedUser));
      setAvatarPreview(cachedUser.avatar || '');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success || !data?.data) {
          throw new Error(data?.message || 'Unable to fetch profile');
        }
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

    // Fetch volunteer
    fetch(`${API_BASE_URL}/api/profile/volunteer`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d?.success) setVolunteerData(d.data);
      })
      .catch(() => {});

    // Fetch kanyadan
    fetch(`${API_BASE_URL}/api/profile/kanyadan`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d?.success) setKanyadanApps(d.data || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, page, navigate]);

  // ─── Fetch Functions ──────────────────────────────────────────
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
    } catch {
      /* silent */
    } finally {
      setDonationsLoading(false);
    }
  }, [API_BASE_URL]);

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
    } catch {
      /* silent */
    } finally {
      setKanyadanLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchDonorTasks = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setDonorTasksLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/donor/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setDonorTasks(data.data || []);
    } catch {
      /* silent */
    } finally {
      setDonorTasksLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchEventNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[fetchEventNotifications] No token found');
      return;
    }
    setEventNotificationsLoading(true);
    console.log('[fetchEventNotifications] Starting fetch from:', `${API_BASE_URL}/api/notifications/my-notifications?limit=50`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/my-notifications?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      console.log('[fetchEventNotifications] Response status:', res.status);
      const data = await res.json().catch((e) => {
        console.error('[fetchEventNotifications] JSON parse error:', e);
        return {};
      });
      console.log('[fetchEventNotifications] Response data:', data);
      if (data?.success) {
        console.log('[fetchEventNotifications] Setting notifications:', data.data?.length, 'items');
        setEventNotifications(data.data || []);
      } else {
        console.warn('[fetchEventNotifications] Response not successful:', data);
      }
    } catch (error) {
      console.error('[fetchEventNotifications] Fetch error:', error);
    } finally {
      setEventNotificationsLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchVolunteerTasks = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setVolunteerTasksLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/volunteer/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setVolunteerTasks(data.data || []);
    } catch {
      /* silent */
    } finally {
      setVolunteerTasksLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchMyFeedbacks = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setFeedbacksLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/feedback/my`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setMyFeedbacks(data.data?.feedbacks || data.data || []);
    } catch {
      /* silent */
    } finally {
      setFeedbacksLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchEventRegistrations = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setEventRegistrationsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/user/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setEventRegistrations(data.registrations || []);
    } catch {
      /* silent */
    } finally {
      setEventRegistrationsLoading(false);
    }
  }, [API_BASE_URL]);

  // ─── Tab Change Effect ────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'donations') fetchDonations();
    if (activeTab === 'kanyadan') fetchKanyadan();
    if (activeTab === 'tasks') fetchDonorTasks();
    if (activeTab === 'volunteer') fetchVolunteerTasks();
    if (activeTab === 'feedback') fetchMyFeedbacks();
    if (activeTab === 'eventUpdates') fetchEventNotifications();
    if (activeTab === 'events') fetchEventRegistrations();
  }, [
    activeTab,
    fetchDonations,
    fetchKanyadan,
    fetchDonorTasks,
    fetchVolunteerTasks,
    fetchMyFeedbacks,
    fetchEventNotifications,
    fetchEventRegistrations,
  ]);

  // ─── Profile Form Handlers ────────────────────────────────────
  const handleProfileInputChange = (field, value) => {
    let nextValue = value;

    if (field === 'phone') {
      nextValue = PROFILE_VALIDATION.onlyDigits(String(nextValue)).slice(0, 10);
    } else if (field === 'city') {
      nextValue = PROFILE_VALIDATION.onlyText(String(nextValue)).slice(0, 50);
    } else if (field === 'state') {
      nextValue = PROFILE_VALIDATION.onlyText(String(nextValue)).slice(0, 50);
    } else if (field === 'address') {
      nextValue = String(nextValue).slice(0, 100);
    }

    setProfileForm((prev) => ({ ...prev, [field]: nextValue }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
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
    setFormErrors({});

    const newErrors = {};
    const phoneErr = PROFILE_VALIDATION.validatePhone(profileForm.phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const addressErr = PROFILE_VALIDATION.validateAddress(profileForm.address);
    if (addressErr) newErrors.address = addressErr;
    const cityErr = PROFILE_VALIDATION.validateCity(profileForm.city);
    if (cityErr) newErrors.city = cityErr;
    const stateErr = PROFILE_VALIDATION.validateState(profileForm.state);
    if (stateErr) newErrors.state = stateErr;

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setSaveNotice({ type: 'error', message: 'Please fix the errors below.' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSaveNotice({ type: 'error', message: 'Please log in again to update profile.' });
      return;
    }

    const cleanName = profileForm.name.trim();
    if (!cleanName) {
      setSaveNotice({ type: 'error', message: 'Full name is required.' });
      return;
    }

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
      if (!res.ok || !data?.success || !data?.data) {
        throw new Error(data?.message || 'Failed to save profile changes');
      }

      setUser(data.data);
      setProfileForm(toPersonalFormState(data.data));
      setAvatarPreview(data.data.avatar || '');
      setSelectedAvatarFile(null);
      setFormErrors({});
      persistUserToStorage(data.data);
      window.dispatchEvent(new Event('authChanged'));
      setSaveNotice({ type: 'success', message: 'Changes saved successfully.' });
    } catch (error) {
      setSaveNotice({ type: 'error', message: error.message || 'Unable to save profile changes.' });
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Notice Timeout ───────────────────────────────────────────
  useEffect(() => {
    if (!saveNotice.message) return undefined;
    const timer = setTimeout(() => setSaveNotice({ type: '', message: '' }), 2500);
    return () => clearTimeout(timer);
  }, [saveNotice.message]);

  // ─── Logout Handler ───────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.dispatchEvent(new Event('authChanged'));
    window.location.href = '/login';
  };

  // ─── Password Modal Handlers ──────────────────────────────────
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
    if (!token) {
      setChangePasswordNotice({ type: 'error', message: 'Please log in again to change password.' });
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = changePasswordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordNotice({ type: 'error', message: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordNotice({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordNotice({ type: 'error', message: 'New password and confirm password must match.' });
      return;
    }

    if (currentPassword === newPassword) {
      setChangePasswordNotice({ type: 'error', message: 'New password must be different from current password.' });
      return;
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
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Unable to change password');
      }

      closeChangePasswordModal();
      setSaveNotice({ type: 'success', message: data.message || 'Password changed successfully.' });
    } catch (error) {
      setChangePasswordNotice({ type: 'error', message: error.message || 'Unable to change password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  // ─── Compute Derived Values ───────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center mb-6 shadow-lg">
          <FaSpinner className="text-2xl text-green-600 animate-spin" />
        </div>
        <p className="text-lg font-bold text-slate-900">Loading profile...</p>
        <p className="text-sm text-slate-600 mt-2">Setting up your dashboard</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
        <p className="text-lg text-slate-700 mb-6">Please log in to view your profile.</p>
        <Link to="/login" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg">
          Go to Login
        </Link>
      </div>
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const userState = user.state || 'Not Provided';
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Recently Joined';
  const visibleAvatar = avatarPreview || user.avatar || '';
  const isVolunteer = volunteerData && volunteerData.status === 'Approved';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Save Notice Toast */}
      {saveNotice.message && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg font-semibold text-sm shadow-lg z-40 animate-slideIn ${
            saveNotice.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {saveNotice.message}
        </div>
      )}

      {/* Password Change Modal */}
      {showChangePasswordModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeChangePasswordModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold disabled:opacity-50"
              onClick={closeChangePasswordModal}
              disabled={changingPassword}
              aria-label="Close"
            >
              ×
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-2">Change Password</h3>
            <p className="text-sm text-slate-600 mb-6">Enter your current password and choose a new secure password.</p>

            {changePasswordNotice.message && (
              <div
                className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border ${
                  changePasswordNotice.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {changePasswordNotice.message}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleChangePasswordSubmit}>
              <input
                type="password"
                placeholder="Current password"
                value={changePasswordForm.currentPassword}
                onChange={(e) => handleChangePasswordInput('currentPassword', e.target.value)}
                disabled={changingPassword}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={changePasswordForm.newPassword}
                onChange={(e) => handleChangePasswordInput('newPassword', e.target.value)}
                disabled={changingPassword}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={changePasswordForm.confirmPassword}
                onChange={(e) => handleChangePasswordInput('confirmPassword', e.target.value)}
                disabled={changingPassword}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row w-full">
        {/* Sidebar */}
        <Sidebar
          user={user}
          visibleAvatar={visibleAvatar}
          userInitial={userInitial}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
          isVolunteer={isVolunteer}
          kanyadanApps={kanyadanApps}
          donorTasks={donorTasks}
          eventNotifications={eventNotifications}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-y-auto">
          {activeTab === 'overview' && (
            <Overview
              user={user}
              visibleAvatar={visibleAvatar}
              userInitial={userInitial}
              isVolunteer={isVolunteer}
              memberSince={memberSince}
              userState={userState}
              donations={donations}
            />
          )}

          {activeTab === 'personal' && (
            <PersonalInfo
              user={user}
              visibleAvatar={visibleAvatar}
              profileForm={profileForm}
              formErrors={formErrors}
              savingProfile={savingProfile}
              saveNotice={saveNotice}
              activeTab={activeTab}
              onInputChange={handleProfileInputChange}
              onAvatarFileChange={handleAvatarFileChange}
              onCancelPersonalInfo={handleCancelPersonalInfo}
              onSavePersonalInfo={handleSavePersonalInfo}
              onOpenChangePasswordModal={openChangePasswordModal}
            />
          )}

          {activeTab === 'donations' && (
            <Donations
              donations={donations}
              donationsLoading={donationsLoading}
              user={user}
              fetchDonations={fetchDonations}
            />
          )}

          {activeTab === 'kanyadan' && (
            <Kanyadan
              kanyadanApps={kanyadanApps}
              kanyadanLoading={kanyadanLoading}
              fetchKanyadan={fetchKanyadan}
            />
          )}

          {activeTab === 'tasks' && (
            <DonorTasks
              donorTasks={donorTasks}
              donorTasksLoading={donorTasksLoading}
              fetchDonorTasks={fetchDonorTasks}
            />
          )}

          {activeTab === 'volunteer' && (
            <VolunteerDashboard
              volunteerData={volunteerData}
              visibleAvatar={visibleAvatar}
              userInitial={userInitial}
              user={user}
              volunteerTasks={volunteerTasks}
              volunteerTasksLoading={volunteerTasksLoading}
              fetchVolunteerTasks={fetchVolunteerTasks}
            />
          )}

          {activeTab === 'feedback' && (
            <MyFeedbacks
              myFeedbacks={myFeedbacks}
              feedbacksLoading={feedbacksLoading}
              fetchMyFeedbacks={fetchMyFeedbacks}
            />
          )}

          {activeTab === 'eventUpdates' && (
            <EventUpdates
              eventNotifications={eventNotifications}
              eventNotificationsLoading={eventNotificationsLoading}
              fetchEventNotifications={fetchEventNotifications}
            />
          )}

          {activeTab === 'events' && (
            <RegisteredEvents
              user={user}
              eventRegistrations={eventRegistrations}
              eventsLoading={eventRegistrationsLoading}
              fetchEventRegistrations={fetchEventRegistrations}
            />
          )}

          {activeTab === 'recentActivity' && (
            <RecentActivity
              user={user}
            />
          )}
        </main>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;
