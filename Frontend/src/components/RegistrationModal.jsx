import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerForEvent, clearError, clearSuccess } from '../store/slices/registrationSlice';
import { Loader2, AlertCircle, CheckCircle, X } from 'lucide-react';

function RegistrationModal({ event, isOpen, onClose, isRegistered }) {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector(state => state.registration);
  
  const [formData, setFormData] = useState({
    eventId: event._id,
    fullName: '',
    email: '',
    phone: '',
    registrationType: 'individual',
    additionalInfo: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Update eventId when event changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, eventId: event._id }));
  }, [event._id]);

  // Clear error on component unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Show success message and close modal
  useEffect(() => {
    if (success) {
      setShowSuccess(true);

      // Close modal and clear state after showing success message
      // Parent component will re-check registration when modal closes
      const closeTimer = setTimeout(() => {
        onClose();
        setShowSuccess(false);
        dispatch(clearSuccess());
        // Reset form when successful
        setFormData({
          eventId: event._id,
          fullName: '',
          email: '',
          phone: '',
          registrationType: 'individual',
          additionalInfo: ''
        });
      }, 1500);

      return () => {
        clearTimeout(closeTimer);
      };
    }
  }, [success, event._id, onClose, dispatch]);

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Valid email is required';
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Valid phone number (min 10 digits) is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    // ✅ Prevent changes if already registered
    if (isRegistered) return;
    
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Prevent form submission if already registered
    if (isRegistered) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    dispatch(registerForEvent(formData));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with animation */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal with smooth animation */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none ${
          isOpen ? 'pointer-events-auto' : ''
        }`}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out ${
            isOpen
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Header with close button */}
          <div className="bg-gradient-to-r from-[#4A3F35] to-[#5A4F45] text-white p-6 flex items-center justify-between sticky top-0 z-10">
            <h2 className="text-xl font-bold">Register for Event</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {/* Event Title */}
            <div className="mb-6 pb-4 border-b-2 border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 line-clamp-2 mb-1">
                {event.title}
              </h3>
              <p className="text-sm text-stone-600">Register below to secure your spot</p>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800">Registration Successful!</p>
                  <p className="text-sm text-green-700">Check your email for confirmation</p>
                </div>
              </div>
            )}

            {/* ✅ ALREADY REGISTERED MESSAGE */}
            {isRegistered && !showSuccess && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-bold">You are already registered for this event</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={loading || showSuccess || isRegistered}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg transition-colors duration-200 focus:outline-none ${
                    formErrors.fullName
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-stone-300 focus:border-[#9B7341] hover:border-stone-400'
                  } disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed`}
                  placeholder="Your full name"
                />
                {formErrors.fullName && (
                  <p className="text-xs text-red-600 font-medium">{formErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || showSuccess || isRegistered}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg transition-colors duration-200 focus:outline-none ${
                    formErrors.email
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-stone-300 focus:border-[#9B7341] hover:border-stone-400'
                  } disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed`}
                  placeholder="your@email.com"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-600 font-medium">{formErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading || showSuccess || isRegistered}
                  className={`w-full px-4 py-2.5 border-2 rounded-lg transition-colors duration-200 focus:outline-none ${
                    formErrors.phone
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-stone-300 focus:border-[#9B7341] hover:border-stone-400'
                  } disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed`}
                  placeholder="+91 9876 543210"
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-600 font-medium">{formErrors.phone}</p>
                )}
              </div>

              {/* Registration Type */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700">
                  Register As
                </label>
                <select
                  name="registrationType"
                  value={formData.registrationType}
                  onChange={handleChange}
                  disabled={loading || showSuccess || isRegistered}
                  className="w-full px-4 py-2.5 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#9B7341] hover:border-stone-400 transition-colors duration-200 disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed"
                >
                  <option value="individual">Individual</option>
                  <option value="ngo">Organization/NGO</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-700">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  disabled={loading || showSuccess || isRegistered}
                  className="w-full px-4 py-2.5 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-[#9B7341] hover:border-stone-400 transition-colors duration-200 resize-none disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed"
                  placeholder="Any special requirements or notes..."
                  rows="3"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 mt-6 border-t-2 border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading || showSuccess}
                  className="flex-1 px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-900 font-bold rounded-lg transition-colors duration-200 disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed"
                >
                  {isRegistered ? 'Close' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading || showSuccess || isRegistered}
                  className={`flex-1 px-4 py-2.5 bg-gradient-to-r from-[#9B7341] to-[#8B6838] hover:from-[#8B6838] hover:to-[#7B5828] text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    loading ? 'shadow-lg' : ''
                  }`}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {isRegistered ? 'Already Registered' : (loading ? 'Registering...' : 'Register Now')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegistrationModal;
