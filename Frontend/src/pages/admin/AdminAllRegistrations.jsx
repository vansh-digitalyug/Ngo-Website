import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, AlertCircle, Users, MoreVertical, ChevronLeft, ChevronRight, Phone, Calendar, Tag, Clock } from "lucide-react";

export default function AdminAllRegistrations() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [markingAttendance, setMarkingAttendance] = useState(null);

  const itemsPerPage = 8;

  const getApiUrl = () => {
    let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    baseUrl = baseUrl.replace(/\/$/, '');
    if (!baseUrl.endsWith('/api')) {
      baseUrl += '/api';
    }
    return baseUrl;
  };

  // Fetch registrations
  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const apiUrl = getApiUrl();
      const url = new URL(`${apiUrl}/registrations/admin/all`);
      
      if (searchQuery) {
        url.searchParams.append("search", searchQuery);
      }
      url.searchParams.append("page", currentPage);
      url.searchParams.append("limit", itemsPerPage);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.data || []);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleMarkAttendance = async (registrationId) => {
    try {
      setMarkingAttendance(registrationId);
      const token = localStorage.getItem("token");
      const apiUrl = getApiUrl();
      
      const response = await fetch(
        `${apiUrl}/registrations/admin/${registrationId}/mark-attended`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg._id === registrationId ? { ...reg, status: "attended" } : reg
          )
        );
      } else {
        setError("Failed to mark attendance");
      }
    } catch (err) {
      setError(err.message || "Error marking attendance");
    } finally {
      setMarkingAttendance(null);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  };

  const getAvatarColor = (name) => {
    const colors = ["bg-orange-200", "bg-blue-200", "bg-green-200", "bg-purple-200", "bg-pink-200", "bg-yellow-200"];
    return colors[name?.charCodeAt(0) % colors.length] || "bg-gray-200";
  };

  const getStatusColor = (status) => {
    if (status === "registered") return "bg-blue-100 text-blue-700";
    if (status === "attended") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-orange-100 text-orange-700";
  };

  const getStatusLabel = (status) => {
    return status === "no-show" ? "No Show" : status.charAt(0).toUpperCase() + status.slice(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading && registrations.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-stone-400" />
      </div>
    );
  }


  return (
    <div className="min-h-screen w-full">
      <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-5 sm:mb-6 md:mb-8">
          <div className="flex flex-col xs:gap-3 sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 md:gap-6">
            <div className="min-w-0">
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 truncate">Event Registrations</h1>
              <p className="text-stone-600 text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1 line-clamp-2">Manage and track all event registrations across the platform</p>
            </div>
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 text-stone-600 bg-stone-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors">
                <Users size={16} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base font-medium whitespace-nowrap">{totalCount}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-5 md:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5 xs:size-5 sm:size-5" />
            <p className="text-red-700 text-xs sm:text-sm md:text-base">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <div className="relative w-full lg:w-96">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 xs:w-4 xs:h-4" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 xs:py-2.5 sm:py-2.5 md:py-3 text-xs xs:text-sm sm:text-base border border-stone-300 rounded-lg focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200/50 transition-all bg-white hover:border-stone-400"
            />
          </div>
        </div>

        {/* Mobile & Tablet Card View (better design) */}
        <div className="lg:hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-20 md:py-24">
              <Loader2 size={40} className="animate-spin text-stone-400" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="bg-white rounded-lg border border-stone-200 px-4 sm:px-6 py-8 sm:py-12 text-center text-stone-500 text-xs sm:text-sm">
              {totalCount === 0 ? "No registrations found" : "No registrations match your search"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 xs:gap-3 sm:gap-4 md:gap-4">
              {registrations.map((reg) => (
                <div key={reg._id} className="bg-gradient-to-br from-white to-stone-50 rounded-lg xs:rounded-xl sm:rounded-xl border border-stone-200/60 shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-300 overflow-hidden">
                  {/* Header Section - User Info */}
                  <div className="bg-gradient-to-r from-stone-50/50 to-white px-3 xs:px-4 sm:px-4 py-3 xs:py-3.5 sm:py-4 border-b border-stone-100/80">
                    <div className="flex items-center gap-2.5 xs:gap-3 sm:gap-3">
                      <div className={`w-10 xs:w-11 sm:w-12 h-10 xs:h-11 sm:h-12 rounded-full ${getAvatarColor(reg.fullName)} flex items-center justify-center text-xs xs:text-sm font-bold text-stone-700 flex-shrink-0 shadow-sm`}>
                        {getInitials(reg.fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-900 text-xs xs:text-sm sm:text-sm leading-tight line-clamp-1">{reg.fullName}</p>
                        <p className="text-xs text-stone-600 truncate md:line-clamp-1">{reg.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Section - Optimized Layout */}
                  <div className="px-3 xs:px-4 sm:px-4 py-3 xs:py-3.5 sm:py-4 space-y-2.5 xs:space-y-3 sm:space-y-3 md:space-y-2">
                    {/* Row 1: Phone & Event */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-3 md:gap-2.5">
                      {/* Phone */}
                      <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <Phone size={14} className="xs:w-4 xs:h-4 sm:w-4 sm:h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-500 font-semibold uppercase tracking-tight">Phone</p>
                          <p className="text-xs xs:text-xs sm:text-sm font-medium text-stone-900 truncate">{reg.phone}</p>
                        </div>
                      </div>

                      {/* Event - Now on right side of phone on tablet */}
                      <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <Calendar size={14} className="xs:w-4 xs:h-4 sm:w-4 sm:h-4 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-500 font-semibold uppercase tracking-tight">Event</p>
                          <p className="text-xs xs:text-xs sm:text-sm font-medium text-stone-900 break-words">{reg.eventId?.title || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Type & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-3 md:gap-2.5">
                      {/* Type */}
                      <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <Tag size={14} className="xs:w-4 xs:h-4 sm:w-4 sm:h-4 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-500 font-semibold uppercase tracking-tight">Type</p>
                          <p className="text-xs xs:text-xs sm:text-sm font-medium text-stone-900 capitalize truncate">{reg.registrationType}</p>
                        </div>
                      </div>

                      {/* Registered Date */}
                      <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <Clock size={14} className="xs:w-4 xs:h-4 sm:w-4 sm:h-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-500 font-semibold uppercase tracking-tight">Registered</p>
                          <p className="text-xs xs:text-xs sm:text-sm font-medium text-stone-900">{new Date(reg.registeredAt).toLocaleDateString("en-IN")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Section - Status & Action */}
                  <div className="px-3 xs:px-4 sm:px-4 py-2.5 xs:py-3 sm:py-3 bg-stone-50/70 border-t border-stone-100/80 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
                    <span className={`text-xs xs:text-xs sm:text-xs font-bold px-2.5 xs:px-3 sm:px-3 py-1 xs:py-1.5 sm:py-1.5 rounded-full whitespace-nowrap inline-flex items-center ${getStatusColor(reg.status)}`}>
                      {getStatusLabel(reg.status)}
                    </span>
                    <div>
                      {reg.status === "registered" ? (
                        <button
                          onClick={() => handleMarkAttendance(reg._id)}
                          disabled={markingAttendance === reg._id}
                          className="px-2.5 xs:px-3 sm:px-3 py-1 xs:py-1.5 sm:py-1.5 text-xs xs:text-xs sm:text-xs font-bold rounded-lg bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1 xs:gap-1.5 sm:gap-1"
                        >
                          {markingAttendance === reg._id ? (
                            <Loader2 size={12} className="xs:w-4 xs:h-4 animate-spin" />
                          ) : (
                            <>
                              <span>✓</span>
                              <span className="hidden xs:inline">Done</span>
                            </>
                          )}
                        </button>
                      ) : reg.status === "attended" ? (
                        <span className="text-xs xs:text-xs sm:text-xs font-bold text-green-600 px-2.5 xs:px-3 sm:px-3 py-1 xs:py-1.5 sm:py-1.5 inline-flex items-center gap-1 xs:gap-1.5">
                          <span className="text-sm">✓</span>
                          <span className="hidden xs:inline">Attended</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination for Mobile & Tablet */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-3 xs:gap-3.5 sm:gap-4 mt-5 xs:mt-6 sm:mt-8 px-2 xs:px-3 sm:px-0">
              <span className="text-xs xs:text-xs sm:text-sm text-stone-600 text-center font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
              </span>
              <div className="flex items-center justify-center gap-0.5 xs:gap-1 sm:gap-1 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 xs:p-2 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="xs:w-5 xs:h-5 text-stone-600" />
                </button>
                <div className="flex gap-0.5 xs:gap-1 flex-wrap justify-center">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    if (totalPages <= 5) return i + 1;
                    if (currentPage <= 3) return i + 1;
                    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                    return currentPage - 2 + i;
                  }).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 xs:w-8 xs:h-8 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 xs:p-2 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} className="xs:w-5 xs:h-5 text-stone-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View (Large screens only) */}
        <div className="hidden lg:block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {loading ? (
            <div className="flex items-center justify-center py-20 md:py-24 lg:py-32">
              <Loader2 size={40} className="animate-spin text-stone-400" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-stone-50 to-stone-50/50 border-b border-stone-200/80">
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wider">
                        USER
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wider">
                        EMAIL
                      </th>
                      <th className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wider">
                        PHONE
                      </th>
                      <th className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wider">
                        EVENT
                      </th>
                      <th className="hidden lg:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wider">
                        TYPE
                      </th>
                      <th className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wider">
                        REGISTERED
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-stone-700 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 md:px-6 py-8 md:py-12 lg:py-16 text-center text-stone-500 text-xs md:text-sm">
                          {totalCount === 0 ? "No registrations found" : "No registrations match your search"}
                        </td>
                      </tr>
                    ) : (
                      registrations.map((reg) => (
                        <tr key={reg._id} className="border-b border-stone-200/50 hover:bg-stone-50/70 transition-colors duration-200">
                          <td className="px-4 md:px-6 py-3 md:py-4">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className={`w-9 md:w-10 h-9 md:h-10 rounded-full ${getAvatarColor(reg.fullName)} flex items-center justify-center text-xs md:text-sm font-semibold text-stone-700 flex-shrink-0 shadow-sm`}>
                                {getInitials(reg.fullName)}
                              </div>
                              <span className="font-medium text-stone-900 text-xs md:text-sm truncate">{reg.fullName}</span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-stone-600 truncate">{reg.email}</td>
                          <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-stone-600">{reg.phone}</td>
                          <td className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-stone-600">{reg.eventId?.title || "N/A"}</td>
                          <td className="hidden lg:table-cell px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-stone-600 capitalize">{reg.registrationType}</td>
                          <td className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4">
                            <span className={`inline-flex px-2.5 md:px-3 py-1 md:py-1.5 text-xs md:text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(reg.status)}`}>
                              {getStatusLabel(reg.status)}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-stone-600 whitespace-nowrap">
                            {new Date(reg.registeredAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                            {reg.status === "registered" ? (
                              <button
                                onClick={() => handleMarkAttendance(reg._id)}
                                disabled={markingAttendance === reg._id}
                                className="inline-flex items-center justify-center px-2.5 md:px-3 py-1 md:py-1.5 text-xs md:text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap gap-1 md:gap-1.5"
                              >
                                {markingAttendance === reg._id ? (
                                  <Loader2 size={12} className="md:w-4 md:h-4 animate-spin" />
                                ) : (
                                  <>
                                    <span>✓</span>
                                    <span className="hidden md:inline">Mark Attended</span>
                                  </>
                                )}
                              </button>
                            ) : reg.status === "attended" ? (
                              <span className="text-xs md:text-sm font-semibold text-green-600 inline-flex items-center gap-1">
                                <span>✓</span>
                                <span className="hidden md:inline">Attended</span>
                              </span>
                            ) : (
                              <span className="text-xs md:text-sm text-stone-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Desktop */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 border-t border-stone-200/80 bg-stone-50/30">
                  <span className="text-xs md:text-sm text-stone-600 order-2 md:order-1 text-center md:text-left font-medium">
                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                  </span>
                  <div className="flex items-center justify-center gap-1 md:gap-2 order-1 md:order-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 md:p-2 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} className="md:w-5 md:h-5 text-stone-600" />
                    </button>
                    <div className="flex gap-0.5 md:gap-1 flex-wrap justify-center">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        if (totalPages <= 5) return i + 1;
                        if (currentPage <= 3) return i + 1;
                        if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                        return currentPage - 2 + i;
                      }).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 md:w-8 md:h-8 text-xs font-semibold rounded-lg transition-all duration-200 ${
                            currentPage === page
                              ? "bg-green-600 text-white shadow-md"
                              : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 md:p-2 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} className="md:w-5 md:h-5 text-stone-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
