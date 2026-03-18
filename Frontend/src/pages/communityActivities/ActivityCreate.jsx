import { useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, FileText, Tag, Image, X, Upload } from 'lucide-react';
import { useActivity } from '../../hooks/useCommunity';
import { generateUploadUrl, uploadfileToS3 } from '../../services/uploadService';

const ACTIVITY_TYPES = [
  { value: 'cleanup', label: '🧹 Cleanup Drive' },
  { value: 'medical_camp', label: '🏥 Medical Camp' },
  { value: 'education', label: '📚 Education' },
  { value: 'food_distribution', label: '🍱 Food Distribution' },
  { value: 'infrastructure', label: '🏗️ Infrastructure' },
  { value: 'awareness', label: '📢 Awareness Campaign' },
  { value: 'tree_plantation', label: '🌱 Tree Plantation' },
  { value: 'skill_development', label: '🛠️ Skill Development' },
  { value: 'sanitation', label: '🚿 Sanitation' },
  { value: 'women_empowerment', label: '👩 Women Empowerment' },
  { value: 'child_welfare', label: '👶 Child Welfare' },
  { value: 'other', label: '📌 Other' },
];

const MAX_PHOTOS = 5;

const ActivityCreate = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { createActivity, loading, error, setError } = useActivity(communityId);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activityType: 'cleanup',
    plannedDate: '',
    plannedTime: '09:00',
    specificLocation: '',
    volunteersCount: '',
    beneficiariesCount: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState([]); // [{ file, preview }]
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, remaining).filter(f => f.type.startsWith('image/'));
    const newPhotos = toAdd.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.activityType) errs.activityType = 'Activity type is required';
    if (!formData.plannedDate) errs.plannedDate = 'Date is required';
    else {
      const dt = new Date(`${formData.plannedDate}T${formData.plannedTime}`);
      if (dt <= new Date()) errs.plannedDate = 'Planned date must be in the future';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    let mediaKeys = [];
    try {
      // Upload photos to S3 first
      for (const { file } of photos) {
        const { uploadUrl, key } = await generateUploadUrl(file.type, file.name, 'activity-photos');
        await uploadfileToS3(file, uploadUrl);
        mediaKeys.push(key);
      }
    } catch {
      setError('Failed to upload photos. Please try again.');
      setUploading(false);
      return;
    }
    setUploading(false);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      activityType: formData.activityType,
      plannedDate: new Date(`${formData.plannedDate}T${formData.plannedTime}`).toISOString(),
      specificLocation: formData.specificLocation.trim(),
      volunteersCount: formData.volunteersCount ? Number(formData.volunteersCount) : 0,
      beneficiariesCount: formData.beneficiariesCount ? Number(formData.beneficiariesCount) : 0,
      ...(mediaKeys.length > 0 && { mediaKeys }),
    };

    try {
      const result = await createActivity(payload);
      setSuccess(true);
      setTimeout(() => navigate(`/community/${communityId}/activities/${result._id}`), 1500);
    } catch {
      // error already set in hook
    }
  };

  const isSubmitting = loading || uploading;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Activity Created!</h2>
          <p className="text-gray-500">Redirecting to activity details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-10">
        <div className="max-w-2xl mx-auto px-4">
          <Link
            to={`/community/${communityId}`}
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Community
          </Link>
          <h1 className="text-3xl font-bold">Create Activity</h1>
          <p className="text-emerald-100 mt-1">Plan and schedule a new community activity</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex justify-between items-start">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4 font-bold">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={15} className="text-emerald-500" /> Activity Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Monthly Cleanup Drive at River Bank"
              maxLength={150}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm ${
                fieldErrors.title ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-emerald-300'
              }`}
            />
            {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What will happen, why it matters, what participants should bring…"
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm resize-none"
            />
          </div>

          {/* Activity Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Tag size={15} className="text-emerald-500" /> Activity Type *
            </label>
            <select
              name="activityType"
              value={formData.activityType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm bg-white"
            >
              {ACTIVITY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={15} className="text-emerald-500" /> Planned Date *
              </label>
              <input
                type="date"
                name="plannedDate"
                value={formData.plannedDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 text-sm ${
                  fieldErrors.plannedDate ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-emerald-300'
                }`}
              />
              {fieldErrors.plannedDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.plannedDate}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Time</label>
              <input
                type="time"
                name="plannedTime"
                value={formData.plannedTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={15} className="text-emerald-500" /> Specific Location
            </label>
            <input
              type="text"
              name="specificLocation"
              value={formData.specificLocation}
              onChange={handleChange}
              placeholder="e.g., River Bank near Old Bridge, Ward 5"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
            />
          </div>

          {/* Impact estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users size={15} className="text-emerald-500" /> Volunteers (est.)
              </label>
              <input
                type="number"
                name="volunteersCount"
                value={formData.volunteersCount}
                onChange={handleChange}
                min={0}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users size={15} className="text-blue-500" /> Beneficiaries (est.)
              </label>
              <input
                type="number"
                name="beneficiariesCount"
                value={formData.beneficiariesCount}
                onChange={handleChange}
                min={0}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
              />
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Image size={15} className="text-emerald-500" /> Photos ({photos.length}/{MAX_PHOTOS})
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl py-4 flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
              >
                <Upload size={20} />
                <span className="text-xs font-semibold">Click to add photos</span>
                <span className="text-xs">JPG, PNG, WebP — up to 5 photos</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            {uploading ? 'Uploading photos…' : loading ? 'Creating…' : 'Create Activity'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Activity will be reviewed by admin before appearing in the public feed.
        </p>
      </div>
    </div>
  );
};

export default ActivityCreate;
