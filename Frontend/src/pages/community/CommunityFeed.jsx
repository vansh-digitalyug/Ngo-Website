import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaHeart, FaRegHeart, FaComment, FaTimes,
  FaUsers, FaFire, FaArrowRight, FaPen, FaEllipsisH,
} from "react-icons/fa";
import { API } from "../../utils/S3.js";

/* ─────────────────────────────────────────
   Global keyframes injected once
───────────────────────────────────────── */
const STYLES = `
  @keyframes cfFadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes cfSlideIn {
    from { opacity:0; transform:translateX(-32px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes cfShimmer {
    0%   { background-position:-900px 0; }
    100% { background-position: 900px 0; }
  }
  @keyframes cfFloat {
    0%,100% { transform:translateY(0); }
    50%     { transform:translateY(-12px); }
  }
  @keyframes cfPop {
    0%   { transform:scale(1); }
    40%  { transform:scale(1.28); }
    100% { transform:scale(1); }
  }
  .cf-fade  { animation:cfFadeUp  0.55s ease-out both; }
  .cf-slide { animation:cfSlideIn 0.55s ease-out both; }
  .cf-float { animation:cfFloat 5s ease-in-out infinite; }
  .cf-skel  {
    background:linear-gradient(90deg,#e8e8e8 0%,#f0f0f0 50%,#e8e8e8 100%);
    background-size:900px 100%;
    animation:cfShimmer 1.8s infinite;
    border-radius:8px;
  }
`;

/* ─────────────────────────────────────────
   Tag catalogue  (color · light bg · dark shade)
───────────────────────────────────────── */
const TAGS = {
  "":          { emoji:"🌐", label:"All",         color:"#059669", light:"#dcfce7", dark:"#bbf7d0" },
  health:      { emoji:"🏥", label:"Health",      color:"#059669", light:"#dcfce7", dark:"#bbf7d0" },
  education:   { emoji:"📚", label:"Education",   color:"#059669", light:"#dcfce7", dark:"#bbf7d0" },
  women:       { emoji:"💜", label:"Women",       color:"#059669", light:"#dcfce7", dark:"#bbf7d0" },
  children:    { emoji:"🌟", label:"Children",    color:"#059669", light:"#dcfce7", dark:"#bbf7d0" },
  elderly:     { emoji:"🤍", label:"Elderly",     color:"#059669", light:"#dcfce7", dark:"#bbf7d0" },
  environment: { emoji:"🌿", label:"Environment", color:"#059669", light:"#dcfce7", dark:"#bbf7d0" },
  general:     { emoji:"💬", label:"General",     color:"#059669", light:"#dcfce7", dark:"#bbf7d0" },
  events:      { emoji:"🎉", label:"Events",      color:"#059669", light:"#dcfce7", dark:"#bbf7d0" },
};
const TAG_ORDER = Object.keys(TAGS);

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24);
  return dy < 30 ? `${dy}d ago` : new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
}

function readTime(text = "") {
  const w = text.trim().split(/\s+/).length;
  const mins = Math.ceil(w / 200);
  return mins <= 1 ? "1 min read" : `${mins} min read`;
}

/* ─────────────────────────────────────────
   Avatar
───────────────────────────────────────── */
function Avatar({ name = "?", size = 44 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const stops = [
    ["#6b7280","#9ca3af"], ["#d97706","#f59e0b"], ["#0891b2","#06b6d4"],
    ["#7c3aed","#a78bfa"], ["#059669","#10b981"], ["#dc2626","#ef4444"],
    ["#2563eb","#3b82f6"],
  ];
  const [a, b] = stops[name.charCodeAt(0) % stops.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${a},${b})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.38,
      boxShadow: `0 4px 16px ${a}44`, border: "2px solid rgba(255,255,255,0.5)",
      userSelect: "none", letterSpacing: "-0.5px",
    }}>
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────
   Post Card  ← Light theme + inline comments
