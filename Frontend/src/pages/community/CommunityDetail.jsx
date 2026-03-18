import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCommunity, useActivity, useMyResponsibilities } from '../../hooks/useCommunity';
import ActivityCard from '../../components/community/ActivityCard';
import TakeResponsibilityModal from '../../components/community/TakeResponsibilityModal';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/community/CommunityUI';
import { getDownloadUrl } from '../../services/uploadService';
import {
  MapPin, Users, Activity as ActivityIcon, ArrowLeft, Shield,
  CheckCircle, Clock, Star, UserCheck, ChevronRight
} from 'lucide-react';

const roleColor = { leader: '#7c3aed', 'co-leader': '#2563eb', coordinator: '#0891b2', volunteer: '#059669' };
const roleLabel = { leader: 'Leader', 'co-leader': 'Co-Leader', coordinator: 'Coordinator', volunteer: 'Volunteer' };

const RoleBadge = ({ role }) => (
  <span style={{
    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: (roleColor[role] || '#6b7280') + '20',
    color: roleColor[role] || '#6b7280',
  }}>
    {roleLabel[role] || role}
  </span>
);


const CommunityDetail = () => {
  const { id: communityId } = useParams();
  const navigate = useNavigate();

  const { selectedCommunity: community, loading: communityLoading, error, getCommunity } = useCommunity();
  const { activities, loading: activitiesLoading, fetchActivities } = useActivity(communityId);
  const { applyResponsibility, fetchMyResponsibilities, loading: respLoading, error: respError, setError: setRespError } = useMyResponsibilities();

  const [activeTab, setActiveTab]       = useState('details');
  const [coverUrl, setCoverUrl]         = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [activeResponsibilities, setActiveResponsibilities] = useState([]);

  const isLoggedIn = Boolean(localStorage.getItem('token'));


  useEffect(() => {
    if (!communityId) return;
    getCommunity(communityId).then(data => {
      if (data?.activeResponsibilities) setActiveResponsibilities(data.activeResponsibilities);
    });
    fetchActivities();
    if (isLoggedIn) fetchMyResponsibilities();
  }, [communityId]);

  // Resolve cover image
  useEffect(() => {
    const key = community?.coverImageKey;
    if (!key) return;
    if (key.startsWith('http')) { setCoverUrl(key); return; }
    getDownloadUrl(key).then(url => setCoverUrl(typeof url === 'string' ? url : url?.Url)).catch(() => {});
  }, [community?.coverImageKey]);

  const handleResponsibilitySubmit = async (data) => {
    await applyResponsibility(communityId, data);
  };

  if (communityLoading && !community) return <LoadingSpinner message="Loading community..." />;
  if (error && !community) return (
    <div className="container mx-auto px-4 py-8">
      <ErrorMessage message={error} onRetry={() => getCommunity(communityId)} />
    </div>
  );
  if (!community) return (
    <div className="container mx-auto px-4 py-8">
      <EmptyState message="Community not found" />
    </div>
  );

  const isVerified = community.verificationStatus === 'verified';
  const areaTypeMap = { mohalla: 'Mohalla', gao: 'Village (Gao)', ward: 'Ward', colony: 'Colony', village: 'Village', town: 'Town', other: 'Other' };

  const tabs = [
    { id: 'details',          label: 'Details' },
    { id: 'responsibilities', label: `Responsibilities${activeResponsibilities.length ? ` (${activeResponsibilities.length})` : ''}` },
    { id: 'activities',       label: `Activities${activities.length ? ` (${activities.length})` : ''}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back */}
      <div className="container mx-auto px-4 pt-4">
        <button onClick={() => navigate('/community')} className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-semibold mb-4">
          <ArrowLeft size={18} /> Back to communities
        </button>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-72 relative">
        {coverUrl && <img src={coverUrl} alt={community.name} className="w-full h-full object-cover" />}
        {isVerified && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle size={12} /> Verified
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-10 pb-16">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{community.name}</h1>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {areaTypeMap[community.areaType] || community.areaType}
                </span>
                {community.tags?.map(t => (
                  <span key={t} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">#{t}</span>
                ))}
              </div>
            </div>

            {/* CTA: Take Responsibility */}
            {isVerified && isLoggedIn && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md whitespace-nowrap"
              >
                <Shield size={16} /> Take Responsibility
              </button>
            )}
            {isVerified && !isLoggedIn && (
              <Link
                to="/login/user"
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold text-sm"
              >
                Login to Contribute
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{community.population?.toLocaleString() || 0}</p>
              <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1"><Users size={14} />Residents</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{activeResponsibilities.length}</p>
              <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1"><Shield size={14} />Volunteers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activities.length}</p>
              <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1"><ActivityIcon size={14} />Activities</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 text-gray-600">
            <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">{community.address}</p>
              <p className="text-sm">{community.city}, {community.district}, {community.state} {community.pincode}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl shadow p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === t.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── DETAILS TAB ── */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About this Community</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {community.description || 'No description provided.'}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Area Type</p>
                    <p className="font-semibold text-gray-800">{areaTypeMap[community.areaType] || community.areaType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">District</p>
                    <p className="font-semibold text-gray-800">{community.district}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">State</p>
                    <p className="font-semibold text-gray-800">{community.state}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Status</p>
                    <p className={`font-semibold ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current leader highlight */}
              {community.currentLeaderName && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Star size={22} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-500 uppercase tracking-wide font-semibold mb-0.5">Community Leader</p>
                    <p className="text-lg font-bold text-purple-800">{community.currentLeaderName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: quick actions */}
            <div className="space-y-4">
              {isVerified && (
                <div className="bg-white rounded-2xl shadow p-5">
                  <h3 className="font-bold text-gray-800 mb-4">Get Involved</h3>
                  {isLoggedIn ? (
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-3 transition-all"
                    >
                      <Shield size={16} /> Take Responsibility
                    </button>
                  ) : (
                    <Link to="/login/user" className="block w-full bg-blue-500 text-white text-center py-3 rounded-xl font-semibold text-sm mb-3">
                      Login to Contribute
                    </Link>
                  )}
                  <Link
                    to="/community/my-responsibilities"
                    className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    My Applications <ChevronRight size={14} />
                  </Link>
                </div>
              )}

              {!isVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-yellow-700 font-semibold mb-2">
                    <Clock size={16} /> Awaiting Verification
                  </div>
                  <p className="text-yellow-600 text-sm">This community is pending admin verification. Responsibility applications open after verification.</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <p className="text-blue-800 text-sm font-semibold mb-1">💡 How it works</p>
                <ul className="text-blue-700 text-xs space-y-1.5 leading-relaxed">
                  <li>• Apply for a role in this community</li>
                  <li>• Admin reviews your application</li>
                  <li>• Once approved, start contributing</li>
                  <li>• Submit completion reports for your work</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── RESPONSIBILITIES TAB ── */}
        {activeTab === 'responsibilities' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Active Volunteers</h2>
              {isVerified && isLoggedIn && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Shield size={14} /> Apply to Contribute
                </button>
              )}
            </div>

            {activeResponsibilities.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Shield size={28} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No active volunteers yet</h3>
                <p className="text-gray-400 text-sm mb-6">Be the first to take responsibility for this community!</p>
                {isVerified && isLoggedIn && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm"
                  >
                    Take Responsibility
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeResponsibilities.map((r, i) => (
                  <div key={r._id || i} className="bg-white rounded-2xl shadow p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: (roleColor[r.role] || '#6b7280') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <UserCheck size={20} color={roleColor[r.role] || '#6b7280'} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{r.takenByName}</p>
                          <p className="text-gray-400 text-xs">{r.takenByType === 'ngo' ? 'NGO Representative' : 'Community Member'}</p>
                        </div>
                      </div>
                      <RoleBadge role={r.role} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Link to my applications */}
            <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-indigo-800 text-sm">Want to see your applications?</p>
                <p className="text-indigo-600 text-xs mt-0.5">Track the status of all your responsibility applications</p>
              </div>
              <Link to="/community/my-responsibilities" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm whitespace-nowrap">
                My Applications <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* ── ACTIVITIES TAB ── */}
        {activeTab === 'activities' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Community Activities</h2>
              {isLoggedIn && (
                <Link
                  to={`/community/${communityId}/activities/create`}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  + Post Activity
                </Link>
              )}
            </div>
            {activitiesLoading && activities.length === 0 ? (
              <LoadingSpinner message="Loading activities..." />
            ) : activities.length === 0 ? (
              <EmptyState message="No activities yet for this community." />
            ) : (
              <div className="grid gap-5">
                {activities.map(activity => (
                  <ActivityCard
                    key={activity._id}
                    activity={activity}
                    communityId={communityId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Take Responsibility Modal */}
      {showModal && (
        <TakeResponsibilityModal
          community={community}
          loading={respLoading}
          error={respError}
          onClose={() => { setShowModal(false); setRespError(null); }}
          onSubmit={handleResponsibilitySubmit}
        />
      )}
    </div>
  );
};

export default CommunityDetail;
