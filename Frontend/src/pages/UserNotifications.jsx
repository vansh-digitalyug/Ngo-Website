import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle, Trash2, Check, X, Bell } from "lucide-react";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, unread, event_cancelled, venue_shifted, time_shifted
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  const getApiUrl = () => {
    let baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    baseUrl = baseUrl.replace(/\/$/, "");
    if (!baseUrl.endsWith("/api")) {
      baseUrl += "/api";
    }
    return baseUrl;
  };

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [filter, currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view notifications");
        setLoading(false);
        return;
      }

      const apiUrl = getApiUrl();
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (filter === "unread") {
        params.append("isRead", "false");
      }

      const response = await fetch(
        `${apiUrl}/notifications/user/all?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        let filteredData = data.data || [];

        if (filter !== "all" && filter !== "unread") {
          filteredData = filteredData.filter(
            (notif) => notif.type === filter
          );
        }

        setNotifications(filteredData);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = getApiUrl();

      const response = await fetch(
        `${apiUrl}/notifications/user/${notificationId}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = getApiUrl();

      const response = await fetch(
        `${apiUrl}/notifications/user/${notificationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notif) => notif._id !== notificationId)
        );
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "EVENT_CANCELLED":
        return <AlertCircle size={18} className="text-red-500" />;
      case "VENUE_SHIFTED":
      case "TIME_SHIFTED":
        return <AlertCircle size={18} className="text-blue-500" />;
      case "REGISTRATION_CONFIRMED":
        return <CheckCircle size={18} className="text-green-500" />;
      default:
        return <Bell size={18} className="text-stone-500" />;
    }
  };

  const getNotificationBgColor = (type, isRead) => {
    if (isRead) return "bg-stone-50 border-l-4 border-stone-200";
    switch (type) {
      case "EVENT_CANCELLED":
        return "bg-red-50 border-l-4 border-red-300";
      case "VENUE_SHIFTED":
      case "TIME_SHIFTED":
        return "bg-blue-50 border-l-4 border-blue-300";
      default:
        return "bg-amber-50 border-l-4 border-amber-300";
    }
  };

  const notificationTypeLabels = {
    all: "All Notifications",
    unread: "Unread Only",
    EVENT_CANCELLED: "Event Cancelled",
    VENUE_SHIFTED: "Venue Changed",
    TIME_SHIFTED: "Time Changed",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={32} className="text-amber-600" />
            Your Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all your event notifications and updates
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          {["all", "unread", "EVENT_CANCELLED", "VENUE_SHIFTED", "TIME_SHIFTED"].map(
            (filterOption) => (
              <button
                key={filterOption}
                onClick={() => {
                  setFilter(filterOption);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === filterOption
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {notificationTypeLabels[filterOption]}
              </button>
            )
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">No notifications</p>
              <p className="text-gray-500 text-sm mt-1">
                Notifications will appear here as events are updated
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-6 py-4 transition-all hover:bg-gray-50 ${getNotificationBgColor(
                    notification.type,
                    notification.isRead
                  )}`}
                >
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3
                            className={`font-bold text-sm ${
                              notification.isRead
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              notification.isRead
                                ? "text-gray-600"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.message}
                          </p>
                          {notification.description && (
                            <p className="text-sm text-gray-600 mt-2 p-2 bg-white/50 rounded border-l-2 border-gray-300">
                              {notification.description}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              notification.priority === "urgent"
                                ? "bg-red-100 text-red-700"
                                : notification.priority === "high"
                                ? "bg-orange-100 text-orange-700"
                                : notification.priority === "medium"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {notification.priority}
                          </span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          {notification.eventId && (
                            <span className="font-medium text-gray-700">
                              📅 {notification.eventId.title}
                            </span>
                          )}
                          <span>
                            {new Date(notification.createdAt).toLocaleDateString(
                              "en-IN"
                            )}{" "}
                            at{" "}
                            {new Date(notification.createdAt).toLocaleTimeString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() =>
                                handleMarkAsRead(notification._id)
                              }
                              className="text-blue-600 hover:text-blue-700 font-semibold hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 About Notifications</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>✓ Receive event updates when registered for an event</li>
            <li>✓ Get notified about venue, time, or date changes</li>
            <li>✓ Important announcements from event organizers</li>
            <li>✓ Mark as read or delete notifications as needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
