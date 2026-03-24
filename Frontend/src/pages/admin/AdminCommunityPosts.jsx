import { useState, useEffect, useCallback } from "react";
import { FaTrash, FaChevronDown, FaChevronUp, FaSearch, FaComment, FaHeart } from "react-icons/fa";
import { API } from "../../utils/S3.js";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago` : new Date(dateStr).toLocaleDateString();
}

function Avatar({ name, size = 34 }) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const palette = ["#0f766e", "#1d4ed8", "#7c3aed", "#b45309", "#dc2626"];
  const color = palette[(name || "").charCodeAt(0) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
    }}>{initials}</div>
  );
}

export default function AdminCommunityPosts() {
  const token = localStorage.getItem("token");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalComments: 0 });

  const fetchPosts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      const res = await fetch(`${API}/api/posts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data.data?.posts) ? data.data.posts : [];
      const pagination = data.data?.pagination || {};
      setPosts(list);
      setTotalPages(pagination.pages || 1);
      if (p === 1) {
        const totalLikes = list.reduce((s, p) => s + (p.likeCount || 0), 0);
        const totalComments = list.reduce((s, p) => s + (p.commentCount || 0), 0);
        setStats({ totalPosts: pagination.total || list.length, totalLikes, totalComments });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchPosts(page); }, [page, fetchPosts]);

  const fetchComments = async (postId) => {
    setCommentsLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`${API}/api/posts/${postId}/comments?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setComments(prev => ({ ...prev, [postId]: Array.isArray(data.data?.comments) ? data.data.comments : [] }));
    } catch (e) { console.error(e); }
    finally { setCommentsLoading(prev => ({ ...prev, [postId]: false })); }
  };

  const toggleExpand = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) fetchComments(postId);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      const res = await fetch(`${API}/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p._id !== postId));
        if (expandedPost === postId) setExpandedPost(null);
      }
    } catch (e) { console.error(e); }
  };

  const deleteComment = async (commentId, postId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`${API}/api/posts/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComments(prev => ({
          ...prev,
          [postId]: prev[postId]?.filter(c => {
            if (c._id === commentId) return false;
            c.replies = c.replies?.filter(r => r._id !== commentId);
            return true;
          }),
        }));
        setPosts(prev => prev.map(p =>
          p._id === postId ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) } : p
        ));
      }
    } catch (e) { console.error(e); }
  };

  const filteredPosts = posts.filter(p =>
    !search.trim() ||
    (p.author?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.text || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "28px 24px", minHeight: "100vh", background: "#f8fafc" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>
        Community Posts
      </h1>
      <p style={{ color: "#6b7280", margin: "0 0 28px", fontSize: "0.95rem" }}>
        Moderate community posts and comments.
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Posts", value: stats.totalPosts, color: "#0f766e", bg: "#f0fdf4" },
          { label: "Total Likes", value: stats.totalLikes, color: "#dc2626", bg: "#fef2f2" },
          { label: "Total Comments", value: stats.totalComments, color: "#1d4ed8", bg: "#eff6ff" },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 14, padding: "20px 22px",
            border: `1px solid ${s.color}22`,
          }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "#fff", borderRadius: 12, padding: "12px 16px",
        border: "1.5px solid #e5e7eb", marginBottom: 20, maxWidth: 420,
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      }}>
        <FaSearch style={{ color: "#9ca3af", flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by author, text, or tag…"
          style={{ border: "none", outline: "none", width: "100%", fontSize: 14, background: "transparent", color: "#374151" }}
        />
      </div>

      {/* Posts list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>Loading posts…</div>
      ) : filteredPosts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>No posts found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredPosts.map(post => (
            <div key={post._id} style={{
              background: "#fff", borderRadius: 16,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}>
              {/* Post row */}
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
                    <Avatar name={post.author?.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{post.author?.name || "Anonymous"}</span>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{timeAgo(post.createdAt)}</span>
                      </div>
                      <p style={{
                        margin: 0, color: "#374151", fontSize: "0.9rem", lineHeight: 1.5,
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {post.text}
                      </p>
                      {post.tags?.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                          {post.tags.map(tag => (
                            <span key={tag} style={{
                              background: "#eff6ff", color: "#1d4ed8", borderRadius: 999,
                              padding: "2px 8px", fontSize: 11, fontWeight: 600,
                            }}>#{tag}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#9ca3af", fontSize: 13 }}>
                          <FaHeart style={{ color: "#ef4444" }} /> {post.likeCount || 0}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#9ca3af", fontSize: 13 }}>
                          <FaComment style={{ color: "#3b82f6" }} /> {post.commentCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                    <button
                      onClick={() => toggleExpand(post._id)}
                      style={{
                        background: "#f3f4f6", border: "none", borderRadius: 8,
                        padding: "8px 12px", cursor: "pointer", color: "#374151",
                        display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600,
                      }}
                    >
                      {expandedPost === post._id ? <FaChevronUp /> : <FaChevronDown />}
                      {expandedPost === post._id ? "Hide" : "Comments"}
                    </button>
                    <button
                      onClick={() => deletePost(post._id)}
                      style={{
                        background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
                        padding: "8px 12px", cursor: "pointer", color: "#dc2626",
                        display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600,
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded comments */}
              {expandedPost === post._id && (
                <div style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa", padding: "16px 20px" }}>
                  <h4 style={{ margin: "0 0 14px", fontSize: "0.9rem", fontWeight: 700, color: "#374151" }}>
                    Comments ({post.commentCount || 0})
                  </h4>
                  {commentsLoading[post._id] ? (
                    <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading comments…</p>
                  ) : !comments[post._id]?.length ? (
                    <p style={{ color: "#9ca3af", fontSize: 13 }}>No comments yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {comments[post._id].map(comment => (
                        <div key={comment._id} style={{
                          background: "#fff", borderRadius: 10, padding: "12px 14px",
                          border: "1px solid #e5e7eb",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Avatar name={comment.author?.name} size={28} />
                              <div>
                                <span style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>{comment.author?.name || "Anonymous"}</span>
                                <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6 }}>{timeAgo(comment.createdAt)}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteComment(comment._id, post._id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13 }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <p style={{ margin: 0, color: "#374151", fontSize: "0.875rem", lineHeight: 1.5 }}>{comment.text}</p>

                          {/* Replies */}
                          {comment.replies?.length > 0 && (
                            <div style={{ marginTop: 10, paddingLeft: 14, borderLeft: "2px solid #e5e7eb" }}>
                              {comment.replies.map(reply => (
                                <div key={reply._id} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                  <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                      <Avatar name={reply.author?.name} size={22} />
                                      <span style={{ fontWeight: 700, color: "#111827", fontSize: 12 }}>{reply.author?.name || "Anonymous"}</span>
                                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{timeAgo(reply.createdAt)}</span>
                                    </div>
                                    <p style={{ margin: 0, color: "#374151", fontSize: "0.83rem", lineHeight: 1.5, paddingLeft: 28 }}>{reply.text}</p>
                                  </div>
                                  <button
                                    onClick={() => deleteComment(reply._id, post._id)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 12, flexShrink: 0 }}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "9px 20px", borderRadius: 9, border: "1.5px solid #e5e7eb",
              background: page === 1 ? "#f3f4f6" : "#fff", cursor: page === 1 ? "not-allowed" : "pointer",
              color: page === 1 ? "#9ca3af" : "#374151", fontWeight: 600, fontSize: 14,
            }}
          >
            ← Prev
          </button>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 14 }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: "9px 20px", borderRadius: 9, border: "1.5px solid #e5e7eb",
              background: page === totalPages ? "#f3f4f6" : "#fff", cursor: page === totalPages ? "not-allowed" : "pointer",
              color: page === totalPages ? "#9ca3af" : "#374151", fontWeight: 600, fontSize: 14,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
