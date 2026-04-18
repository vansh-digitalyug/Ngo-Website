import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicSurveys, selectSurveysStatus } from "../store/slices/surveysSlice";
import { AlertCircle, Search, ChevronRight, Users, ClipboardList, MapPin, Target, ArrowRight, Loader2 } from "lucide-react";

const API = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const ANIMATIONS = `
  @keyframes psFadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes psShimmer { 0%{background-position:-700px 0} 100%{background-position:700px 0} }
  @keyframes psFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  .ps-fade { animation: psFadeUp 0.5s ease-out both; }
  .ps-float{ animation: psFloat 5s ease-in-out infinite; }
  .ps-skel {
    background: linear-gradient(90deg,#e8ecf0 0%,#d1d8e0 50%,#e8ecf0 100%);
    background-size: 700px 100%;
    animation: psShimmer 1.6s infinite;
  }
`;

// Search validation utility - NO NUMBERS ALLOWED
const SEARCH_VALIDATION = {
  onlyTextSpaceDash: (str) => str.replace(/[^a-zA-Z\s\-]/g, ""), // Remove numbers and special chars
  maxLength: (str, len) => str.slice(0, len),
  trimWhitespace: (str) => str.trim(),
  
  validateSearch: (search) => {
    const trimmed = search.trim();
    
    // Check for only spaces
    if (search.length > 0 && trimmed.length === 0) return "Search cannot contain only spaces";
    
    // Min length if searching
    if (trimmed.length > 0 && trimmed.length < 2) return "Search must be at least 2 characters";
    
    // Max length
    if (trimmed.length > 100) return "Search limited to 100 characters";
    
    // Check if attempting to type numbers
    if (/\d/.test(search)) return "Numbers not allowed - please use only letters";
    
    return "";
  },
};

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
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
      <div className="ps-skel h-1.5" />
      <div className="p-5 space-y-4">
        <div className="flex gap-2.5 mb-4">
          <div className="ps-skel w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="ps-skel w-3/5 h-3.5" />
            <div className="ps-skel w-2/5 h-2.5" />
          </div>
        </div>
        <div className="ps-skel w-5/6 h-4.5" />
        <div className="ps-skel w-full h-3" />
        <div className="ps-skel w-4/5 h-3" />
        <div className="ps-skel w-full h-10 rounded-lg" />
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
    <div className="w-full h-56 relative bg-slate-300 overflow-hidden">
      {loading && !url && (
        <div className="ps-skel w-full h-full" />
      )}
      {url && (
        <img
          src={url}
          alt="Survey cover"
          className="w-full h-full object-cover object-center"
        />
      )}
    </div>
  );
}

