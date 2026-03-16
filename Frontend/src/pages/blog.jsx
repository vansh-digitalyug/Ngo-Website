import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Loader2, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchBlogs } from "../utils/blogStore.js";

const blogText = (blog) => {
  if (Array.isArray(blog?.sections) && blog.sections.length > 0)
    return blog.sections.map((s) => `${s.heading} ${s.body}`).join(" ");
  return String(blog?.content || "");
};
const readingTime = (blog) => Math.max(1, Math.ceil(blogText(blog).trim().split(/\s+/).length / 200));

const authorInitials = (name = "") =>
  String(name)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const CAT_COLOR = {
  "Community Impact": "#c2410c",
  "Donor Guide": "#0369a1",
  "Volunteer Stories": "#15803d",
  Education: "#7c3aed",
  Health: "#be185d",
  General: "#78716c",
};

const catColor = (cat) => CAT_COLOR[cat] || "#78716c";

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .blog-card { transition: transform .2s ease, box-shadow .2s ease; }
  .blog-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -10px rgba(28,25,23,.2); }

  .blog-read-link { position: relative; display: inline-block; }
  .blog-read-link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 1.5px;
    background: currentColor;
    transition: width .2s ease;
  }
  .blog-read-link:hover::after { width: 100%; }
`;

const FbIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LiIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

function ShareRow({ blog }) {
  const pageUrl = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(blog.title || "");

  const open = (href, e) => {
    e.stopPropagation();
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const btnStyle = {
    background: "#f5f5f4",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    color: "#78716c",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ fontSize: "0.72rem", color: "#a8a29e", marginRight: "2px" }}>Share</span>
      <button style={btnStyle} onClick={(e) => open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, e)}>
        <FbIcon />
      </button>
      <button style={btnStyle} onClick={(e) => open(`https://twitter.com/intent/tweet?url=${pageUrl}&text=${title}`, e)}>
        <XIcon />
      </button>
      <button style={btnStyle} onClick={(e) => open(`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`, e)}>
        <LiIcon />
      </button>
    </div>
  );
}

