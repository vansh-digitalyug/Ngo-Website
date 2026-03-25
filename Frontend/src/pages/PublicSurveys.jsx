import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const STYLES = `
  @keyframes psFadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes psShimmer { 0%{background-position:-700px 0} 100%{background-position:700px 0} }
  @keyframes psSpin    { to{transform:rotate(360deg)} }
  @keyframes psFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

  .ps-fade { animation: psFadeUp 0.5s ease-out both; }
  .ps-float{ animation: psFloat 5s ease-in-out infinite; }
  .ps-skel {
    background: linear-gradient(90deg,#e8ecf0 0%,#d1d8e0 50%,#e8ecf0 100%);
    background-size: 700px 100%;
    animation: psShimmer 1.6s infinite;
    border-radius: 8px;
  }

  .ps-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    border: 1.5px solid #f1f5f9;
    box-shadow: 0 2px 14px rgba(0,0,0,0.06);
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
    display: flex;
    flex-direction: column;
  }
  .ps-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 40px rgba(15,118,110,0.13);
    border-color: #0f766e33;
  }

  .ps-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 24px; border-radius: 12px; border: none;
    background: linear-gradient(135deg,#0f766e,#065f46);
    color: #fff; font-weight: 800; font-size: 14px;
    cursor: pointer; transition: all 0.25s;
    box-shadow: 0 6px 18px rgba(15,118,110,0.3);
    width: 100%;
    font-family: inherit;
  }
  .ps-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 26px rgba(15,118,110,0.42);
  }

  .ps-search {
    width: 100%; padding: 13px 18px 13px 46px;
    border: 2px solid #e2e8f0; border-radius: 14px;
    font-size: 15px; font-family: inherit; outline: none;
    background: #fff; color: #0f172a; transition: all 0.25s;
    box-sizing: border-box;
  }
  .ps-search:focus { border-color: #0f766e; box-shadow: 0 0 0 4px rgba(15,118,110,0.08); }

  @media(max-width:640px) {
    .ps-grid { grid-template-columns: 1fr !important; }
  }
`;

function timeAgo(d) {
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1.5px solid #f1f5f9" }}>
      <div className="ps-skel" style={{ height: 6 }} />
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div className="ps-skel" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="ps-skel" style={{ width: "60%", height: 14, marginBottom: 8 }} />
            <div className="ps-skel" style={{ width: "35%", height: 11 }} />
          </div>
        </div>
        <div className="ps-skel" style={{ width: "85%", height: 18, marginBottom: 10 }} />
        <div className="ps-skel" style={{ width: "100%", height: 12, marginBottom: 6 }} />
        <div className="ps-skel" style={{ width: "70%", height: 12, marginBottom: 20 }} />
        <div className="ps-skel" style={{ width: "100%", height: 42, borderRadius: 12 }} />
      </div>
    </div>
  );
}

/* ── Cover Image loader ── */
function CoverImage({ imgKey }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imgKey) { setLoading(false); return; }
    fetch(`${API}/api/s3/get-url?key=${encodeURIComponent(imgKey)}`)
      .then(r => r.json())
      .then(d => { if (d.data?.Url) setUrl(d.data.Url); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [imgKey]);

  if (!url && !loading) return null;

  return (
    <div style={{
      width: "100%",
      height: 220,
      position: "relative",
      background: "#e2e8f0",
      overflow: "hidden"
    }}>
      {loading && !url && (
        <div className="ps-skel" style={{ width: "100%", height: "100%" }} />
      )}
      {url && (
        <img
          src={url}
          alt="Survey cover"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center"
          }}
        />
      )}
    </div>
  );
}

