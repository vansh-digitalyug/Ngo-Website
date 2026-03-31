import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHeart, FaRegHeart, FaComment, FaEdit, FaTrash, FaReply, FaTimes } from "react-icons/fa";
import { API } from "../../utils/S3.js";

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
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
      width: size, height: size, borderRadius: "50%", background: color,
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.36, flexShrink: 0, userSelect: "none",
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

  useEffect(() => { fetchPost(); fetchComments(); }, [id]);

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
      setPost(prev => ({ ...prev, likeCount: data.data?.likeCount, isLiked: data.data?.liked }));
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
      if (res.ok) { setReplyText(""); setReplyTo(null); fetchComments(); }
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
    return userId === (author?._id || author || "").toString() || user.role === "admin";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center p-4">
      <div className="w-full max-w-[700px]">
        <div className="skeleton h-[50px] sm:h-[60px] rounded-xl mb-4 sm:mb-5" />
        <div className="skeleton h-[100px] sm:h-[120px] rounded-xl mb-4 sm:mb-5" />
        <div className="skeleton h-16 sm:h-20 rounded-xl" />
      </div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-[52px] sm:text-[64px] mb-3 sm:mb-4">📭</div>
        <p className="text-[#6b7280] text-base sm:text-[1.1rem] font-semibold">Post not found</p>
        <button
          onClick={() => navigate("/community")}
          className="mt-4 sm:mt-5 px-5 sm:px-6 py-2.5 sm:py-[10px] rounded-[10px] border-none bg-[#059669] text-white cursor-pointer font-semibold hover:bg-[#047857] transition-colors text-sm sm:text-base"
        >
          Back to Community
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f1e8] px-3 sm:px-4 pt-4 sm:pt-5 pb-[60px]">
      <div className="max-w-[700px] mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate("/community")}
          className="bg-[rgba(5,150,105,0.1)] border-none cursor-pointer inline-flex items-center gap-2 text-[#059669] font-bold text-sm sm:text-[15px] mb-5 sm:mb-7 px-3 sm:px-4 py-2 sm:py-[10px] rounded-[10px] transition-all hover:bg-[rgba(16,185,129,0.2)] hover:-translate-x-1"
        >
          <FaArrowLeft /> <span>Back to Community</span>
        </button>

        {/* ── Post card ── */}
        <div className="bg-white rounded-xl p-4 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05)] mb-5 sm:mb-7 border border-[#e5e7eb]">

          {/* Post header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
            <div className="flex items-center gap-3 sm:gap-[14px]">
              <Avatar name={post.author?.name} size={44} />
              <div>
                <div className="font-bold text-[#1f2937] text-base sm:text-[17px]">
                  {post.author?.name || "Anonymous"}
                </div>
                <div className="text-xs sm:text-[13px] text-[#6b7280] mt-[2px]">
                  {timeAgo(post.createdAt)}
                </div>
              </div>
            </div>
            {isPostOwner && (
              <div className="flex gap-2 sm:ml-auto flex-wrap">
                <button
                  onClick={() => { setEditText(post.text); setEditTags((post.tags || []).join(", ")); setShowEdit(true); }}
                  className="bg-[rgba(59,130,246,0.1)] border-[1.5px] border-[rgba(59,130,246,0.2)] rounded-[10px] px-3 sm:px-[14px] py-1.5 sm:py-2 cursor-pointer text-[#2563eb] flex items-center gap-[6px] text-xs sm:text-sm font-semibold transition-all hover:bg-[rgba(29,78,216,0.12)] hover:-translate-y-[2px]"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={handleDeletePost}
                  className="bg-[rgba(220,38,38,0.1)] border-[1.5px] border-[rgba(220,38,38,0.2)] rounded-[10px] px-3 sm:px-[14px] py-1.5 sm:py-2 cursor-pointer text-[#dc2626] flex items-center gap-[6px] text-xs sm:text-sm font-semibold transition-all hover:bg-[rgba(220,38,38,0.12)] hover:-translate-y-[2px]"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>

          <p className="m-0 mb-4 sm:mb-5 text-[#374151] leading-[1.75] sm:leading-[1.8] text-sm sm:text-base whitespace-pre-wrap">
            {post.text}
          </p>

          {post.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4 sm:mb-5">
              {post.tags.map(tag => (
                <span key={tag} className="bg-[rgba(5,150,105,0.1)] text-[#059669] rounded-full px-3 sm:px-[14px] py-1 sm:py-[6px] text-xs sm:text-[13px] font-bold border border-[rgba(5,150,105,0.2)]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-5 sm:gap-7 border-t border-[#e5e7eb] pt-4 sm:pt-[18px] flex-wrap">
            <button
              onClick={handleLike}
              className={`bg-transparent border-none cursor-pointer p-0 flex items-center gap-2 font-bold text-sm sm:text-base transition-all ${post.isLiked ? "text-[#dc2626]" : "text-[#6b7280] hover:text-[#059669] hover:scale-105"}`}
            >
              {post.isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{post.likeCount || 0}</span>
            </button>
            <button className="bg-transparent border-none cursor-pointer p-0 flex items-center gap-2 text-[#6b7280] font-bold text-sm sm:text-base transition-all hover:text-[#6b8e23]">
              <FaComment /> {post.commentCount || 0} Comment{post.commentCount !== 1 ? "s" : ""}
            </button>
          </div>
        </div>

        {/* ── Add comment ── */}
        {token ? (
          <div className="bg-white rounded-xl px-4 sm:px-7 py-4 sm:py-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] mb-5 sm:mb-7 border border-[#e5e7eb]">
            <h3 className="m-0 mb-3 sm:mb-[18px] text-sm sm:text-base font-bold text-[#1f2937]">
              💬 Share Your Thoughts
            </h3>
            <div className="flex gap-3 sm:gap-[14px]">
              <Avatar name={user?.name} size={36} />
              <div className="flex-1 min-w-0">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Share your thoughts…"
                  maxLength={500}
                  className="w-full min-h-[80px] sm:min-h-[90px] border-2 border-[#e5e7eb] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] resize-none outline-none text-[#1f2937] transition-all leading-relaxed focus:border-[#059669] focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)]"
                  style={{ fontFamily: "inherit" }}
                />
                <div className="flex justify-between items-center mt-2 sm:mt-[10px] gap-2">
                  <div className="text-xs text-[#6b7280] flex-shrink-0">{commentText.length}/500</div>
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || submitting}
                    className={`px-4 sm:px-6 py-2 sm:py-[10px] rounded-[10px] border-none text-white font-bold text-sm sm:text-[15px] transition-all ${commentText.trim() && !submitting ? "bg-gradient-to-br from-[#059669] to-[#047857] cursor-pointer shadow-[0_6px_16px_rgba(15,118,110,0.25)] hover:-translate-y-[2px] hover:shadow-[0_10px_24px_rgba(15,118,110,0.35)]" : "bg-[#d1d5db] cursor-not-allowed"}`}
                  >
                    {submitting ? "Posting…" : "Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[rgba(107,142,35,0.08)] to-[rgba(107,142,35,0.04)] rounded-[18px] px-4 sm:px-7 py-6 sm:py-8 mb-5 sm:mb-7 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] border-[1.5px] border-[rgba(107,142,35,0.2)]">
            <p className="m-0 mb-3 sm:mb-4 text-[#475569] text-sm sm:text-[1.05rem] font-semibold">
              Sign in to join the conversation
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-br from-[#6b8e23] to-[#556b2f] text-white border-none rounded-xl px-7 sm:px-9 py-3 sm:py-[13px] font-bold text-sm sm:text-[15px] cursor-pointer transition-all shadow-[0_6px_16px_rgba(107,142,35,0.25)] hover:-translate-y-[2px] hover:shadow-[0_12px_28px_rgba(107,142,35,0.35)]"
            >
              Login to Comment
            </button>
          </div>
        )}

        {/* ── Comments ── */}
        <div>
          <h3 className="text-sm sm:text-[1.1rem] font-bold text-[#1f2937] m-0 mb-4 sm:mb-5 flex items-center gap-2 sm:gap-[10px]">
            <FaComment size={16} className="text-[#6b8e23]" /> Comments ({post.commentCount || 0})
          </h3>

          {commentsLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-2xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-3 mb-3">
                    <div className="skeleton w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <div className="skeleton w-[30%] h-[12px] mb-[6px] rounded" />
                      <div className="skeleton w-[50%] h-[10px] rounded" />
                    </div>
                  </div>
                  <div className="skeleton w-full h-9 sm:h-10 rounded" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="bg-gradient-to-br from-[rgba(15,118,110,0.03)] to-[rgba(13,107,99,0.02)] rounded-2xl px-4 sm:px-6 py-10 sm:py-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[rgba(15,118,110,0.1)]">
              <div className="text-[44px] sm:text-[52px] mb-2 sm:mb-3">💬</div>
              <p className="text-[#475569] m-0 text-sm sm:text-[1.02rem] font-semibold">No comments yet</p>
              <p className="text-[#6b7280] mt-[6px] m-0 text-xs sm:text-[0.95rem]">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-[14px]">
              {comments.map((comment, idx) => (
                <div
                  key={comment._id}
                  className="bg-white rounded-2xl px-3 sm:px-[22px] py-4 sm:py-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-[rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]"
                  style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both` }}
                >
                  {/* Comment header */}
                  <div className="flex justify-between mb-2 sm:mb-3 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <Avatar name={comment.author?.name} size={34} />
                      <div className="min-w-0">
                        <div className="font-bold text-[#1f2937] text-sm sm:text-[15px] truncate">
                          {comment.author?.name || "Anonymous"}
                        </div>
                        <div className="text-[11px] sm:text-xs text-[#6b7280] mt-[2px]">
                          {timeAgo(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 items-center flex-shrink-0">
                      {token && (
                        <button
                          onClick={() => setReplyTo(
                            replyTo?.commentId === comment._id ? null :
                            { commentId: comment._id, authorName: comment.author?.name }
                          )}
                          className="bg-transparent border-none cursor-pointer text-[#6b7280] text-xs sm:text-[13px] flex items-center gap-1 sm:gap-[5px] font-bold transition-all px-1.5 sm:px-2 py-1 rounded-md hover:text-[#059669] hover:bg-[rgba(15,118,110,0.08)]"
                        >
                          <FaReply size={11} /> <span className="hidden xs:inline">Reply</span>
                        </button>
                      )}
                      {canDeleteComment(comment.author) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="bg-transparent border-none cursor-pointer text-[#ef4444] text-xs sm:text-sm px-1.5 sm:px-2 py-1 rounded-md transition-all hover:bg-[rgba(239,68,68,0.1)] hover:text-[#dc2626]"
                        >
                          <FaTrash size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="m-0 text-[#334155] text-xs sm:text-[0.96rem] leading-[1.65] sm:leading-[1.7]">
                    {comment.text}
                  </p>

                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <div className="mt-3 sm:mt-[14px] pl-3 sm:pl-4 border-l-[2.5px] border-[#e5e7eb] flex flex-col gap-2 sm:gap-[10px]">
                      {comment.replies.map(reply => (
                        <div key={reply._id}>
                          <div className="flex justify-between mb-1.5 sm:mb-[6px] gap-2">
                            <div className="flex items-center gap-2">
                              <Avatar name={reply.author?.name} size={24} />
                              <div>
                                <span className="font-bold text-[#111827] text-xs sm:text-[13px]">
                                  {reply.author?.name || "Anonymous"}
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-[#9ca3af] ml-1.5 sm:ml-2">
                                  {timeAgo(reply.createdAt)}
                                </span>
                              </div>
                            </div>
                            {canDeleteComment(reply.author) && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                className="bg-transparent border-none cursor-pointer text-[#ef4444] text-[10px] sm:text-xs flex-shrink-0"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                          <p className="m-0 text-[#374151] text-[11px] sm:text-[0.88rem] leading-[1.6] pl-7 sm:pl-9">
                            {reply.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyTo?.commentId === comment._id && (
                    <div className="mt-3 sm:mt-[14px] pl-3 sm:pl-4 border-l-[2.5px] border-[#059669]">
                      <div className="flex gap-2">
                        <Avatar name={user?.name} size={26} />
                        <div className="flex-1 min-w-0">
                          <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder={`Replying to ${replyTo.authorName}…`}
                            maxLength={500}
                            className="w-full min-h-[56px] sm:min-h-[64px] border-[1.5px] border-[#e5e7eb] rounded-lg px-2.5 sm:px-3 py-2 text-xs sm:text-[13px] resize-none outline-none focus:border-[#059669]"
                            style={{ fontFamily: "inherit" }}
                          />
                          <div className="flex gap-2 justify-end mt-1.5 sm:mt-[6px]">
                            <button
                              onClick={() => { setReplyTo(null); setReplyText(""); }}
                              className="px-3 sm:px-4 py-1.5 sm:py-[7px] rounded-lg border-[1.5px] border-[#e5e7eb] bg-[#f9fafb] cursor-pointer text-xs sm:text-[13px]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReply(comment._id)}
                              disabled={!replyText.trim() || submitting}
                              className={`px-3 sm:px-[18px] py-1.5 sm:py-[7px] rounded-lg border-none font-bold text-xs sm:text-[13px] text-white cursor-pointer ${replyText.trim() && !submitting ? "bg-[#059669]" : "bg-[#9ca3af]"}`}
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
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.55)] flex items-center justify-center z-[1000] p-3 sm:p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[560px] px-4 sm:px-7 py-5 sm:py-8 shadow-[0_24px_60px_rgba(0,0,0,0.22)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-[22px]">
              <h2 className="m-0 text-base sm:text-[1.3rem] font-extrabold text-[#111827]">Edit Post</h2>
              <button
                onClick={() => setShowEdit(false)}
                className="bg-transparent border-none cursor-pointer text-[#6b7280] text-lg sm:text-xl p-1"
              >
                <FaTimes />
              </button>
            </div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              maxLength={2000}
              className="w-full min-h-[110px] sm:min-h-[130px] border-[1.5px] border-[#e5e7eb] rounded-xl px-3 sm:px-4 py-3 sm:py-[14px] text-sm sm:text-[15px] resize-y outline-none text-[#111827] leading-[1.65] focus:border-[#059669]"
              style={{ fontFamily: "inherit" }}
            />
            <div className="text-[11px] sm:text-xs text-[#9ca3af] text-right mt-1 mb-3 sm:mb-[14px]">
              {editText.length}/2000
            </div>
            <input
              value={editTags}
              onChange={e => setEditTags(e.target.value)}
              placeholder="Tags: health, education (comma separated)"
              className="w-full border-[1.5px] border-[#e5e7eb] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none mb-4 sm:mb-5 text-[#374151] focus:border-[#059669]"
              style={{ fontFamily: "inherit" }}
            />
            <div className="flex gap-2 sm:gap-[10px] justify-end">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 sm:px-6 py-2 sm:py-[11px] rounded-[10px] border-[1.5px] border-[#e5e7eb] bg-[#f9fafb] cursor-pointer font-semibold text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPost}
                disabled={!editText.trim() || editSubmitting}
                className={`px-5 sm:px-7 py-2 sm:py-[11px] rounded-[10px] border-none font-bold text-xs sm:text-sm text-white cursor-pointer ${editText.trim() && !editSubmitting ? "bg-[#059669]" : "bg-[#9ca3af] cursor-not-allowed"}`}
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
