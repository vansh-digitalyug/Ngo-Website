import React, { useState, useRef } from 'react';
import { 
  FaUserAlt, 
  FaMapMarkerAlt, 
  FaRegClock, 
  FaRegCheckCircle, 
  FaClipboardList, 
  FaSpinner, 
  FaSync, 
  FaUpload, 
  FaTimes,
  FaQuoteLeft,
  FaRegIdBadge,
  FaBriefcase,
  FaGraduationCap,
  FaRegFolderOpen,
  FaEdit,
  FaSave
} from 'react-icons/fa';

const VolunteerDashboard = ({
  volunteerData,
  visibleAvatar,
  userInitial,
  user,
  volunteerTasks,
  volunteerTasksLoading,
  fetchVolunteerTasks,
  fetchVolunteerData // Optional prop to refresh profile data after edit
}) => {
  const [uploadTarget, setUploadTarget] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' });

  if (!volunteerData) return null;

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage({ type: '', text: '' }), 5000);
  };

  const joinedDate = volunteerData.createdAt
    ? new Date(volunteerData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const dobFmt = volunteerData.dob
    ? new Date(volunteerData.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-8 lg:px-12 font-sans selection:bg-[#7a5c53] selection:text-white" style={{ backgroundColor: '#F9F8F6' }}>
      
      {/* Toast Notification */}
      {toastMessage.text && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl text-white shadow-2xl z-50 flex items-center gap-3 transform transition-all duration-500 translate-y-0 opacity-100 ${
          toastMessage.type === 'success' ? 'bg-[#7a5c53]' : 'bg-gray-800'
        }`}>
          {toastMessage.type === 'success' ? <FaRegCheckCircle size={18} /> : <FaTimes size={18} />}
          <span className="font-semibold tracking-wide text-sm">{toastMessage.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Workspace</h2>
            <p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-widest">Volunteer Portal</p>
          </div>
        </div>

        {/* --- Top Bento Row: Profile --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Hero Card */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#E8E3DD] relative overflow-visible group">
            <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[#F9F8F6] rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
            
            {/* Edit Profile Button */}
            <button 
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute top-6 right-6 md:top-8 md:right-8 z-20 flex items-center gap-2 px-4 py-2 bg-[#F9F8F6] hover:bg-[#F0EBE6] text-[#7a5c53] text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all duration-300 border border-[#E8E3DD] cursor-pointer hover:shadow-lg hover:border-[#7a5c53]/40 active:scale-95"
            >
              <FaEdit size={12} /> <span className="hidden sm:inline">Edit Profile</span>
            </button>

            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center relative z-10">
              <div className="relative flex-shrink-0 mt-4 sm:mt-0">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-[#F0EBE6] flex items-center justify-center text-4xl font-bold text-[#7a5c53] overflow-hidden shadow-sm border-4 border-white ring-1 ring-[#E8E3DD]">
                  {visibleAvatar ? (
                    <img src={visibleAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userInitial
                  )}
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-4 mb-3 pr-12">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{volunteerData.fullName || user?.name}</h1>
                  <span className="px-4 py-1.5 bg-[#F0EBE6] text-[#7a5c53] text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                    {volunteerData.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium mb-8">
                  <span className="flex items-center gap-2"><FaRegClock className="text-[#7a5c53]" /> Member since {joinedDate}</span>
                  {volunteerData.city && (
                    <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-[#7a5c53]" /> {volunteerData.city}{volunteerData.state ? `, ${volunteerData.state}` : ''}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-8 pt-6 border-t border-[#E8E3DD]/50">
                  <QuickStat label="Mode" value={volunteerData.mode || 'Flexible'} />
                  <QuickStat label="Availability" value={volunteerData.availability || 'Standard'} />
                  <QuickStat 
                    label="Verification" 
                    value={volunteerData.idVerified ? 'Verified' : 'Pending'} 
                    isVerified={volunteerData.idVerified}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Motivation Box */}
          <div className="bg-[#7a5c53] rounded-[2rem] p-8 shadow-lg relative overflow-hidden flex flex-col justify-center">
            <FaQuoteLeft className="absolute -top-4 -left-4 text-white/10 text-8xl transform -rotate-12" />
            <div className="relative z-10">
              <h3 className="text-[10px] text-white/70 font-extrabold uppercase tracking-widest mb-6">Driving Force</h3>
              <p className="text-[#F9F8F6] text-lg sm:text-xl font-medium leading-relaxed">
                {volunteerData.motivation ? `"${volunteerData.motivation}"` : '"Dedicated to preserving our shared history and uplifting the community."'}
              </p>
            </div>
          </div>
        </div>

        {/* --- Bottom Bento Row: Info & Tasks --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Details */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Personal Info */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#E8E3DD]">
              <h3 className="text-xs text-gray-900 font-extrabold uppercase tracking-widest mb-8 flex items-center gap-3">
                <FaUserAlt className="text-[#7a5c53]" /> Identity Profile
              </h3>
              <div className="space-y-6">
                <DetailRow label="Email" value={volunteerData.email} />
                <DetailRow label="Phone" value={volunteerData.phone} />
                <DetailRow label="DOB" value={dobFmt} />
                <DetailRow label="Education" value={volunteerData.education || '—'} icon={<FaGraduationCap />} />
                <DetailRow label="Occupation" value={volunteerData.occupation || '—'} icon={<FaBriefcase />} />
              </div>
            </div>

            {/* Expertise */}
            {volunteerData.interests?.length > 0 && (
              <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#E8E3DD]">
                <h3 className="text-xs text-gray-900 font-extrabold uppercase tracking-widest mb-6 flex items-center gap-3">
                  <FaRegIdBadge className="text-[#7a5c53]" /> Expertise & Focus
                </h3>
                <div className="flex flex-wrap gap-2">
                  {volunteerData.interests.map((tag, i) => (
                    <span key={`int-${i}`} className="px-4 py-2 bg-[#F9F8F6] text-gray-700 text-xs font-bold tracking-wide rounded-xl border border-[#E8E3DD]">
                      {tag}
                    </span>
                  ))}
                  {volunteerData.skills && volunteerData.skills.split(',').map((skill, i) => (
                    <span key={`skill-${i}`} className="px-4 py-2 bg-[#F0EBE6] text-[#7a5c53] text-xs font-bold tracking-wide rounded-xl">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Operations Ledger */}
          <div className="xl:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#E8E3DD] flex flex-col">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-[#E8E3DD]">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Active Operations</h3>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Tasks & Assignments</p>
              </div>
              <button
                onClick={fetchVolunteerTasks}
                disabled={volunteerTasksLoading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F9F8F6] hover:bg-[#F0EBE6] text-gray-800 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 border border-[#E8E3DD] hover:border-[#7a5c53]/30 disabled:opacity-50"
              >
                <FaSync className={volunteerTasksLoading ? 'animate-spin text-[#7a5c53]' : 'text-[#7a5c53]'} size={12} /> Sync Ledger
              </button>
            </div>

            {/* Task List */}
            <div className="flex-1">
              {volunteerTasksLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <FaSpinner className="animate-spin text-[#7a5c53] text-4xl mb-6" />
                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Retrieving Records</p>
                </div>
              ) : volunteerTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-20 h-20 bg-[#F9F8F6] rounded-full flex items-center justify-center mb-6 border border-[#E8E3DD]">
                    <FaRegFolderOpen className="text-gray-300 text-3xl" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg">No active operations</p>
                  <p className="text-sm text-gray-500 mt-2 max-w-sm">When you are assigned new tasks by the administration, they will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {volunteerTasks.map((task) => {
                    const isPending = task.status === 'assigned' || task.status === 'in_progress';
                    // The proof URL can come from different fields depending on the backend (e.g. proofUrl, mediaUrl, or s3Url)
                    const proofImage = task.proofUrl || task.mediaUrl || task.s3Url; 
                    
                    return (
                      <div 
                        key={task._id} 
                        className="group flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-[#E8E3DD] bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#7a5c53]/30 transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Status Accent Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPending ? 'bg-[#7a5c53]' : 'bg-gray-300'}`}></div>
                        
                        <div className="flex-1 pl-2">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{task.title}</h4>
                            <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap ${
                              isPending ? 'bg-[#F0EBE6] text-[#7a5c53]' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-gray-500 mb-4">
                            <span>Service: <strong className="text-gray-800">{task.serviceTitle || 'General'}</strong></span>
                            <span>Donor: <strong className="text-gray-800">{task.donorName || 'Anonymous'}</strong></span>
                          </div>

                          {task.description && (
                            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{task.description}</p>
                          )}
                        </div>

                        <div className="md:w-48 flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-[#E8E3DD] pt-4 md:pt-0 md:pl-6">
                          {isPending ? (
                            <button
                              onClick={() => setUploadTarget(task)}
                              className="w-full px-5 py-3 bg-[#7a5c53] hover:bg-[#5e453e] text-white text-[11px] font-extrabold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
                            >
                              <FaUpload size={14} /> Submit Proof
                            </button>
                          ) : (
                            <div className="text-left md:text-right w-full flex flex-col md:items-end">
                              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Completed On</p>
                              <p className="text-sm font-bold text-gray-800 mb-3">
                                {new Date(task.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                              
                              {/* DISPLAY TASK PROOF */}
                              {proofImage && (
                                <div className="w-24 h-20 rounded-xl overflow-hidden border border-[#E8E3DD] shadow-sm relative group/proof">
                                  {task.mediaType === 'video' ? (
                                    <video src={proofImage} className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={proofImage} alt="Task Proof" className="w-full h-full object-cover" />
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/proof:opacity-100 flex items-center justify-center transition-opacity">
                                    <a href={proofImage} target="_blank" rel="noreferrer" className="text-white text-[10px] font-bold uppercase tracking-widest">View</a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Upload Proof Modal */}
      {uploadTarget && (
        <UploadProofModal
          task={uploadTarget}
          onClose={() => setUploadTarget(null)}
          onSuccess={() => {
            setUploadTarget(null);
            showToast('success', 'Operation recorded successfully.');
            fetchVolunteerTasks();
          }}
          uploading={uploadLoading}
          setUploading={setUploadLoading}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <EditProfileModal
          volunteerData={volunteerData}
          onClose={() => setIsEditProfileOpen(false)}
          onSuccess={() => {
            setIsEditProfileOpen(false);
            showToast('success', 'Profile updated successfully.');
            if (fetchVolunteerData) fetchVolunteerData();
            else setTimeout(() => window.location.reload(), 1500); // Reload if no fetch prop provided
          }}
        />
      )}
    </div>
  );
};

// --- Reusable Subcomponents --- //

const QuickStat = ({ label, value, isVerified }) => (
  <div>
    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1.5">{label}</p>
    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
      {isVerified && <FaRegCheckCircle className="text-green-600" />} {value}
    </p>
  </div>
);

const DetailRow = ({ label, value, icon }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">{label}</p>
    <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      {value}
    </p>
  </div>
);


// --- Edit Profile Modal Component --- //

const EditProfileModal = ({ volunteerData, onClose, onSuccess }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Format dates for input type="date"
  const formattedDob = volunteerData.dob ? new Date(volunteerData.dob).toISOString().split('T')[0] : '';
  
  const [formData, setFormData] = useState({
    fullName: volunteerData.fullName || '',
    phone: volunteerData.phone || '',
    dob: formattedDob,
    education: volunteerData.education || '',
    occupation: volunteerData.occupation || '',
    city: volunteerData.city || '',
    state: volunteerData.state || '',
    mode: volunteerData.mode || '',
    availability: volunteerData.availability || '',
    motivation: volunteerData.motivation || '',
    skills: volunteerData.skills || '',
    interests: volunteerData.interests ? volunteerData.interests.join(', ') : '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // ✅ BLOCKED FIELDS: Do NOT send these to backend (they're managed in User Profile)
      const blockedFields = ['email', 'phone', 'city', 'state'];
      
      // Create payload with only editable volunteer-specific fields
      const volunteerPayload = {
        fullName: formData.fullName,
        dob: formData.dob,
        education: formData.education,
        occupation: formData.occupation,
        mode: formData.mode,
        availability: formData.availability,
        motivation: formData.motivation,
        skills: formData.skills,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i)
      };

      const volunteerRes = await fetch(`${API_BASE_URL}/api/volunteer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(volunteerPayload)
      });

      const volunteerData = await volunteerRes.json();

      if (!volunteerData.success) {
        setError(volunteerData.message || 'Failed to update volunteer profile');
        setLoading(false);
        return;
      }

      // Success - Modal closes automatically
      onSuccess();
      setLoading(false);
    } catch (err) {
      console.error('Error updating volunteer profile:', err);
      setError(err.message || 'Failed to update volunteer profile');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] transform transition-all">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#E8E3DD] bg-white flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit Profile</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Update your volunteer identity</p>
          </div>
          <button onClick={onClose} disabled={loading} className="w-10 h-10 rounded-full bg-[#F9F8F6] hover:bg-[#F0EBE6] flex items-center justify-center text-gray-500 transition-colors">
            <FaTimes size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-100 flex items-center gap-3"><FaTimes size={14}/> {error}</div>}
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">ℹ️ Update Info</p>
            <p className="text-xs text-blue-700 mt-2">Core profile fields (name, phone, city, state) sync immediately. Other details will be updated when available.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                <InputField 
                  label="Phone Number" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  disabled
                  hint="Update in Profile → Personal Info if needed"
                />
                <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                <InputField 
                  label="City" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange}
                  disabled
                  hint="Update in Profile → Personal Info if needed"
                />
                <InputField 
                  label="State" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange}
                  disabled
                  hint="Update in Profile → Personal Info if needed"
                />
              </div>
              
              {/* Column 2 */}
              <div className="space-y-4">
                <InputField label="Education" name="education" value={formData.education} onChange={handleChange} />
                <InputField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
                <InputField label="Volunteer Mode" name="mode" value={formData.mode} onChange={handleChange} placeholder="e.g. Remote, On-site, Hybrid" />
                <InputField label="Availability" name="availability" value={formData.availability} onChange={handleChange} placeholder="e.g. Weekends, Evenings" />
                <InputField label="Skills (comma separated)" name="skills" value={formData.skills} onChange={handleChange} />
              </div>
            </div>

            {/* Full Width */}
            <div className="space-y-4 pt-2">
              <InputField label="Areas of Interest (comma separated)" name="interests" value={formData.interests} onChange={handleChange} />
              <div>
                <label className="block text-[10px] font-extrabold text-gray-900 uppercase tracking-widest mb-2">Motivation</label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  placeholder="Why do you volunteer with us?"
                  className="w-full px-5 py-4 bg-[#F9F8F6] border border-[#E8E3DD] rounded-2xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#7a5c53] outline-none transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t border-[#E8E3DD]">
              <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-4 px-6 text-gray-600 bg-white border border-[#E8E3DD] rounded-xl hover:bg-[#F9F8F6] font-extrabold text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50">
                Discard Changes
              </button>
              <button type="submit" disabled={loading} className="flex-[2] py-4 px-6 bg-[#7a5c53] text-white rounded-xl hover:bg-[#5e453e] font-extrabold text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-md">
                {loading ? <FaSpinner className="animate-spin" size={16} /> : <FaSave size={16} />}
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Field for Edit Profile
const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required, disabled, hint }) => (
  <div>
    <label className="block text-[10px] font-extrabold text-gray-900 uppercase tracking-widest mb-2">
      {label} {required && <span className="text-red-500">*</span>}
      {disabled && <span className="text-gray-500 text-[10px] font-normal ml-2">(Linked to Profile)</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full px-5 py-3.5 rounded-2xl text-sm font-medium outline-none transition-all ${
        disabled 
          ? 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-[#F9F8F6] border border-[#E8E3DD] text-gray-800 focus:ring-2 focus:ring-[#7a5c53]'
      }`}
      title={disabled ? 'Update this field in your Profile → Personal Info' : ''}
    />
    {hint && <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1">💡 {hint}</p>}
  </div>
);


// --- Upload Proof Modal Component --- //

const UploadProofModal = ({ task, onClose, onSuccess, uploading, setUploading }) => {
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [note, setNote] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    const maxMB = 100;
    if (f.size > maxMB * 1024 * 1024) {
      setError(`File exceeds ${maxMB} MB limit.`);
      return;
    }

    setError('');
    setFile(f);
    
    const isVideo = f.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (evt) => setPreviewUrl(evt.target?.result || '');
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a visual proof document.'); return; }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      setProgress('Establishing secure connection...');
      const urlRes = await fetch(`${API_BASE_URL}/api/s3/generate-upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          location: 'volunteerTask'
        }),
      });

      const urlData = await urlRes.json();
      if (!urlData.success) throw new Error(urlData.message || 'Failed to get upload URL');
      const { uploadUrl, key } = urlData.data;

      setProgress(`Transmitting file (${(file.size / 1024 / 1024).toFixed(1)} MB)...`);
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      if (!s3Res.ok) throw new Error('Upload failed');

      setProgress('Finalizing operation ledger...');
      const completeRes = await fetch(`${API_BASE_URL}/api/tasks/volunteer/${task._id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          s3Key: key,
          mediaType,
          volunteerNote: note || '',
          addToGallery: false
        })
      });

      const completeData = await completeRes.json();
      if (!completeData.success) throw new Error(completeData.message || 'Failed to complete task');

      onSuccess();
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] transform transition-all">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-[#E8E3DD] bg-white flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Submit Proof</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Operation Verification</p>
          </div>
          <button onClick={onClose} disabled={uploading} className="w-10 h-10 rounded-full bg-[#F9F8F6] hover:bg-[#F0EBE6] flex items-center justify-center text-gray-500 transition-colors">
            <FaTimes size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-100 flex items-center gap-3"><FaTimes size={14}/> {error}</div>}
          {progress && <div className="mb-6 p-4 bg-[#F0EBE6] text-[#7a5c53] rounded-xl text-xs font-bold uppercase tracking-widest border border-[#E8E3DD] flex items-center gap-3"><FaSpinner className="animate-spin" size={14}/> {progress}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-5 bg-[#F9F8F6] rounded-2xl border border-[#E8E3DD]">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Target Operation</p>
              <p className="text-base font-bold text-gray-900">{task.title}</p>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-900 uppercase tracking-widest mb-3">Media Evidence *</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                onChange={handleFileChange}
                hidden
                disabled={uploading}
              />
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-300 ${
                  uploading ? 'opacity-50 cursor-not-allowed border-[#E8E3DD] bg-gray-50' : 'border-[#E8E3DD] cursor-pointer hover:border-[#7a5c53] hover:bg-[#F9F8F6]'
                }`}
              >
                {previewUrl ? (
                  <div className="relative group rounded-xl overflow-hidden shadow-sm inline-block">
                    {mediaType === 'video' ? (
                      <video src={previewUrl} muted className="max-w-full max-h-48 mx-auto" />
                    ) : (
                      <img src={previewUrl} alt="preview" className="max-w-full max-h-48 mx-auto" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-bold uppercase tracking-widest">Change File</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6">
                    <div className="w-16 h-16 bg-[#F0EBE6] text-[#7a5c53] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUpload size={20} />
                    </div>
                    <p className="text-sm font-extrabold text-gray-900 uppercase tracking-widest">Select Media</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-2 tracking-wide">JPG, PNG, MP4 (Max 100MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Note Area */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-900 uppercase tracking-widest mb-3">Field Notes (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Document any relevant details..."
                maxLength={300}
                disabled={uploading}
                className="w-full px-5 py-4 bg-[#F9F8F6] border border-[#E8E3DD] rounded-2xl text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#7a5c53] focus:border-transparent outline-none resize-none transition-all disabled:opacity-50"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="flex-1 py-4 px-6 text-gray-600 bg-white border border-[#E8E3DD] rounded-xl hover:bg-[#F9F8F6] font-extrabold text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="flex-[2] py-4 px-6 bg-[#7a5c53] text-white rounded-xl hover:bg-[#5e453e] font-extrabold text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
              >
                {uploading ? <FaSpinner className="animate-spin" size={16} /> : <FaRegCheckCircle size={16} />}
                {uploading ? 'Processing Request' : 'Submit Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;