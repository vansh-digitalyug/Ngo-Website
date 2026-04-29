import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Search, Image as ImageIcon, Loader2, HeartHandshake, Globe, Users } from "lucide-react";

const API = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

// 🔥 Modern NGO / Impact Theme Animations
const ANIMATIONS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,600&display=swap');

  body { 
    background-color: #F5F4F0; /* Soft warm stone, NOT white */
    font-family: 'Outfit', sans-serif;
    color: #1E293B;
  }

  h1, h2, h3, .font-serif {
    font-family: 'Playfair Display', serif;
  }

  /* Elegant Smooth Reveal */
  .reveal-up {
    opacity: 0;
    transform: translateY(40px);
    animation: revealUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes revealUp {
    100% { opacity: 1; transform: translateY(0); }
  }

  /* Clip-Path Image Reveal */
  .image-reveal {
    clip-path: inset(100% 0 0 0);
    animation: clipReveal 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }
  @keyframes clipReveal {
    100% { clip-path: inset(0 0 0 0); }
  }

  /* High-End Card Hover */
  .ngo-card {
    background: #FFFFFF;
    border-radius: 12px;
    box-shadow: 0 10px 30px -10px rgba(15, 56, 38, 0.05);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
    border: 1px solid rgba(15, 56, 38, 0.05);
  }
  .ngo-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -10px rgba(15, 56, 38, 0.15);
  }

  .ngo-image { transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
  .ngo-card:hover .ngo-image { transform: scale(1.05); }

  /* Elegant Search Input */
  .impact-search {
    background: #FFFFFF;
    border: 1px solid rgba(15, 56, 38, 0.1);
    transition: all 0.4s ease;
    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  }
  .impact-search:focus-within {
    border-color: #0F3826;
    box-shadow: 0 10px 30px rgba(15, 56, 38, 0.1);
    transform: translateY(-2px);
  }

  /* Loading Skeleton */
  @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
  .skeleton {
    background: linear-gradient(90deg, #E2E0D9 25%, #F0EEE7 50%, #E2E0D9 75%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
  }
`;

const SEARCH_VALIDATION = {
  onlyTextSpaceDash: (str) => str.replace(/[^a-zA-Z\s\-]/g, ""),
  maxLength: (str, len) => str.slice(0, len),
  validateSearch: (search) => {
    const trimmed = search.trim();
    if (search.length > 0 && trimmed.length === 0) return "Please enter a valid search term.";
    if (trimmed.length > 0 && trimmed.length < 2) return "Please enter at least 2 characters.";
    if (trimmed.length > 100) return "Search term is too long.";
    if (/\d/.test(search)) return "Please use letters only.";
    return "";
  },
};

/* ── Image Component (Handles Secure AWS/S3 Loading) ── */
function CoverImage({ imgKey }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imgKey || imgKey.trim() === "") { setLoading(false); setError(true); return; }
    if (imgKey.startsWith("http")) { setUrl(imgKey); setLoading(false); return; }

    setError(false); setLoading(true);
    
    fetch(`${API}/api/s3/get-url?key=${encodeURIComponent(imgKey)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Auth block");
        return r.json();
      })
      .then(d => {
        if (d.data?.Url) setUrl(d.data.Url);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [imgKey]);

  if (error || !imgKey) {
    return (
      <div className="w-full h-[220px] bg-[#E2E0D9] flex flex-col items-center justify-center">
        <HeartHandshake size={32} className="text-[#9CA3AF] mb-3" />
        <span className="text-[11px] uppercase tracking-widest text-[#6B7280] font-semibold">Image Unavailable</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[220px] relative bg-[#E2E0D9] overflow-hidden">
      {loading && <div className="skeleton w-full h-full absolute inset-0 z-10" />}
      {!loading && url && (
        <img src={url} alt="Campaign Cover" className="ngo-image w-full h-full object-cover" onError={() => setError(true)} />
      )}
    </div>
  );
}

/* ── Survey Card Component ── */
function SurveyCard({ survey, delay, onParticipate }) {
  const categoryLabel = survey.targetAudience || survey.targetPopulation || "Public Initiative";

  return (
    <div 
      className="ngo-card flex flex-col h-full cursor-pointer group reveal-up" 
      style={{ animationDelay: `${delay}s` }}
      onClick={() => onParticipate(survey.shareToken)}
    >
      <div className="relative">
        <CoverImage imgKey={survey.coverImageKey} />
        <div className="absolute top-4 left-4 bg-[#0F3826] text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-sm">
          {categoryLabel}
        </div>
      </div>

      <div className="p-7 flex-grow flex flex-col">
        <h3 className="text-2xl font-serif text-[#0F3826] font-semibold leading-tight mb-3 group-hover:text-[#E05D3A] transition-colors duration-300">
          {survey.title}
        </h3>

        {survey.description && (
          <p className="m-0 mb-8 text-[#64748B] text-sm leading-relaxed line-clamp-3">
            {survey.description}
          </p>
        )}

        <div className="mt-auto pt-5 flex items-center justify-between border-t border-[#E2E0D9]">
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-1">
              <Users size={12} /> Responses
            </span>
            <span className="text-lg font-semibold text-[#1E293B]">{survey.responseCount?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest mb-1">
              Managing NGO
            </span>
            <span className="font-semibold text-sm text-[#0F3826] truncate max-w-[140px]" title={survey.ngoId?.ngoName}>
              {survey.ngoId?.ngoName || "Independent Organization"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function PublicSurveys() {
  const navigate = useNavigate();
  
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState("");
  const [query, setQuery] = useState(""); 
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  
  // Real stats strictly from backend
  const [globalStats, setGlobalStats] = useState({ totalSurveys: 0, totalResponses: 0 });

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = ANIMATIONS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    setSearchError("");
    const t = setTimeout(() => { setQuery(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    const cleaned = SEARCH_VALIDATION.onlyTextSpaceDash(value);
    const limited = SEARCH_VALIDATION.maxLength(cleaned, 100);
    setSearch(limited);
    setSearchError(SEARCH_VALIDATION.validateSearch(limited));
  };

  const fetchData = useCallback(async (p = 1, q = "") => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: p, limit: 6 });
      if (q.trim()) params.set("search", q.trim());
      const res = await fetch(`${API}/api/surveys/public?${params}`);
      const data = await res.json();
      if (!data.success) { setError(data.message || "Failed to load NGO campaigns."); return; }
      
      const list = data.data?.surveys || [];
      const pg = data.data?.pagination || {};
      setSurveys(prev => p === 1 ? list : [...prev, ...list]);
      setHasMore((pg.page || p) < (pg.pages || 1));

      // Strictly real stats calculated from the backend response
      if (p === 1) {
        setGlobalStats({
          totalSurveys: pg.total || list.length,
          totalResponses: list.reduce((sum, s) => sum + (s.responseCount || 0), 0)
        });
      }
    } catch (e) { 
      setError("Unable to connect to the server. Please try again later.");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(1, query); }, [query, fetchData]);
  const loadMore = () => { const next = page + 1; setPage(next); fetchData(next, query); };

  return (
    <div className="min-h-screen pb-24">
      
      {/* ── IMPACT HERO SECTION ── */}
      <div className="pt-20 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: Animated Text */}
        <div className="lg:col-span-6 z-10 pr-0 lg:pr-8">
          <div className="reveal-up inline-flex items-center gap-2 text-[#E05D3A] text-[11px] font-bold uppercase tracking-widest mb-6" style={{ animationDelay: '0.1s' }}>
            <Globe size={14} /> Public Data Collection Platform
          </div>

          <h1 className="reveal-up text-5xl md:text-6xl lg:text-7xl font-serif text-[#0F3826] leading-[1.1] mb-6" style={{ animationDelay: '0.2s' }}>
            Empowering voices, <br />
            <span className="italic text-[#64748B]">driving impact.</span>
          </h1>

          <p className="reveal-up text-lg text-[#64748B] mb-10 leading-relaxed font-light" style={{ animationDelay: '0.3s' }}>
            Participate in crucial research studies conducted by verified Non-Governmental Organizations. Your honest feedback helps shape policies and directs resources where they matter most.
          </p>

          {/* Search Bar */}
          <div className="reveal-up impact-search flex items-center rounded-lg p-2 w-full" style={{ animationDelay: '0.4s' }}>
            <div className="pl-4 pr-3 text-[#94A3B8]"><Search size={22} /></div>
            <input
              className="flex-grow py-3 bg-transparent outline-none text-[17px] text-[#1E293B] placeholder-[#94A3B8]"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by issue, region, or NGO name..."
            />
            <button
              onClick={() => fetchData(1, search)}
              disabled={!!searchError || search.trim().length === 0}
              className={`px-8 py-3 rounded-md font-semibold text-sm transition-all ${
                searchError || search.trim().length === 0 
                  ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed' 
                  : 'bg-[#0F3826] text-white hover:bg-[#E05D3A] shadow-md'
              }`}
            >
              Search
            </button>
          </div>
          {searchError && (
             <div className="reveal-up pl-4 mt-3 text-[#E05D3A] text-xs font-medium flex items-center gap-1"><AlertCircle size={14}/> {searchError}</div>
          )}
        </div>

        {/* Right: Elegant Image Reveal */}
        <div className="lg:col-span-6 relative hidden lg:block">
           <div className="image-reveal relative w-full h-[550px] rounded-[24px] overflow-hidden" style={{ animationDelay: '0.3s' }}>
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2560&auto=format&fit=crop" 
                alt="Community Impact" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F3826]/60 to-transparent" />
              
              {/* Floating Highlight Box */}
              <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-2xl reveal-up" style={{ animationDelay: '1s' }}>
                 <p className="text-[#0F3826] font-serif text-xl font-bold mb-1">Make a difference today.</p>
                 <p className="text-[#64748B] text-sm">Join active community surveys.</p>
              </div>
           </div>
        </div>

      </div>

      {/* ── CONTENT GRID SECTION ── */}
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto mt-8">
        
        {/* Header line for the grid */}
        <div className="flex justify-between items-end border-b border-[#E2E0D9] pb-4 mb-10 reveal-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-3xl font-serif text-[#0F3826] font-semibold">Active Campaigns</h2>
            <span className="text-sm text-[#64748B]">Showing verified NGO surveys</span>
        </div>

        {error && (
          <div className="reveal-up bg-white border-l-4 border-[#E05D3A] rounded-md p-6 mb-10 flex items-center gap-4 shadow-sm text-[#E05D3A]">
            <AlertCircle size={24} /> {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && page === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="ngo-card h-[460px] flex flex-col">
                 <div className="skeleton h-[220px] w-full" />
                 <div className="p-7 flex-grow flex flex-col justify-center">
                    <div className="skeleton h-8 w-3/4 rounded-md mb-4" />
                    <div className="skeleton h-4 w-full rounded-md mb-3" />
                    <div className="skeleton h-4 w-5/6 rounded-md" />
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && surveys.length === 0 && !error && (
          <div className="reveal-up text-center py-28 bg-white rounded-2xl shadow-sm border border-[#E2E0D9]">
            <div className="w-16 h-16 bg-[#F5F4F0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#94A3B8]">
              <HeartHandshake size={32} />
            </div>
            <h3 className="text-2xl font-serif text-[#0F3826] mb-3 font-semibold">No active campaigns found</h3>
            <p className="text-[#64748B] mb-8">We couldn't find any NGO surveys matching your current filters.</p>
            {query && (
              <button onClick={() => setSearch("")} className="text-[#E05D3A] font-semibold hover:underline">
                Clear search criteria
              </button>
            )}
          </div>
        )}

        {/* Survey Cards */}
        {surveys.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {surveys.map((s, i) => (
              <SurveyCard 
                key={s._id} 
                survey={s} 
                delay={0.1 + (Math.min(i % 6, 6) * 0.1)} 
                onParticipate={(token) => navigate(`/survey/${token}`)} 
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center mt-16 reveal-up">
            <button
              onClick={loadMore}
              className="bg-transparent border border-[#0F3826] text-[#0F3826] px-8 py-3 rounded-md font-semibold transition-all hover:bg-[#0F3826] hover:text-white"
            >
              Load More Campaigns
            </button>
          </div>
        )}

        {loading && page > 1 && (
          <div className="flex justify-center mt-12">
            <div className="bg-white px-6 py-3 rounded-md shadow-sm border border-[#E2E0D9] flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-[#0F3826]" />
              <span className="text-sm font-medium text-[#64748B]">Loading more records...</span>
            </div>
          </div>
        )}

      </div>

      {/* ── STRICTLY REAL LIVE STATS FOOTER ── */}
      <div className="max-w-[1400px] mx-auto mt-24 px-6 md:px-12">
         <div className="bg-[#0F3826] text-white rounded-[24px] p-12 md:p-16 shadow-xl relative overflow-hidden reveal-up" style={{ animationDelay: '0.5s' }}>
            {/* Soft decorative circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#144732] rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#E05D3A] rounded-full blur-3xl opacity-20" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
               <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mb-4">Live NGO Campaigns</p>
                  <h3 className="text-5xl md:text-7xl font-serif font-semibold text-white">
                     {globalStats.totalSurveys.toLocaleString()}
                  </h3>
               </div>
               <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mb-4">Total Voices Heard</p>
                  <h3 className="text-5xl md:text-7xl font-serif font-semibold text-[#E05D3A]">
                     {globalStats.totalResponses.toLocaleString()}
                  </h3>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}