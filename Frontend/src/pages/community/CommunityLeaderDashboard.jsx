import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Activity, CheckCircle, AlertCircle, Plus,
  BarChart3, Shield, Calendar, MapPin, RefreshCw,
} from 'lucide-react';
import communityLeaderService from '../../services/communityLeaderService';
import ActivityCard from '../../components/community/ActivityCard';
import ResponsibilityCard from '../../components/community/ResponsibilityCard';
import { LoadingSpinner } from '../../components/community/CommunityUI';

const TYPE_LABELS = {
  cleanup: 'Cleanup', medical_camp: 'Medical Camp', education: 'Education',
  food_distribution: 'Food Distribution', infrastructure: 'Infrastructure',
  awareness: 'Awareness', tree_plantation: 'Tree Plantation',
  skill_development: 'Skill Dev', sanitation: 'Sanitation',
  women_empowerment: 'Women Empowerment', child_welfare: 'Child Welfare', other: 'Other',
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-800 mb-1">{value ?? 0}</p>
    <p className="text-sm font-semibold text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const CommunityLeaderDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [community, setCommunity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);
  const [memberFilter, setMemberFilter] = useState('all');

  const token = localStorage.getItem('token');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await communityLeaderService.getDashboard();
      const data = res?.data ?? res;
      setDashboard(data);
      setCommunity(data.community);
    } catch (err) {
      setError(err.message || err.error || 'Failed to load dashboard. Make sure you have an active responsibility.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setTabLoading(true);
    try {
      const res = await communityLeaderService.getActivities();
      const list = res?.data?.activities ?? res?.activities ?? [];
      setActivities(Array.isArray(list) ? list : []);
    } catch {
      // ignore
    } finally {
      setTabLoading(false);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    setTabLoading(true);
    try {
      const res = await communityLeaderService.getMembers();
      const list = res?.data?.responsibilities ?? res?.responsibilities ?? res?.data ?? [];
      setMembers(Array.isArray(list) ? list : []);
    } catch {
      // ignore
    } finally {
      setTabLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    loadDashboard();
  }, [token, loadDashboard]);

  useEffect(() => {
    if (activeTab === 'activities') loadActivities();
    if (activeTab === 'members') loadMembers();
  }, [activeTab]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Login Required</h2>
          <Link to="/auth/login" className="bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">Log In</Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard Unavailable</h2>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={loadDashboard} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
              <RefreshCw size={15} /> Retry
            </button>
            <Link to="/community" className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">
              Browse Communities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats ?? {};
  const recentActivities = dashboard?.recentActivities ?? [];
  const communityId = community?._id;

  const filteredMembers = memberFilter === 'all'
    ? members
    : members.filter(m => m.status === memberFilter);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'activities', label: `Activities${stats.totalActivities ? ` (${stats.totalActivities})` : ''}`, icon: Activity },
    { id: 'members', label: `Members${stats.activeMembers ? ` (${stats.activeMembers})` : ''}`, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide mb-1">
                Community Leader Dashboard
              </p>
              <h1 className="text-3xl font-bold">{community?.name || 'Your Community'}</h1>
              <p className="text-blue-100 text-sm mt-1">
                {community?.city}, {community?.state} ·{' '}
                <span className={community?.verificationStatus === 'verified' ? 'text-green-300' : 'text-yellow-300'}>
                  {community?.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending Verification'}
                </span>
              </p>
            </div>
            <Link
              to={communityId ? `/community/${communityId}/activities/create` : '#'}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Plus size={16} /> New Activity
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users}        label="Active Members"     value={stats.activeMembers}     color="bg-blue-500"   sub={stats.pendingMembers > 0 ? `${stats.pendingMembers} pending` : null} />
          <StatCard icon={Activity}     label="Total Activities"   value={stats.totalActivities}   color="bg-purple-500" sub={stats.ongoingActivities > 0 ? `${stats.ongoingActivities} ongoing` : null} />
          <StatCard icon={CheckCircle}  label="Completed"          value={stats.completedActivities} color="bg-green-500" />
          <StatCard icon={AlertCircle}  label="Pending Verification" value={stats.pendingVerification} color="bg-orange-500" sub="Admin review needed" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 flex-1 min-w-max py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === t.id ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-800">Recent Activities</h2>
                  <button onClick={() => setActiveTab('activities')} className="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                    View All →
                  </button>
                </div>
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No activities yet</p>
                    <Link to={communityId ? `/community/${communityId}/activities/create` : '#'} className="mt-3 inline-flex items-center gap-1 text-blue-500 text-sm font-semibold hover:underline">
                      <Plus size={14} /> Create first activity
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map(a => (
                      <div key={a._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{a.title}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                            <span>{TYPE_LABELS[a.activityType] || a.activityType}</span>
                            {a.plannedDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {new Date(a.plannedDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            a.status === 'completed' ? 'bg-green-100 text-green-700' :
                            a.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                            a.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>{a.status}</span>
                          {a.adminVerified && <Shield size={13} className="text-teal-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2.5">
                  <Link
                    to={communityId ? `/community/${communityId}/activities/create` : '#'}
                    className="flex items-center gap-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Plus size={16} /> Create Activity
                  </Link>
                  <Link
                    to="/community/my-activities"
                    className="flex items-center gap-3 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Activity size={16} /> My Activities
                  </Link>
                  <Link
                    to="/community/my-responsibilities"
                    className="flex items-center gap-3 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Shield size={16} /> My Responsibilities
                  </Link>
                  {communityId && (
                    <Link
                      to={`/community/${communityId}`}
                      className="flex items-center gap-3 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors"
                    >
                      <MapPin size={16} /> View Community
                    </Link>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <p className="text-blue-800 text-sm font-semibold mb-2">💡 Tips</p>
                <ul className="text-blue-700 text-xs space-y-1.5 leading-relaxed">
                  <li>• Mark activities as complete to build community stats</li>
                  <li>• Completed + verified activities appear in the public feed</li>
                  <li>• Pending members need admin approval</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITIES TAB ── */}
        {activeTab === 'activities' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">All Activities</h2>
              <Link
                to={communityId ? `/community/${communityId}/activities/create` : '#'}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                <Plus size={15} /> New Activity
              </Link>
            </div>
            {tabLoading ? (
              <LoadingSpinner message="Loading activities..." />
            ) : activities.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <Activity size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No activities yet</p>
                <Link to={communityId ? `/community/${communityId}/activities/create` : '#'} className="bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
                  Create First Activity
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activities.map(activity => (
                  <ActivityCard key={activity._id} activity={activity} communityId={communityId} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {activeTab === 'members' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-800">Community Members</h2>
              <div className="flex gap-2">
                {['all', 'active', 'pending', 'completed', 'revoked'].map(f => (
                  <button
                    key={f}
                    onClick={() => setMemberFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      memberFilter === f ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {tabLoading ? (
              <LoadingSpinner message="Loading members..." />
            ) : filteredMembers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <Users size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">No {memberFilter === 'all' ? '' : memberFilter} members</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMembers.map(m => (
                  <ResponsibilityCard key={m._id} responsibility={m} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityLeaderDashboard;
