import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeart, FaRegHeart, FaComment, FaShare,
  FaTh, FaUsers, FaCalendarAlt, FaTrophy,
  FaChartLine, FaLeaf, FaPaperPlane,
  FaEdit, FaTrash,
} from "react-icons/fa";
import { API } from "../../utils/S3.js";

/* ── design tokens ── */
const C = {
  bg:     "#0f0f0f",
  side:   "#141414",
  card:   "#1a1a1a",
  input:  "#242424",
  bubble: "#222222",
  green:  "#22c55e",
  border: "#282828",
  text:   "#f1f5f9",
  sub:    "#94a3b8",
  muted:  "#6b7280",
};

/* ── keyframes injected once ── */
const STYLES = `
  @keyframes cfFadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes cfPop {
    0%  { transform:scale(1); }
    40% { transform:scale(1.35); }
    100%{ transform:scale(1); }
  }
  .cf-card { animation: cfFadeUp 0.38s ease-out both; }
`;

/* ── timeAgo ── */
function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24);
  return dy < 30
    ? `${dy}d ago`
    : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ── Avatar ── */
function Avatar({ name = "?", size = 40 }) {
  const letters = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const pals = [
    ["#6366f1","#8b5cf6"],["#f59e0b","#f97316"],["#06b6d4","#0284c7"],
    ["#22c55e","#16a34a"],["#ec4899","#db2777"],["#ef4444","#dc2626"],
    ["#14b8a6","#0d9488"],
  ];
  const [a, b] = pals[(name.charCodeAt(0) || 0) % pals.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${a},${b})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.36,
      userSelect: "none", letterSpacing: "-0.5px",
      border: "2px solid rgba(255,255,255,0.12)",
    }}>
      {letters}
    </div>
  );
}