/* ── Survey Card ── */
function SurveyCard({ survey, delay, onParticipate }) {
  const qCount = survey.questions?.length || 0;
  const statusConfig = {
    draft: { bg: "bg-slate-100", color: "text-slate-700", label: "Draft" },
    active: { bg: "bg-green-100", color: "text-green-700", label: "Active" },
    closed: { bg: "bg-yellow-100", color: "text-yellow-800", label: "Closed" }
  }[survey.status] || { bg: "bg-slate-100", color: "text-slate-700", label: "Draft" };

  return (
    <div className="ps-fade bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col" style={{ animationDelay: `${delay}s` }}>
      {/* Cover Image */}
      {survey.coverImageKey && <CoverImage imgKey={survey.coverImageKey} />}

      {/* Card Content */}
      <div className="p-5 flex flex-col gap-0 flex-1">

        {/* Title and Status Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="m-0 font-black text-sm text-slate-900 leading-snug flex-1">
            {survey.title}
          </h3>
          <span className={`${statusConfig.bg} ${statusConfig.color} px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap flex-shrink-0`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Description */}
        {survey.description && (
          <p className="m-0 mb-2.5 text-slate-600 text-xs leading-relaxed line-clamp-2">
            {survey.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex gap-3 text-xs text-slate-500 mb-2.5 pb-2.5 border-b border-slate-100">
          <span className="flex items-center gap-1">
            <ClipboardList size={14} /> {qCount} question{qCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {survey.responseCount || 0} response{survey.responseCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* NGO info and meta pills */}
        <div className="flex items-center gap-3 mb-3">
          {/* NGO avatar */}
          <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center text-white font-black text-xs shadow-md">
            {(survey.ngoId?.ngoName || "N").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 text-xs truncate">
              {survey.ngoId?.ngoName || "NGO"}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {survey.ngoId?.city ? `${survey.ngoId.city}` : survey.ngoId?.state || "India"}
            </div>
          </div>
        </div>

        {/* Meta tags */}
        <div className="flex gap-1.5 flex-wrap mb-3 mt-auto">
          {survey.villageId && (
            <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
              <MapPin size={10} /> {survey.villageId.villageName}
            </span>
          )}

          {survey.targetAudience && (
            <span className="bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-1 text-xs font-bold truncate max-w-xs flex items-center gap-1">
              <Target size={10} /> {survey.targetAudience}
            </span>
          )}
        </div>

        {/* CTA */}
        <button 
          onClick={() => onParticipate(survey.shareToken)}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-md"
        >
          Participate <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function PublicSurveys() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const surveysStatus = useSelector(selectSurveysStatus);

  const [surveys,  setSurveys]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [searchError, setSearchError] = useState("");
  const [query,    setQuery]    = useState("");   // debounced
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(false);
  const [total,    setTotal]    = useState(0);
  const [error,    setError]    = useState("");

  /* inject styles */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = ANIMATIONS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  /* hydrate Redux store on idle */
  useEffect(() => {
    if (surveysStatus === "idle") dispatch(fetchPublicSurveys());
  }, [surveysStatus, dispatch]);

  /* debounce search with validation */
  useEffect(() => {
    setSearchError("");
    const t = setTimeout(() => { 
      setQuery(search); 
      setPage(1); 
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Allow only text (letters), spaces, and dashes - NO NUMBERS
    const cleaned = SEARCH_VALIDATION.onlyTextSpaceDash(value);
    // Apply max length
    const limited = SEARCH_VALIDATION.maxLength(cleaned, 100);
    setSearch(limited);
    
    // Real-time validation
    const error = SEARCH_VALIDATION.validateSearch(limited);
    setSearchError(error);
  };

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
    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      {/* ── Hero Section ── */}
      <div 
        className="relative overflow-hidden bg-cover bg-center py-24 md:py-32"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2560&auto=format&fit=crop')",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="ps-fade text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Surveys by NGOs
          </h1>

          <p className="ps-fade text-lg md:text-xl text-green-100 mb-8 leading-relaxed font-medium" style={{ animationDelay: "0.1s" }}>
            Share your feedback, help NGOs understand community needs,<br className="hidden sm:block" />
            and make your voice count.
          </p>

          {/* Search + Button row */}
          <div className="ps-fade max-w-2xl mx-auto" style={{ animationDelay: "0.18s" }}>
            <div className={`flex flex-col md:flex-row gap-3 bg-white rounded-xl overflow-hidden shadow-2xl transition-all ${searchError ? 'ring-2 ring-red-300' : search.trim().length > 0 ? 'ring-2 ring-green-300' : ''}`}>
              <div className="relative flex-1 flex items-center">
                <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  className={`w-full px-5 py-4 pl-14 outline-none text-slate-900 placeholder-slate-400 font-sans transition-colors ${searchError ? 'bg-red-50' : search.trim().length > 0 ? 'bg-green-50' : 'bg-white'}`}
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search surveys by title or NGO..."
                />
                {search.trim().length > 0 && !searchError && (
                  <div className="absolute right-4 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                onClick={() => fetchSurveys(1, search)}
                disabled={!!searchError || search.trim().length === 0}
                className={`px-6 md:px-8 py-4 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  searchError || search.trim().length === 0
                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-teal-700 hover:bg-teal-800 hover:shadow-lg'
                }`}
              >
                <Search size={16} /> Find Surveys
              </button>
            </div>
            <div className="flex justify-between items-start mt-2">
              {searchError ? (
                <p className="text-red-500 text-xs flex items-center gap-1 font-medium">
                  <AlertCircle size={14} /> {searchError}
                </p>
              ) : search.trim().length > 0 ? (
                <p className="text-green-600 text-xs flex items-center gap-1 font-medium">
                  ✓ Search ready
                </p>
              ) : null}
              <span className={`text-xs ml-auto font-medium ${search.length > 85 ? 'text-orange-600' : 'text-slate-400'}`}>
                {search.length}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-8 text-red-700 font-semibold text-sm flex items-center gap-3">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && page === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && surveys.length === 0 && !error && (
          <div className="text-center py-20 px-4 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="m-0 font-black text-2xl text-slate-900 mb-2">
              No surveys found
            </h3>
            <p className="text-slate-500 text-base m-0">
              {query ? `No surveys match "${query}". Try a different search.` : "No active surveys available right now. Check back later!"}
            </p>
            {query && (
              <button
                onClick={() => setSearch("")}
                className="mt-6 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {surveys.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <div className="text-center mt-12">
            <button
              onClick={loadMore}
              className="px-10 py-3.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              Load More Surveys <ChevronRight size={16} />
            </button>
          </div>
        )}

        {loading && page > 1 && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-teal-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-medium">Loading surveys...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Why Your Feedback Matters ── */}
      <div className="bg-slate-100 py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left — image */}
          <div className="relative order-2 md:order-1">
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video md:aspect-auto">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop"
                alt="Community discussion"
                className="w-full h-full object-cover block"
              />
            </div>
            {/* floating badge */}
            <div className="absolute -bottom-6 right-6 bg-teal-700 text-white rounded-2xl px-6 py-4 shadow-xl text-center">
              <div className="text-3xl font-black leading-tight">{total > 0 ? total : "10"}+</div>
              <div className="text-xs font-bold mt-1 opacity-90">Active Surveys</div>
            </div>
          </div>

          {/* Right — text */}
          <div className="order-1 md:order-2">
            <p className="m-0 mb-3 text-xs font-black text-teal-600 uppercase tracking-wider">
              Community Impact
            </p>
            <h2 className="m-0 mb-4 text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Why Your Feedback{" "}
              <span className="text-orange-600">Matters</span>
            </h2>
            <p className="m-0 mb-8 text-base text-slate-600 leading-relaxed">
              Direct community input is the most powerful tool for meaningful change. By participating in these surveys, you provide NGOs with the data they need to allocate resources, design programs, and advocate for policy changes that actually reflect your reality.
            </p>

            <div className="space-y-4">
              {[
                { icon: "🎯", title: "Data-Driven Advocacy",  desc: "Hard data makes community voices impossible to ignore.",             bg: "bg-orange-50", border: "border-orange-200" },
                { icon: "⚡", title: "Rapid Response",         desc: "Identify urgent needs as they emerge in your neighborhood.",         bg: "bg-green-50", border: "border-green-200" },
                { icon: "🤝", title: "Stronger Communities",   desc: "Your voice connects NGOs to the people who need them most.",         bg: "bg-blue-50", border: "border-blue-200" },
              ].map((item, i) => (
                <div key={i} className={`flex gap-3 items-start ${item.bg} border ${item.border} rounded-lg p-3.5`}>
                  <div className={`w-10 h-10 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center text-lg flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="m-0 mb-1 font-bold text-sm text-slate-900">{item.title}</p>
                    <p className="m-0 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
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
