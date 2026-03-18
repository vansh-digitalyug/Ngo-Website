import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle, Clock, XCircle, Trash2, ChevronDown, ChevronUp,
  MapPin, Users, Activity, Shield, Eye, AlertCircle, BarChart3,
  Search, Filter, RefreshCw, UserCheck, UserX, Star, Building2
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

// ─── helpers ────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem("token");

const authFetch = (url, opts = {}) =>
  fetch(url, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}`, ...(opts.headers || {}) }, credentials: "include" });

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Badge = ({ label, color }) => {
  const colors = {
    green:  { bg: "#d1fae5", text: "#065f46" },
    yellow: { bg: "#fef3c7", text: "#92400e" },
    red:    { bg: "#fee2e2", text: "#991b1b" },
    blue:   { bg: "#dbeafe", text: "#1e40af" },
    gray:   { bg: "#f3f4f6", text: "#374151" },
    purple: { bg: "#ede9fe", text: "#5b21b6" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, backgroundColor: c.bg, color: c.text, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
};

const verificationBadge = (s) => {
  if (s === "verified") return <Badge label="✓ Verified" color="green" />;
  if (s === "pending")  return <Badge label="⏳ Pending"  color="yellow" />;
  if (s === "rejected") return <Badge label="✗ Rejected" color="red" />;
  return <Badge label={s} color="gray" />;
};

const statusBadge = (s) => {
  if (s === "active")   return <Badge label="Active"   color="green" />;
  if (s === "inactive") return <Badge label="Inactive" color="gray" />;
  return <Badge label={s} color="gray" />;
};

const responsibilityBadge = (s) => {
  const map = { pending: ["yellow", "⏳ Pending"], active: ["green", "● Active"], revoked: ["red", "✗ Revoked"], completed: ["blue", "✓ Completed"] };
  const [c, l] = map[s] || ["gray", s];
  return <Badge label={l} color={c} />;
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>{value ?? "—"}</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{sub}</div>}
    </div>
  </div>
);

const Btn = ({ onClick, disabled, children, color = "blue", size = "sm" }) => {
  const palettes = {
    blue:   { bg: "#3b82f6", hover: "#2563eb" },
    green:  { bg: "#10b981", hover: "#059669" },
    red:    { bg: "#ef4444", hover: "#dc2626" },
    yellow: { bg: "#f59e0b", hover: "#d97706" },
    gray:   { bg: "#6b7280", hover: "#4b5563" },
    purple: { bg: "#8b5cf6", hover: "#7c3aed" },
  };
  const p = palettes[color] || palettes.blue;
  const pad = size === "xs" ? "5px 10px" : "7px 14px";
  const fs  = size === "xs" ? 11 : 13;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ padding: pad, background: disabled ? "#d1d5db" : p.bg, color: "#fff", border: "none", borderRadius: 7, fontSize: fs, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
    >{children}</button>
  );
};

const Pagination = ({ page, pages, total, onPage }) => {
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 }}>
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: page <= 1 ? "#f9fafb" : "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: 13 }}>← Prev</button>
      <span style={{ fontSize: 13, color: "#6b7280" }}>Page {page} of {pages} ({total} total)</span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} style={{ padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: page >= pages ? "#f9fafb" : "#fff", cursor: page >= pages ? "not-allowed" : "pointer", fontSize: 13 }}>Next →</button>
    </div>
  );
};

const EmptyRow = ({ msg }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: "#9ca3af" }}>
    <AlertCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
    <p style={{ margin: 0, fontSize: 15 }}>{msg}</p>
  </div>
);

// ─── COMMUNITIES TAB ────────────────────────────────────────────────────────
function CommunitiesTab() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPag]    = useState({ total: 0, pages: 1 });
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [vStatus, setVStatus]   = useState("");
  const [status, setStatus]     = useState("");
  const [areaType, setAreaType] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [acting, setActing]     = useState(null);
  const [note, setNote]         = useState("");
  const [detail, setDetail]     = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetch_ = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 12 });
    if (search)  p.set("search", search);
    if (vStatus) p.set("verificationStatus", vStatus);
    if (status)  p.set("status", status);
    if (areaType) p.set("areaType", areaType);
    authFetch(`${API_BASE_URL}/api/admin/communities?${p}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setItems(d.data.communities); setPag(d.data.pagination); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, vStatus, status, areaType, page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const loadDetail = (id) => {
    if (expanded === id) { setExpanded(null); setDetail(null); return; }
    setExpanded(id);
    setDetail(null);
    setLoadingDetail(true);
    authFetch(`${API_BASE_URL}/api/admin/communities/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setDetail(d.data); })
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  };

  const updateStatus = async (id, body) => {
    setActing(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/communities/${id}/status`, { method: "PUT", body: JSON.stringify(body) });
      const d = await res.json();
      if (d.success) { fetch_(); if (expanded === id) loadDetail(id); }
      else alert(d.message || "Failed");
    } catch { alert("Network error"); }
    finally { setActing(null); }
  };

  const deleteCommunity = async (id, name) => {
    if (!confirm(`Delete community "${name}"? This removes all related responsibilities and activities. Cannot be undone.`)) return;
    setActing(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/communities/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) fetch_();
      else alert(d.message || "Failed");
    } catch { alert("Network error"); }
    finally { setActing(null); }
  };

  const assignLeader = async (communityId, responsibilityId) => {
    setActing(communityId);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/communities/${communityId}/assign-leader`, { method: "PUT", body: JSON.stringify({ responsibilityId }) });
      const d = await res.json();
      if (d.success) { fetch_(); loadDetail(communityId); }
      else alert(d.message || "Failed");
    } catch { alert("Network error"); }
    finally { setActing(null); }
  };

  const areaTypeLabel = { mohalla: "Mohalla", gao: "Village (Gao)", ward: "Ward", colony: "Colony", village: "Village", town: "Town", other: "Other" };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            type="text" value={search} placeholder="Search name, city, district..."
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
          />
        </div>
        <select value={vStatus} onChange={e => { setVStatus(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Verification</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={areaType} onChange={e => { setAreaType(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Area Types</option>
          <option value="mohalla">Mohalla</option>
          <option value="gao">Gao (Village)</option>
          <option value="ward">Ward</option>
          <option value="colony">Colony</option>
          <option value="village">Village</option>
          <option value="town">Town</option>
          <option value="other">Other</option>
        </select>
        <button onClick={fetch_} style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading communities...</div>
      ) : items.length === 0 ? (
        <EmptyRow msg="No communities found matching your filters." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map(c => (
            <div key={c._id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              {/* Card Header */}
              <div
                onClick={() => loadDetail(c._id)}
                style={{ padding: "14px 18px", background: expanded === c._id ? "#f0f9ff" : "#fafafa", borderBottom: expanded === c._id ? "1px solid #bae6fd" : "1px solid transparent", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 12 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1f2937" }}>{c.name}</h3>
                    <span style={{ fontSize: 11, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 12 }}>
                      {areaTypeLabel[c.areaType] || c.areaType}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, color: "#6b7280", fontSize: 12 }}>
                    <MapPin size={11} /> {c.city}, {c.district}, {c.state}
                    {c.population && <span style={{ marginLeft: 8 }}>· {c.population.toLocaleString()} residents</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {verificationBadge(c.verificationStatus)}
                  {statusBadge(c.status)}
                  {expanded === c._id ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                </div>
              </div>

              {/* Expanded Detail */}
              {expanded === c._id && (
                <div style={{ padding: "20px 18px" }}>
                  {loadingDetail && !detail ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#9ca3af" }}>Loading detail...</div>
                  ) : detail ? (
                    <>
                      {/* Info Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20, fontSize: 13 }}>
                        <div style={{ background: "#f9fafb", padding: "12px 14px", borderRadius: 8 }}>
                          <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Address</div>
                          <div style={{ color: "#1f2937", fontWeight: 500 }}>{detail.community.address || "—"}</div>
                          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{detail.community.pincode || ""}</div>
                        </div>
                        <div style={{ background: "#f9fafb", padding: "12px 14px", borderRadius: 8 }}>
                          <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Created By</div>
                          <div style={{ color: "#1f2937", fontWeight: 500 }}>{detail.community.createdBy?.name || "—"}</div>
                          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{detail.community.createdBy?.email || ""}</div>
                        </div>
                        <div style={{ background: "#f9fafb", padding: "12px 14px", borderRadius: 8 }}>
                          <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Leader</div>
                          <div style={{ color: "#1f2937", fontWeight: 500 }}>{detail.community.currentLeaderName || "None"}</div>
                          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{detail.community.currentLeaderId?.email || ""}</div>
                        </div>
                        <div style={{ background: "#f9fafb", padding: "12px 14px", borderRadius: 8 }}>
                          <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Stats</div>
                          <div style={{ color: "#1f2937", fontSize: 12 }}>
                            <span>Responsibilities: {detail.community.stats?.totalResponsibilities ?? 0}</span><br />
                            <span>Activities: {detail.community.stats?.totalActivities ?? 0}</span>
                          </div>
                        </div>
                        <div style={{ background: "#f9fafb", padding: "12px 14px", borderRadius: 8 }}>
                          <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Registered</div>
                          <div style={{ color: "#1f2937", fontWeight: 500 }}>{fmt(detail.community.createdAt)}</div>
                        </div>
                      </div>

                      {/* Description */}
                      {detail.community.description && (
                        <div style={{ marginBottom: 16, fontSize: 13, color: "#4b5563", background: "#f9fafb", padding: "10px 14px", borderRadius: 8 }}>
                          <strong>Description:</strong> {detail.community.description}
                        </div>
                      )}

                      {/* Tags */}
                      {detail.community.tags?.length > 0 && (
                        <div style={{ marginBottom: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {detail.community.tags.map(t => (
                            <span key={t} style={{ padding: "3px 10px", background: "#ede9fe", color: "#5b21b6", borderRadius: 20, fontSize: 11 }}>#{t}</span>
                          ))}
                        </div>
                      )}

                      {/* Admin Note */}
                      {detail.community.adminNote && (
                        <div style={{ marginBottom: 16, background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                          <strong>Admin Note:</strong> {detail.community.adminNote}
                        </div>
                      )}

                      {/* Pending responsibilities (assign leader) */}
                      {detail.responsibilities?.filter(r => r.status === "pending" || r.status === "active").length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Responsibility Requests</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {detail.responsibilities.filter(r => r.status === "pending" || r.status === "active").map(r => (
                              <div key={r._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", gap: 8, flexWrap: "wrap" }}>
                                <div style={{ fontSize: 12 }}>
                                  <strong>{r.takenByName}</strong> · <span style={{ color: "#6b7280" }}>{r.role}</span>
                                  <span style={{ marginLeft: 8 }}>{responsibilityBadge(r.status)}</span>
                                </div>
                                {r.status === "pending" && r.role === "leader" && (
                                  <Btn size="xs" color="purple" onClick={() => assignLeader(c._id, r._id)} disabled={acting === c._id}>
                                    <Star size={11} /> Assign Leader
                                  </Btn>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin Note Input */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Admin Note (optional)</label>
                        <textarea
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          placeholder="Add a note for this decision..."
                          rows={2}
                          style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
                        {c.verificationStatus !== "verified" && (
                          <Btn color="green" onClick={() => updateStatus(c._id, { verificationStatus: "verified", adminNote: note })} disabled={acting === c._id}>
                            <CheckCircle size={14} /> Verify
                          </Btn>
                        )}
                        {c.verificationStatus !== "rejected" && (
                          <Btn color="yellow" onClick={() => updateStatus(c._id, { verificationStatus: "rejected", adminNote: note })} disabled={acting === c._id}>
                            <XCircle size={14} /> Reject
                          </Btn>
                        )}
                        {c.verificationStatus !== "pending" && (
                          <Btn color="gray" onClick={() => updateStatus(c._id, { verificationStatus: "pending", adminNote: note })} disabled={acting === c._id}>
                            <Clock size={14} /> Set Pending
                          </Btn>
                        )}
                        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
                        {c.status === "active" ? (
                          <Btn color="gray" onClick={() => updateStatus(c._id, { status: "inactive" })} disabled={acting === c._id}>
                            Deactivate
                          </Btn>
                        ) : (
                          <Btn color="blue" onClick={() => updateStatus(c._id, { status: "active" })} disabled={acting === c._id}>
                            Activate
                          </Btn>
                        )}
                        <div style={{ flex: 1 }} />
                        <Btn color="red" onClick={() => deleteCommunity(c._id, c.name)} disabled={acting === c._id}>
                          <Trash2 size={13} /> Delete
                        </Btn>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} pages={pagination.pages} total={pagination.total} onPage={setPage} />
    </div>
  );
}

// ─── RESPONSIBILITIES TAB ────────────────────────────────────────────────────
function ResponsibilitiesTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPag]  = useState({ total: 0, pages: 1 });
  const [page, setPage]       = useState(1);
  const [status, setStatus]   = useState("pending");
  const [role, setRole]       = useState("");
  const [expanded, setExpanded] = useState(null);
  const [acting, setActing]   = useState(null);

  const fetch_ = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 15 });
    if (status) p.set("status", status);
    if (role)   p.set("role", role);
    authFetch(`${API_BASE_URL}/api/admin/community-responsibilities?${p}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setItems(d.data.responsibilities); setPag(d.data.pagination); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, role, page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const updateStatus = async (id, newStatus, extra = {}) => {
    setActing(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/community-responsibilities/${id}/status`, { method: "PUT", body: JSON.stringify({ status: newStatus, ...extra }) });
      const d = await res.json();
      if (d.success) fetch_();
      else alert(d.message || "Failed");
    } catch { alert("Network error"); }
    finally { setActing(null); }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
          <option value="completed">Completed</option>
        </select>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Roles</option>
          <option value="leader">Leader</option>
          <option value="co-leader">Co-leader</option>
          <option value="coordinator">Coordinator</option>
          <option value="volunteer">Volunteer</option>
        </select>
        <button onClick={fetch_} style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading responsibilities...</div>
      ) : items.length === 0 ? (
        <EmptyRow msg="No responsibility requests found." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(r => (
            <div key={r._id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
              <div
                onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                style={{ padding: "12px 16px", background: expanded === r._id ? "#f0f9ff" : "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 10 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{r.takenByName}</span>
                    <Badge label={r.role} color={r.role === "leader" ? "purple" : "blue"} />
                    {responsibilityBadge(r.status)}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                    Community: <strong>{r.communityId?.name || "—"}</strong> · {r.communityId?.city}, {r.communityId?.state}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, fontSize: 12, color: "#9ca3af" }}>
                  {fmt(r.createdAt)}
                  {expanded === r._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expanded === r._id && (
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14, fontSize: 13 }}>
                    <div><span style={{ color: "#9ca3af" }}>Email:</span> {r.takenByEmail || r.takenBy?.email || "—"}</div>
                    <div><span style={{ color: "#9ca3af" }}>Phone:</span> {r.takenByPhone || r.takenBy?.phone || "—"}</div>
                    <div><span style={{ color: "#9ca3af" }}>Type:</span> <Badge label={r.takenByType === "ngo" ? "NGO" : "User"} color={r.takenByType === "ngo" ? "purple" : "blue"} /></div>
                    {r.startDate && <div><span style={{ color: "#9ca3af" }}>Started:</span> {fmt(r.startDate)}</div>}
                    {r.approvedBy && <div><span style={{ color: "#9ca3af" }}>Approved by:</span> {r.approvedBy?.name || "Admin"}</div>}
                    {r.revokedBy  && <div><span style={{ color: "#9ca3af" }}>Revoked by:</span>  {r.revokedBy?.name  || "Admin"}</div>}
                  </div>

                  {r.motivation && (
                    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 12 }}>
                      <strong>Motivation:</strong> {r.motivation}
                    </div>
                  )}

                  {r.responsibilities?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Responsibilities Mentioned:</div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#4b5563" }}>
                        {r.responsibilities.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  )}

                  {r.revokeReason && (
                    <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 12 }}>
                      <strong>Revoke Reason:</strong> {r.revokeReason}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid #e5e7eb" }}>
                    {r.status === "pending" && (
                      <Btn color="green" onClick={() => updateStatus(r._id, "active")} disabled={acting === r._id}>
                        <UserCheck size={13} /> Approve
                      </Btn>
                    )}
                    {(r.status === "pending" || r.status === "active") && (
                      <Btn color="red" onClick={() => { const reason = prompt("Revoke reason (optional):"); updateStatus(r._id, "revoked", { revokeReason: reason || "" }); }} disabled={acting === r._id}>
                        <UserX size={13} /> Revoke
                      </Btn>
                    )}
                    {r.status === "active" && (
                      <Btn color="blue" onClick={() => updateStatus(r._id, "completed")} disabled={acting === r._id}>
                        <CheckCircle size={13} /> Mark Completed
                      </Btn>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} pages={pagination.pages} total={pagination.total} onPage={setPage} />
    </div>
  );
}

// ─── ACTIVITIES TAB ──────────────────────────────────────────────────────────
function ActivitiesTab() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPag]    = useState({ total: 0, pages: 1 });
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState("completed");
  const [verified, setVerified] = useState("false");
  const [expanded, setExpanded] = useState(null);
  const [acting, setActing]     = useState(null);

  const fetch_ = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page, limit: 15 });
    if (status)   p.set("status", status);
    if (verified) p.set("adminVerified", verified);
    authFetch(`${API_BASE_URL}/api/admin/community-activities?${p}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setItems(d.data.activities); setPag(d.data.pagination); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, verified, page]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const verify = async (id, adminVerified) => {
    setActing(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/community-activities/${id}/verify`, { method: "PUT", body: JSON.stringify({ adminVerified }) });
      const d = await res.json();
      if (d.success) fetch_();
      else alert(d.message || "Failed");
    } catch { alert("Network error"); }
    finally { setActing(null); }
  };

  const deleteActivity = async (id) => {
    if (!confirm("Delete this activity? Cannot be undone.")) return;
    setActing(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/community-activities/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) fetch_();
      else alert(d.message || "Failed");
    } catch { alert("Network error"); }
    finally { setActing(null); }
  };

  const actTypeColor = { meeting: "blue", cleanup: "green", event: "purple", rally: "yellow", health_camp: "red", awareness: "gray" };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="planned">Planned</option>
        </select>
        <select value={verified} onChange={e => { setVerified(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Verification</option>
          <option value="false">Awaiting Verification</option>
          <option value="true">Admin Verified</option>
        </select>
        <button onClick={fetch_} style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading activities...</div>
      ) : items.length === 0 ? (
        <EmptyRow msg="No activities found matching your filters." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(a => (
            <div key={a._id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
              <div
                onClick={() => setExpanded(expanded === a._id ? null : a._id)}
                style={{ padding: "12px 16px", background: expanded === a._id ? "#f0f9ff" : "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 10 }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{a.title || a.activityType || "Activity"}</span>
                    <Badge label={a.activityType || "activity"} color={actTypeColor[a.activityType] || "gray"} />
                    {a.adminVerified
                      ? <Badge label="✓ Admin Verified" color="green" />
                      : <Badge label="Pending Review" color="yellow" />
                    }
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                    {a.communityId?.name || "—"} · {a.communityId?.city}, {a.communityId?.state}
                    {a.beneficiariesCount > 0 && <span> · {a.beneficiariesCount} beneficiaries</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, fontSize: 12, color: "#9ca3af" }}>
                  {fmt(a.completedDate || a.createdAt)}
                  {expanded === a._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expanded === a._id && (
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14, fontSize: 13 }}>
                    <div><span style={{ color: "#9ca3af" }}>Conducted By:</span> {a.conductedBy?.name || "—"}</div>
                    <div><span style={{ color: "#9ca3af" }}>Completed:</span> {fmt(a.completedDate)}</div>
                    {a.verifiedBy && <div><span style={{ color: "#9ca3af" }}>Verified By:</span> {a.verifiedBy?.name || "Admin"}</div>}
                    {a.verifiedAt && <div><span style={{ color: "#9ca3af" }}>Verified On:</span> {fmt(a.verifiedAt)}</div>}
                  </div>

                  {a.description && (
                    <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 12 }}>
                      {a.description}
                    </div>
                  )}

                  {a.completionReport && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 12 }}>
                      <strong>Completion Report:</strong> {a.completionReport}
                    </div>
                  )}

                  {a.adminNote && (
                    <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 12 }}>
                      <strong>Admin Note:</strong> {a.adminNote}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid #e5e7eb" }}>
                    {!a.adminVerified && (
                      <Btn color="green" onClick={() => verify(a._id, true)} disabled={acting === a._id}>
                        <CheckCircle size={13} /> Verify Activity
                      </Btn>
                    )}
                    {a.adminVerified && (
                      <Btn color="yellow" onClick={() => verify(a._id, false)} disabled={acting === a._id}>
                        <XCircle size={13} /> Revoke Verification
                      </Btn>
                    )}
                    <div style={{ flex: 1 }} />
                    <Btn color="red" onClick={() => deleteActivity(a._id)} disabled={acting === a._id}>
                      <Trash2 size={13} /> Delete
                    </Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} pages={pagination.pages} total={pagination.total} onPage={setPage} />
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
function AdminCommunities() {
  const [stats, setStats]   = useState(null);
  const [tab, setTab]       = useState("communities");

  useEffect(() => {
    authFetch(`${API_BASE_URL}/api/admin/communities/stats`)
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, []);

  const pendingComm  = stats?.communities?.pending        ?? 0;
  const pendingResp  = stats?.responsibilities?.total
    ? null : null; // fetched live inside tab
  const pendingActs  = stats?.activities?.pendingVerification ?? 0;

  const tabs = [
    { key: "communities",      label: "Communities",     icon: Building2, badge: pendingComm  },
    { key: "responsibilities", label: "Responsibilities", icon: Shield,    badge: null         },
    { key: "activities",       label: "Activities",       icon: Activity,  badge: pendingActs  },
  ];

  return (
    <div style={{ padding: "0 0 40px 0" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="admin-page-title" style={{ marginBottom: 4 }}>Community Management</h1>
        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>Verify communities, manage responsibilities and review activities</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
          <StatCard icon={Building2}  label="Total Communities"    value={stats.communities?.total}     color="#3b82f6" />
          <StatCard icon={CheckCircle} label="Verified"            value={stats.communities?.verified}  color="#10b981" />
          <StatCard icon={Clock}       label="Pending Review"      value={stats.communities?.pending}   color="#f59e0b" />
          <StatCard icon={XCircle}     label="Rejected"            value={stats.communities?.rejected}  color="#ef4444" />
          <StatCard icon={Shield}      label="Active Leaders"      value={stats.responsibilities?.active} color="#8b5cf6" />
          <StatCard icon={Activity}    label="Pending Activity Verification" value={stats.activities?.pendingVerification} color="#f97316" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 24 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 20px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "#3b82f6" : "#6b7280",
              borderBottom: tab === t.key ? "2px solid #3b82f6" : "2px solid transparent",
              marginBottom: -2,
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "all 0.15s",
            }}
          >
            <t.icon size={16} />
            {t.label}
            {t.badge > 0 && (
              <span style={{ marginLeft: 6, padding: "1px 7px", background: "#ef4444", color: "#fff", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "communities"     && <CommunitiesTab />}
      {tab === "responsibilities" && <ResponsibilitiesTab />}
      {tab === "activities"      && <ActivitiesTab />}
    </div>
  );
}

export default AdminCommunities;
