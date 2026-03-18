import React, { useState, useRef } from 'react';
import { useCommunity, useLocation } from '../../hooks/useCommunity';
import { ErrorMessage, SuccessMessage } from '../../components/community/CommunityUI';
import { Upload, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Community Register Page
 * For community leaders to register and create a new community
 * Protected route - requires authentication and community leader role
 */
const CommunityRegister = () => {
  const navigate = useNavigate();
  const { registerCommunity, loading, error, setError } = useCommunity();
  const { latitude, longitude, getCurrentLocation, loading: locationLoading } = useLocation();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    areaType: 'mohalla',
    description: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    address: '',
    population: '',
  });

  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const fileInputRef = useRef(null);

  const areaTypes = [
    { value: 'mohalla', label: '🏘️ Mohalla' },
    { value: 'gao', label: '🌾 Gaon (Village)' },
    { value: 'ward', label: '📍 Ward' },
    { value: 'colony', label: '🏢 Colony' },
    { value: 'village', label: '🌿 Village' },
  ];

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setValidationErrors(prev => ({
        ...prev,
        coverImage: 'Please upload a valid image (JPEG, PNG, or WebP)',
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        coverImage: 'Image size should be less than 5MB',
      }));
      return;
    }

    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Community name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.district.trim()) errors.district = 'District is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';
    if (!formData.address.trim()) errors.address = 'Address is required';

    if (latitude === null || longitude === null) {
      errors.location = 'Location is required. Please enable geolocation.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        areaType: formData.areaType,
        description: formData.description,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        address: formData.address,
        population: formData.population ? parseInt(formData.population) : 0,
        location: { type: 'Point', coordinates: [longitude, latitude] },
        coverImage: coverImage || null,
      };

      const result = await registerCommunity(submitData);
      setShowSuccess(true);

      // Clear form
      setFormData({
        name: '',
        areaType: 'mohalla',
        description: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        address: '',
        population: '',
      });
      setCoverImage(null);
      setImagePreview(null);

      // Redirect after success
      setTimeout(() => {
        navigate(`/community/${result._id}`);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to register community');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Register Your Community</h1>
          <p className="text-blue-100 text-lg">
            Create and manage your local community on our platform
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Success Message */}
          {showSuccess && (
            <SuccessMessage
              message="Community registered successfully! Redirecting..."
              onDismiss={() => setShowSuccess(false)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Community Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Community Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Green Valley Mohalla"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>

            {/* Area Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Area Type *
              </label>
              <select
                name="areaType"
                value={formData.areaType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {areaTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your community, its goals, and activities..."
                rows="4"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>

            {/* City, District and State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                />
                {validationErrors.city && <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">District *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai Suburban"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.district ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                />
                {validationErrors.district && <p className="text-red-500 text-sm mt-1">{validationErrors.district}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="e.g., Maharashtra"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              />
              {validationErrors.state && <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>}
            </div>

            {/* Pincode and Population */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="e.g., 400001"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    validationErrors.pincode
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {validationErrors.pincode && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.pincode}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Population
                </label>
                <input
                  type="number"
                  name="population"
                  value={formData.population}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main Street, New Development Colony"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.address
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {validationErrors.address && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Location (GPS) *
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    {latitude && longitude ? (
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Location captured</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Latitude: {latitude.toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Longitude: {longitude.toFixed(6)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">Click the button below to capture your location</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <MapPin size={16} />
                  {locationLoading ? 'Getting location...' : 'Capture My Location'}
                </button>

                {validationErrors.location && (
                  <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {validationErrors.location}
                  </p>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Cover Image
              </label>
              
              {imagePreview ? (
                <div className="relative mb-4">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setImagePreview(null);
                      fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <p className="text-gray-600 font-semibold text-center">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-gray-500 text-sm text-center mt-1">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {validationErrors.coverImage && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.coverImage}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering Community...' : 'Register Community'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm font-semibold mb-2">📋 What happens next?</p>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>✓ Your community will be created and you'll be the community leader</li>
              <li>✓ Admin will review and verify your community</li>
              <li>✓ Once verified, you can start creating activities and tasks</li>
              <li>✓ Invite members and build your community</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityRegister;
