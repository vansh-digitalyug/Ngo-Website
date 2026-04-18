import React from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner, FaSync, FaHeart, FaDownload, FaCalendarAlt } from 'react-icons/fa';
import { downloadReceipt } from '../utils/helpers.jsx';

const Donations = ({
  donations,
  donationsLoading,
  user,
  fetchDonations,
}) => {
  // Calculate statistics
  const totalLifetimeSupport = donations.reduce((sum, item) => sum + (item.amount || 0), 0);
  const currentYear = new Date().getFullYear();
  const currentYearDonations = donations.filter(item => {
    const donationYear = new Date(item.createdAt).getFullYear();
    return donationYear === currentYear;
  }).reduce((sum, item) => sum + (item.amount || 0), 0);
  const activeProgramsSupported = new Set(donations.map(d => d.serviceTitle)).size;

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    if (statusLower.includes('confirmed')) return 'bg-[#5A7C5A]/10 text-[#5A7C5A]';
    if (statusLower.includes('issued') || statusLower.includes('tax')) return 'bg-[#6B5D49]/10 text-[#6B5D49]';
    if (statusLower.includes('pending')) return 'bg-[#8B8B8B]/10 text-[#8B8B8B]';
    return 'bg-[#6B5D49]/10 text-[#6B5D49]';
  };

  const getStatusText = (donation) => {
    // Return appropriate status based on donation verification
    if (donation.status === 'paid') return 'Confirmed';
    if (donation.status === 'created') return 'Pending';
    if (donation.status === 'failed') return 'Failed';
    return donation.status || 'Pending';
  };

  const getStatusDescription = (donation) => {
    // Get additional info about status
    if (donation.status === 'paid') return 'Payment verified and confirmed';
    if (donation.status === 'created') return 'Payment initiated, awaiting verification';
    if (donation.status === 'failed') return 'Payment was unsuccessful';
    return 'Status unknown';
  };

  return (
    <div className="animate-fadeIn min-h-screen bg-[#F8F7F5] pb-24">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#3D342B] tracking-tight">Donation History</h1>
            <p className="text-[15px] text-[#8B8B8B] mt-1">A record of your institutional support and archival impact.</p>
          </div>
          <button
            onClick={fetchDonations}
            disabled={donationsLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6B5D49] hover:bg-[#5A4E3D] text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md w-fit"
          >
            <FaSync className={donationsLoading ? 'animate-spin' : ''} size={14} /> Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Lifetime Support Card */}
          <div className="bg-gradient-to-br from-[#8B8B8B] to-[#6B5D49] rounded-3xl p-6 md:p-8 shadow-sm border border-[#7A7A7A] text-white">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-2">Total Lifetime Support</p>
            <p className="text-3xl md:text-4xl font-extrabold">{formatCurrency(totalLifetimeSupport)}</p>
          </div>

          {/* Current Year Card */}
          <div className="bg-gradient-to-br from-[#EBE4D5] to-[#E0D9CC] rounded-3xl p-6 md:p-8 shadow-sm border border-[#D9D1C5] text-[#3D342B]">
            <p className="text-sm font-semibold text-[#8B8B8B] uppercase tracking-wide mb-2">Current Year ({currentYear})</p>
            <p className="text-3xl md:text-4xl font-extrabold text-[#3D342B]">{formatCurrency(currentYearDonations)}</p>
          </div>

          {/* Active Programs Card */}
          <div className="bg-gradient-to-br from-[#DDD6CA] to-[#D3CCBE] rounded-3xl p-6 md:p-8 shadow-sm border border-[#D0C9BF] text-[#3D342B]">
            <p className="text-sm font-semibold text-[#8B8B8B] uppercase tracking-wide mb-2">Active Programs Supported</p>
            <p className="text-3xl md:text-4xl font-extrabold text-[#3D342B]">{String(activeProgramsSupported).padStart(2, '0')}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12">
        {donationsLoading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E6E1] shadow-sm">
            <FaSpinner className="inline-block animate-spin text-[#6B5D49] text-3xl mb-4" />
            <p className="text-[#8B8B8B] font-medium">Loading donations...</p>
          </div>
        ) : donations.length > 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8E6E1] shadow-sm overflow-hidden">
            {/* Archival Ledger Header */}
            <div className="bg-[#F8F7F5] px-6 md:px-8 py-6 border-b border-[#E8E6E1]">
              <h3 className="text-lg md:text-xl font-bold text-[#3D342B]">Archival Ledger</h3>
            </div>

            {/* Table - Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E8E6E1] bg-[#FCFBF8]">
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Program / Cause</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Ref ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E6E1]">
                  {donations.map((item) => (
                    <tr key={item._id} className="hover:bg-[#F8F7F5] transition-colors group">
                      <td className="px-6 py-4 text-sm text-[#3D342B] font-medium">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#3D342B]">
                        {item.serviceTitle || item.program || 'General Donation'}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B5D49]">
                        {item.ngoId?.ngoName || 'Archive NGO'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#6B5D49]">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="group/status relative">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold cursor-help ${getStatusColor(getStatusText(item))}`}>
                            {getStatusText(item)}
                          </span>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/status:block bg-[#3D342B] text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50 pointer-events-none">
                            {getStatusDescription(item)}
                            <div className="absolute top-full left-2 w-2 h-2 bg-[#3D342B]" style={{transform: 'translateY(-50%)'}}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#8B8B8B] font-medium">
                        {item.razorpayPaymentId ? (
                          <span title={item.razorpayPaymentId} className="cursor-help">
                            {item.razorpayPaymentId.substring(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-[#D3D0C8]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => downloadReceipt(item, user?.name)}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E8E6E1] hover:bg-[#DDD6CA] text-[#6B5D49] font-semibold text-xs rounded-xl transition-colors"
                        >
                          <FaDownload size={12} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card View - Mobile & Tablet */}
            <div className="md:hidden divide-y divide-[#E8E6E1]">
              {donations.map((item) => (
                <div key={item._id} className="p-4 sm:p-6 hover:bg-[#F8F7F5] transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className="text-[#8B8B8B]" size={12} />
                        <p className="text-xs text-[#8B8B8B] font-medium">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <h4 className="text-sm font-bold text-[#3D342B] mb-1">
                        {item.serviceTitle || item.program || 'General Donation'}
                      </h4>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(getStatusText(item))}`}>
                      {getStatusText(item)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[#E8E6E1]">
                    <p className="text-sm font-bold text-[#6B5D49]">
                      {formatCurrency(item.amount)}
                    </p>
                    <button
                      onClick={() => downloadReceipt(item, user?.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8E6E1] hover:bg-[#DDD6CA] text-[#6B5D49] font-semibold text-xs rounded-lg transition-colors"
                    >
                      <FaDownload size={11} /> Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E6E1] shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8E6E1] text-[#A9A9A9] mb-6">
              <FaHeart size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#3D342B] mb-2">Ready to make a difference?</h3>
            <p className="text-[#8B8B8B] mb-6 font-medium">You haven't made any donations yet. Your support can change lives.</p>
            <Link 
              to="/donate" 
              className="inline-block px-6 py-2.5 bg-[#6B5D49] hover:bg-[#5A4E3D] text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Help Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;
