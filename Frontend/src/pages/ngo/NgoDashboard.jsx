import { useState, useEffect, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  Image, 
  Clock, 
  Heart, 
  Upload, 
  Edit, 
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { API_BASE_URL } from './NgoLayout';

export default function NgoDashboard() {
  const { ngoData } = useOutletContext();
  const [stats, setStats] = useState({
    totalGalleryItems: 0,
    totalDonations: 0,
    profileViews: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const backendStats = data.data?.stats || {};
        setStats({
          totalGalleryItems: backendStats.gallery?.total || 0,
          pendingGalleryItems: backendStats.gallery?.pending || 0,
          approvedGalleryItems: backendStats.gallery?.approved || 0,
          totalDonations: backendStats.donations?.total || 0,
          donationAmount: backendStats.donations?.amount || 0,
          profileViews: 0
        });
        
        const recentData = data.data?.recent || {};
        const activities = [];
        
        if (recentData.gallery) {
          recentData.gallery.forEach(item => {
            activities.push({
              type: 'gallery',
              title: `Uploaded: ${item.title}`,
              status: item.approvalStatus,
              time: item.createdAt
            });
          });
        }
        

        
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActivity(activities.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-10 h-10 border-4 border-[#e5e5e5] border-t-[#6c5d46] rounded-full animate-spin"></div>
        <p className="text-[#666666] font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] p-4 sm:p-6 lg:p-8 font-sans text-[#2c2c2c] selection:bg-[#eaddc8] selection:text-[#2c2c2c]">
      {/* Welcome Header */}
      <header className="mb-8 md:mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#222222]">
              {greeting}, {ngoData?.ngoName?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-[#6c6c6c] text-sm sm:text-base font-medium">
              The horizon is clear. All systems running smoothly today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to="/ngo/gallery" 
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all duration-200 shadow-sm"
            >
              <Upload size={16} />
              Add Content
            </Link>
            <Link 
              to="/ngo/profile" 
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              <Edit size={16} />
              Edit Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        
        {/* Highlight Card */}
        <div className="bg-[#eaddc8] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[170px] relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-[#6c5d46] bg-white/50 px-3 py-1.5 rounded-full">
              Growth Overview
            </span>
            <Image size={20} className="text-[#6c5d46] opacity-80" />
          </div>
          <div className="relative z-10 mt-2">
            <p className="text-sm font-semibold text-[#5a4d3a] mb-1">Total Gallery Items</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-extrabold text-[#222222]">{stats.totalGalleryItems || 0}</h2>
            </div>
            <Link to="/ngo/gallery" className="mt-3 text-xs font-bold text-[#6c5d46] hover:text-[#453b2c] flex items-center transition-colors">
              Manage Gallery <ChevronRight size={14} className="ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Standard Stat Cards */}




        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[170px]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[#f8f7f5] rounded-xl text-[#6c5d46]">
              <Heart size={20} />
            </div>
          </div>
          <div>
            <span className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1">Total Donations</span>
            <div className="text-3xl font-extrabold text-[#222222] mb-2">₹{(stats.totalDonations || 0).toLocaleString('en-IN')}</div>
            <div className="text-xs font-semibold text-[#888888] mt-auto">
              Lifetime contributions
            </div>
          </div>
        </div>

      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column (Spans 2 columns on XL screens) */}
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Quick Actions Grid */}
          <section>
            <h2 className="text-lg font-bold text-[#222222] mb-4 px-1">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/ngo/gallery" className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#eaddc8] transition-all duration-300 relative overflow-hidden">
                <div className="p-3.5 bg-[#f8f7f5] rounded-xl text-[#6c5d46] group-hover:bg-[#6c5d46] group-hover:text-white transition-colors duration-300 mb-4">
                  <Upload size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#222222] mb-1">Upload Photos</h3>
                <p className="text-xs font-medium text-[#888888] line-clamp-2">Add new images to your gallery</p>
                <ArrowUpRight size={18} className="absolute top-5 right-5 text-gray-300 group-hover:text-[#6c5d46] transition-colors" />
              </Link>



              <Link to="/ngo/profile" className="group flex flex-col items-start p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#eaddc8] transition-all duration-300 relative overflow-hidden">
                <div className="p-3.5 bg-[#f8f7f5] rounded-xl text-[#6c5d46] group-hover:bg-[#6c5d46] group-hover:text-white transition-colors duration-300 mb-4">
                  <Edit size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#222222] mb-1">Update Profile</h3>
                <p className="text-xs font-medium text-[#888888] line-clamp-2">Edit organization details</p>
                <ArrowUpRight size={18} className="absolute top-5 right-5 text-gray-300 group-hover:text-[#6c5d46] transition-colors" />
              </Link>
            </div>
          </section>

          {/* Recent Activity List */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-[#222222]">Recent Activity</h2>
              <span className="text-xs font-bold text-[#6c5d46] hover:underline cursor-pointer uppercase tracking-wider">View All</span>
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-6">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex gap-4 items-start group">
                    {/* Clean dot indicator mirroring the reference image */}
                    <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-[#6c5d46] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div>
                      <h4 className="text-sm font-bold text-[#222222] leading-tight">{activity.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-[13px] font-medium text-[#888888]">{activity.description || 'System Update'}</p>
                        <span className="text-[13px] text-[#cccccc]">•</span>
                        <span className="text-[13px] font-medium text-[#888888]">{formatTime(activity.time)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-[#f8f7f5] rounded-xl">
                <Activity size={32} className="text-[#d5cfc4] mb-3" />
                <h4 className="text-sm font-bold text-[#222222]">No recent activity</h4>
                <p className="text-xs font-medium text-[#888888] mt-1">Your organization's activities will appear here</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="xl:col-span-1 space-y-6 lg:space-y-8">
          
          {/* Organization Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#eaddc8] text-[#6c5d46] flex items-center justify-center text-xl font-bold shrink-0">
                {ngoData?.ngoName?.charAt(0) || 'N'}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#222222] leading-tight">{ngoData?.ngoName || 'Your NGO'}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5a6b46] mt-1 bg-[#f0f4ea] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  <CheckCircle2 size={10} strokeWidth={3} /> Verified
                </span>
              </div>
            </div>
            
            <div className="space-y-3.5 mb-6">
              {ngoData?.state && (
                <div className="flex items-center gap-3 text-sm font-medium text-[#6c6c6c]">
                  <MapPin size={16} className="text-[#c4bcaf]" />
                  <span>{ngoData.city ? `${ngoData.city}, ` : ''}{ngoData.state}</span>
                </div>
              )}
              {ngoData?.email && (
                <div className="flex items-center gap-3 text-sm font-medium text-[#6c6c6c]">
                  <Mail size={16} className="text-[#c4bcaf]" />
                  <span className="truncate">{ngoData.email}</span>
                </div>
              )}
              {ngoData?.phone && (
                <div className="flex items-center gap-3 text-sm font-medium text-[#6c6c6c]">
                  <Phone size={16} className="text-[#c4bcaf]" />
                  <span>{ngoData.phone}</span>
                </div>
              )}
            </div>

            <Link to="/ngo/profile" className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-[#f8f7f5] text-[#222222] rounded-xl text-sm font-bold hover:bg-[#eaddc8] hover:text-[#6c5d46] transition-colors">
              View Full Profile <ExternalLink size={14} />
            </Link>
          </div>

          {/* Performance Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-[11px] font-bold text-[#888888] uppercase tracking-widest mb-5">Queue Status</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#222222] font-bold">Profile Completion</span>
                  <span className="font-extrabold text-[#6c5d46]">
                    {ngoData?.description && ngoData?.mission && ngoData?.vision ? '100%' : '75%'}
                  </span>
                </div>
                <div className="w-full bg-[#f8f7f5] rounded-full h-2">
                  <div className="bg-[#6c5d46] h-2 rounded-full transition-all duration-500" style={{ width: ngoData?.description && ngoData?.mission && ngoData?.vision ? '100%' : '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[#888888]">
                  <BarChart3 size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Media</span>
                </div>
                <span className="text-sm font-bold text-[#222222]">{stats.totalGalleryItems || 0} items</span>
              </div>

            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-[#f8f7f5] rounded-2xl border border-[#eaddc8] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#eaddc8] rounded-bl-full opacity-20 -z-0"></div>
            <div className="flex items-center gap-2 mb-4 text-[#6c5d46] relative z-10">
              <AlertCircle size={18} />
              <h4 className="font-bold text-sm">Action Items</h4>
            </div>
            <ul className="space-y-3 relative z-10">
              {(!ngoData?.description || !ngoData?.mission) && (
                <li className="flex items-start gap-2.5 text-sm font-medium text-[#6c6c6c]">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6c5d46] shrink-0"></div>
                  <span>Complete your organization's mission statement</span>
                </li>
              )}
              {stats.totalGalleryItems < 5 && (
                <li className="flex items-start gap-2.5 text-sm font-medium text-[#6c6c6c]">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6c5d46] shrink-0"></div>
                  <span>Add more photos to showcase your work</span>
                </li>
              )}

              {!ngoData?.socialMedia?.website && (
                <li className="flex items-start gap-2.5 text-sm font-medium text-[#6c6c6c]">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6c5d46] shrink-0"></div>
                  <span>Add your website URL to increase visibility</span>
                </li>
              )}
              {stats.totalGalleryItems >= 5 && ngoData?.description && (
                <li className="flex items-start gap-2.5 text-sm font-medium text-[#5a6b46]">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#5a6b46] shrink-0"></div>
                  <span>You're doing great! Keep up the good work.</span>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}