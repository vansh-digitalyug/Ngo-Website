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

/* ── Survey Card ── */
function SurveyCard({ survey, delay, onParticipate }) {
  const qCount = survey.questions?.length || 0;

  return (
    <div className="ps-card ps-fade" style={{ animationDelay: `${delay}s` }}>
      {/* Top accent */}
      <div style={{ height: 6, background: "linear-gradient(90deg,#0f766e,#34d399)" }} />

      <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>

        {/* NGO info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {/* NGO avatar */}
          <div style={{
            width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#0f766e,#34d399)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 16,
            boxShadow: "0 4px 12px rgba(15,118,110,0.25)",
            border: "2px solid #fff",
          }}>
            {(survey.ngoId?.ngoName || "N").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {survey.ngoId?.ngoName || "NGO"}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
              {survey.ngoId?.city ? `${survey.ngoId.city}, ${survey.ngoId.state}` : survey.ngoId?.state || "India"}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>
            {timeAgo(survey.createdAt)}
          </div>
        </div>

        {/* Title */}
        <h3 style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 16, color: "#0f172a", lineHeight: 1.35 }}>
          {survey.title}
        </h3>

        {/* Description */}
        {survey.description && (
          <p style={{
            margin: "0 0 12px", color: "#475569", fontSize: 13.5, lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {survey.description}
          </p>
        )}

        {/* Meta pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, marginTop: "auto", paddingTop: 8 }}>
          <span style={{
            background: "#f0fdf4", color: "#0f766e", border: "1px solid #bbf7d0",
            borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            📝 {qCount} Question{qCount !== 1 ? "s" : ""}
          </span>

          {survey.villageId && (
            <span style={{
              background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
              borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700,
            }}>
              📍 {survey.villageId.villageName}
            </span>
          )}

          {survey.targetAudience && (
            <span style={{
              background: "#fdf4ff", color: "#7c3aed", border: "1px solid #e9d5ff",
              borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700,
              maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              👥 {survey.targetAudience}
            </span>
          )}

          {survey.responseCount > 0 && (
            <span style={{
              background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa",
              borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700,
            }}>
              ✅ {survey.responseCount} responses
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
        background: "linear-gradient(135deg,#064e3b 0%,#0f766e 50%,#1e40af 100%)",
        padding: "52px 20px 70px", position: "relative", overflow: "hidden",
      }}>
        {/* dot grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px,transparent 1px)",
          backgroundSize: "26px 26px",
        }} />
        {/* blobs */}
        <div className="ps-float" style={{
          position: "absolute", top: -60, right: -40, width: 260, height: 260,
          borderRadius: "50%", background: "rgba(167,139,250,0.15)", pointerEvents: "none",
        }} />
        <div className="ps-float" style={{
          position: "absolute", bottom: -30, left: "20%", width: 180, height: 180,
          borderRadius: "50%", background: "rgba(52,211,153,0.12)", pointerEvents: "none",
          animationDelay: "1.5s",
        }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <div className="ps-fade" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.13)", color: "#fff",
            borderRadius: 999, padding: "6px 18px", fontSize: 11,
            fontWeight: 800, letterSpacing: "0.1em", marginBottom: 20,
            border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(10px)",
          }}>
            📋 COMMUNITY SURVEYS
          </div>

          <h1 className="ps-fade" style={{
            color: "#fff", fontSize: "clamp(1.8rem,4.5vw,2.8rem)",
            fontWeight: 900, margin: "0 0 14px", lineHeight: 1.1, letterSpacing: "-0.03em",
            animationDelay: "0.08s",
          }}>
            Surveys by NGOs
          </h1>

          <p className="ps-fade" style={{
            color: "rgba(255,255,255,0.78)", fontSize: 16, lineHeight: 1.7,
            margin: "0 0 32px", animationDelay: "0.14s",
          }}>
            Share your feedback, help NGOs understand community needs,<br />
            and make your voice count.
          </p>

          {/* Search bar */}
          <div className="ps-fade" style={{ position: "relative", maxWidth: 520, margin: "0 auto", animationDelay: "0.2s" }}>
            <span style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              fontSize: 18, pointerEvents: "none", zIndex: 1,
            }}>🔍</span>
            <input
              className="ps-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search surveys by title or topic…"
            />
          </div>

          {/* Total count */}
          {!loading && total > 0 && (
            <p className="ps-fade" style={{
              color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 14,
              fontWeight: 600, animationDelay: "0.24s",
            }}>
              {total} active survey{total !== 1 ? "s" : ""} available
            </p>
          )}
        </div>

        {/* wave */}
        <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ width: "100%", height: 48 }}>
            <path d="M0,24 C480,48 960,0 1440,24 L1440,48 L0,48Z" fill="#f8fafc" />
          </svg>
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
    </div>
  );
}
