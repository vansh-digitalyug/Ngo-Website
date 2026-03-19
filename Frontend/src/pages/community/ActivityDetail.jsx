import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Users, Shield, CheckCircle,
  Clock, XCircle, Edit2, Trash2, Flag, Image, Upload, X,
} from 'lucide-react';
import { useActivity } from '../../hooks/useCommunity';
import { generateUploadUrl, uploadfileToS3, getDownloadUrl } from '../../services/uploadService';

const TYPE_LABELS = {
  cleanup: '🧹 Cleanup',
  medical_camp: '🏥 Medical Camp',
  education: '📚 Education',
  food_distribution: '🍱 Food Distribution',
  infrastructure: '🏗️ Infrastructure',
  awareness: '📢 Awareness',
  tree_plantation: '🌱 Tree Plantation',
  skill_development: '🛠️ Skill Development',
  sanitation: '🚿 Sanitation',
  women_empowerment: '👩 Women Empowerment',
  child_welfare: '👶 Child Welfare',
  other: '📌 Other',
};

const STATUS_CONFIG = {
  planned:   { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Planned' },
  ongoing:   { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock, label: 'Ongoing' },
  completed: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
};

const ActivityDetail = () => {
  const { communityId, activityId } = useParams();
  const navigate = useNavigate();
  const { getActivity, updateActivity, deleteActivity, completeActivity, loading, error, setError } = useActivity(communityId);

  const [activity, setActivity] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const [completing, setCompleting] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]); // { file, preview }
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef(null);

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    getActivity(activityId).then(data => {
      if (data) setActivity(data);
    });
  }, [activityId]);

  const isConductor = activity && (
    activity.conductedBy === currentUserId ||
    activity.conductedBy?._id === currentUserId
  );

  // Resolve S3 keys → signed URLs for existing media
  useEffect(() => {
    if (!activity?.mediaKeys?.length) return;
    Promise.all(activity.mediaKeys.map(key => getDownloadUrl(key).catch(() => null)))
      .then(urls => setPhotoUrls(urls.filter(Boolean)));
  }, [activity?.mediaKeys]);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - (activity?.mediaKeys?.length ?? 0) - newPhotos.length;
    const toAdd = files.slice(0, remaining).filter(f => f.type.startsWith('image/'));
    setNewPhotos(prev => [...prev, ...toAdd.map(file => ({ file, preview: URL.createObjectURL(file) }))]);
    e.target.value = '';
  };

  const removeNewPhoto = (idx) => {
    setNewPhotos(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx); });
  };

  const handleUploadPhotos = async () => {
    if (!newPhotos.length) return;
    setPhotoUploading(true);
    try {
      const keys = [];
      for (const { file } of newPhotos) {
        const { uploadUrl, key } = await generateUploadUrl(file.type, file.name, 'activity-photos');
        await uploadfileToS3(file, uploadUrl);
        keys.push(key);
      }
      const existingKeys = activity.mediaKeys ?? [];
      const updated = await updateActivity(activityId, { mediaKeys: [...existingKeys, ...keys] });
      setActivity(updated);
      setNewPhotos([]);
    } catch {
      // error set in hook
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const updated = await completeActivity(activityId, { completionNote });
      setActivity(updated);
      setShowCompleteModal(false);
    } catch {
      // error in hook
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this activity? This cannot be undone.')) return;
    try {
      await deleteActivity(activityId);
      navigate(`/community/${communityId}`);
    } catch {
      // error in hook
    }
  };

  if (loading && !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading activity…</p>
        </div>
      </div>
    );
  }

  if (!activity && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Activity not found.</p>
          <Link to={`/community/${communityId}`} className="text-emerald-600 hover:underline text-sm">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[activity?.status] || STATUS_CONFIG.planned;
  const StatusIcon = statusCfg.icon;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—';
  const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-10">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            to={`/community/${communityId}`}
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Community
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                  {TYPE_LABELS[activity.activityType] || activity.activityType}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusCfg.color}`}>
                  <StatusIcon size={11} /> {statusCfg.label}
                </span>
                {activity.adminVerified && (
                  <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Shield size={11} /> Admin Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{activity.title}</h1>
              {activity.conductedByName && (
                <p className="text-emerald-100 text-sm mt-1">By {activity.conductedByName}</p>
              )}
            </div>

            {/* Conductor actions */}
            {isConductor && (
              <div className="flex gap-2">
                {(activity.status === 'planned' || activity.status === 'ongoing') && (
                  <>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setShowCompleteModal(true)}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                    >
                      <CheckCircle size={14} /> Mark Complete
                    </button>
                  </>
                )}
                {activity.status !== 'completed' && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">✕</button>
          </div>
        )}

        {/* Main info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {activity.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">About</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{activity.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={<Calendar size={16} className="text-blue-500" />} label="Planned Date" value={formatDate(activity.plannedDate)} />
            {activity.completedDate && (
              <InfoRow icon={<CheckCircle size={16} className="text-green-500" />} label="Completed On" value={formatDate(activity.completedDate)} />
            )}
            {activity.specificLocation && (
              <InfoRow icon={<MapPin size={16} className="text-red-500" />} label="Location" value={activity.specificLocation} />
            )}
            <InfoRow icon={<Users size={16} className="text-emerald-500" />} label="Volunteers" value={activity.volunteersCount || 0} />
            <InfoRow icon={<Users size={16} className="text-blue-500" />} label="Beneficiaries" value={activity.beneficiariesCount || 0} />
          </div>
        </div>

        {/* Photo gallery */}
        {(photoUrls.length > 0 || (isConductor && activity.status !== 'cancelled')) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Image size={14} /> Photos {activity.mediaKeys?.length ? `(${activity.mediaKeys.length})` : ''}
              </h3>
            </div>

            {/* Existing photos */}
            {photoUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {photoUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden block">
                    <img src={url} alt={`Activity photo ${i + 1}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                  </a>
                ))}
              </div>
            )}

            {/* Upload new photos (conductor only, not cancelled) */}
            {isConductor && activity.status !== 'cancelled' && (activity.mediaKeys?.length ?? 0) < 5 && (
              <div>
                {newPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {newPhotos.map((p, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={p.preview} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeNewPhoto(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-400 hover:text-emerald-600 text-sm transition-colors"
                  >
                    <Upload size={16} /> Add Photos
                  </button>
                  {newPhotos.length > 0 && (
                    <button
                      onClick={handleUploadPhotos}
                      disabled={photoUploading}
                      className="px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold rounded-xl text-sm transition-colors"
                    >
                      {photoUploading ? 'Uploading…' : 'Upload'}
                    </button>
                  )}
                </div>
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoSelect} className="hidden" />
              </div>
            )}

            {photoUrls.length === 0 && newPhotos.length === 0 && (
              <p className="text-gray-400 text-sm">No photos yet.</p>
            )}
          </div>
        )}

        {/* Completion note */}
        {activity.completionNote && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Flag size={14} /> Completion Note
            </h3>
            <p className="text-green-800 text-sm leading-relaxed">{activity.completionNote}</p>
          </div>
        )}

        {/* Admin verification */}
        {activity.adminVerified && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Shield size={14} /> Admin Verified
            </h3>
            {activity.adminNote && <p className="text-teal-800 text-sm">{activity.adminNote}</p>}
            {activity.verifiedAt && <p className="text-teal-600 text-xs mt-1">Verified on {formatDateTime(activity.verifiedAt)}</p>}
          </div>
        )}

        {/* Leader feedback */}
        {activity.leaderFeedback && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">Leader Feedback</h3>
            <p className="text-blue-800 text-sm leading-relaxed">{activity.leaderFeedback}</p>
          </div>
        )}
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Mark Activity as Completed</h3>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Completion Note (optional)</label>
            <textarea
              value={completionNote}
              onChange={e => setCompletionNote(e.target.value)}
              rows={4}
              placeholder="How did it go? What was achieved? Any key observations…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                {completing ? 'Saving…' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditActivityModal
          activity={activity}
          onClose={() => setShowEditModal(false)}
          onSave={async (data) => {
            const updated = await updateActivity(activityId, data);
            setActivity(updated);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-gray-800 text-sm font-semibold">{value}</p>
    </div>
  </div>
);

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

const EditActivityModal = ({ activity, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: activity.title || '',
    description: activity.description || '',
    activityType: activity.activityType || 'cleanup',
    specificLocation: activity.specificLocation || '',
    volunteersCount: activity.volunteersCount ?? '',
    beneficiariesCount: activity.beneficiariesCount ?? '',
    status: activity.status || 'planned',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) { setErr('Title is required'); return; }
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        activityType: form.activityType,
        specificLocation: form.specificLocation.trim(),
        volunteersCount: form.volunteersCount !== '' ? Number(form.volunteersCount) : 0,
        beneficiariesCount: form.beneficiariesCount !== '' ? Number(form.beneficiariesCount) : 0,
        status: form.status,
      });
    } catch (e) {
      setErr(e.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Activity</h3>
        {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Title *</label>
            <input name="title" value={form.title} onChange={handle} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Type</label>
              <select name="activityType" value={form.activityType} onChange={handle} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white">
                {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Status</label>
              <select name="status" value={form.status} onChange={handle} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white">
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Location</label>
            <input name="specificLocation" value={form.specificLocation} onChange={handle} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Volunteers</label>
              <input type="number" name="volunteersCount" value={form.volunteersCount} onChange={handle} min={0} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Beneficiaries</label>
              <input type="number" name="beneficiariesCount" value={form.beneficiariesCount} onChange={handle} min={0} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-2.5 rounded-xl text-sm font-bold transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;