function AuthorChip({ name, size = "sm" }) {
  const color = catColor(name) || "#78716c";
  const big = size === "lg";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: big ? "10px" : "7px" }}>
      <div
        style={{
          width: big ? "40px" : "28px",
          height: big ? "40px" : "28px",
          borderRadius: "50%",
          background: `${color}20`,
          border: `1.5px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: big ? "0.9rem" : "0.67rem",
          fontWeight: 700,
          color,
          flexShrink: 0,
        }}
      >
        {authorInitials(name) || <UserRound size={big ? 18 : 12} />}
      </div>
      <span style={{ fontSize: big ? "0.9rem" : "0.78rem", fontWeight: 600, color: "#44403c" }}>{name}</span>
    </div>
  );
}

function FeaturedCard({ blog, onRead }) {
  const mins = readingTime(blog);
  const cc = catColor(blog.category);

  return (
    <article
      className="blog-card"
      onClick={() => onRead(blog)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid #e7e5e4",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden", minHeight: "320px", background: "#e7e5e4" }}>
        {blog.coverImageUrl ? (
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserRound size={40} color="#a8a29e" />
          </div>
        )}
      </div>

      <div style={{ padding: "34px 36px", display: "flex", flexDirection: "column", gap: "14px", background: "#faf8f5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "3px", background: cc, borderRadius: "2px" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: cc }}>
            {blog.category}
          </span>
        </div>

        <h2 style={{ margin: 0, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 800, color: "#1c1917", lineHeight: 1.25 }}>
          {blog.title}
        </h2>

        {blog.excerpt && <p style={{ margin: 0, color: "#57534e", lineHeight: 1.65 }}>{blog.excerpt}</p>}

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <AuthorChip name={blog.author} />
          <span style={{ fontSize: "0.78rem", color: "#a8a29e", display: "flex", alignItems: "center", gap: "4px" }}>
            <CalendarDays size={12} />
            {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span style={{ fontSize: "0.78rem", color: "#a8a29e", display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={12} /> {mins} min read
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
          <button
            style={{
              background: cc,
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRead(blog);
            }}
          >
            Read full story
          </button>
          <ShareRow blog={blog} />
        </div>
      </div>
    </article>
  );
}

function StoryCard({ blog, onRead, delay = 0 }) {
  const mins = readingTime(blog);
  const cc = catColor(blog.category);

  return (
    <article
      className="blog-card"
      onClick={() => onRead(blog)}
      style={{
        background: "#fff",
        borderRadius: "12px",
        border: "1px solid #e7e5e4",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        opacity: 0,
        animation: `fadeUp .5s ease ${delay}s forwards`,
      }}
    >
      <div style={{ position: "relative", paddingBottom: "62%", overflow: "hidden", background: "#f5f5f4" }}>
        {blog.coverImageUrl ? (
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserRound size={32} color="#d6d3d1" />
          </div>
        )}
        <span
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            background: "rgba(28,25,23,.72)",
            color: "#fff",
            fontSize: "0.68rem",
            fontWeight: 600,
            padding: "3px 9px",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Clock size={10} /> {mins} min
        </span>
      </div>

      <div style={{ padding: "20px 22px 18px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "20px", height: "2.5px", background: cc, borderRadius: "2px", flexShrink: 0 }} />
          <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: cc }}>
            {blog.category}
          </span>
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "#1c1917",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p
            style={{
              margin: 0,
              fontSize: "0.88rem",
              color: "#78716c",
              lineHeight: 1.65,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {blog.excerpt}
          </p>
        )}

        <div
          style={{
            borderTop: "1px solid #f5f5f4",
            paddingTop: "14px",
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <AuthorChip name={blog.author} size="sm" />
            <span style={{ fontSize: "0.71rem", color: "#a8a29e", paddingLeft: "35px", display: "flex", alignItems: "center", gap: "3px" }}>
              <CalendarDays size={10} />
              {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(blog);
            }}
            className="blog-read-link"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, color: cc, padding: 0 }}
          >
            Read more
          </button>
        </div>
      </div>
    </article>
  );
}

function ArticleDetail({ blog }) {
  const mins = readingTime(blog);
  const cc = catColor(blog.category);

  return (
    <article
      style={{
        background: "#faf8f5",
        borderRadius: "18px",
        width: "100%",
        boxShadow: "0 22px 40px -18px rgba(0,0,0,.3)",
        overflow: "hidden",
      }}
    >
      {blog.coverImageUrl && (
        <div style={{ position: "relative", width: "100%", paddingBottom: "42%" }}>
          <img
            src={blog.coverImageUrl}
            alt={blog.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,25,23,.5) 0%, transparent 55%)" }} />
        </div>
      )}

      <div style={{ padding: "36px 44px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div style={{ width: "32px", height: "3px", background: cc, borderRadius: "2px" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: cc }}>
            {blog.category}
          </span>
          <span style={{ color: "#d6d3d1" }}>.</span>
          <span style={{ fontSize: "0.72rem", color: "#a8a29e", display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={11} /> {mins} min read
          </span>
        </div>

        <h1 style={{ margin: "0 0 22px", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, color: "#1c1917", lineHeight: 1.2 }}>
          {blog.title}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            paddingBottom: "22px",
            marginBottom: "28px",
            borderBottom: "2px solid #e7e5e4",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
            <AuthorChip name={blog.author} size="lg" />
            <span style={{ fontSize: "0.82rem", color: "#a8a29e", display: "flex", alignItems: "center", gap: "5px" }}>
              <CalendarDays size={13} />
              {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <ShareRow blog={blog} />
        </div>

        {blog.excerpt && (
          <p
            style={{
              margin: "0 0 28px",
              fontSize: "1.15rem",
              fontStyle: "italic",
              color: "#44403c",
              lineHeight: 1.7,
              fontWeight: 400,
              borderLeft: `4px solid ${cc}`,
              paddingLeft: "18px",
            }}
          >
            {blog.excerpt}
          </p>
        )}

        {Array.isArray(blog.sections) && blog.sections.length > 0 ? (
          <div>
            {blog.sections.map((sec, i) => (
              <div key={i} style={{ marginBottom: "28px" }}>
                {sec.heading && (
                  <h2 style={{
                    margin: "0 0 10px",
                    fontSize: "1.25rem", fontWeight: 800, color: "#1c1917",
                    lineHeight: 1.3, letterSpacing: "-0.01em",
                    paddingBottom: "8px", borderBottom: `2px solid ${cc}30`,
                  }}>
                    {sec.heading}
                  </h2>
                )}
                {sec.body && (
                  <p style={{ margin: 0, fontSize: "1.02rem", color: "#44403c", lineHeight: 1.9, whiteSpace: "pre-line" }}>
                    {sec.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "1.02rem", color: "#44403c", lineHeight: 1.9, whiteSpace: "pre-line" }}>{blog.content}</div>
        )}
      </div>
    </article>
  );
}

export default function BlogPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("All");

  useEffect(() => {
    fetchBlogs()
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openBlog = (blog) => {
    const blogId = blog?._id || blog?.id;
    if (!blogId) return;
    navigate(`/blog/${encodeURIComponent(blogId)}`);
  };

  const selectedBlog = useMemo(() => {
    if (!id) return null;
    return blogs.find((b) => String(b._id || b.id) === String(id)) || null;
  }, [blogs, id]);

  if (id) {
    if (loading) {
      return (
        <>
          <style>{css}</style>
          <div style={{ background: "#f7f5f0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", color: "#a8a29e" }}>
              <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "0.9rem" }}>Loading story...</span>
            </div>
          </div>
        </>
      );
    }

    if (!selectedBlog) {
      return (
        <>
          <style>{css}</style>
          <div style={{ background: "#f7f5f0", minHeight: "100vh", padding: "48px 24px" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
              <h1 style={{ margin: "0 0 10px", fontSize: "1.8rem", color: "#1c1917" }}>Story not found</h1>
              <p style={{ margin: 0, color: "#78716c" }}>This blog does not exist or may have been removed.</p>
              <button
                onClick={() => navigate("/blog")}
                style={{
                  marginTop: "20px",
                  background: "#c2410c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Back to all stories
              </button>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <style>{css}</style>
        <div style={{ background: "#f7f5f0", minHeight: "100vh", padding: "28px 16px 40px" }}>
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            <button
              onClick={() => navigate("/blog")}
              style={{ background: "none", border: "none", color: "#c2410c", fontWeight: 700, cursor: "pointer", marginBottom: "14px", padding: 0 }}
            >
              Back to stories
            </button>
            <ArticleDetail blog={selectedBlog} />
          </div>
        </div>
      </>
    );
  }

  const cats = ["All", ...new Set(blogs.map((b) => b.category))];
  const filtered = activeCat === "All" ? blogs : blogs.filter((b) => b.category === activeCat);
  const [hero, ...rest] = filtered;

  return (
    <>
      <style>{css}</style>
      <div style={{ background: "#f7f5f0", minHeight: "100vh", color: "#1c1917" }}>
        <header style={{ borderBottom: "3px solid #1c1917", background: "#faf8f5" }}>
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "22px 24px 0" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 900, color: "#1c1917" }}>SevaIndia Journal</h1>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#78716c" }}>Field reports . Donor stories . Community voices</p>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#a8a29e", fontStyle: "italic" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {!loading && blogs.length > 0 && (
              <nav style={{ display: "flex", overflowX: "auto" }}>
                {cats.map((cat) => {
                  const active = cat === activeCat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCat(cat)}
                      style={{
                        background: "none",
                        border: "none",
                        borderBottom: active ? "3px solid #c2410c" : "3px solid transparent",
                        padding: "10px 18px",
                        fontSize: "0.82rem",
                        fontWeight: active ? 700 : 500,
                        color: active ? "#c2410c" : "#57534e",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        marginBottom: "-3px",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>
        </header>

        <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "36px 24px 80px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "100px 0", color: "#a8a29e" }}>
              <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "0.9rem" }}>Loading stories...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <p style={{ fontSize: "1.1rem", color: "#78716c" }}>No stories in this category yet.</p>
              <button
                onClick={() => setActiveCat("All")}
                style={{ marginTop: "12px", background: "none", border: "none", cursor: "pointer", color: "#c2410c", fontWeight: 700, fontSize: "0.9rem", textDecoration: "underline" }}
              >
                View all stories
              </button>
            </div>
          ) : (
            <>
              {hero && <FeaturedCard blog={hero} onRead={openBlog} />}

              {rest.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "44px 0 32px" }}>
                  <div style={{ flex: 1, height: "1px", background: "#e7e5e4" }} />
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#a8a29e", whiteSpace: "nowrap" }}>
                    More Stories
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "#e7e5e4" }} />
                </div>
              )}

              {rest.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                  {rest.map((blog, i) => (
                    <StoryCard key={blog._id || blog.id} blog={blog} onRead={openBlog} delay={i * 0.08} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
