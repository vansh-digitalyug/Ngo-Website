import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Loader2, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogs, selectBlogs, selectBlogsStatus } from "../store/slices/blogsSlice";

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

const CAT_COLORS = {
  "Community Impact": { bg: "bg-orange-50", accent: "#c2410c", text: "text-orange-700", button: "bg-orange-700 hover:bg-orange-800" },
  "Donor Guide": { bg: "bg-sky-50", accent: "#0369a1", text: "text-sky-700", button: "bg-sky-700 hover:bg-sky-800" },
  "Volunteer Stories": { bg: "bg-green-50", accent: "#15803d", text: "text-green-700", button: "bg-green-700 hover:bg-green-800" },
  Education: { bg: "bg-violet-50", accent: "#7c3aed", text: "text-violet-700", button: "bg-violet-600 hover:bg-violet-700" },
  Health: { bg: "bg-pink-50", accent: "#be185d", text: "text-pink-700", button: "bg-pink-600 hover:bg-pink-700" },
  General: { bg: "bg-stone-50", accent: "#78716c", text: "text-stone-700", button: "bg-stone-600 hover:bg-stone-700" },
};

const catColor = (cat) => CAT_COLORS[cat] || CAT_COLORS["General"];

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

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="text-xs text-stone-400 mr-1">Share</span>
      <button
        className="bg-stone-100 rounded-full w-7 h-7 text-stone-500 flex items-center justify-center hover:bg-stone-200 transition-colors"
        onClick={(e) => open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, e)}
      >
        <FbIcon />
      </button>
      <button
        className="bg-stone-100 rounded-full w-7 h-7 text-stone-500 flex items-center justify-center hover:bg-stone-200 transition-colors"
        onClick={(e) => open(`https://twitter.com/intent/tweet?url=${pageUrl}&text=${title}`, e)}
      >
        <XIcon />
      </button>
      <button
        className="bg-stone-100 rounded-full w-7 h-7 text-stone-500 flex items-center justify-center hover:bg-stone-200 transition-colors"
        onClick={(e) => open(`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`, e)}
      >
        <LiIcon />
      </button>
    </div>
  );
}

function AuthorChip({ name, size = "sm" }) {
  const big = size === "lg";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 bg-orange-100 border border-orange-200 ${big ? "w-10 h-10 text-sm" : "w-7 h-7 text-xs"}`}
        style={{ color: "#c2410c" }}
      >
        {authorInitials(name) || <UserRound size={big ? 18 : 12} />}
      </div>
      <span className={`font-semibold text-stone-700 ${big ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>{name}</span>
    </div>
  );
}