/* ══════════════════════════════════════════
   PostCard
══════════════════════════════════════════ */
function PostCard({ post, onLike, onPostDelete, onPostUpdate, onCommentCountChange, delay = 0 }) {
  const navigate   = useNavigate();
  const token      = localStorage.getItem("token");
  const me = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
  const myId       = (me?.id || me?._id || "").toString();
  const isOwnPost  = myId && myId === (post.author?._id || "").toString();

  const [likeAnim,       setLikeAnim]       = useState(false);
  const [showComments,   setShowComments]   = useState(false);
  const [comments,       setComments]       = useState([]);
  const [loadingCmts,    setLoadingCmts]    = useState(false);
  const [newComment,     setNewComment]     = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const [replyTo,        setReplyTo]        = useState(null); // { _id, authorName }
  const [replyText,      setReplyText]      = useState("");
  const [showEdit,       setShowEdit]       = useState(false);
  const [editText,       setEditText]       = useState(post.text || "");
  const [editSubmitting, setEditSubmitting] = useState(false);

  /* load comments */
  const loadComments = async () => {
    setLoadingCmts(true);
    try {
      const res  = await fetch(`${API}/api/posts/${post._id}/comments?limit=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setComments(Array.isArray(data.data?.comments) ? data.data.comments : []);
    } catch (e) { console.error(e); setComments([]); }
    finally { setLoadingCmts(false); }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setShowComments(true);
      if (comments.length === 0) await loadComments();
    } else {
      setShowComments(false);
    }
  };

  /* like post */
  const handleLike = (e) => {
    e.stopPropagation();
    onLike(e, post._id);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 500);
  };

  /* add top-level comment */
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
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  /* reply to a comment */
  const handleReply = async (parentId) => {
    if (!token) { navigate("/login"); return; }
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/posts/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: replyText.trim(), parentComment: parentId }),
      });
      if (res.ok) {
        setReplyText(""); setReplyTo(null);
        await loadComments();
        if (onCommentCountChange) onCommentCountChange(post._id, 1);
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  /* delete post */
  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API}/api/posts/${post._id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && onPostDelete) onPostDelete(post._id);
    } catch (e) { console.error(e); }
  };

  /* edit post */
  const handleEditPost = async () => {
    if (!editText.trim()) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${API}/api/posts/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: editText.trim(), tags: post.tags || [] }),
      });
      if (res.ok) {
        const data = await res.json();
        if (onPostUpdate) onPostUpdate(data.data?.post || { ...post, text: editText.trim() });
        setShowEdit(false);
      }
    } catch (e) { console.error(e); }
    finally { setEditSubmitting(false); }
  };

  return (
    <div
      className="cf-card"
      style={{
        background: C.card, borderRadius: 16,
        border: `1px solid ${C.border}`,
        marginBottom: 16, overflow: "hidden",
        animationDelay: `${delay}s`,
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={post.author?.name || "?"} size={44} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>
                {post.author?.name || "Anonymous"}
              </span>
              {isOwnPost && (
                <span style={{
                  background: `${C.green}22`, color: C.green,
                  fontSize: 10, fontWeight: 800, padding: "2px 8px",
                  borderRadius: 4, letterSpacing: "0.06em",
                }}>YOU</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>

        {/* Edit / Delete for own posts */}
        {isOwnPost && !showEdit && (
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => { setShowEdit(true); setEditText(post.text); }}
              style={{
                background: "none", border: "none", cursor: "pointer", color: C.muted,
                display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                borderRadius: 8, fontSize: 13, fontWeight: 600, transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#60a5fa"; e.currentTarget.style.background = "#1d3461"; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "none"; }}
            >
              <FaEdit size={11} /> Edit
            </button>
            <button
              onClick={handleDeletePost}
              style={{
                background: "none", border: "none", cursor: "pointer", color: C.muted,
                display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                borderRadius: 8, fontSize: 13, fontWeight: 600, transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "#3f1515"; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "none"; }}
            >
              <FaTrash size={11} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "14px 24px 16px" }}>
        {showEdit ? (
          <div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              maxLength={2000}
              style={{
                width: "100%", minHeight: 100, background: C.input,
                border: `1.5px solid ${C.green}`, borderRadius: 10,
                padding: "12px 14px", fontSize: 14, color: C.text,
                resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.6,
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
              <button
                onClick={() => setShowEdit(false)}
                style={{
                  padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: "none", color: C.sub, cursor: "pointer", fontSize: 13, fontWeight: 600,
                }}
              >Cancel</button>
              <button
                onClick={handleEditPost}
                disabled={!editText.trim() || editSubmitting}
                style={{
                  padding: "7px 20px", borderRadius: 8, border: "none",
                  background: editText.trim() ? C.green : "#2d2d2d",
                  color: editText.trim() ? "#000" : C.muted,
                  cursor: editText.trim() ? "pointer" : "not-allowed",
                  fontSize: 13, fontWeight: 700,
                }}
              >{editSubmitting ? "Saving…" : "Save"}</button>
            </div>
          </div>
        ) : (
          <>
            <p style={{
              margin: 0, color: C.sub, fontSize: 15, lineHeight: 1.75,
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {post.text}
            </p>
            {post.tags?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{
                    background: `${C.green}18`, color: C.green,
                    borderRadius: 999, padding: "3px 12px", fontSize: 12, fontWeight: 600,
                  }}>#{tag}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Engagement row ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 24,
        padding: "10px 24px 14px",
        borderTop: `1px solid ${C.border}`,
      }}>
        {/* Like */}
        <button
          onClick={handleLike}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", gap: 7,
            color: post.isLiked ? "#f87171" : C.muted,
            fontSize: 14, fontWeight: 600, transition: "color 0.2s",
          }}
          onMouseEnter={e => { if (!post.isLiked) e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={e => { if (!post.isLiked) e.currentTarget.style.color = C.muted; }}
        >
          {post.isLiked
            ? <FaHeart style={{ animation: likeAnim ? "cfPop 0.5s ease-out" : "none" }} />
            : <FaRegHeart />}
          <span>{post.likeCount || 0}</span>
        </button>

        {/* Comments */}
        <button
          onClick={toggleComments}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", gap: 7,
            color: showComments ? C.green : C.muted,
            fontSize: 14, fontWeight: 600, transition: "color 0.2s",
          }}
          onMouseEnter={e => { if (!showComments) e.currentTarget.style.color = C.sub; }}
          onMouseLeave={e => { if (!showComments) e.currentTarget.style.color = C.muted; }}
        >
          <FaComment />
          <span>{post.commentCount || 0} Comments</span>
        </button>

        {/* Share */}
        <button
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", gap: 7,
            color: C.muted, fontSize: 14, fontWeight: 600,
            marginLeft: "auto", transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.sub}
          onMouseLeave={e => e.currentTarget.style.color = C.muted}
        >
          <FaShare /> Share
        </button>
      </div>

      {/* ══ Comments Dropdown ══ */}
      {showComments && (
        <div style={{ borderTop: `1px solid ${C.border}`, background: "#161616", padding: "20px 24px 24px" }}>
          {loadingCmts ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: 14 }}>
              Loading comments…
            </div>
          ) : (
            <>
              {/* Comment list */}
              {comments.length === 0 ? (
                <p style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: "12px 0 16px", margin: 0 }}>
                  No comments yet — be the first!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 20 }}>
                  {comments.map(comment => (
                    <div key={comment._id}>
                      {/* ── Top-level comment ── */}
                      <div style={{ display: "flex", gap: 12 }}>
                        <Avatar name={comment.author?.name || "?"} size={38} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Bubble */}
                          <div style={{
                            background: C.bubble, borderRadius: "4px 14px 14px 14px",
                            padding: "12px 16px",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                              <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>
                                {comment.author?.name || "Anonymous"}
                              </span>
                              <span style={{ color: "#3f3f3f", fontSize: 12 }}>•</span>
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {timeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p style={{ margin: 0, color: "#cbd5e1", fontSize: 14, lineHeight: 1.65 }}>
                              {comment.text}
                            </p>
                          </div>

                          {/* Reply button */}
                          {token && (
                            <button
                              onClick={() => {
                                setReplyTo(prev => prev?._id === comment._id
                                  ? null
                                  : { _id: comment._id, authorName: comment.author?.name }
                                );
                                setReplyText("");
                              }}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: replyTo?._id === comment._id ? C.green : C.muted,
                                fontSize: 13, fontWeight: 600, padding: "6px 4px",
                                transition: "color 0.2s",
                              }}
                            >
                              Reply
                            </button>
                          )}

                          {/* Inline reply input */}
                          {replyTo?._id === comment._id && (
                            <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
                              <Avatar name={me?.name || "?"} size={28} />
                              <input
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") handleReply(comment._id); }}
                                placeholder={`Reply to ${replyTo.authorName}…`}
                                maxLength={500}
                                autoFocus
                                style={{
                                  flex: 1, background: C.input,
                                  border: `1.5px solid ${C.green}55`,
                                  borderRadius: 20, padding: "8px 16px",
                                  fontSize: 13, color: C.text, outline: "none",
                                  fontFamily: "inherit", transition: "border-color 0.2s",
                                }}
                                onFocus={e => e.target.style.borderColor = C.green}
                                onBlur={e => e.target.style.borderColor = `${C.green}55`}
                              />
                              <button
                                onClick={() => handleReply(comment._id)}
                                disabled={!replyText.trim() || submitting}
                                style={{
                                  background: replyText.trim() ? C.green : "#2d2d2d",
                                  border: "none", borderRadius: 20,
                                  padding: "8px 16px", cursor: replyText.trim() ? "pointer" : "not-allowed",
                                  color: replyText.trim() ? "#000" : C.muted,
                                  fontWeight: 700, fontSize: 13, transition: "all 0.2s",
                                }}
                              >
                                {submitting ? "…" : "Reply"}
                              </button>
                              <button
                                onClick={() => { setReplyTo(null); setReplyText(""); }}
                                style={{
                                  background: "none", border: `1px solid ${C.border}`,
                                  borderRadius: 20, padding: "8px 12px",
                                  color: C.muted, cursor: "pointer", fontSize: 12,
                                }}
                              >✕</button>
                            </div>
                          )}

                          {/* ── Nested replies ── */}
                          {comment.replies?.length > 0 && (
                            <div style={{ marginTop: 12, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                              {comment.replies.map(reply => (
                                <div key={reply._id} style={{ display: "flex", gap: 10 }}>
                                  <Avatar name={reply.author?.name || "?"} size={30} />
                                  <div style={{
                                    background: "#1c1c1c", borderRadius: "4px 12px 12px 12px",
                                    padding: "10px 14px", flex: 1,
                                    border: `1px solid ${C.border}`,
                                  }}>
                                    <span style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>
                                      {reply.author?.name || "Anonymous"}
                                    </span>
                                    <p style={{ margin: "4px 0 0", color: "#cbd5e1", fontSize: 13, lineHeight: 1.55 }}>
                                      {reply.text}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Add comment input ── */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar name={me?.name || "?"} size={36} />
                {token ? (
                  <>
                    <input
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddComment(); }}
                      placeholder="Write a comment…"
                      maxLength={500}
                      style={{
                        flex: 1, background: C.input, border: `1.5px solid ${C.border}`,
                        borderRadius: 24, padding: "10px 18px",
                        fontSize: 14, color: C.text, outline: "none",
                        fontFamily: "inherit", transition: "border-color 0.2s",
                      }}
                      onFocus={e => e.target.style.borderColor = C.green}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      style={{
                        width: 40, height: 40, borderRadius: "50%", border: "none",
                        background: newComment.trim() ? C.green : C.input,
                        color: newComment.trim() ? "#000" : C.muted,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: newComment.trim() ? "pointer" : "not-allowed",
                        flexShrink: 0, transition: "all 0.2s",
                      }}
                    >
                      <FaPaperPlane size={13} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    style={{
                      flex: 1, background: C.input, border: `1.5px dashed ${C.border}`,
                      borderRadius: 24, padding: "10px 18px", fontSize: 14,
                      color: C.muted, cursor: "pointer", textAlign: "left",
                      fontFamily: "inherit",
                    }}
                  >
                    Login to join the conversation…
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function CommunityFeed() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const user     = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(false);
  const [myPosts,    setMyPosts]    = useState(false);
  const [newText,    setNewText]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const userId = (user?.id || user?._id || "").toString();

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const fetchPosts = useCallback(async (p = 1, authorId = "") => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: p, limit: 9 });
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

  useEffect(() => {
    setPage(1);
    fetchPosts(1, myPosts ? userId : "");
  }, [myPosts, fetchPosts]);

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

  const handleCreate = async () => {
    if (!newText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newText.trim(), tags: [] }),
      });
      if (res.ok) { setNewText(""); fetchPosts(1, myPosts ? userId : ""); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handlePostDelete = (id) => {
    setPosts(prev => prev.filter(p => p._id !== id));
    setTotalPosts(prev => Math.max(0, prev - 1));
  };

  const handlePostUpdate = (updated) => {
    setPosts(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
  };

  /* sidebar nav */
  const navItems = [
    { icon: <FaTh size={14}/>,          label: "Global Feed",    active: !myPosts, onClick: () => setMyPosts(false) },
    { icon: <FaCalendarAlt size={14}/>, label: "NGO Events",     active: false,     onClick: () => {} },
    { icon: <FaTrophy size={14}/>,      label: "Impact Stories", active: false,     onClick: () => {} },
  ];

  return (
    <div style={{
      position: "sticky", top: 60,
      display: "flex", height: "calc(100vh - 60px)",
      overflow: "hidden", background: C.bg, color: C.text,
    }}>

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside style={{
        width: 260, flexShrink: 0,
        height: "100%",
        background: C.side,
        borderRight: `1px solid ${C.border}`,
        padding: "20px 14px",
        overflowY: "hidden",
      }}>
        {/* Explore header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 14 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: `${C.green}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: C.green,
          }}>
            <FaLeaf size={12} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: C.green }}>Explore</span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "9px 14px", borderRadius: 10, border: "none",
                background: item.active ? `${C.green}20` : "none",
                color: item.active ? C.green : C.muted,
                cursor: "pointer", fontSize: 14,
                fontWeight: item.active ? 700 : 500,
                textAlign: "left", width: "100%", transition: "all 0.18s",
              }}
              onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = "#1e1e1e"; e.currentTarget.style.color = C.sub; } }}
              onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.muted; } }}
            >
              {item.icon} {item.label}
            </button>
          ))}

          {token && (
            <button
              onClick={() => setMyPosts(true)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "9px 14px", borderRadius: 10, border: "none",
                background: myPosts ? `${C.green}20` : "none",
                color: myPosts ? C.green : C.muted,
                cursor: "pointer", fontSize: 14,
                fontWeight: myPosts ? 700 : 500,
                textAlign: "left", width: "100%", transition: "all 0.18s",
              }}
              onMouseEnter={e => { if (!myPosts) { e.currentTarget.style.background = "#1e1e1e"; e.currentTarget.style.color = C.sub; } }}
              onMouseLeave={e => { if (!myPosts) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.muted; } }}
            >
              <FaUsers size={14} /> My Posts
            </button>
          )}
        </nav>

        {/* Community Stats */}
        <div style={{
          background: C.card, borderRadius: 14, padding: "14px 14px",
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <FaChartLine size={13} color={C.green} />
            <span style={{ fontWeight: 700, fontSize: 13, color: C.green }}>Community Stats</span>
          </div>
          {[
            { label: "Active Members", value: "1.2k" },
            { label: "Posts Shared",   value: totalPosts > 0 ? String(totalPosts) : "—" },
            { label: "Topics Covered", value: "8" },
          ].map((s, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "7px 0",
              borderTop: i > 0 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: 13, color: C.muted }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.value}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{ flex: 1, minWidth: 0, height: "100%", overflowY: "auto" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "36px 28px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            margin: "0 0 10px", fontWeight: 800, color: C.text,
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)", lineHeight: 1.1,
          }}>
            Connect &amp; Collab
          </h1>
          <p style={{ margin: 0, color: C.sub, fontSize: 15, lineHeight: 1.65 }}>
            Share your thoughts, experiences, and ideas for a better world.
          </p>
        </div>

        {/* Create post */}
        {token ? (
          <div style={{
            background: C.card, borderRadius: 16, padding: "20px 24px",
            border: `1px solid ${C.border}`, marginBottom: 28,
          }}>
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="What's on your mind regarding our mission?"
              maxLength={2000}
              style={{
                width: "100%", minHeight: 88, background: C.input,
                border: `1.5px solid ${C.border}`,
                borderRadius: 12, padding: "14px 16px", fontSize: 14,
                color: C.text, resize: "none", outline: "none",
                fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = C.green}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Text only posts are allowed (no images)</span>
              <button
                onClick={handleCreate}
                disabled={!newText.trim() || submitting}
                style={{
                  padding: "10px 26px", borderRadius: 10, border: "none",
                  background: newText.trim() && !submitting ? C.green : "#2a2a2a",
                  color: newText.trim() && !submitting ? "#000" : C.muted,
                  fontWeight: 700, fontSize: 14, transition: "all 0.2s",
                  cursor: newText.trim() && !submitting ? "pointer" : "not-allowed",
                }}
              >
                {submitting ? "Posting…" : "Post Thought"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: C.card, borderRadius: 16, padding: "24px",
            border: `1px solid ${C.border}`, marginBottom: 28, textAlign: "center",
          }}>
            <p style={{ color: C.muted, margin: "0 0 14px", fontSize: 14 }}>
              Join the conversation — share your thoughts with the community
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "10px 28px", borderRadius: 10, border: "none",
                background: C.green, color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >Login to Post</button>
          </div>
        )}

        {/* Posts */}
        {loading && page === 1 ? (
          /* skeleton */
          [1, 2, 3].map(i => (
            <div key={i} style={{
              background: C.card, borderRadius: 16, padding: 24,
              border: `1px solid ${C.border}`, marginBottom: 16,
            }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#242424" }} />
                <div>
                  <div style={{ width: 120, height: 14, borderRadius: 6, background: "#242424", marginBottom: 8 }} />
                  <div style={{ width: 70, height: 11, borderRadius: 6, background: "#1e1e1e" }} />
                </div>
              </div>
              <div style={{ width: "100%", height: 12, borderRadius: 6, background: "#242424", marginBottom: 8 }} />
              <div style={{ width: "75%", height: 12, borderRadius: 6, background: "#1e1e1e" }} />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div style={{
            background: C.card, borderRadius: 16, padding: "60px 24px",
            border: `1px solid ${C.border}`, textAlign: "center",
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>{myPosts ? "📝" : "🌱"}</div>
            <p style={{ fontWeight: 700, color: C.text, fontSize: "1rem", margin: "0 0 8px" }}>
              {myPosts ? "You haven't posted anything yet" : "No posts yet"}
            </p>
            <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
              {myPosts ? "Share your first thought above!" : "Be the first to share your story!"}
            </p>
          </div>
        ) : (
          <>
            {posts.map((post, i) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onPostDelete={handlePostDelete}
                onPostUpdate={handlePostUpdate}
                onCommentCountChange={(id, delta) =>
                  setPosts(prev => prev.map(p =>
                    p._id === id ? { ...p, commentCount: (p.commentCount || 0) + delta } : p
                  ))
                }
                delay={Math.min(i, 5) * 0.08}
              />
            ))}

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <button
                  onClick={() => { const next = page + 1; setPage(next); fetchPosts(next, myPosts ? userId : ""); }}
                  disabled={loading}
                  style={{
                    padding: "12px 36px", borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background: "none", color: C.sub, fontWeight: 600,
                    fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.card; e.currentTarget.style.color = C.text; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.sub; }}
                >
                  {loading ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      </main>
    </div>
  );
}
