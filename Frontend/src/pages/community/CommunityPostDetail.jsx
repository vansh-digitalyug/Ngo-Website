import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHeart, FaRegHeart, FaComment, FaEdit, FaTrash, FaReply, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { API } from "../../utils/S3.js";

const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  
  .skeleton {
    background: linear-gradient(90deg, #e8e8e8 0%, #f0f0f0 50%, #e8e8e8 100%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }
`;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Avatar({ name, size = 40 }) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const palette = [
    "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
    "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
    "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
  ];
  const color = palette[(name || "").charCodeAt(0) % palette.length];
  return (
    <div style={{
      width: size, 
      height: size, 
      borderRadius: "50%", 
      background: color, 
      color: "#fff",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      fontWeight: 700, 
      fontSize: size * 0.36, 
      flexShrink: 0, 
      userSelect: "none",
      boxShadow: "0 4px 15px rgba(75, 85, 99, 0.2)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      border: "2px solid rgba(255, 255, 255, 0.3)",
    }}>
      {initials}
    </div>
  );
}

export default function CommunityPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editText, setEditText] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/api/posts/${id}`, { headers });
      const data = await res.json();
      setPost(data.data?.post || data.post || data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/api/posts/${id}/comments?limit=50`, { headers });
      const data = await res.json();
      setComments(Array.isArray(data.data?.comments) ? data.data.comments : []);
    } catch (e) { console.error(e); }
    finally { setCommentsLoading(false); }
  };

  const handleLike = async () => {
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch(`${API}/api/posts/${id}/like`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const liked = data.data?.liked;
      const likeCount = data.data?.likeCount;
      setPost(prev => ({ ...prev, likeCount, isLiked: liked }));
    } catch (e) { console.error(e); }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      if (res.ok) {
        setCommentText("");
        fetchComments();
        setPost(p => p ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p);
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleReply = async (parentCommentId) => {
    if (!replyText.trim() || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: replyText.trim(), parentComment: parentCommentId }),
      });
      if (res.ok) {
        setReplyText("");
        setReplyTo(null);
        fetchComments();
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await fetch(`${API}/api/posts/comments/${commentId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
      setPost(p => p ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) } : p);
    } catch (e) { console.error(e); }
  };

  // backend stores user id as "id" (not "_id") — confirmed from auth controller
  const userId = (user?.id || user?._id || "").toString();
  const isPostOwner = !!(user && post && userId &&
    userId === (post.author?._id || post.author || "").toString());

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      const res = await fetch(`${API}/api/posts/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) navigate("/community");
    } catch (e) { console.error(e); }
  };

  const handleEditPost = async () => {
    if (!editText.trim()) return;
    setEditSubmitting(true);
    try {
      const tags = editTags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await fetch(`${API}/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: editText.trim(), tags }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost(data.data?.post || post);
        setShowEdit(false);
      }
    } catch (e) { console.error(e); }
    finally { setEditSubmitting(false); }
  };

  const canDeleteComment = (author) => {
    if (!user) return false;
    const authorStr = (author?._id || author || "").toString();
    return userId === authorStr || user.role === "admin";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f1e8", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 700 }}>
        <div className="skeleton" style={{ height: 60, borderRadius: 12, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
      </div>
    </div>
  );

  if (!post) return (
    <div style={{ minHeight: "100vh", background: "#f5f1e8", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
        <p style={{ color: "#6b7280", fontSize: "1.1rem", fontWeight: 600 }}>Post not found</p>
        <button 
          onClick={() => navigate("/community")}
          style={{
            marginTop: 20,
            padding: "10px 24px",
            borderRadius: 10,
            border: "none",
            background: "#059669",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#047857"}
          onMouseLeave={e => e.currentTarget.style.background = "#059669"}
        >
          Back to Community
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f1e8", padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/community")}
          style={{
            background: "rgba(5, 150, 105, 0.1)",
            border: "none", 
            cursor: "pointer",
            display: "inline-flex", 
            alignItems: "center", 
            gap: 8,
            color: "#059669", 
            fontWeight: 700, 
            fontSize: 15, 
            marginBottom: 28, 
            padding: "10px 16px",
            borderRadius: 10,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
            e.currentTarget.style.transform = "translateX(-4px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <FaArrowLeft /> Back to Community
        </button>

        {/* ── Post card ── */}
        <div 
          className="fade-in-up"
          style={{
            background: "#ffffff", 
            borderRadius: 12, 
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)", 
            marginBottom: 28,
            border: "1px solid #e5e7eb",
          }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={post.author?.name} size={50} />
              <div>
                <div style={{ fontWeight: 700, color: "#1f2937", fontSize: 17 }}>
                  {post.author?.name || "Anonymous"}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                  {timeAgo(post.createdAt)}
                </div>
              </div>
            </div>
            {isPostOwner && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setEditText(post.text); setEditTags((post.tags || []).join(", ")); setShowEdit(true); }}
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1.5px solid rgba(59, 130, 246, 0.2)", 
                    borderRadius: 10,
                    padding: "8px 14px", 
                    cursor: "pointer", 
                    color: "#2563eb",
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6, 
                    fontSize: 14, 
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(29, 78, 216, 0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(29, 78, 216, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={handleDeletePost}
                  style={{
                    background: "linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)",
                    border: "1.5px solid rgba(220, 38, 38, 0.2)", 
                    borderRadius: 10,
                    padding: "8px 14px", 
                    cursor: "pointer", 
                    color: "#dc2626",
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6, 
                    fontSize: 14, 
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(220, 38, 38, 0.12)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>

          <p style={{ 
            margin: "0 0 20px", 
            color: "#374151", 
            lineHeight: 1.8, 
            fontSize: "1rem", 
            whiteSpace: "pre-wrap",
          }}>
            {post.text}
          </p>

          {post.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {post.tags.map(tag => (
                <span key={tag} style={{
                  background: "rgba(5, 150, 105, 0.1)",
                  color: "#059669", 
                  borderRadius: 999,
                  padding: "6px 14px", 
                  fontSize: 13, 
                  fontWeight: 700,
                  border: "1px solid rgba(5, 150, 105, 0.2)",
                  transition: "all 0.2s",
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 28, borderTop: "1px solid #e5e7eb", paddingTop: 18 }}>
            <button
              onClick={handleLike}
              style={{
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                padding: 0,
                display: "flex", 
                alignItems: "center", 
                gap: 8,
                color: post.isLiked ? "#dc2626" : "#6b7280",
                fontWeight: 700, 
                fontSize: 16, 
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={e => {
                if (!post.isLiked) {
                  e.currentTarget.style.color = "#059669";
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={e => {
                if (!post.isLiked) {
                  e.currentTarget.style.color = "#6b7280";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              {post.isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{post.likeCount || 0}</span>
            </button>
            <button style={{ 
              background: "none", border: "none", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontWeight: 700, fontSize: 16,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#6b8e23"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#6b7280"; }}
            >
              <FaComment /> {post.commentCount || 0} Comment{post.commentCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>

        {/* ── Add comment ── */}
        {token ? (
          <div 
            className="fade-in-up"
            style={{
              background: "#ffffff", 
              borderRadius: 12, 
              padding: "24px 28px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)", 
              marginBottom: 28,
              border: "1px solid #e5e7eb",
            }}>
            <h3 style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700, color: "#1f2937" }}>
              💬 Share Your Thoughts
            </h3>
            <div style={{ display: "flex", gap: 14 }}>
              <Avatar name={user?.name} size={40} />
              <div style={{ flex: 1 }}>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your thoughts…"
                  maxLength={500}
                  style={{
                    width: "100%", 
                    minHeight: 90, 
                    border: "2px solid #e5e7eb",
                    borderRadius: 12, 
                    padding: "12px 16px", 
                    fontSize: 15,
                    resize: "none", 
                    outline: "none", 
                    fontFamily: "inherit",
                    boxSizing: "border-box", 
                    color: "#1f2937",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    lineHeight: 1.6,
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#059669";
                    e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {commentText.length}/500
                  </div>
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || submitting}
                    style={{
                      padding: "10px 24px", 
                      borderRadius: 10, 
                      border: "none",
                      background: commentText.trim() && !submitting 
                        ? "linear-gradient(135deg, #059669 0%, #047857 100%)" 
                        : "#d1d5db",
                      color: "#fff", 
                      fontWeight: 700, 
                      fontSize: 15,
                      cursor: commentText.trim() && !submitting ? "pointer" : "not-allowed",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: commentText.trim() && !submitting ? "0 6px 16px rgba(15, 118, 110, 0.25)" : "none",
                    }}
                    onMouseEnter={e => {
                      if (commentText.trim() && !submitting) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 10px 24px rgba(15, 118, 110, 0.35)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (commentText.trim() && !submitting) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 6px 16px rgba(15, 118, 110, 0.25)";
                      }
                    }}
                  >
                    {submitting ? "Posting…" : "Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: "linear-gradient(135deg, rgba(107, 142, 35, 0.08) 0%, rgba(107, 142, 35, 0.04) 100%)",
            borderRadius: 18, 
            padding: "32px 28px", 
            marginBottom: 28,
            textAlign: "center", 
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            border: "1.5px solid rgba(107, 142, 35, 0.2)",
          }}>
            <p style={{ margin: "0 0 16px", color: "#475569", fontSize: "1.05rem", fontWeight: 600 }}>
              Sign in to join the conversation
            </p>
            <button 
              onClick={() => navigate("/login")}
              style={{
                background: "linear-gradient(135deg, #6b8e23, #556b2f)",
                color: "#fff", 
                border: "none", 
                borderRadius: 12,
                padding: "13px 36px", 
                fontWeight: 700, 
                fontSize: 15,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 6px 16px rgba(107, 142, 35, 0.25)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(107, 142, 35, 0.35)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(107, 142, 35, 0.25)";
              }}
            >
              Login to Comment
            </button>
          </div>
        )}

        {/* ── Comments ── */}
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1f2937", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <FaComment size={18} style={{ color: "#6b8e23" }} /> Comments ({post.commentCount || 0})
          </h3>
          {commentsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  background: "#fff", 
                  borderRadius: 14, 
                  padding: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: "30%", height: 14, marginBottom: 6, borderRadius: 4 }} />
                      <div className="skeleton" style={{ width: "50%", height: 10, borderRadius: 4 }} />
                    </div>
                  </div>
                  <div className="skeleton" style={{ width: "100%", height: 40, borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div style={{
              background: "linear-gradient(135deg, rgba(15, 118, 110, 0.03) 0%, rgba(13, 107, 99, 0.02) 100%)",
              borderRadius: 16, 
              padding: "48px 24px", 
              textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              border: "1px solid rgba(15, 118, 110, 0.1)",
            }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>💬</div>
              <p style={{ color: "#475569", margin: 0, fontSize: "1.02rem", fontWeight: 600 }}>
                No comments yet
              </p>
              <p style={{ color: "#6b7280", margin: "6px 0 0", fontSize: "0.95rem" }}>
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {comments.map((comment, idx) => (
                <div 
                  key={comment._id} 
                  style={{
                    background: "#fff", 
                    borderRadius: 16, 
                    padding: "20px 22px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.02)",
                    animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Comment header */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar name={comment.author?.name} size={38} />
                      <div>
                        <div style={{ fontWeight: 700, color: "#1f2937", fontSize: 15 }}>
                          {comment.author?.name || "Anonymous"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                          {timeAgo(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {token && (
                        <button
                          onClick={() => setReplyTo(
                            replyTo?.commentId === comment._id ? null :
                            { commentId: comment._id, authorName: comment.author?.name }
                          )}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#6b7280", fontSize: 13, display: "flex",
                            alignItems: "center", gap: 5, fontWeight: 700,
                            transition: "all 0.2s", padding: "4px 8px", borderRadius: 6,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = "#059669";
                            e.currentTarget.style.background = "rgba(15, 118, 110, 0.08)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = "#6b7280";
                            e.currentTarget.style.background = "none";
                          }}
                        >
                          <FaReply /> Reply
                        </button>
                      )}
                      {canDeleteComment(comment.author) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          style={{ 
                            background: "none", 
                            border: "none", 
                            cursor: "pointer", 
                            color: "#ef4444", 
                            fontSize: 14,
                            padding: "4px 8px",
                            borderRadius: 6,
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                            e.currentTarget.style.color = "#dc2626";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "none";
                            e.currentTarget.style.color = "#ef4444";
                          }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: 0, color: "#334155", fontSize: "0.96rem", lineHeight: 1.7 }}>
                    {comment.text}
                  </p>

                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <div style={{ marginTop: 14, paddingLeft: 16, borderLeft: "2.5px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 10 }}>
                      {comment.replies.map(reply => (
                        <div key={reply._id}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Avatar name={reply.author?.name} size={28} />
                              <div>
                                <span style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>{reply.author?.name || "Anonymous"}</span>
                                <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}>{timeAgo(reply.createdAt)}</span>
                              </div>
                            </div>
                            {canDeleteComment(reply.author) && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 12 }}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                          <p style={{ margin: 0, color: "#374151", fontSize: "0.88rem", lineHeight: 1.6, paddingLeft: 36 }}>
                            {reply.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyTo?.commentId === comment._id && (
                    <div style={{ marginTop: 14, paddingLeft: 16, borderLeft: "2.5px solid #059669" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Avatar name={user?.name} size={28} />
                        <div style={{ flex: 1 }}>
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder={`Replying to ${replyTo.authorName}…`}
                            maxLength={500}
                            style={{
                              width: "100%", minHeight: 64, border: "1.5px solid #e5e7eb",
                              borderRadius: 8, padding: "8px 12px", fontSize: 13,
                              resize: "none", outline: "none", fontFamily: "inherit",
                              boxSizing: "border-box",
                            }}
                            onFocus={e => { e.target.style.borderColor = "#059669"; }}
                            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }}
                          />
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                            <button
                              onClick={() => { setReplyTo(null); setReplyText(""); }}
                              style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 13 }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReply(comment._id)}
                              disabled={!replyText.trim() || submitting}
                              style={{
                                padding: "7px 18px", borderRadius: 8, border: "none",
                                background: replyText.trim() && !submitting ? "#059669" : "#9ca3af",
                                color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                              }}
                            >
                              {submitting ? "…" : "Reply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Post Modal ── */}
      {showEdit && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 16,
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560,
            padding: "32px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#111827" }}>Edit Post</h2>
              <button onClick={() => setShowEdit(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 20, padding: 4 }}>
                <FaTimes />
              </button>
            </div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              maxLength={2000}
              style={{
                width: "100%", minHeight: 130, border: "1.5px solid #e5e7eb",
                borderRadius: 12, padding: "14px 16px", fontSize: 15,
                resize: "vertical", outline: "none", fontFamily: "inherit",
                boxSizing: "border-box", color: "#111827", lineHeight: 1.65,
              }}
              onFocus={e => { e.target.style.borderColor = "#059669"; }}
              onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }}
            />
            <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "right", marginTop: 4, marginBottom: 14 }}>
              {editText.length}/2000
            </div>
            <input
              value={editTags}
              onChange={e => setEditTags(e.target.value)}
              placeholder="Tags: health, education (comma separated)"
              style={{
                width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12,
                padding: "12px 16px", fontSize: 14, outline: "none",
                fontFamily: "inherit", boxSizing: "border-box", marginBottom: 20, color: "#374151",
              }}
              onFocus={e => { e.target.style.borderColor = "#059669"; }}
              onBlur={e => { e.target.style.borderColor = "#e5e7eb"; }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowEdit(false)}
                style={{ padding: "11px 24px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditPost}
                disabled={!editText.trim() || editSubmitting}
                style={{
                  padding: "11px 28px", borderRadius: 10, border: "none",
                  background: editText.trim() && !editSubmitting ? "#059669" : "#9ca3af",
                  color: "#fff", fontWeight: 700, fontSize: 14,
                  cursor: editText.trim() && !editSubmitting ? "pointer" : "not-allowed",
                }}
              >
                {editSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
