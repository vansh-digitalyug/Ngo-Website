import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeart, FaRegHeart, FaComment, FaShare,
  FaTh, FaUsers, FaCalendarAlt, FaTrophy,
  FaChartLine, FaLeaf, FaPaperPlane,
  FaEdit, FaTrash, FaCloudUploadAlt, FaBars, FaTimes as FaX,
} from "react-icons/fa";
import { API } from "../../utils/S3.js";

/* ── design tokens ── */
const C = {
  bg:     "#f5f1e8",
  side:   "#ffffff",
  card:   "#ffffff",
  input:  "#f0ebe2",
  bubble: "#f0ebe2",
  green:  "#6b8e23",
  border: "#e8dfd3",
  text:   "#0f172a",
  sub:    "#475569",
  muted:  "#94a3b8",
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
  @keyframes cfShimmer { 0%{background-position:-700px 0} 100%{background-position:700px 0} }
  .cf-img-skel {
    background: linear-gradient(90deg,#e8ecf0 0%,#d1d8e0 50%,#e8ecf0 100%);
    background-size: 700px 100%;
    animation: cfShimmer 1.6s infinite;
    border-radius: 12px;
  }
  @keyframes cfSlideInLeft {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
  }
  @keyframes cfFadeOverlay {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .cf-sidebar-overlay {
    position: fixed;
    top: 60px; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.45);
    z-index: 40; display: flex;
    animation: cfFadeOverlay 0.45s ease;
  }
  .cf-sidebar-drawer {
    animation: cfSlideInLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  @media (min-width: 1024px) {
    .cf-sidebar-overlay { display: none !important; }
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
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

/* ── PostCarousel ── */
function PostCarousel({ imageKeys }) {
  const [urls,    setUrls]    = useState([]);
  const [current, setCurrent] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!imageKeys?.length) return;
    setCurrent(0);
    Promise.all(
      imageKeys.map(key =>
        fetch(`${API}/api/s3/get-url?key=${encodeURIComponent(key)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
          .then(r => r.json())
          .then(d => d.data?.Url || null)
          .catch(() => null)
      )
    ).then(results => setUrls(results.filter(Boolean)));
  }, [imageKeys]);

  if (!urls.length) {
    return <div className="cf-img-skel h-[220px] sm:h-[320px]" />;
  }

  const total = urls.length;
  const prev  = (e) => { e.stopPropagation(); setCurrent(c => (c - 1 + total) % total); };
  const next  = (e) => { e.stopPropagation(); setCurrent(c => (c + 1) % total); };

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0f172a] select-none">
      <img
        src={urls[current]}
        alt={`Photo ${current + 1}`}
        className="w-full block max-h-[320px] sm:max-h-[480px] object-cover transition-opacity duration-[250ms]"
      />
      {total > 1 && (
        <>
          {current > 0 && (
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full bg-white/90 border-none text-[#0f172a] cursor-pointer flex items-center justify-center text-lg sm:text-xl font-black z-[3] shadow-[0_2px_8px_rgba(0,0,0,0.25)] leading-none"
            >‹</button>
          )}
          {current < total - 1 && (
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full bg-white/90 border-none text-[#0f172a] cursor-pointer flex items-center justify-center text-lg sm:text-xl font-black z-[3] shadow-[0_2px_8px_rgba(0,0,0,0.25)] leading-none"
            >›</button>
          )}
          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 flex gap-[5px] z-[3]">
            {urls.map((_, idx) => (
              <div key={idx} onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                style={{
                  width: idx === current ? 20 : 7, height: 7, borderRadius: 4,
                  background: idx === current ? "#fff" : "rgba(255,255,255,0.5)",
                  cursor: "pointer", transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>
          <div className="absolute top-[10px] right-[10px] bg-black/55 text-white rounded-full px-[10px] py-[3px] text-xs font-bold z-[3]">
            {current + 1} / {total}
          </div>
        </>
      )}
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
  const [replyTo,        setReplyTo]        = useState(null);
  const [replyText,      setReplyText]      = useState("");
  const [showEdit,       setShowEdit]       = useState(false);
  const [editText,       setEditText]       = useState(post.text || "");
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  const handleLike = (e) => {
    e.stopPropagation();
    onLike(e, post._id);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 500);
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
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

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

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API}/api/posts/${post._id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && onPostDelete) onPostDelete(post._id);
    } catch (e) { console.error(e); }
  };

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
      className="cf-card bg-white rounded-2xl border border-[#e8dfd3] mb-3 sm:mb-4 overflow-hidden"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* ── Header ── */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Avatar name={post.author?.name || "?"} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#0f172a] text-sm sm:text-[15px] truncate">
                {post.author?.name || "Anonymous"}
              </span>
              {isOwnPost && (
                <span className="bg-[#6b8e2322] text-[#6b8e23] text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-[2px] rounded-[4px] tracking-[0.06em] flex-shrink-0">
                  YOU
                </span>
              )}
            </div>
            <div className="text-[11px] sm:text-xs text-[#94a3b8] mt-[2px]">
              {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>

        {isOwnPost && !showEdit && (
          <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
            <button
              onClick={() => { setShowEdit(true); setEditText(post.text); }}
              className="bg-transparent border-none cursor-pointer text-[#94a3b8] flex items-center gap-1 sm:gap-[5px] px-2 sm:px-[10px] py-[5px] rounded-lg text-xs sm:text-[13px] font-semibold transition-all hover:text-blue-600 hover:bg-blue-100"
            >
              <FaEdit size={10} /> <span className="hidden xs:inline">Edit</span>
            </button>
            <button
              onClick={handleDeletePost}
              className="bg-transparent border-none cursor-pointer text-[#94a3b8] flex items-center gap-1 sm:gap-[5px] px-2 sm:px-[10px] py-[5px] rounded-lg text-xs sm:text-[13px] font-semibold transition-all hover:text-red-600 hover:bg-red-100"
            >
              <FaTrash size={10} /> <span className="hidden xs:inline">Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-4 sm:px-6 pt-3 sm:pt-[14px] pb-3 sm:pb-4">
        {showEdit ? (
          <div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              maxLength={2000}
              className="w-full min-h-[90px] sm:min-h-[100px] bg-[#f0ebe2] border-[1.5px] border-[#6b8e23] rounded-[10px] px-3 sm:px-[14px] py-2.5 sm:py-3 text-sm text-[#0f172a] resize-none outline-none leading-relaxed"
              style={{ fontFamily: "inherit" }}
            />
            <div className="flex gap-2 justify-end mt-2 sm:mt-[10px]">
              <button
                onClick={() => setShowEdit(false)}
                className="px-3 sm:px-4 py-[6px] sm:py-[7px] rounded-lg border border-[#e8dfd3] bg-transparent text-[#475569] cursor-pointer text-xs sm:text-[13px] font-semibold"
              >Cancel</button>
              <button
                onClick={handleEditPost}
                disabled={!editText.trim() || editSubmitting}
                className={`px-4 sm:px-5 py-[6px] sm:py-[7px] rounded-lg border-none text-xs sm:text-[13px] font-bold ${editText.trim() ? "bg-[#6b8e23] text-black cursor-pointer" : "bg-[#f0ebe2] text-[#94a3b8] cursor-not-allowed"}`}
              >{editSubmitting ? "Saving…" : "Save"}</button>
            </div>
          </div>
        ) : (
          <>
            <p className="m-0 text-[#475569] text-sm sm:text-[15px] leading-[1.7] sm:leading-[1.75] whitespace-pre-wrap break-words">
              {post.text}
            </p>
            {post.tags?.length > 0 && (
              <div className="flex gap-[5px] sm:gap-[6px] flex-wrap mt-2 sm:mt-3">
                {post.tags.map(tag => (
                  <span key={tag} className="bg-[#6b8e2318] text-[#6b8e23] rounded-full px-2.5 sm:px-3 py-[2px] sm:py-[3px] text-[11px] sm:text-xs font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {post.imageKeys?.length > 0 && (
              <div className="mt-3 sm:mt-[14px]">
                <PostCarousel imageKeys={post.imageKeys} />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Engagement row ── */}
      <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 pt-[10px] pb-[12px] sm:pb-[14px] border-t border-[#e8dfd3]">
        <button
          onClick={handleLike}
          className={`bg-transparent border-none cursor-pointer p-0 flex items-center gap-[6px] sm:gap-[7px] text-xs sm:text-sm font-semibold transition-colors ${post.isLiked ? "text-[#f87171]" : "text-[#94a3b8] hover:text-[#f87171]"}`}
        >
          {post.isLiked
            ? <FaHeart style={{ animation: likeAnim ? "cfPop 0.5s ease-out" : "none" }} />
            : <FaRegHeart />}
          <span>{post.likeCount || 0}</span>
        </button>

        <button
          onClick={toggleComments}
          className={`bg-transparent border-none cursor-pointer py-[6px] px-0 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-all rounded-md ${showComments ? "text-[#6b8e23]" : "text-[#94a3b8] hover:text-[#6b8e23] hover:bg-[#6b8e2308]"}`}
        >
          <FaComment size={13} />
          <span>{post.commentCount || 0} <span className="hidden xs:inline">Comment{post.commentCount !== 1 ? "s" : ""}</span></span>
        </button>

        <button className="bg-transparent border-none cursor-pointer p-0 flex items-center gap-[6px] sm:gap-[7px] text-[#94a3b8] text-xs sm:text-sm font-semibold ml-auto transition-colors hover:text-[#475569]">
          <FaShare /> <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* ══ Comments Dropdown ══ */}
      {showComments && (
        <div className="border-t border-[#e8dfd3] bg-[#f5f1e8] px-3 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6">
          {loadingCmts ? (
            <div className="text-center py-4 sm:py-5 text-[#94a3b8] text-sm">Loading comments…</div>
          ) : (
            <>
              {comments.length === 0 ? (
                <p className="text-[#94a3b8] text-sm text-center py-3 pb-4 m-0">
                  No comments yet — be the first!
                </p>
              ) : (
                <div className="flex flex-col gap-4 sm:gap-5 mb-4 sm:mb-5">
                  {comments.map(comment => (
                    <div key={comment._id}>
                      <div className="flex gap-2 sm:gap-3">
                        <Avatar name={comment.author?.name || "?"} size={34} />
                        <div className="flex-1 min-w-0">
                          <div className="bg-[#f0ebe2] rounded-[4px_14px_14px_14px] px-3 sm:px-4 py-2.5 sm:py-3">
                            <div className="flex items-center gap-2 mb-1 sm:mb-[5px]">
                              <span className="font-bold text-[#0f172a] text-xs sm:text-sm truncate">
                                {comment.author?.name || "Anonymous"}
                              </span>
                              <span className="text-[#94a3b8] text-xs flex-shrink-0">•</span>
                              <span className="text-[#94a3b8] text-[11px] sm:text-xs flex-shrink-0">
                                {timeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="m-0 text-[#475569] text-xs sm:text-sm leading-[1.6] sm:leading-[1.65]">
                              {comment.text}
                            </p>
                          </div>

                          {token && (
                            <button
                              onClick={() => {
                                setReplyTo(prev => prev?._id === comment._id
                                  ? null
                                  : { _id: comment._id, authorName: comment.author?.name }
                                );
                                setReplyText("");
                              }}
                              className={`bg-transparent border-none cursor-pointer text-xs sm:text-[13px] font-semibold px-1 py-[5px] sm:py-[6px] transition-colors ${replyTo?._id === comment._id ? "text-[#6b8e23]" : "text-[#94a3b8]"}`}
                            >
                              Reply
                            </button>
                          )}

                          {replyTo?._id === comment._id && (
                            <div className="flex gap-2 mt-1.5 sm:mt-[6px] items-center">
                              <Avatar name={me?.name || "?"} size={26} />
                              <input
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") handleReply(comment._id); }}
                                placeholder={`Reply to ${replyTo.authorName}…`}
                                maxLength={500}
                                autoFocus
                                className="flex-1 bg-[#f0ebe2] border-[1.5px] border-[#6b8e2355] rounded-[20px] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] text-[#0f172a] outline-none transition-colors focus:border-[#6b8e23]"
                                style={{ fontFamily: "inherit" }}
                              />
                              <button
                                onClick={() => handleReply(comment._id)}
                                disabled={!replyText.trim() || submitting}
                                className={`border-none rounded-[20px] px-3 sm:px-4 py-1.5 sm:py-2 font-bold text-xs sm:text-[13px] transition-all flex-shrink-0 ${replyText.trim() ? "bg-[#6b8e23] text-black cursor-pointer" : "bg-[#f0ebe2] text-[#94a3b8] cursor-not-allowed"}`}
                              >
                                {submitting ? "…" : "Reply"}
                              </button>
                              <button
                                onClick={() => { setReplyTo(null); setReplyText(""); }}
                                className="bg-transparent border border-[#e8dfd3] rounded-[20px] px-2.5 sm:px-3 py-1.5 sm:py-2 text-[#94a3b8] cursor-pointer text-xs flex-shrink-0"
                              >✕</button>
                            </div>
                          )}

                          {comment.replies?.length > 0 && (
                            <div className="mt-2.5 sm:mt-3 pl-3 sm:pl-[14px] flex flex-col gap-2 sm:gap-[10px]">
                              {comment.replies.map(reply => (
                                <div key={reply._id} className="flex gap-2 sm:gap-[10px]">
                                  <Avatar name={reply.author?.name || "?"} size={26} />
                                  <div className="bg-[#f0ebe2] rounded-[4px_12px_12px_12px] px-3 sm:px-[14px] py-2 sm:py-[10px] flex-1 border border-[#e8dfd3]">
                                    <span className="font-bold text-[#0f172a] text-xs sm:text-[13px]">
                                      {reply.author?.name || "Anonymous"}
                                    </span>
                                    <p className="mt-0.5 m-0 text-[#475569] text-[11px] sm:text-[13px] leading-[1.55]">
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
              <div className="flex gap-2 sm:gap-3 items-center">
                <Avatar name={me?.name || "?"} size={32} />
                {token ? (
                  <>
                    <input
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddComment(); }}
                      placeholder="Write a comment…"
                      maxLength={500}
                      className="flex-1 bg-[#f0ebe2] border-[1.5px] border-[#e8dfd3] rounded-[24px] px-4 sm:px-[18px] py-2 sm:py-[10px] text-xs sm:text-sm text-[#0f172a] outline-none transition-colors focus:border-[#6b8e23]"
                      style={{ fontFamily: "inherit" }}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-none flex items-center justify-center flex-shrink-0 transition-all ${newComment.trim() ? "bg-[#6b8e23] text-black cursor-pointer" : "bg-[#f0ebe2] text-[#94a3b8] cursor-not-allowed"}`}
                    >
                      <FaPaperPlane size={11} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="flex-1 bg-[#f0ebe2] border-[1.5px] border-dashed border-[#e8dfd3] rounded-[24px] px-4 sm:px-[18px] py-2 sm:py-[10px] text-xs sm:text-sm text-[#94a3b8] cursor-pointer text-left"
                    style={{ fontFamily: "inherit" }}
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
  const [newText,          setNewText]          = useState("");
  const [submitting,       setSubmitting]       = useState(false);
  const [totalPosts,       setTotalPosts]       = useState(0);
  const [newImages,        setNewImages]        = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const imgInputRef = useRef(null);

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

  const handleImageSelect = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;
    const remaining = 4 - newImages.length;
    const toAdd = incoming.slice(0, remaining);
    if (!toAdd.length) return;
    setNewImages(prev => [...prev, ...toAdd]);
    setNewImagePreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    URL.revokeObjectURL(newImagePreviews[idx]);
    setNewImages(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!newText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const keys = [];
      for (const file of newImages) {
        const r1 = await fetch(`${API}/api/s3/generate-upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, location: "community-posts" }),
        });
        const d1 = await r1.json();
        if (d1.data?.uploadUrl && d1.data?.key) {
          await fetch(d1.data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
          keys.push(d1.data.key);
        }
      }
      const res = await fetch(`${API}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newText.trim(), imageKeys: keys, tags: [] }),
      });
      if (res.ok) {
        setNewText("");
        setNewImagePreviews(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return []; });
        setNewImages([]);
        fetchPosts(1, myPosts ? userId : "");
      }
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

  /* sidebar nav items */
  const navItems = [
    { icon: <FaTh size={13}/>,          label: "Global Feed",    active: !myPosts, onClick: () => { setMyPosts(false); setSidebarOpen(false); } },
    { icon: <FaCalendarAlt size={13}/>, label: "NGO Events",     active: false,    onClick: () => { setSidebarOpen(false); } },
    { icon: <FaTrophy size={13}/>,      label: "Impact Stories", active: false,    onClick: () => { setSidebarOpen(false); } },
  ];

  /* Sidebar nav+stats — reused in both desktop aside and mobile drawer */
  const SidebarContent = () => (
    <>
      <nav className="flex flex-col gap-[2px] mb-[18px]">
        {navItems.map((item, i) => (
          <button key={i} onClick={item.onClick}
            className={`flex items-center gap-3 px-[14px] py-[9px] rounded-[10px] border-none cursor-pointer text-sm text-left w-full transition-all ${item.active ? "bg-[#6b8e2320] text-[#6b8e23] font-bold" : "bg-transparent text-[#94a3b8] font-medium hover:bg-[#f0ebe2] hover:text-[#475569]"}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
        {token && (
          <button
            onClick={() => { setMyPosts(true); setSidebarOpen(false); }}
            className={`flex items-center gap-3 px-[14px] py-[9px] rounded-[10px] border-none cursor-pointer text-sm text-left w-full transition-all ${myPosts ? "bg-[#6b8e2320] text-[#6b8e23] font-bold" : "bg-transparent text-[#94a3b8] font-medium hover:bg-[#f0ebe2] hover:text-[#475569]"}`}
          >
            <FaUsers size={13} /> My Posts
          </button>
        )}
      </nav>

      <div className="bg-white rounded-2xl p-[14px] border border-[#e8dfd3]">
        <div className="flex items-center gap-2 mb-[10px]">
          <FaChartLine size={13} color={C.green} />
          <span className="font-bold text-[13px] text-[#6b8e23]">Community Stats</span>
        </div>
        {[
          { label: "Active Members", value: "1.2k" },
          { label: "Posts Shared",   value: totalPosts > 0 ? String(totalPosts) : "—" },
          { label: "Topics Covered", value: "8" },
        ].map((s, i) => (
          <div key={i} className={`flex justify-between items-center py-[7px] ${i > 0 ? "border-t border-[#e8dfd3]" : ""}`}>
            <span className="text-[13px] text-[#94a3b8]">{s.label}</span>
            <span className="text-[13px] font-bold text-[#0f172a]">{s.value}</span>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)] lg:overflow-hidden bg-[#f5f1e8] text-[#0f172a]">

      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      {sidebarOpen && (
        <div className="cf-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div
            className="cf-sidebar-drawer w-[280px] h-full bg-white overflow-y-auto flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.12)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8dfd3] bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#6b8e2320] flex items-center justify-center text-[#6b8e23]">
                  <FaLeaf size={11} />
                </div>
                <span className="font-extrabold text-[15px] text-[#6b8e23]">Explore</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="bg-[#f0ebe2] border-none cursor-pointer text-[#475569] w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e8dfd3] transition-colors"
              >
                <FaX size={12} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 px-[14px] py-4 overflow-y-auto">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* ═══ DESKTOP LEFT SIDEBAR ═══ */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 h-full bg-white border-r border-[#e8dfd3] px-[14px] py-5 overflow-y-hidden">
        <div className="flex items-center gap-[10px] px-2 mb-[14px]">
          <div className="w-[30px] h-[30px] rounded-full bg-[#6b8e2320] flex items-center justify-center text-[#6b8e23]">
            <FaLeaf size={12} />
          </div>
          <span className="font-extrabold text-[15px] text-[#6b8e23]">Explore</span>
        </div>
        <SidebarContent />
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 min-w-0 lg:h-full lg:overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-3 sm:px-4 lg:px-5 pt-4 sm:pt-5 lg:pt-7 pb-20">

          {/* ── Mobile top bar ── */}
          <div className="flex lg:hidden items-center justify-between mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 bg-white border border-[#e8dfd3] rounded-xl px-3 py-2 text-[#475569] text-sm font-semibold cursor-pointer transition-all hover:bg-[#f0ebe2]"
            >
              <FaBars size={13} /> Explore
            </button>

            {/* Mobile quick tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setMyPosts(false)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${!myPosts ? "bg-[#6b8e23] text-white border-[#6b8e23]" : "bg-white text-[#475569] border-[#e8dfd3] hover:bg-[#f0ebe2]"}`}
              >
                <FaTh size={10} /> All
              </button>
              {token && (
                <button
                  onClick={() => setMyPosts(true)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${myPosts ? "bg-[#6b8e23] text-white border-[#6b8e23]" : "bg-white text-[#475569] border-[#e8dfd3] hover:bg-[#f0ebe2]"}`}
                >
                  <FaUsers size={10} /> Mine
                </button>
              )}
            </div>
          </div>

          {/* ── Page Header ── */}
          <div className="mb-4 sm:mb-6 lg:mb-7">
            <h1 className="m-0 mb-2 sm:mb-[10px] font-extrabold text-[#0f172a] text-[1.6rem] sm:text-[2rem] lg:text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.1]">
              Connect &amp; Collab
            </h1>
            <p className="m-0 text-[#475569] text-sm sm:text-[15px] leading-[1.65]">
              Real stories. Real impact. Share yours and inspire the change.
            </p>
          </div>

          {/* ── Create post ── */}
          {token ? (
            <div className="bg-white rounded-2xl px-4 sm:px-6 py-4 sm:py-5 border border-[#e8dfd3] mb-4 sm:mb-6 lg:mb-7">
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="What's on your mind regarding our mission?"
                maxLength={2000}
                className="w-full min-h-[80px] sm:min-h-[88px] bg-[#f0ebe2] border-[1.5px] border-[#e8dfd3] rounded-xl px-3 sm:px-4 py-3 sm:py-[14px] text-sm text-[#0f172a] resize-none outline-none leading-relaxed transition-colors focus:border-[#6b8e23]"
                style={{ fontFamily: "inherit" }}
              />
              {newImagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {newImagePreviews.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img src={src} alt=""
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-[10px] border-[1.5px] border-[#e8dfd3] block"
                      />
                      <button onClick={() => removeImage(idx)}
                        className="absolute -top-[6px] -right-[6px] w-[18px] h-[18px] sm:w-5 sm:h-5 rounded-full border-none bg-red-500 text-white text-[10px] sm:text-[11px] cursor-pointer leading-none flex items-center justify-center"
                      >✕</button>
                    </div>
                  ))}
                  {newImages.length < 4 && (
                    <button onClick={() => imgInputRef.current?.click()}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-[10px] border-[1.5px] border-dashed border-[#e8dfd3] bg-[#f0ebe2] cursor-pointer text-[#94a3b8] text-xl sm:text-[22px] flex items-center justify-center"
                    >+</button>
                  )}
                </div>
              )}
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0 mt-3">
                <button
                  onClick={() => imgInputRef.current?.click()}
                  className="bg-transparent border-[1.5px] border-[#e8dfd3] rounded-[10px] px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer text-[#475569] flex items-center gap-2 text-xs sm:text-[13px] font-semibold transition-all hover:border-[#6b8e23] hover:text-[#6b8e23] hover:bg-[#6b8e2308]"
                >
                  <FaCloudUploadAlt size={13} /> {newImages.length > 0 ? `${newImages.length} file${newImages.length > 1 ? "s" : ""} added` : "Upload Media"}
                </button>
                <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                <button
                  onClick={handleCreate}
                  disabled={!newText.trim() || submitting}
                  className={`w-full xs:w-auto px-5 sm:px-[26px] py-2 sm:py-[10px] rounded-[10px] border-none font-bold text-sm transition-all ${newText.trim() && !submitting ? "bg-[#6b8e23] text-black cursor-pointer" : "bg-[#f0ebe2] text-[#94a3b8] cursor-not-allowed"}`}
                >
                  {submitting ? "Posting…" : "Post Thought"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8dfd3] mb-4 sm:mb-6 lg:mb-7 text-center">
              <p className="text-[#94a3b8] m-0 mb-3 sm:mb-[14px] text-sm">
                Join the conversation — share your thoughts with the community
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-6 sm:px-7 py-2.5 sm:py-[10px] rounded-[10px] border-none bg-[#6b8e23] text-black font-bold text-sm cursor-pointer"
              >Login to Post</button>
            </div>
          )}

          {/* ── Posts ── */}
          {loading && page === 1 ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e8dfd3] mb-3 sm:mb-4">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#e8dfd3] flex-shrink-0" />
                  <div>
                    <div className="w-[120px] h-[13px] rounded-[6px] bg-[#e8dfd3] mb-2" />
                    <div className="w-[70px] h-[10px] rounded-[6px] bg-[#f0ebe2]" />
                  </div>
                </div>
                <div className="w-full h-3 rounded-[6px] bg-[#e8dfd3] mb-2" />
                <div className="w-3/4 h-3 rounded-[6px] bg-[#f0ebe2]" />
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl px-4 sm:px-6 py-12 sm:py-[60px] border border-[#e8dfd3] text-center">
              <div className="text-[44px] sm:text-[52px] mb-3 sm:mb-4">{myPosts ? "📝" : "🌱"}</div>
              <p className="font-bold text-[#0f172a] text-base m-0 mb-2">
                {myPosts ? "You haven't posted anything yet" : "No posts yet"}
              </p>
              <p className="text-[#94a3b8] text-sm m-0">
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
                <div className="text-center mt-2">
                  <button
                    onClick={() => { const next = page + 1; setPage(next); fetchPosts(next, myPosts ? userId : ""); }}
                    disabled={loading}
                    className={`px-7 sm:px-9 py-2.5 sm:py-3 rounded-[10px] border border-[#e8dfd3] bg-transparent text-[#475569] font-semibold text-sm transition-all hover:bg-white hover:text-[#0f172a] ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
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
