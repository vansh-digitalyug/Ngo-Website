import { useState, useEffect, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  Image, 
  Users, 
  Clock, 
  Heart, 
  Upload, 
  Edit, 
  ClipboardList,
  FileText,
  Pin,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Eye,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { API_BASE_URL } from './NgoLayout';


export default function NgoDashboard() {
  const { ngoData } = useOutletContext();
  const [stats, setStats] = useState({
    totalGalleryItems: 0,
    totalVolunteers: 0,
    totalDonations: 0,
    pendingVolunteers: 0,
    approvedVolunteers: 0,
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
        // Map backend response to expected frontend format
        const backendStats = data.data?.stats || {};
        setStats({
          totalGalleryItems: backendStats.gallery?.total || 0,
          pendingGalleryItems: backendStats.gallery?.pending || 0,
          approvedGalleryItems: backendStats.gallery?.approved || 0,
          totalVolunteers: backendStats.volunteers?.total || 0,
          pendingVolunteers: backendStats.volunteers?.pending || 0,
          totalDonations: backendStats.donations?.total || 0,
          donationAmount: backendStats.donations?.amount || 0,
          profileViews: 0
        });
        
        // Map recent activity
        const recentData = data.data?.recent || {};
        const activities = [];
        
        // Add recent gallery items
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
        
        // Add recent volunteers
        if (recentData.volunteers) {
          recentData.volunteers.forEach(v => {
            activities.push({
              type: 'volunteer',
              title: `Volunteer: ${v.fullName}`,
              status: v.status,
              time: v.createdAt
            });
          });
        }
        
        // Sort by time and take latest 5
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActivity(activities.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      gallery: Image,
      volunteer: Users,
      donation: Heart,
      profile: FileText,
      view: Eye
    };
    return icons[type] || Pin;
  };

  const getActivityColor = (type) => {
    const colors = {
      gallery: { bg: '#f3e8ff', color: '#7c3aed' },
      volunteer: { bg: '#dcfce7', color: '#16a34a' },
      donation: { bg: '#fef3c7', color: '#d97706' },
      profile: { bg: '#dbeafe', color: '#2563eb' },
      view: { bg: '#f1f5f9', color: '#475569' }
    };
    return colors[type] || { bg: '#f1f5f9', color: '#64748b' };
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

  const volunteerRate = stats.totalVolunteers > 0 
    ? Math.round((stats.approvedVolunteers / stats.totalVolunteers) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="ngo-loading-screen">
        <div className="ngo-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="ngo-dashboard">
      {/* Welcome Header */}
      <header className="ngo-welcome-header">
        <div className="ngo-welcome-content">
          <div className="ngo-welcome-text">
            <span className="ngo-date">{currentDate}</span>
            <h1>{greeting}, {ngoData?.ngoName?.split(' ')[0] || 'there'}!</h1>
            <p>Here's an overview of your organization's activity and performance.</p>
          </div>
          <div className="ngo-welcome-actions">
            <Link to="/ngo/gallery" className="ngo-header-btn primary">
              <Upload size={18} />
              Add Content
            </Link>
            <Link to="/ngo/profile" className="ngo-header-btn secondary">
              <Edit size={18} />
              Edit Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="ngo-stats-section">
        <div className="ngo-stats-row">
          <div className="ngo-stat-card highlight">
            <div className="stat-header">
              <span className="stat-label">Gallery Items</span>
              <div className="stat-icon purple">
                <Image size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.totalGalleryItems || 0}</div>
            <div className="stat-footer">
              <Link to="/ngo/gallery" className="stat-link">
                Manage Gallery <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="ngo-stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Volunteers</span>
              <div className="stat-icon green">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.totalVolunteers || 0}</div>
            <div className="stat-footer">
              <span className="stat-change positive">
                <CheckCircle2 size={12} /> {stats.approvedVolunteers || 0} approved
              </span>
            </div>
          </div>

          <div className="ngo-stat-card">
            <div className="stat-header">
              <span className="stat-label">Pending Requests</span>
              <div className="stat-icon orange">
                <Clock size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.pendingVolunteers || 0}</div>
            <div className="stat-footer">
              {stats.pendingVolunteers > 0 ? (
                <Link to="/ngo/volunteers" className="stat-link attention">
                  <Bell size={12} /> Review now
                </Link>
              ) : (
                <span className="stat-neutral">All caught up</span>
              )}
            </div>
          </div>

          <div className="ngo-stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Donations</span>
              <div className="stat-icon blue">
                <Heart size={20} />
              </div>
            </div>
            <div className="stat-value">₹{(stats.totalDonations || 0).toLocaleString('en-IN')}</div>
            <div className="stat-footer">
              <span className="stat-neutral">Lifetime contributions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="ngo-content-grid">
        {/* Left Column */}
        <div className="ngo-content-main">
          {/* Quick Actions */}
          <section className="ngo-section">
            <div className="ngo-section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="ngo-actions-grid">
              <Link to="/ngo/gallery" className="ngo-action-card">
                <div className="action-icon purple">
                  <Upload size={24} />
                </div>
                <div className="action-content">
                  <h3>Upload Photos</h3>
                  <p>Add new images to your gallery</p>
                </div>
                <ArrowUpRight size={18} className="action-arrow" />
              </Link>

              <Link to="/ngo/volunteers" className="ngo-action-card">
                <div className="action-icon green">
                  <Users size={24} />
                </div>
                <div className="action-content">
                  <h3>Manage Volunteers</h3>
                  <p>Review applications & assignments</p>
                </div>
                <ArrowUpRight size={18} className="action-arrow" />
              </Link>

              <Link to="/ngo/profile" className="ngo-action-card">
                <div className="action-icon blue">
                  <FileText size={24} />
                </div>
                <div className="action-content">
                  <h3>Update Profile</h3>
                  <p>Edit organization details</p>
                </div>
                <ArrowUpRight size={18} className="action-arrow" />
              </Link>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="ngo-section">
            <div className="ngo-section-header">
              <h2>Recent Activity</h2>
              <span className="section-badge">Last 7 days</span>
            </div>
            <div className="ngo-activity-container">
              {recentActivity.length > 0 ? (
                <div className="ngo-activity-timeline">
                  {recentActivity.slice(0, 5).map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    const colors = getActivityColor(activity.type);
                    return (
                      <div key={index} className="activity-timeline-item">
                        <div className="timeline-marker" style={{ background: colors.bg }}>
                          <Icon size={16} style={{ color: colors.color }} />
                        </div>
                        <div className="timeline-content">
                          <h4>{activity.title}</h4>
                          <p>{activity.description}</p>
                          <span className="timeline-time">{formatTime(activity.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="ngo-empty-state compact">
                  <Activity size={40} strokeWidth={1.5} />
                  <h4>No recent activity</h4>
                  <p>Your organization's activities will appear here</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="ngo-content-sidebar">
          {/* Organization Card */}
          <div className="ngo-org-card">
            <div className="org-card-header">
              <div className="org-avatar">
                {ngoData?.ngoName?.charAt(0) || 'N'}
              </div>
              <div className="org-info">
                <h3>{ngoData?.ngoName || 'Your NGO'}</h3>
                <span className="org-status verified">
                  <CheckCircle2 size={12} /> Verified Organization
                </span>
              </div>
            </div>
            
            <div className="org-details">
              {ngoData?.state && (
                <div className="org-detail-row">
                  <MapPin size={14} />
                  <span>{ngoData.city ? `${ngoData.city}, ` : ''}{ngoData.state}</span>
                </div>
              )}
              {ngoData?.email && (
                <div className="org-detail-row">
                  <Mail size={14} />
                  <span>{ngoData.email}</span>
                </div>
              )}
              {ngoData?.phone && (
                <div className="org-detail-row">
                  <Phone size={14} />
                  <span>{ngoData.phone}</span>
                </div>
              )}
            </div>

            <Link to="/ngo/profile" className="org-card-link">
              View Full Profile <ExternalLink size={14} />
            </Link>
          </div>

          {/* Performance Summary */}
          <div className="ngo-performance-card">
            <h3>Performance Summary</h3>
            
            <div className="performance-metric">
              <div className="metric-header">
                <span>Volunteer Approval Rate</span>
                <span className="metric-value">{volunteerRate}%</span>
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-fill green" 
                  style={{ width: `${volunteerRate}%` }}
                ></div>
              </div>
            </div>

            <div className="performance-metric">
              <div className="metric-header">
                <span>Profile Completion</span>
                <span className="metric-value">
                  {ngoData?.description && ngoData?.mission && ngoData?.vision ? '100%' : '75%'}
                </span>
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-fill purple" 
                  style={{ width: ngoData?.description && ngoData?.mission && ngoData?.vision ? '100%' : '75%' }}
                ></div>
              </div>
            </div>

            <div className="performance-stats">
              <div className="perf-stat">
                <BarChart3 size={16} />
                <span>{stats.totalGalleryItems || 0} media items</span>
              </div>
              <div className="perf-stat">
                <Users size={16} />
                <span>{stats.approvedVolunteers || 0} active volunteers</span>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="ngo-tips-card">
            <div className="tips-header">
              <AlertCircle size={18} />
              <h4>Tips to Improve</h4>
            </div>
            <ul className="tips-list">
              {(!ngoData?.description || !ngoData?.mission) && (
                <li>Complete your organization's mission statement</li>
              )}
              {stats.totalGalleryItems < 5 && (
                <li>Add more photos to showcase your work</li>
              )}
              {stats.pendingVolunteers > 0 && (
                <li>Review pending volunteer applications</li>
              )}
              {!ngoData?.socialMedia?.website && (
                <li>Add your website URL to increase visibility</li>
              )}
              {stats.totalGalleryItems >= 5 && stats.pendingVolunteers === 0 && ngoData?.description && (
                <li>You're doing great! Keep up the good work.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
