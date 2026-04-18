import React, { useState } from 'react';
import {
  FaUser,
  FaHeart,
  FaHandHoldingHeart,
  FaSignOutAlt,
  FaClipboardList,
  FaStar,
  FaBell,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaCalendar
} from 'react-icons/fa';

const Sidebar = ({
  user,
  activeTab,
  setActiveTab,
  handleLogout,
  isVolunteer,
  kanyadanApps,
  donorTasks,
  eventNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    handleLogout();
  };

  return (
    <>
      {/* Enhanced Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed lg:hidden top-5 left-5 z-[70] p-3 bg-white text-[#28573D] border border-[#D1D5DB] rounded-lg shadow-lg hover:bg-gray-50 active:scale-95 transition-all duration-300 ease-out"
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Smooth Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[50] lg:hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar with Smooth Sliding Transition */}
      <aside
        className={`fixed lg:sticky top-0 left-0 w-72 bg-[#F4F5F5] border-r border-[#E5E7EB] h-screen flex flex-col transition-all duration-300 ease-out z-[60] ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'
        }`}
      >
        {/* Typographic User Profile Section */}
        <div className="pt-16 lg:pt-10 pb-6 px-6 mb-2">
          <h2 className="text-[22px] font-bold text-[#28573D] tracking-tight mb-1">
            User Profile
          </h2>
          <div className="mt-1 flex flex-col">
            <span className="text-[14px] font-medium text-[#6B7280] truncate">
              {user?.name || 'Guest User'}
            </span>
            <span className="text-[13px] text-[#9CA3AF] truncate mt-0.5">
              {user?.email || 'No email provided'}
            </span>
          </div>
          {isVolunteer && (
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 bg-[#EAF1EB] text-[#28573D] px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider">
                <FaStar size={10} /> Volunteer
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto custom-scrollbar pb-4">
          <NavItem
            icon={<FaUser size={16} />}
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => handleTabChange('overview')}
          />
          <NavItem
            icon={<FaUser size={16} />}
            label="Personal Info"
            isActive={activeTab === 'personal'}
            onClick={() => handleTabChange('personal')}
          />
          <NavItem
            icon={<FaHeart size={16} />}
            label="Donation History"
            isActive={activeTab === 'donations'}
            onClick={() => handleTabChange('donations')}
          />

          <NavItem
            icon={<FaCalendar size={16} />}
            label="My Events"
            isActive={activeTab === 'events'}
            onClick={() => handleTabChange('events')}
          />

          {kanyadanApps && kanyadanApps.length > 0 && (
            <NavItem
              icon={<FaClipboardList size={16} />}
              label="Kanyadan Status"
              isActive={activeTab === 'kanyadan'}
              onClick={() => handleTabChange('kanyadan')}
            />
          )}

          <NavItem
            icon={<FaClipboardList size={16} />}
            label="My Donated Tasks"
            isActive={activeTab === 'tasks'}
            onClick={() => handleTabChange('tasks')}
            badge={donorTasks && donorTasks.length > 0 ? donorTasks.length : null}
          />

          <NavItem
            icon={<FaStar size={16} />}
            label="My Feedback"
            isActive={activeTab === 'feedback'}
            onClick={() => handleTabChange('feedback')}
          />

          <NavItem
            icon={<FaBell size={16} />}
            label="Event Updates"
            isActive={activeTab === 'eventUpdates'}
            onClick={() => handleTabChange('eventUpdates')}
            badge={eventNotifications && eventNotifications.filter(n => !n.isRead).length > 0 ? eventNotifications.filter(n => !n.isRead).length : null}
          />

          <NavItem
            icon={<FaClipboardList size={16} />}
            label="Recent Activity"
            isActive={activeTab === 'recentActivity'}
            onClick={() => handleTabChange('recentActivity')}
          />

          {isVolunteer && (
            <div className="pt-3 mt-3 border-t border-[#E5E7EB]">
              <NavItem
                icon={<FaHandHoldingHeart size={16} />}
                label="Volunteer Dashboard"
                isActive={activeTab === 'volunteer'}
                onClick={() => handleTabChange('volunteer')}
              />
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-5 pb-6">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-[#FAF0F0] text-[#C54A4A] hover:bg-[#FCE8E8] font-medium rounded-xl transition-colors duration-200"
          >
            <span className="flex items-center gap-3">
              <FaSignOutAlt size={18} />
              <span className="text-[16px]">Sign Out</span>
            </span>
            <FaChevronRight size={14} className="text-[#C54A4A]" />
          </button>
        </div>
      </aside>

      {/* Global styles for custom scrollbar within sidebar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}} />
    </>
  );
};

const NavItem = ({ icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-[#EAF1EB] text-[#28573D] font-semibold'
        : 'text-[#6B7280] hover:bg-[#EBECEC] hover:text-[#374151] font-medium'
    }`}
  >
    <span className="flex items-center gap-3">
      <span className={`${isActive ? 'text-[#28573D]' : 'text-[#6B7280]'}`}>
        {icon}
      </span>
      <span className="text-[14px]">{label}</span>
    </span>
    {badge && (
      <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold bg-[#C54A4A] text-white rounded-full">
        {badge}
      </span>
    )}
  </button>
);

export default Sidebar;