// Profile validation utility
export const PROFILE_VALIDATION = {
  onlyText: (str) => str.replace(/[^a-zA-Z\s]/g, ""),
  onlyDigits: (str) => str.replace(/[^0-9]/g, ""),
  maxLength: (str, len) => str.slice(0, len),
  
  validatePhone: (phone) => {
    if (phone.length === 0) return "";
    if (!/^\d{10}$/.test(phone)) return "Phone must be exactly 10 digits";
    return "";
  },
  
  validateAddress: (address) => {
    const trimmed = address.trim();
    if (trimmed.length === 0) return "";
    if (trimmed.length < 3) return "Address must be at least 3 characters";
    if (trimmed.length > 100) return "Address limited to 100 characters";
    return "";
  },
  
  validateCity: (city) => {
    const trimmed = city.trim();
    if (trimmed.length === 0) return "";
    if (trimmed.length < 2) return "City must be at least 2 characters";
    if (trimmed.length > 50) return "City limited to 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) return "City must contain only letters";
    return "";
  },
  
  validateState: (state) => {
    const trimmed = state.trim();
    if (trimmed.length === 0) return "";
    if (trimmed.length < 2) return "State must be at least 2 characters";
    if (trimmed.length > 50) return "State limited to 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) return "State must contain only letters";
    return "";
  },

  validateBio: (bio) => {
    const trimmed = bio.trim();
    if (trimmed.length > 200) return "Bio limited to 200 characters";
    return "";
  },

  validateUrl: (url) => {
    if (!url || url.trim().length === 0) return "";
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return "";
    } catch {
      return "Please enter a valid URL";
    }
  },
};

export const toPersonalFormState = (profile) => ({
  name: profile?.name || '',
  email: profile?.email || '',
  phone: profile?.phone || '',
  address: profile?.address || '',
  city: profile?.city || '',
  state: profile?.state || '',
  bio: profile?.bio || '',
  preferredLanguage: profile?.preferredLanguage || 'English',
  timezone: profile?.timezone || 'Asia/Kolkata',
  linkedin: profile?.socialAccounts?.linkedin || '',
  twitter: profile?.socialAccounts?.twitter || '',
  facebook: profile?.socialAccounts?.facebook || '',
});
