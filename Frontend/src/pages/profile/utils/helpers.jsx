import React from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

// Local storage helpers
export const readStoredUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      if (parsed.data && typeof parsed.data === 'object') return parsed.data;
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const persistUserToStorage = (profile) => {
  if (!profile) return;
  try {
    localStorage.setItem('user', JSON.stringify(profile));
  } catch {
    const fallbackProfile = { ...profile };
    if (typeof fallbackProfile.avatar === 'string' && fallbackProfile.avatar.startsWith('data:')) {
      fallbackProfile.avatar = null;
    }
    try {
      localStorage.setItem('user', JSON.stringify(fallbackProfile));
    } catch { /* quota exceeded */ }
  }
};

// Receipt generator
export const downloadReceipt = (donation, userName) => {
  const date = new Date(donation.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const time = new Date(donation.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
  const receiptNo = donation.razorpayPaymentId || donation.receipt || `RCP-${donation._id?.slice(-8).toUpperCase()}`;
  const amount = Number(donation.amount).toLocaleString('en-IN');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Donation Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f5f5f5; }
    .receipt { max-width: 600px; margin: 30px auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .header { background: #2E7D32; color: #fff; padding: 24px 32px; text-align: center; }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.85; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 20px; padding: 3px 14px; font-size: 12px; margin-top: 10px; }
    .body { padding: 28px 32px; }
    .thank { text-align: center; font-size: 15px; color: #374151; margin-bottom: 24px; }
    .thank strong { color: #2E7D32; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
    td:first-child { color: #6b7280; width: 40%; }
    td:last-child { color: #111827; font-weight: 500; }
    .amount-row td { font-size: 18px; font-weight: 700; color: #2E7D32; border-top: 2px solid #e5e7eb; padding-top: 14px; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
    @media print { body { background: #fff; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>SevaIndia</h1>
      <p>Official Donation Receipt</p>
      <div class="badge">Tax Exemption Under Section 80G</div>
    </div>
    <div class="body">
      <p class="thank">Thank you, <strong>${userName || 'Donor'}</strong>, for your generous contribution!</p>
      <table>
        <tr><td>Receipt No.</td><td>${receiptNo}</td></tr>
        <tr><td>Donor Name</td><td>${donation.donorName || userName || 'Anonymous'}</td></tr>
        <tr><td>Program / Cause</td><td>${donation.serviceTitle || 'General Donation'}</td></tr>
        <tr><td>Date</td><td>${date}</td></tr>
        <tr><td>Time</td><td>${time}</td></tr>
        <tr><td>Payment ID</td><td>${donation.razorpayPaymentId || 'N/A'}</td></tr>
        <tr><td>Order ID</td><td>${donation.razorpayOrderId || 'N/A'}</td></tr>
        <tr><td>Currency</td><td>${donation.currency || 'INR'}</td></tr>
        <tr class="amount-row"><td>Amount Paid</td><td>₹${amount}</td></tr>
      </table>
    </div>
    <div class="footer">This is a computer-generated receipt. No signature required. | SevaIndia NGO Platform</div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.onafterprint = () => URL.revokeObjectURL(url);
  }
};

// Status badge component
export const StatusBadge = ({ status }) => {
  const map = {
    'Approved': { icon: <FaCheckCircle />, cls: 'bg-green-100 text-green-700' },
    'Pending': { icon: <FaClock />, cls: 'bg-yellow-100 text-yellow-700' },
    'Under Review': { icon: <FaClock />, cls: 'bg-blue-100 text-blue-700' },
    'Rejected': { icon: <FaTimesCircle />, cls: 'bg-red-100 text-red-700' },
  };
  const { icon, cls } = map[status] || { icon: null, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${cls}`}>{icon} {status}</span>;
};

// Date and currency formatters
export const fmtCurr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
export const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// Income label formatter
export const incomeLabel = (val) => ({
  'below1L': 'Below ₹1 Lakh',
  '1to1.5L': '₹1 Lakh – ₹1.5 Lakh',
  '1.5to2L': '₹1.5 Lakh – ₹2 Lakh',
  '2to2.5L': '₹2 Lakh – ₹2.5 Lakh',
}[val] || val);

// Type color mapper for feedback
export const TYPE_COLORS = {
  platform: "#6366f1",
  ngo: "#0ea5e9",
  volunteer: "#10b981",
  event: "#f59e0b",
  community: "#8b5cf6",
  service: "#ef4444",
  other: "#6b7280"
};

// Status color mapper for feedback
export const STATUS_COLORS = {
  new: "#dc2626",
  read: "#2563eb",
  acknowledged: "#d97706",
  resolved: "#16a34a"
};

// API base URL helper
export const getApiUrl = () => String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
