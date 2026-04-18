import React, { useEffect, useState } from 'react';
import { 
  FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaCheckCircle, 
  FaRegEdit, FaArrowUp, FaExternalLinkAlt, 
  FaRegClock, FaHeart, FaShareSquare, FaGlobe, FaLeaf, FaSeedling
} from 'react-icons/fa';
import { getApiUrl } from '../utils/helpers.jsx';

// Utility functions
const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const Overview = ({ user = {}, visibleAvatar, userInitial, memberSince, userState, donations = [] }) => {
  const [stats, setStats] = useState({
    totalImpact: 0,
    projectsSupported: 0,
    badgesEarned: 0,
    level: 'New Member',
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic user mapping
  const displayUser = {
    name: user.name || 'User',
    email: user.email || 'No email provided',
    phone: user.phone || 'No phone provided',
    location: (user.city || userState) ? `${user.city || ''}${user.city && userState ? ', ' : ''}${userState || ''}` : 'Location unknown',
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = getApiUrl();
        
        // Fetch user stats
        try {
          const statsRes = await fetch(`${API_BASE_URL}/api/user/stats`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.success && statsData.data) {
              setStats(statsData.data);
            }
          }
        } catch (statsError) {
          console.debug('Stats fetch not available:', statsError);
        }
        
        // Fetch user activity
        try {
          const activityRes = await fetch(`${API_BASE_URL}/api/user/activity?limit=8`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          if (activityRes.ok) {
            const activityData = await activityRes.json();
            if (activityData.success && Array.isArray(activityData.data)) {
              setRecentActivity(activityData.data);
            }
          }
        } catch (activityError) {
          console.debug('Activity fetch not available:', activityError);
        }

        // Fetch donation history
        try {
          const donationRes = await fetch(`${API_BASE_URL}/api/payment/history`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          if (donationRes.ok) {
            const donationData = await donationRes.json();
            
            console.log('📦 Donation API Response:', donationData);
            
            // Handle different response formats
            let fetchedDonations = [];
            if (donationData.success && Array.isArray(donationData.data)) {
              fetchedDonations = donationData.data;
            } else if (donationData.success && donationData.data?.payments) {
              fetchedDonations = donationData.data.payments;
            } else if (Array.isArray(donationData.data)) {
              fetchedDonations = donationData.data;
            } else if (Array.isArray(donationData)) {
              fetchedDonations = donationData;
            }
            
            console.log('✓ Total donations fetched:', fetchedDonations.length);
            console.log('All donations:', fetchedDonations);
            
            // Filter for paid donations and sort by date
            const paidDonations = fetchedDonations
              .filter(d => {
                console.log('Checking donation status:', d._id, d.status);
                return d.status === 'paid';
              })
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log('✓ Paid donations after filtering:', paidDonations.length, paidDonations);
            
            setDonationHistory(paidDonations);
          } else {
            console.error('Donation fetch failed with status:', donationRes.status);
          }
        } catch (donationError) {
          console.error('❌ Donation fetch error:', donationError);
        }

      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, donations]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="w-full bg-[#F8F7F5] min-h-screen p-4 md:p-6 lg:p-10 font-sans text-[#4A4036] selection:bg-[#6B5D49] selection:text-white">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#3D342B] tracking-tight">
              {getGreeting()}, <span className="text-[#6B5D49]">{displayUser.name.split(' ')[0]}</span>
            </h1>
            <p className="text-[#8B8B8B] text-sm md:text-base mt-2 font-medium">
              The horizon is clear. All systems running smoothly today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[#6B5D49] hover:bg-[#5A4E3D] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5">
              <FaArrowUp size={12} /> Add Content
            </button>
            <button className="flex items-center gap-2 bg-[#E8E6E1] border border-[#D3D0C8] hover:bg-[#E0DDD5] text-[#4A4036] px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <FaRegEdit size={14} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Left Column (Main Content) */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Brown Impact Card with Gradient */}
              <div className="bg-gradient-to-br from-[#8B8B8B] to-[#6B5D49] rounded-3xl p-6 md:p-8 relative shadow-sm border border-[#7A7A7A] transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-start mb-8">
                  <span className="bg-white/15 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                    Impact Overview
                  </span>
                  <div className="p-2 bg-white/10 rounded-full">
                    <FaGlobe className="text-white" size={18} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">Total Impact Value</p>
                  <p className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-sm">{formatCurrency(stats.totalImpact)}</p>
                </div>
                <button className="text-xs font-bold text-white/90 mt-6 flex items-center gap-1.5 hover:text-white transition-colors group">
                  Manage Impact <FaExternalLinkAlt size={10} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Beige Projects Card */}
              <div className="bg-gradient-to-br from-[#EBE4D5] to-[#E0D9CC] rounded-3xl p-6 md:p-8 shadow-sm border border-[#D9D1C5] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="w-12 h-12 rounded-2xl border border-[#D3CCBE] flex items-center justify-center text-[#6B5D49] mb-6 bg-[#DDD6CA] shadow-inner">
                  <FaHeart size={20} className="text-[#6B5D49]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#8B8B8B] uppercase tracking-widest mb-2">Projects Supported</p>
                  <p className="text-4xl md:text-5xl font-extrabold text-[#3D342B]">{stats.projectsSupported}</p>
                  <p className="text-xs font-semibold text-[#8B8B8B] mt-2">Lifetime contributions</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-extrabold text-[#3D342B] mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F0EEEB] p-6 rounded-3xl shadow-sm border border-[#E3DFD9] cursor-pointer hover:border-[#D9D1C5] hover:bg-[#EAE7E1] transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-[#D9D1C5] border border-[#D0C9BF] flex items-center justify-center text-[#8B8B8B] mb-4 group-hover:bg-[#6B5D49] group-hover:text-white transition-all duration-300 shadow-sm">
                    <FaShareSquare size={18} />
                  </div>
                  <h4 className="text-sm font-extrabold text-[#3D342B] mb-1">Share Profile</h4>
                  <p className="text-xs text-[#8B8B8B] font-medium">Add new supporters to your network</p>
                </div>

                <div className="bg-[#F0EEEB] p-6 rounded-3xl shadow-sm border border-[#E3DFD9] cursor-pointer hover:border-[#D9D1C5] hover:bg-[#EAE7E1] transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-[#D9D1C5] border border-[#D0C9BF] flex items-center justify-center text-[#8B8B8B] mb-4 group-hover:bg-[#6B5D49] group-hover:text-white transition-all duration-300 shadow-sm">
                    <FaRegEdit size={18} />
                  </div>
                  <h4 className="text-sm font-extrabold text-[#3D342B] mb-1">Update Details</h4>
                  <p className="text-xs text-[#8B8B8B] font-medium">Edit organization details</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#FFFFFF] rounded-3xl shadow-sm border border-[#E8E6E1] p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-extrabold text-[#3D342B] flex items-center gap-2">
                  <div className="p-2 bg-[#E8E6E1] rounded-lg text-[#6B5D49]">
                    <FaLeaf size={14}/>
                  </div>
                  Recent Activity
                </h3>
                {recentActivity.length > 0 && (
                  <button className="text-[11px] font-bold text-[#8B8B8B] uppercase tracking-wider hover:text-[#6B5D49] transition-colors">
                    View All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {loading ? (
                   <div className="flex flex-col items-center justify-center py-6 animate-pulse">
                     <div className="w-8 h-8 rounded-full bg-[#E8E6E1] mb-3"></div>
                     <p className="text-sm text-[#8B8B8B] font-medium">Loading activity...</p>
                   </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 pb-6 border-b border-[#E8E6E1] last:border-0 last:pb-0 hover:bg-[#F8F7F5] -mx-4 px-4 rounded-xl transition-colors duration-200 cursor-default">
                      <div className="mt-1 w-10 h-10 rounded-full bg-[#E8E6E1] text-[#6B5D49] flex items-center justify-center shrink-0 border border-[#D9D1C5]">
                        <FaSeedling size={14} />
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 pt-1">
                        <div>
                          <h4 className="text-sm font-bold text-[#3D342B]">{activity.title || activity.description}</h4>
                          <p className="text-xs text-[#8B8B8B] mt-1 flex items-center gap-2 font-medium">
                            {activity.type || 'Action'} <span className="w-1.5 h-1.5 rounded-full bg-[#D3D0C8]"></span> {formatDate(activity.date || activity.createdAt)}
                          </p>
                        </div>
                        {activity.amount && (
                          <span className="text-sm font-extrabold text-[#5A7C5A] bg-[#5A7C5A]/10 px-3 py-1 rounded-full">
                            +{formatCurrency(activity.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-[#F8F7F5] rounded-2xl border border-dashed border-[#D9D1C5]">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#E8E6E1] text-[#A9A9A9] mb-4">
                      <FaLeaf size={24} />
                    </div>
                    <p className="text-sm text-[#5C5042] font-bold">No recent activity found</p>
                    <p className="text-xs text-[#8B8B8B] mt-1 font-medium">Your environmental impact and actions will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Donation History */}
            <div className="bg-[#FFFFFF] rounded-3xl shadow-sm border border-[#E8E6E1] p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-extrabold text-[#3D342B] flex items-center gap-2">
                  <div className="p-2 bg-[#E8E6E1] rounded-lg text-[#6B5D49]">
                    <FaHeart size={14}/>
                  </div>
                  Donation History
                </h3>
              </div>

              <div className="space-y-4">
                {donationHistory && donationHistory.length > 0 ? (
                  donationHistory.map((donation, index) => (
                    <div key={index} className="flex items-center justify-between pb-4 border-b border-[#E8E6E1] last:border-0 last:pb-0 hover:bg-[#F8F7F5] -mx-4 px-4 rounded-xl transition-colors duration-200 py-2 cursor-default">
                      <div>
                        <h4 className="text-sm font-bold text-[#3D342B]">{donation.serviceTitle || donation.ngoId?.ngoName || 'General Donation'}</h4>
                        <p className="text-xs text-[#8B8B8B] mt-1 font-medium">{formatDate(donation.createdAt)}</p>
                      </div>
                      <span className="text-sm font-extrabold text-[#3D342B]">
                        {formatCurrency(donation.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-10 bg-[#F8F7F5] rounded-2xl border border-dashed border-[#D9D1C5]">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#E8E6E1] text-[#A9A9A9] mb-4">
                      <FaHeart size={24} />
                    </div>
                    <p className="text-sm text-[#5C5042] font-bold">No donations made yet</p>
                    <p className="text-xs text-[#8B8B8B] mt-1 font-medium">Contribute to a project to see your history.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="w-full lg:w-[340px] xl:w-[380px] space-y-6">
            
            {/* Profile Info Card */}
            <div className="bg-[#FFFFFF] rounded-3xl shadow-sm border border-[#E8E6E1] p-6 md:p-8">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E8E6E1] to-[#D9D1C5] overflow-hidden flex items-center justify-center text-[#6B5D49] text-2xl font-extrabold shrink-0 shadow-inner border-2 border-white/50">
                  {visibleAvatar ? (
                     <img src={visibleAvatar} alt={displayUser.name} className="w-full h-full object-cover" />
                  ) : (
                     userInitial || displayUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#3D342B] leading-tight mb-1">{displayUser.name}</h2>
                  <div className="flex items-center gap-1.5">
                    <FaCheckCircle className="text-[#5A7C5A]" size={12} />
                    <span className="text-[10px] font-bold text-[#5A7C5A] uppercase tracking-widest bg-[#5A7C5A]/10 px-2 py-0.5 rounded-md">Verified</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 bg-[#F8F7F5] p-5 rounded-2xl border border-[#E3DFD9]">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-[#E8E6E1] flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt className="text-[#6B5D49]" size={12} />
                  </div>
                  <span className="text-[#5C5042] font-medium">{displayUser.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-[#E8E6E1] flex items-center justify-center shrink-0">
                    <FaEnvelope className="text-[#6B5D49]" size={12} />
                  </div>
                  <span className="text-[#5C5042] font-medium truncate">{displayUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-[#E8E6E1] flex items-center justify-center shrink-0">
                    <FaPhoneAlt className="text-[#6B5D49]" size={12} />
                  </div>
                  <span className="text-[#5C5042] font-medium">{displayUser.phone}</span>
                </div>
              </div>

              <button className="w-full py-3.5 bg-gradient-to-r from-[#E8E6E1] to-[#DDD6CA] hover:from-[#DDD6CA] hover:to-[#D3CCBE] border border-[#D9D1C5] rounded-xl text-sm font-extrabold text-[#4A4036] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                View Full Profile <FaExternalLinkAlt size={12} className="text-[#6B5D49]" />
              </button>
            </div>

            {/* Queue Status / Progress Card */}
            <div className="bg-[#FFFFFF] rounded-3xl shadow-sm border border-[#E8E6E1] p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D9D1C5]/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <p className="text-[10px] font-bold text-[#8B8B8B] uppercase tracking-widest mb-6">Queue Status</p>
              
              <div className="mb-8 relative z-10">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-extrabold text-[#3D342B]">Profile Completion</span>
                  <span className="text-xs font-extrabold text-[#6B5D49] bg-[#E8E6E1] px-2 py-1 rounded-md">75%</span>
                </div>
                <div className="w-full bg-[#E8E6E1] rounded-full h-2.5 shadow-inner">
                  <div className="bg-gradient-to-r from-[#8B8B8B] to-[#6B5D49] h-2.5 rounded-full shadow-sm" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="border-t border-[#E3DFD9] pt-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E8E6E1] flex items-center justify-center text-[#6B5D49]">
                    <FaRegClock size={14} />
                  </div>
                  <p className="text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Media</p>
                </div>
                <p className="text-sm font-extrabold text-[#3D342B]">
                  {stats.projectsSupported > 0 ? `${stats.projectsSupported} items` : 'No items yet'}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Overview;