/* ── Survey Card ── */
function SurveyCard({ survey, delay, onParticipate }) {
  const qCount = survey.questions?.length || 0;
  const statusColor = {
    draft: { bg: "#f1f5f9", color: "#475569", label: "Draft" },
    active: { bg: "#dcfce7", color: "#166534", label: "Active" },
    closed: { bg: "#fef9c3", color: "#854d0e", label: "Closed" }
  }[survey.status] || { bg: "#f1f5f9", color: "#475569", label: "Draft" };

  return (
    <div className="ps-card ps-fade" style={{ animationDelay: `${delay}s` }}>
      {/* Cover Image */}
      {survey.coverImageKey && <CoverImage imgKey={survey.coverImageKey} />}

      {/* Card Content */}
      <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Title and Status Row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#0f172a", lineHeight: 1.35, flex: 1 }}>
            {survey.title}
          </h3>
          <span style={{
            background: statusColor.bg,
            color: statusColor.color,
            padding: "2px 8px",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            whiteSpace: "nowrap",
            flexShrink: 0
          }}>
            {statusColor.label}
          </span>
        </div>

        {/* Description */}
        {survey.description && (
          <p style={{
            margin: "0 0 10px", color: "#475569", fontSize: 12, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {survey.description}
          </p>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#64748b", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            📋 {qCount} question{qCount !== 1 ? "s" : ""}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            👥 {survey.responseCount || 0} response{survey.responseCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* NGO info and meta pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          {/* NGO avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#0f766e,#34d399)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 14,
            boxShadow: "0 2px 8px rgba(15,118,110,0.2)",
          }}>
            {(survey.ngoId?.ngoName || "N").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {survey.ngoId?.ngoName || "NGO"}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
              {survey.ngoId?.city ? `${survey.ngoId.city}` : survey.ngoId?.state || "India"}
            </div>
          </div>
        </div>

        {/* Meta tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12, marginTop: "auto" }}>
          {survey.villageId && (
            <span style={{
              background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
              borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700,
            }}>
              📍 {survey.villageId.villageName}
            </span>
          )}

          {survey.targetAudience && (
            <span style={{
              background: "#fdf4ff", color: "#7c3aed", border: "1px solid #e9d5ff",
              borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700,
              maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              👥 {survey.targetAudience}
            </span>
          )}
        </div>

        {/* CTA */}
        <button className="ps-btn" onClick={() => onParticipate(survey.shareToken)}>
          Participate in Survey →
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function PublicSurveys() {
  const navigate = useNavigate();
  const [surveys,  setSurveys]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [query,    setQuery]    = useState("");   // debounced
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(false);
  const [total,    setTotal]    = useState(0);
  const [error,    setError]    = useState("");

  /* inject styles */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchSurveys = useCallback(async (p = 1, q = "") => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: p, limit: 12 });
      if (q.trim()) params.set("search", q.trim());
      const res  = await fetch(`${API}/api/surveys/public?${params}`);
      const data = await res.json();
      if (!data.success) { setError(data.message || "Failed to load surveys."); return; }
      const list = data.data?.surveys || [];
      const pg   = data.data?.pagination || {};
      setSurveys(prev => p === 1 ? list : [...prev, ...list]);
      setHasMore((pg.page || p) < (pg.pages || 1));
      setTotal(pg.total || 0);
    } catch { setError("Could not load surveys. Please check your connection."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchSurveys(1, query); }, [query, fetchSurveys]);

  const handleParticipate = (token) => navigate(`/survey/${token}`);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchSurveys(next, query);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui,-apple-system,sans-serif", paddingBottom: 80 }}>

      {/* ── Hero ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2560&auto=format&fit=crop')",
        backgroundSize: "cover", backgroundPosition: "center",
        padding: "90px 20px 100px",
      }}>
        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.48)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <h1 className="ps-fade" style={{
            color: "#fff", fontSize: "clamp(2.2rem,5vw,3.4rem)",
            fontWeight: 900, margin: "0 0 18px", lineHeight: 1.1,
          }}>
            Surveys by NGOs
          </h1>

          <p className="ps-fade" style={{
            color: "#86efac", fontSize: 17, lineHeight: 1.75,
            margin: "0 0 40px", animationDelay: "0.1s", fontWeight: 500,
          }}>
            Share your feedback, help NGOs understand community needs,<br />
            and make your voice count.
          </p>

          {/* Search + Button row */}
          <div className="ps-fade" style={{
            display: "flex", gap: 0, maxWidth: 680, margin: "0 auto",
            background: "#fff", borderRadius: 14, overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            animationDelay: "0.18s",
          }}>
            <div style={{ position: "relative", flex: 1 }}>
              <svg style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                style={{
                  width: "100%", padding: "17px 18px 17px 48px",
                  border: "none", outline: "none",
                  fontSize: 15, fontFamily: "inherit", color: "#0f172a",
                  background: "transparent", boxSizing: "border-box",
                }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search surveys by title or NGO..."
              />
            </div>
            <button
              className="ps-fade"
              onClick={() => fetchSurveys(1, search)}
              style={{
                padding: "17px 28px", border: "none",
                background: "#134e4a", color: "#fff",
                fontWeight: 800, fontSize: 15, cursor: "pointer",
                fontFamily: "inherit", flexShrink: 0, letterSpacing: "0.01em",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#0f766e"}
              onMouseLeave={e => e.currentTarget.style.background = "#134e4a"}
            >
              Find Surveys
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fff1f2", border: "1.5px solid #fecdd3",
            borderRadius: 14, padding: "16px 20px", marginBottom: 24,
            color: "#be123c", fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>⚠️</span> {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && page === 1 && (
          <div
            className="ps-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}
          >
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && surveys.length === 0 && !error && (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "#fff", borderRadius: 24,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>📭</div>
            <h3 style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
              No surveys found
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 15, margin: 0 }}>
              {query ? `No surveys match "${query}". Try a different search.` : "No active surveys available right now. Check back later!"}
            </p>
            {query && (
              <button
                onClick={() => setSearch("")}
                style={{
                  marginTop: 20, padding: "10px 24px", borderRadius: 10, border: "none",
                  background: "#0f766e", color: "#fff", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {surveys.length > 0 && (
          <div
            className="ps-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}
          >
            {surveys.map((s, i) => (
              <SurveyCard
                key={s._id}
                survey={s}
                delay={Math.min(i % 12, 5) * 0.08}
                onParticipate={handleParticipate}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <button
              onClick={loadMore}
              style={{
                padding: "13px 44px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#0f766e,#065f46)",
                color: "#fff", fontWeight: 800, fontSize: 15,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 8px 24px rgba(15,118,110,0.28)",
                transition: "all 0.28s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(15,118,110,0.38)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,118,110,0.28)"; }}
            >
              Load More Surveys
            </button>
          </div>
        )}

        {loading && page > 1 && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <div style={{
              width: 32, height: 32, border: "3px solid #e2e8f0",
              borderTopColor: "#0f766e", borderRadius: "50%",
              margin: "0 auto", animation: "psSpin 0.7s linear infinite",
            }} />
          </div>
        )}
      </div>

      {/* ── Why Your Feedback Matters ── */}
      <div style={{ background: "#f1f5f9", padding: "80px 24px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "64px", alignItems: "center",
        }}>
          {/* Left — image */}
          <div style={{ position: "relative" }}>
            <div style={{
              borderRadius: 28, overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.13)",
              aspectRatio: "4/3",
            }}>
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop"
                alt="Community discussion"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            {/* floating badge */}
            <div style={{
              position: "absolute", bottom: -18, right: 24,
              background: "#0f766e", color: "#fff",
              borderRadius: 16, padding: "14px 22px",
              boxShadow: "0 8px 28px rgba(15,118,110,0.35)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{total > 0 ? total : "10"}+</div>
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 3, opacity: 0.88 }}>Active Surveys</div>
            </div>
          </div>

          {/* Right — text */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Community Impact
            </p>
            <h2 style={{ margin: "0 0 18px", fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
              Why Your Feedback{" "}
              <span style={{ color: "#ea580c" }}>Matters</span>
            </h2>
            <p style={{ margin: "0 0 32px", fontSize: 15, color: "#475569", lineHeight: 1.85 }}>
              Direct community input is the most powerful tool for meaningful change. By participating in these surveys, you provide NGOs with the data they need to allocate resources, design programs, and advocate for policy changes that actually reflect your reality.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "🎯", title: "Data-Driven Advocacy",  desc: "Hard data makes community voices impossible to ignore.",             bg: "#fff7ed", border: "#fed7aa" },
                { icon: "⚡", title: "Rapid Response",         desc: "Identify urgent needs as they emerge in your neighborhood.",         bg: "#f0fdf4", border: "#bbf7d0" },
                { icon: "🤝", title: "Stronger Communities",   desc: "Your voice connects NGOs to the people who need them most.",         bg: "#eff6ff", border: "#bfdbfe" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  background: item.bg, border: `1px solid ${item.border}`,
                  borderRadius: 14, padding: "14px 16px",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: "#fff", border: `1px solid ${item.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 3px", fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{item.title}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