───────────────────────────────────────── */
function PostCard({ post, onLike, onCommentCountChange, delay = 0 }) {
  const [hov, setHov] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLike = (e) => {
    e.stopPropagation();
    onLike(e, post._id);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 600);
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`${API}/api/posts/${post._id}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setComments(Array.isArray(data.data?.comments) ? data.data.comments : []);
    } catch (e) {
      console.error(e);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchComments = async () => {
    if (!showComments) {
      setShowComments(true);
      if (comments.length > 0) return;
      await loadComments();
    } else {
      setShowComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!token) { navigate("/login"); return; }
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/posts/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        await loadComments();
        if (onCommentCountChange) onCommentCountChange(post._id, 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId) => {
    if (!token) { navigate("/login"); return; }
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/posts/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: replyText.trim(), parentComment: parentCommentId }),
      });
      if (res.ok) {
        setReplyText("");
        setReplyTo(null);
        await loadComments();
        if (onCommentCountChange) onCommentCountChange(post._id, 1);
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleCommentLike = async (e, commentId, isReply, parentId) => {
    e.stopPropagation();
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch(`${API}/api/posts/comments/${commentId}/like`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const { liked, likeCount } = data.data || {};
      setComments(prev => prev.map(c => {
        if (!isReply && c._id === commentId) return { ...c, isLiked: liked, likeCount };
        if (isReply && c._id === parentId) {
          return {
            ...c,
            replies: (c.replies || []).map(r =>
              r._id === commentId ? { ...r, isLiked: liked, likeCount } : r
            ),
          };
        }
        return c;
      }));
    } catch (e) { console.error(e); }
  };

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="cf-fade"
      style={{
        borderRadius: 12,
        overflow: "hidden",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: hov
          ? "0 10px 25px rgba(0, 0, 0, 0.08)"
          : "0 4px 12px rgba(0, 0, 0, 0.04)",
        transition: "all 0.28s ease-out",
        animationDelay: `${delay}s`,
      }}
    >
      {/* ── Card body ── */}
      <Link
        to={`/community/${post._id}`}
        style={{ padding: "20px 24px", display: "block", textDecoration: "none", color: "inherit", cursor: "pointer" }}
      >

        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Avatar name={post.author?.name} size={48} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, color: "#1f2937", fontSize: 15,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {post.author?.name || "Anonymous"}
              {(() => {
                const u = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
                const uid = (u?.id || u?._id || "").toString();
                const authorId = (post.author?._id || post.author || "").toString();
                return uid && uid === authorId;
              })() && (
                <span style={{
                  background: "#dcfce7", color: "#047857", fontSize: 10, fontWeight: 800,
                  padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em",
                }}>YOU</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
              {timeAgo(post.createdAt || new Date())}
            </div>
          </div>

          {/* Menu button */}
          <button
            onClick={e => e.stopPropagation()}
            style={{
              background: "transparent", border: "none", color: "#9ca3af",
              fontSize: 18, cursor: "pointer", padding: "4px 8px",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#4b5563"}
            onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
          >
            <FaEllipsisH />
          </button>
        </div>

        {/* Post text */}
        <p style={{
          margin: "0 0 16px",
          color: "#374151",
          fontSize: 14,
          lineHeight: 1.6,
          fontWeight: 400,
        }}>
          {post.text}
        </p>
      </Link>

      {/* Engagement footer */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "12px 24px",
        background: "transparent",
        borderTop: "1px solid #f3f4f6",
        transition: "background 0.2s",
      }}>
        {/* Like */}
        <button
          onClick={handleLike}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent",
            border: "none",
            color: post.isLiked ? "#dc2626" : "#6b7280",
            fontWeight: 600, fontSize: 13,
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => { if (!post.isLiked) e.currentTarget.style.color = "#1f2937"; }}
          onMouseLeave={e => { if (!post.isLiked) e.currentTarget.style.color = "#6b7280"; }}
        >
          {post.isLiked
            ? <FaHeart style={{ fontSize: 14, animation: likeAnim ? "cfPop 0.55s ease-out" : "none" }} />
            : <FaRegHeart style={{ fontSize: 14 }} />}
          <span>{post.likeCount || 0}</span>
        </button>

        {/* Comments - Click to expand */}
        <button
          onClick={e => { e.stopPropagation(); fetchComments(); }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent",
            border: "none",
            color: showComments ? "#059669" : "#6b7280", 
            fontWeight: 600, fontSize: 13,
            cursor: "pointer", transition: "color 0.2s",
          }}
          onMouseEnter={e => { if (!showComments) e.currentTarget.style.color = "#1f2937"; }}
          onMouseLeave={e => { if (!showComments) e.currentTarget.style.color = "#6b7280"; }}
        >
          <FaComment style={{ fontSize: 13, color: "#3b82f6" }} />
          <span>{post.commentCount || 0}</span>
        </button>

        {/* Spacer and Share */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "#059669", fontWeight: 600, fontSize: 13 }}>
          Share <FaArrowRight style={{ fontSize: 11, transition: "transform 0.2s", transform: hov ? "translateX(3px)" : "translateX(0)" }} />
        </div>
      </div>

      {/* ── COMMENTS DROPDOWN ── */}
      {showComments && (
        <div style={{
          borderTop: "1px solid #f3f4f6",
          background: "#f9fafb",
          padding: "16px 24px",
          animation: "cfFadeUp 0.2s ease-out",
        }}>
          {/* Comment input */}
          {token ? (
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  placeholder="Write a comment…"
                  maxLength={500}
                  style={{
                    flex: 1,
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "9px 14px",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    color: "#1f2937",
                    background: "#fff",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#059669"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 8,
                    border: "none",
                    background: newComment.trim() && !submitting ? "#059669" : "#d1d5db",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: newComment.trim() && !submitting ? "pointer" : "not-allowed",
                    whiteSpace: "nowrap",
                    transition: "background 0.2s",
                  }}
                >
                  {submitting ? "…" : "Post"}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => navigate("/login")}
              style={{
                marginBottom: 16, padding: "10px 14px", borderRadius: 8,
                background: "#fff", border: "1.5px dashed #d1d5db",
                color: "#6b7280", fontSize: 13, cursor: "pointer",
                textAlign: "center",
              }}
            >
              Login to comment
            </div>
          )}

          {loadingComments ? (
            <div style={{ textAlign: "center", padding: "16px", color: "#9ca3af", fontSize: 14 }}>
              Loading comments…
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "16px", color: "#9ca3af", fontSize: 14 }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {comments.map((comment, idx) => (
                <div key={comment._id || idx} style={{
                  background: "#ffffff", borderRadius: 8,
                  padding: "12px", border: "1px solid #e5e7eb",
                }}>
                  {/* Comment row */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <Avatar name={comment.author?.name || "User"} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, color: "#1f2937", fontSize: 13 }}>
                          {comment.author?.name || "Anonymous"}
                        </span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p style={{ margin: "6px 0 4px", color: "#374151", fontSize: 13, lineHeight: 1.5, wordBreak: "break-word" }}>
                        {comment.text}
                      </p>
                      {/* Like + Reply actions */}
                      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                        <button
                          onClick={e => handleCommentLike(e, comment._id, false, null)}
                          style={{
                            background: "none", border: "none", cursor: "pointer", padding: 0,
                            display: "flex", alignItems: "center", gap: 4,
                            color: comment.isLiked ? "#dc2626" : "#9ca3af", fontSize: 12, fontWeight: 700,
                            transition: "color 0.2s",
                          }}
                        >
                          {comment.isLiked ? <FaHeart /> : <FaRegHeart />}
                          {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                        </button>
                        {token && (
                          <button
                            onClick={e => { e.stopPropagation(); setReplyTo(replyTo?.commentId === comment._id ? null : { commentId: comment._id, authorName: comment.author?.name }); setReplyText(""); }}
                            style={{
                              background: "none", border: "none", cursor: "pointer", padding: 0,
                              display: "flex", alignItems: "center", gap: 4,
                              color: replyTo?.commentId === comment._id ? "#059669" : "#9ca3af",
                              fontSize: 12, fontWeight: 700, transition: "color 0.2s",
                            }}
                          >
                            ↩ Reply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <div style={{ marginTop: 10, paddingLeft: 40, display: "flex", flexDirection: "column", gap: 8 }}>
                      {comment.replies.map(reply => (
                        <div key={reply._id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <Avatar name={reply.author?.name || "User"} size={24} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontWeight: 700, color: "#1f2937", fontSize: 12 }}>{reply.author?.name || "Anonymous"}</span>
                              <span style={{ fontSize: 11, color: "#9ca3af" }}>{timeAgo(reply.createdAt)}</span>
                            </div>
                            <p style={{ margin: "3px 0 3px", color: "#374151", fontSize: 12, lineHeight: 1.5, wordBreak: "break-word" }}>
                              {reply.text}
                            </p>
                            <button
                              onClick={e => handleCommentLike(e, reply._id, true, comment._id)}
                              style={{
                                background: "none", border: "none", cursor: "pointer", padding: 0,
                                display: "flex", alignItems: "center", gap: 4,
                                color: reply.isLiked ? "#dc2626" : "#9ca3af", fontSize: 11, fontWeight: 700,
                                transition: "color 0.2s",
                              }}
                            >
                              {reply.isLiked ? <FaHeart /> : <FaRegHeart />}
                              {reply.likeCount > 0 && <span>{reply.likeCount}</span>}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyTo?.commentId === comment._id && (
                    <div style={{ marginTop: 10, paddingLeft: 40, display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(comment._id); } }}
                        placeholder={`Reply to ${replyTo.authorName}…`}
                        maxLength={500}
                        autoFocus
                        style={{
                          flex: 1, border: "1.5px solid #059669", borderRadius: 6,
                          padding: "7px 12px", fontSize: 12, outline: "none",
                          fontFamily: "inherit", color: "#1f2937", background: "#fff",
                        }}
                      />
                      <button
                        onClick={() => handleReply(comment._id)}
                        disabled={!replyText.trim() || submitting}
                        style={{
                          padding: "7px 14px", borderRadius: 6, border: "none",
                          background: replyText.trim() && !submitting ? "#059669" : "#d1d5db",
                          color: "#fff", fontWeight: 700, fontSize: 12,
                          cursor: replyText.trim() && !submitting ? "pointer" : "not-allowed",
                        }}
                      >
                        {submitting ? "…" : "Reply"}
                      </button>
                      <button
                        onClick={() => { setReplyTo(null); setReplyText(""); }}
                        style={{ padding: "7px 10px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 12 }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ─────────────────────────────────────────
   Hero decoration SVG
───────────────────────────────────────── */
function HeroArt() {
  return null;
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function CommunityFeed() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [activeTag,  setActiveTag]  = useState("");
  const [myPosts,    setMyPosts]    = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newText,    setNewText]    = useState("");
  const [newTags,    setNewTags]    = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const fetchPosts = useCallback(async (p = 1, tag = "", authorId = "") => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: p, limit: 9 });
      if (tag)      q.set("tag",    tag);
      if (authorId) q.set("author", authorId);
      const res  = await fetch(`${API}/api/posts?${q}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const list = Array.isArray(data.data?.posts) ? data.data.posts : [];
      const pg   = data.data?.pagination || {};
      setPosts(prev => p === 1 ? list : [...prev, ...list]);
      setHasMore((pg.page || p) < (pg.pages || 1));
      if (p === 1) setTotalPosts(pg.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  const userId = (user?.id || user?._id || "").toString();

  useEffect(() => {
    setPage(1);
    fetchPosts(1, activeTag, myPosts ? userId : "");
  }, [activeTag, myPosts, fetchPosts]);

  const handleLike = async (e, id) => {
    e.stopPropagation();
    if (!token) { navigate("/login"); return; }
    try {
      const res  = await fetch(`${API}/api/posts/${id}/like`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(prev => prev.map(p =>
        p._id === id ? { ...p, likeCount: data.data?.likeCount, isLiked: data.data?.liked } : p
      ));
    } catch (e) { console.error(e); }
  };

  const toggleTag = t => setNewTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleCreate = async () => {
    if (!newText.trim()) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`${API}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newText.trim(), tags: newTags }),
      });
      if (res.ok) {
        setShowCreate(false); setNewText(""); setNewTags([]);
        fetchPosts(1, activeTag);
      } else {
        const d = await res.json(); setError(d.message || "Failed to post.");
      }
    } catch { setError("Network error."); }
    finally { setSubmitting(false); }
  };

  /* ── render ── */
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", paddingBottom: 80 }}>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{
        background: "linear-gradient(135deg, rgba(5, 150, 105, 0.75) 0%, rgba(5, 150, 105, 0.7) 100%), url('https://images.unsplash.com/photo-1559347253-d1e1b0e3a9de?w=1400&h=500&fit=crop')",
        backgroundSize: "cover", backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative", overflow: "hidden",
        paddingTop: 60, minHeight: 420,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto", padding: "60px 24px",
          textAlign: "left", position: "relative", zIndex: 2,
        }}>
          {/* Main heading */}
          <h1 className="cf-fade" style={{
            color: "#fff", fontSize: "clamp(2.2rem, 5vw, 3rem)",
            fontWeight: 800, margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-0.02em",
          }}>
            Share Your Voice,<br/>Build Our Community
          </h1>

          {/* Description */}
          <p className="cf-fade" style={{
            color: "#f0fdf4", fontSize: "1rem",
            lineHeight: 1.7, maxWidth: 560, margin: "0", fontWeight: 400,
          }}>
            A space for members to share stories, spark conversations, and inspire meaningful change together.
          </p>
        </div>
      </section>

      {/* ══════════════ MAIN LAYOUT ══════════════ */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 32 }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside style={{
          background: "#ffffff", borderRadius: 12, padding: "24px",
          border: "1px solid #e5e7eb", height: "fit-content", position: "sticky", top: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <h3 style={{ margin: "0 0 20px", color: "#1f2937", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            MENU
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={() => setMyPosts(false)}
              style={{
                background: !myPosts ? "#ecfdf5" : "transparent",
                color: !myPosts ? "#047857" : "#6b7280",
                border: "none", borderRadius: 8, padding: "12px 16px",
                textAlign: "left", cursor: "pointer", fontWeight: !myPosts ? 600 : 500,
                fontSize: 14, transition: "all 0.2s",
                borderLeft: !myPosts ? "3px solid #059669" : "3px solid transparent",
              }}
              onMouseEnter={e => { if (myPosts) e.currentTarget.style.background = "#f3f4f6"; }}
              onMouseLeave={e => { if (myPosts) e.currentTarget.style.background = "transparent"; }}
            >
              🌱 Community Feed
            </button>
            <button
              onClick={() => { if (!token) { navigate("/login"); return; } setMyPosts(true); }}
              style={{
                background: myPosts ? "#ecfdf5" : "transparent",
                color: myPosts ? "#047857" : "#6b7280",
                border: "none", borderRadius: 8, padding: "12px 16px",
                textAlign: "left", cursor: "pointer", fontWeight: myPosts ? 600 : 500,
                fontSize: 14, transition: "all 0.2s",
                borderLeft: myPosts ? "3px solid #059669" : "3px solid transparent",
              }}
              onMouseEnter={e => { if (!myPosts) e.currentTarget.style.background = "#f3f4f6"; }}
              onMouseLeave={e => { if (!myPosts) e.currentTarget.style.background = "transparent"; }}
            >
              📝 My Posts
            </button>
          </div>
        </aside>

        {/* ── CENTER CONTENT ── */}
        <div>
          {/* Create post box */}
          {token ? (
            <div className="cf-fade" style={{
              background: "#ffffff", borderRadius: 12,
              padding: "24px", border: "1px solid #e5e7eb",
              marginBottom: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ margin: "0 0 20px", color: "#1f2937", fontSize: 16, fontWeight: 700 }}>Community Feed</h2>
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={2000}
                style={{
                  width: "100%", minHeight: 80,
                  background: "#f9fafb", border: "1px solid #d1d5db",
                  borderRadius: 10, padding: "14px 16px", fontSize: 14,
                  color: "#1f2937", resize: "none", outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                  lineHeight: 1.6, transition: "all 0.2s",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#059669";
                  e.target.style.background = "#fff";
                  e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.background = "#f9fafb";
                  e.target.style.boxShadow = "none";
                }}
              />
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: 14,
              }}>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  {newText.length} / 2000
                </div>
                <button
                  onClick={handleCreate}
                  disabled={!newText.trim() || submitting}
                  style={{
                    padding: "10px 28px", borderRadius: 8, border: "none",
                    background: newText.trim() ? "#059669" : "#d1d5db",
                    color: "#fff", fontWeight: 700, fontSize: 14,
                    cursor: newText.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { if (newText.trim()) e.currentTarget.style.background = "#047857"; }}
                  onMouseLeave={e => { if (newText.trim()) e.currentTarget.style.background = "#059669"; }}
                >
                  {submitting ? "Posting…" : "+ New Post"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <button onClick={() => navigate("/login")} style={{
                background: "#059669", color: "#fff", border: "none",
                borderRadius: 10, padding: "12px 32px", fontWeight: 700,
                fontSize: 15, cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#047857"}
                onMouseLeave={e => e.currentTarget.style.background = "#059669"}
              >
                Login to Share
              </button>
            </div>
          )}

          {/* ── Posts ── */}
          {loading && page === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: "#ffffff", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ padding: "20px 24px" }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                      <div className="cf-skel" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }}/>
                      <div style={{ flex: 1 }}>
                        <div className="cf-skel" style={{ width: "35%", height: 16, marginBottom: 9 }}/>
                        <div className="cf-skel" style={{ width: "20%", height: 12 }}/>
                      </div>
                    </div>
                    <div className="cf-skel" style={{ width: "100%", height: 12, marginBottom: 8 }}/>
                    <div className="cf-skel" style={{ width: "85%", height: 12, marginBottom: 8 }}/>
                    <div className="cf-skel" style={{ width: "60%", height: 12 }}/>
                  </div>
                  <div style={{ height: 1, background: "#f3f4f6" }}/>
                  <div style={{ padding: "12px 24px", display: "flex", gap: 16 }}>
                    <div className="cf-skel" style={{ width: 60, height: 12 }}/>
                    <div className="cf-skel" style={{ width: 60, height: 12 }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div style={{
              background: "#ffffff", borderRadius: 12, textAlign: "center",
              padding: "60px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid #e5e7eb",
            }}>
              <div style={{ fontSize: 60, marginBottom: 20 }}>{myPosts ? "📝" : "🌱"}</div>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1f2937", margin: "0 0 8px" }}>
                {myPosts ? "You haven't posted anything yet" : "No posts yet"}
              </p>
              <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 24px" }}>
                {myPosts ? "Share your thoughts with the community!" : "Be the first to share your story with the community!"}
              </p>
              {token && (
                <button onClick={() => setShowCreate(true)} style={{
                  background: "#059669", color: "#fff", border: "none",
                  borderRadius: 8, padding: "10px 24px", fontWeight: 700,
                  fontSize: 14, cursor: "pointer",
                }}>
                  Create First Post
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {posts.map((post, i) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                  onCommentCountChange={(id, delta) =>
                    setPosts(prev => prev.map(p => p._id === id ? { ...p, commentCount: (p.commentCount || 0) + delta } : p))
                  }
                  delay={Math.min(i, 5) * 0.09}
                />
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button
                onClick={() => { const n = page+1; setPage(n); fetchPosts(n, activeTag); }}
                style={{
                  background: "#059669",
                  color: "#fff", border: "none", borderRadius: 10,
                  padding: "12px 40px", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", boxShadow: "0 2px 8px rgba(5, 150, 105, 0.2)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#047857"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(5, 150, 105, 0.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#059669"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(5, 150, 105, 0.2)"; }}
              >
                Load More Posts
              </button>
            </div>
          )}
          {loading && page > 1 && (
            <div style={{ textAlign: "center", padding: 24, color: "#9ca3af", fontWeight: 600, fontSize: 14 }}>
              Loading…
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ CREATE POST MODAL ══════════════ */}
      {showCreate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 16, backdropFilter: "blur(4px)",
          animation: "cfFadeUp 0.25s ease-out",
        }}>
          <div style={{
            background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 600,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            animation: "cfFadeUp 0.35s cubic-bezier(0.4,0,0.2,1)",
            maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column",
            border: "1px solid #e5e7eb",
          }}>
            {/* Modal header */}
            <div style={{
              padding: "24px 28px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#1f2937" }}>
                Share Your Thought
              </h2>
              <button onClick={() => { setShowCreate(false); setError(""); }} style={{
                background: "transparent", border: "none", borderRadius: "50%",
                width: 36, height: 36, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "#6b7280", fontSize: 18, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#1f2937"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
              {/* Textarea */}
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="What would you like to share?"
                maxLength={2000}
                style={{
                  width: "100%", minHeight: 150,
                  border: "1px solid #d1d5db", borderRadius: 10,
                  padding: "14px 16px", fontSize: 14, resize: "vertical",
                  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                  color: "#374151", lineHeight: 1.6, background: "#f9fafb",
                  transition: "all 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)"; e.target.style.background = "#fff"; }}
                onBlur={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; e.target.style.background = "#f9fafb"; }}
              />
              <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "right", marginTop: 8, marginBottom: 20 }}>
                {newText.length} / 2000
              </div>

              {error && (
                <div style={{
                  background: "#fee2e2", color: "#991b1b",
                  padding: "12px 16px", borderRadius: 8, fontSize: 13,
                  marginBottom: 20, border: "1px solid #fecaca",
                }}>
                  ⚠ {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowCreate(false); setError(""); setNewText(""); }} style={{
                  padding: "10px 24px", borderRadius: 8,
                  border: "1px solid #d1d5db", background: "transparent",
                  cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#6b7280",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#1f2937"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newText.trim() || submitting}
                  style={{
                    padding: "10px 28px", borderRadius: 8, border: "none",
                    background: newText.trim() && !submitting ? "#059669" : "#d1d5db",
                    color: "#fff", fontWeight: 700, fontSize: 14,
                    cursor: newText.trim() && !submitting ? "pointer" : "not-allowed",
                    boxShadow: newText.trim() && !submitting ? "0 2px 8px rgba(5, 150, 105, 0.2)" : "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { if (newText.trim() && !submitting) { e.currentTarget.style.background = "#047857"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(5, 150, 105, 0.3)"; } }}
                  onMouseLeave={e => { if (newText.trim() && !submitting) { e.currentTarget.style.background = "#059669"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(5, 150, 105, 0.2)"; } }}
                >
                  {submitting ? "Posting…" : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