function FeaturedCard({ blog, onRead }) {
  const mins = readingTime(blog);
  const colors = catColor(blog.category);

  return (
    <article
      className="blog-card bg-white rounded-lg sm:rounded-2xl border border-stone-300 overflow-hidden cursor-pointer hover:shadow-lg transition-all grid grid-cols-1 sm:grid-cols-2"
      onClick={() => onRead(blog)}
    >
      <div className="relative overflow-hidden min-h-64 sm:min-h-80 bg-stone-300">
        {blog.coverImageUrl ? (
          <img src={blog.coverImageUrl} alt={blog.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <UserRound size={40} color="#a8a29e" />
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 flex flex-col gap-3 sm:gap-4 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-0.5 sm:w-8 sm:h-1 rounded" style={{ backgroundColor: colors.accent }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.accent }}>
            {blog.category}
          </span>
        </div>

        <h2 className="m-0 text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 leading-tight">
          {blog.title}
        </h2>

        {blog.excerpt && <p className="m-0 text-stone-700 text-sm sm:text-base leading-relaxed">{blog.excerpt}</p>}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
          <AuthorChip name={blog.author} />
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <CalendarDays size={12} />
            {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Clock size={12} /> {mins} min read
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mt-2 sm:mt-auto">
          <button
            className={`${colors.button} text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded text-sm sm:text-base font-bold transition-colors`}
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
  const colors = catColor(blog.category);

  return (
    <article
      className="blog-card bg-white rounded-xl border border-stone-300 overflow-hidden cursor-pointer flex flex-col hover:shadow-md transition-all"
      onClick={() => onRead(blog)}
      style={{ animation: `fadeUp 0.5s ease ${delay}s forwards`, opacity: 0 }}
    >
      <div className="relative pb-[62.5%] overflow-hidden bg-stone-100">
        {blog.coverImageUrl ? (
          <img src={blog.coverImageUrl} alt={blog.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <UserRound size={32} color="#d6d3d1" />
          </div>
        )}
        <span className="absolute bottom-2.5 right-2.5 bg-stone-900 bg-opacity-70 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
          <Clock size={10} /> {mins} min
        </span>
      </div>

      <div className="p-5 sm:p-6 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 rounded flex-shrink-0" style={{ backgroundColor: colors.accent }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
            {blog.category}
          </span>
        </div>

        <h3 className="m-0 text-base sm:text-lg font-black text-stone-950 leading-snug line-clamp-2">
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="m-0 text-sm text-stone-600 leading-relaxed line-clamp-3 flex-1">
            {blog.excerpt}
          </p>
        )}

        <div className="border-t border-stone-100 pt-3.5 mt-auto flex items-start sm:items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <AuthorChip name={blog.author} size="sm" />
            <span className="text-xs text-stone-400 pl-9 flex items-center gap-1">
              <CalendarDays size={10} />
              {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(blog);
            }}
            className="text-xs sm:text-sm font-bold transition-colors"
            style={{ color: colors.accent }}
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
  const colors = catColor(blog.category);

  return (
    <article className="bg-white rounded-2xl w-full shadow-xl overflow-hidden">
      {blog.coverImageUrl && (
        <div className="relative w-full pb-[42%]">
          <img src={blog.coverImageUrl} alt={blog.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 from-0% via-transparent via-55% to-transparent" />
        </div>
      )}

      <div className="p-6 sm:p-8 md:p-12">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-1 rounded flex-shrink-0" style={{ backgroundColor: colors.accent }} />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest" style={{ color: colors.accent }}>
            {blog.category}
          </span>
          <span className="text-stone-300">.</span>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Clock size={11} /> {mins} min read
          </span>
        </div>

        <h1 className="m-0 mb-5 sm:mb-6 text-3xl sm:text-4xl md:text-5xl font-black text-stone-950 leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-3 sm:gap-4 pb-5 sm:pb-6 mb-6 sm:mb-7 border-b-2 border-stone-300">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <AuthorChip name={blog.author} size="lg" />
            <span className="text-xs sm:text-sm text-stone-400 flex items-center gap-1">
              <CalendarDays size={13} />
              {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <ShareRow blog={blog} />
        </div>

        {blog.excerpt && (
          <p
            className="m-0 mb-6 sm:mb-7 text-lg sm:text-xl italic text-stone-700 leading-relaxed font-light"
            style={{ borderLeftColor: colors.accent, borderLeftWidth: "4px", paddingLeft: "1rem" }}
          >
            {blog.excerpt}
          </p>
        )}

        {Array.isArray(blog.sections) && blog.sections.length > 0 ? (
          <div>
            {blog.sections.map((sec, i) => (
              <div key={i} className="mb-7 sm:mb-8">
                {sec.heading && (
                  <h2
                    className="m-0 mb-2.5 text-xl sm:text-2xl font-black text-stone-950 leading-snug pb-2 border-b-2"
                    style={{ borderColor: `${colors.accent}30` }}
                  >
                    {sec.heading}
                  </h2>
                )}
                {sec.body && (
                  <p className="m-0 text-base sm:text-lg text-stone-700 leading-relaxed sm:leading-8 whitespace-pre-line">
                    {sec.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-base sm:text-lg text-stone-700 leading-relaxed sm:leading-8 whitespace-pre-line">{blog.content}</div>
        )}
      </div>
    </article>
  );
}

export default function BlogPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const blogs = useSelector(selectBlogs);
  const status = useSelector(selectBlogsStatus);
  const loading = status === "loading" || status === "idle";
  const [activeCat, setActiveCat] = useState("All");

  useEffect(() => {
    if (status === "idle") dispatch(fetchBlogs());
  }, [status, dispatch]);

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
        <div className="bg-sky-50 min-h-screen flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3 text-stone-400">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm sm:text-base">Loading story...</span>
          </div>
        </div>
      );
    }

    if (!selectedBlog) {
      return (
        <div className="bg-sky-50 min-h-screen p-6 sm:p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="m-0 mb-2.5 text-3xl sm:text-4xl text-stone-950 font-black">Story not found</h1>
            <p className="m-0 text-stone-600 text-base sm:text-lg">This blog does not exist or may have been removed.</p>
            <button
              onClick={() => navigate("/blog")}
              className="mt-5 bg-orange-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded text-sm sm:text-base font-bold hover:bg-orange-800 transition-colors"
            >
              Back to all stories
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-sky-50 p-4 sm:p-6 md:p-7">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/blog")}
            className="mb-3 sm:mb-4 bg-none border-none text-orange-700 font-bold cursor-pointer p-0 text-sm sm:text-base hover:underline"
          >
            Back to stories
          </button>
          <ArticleDetail blog={selectedBlog} />
        </div>
      </div>
    );
  }

  const cats = ["All", ...new Set(blogs.map((b) => b.category))];
  const filtered = activeCat === "All" ? blogs : blogs.filter((b) => b.category === activeCat);
  const [hero, ...rest] = filtered;

  return (
    <div className="bg-sky-50 text-stone-950">
      <header className="bg-sky-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <h1 className="m-0 text-3xl sm:text-5xl font-black text-stone-950">SevaIndia Journal</h1>
              <p className="m-0 mt-1 text-xs sm:text-sm text-stone-600">Field reports . Donor stories . Community voices</p>
            </div>
            <p className="text-xs text-stone-400 italic whitespace-nowrap">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {!loading && blogs.length > 0 && (
            <nav className="flex overflow-x-auto gap-0 border-b-4 border-stone-950">
              {cats.map((cat) => {
                const active = cat === activeCat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={`px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium sm:font-bold transition-colors whitespace-nowrap ${
                      active ? "text-orange-700 font-bold" : "text-stone-600 hover:text-stone-700"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 pb-8 sm:pb-12">
        {loading ? (
          <div className="flex flex-col items-center gap-3.5 py-20 text-stone-400">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm sm:text-base">Loading stories...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-base sm:text-lg text-stone-600">No stories in this category yet.</p>
            <button
              onClick={() => setActiveCat("All")}
              className="mt-3 bg-none border-none cursor-pointer text-orange-700 font-bold text-sm sm:text-base underline hover:no-underline"
            >
              View all stories
            </button>
          </div>
        ) : (
          <>
            {hero && <FeaturedCard blog={hero} onRead={openBlog} />}

            {rest.length > 0 && (
              <div className="flex items-center gap-3 sm:gap-4 my-8 sm:my-12">
                <div className="flex-1 h-px bg-stone-300" />
                <span className="text-xs font-bold uppercase tracking-wide text-stone-400 whitespace-nowrap">More Stories</span>
                <div className="flex-1 h-px bg-stone-300" />
              </div>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {rest.map((blog, i) => (
                  <StoryCard key={blog._id || blog.id} blog={blog} onRead={openBlog} delay={i * 0.08} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .blog-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .blog-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -10px rgba(28,25,23,.2); }
      `}</style>
    </div>
  );
}
