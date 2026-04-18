import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search, Download, Filter, CheckCircle, Clock, XCircle,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, Users,
  TrendingUp, Calendar
} from "lucide-react";

export default function AdminEventRegistrations() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [markingAttendance, setMarkingAttendance] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const itemsPerPage = 10;

  // Fetch registrations and stats
  useEffect(() => {
    fetchData();
  }, [eventId, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      // Fetch stats
      const statsRes = await fetch(`/api/registrations/admin/${eventId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      // Fetch registrations
      const url = new URL(`/api/registrations/admin/${eventId}/registrations`, window.location.origin);
      if (statusFilter !== "all") {
        url.searchParams.append("status", statusFilter);
      }
      url.searchParams.append("page", "1");
      url.searchParams.append("limit", "100");

      const regsRes = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (regsRes.ok) {
        const regsData = await regsRes.json();
        setRegistrations(regsData.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (registrationId) => {
    try {
      setMarkingAttendance(registrationId);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/registrations/admin/${registrationId}/mark-attended`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update the registration in state
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg._id === registrationId ? { ...reg, status: "attended" } : reg
          )
        );
        // Refresh stats
        fetchData();
      } else {
        setError("Failed to mark attendance");
      }
    } catch (err) {
      setError(err.message || "Error marking attendance");
    } finally {
      setMarkingAttendance(null);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/registrations/admin/${eventId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `registrations-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError("Failed to export registrations");
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      fetchData();
      return;
    }

    try {
      setSearching(true);
      const token = localStorage.getItem("token");
      const url = new URL(`/api/registrations/admin/${eventId}/registrations`, window.location.origin);
      url.searchParams.append("search", query);
      url.searchParams.append("limit", "100");

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.data);
      }
    } catch (err) {
      setError("Search failed");
    } finally {
      setSearching(false);
    }
  };

  // Filter registrations based on status
  const filteredRegs = registrations.filter((reg) =>
    statusFilter === "all" ? true : reg.status === statusFilter
  );

  // Paginate
  const totalPages = Math.ceil(filteredRegs.length / itemsPerPage);
  const paginatedRegs = filteredRegs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    const badges = {
      registered: "bg-blue-50 text-blue-700 border-blue-200",
      attended: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      "no-show": "bg-orange-50 text-orange-700 border-orange-200",
    };
    return badges[status] || "bg-stone-50 text-stone-700 border-stone-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      attended: <CheckCircle size={16} className="text-green-600" />,
      registered: <Clock size={16} className="text-blue-600" />,
      cancelled: <XCircle size={16} className="text-red-600" />,
      "no-show": <AlertCircle size={16} className="text-orange-600" />,
    };
    return icons[status] || null;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4A3F35] to-[#5A4F45] text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-wide">
                Event Registrations
              </h1>
              <p className="text-stone-300 text-sm mt-1">
                {stats?.event?.title || "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#9B7341]" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Capacity */}
                <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Calendar size={24} className="text-[#9B7341]" />
                  </div>
                  <p className="text-stone-600 text-sm font-medium">Total Capacity</p>
                  <p className="text-3xl font-bold text-stone-900">
                    {stats.totalCapacity || "—"}
                  </p>
                </div>

                {/* Registered */}
                <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <p className="text-stone-600 text-sm font-medium">Registered</p>
                  <p className="text-3xl font-bold text-stone-900">
                    {stats.registered || 0}
                  </p>
                </div>

                {/* Attended */}
                <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <p className="text-stone-600 text-sm font-medium">Attended</p>
                  <p className="text-3xl font-bold text-stone-900">
                    {stats.attended || 0}
                  </p>
                </div>

                {/* Spots Remaining */}
                <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp size={24} className="text-orange-600" />
                  </div>
                  <p className="text-stone-600 text-sm font-medium">Spots Remaining</p>
                  <p className="text-3xl font-bold text-stone-900">
                    {stats.spotsRemaining || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#9B7341] transition-colors"
                  />
                  {searching && (
                    <Loader2 size={16} className="absolute right-3 top-3 text-stone-400 animate-spin" />
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  <Filter size={20} className="text-stone-600 mt-2" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#9B7341] transition-colors bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="registered">Registered</option>
                    <option value="attended">Attended</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-[#9B7341] hover:bg-[#8B6838] text-white rounded-lg font-semibold transition-colors"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Registrations Table */}
            <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRegs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-stone-500">
                          {registrations.length === 0
                            ? "No registrations yet"
                            : "No registrations match the filters"}
                        </td>
                      </tr>
                    ) : (
                      paginatedRegs.map((reg) => (
                        <tr
                          key={reg._id}
                          className="border-b border-stone-200 hover:bg-stone-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-stone-900">
                            {reg.fullName}
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-600">
                            {reg.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-600">
                            {reg.phone}
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-600 capitalize">
                            {reg.registrationType}
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadge(
                                reg.status
                              )}`}
                            >
                              {getStatusIcon(reg.status)}
                              {reg.status === "no-show"
                                ? "No Show"
                                : reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-stone-600">
                            {new Date(reg.registeredAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {reg.status === "registered" && (
                              <button
                                onClick={() => handleMarkAttendance(reg._id)}
                                disabled={markingAttendance === reg._id}
                                className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {markingAttendance === reg._id ? (
                                  <Loader2 size={14} className="inline animate-spin" />
                                ) : (
                                  "Mark Attended"
                                )}
                              </button>
                            )}
                            {reg.status === "attended" && (
                              <span className="text-xs text-green-600 font-semibold">✓ Attended</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-stone-200">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-stone-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-stone-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-stone-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
