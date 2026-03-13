import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Loader, Send } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";
import { useFlash } from "../../components/common/FlashMessage.jsx";

const STATUS_OPTIONS = ["New", "In Progress", "Resolved", "Spam"];

function AdminContacts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const token = localStorage.getItem("token");
  const flash = useFlash();

  const fetchContacts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page);
    params.set("limit", 10);

    fetch(`${API_BASE_URL}/api/contact/all?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setContacts(d.contacts || []);
          setPagination({ 
            total: d.count || 0, 
            pages: Math.ceil((d.count || 0) / 10) 
          });
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        flash.error("Failed to load contacts");
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, page, token, flash]);

  useEffect(() => { 
    fetchContacts(); 
  }, [fetchContacts]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, page, setSearchParams]);

  const viewContact = (contact) => {
    setSelectedContact(contact);
    setReplyMessage("");
    setShowReplyModal(true);
  };

  const closeModal = () => {
    setSelectedContact(null);
    setShowReplyModal(false);
    setReplyMessage("");
  };

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      const d = await res.json();
      if (d.success) {
        flash.success(`Status updated to "${status}"`);
        fetchContacts();
        if (selectedContact && selectedContact._id === id) {
          setSelectedContact({...selectedContact, status});
        }
      } else {
        flash.error(d.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error:", error);
      flash.error("Network error");
    }
    finally { 
      setActionLoading(null); 
    }
  };

  const deleteContact = async (id) => {
    if (!confirm("Delete this contact message? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      const d = await res.json();
      if (d.success) {
        flash.success("Contact deleted successfully");
        fetchContacts();
        if (selectedContact && selectedContact._id === id) {
          closeModal();
        }
      } else {
        flash.error(d.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Error:", error);
      flash.error("Network error");
    }
    finally { 
      setActionLoading(null); 
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || replyMessage.trim().length < 10) {
      flash.warning("Reply message must be at least 10 characters");
      return;
    }

    setSendingReply(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${selectedContact._id}/reply`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        credentials: "include",
        body: JSON.stringify({ 
          replyMessage: replyMessage.trim(),
          adminName: "SevaIndia Support Team"
        })
      });
      const d = await res.json();
      if (d.success) {
        flash.success(`Reply sent successfully to ${selectedContact.email}`);
        setShowReplyModal(false);
        setReplyMessage("");
        setSelectedContact({...selectedContact, status: "Resolved"});
        fetchContacts();
      } else {
        flash.error(d.message || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error:", error);
      flash.error("Network error - could not send reply");
    }
    finally { 
      setSendingReply(false); 
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { 
    day: "numeric", 
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "—";
  
  const getStatusColor = (status) => {
    const colors = {
      "New": "#eb5757",
      "In Progress": "#2196f3",
      "Resolved": "#0eaa00",
      "Spam": "#9c27b0"
    };
    return colors[status] || "#757575";
  };

  return (
    <div>
      <h1 className="admin-page-title"><Mail size={24} style={{ marginRight: 10, verticalAlign: 'middle' }} />Manage Contacts</h1>

      <div className="admin-filters" style={{ marginBottom: "20px", display: "flex", gap: "15px" }}>
        <input
          type="text"
          placeholder="Search by name, email, subject..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="admin-search-input"
          style={{
            flex: 1,
            padding: "10px 15px",
            borderRadius: "6px",
            border: "1px solid #e0e0e0",
            fontSize: "14px"
          }}
        />
        <select 
          value={statusFilter} 
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
          className="admin-filter-select"
          style={{
            padding: "10px 15px",
            borderRadius: "6px",
            border: "1px solid #e0e0e0",
            backgroundColor: "#fff",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-table-wrapper">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            <p>Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <p>No contacts found.</p>
          </div>
        ) : (
          <>
            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "12px", fontWeight: "600" }}>Name</th>
                  <th style={{ textAlign: "left", padding: "12px", fontWeight: "600" }}>Email</th>
                  <th style={{ textAlign: "left", padding: "12px", fontWeight: "600" }}>Subject</th>
                  <th style={{ textAlign: "center", padding: "12px", fontWeight: "600" }}>Status</th>
                  <th style={{ textAlign: "center", padding: "12px", fontWeight: "600" }}>Date</th>
                  <th style={{ textAlign: "center", padding: "12px", fontWeight: "600" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => (
                  <tr 
                    key={c._id}
                    style={{
                      borderBottom: "1px solid #eee",
                      backgroundColor: c.status === "New" ? "#fff5f5" : "transparent"
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      <strong>{c.name}</strong>
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px", color: "#666" }}>
                      {c.email}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      maxWidth: "200px", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      whiteSpace: "nowrap",
                      fontSize: "14px"
                    }}>
                      {c.subject}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px" }}>
                      <span 
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          backgroundColor: getStatusColor(c.status),
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: "12px", fontSize: "14px", color: "#666" }}>
                      {formatDate(c.createdAt)}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => viewContact(c)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#4caf50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => deleteContact(c._id)}
                          disabled={actionLoading === c._id}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: actionLoading === c._id ? "not-allowed" : "pointer",
                            fontSize: "12px",
                            opacity: actionLoading === c._id ? 0.6 : 1
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination.pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px", padding: "20px", alignItems: "center" }}>
                <button 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: page <= 1 ? "#ccc" : "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: page <= 1 ? "not-allowed" : "pointer"
                  }}
                >
                  ← Prev
                </button>
                <span style={{ color: "#666", fontWeight: "600" }}>
                  Page {page} of {pagination.pages} ({pagination.total} total)
                </span>
                <button 
                  disabled={page >= pagination.pages} 
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: page >= pagination.pages ? "#ccc" : "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: page >= pagination.pages ? "not-allowed" : "pointer"
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reply Modal */}
      {selectedContact && showReplyModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "30px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", color: "#333" }}>✉️ Send Email Reply</h2>
              <button
                onClick={closeModal}
                style={{
                  fontSize: "24px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ✕
              </button>
            </div>

            {/* Recipient Info */}
            <div style={{ 
              backgroundColor: "#e8f5e9", 
              padding: "15px", 
              borderRadius: "8px", 
              marginBottom: "20px",
              borderLeft: "4px solid #4caf50"
            }}>
              <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#2e7d32" }}>
                <strong>To:</strong> {selectedContact.name} &lt;{selectedContact.email}&gt;
              </p>
              <p style={{ margin: 0, fontSize: "14px", color: "#2e7d32" }}>
                <strong>Subject:</strong> Re: {selectedContact.subject}
              </p>
            </div>

            {/* Original Message Preview */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#666", fontWeight: "600" }}>
                Original Message:
              </p>
              <div style={{
                backgroundColor: "#f5f5f5",
                padding: "12px",
                borderRadius: "6px",
                fontSize: "13px",
                color: "#666",
                fontStyle: "italic",
                maxHeight: "100px",
                overflowY: "auto",
                lineHeight: "1.5"
              }}>
                "{selectedContact.message}"
              </div>
            </div>

            {/* Reply Textarea */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "#333" 
              }}>
                Your Reply: <span style={{ color: "#f44336" }}>*</span>
              </label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write your professional response here..."
                disabled={sendingReply}
                style={{
                  width: "100%",
                  minHeight: "160px",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  resize: "vertical",
                  fontFamily: "inherit",
                  boxSizing: "border-box"
                }}
              />
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#999" }}>
                Minimum 10 characters required.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={sendReply}
                disabled={sendingReply || replyMessage.trim().length < 10}
                style={{
                  flex: 1,
                  padding: "14px",
                  backgroundColor: sendingReply || replyMessage.trim().length < 10 ? "#ccc" : "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: sendingReply || replyMessage.trim().length < 10 ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {sendingReply ? (
                  <><Loader size={16} style={{ marginRight: 6 }} className="spin" /> Sending...</>
                ) : (
                  <><Send size={16} style={{ marginRight: 6 }} /> Send Reply</>
                )}
              </button>
              <button
                onClick={closeModal}
                disabled={sendingReply}
                style={{
                  padding: "14px 28px",
                  backgroundColor: "#757575",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: sendingReply ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContacts;
