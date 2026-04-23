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
      {/* Mobile Hamburger Button with Higher Z-Index */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed block lg:hidden top-4 left-4 z-[100] p-3 bg-white text-[#28573D] border-2 border-[#28573D] rounded-lg shadow-xl hover:bg-[#F0F9F6] active:scale-95 transition-all duration-200 ease-out"
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-[#F9FAFB] border-r border-[#E5E7EB] flex flex-col transition-all duration-300 ease-out z-[60] w-64 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } lg:w-72 xl:w-80`}
      >
        {/* Premium Header with White Background */}
        <div className="bg-white shadow-sm">
          {/* User Profile Card Section - Premium Style */}
          <div className="pt-6 px-4 sm:px-6 pb-6">
            {/* Header Title */}
            <div className="mb-4">
              <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">
                User Profile
              </h2>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {/* Profile Avatar */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#28573D] to-[#1a3a2a] flex items-center justify-center shadow-md">
                <FaUser className="text-white text-xl" />
              </div>
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[#1F2937] truncate">
                  {user?.name || 'Guest User'}
                </h3>
                <p className="text-xs text-[#6B7280] truncate mt-1">
                  {user?.email || 'No email'}
                </p>
                {isVolunteer && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-green-100 text-[#28573D] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    <FaStar size={10} /> Volunteer
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Label */}
        <div className="px-4 sm:px-6 pt-5 pb-3">
          <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Navigation Menu</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-4 py-2 space-y-0.5">
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

            {/* Volunteer Dashboard Section */}
            {isVolunteer && (
              <div className="pt-3 mt-3 border-t border-[#E5E7EB]">
                <NavItem
                  icon={<FaHandHoldingHeart size={16} />}
                  label="Volunteer Dashboard"
                  isActive={activeTab === 'volunteer'}
                  onClick={() => handleTabChange('volunteer')}
                  isSection={true}
                />
              </div>
            )}
        </nav>

        {/* Logout Button */}
        <div className="p-3 sm:p-4 md:p-3 border-t border-[#E5E7EB] bg-gradient-to-t from-[#F9FAFB] to-transparent">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#FAF0F0] to-[#FDE8E8] text-[#C54A4A] hover:from-[#FCE8E8] hover:to-[#FDE0E0] font-semibold rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 group"
          >
            <span className="flex items-center gap-2 sm:gap-3">
              <FaSignOutAlt size={14} className="sm:text-base" />
              <span className="text-xs sm:text-sm md:text-base">Sign Out</span>
            </span>
            <FaChevronRight size={12} className="sm:text-sm text-[#C54A4A] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </aside>

      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Custom Scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #D1D5DB, #9CA3AF);
            border-radius: 10px;
            transition: all 0.3s ease;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #9CA3AF, #6B7280);
          }

          /* Mobile Responsiveness Utility */
          @media (max-width: 640px) {
            aside {
              width: 16rem;
            }
          }

          @media (max-width: 480px) {
            aside {
              width: 14rem;
            }
          }

          /* Smooth transitions */
          * {
            transition-property: background-color, border-color, color, fill, stroke;
          }
        `
      }} />
    </>
  );
};

const NavItem = ({ icon, label, isActive, onClick, badge, isSection }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 group ${
      isActive
        ? 'bg-gradient-to-r from-[#D4E8DC] to-[#E8F3ED] text-[#28573D] font-semibold shadow-sm border-l-4 border-[#28573D]'
        : 'text-[#6B7280] hover:bg-gradient-to-r hover:from-[#F3F4F6] hover:to-[#EBECEC] hover:text-[#374151] font-medium'
    } ${isSection ? 'text-base sm:text-lg font-bold mt-3' : 'text-sm sm:text-base'}`}
  >
    <span className="flex items-center gap-2 sm:gap-3 min-w-0">
      <span
        className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
          isActive ? 'text-[#28573D]' : 'text-[#9CA3AF] group-hover:text-[#6B7280]'
        }`}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </span>
    {badge && (
      <span className="flex-shrink-0 flex items-center justify-center min-w-[20px] h-6 px-1.5 text-[10px] sm:text-xs font-bold bg-gradient-to-br from-[#DC2626] to-[#C54A4A] text-white rounded-full shadow-md">
        {badge}
      </span>
    )}
  </button>
);

export default Sidebar;