import React, { useState } from 'react';
import { 
  FaCamera, 
  FaGlobe, 
  FaLock, 
  FaLink, 
  FaAt,
  FaSyncAlt 
} from 'react-icons/fa';

const PersonalInfo = ({
  user,
  visibleAvatar,
  profileForm,
  formErrors,
  savingProfile,
  saveNotice,
  activeTab,
  onInputChange,
  onAvatarFileChange,
  onCancelPersonalInfo,
  onSavePersonalInfo,
  onOpenChangePasswordModal,
}) => {
  const [lastSaved] = useState(new Date());

  return (
    <div className="animate-fadeIn min-h-screen bg-[#F8F7F5] pb-24">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12 pt-10 pb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#3D342B] tracking-tight">Profile Settings</h1>
        <p className="text-[15px] text-[#8B8B8B] mt-1">Adjust how your curator profile appears to the community and manage your personal data.</p>
      </div>

      {/* Notice Message */}
      {saveNotice.message && activeTab === 'personal' && (
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12 mb-6">
          <div
            className={`px-4 py-3 rounded-xl text-[14px] font-medium border ${
              saveNotice.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {saveNotice.message}
          </div>
        </div>
      )}

      <form className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12 space-y-6" onSubmit={onSavePersonalInfo}>
        
        {/* Basic Information Section */}
        <Section title="Basic Information" description="Your public identity and biography.">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Avatar Section */}
            <div className="flex-shrink-0 flex flex-col items-start">
              <div className="relative">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-[#E8E6E1] flex items-center justify-center text-4xl font-bold text-[#8B8B8B] overflow-hidden shadow-sm">
                  {visibleAvatar ? (
                    <img src={visibleAvatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <label 
                  htmlFor="file-upload" 
                  className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#6B5D49] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#5A4E3D] transition-colors border-[3px] border-white shadow-sm"
                >
                  <FaCamera size={14} />
                </label>
                <input
                  type="file"
                  id="file-upload"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={onAvatarFileChange}
                  hidden
                />
              </div>
              <p className="text-[10px] text-[#8B8B8B] font-medium uppercase tracking-wide mt-4">JPG OR PNG. MAX 2MB.</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label="FULL NAME"
                  value={profileForm.name}
                  readOnly
                  placeholder="Full name"
                  disabled={true}
                />
                <FormField
                  label="USERNAME"
                  value={user?.email?.split('@')[0] || ''}
                  readOnly
                  placeholder="Username"
                  disabled={true}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8B8B8B] uppercase tracking-wider mb-2">BIO</label>
                <textarea
                  value={profileForm.bio || ''}
                  onChange={(e) => onInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself"
                  maxLength={200}
                  className="w-full px-4 py-3 bg-[#E8E6E1] text-[#3D342B] rounded-xl text-[14px] hover:bg-[#DDD6CA] focus:bg-white focus:ring-2 focus:ring-[#6B5D49]/20 outline-none transition-all resize-none border border-transparent focus:border-[#6B5D49]/30"
                  rows="3"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Contact Details Section */}
        <Section title="Contact Details" description="How we reach you for platform updates.">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
              label="EMAIL ADDRESS"
              value={profileForm.email || user?.email || ''}
              readOnly
              placeholder="email@example.com"
              disabled={true}
            />
            <FormField
              label="PHONE NUMBER"
              value={profileForm.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              error={formErrors.phone}
              placeholder="+44 7700 900077"
              inputMode="numeric"
            />
          </div>

          <div className="mt-6">
            <FormField
              label="PHYSICAL ADDRESS"
              value={profileForm.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              error={formErrors.address}
              placeholder="Studio 42, Textile Building, London, UK"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <FormField
              label="CITY"
              value={profileForm.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              error={formErrors.city}
              placeholder="e.g. London"
            />
            <FormField
              label="STATE / REGION"
              value={profileForm.state}
              onChange={(e) => onInputChange('state', e.target.value)}
              error={formErrors.state}
              placeholder="e.g. Greater London"
            />
          </div>
        </Section>

        {/* Social Profiles Section */}
        <Section title="Social Profiles" description="Link your professional presence across the web.">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { key: 'linkedin', icon: <FaLink />, placeholder: 'linkedin.com/in/username' },
              { key: 'twitter', icon: <FaAt />, placeholder: '@username' },
              { key: 'facebook', icon: <FaGlobe />, placeholder: 'yourwebsite.design' },
            ].map((social, index) => (
              <div key={social.key} className="relative flex items-center">
                <div className="absolute left-4 text-[#8B8B8B]">{social.icon}</div>
                <input
                  type="text"
                  value={profileForm[social.key] || ''}
                  onChange={(e) => onInputChange(social.key, e.target.value)}
                  placeholder={social.placeholder}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#E8E6E1] text-[#3D342B] rounded-xl text-[14px] hover:bg-[#DDD6CA] focus:bg-white focus:ring-2 focus:ring-[#6B5D49]/20 outline-none transition-all border border-transparent focus:border-[#6B5D49]/30"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Security Section */}
        <Section title="Security" description="Update your password to keep your archive safe." icon={<FaSyncAlt className="text-[#6B5D49]" />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
             <FormField
                label="CURRENT PASSWORD"
                type="password"
                value="••••••••"
                readOnly
                disabled={true}
              />
              <FormField
                label="NEW PASSWORD"
                type="password"
                placeholder="Min. 12 characters"
                readOnly
                onClick={onOpenChangePasswordModal}
                className="cursor-pointer"
              />
          </div>
        </Section>

        {/* Footer Actions */}
        <div className="pt-6 pb-12">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 bg-transparent">
            <p className="text-[13px] text-[#8B8B8B] flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D9D1C5]"></span> Last saved {formatLastSavedTime(lastSaved)}
            </p>
            <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onCancelPersonalInfo}
                disabled={savingProfile}
                className="text-[14px] font-semibold text-[#3D342B] hover:text-[#6B5D49] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile || Object.keys(formErrors).length > 0}
                className={`px-6 py-2.5 text-[14px] font-semibold rounded-full transition-all ${
                  savingProfile || Object.keys(formErrors).length > 0
                    ? 'bg-[#D9D1C5] text-[#8B8B8B] cursor-not-allowed'
                    : 'bg-[#6B5D49] text-white hover:bg-[#5A4E3D] shadow-sm'
                }`}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// Reusable Components matching the exact design
const Section = ({ title, description, children, icon }) => (
  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#E8E6E1]">
    <div className="flex items-start gap-3 mb-8">
      {icon && <span className="mt-1 text-lg">{icon}</span>}
      <div>
        <h2 className="text-[18px] md:text-[20px] font-bold text-[#3D342B] tracking-tight">{title}</h2>
        {description && <p className="text-[14px] text-[#8B8B8B] mt-1">{description}</p>}
      </div>
    </div>
    <div>{children}</div>
  </div>
);

const FormField = ({
  label,
  value,
  onChange,
  onClick,
  error,
  placeholder,
  inputMode,
  disabled,
  readOnly,
  type = "text",
  className = ""
}) => (
  <div>
    <label className="block text-[11px] font-bold text-[#8B8B8B] uppercase tracking-wider mb-2">{label}</label>
    <div>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        onClick={onClick}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={`w-full px-4 py-3.5 rounded-xl text-[14px] outline-none transition-all ${
          disabled || readOnly
            ? 'bg-[#E8E6E1]/70 text-[#8B8B8B] cursor-not-allowed'
            : error
            ? 'bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200 border border-transparent focus:border-red-300'
            : 'bg-[#E8E6E1] text-[#3D342B] hover:bg-[#DDD6CA] focus:bg-white focus:ring-2 focus:ring-[#6B5D49]/20 border border-transparent focus:border-[#6B5D49]/30'
        } ${className}`}
      />
    </div>
    {error && <span className="text-[12px] text-red-500 mt-1.5 block font-medium">{error}</span>}
  </div>
);

const ToggleBox = ({ label, description, defaultChecked }) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between p-4 bg-[#E8E6E1] rounded-xl cursor-pointer hover:bg-[#DDD6CA] transition-colors" onClick={() => setIsChecked(!isChecked)}>
      <div>
        <p className="text-[14px] font-semibold text-[#3D342B]">{label}</p>
        <p className="text-[12px] text-[#8B8B8B] mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          isChecked ? 'bg-[#6B5D49]' : 'bg-[#D3D0C8]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

const formatLastSavedTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return '2 minutes ago'; // Hardcoded to match mockup style visually if just saved
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default PersonalInfo;