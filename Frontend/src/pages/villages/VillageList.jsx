import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchVillages, selectVillages, selectVillagesStatus } from "../../store/slices/villagesSlice";
import { MapPin, Users, Star, CheckCircle, PauseCircle, Flag, Droplets, Zap, Trash2, Route, Loader2, Search } from "lucide-react";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—";

const STATUS_META = {
  active:    { label: "Active",    bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
  paused:    { label: "Paused",    bg: "#fef9c3", color: "#854d0e", Icon: PauseCircle },
  completed: { label: "Completed", bg: "#dbeafe", color: "#1e40af", Icon: Flag },
};

const NEED_ICONS = { water: Droplets, electricity: Zap, sanitation: Trash2, roads: Route };
const NEED_COLORS = { water: "#0ea5e9", electricity: "#eab308", sanitation: "#10b981", roads: "#8b5cf6" };

const PAGE_SIZE = 12;

function NeedBadge({ need, pct }) {
  const Icon = NEED_ICONS[need];
  const color = NEED_COLORS[need];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={14} color={color} />
      </div>
      <span style={{ fontSize: "10px", fontWeight: "700", color }}>{pct}%</span>
    </div>
  );
}

function VillageCard({ village }) {
  const sm = STATUS_META[village.status] || STATUS_META.active;
  return (
    <Link to={`/villages/${village._id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 28px -4px rgba(0,0,0,0.12)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>

        {/* Top stripe */}
        <div style={{ height: "6px", background: "linear-gradient(90deg, #2563eb, #7c3aed)" }} />

        <div style={{ padding: "18px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
            <div>
              <h3 style={{ margin: "0 0 3px", fontWeight: "800", color: "#0f172a", fontSize: "16px" }}>{village.villageName}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b", fontSize: "12px" }}>
                <MapPin size={11} /> {village.district}, {village.state}
              </div>
            </div>
            <span style={{ background: sm.bg, color: sm.color, padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
              <sm.Icon size={10} /> {sm.label}
            </span>
          </div>

          {village.description && (
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#64748b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {village.description}
            </p>
          )}

          {/* NGO + stats */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "14px", flexWrap: "wrap" }}>
            {village.ngoId?.ngoName && (
              <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "600", background: "#eef2ff", padding: "2px 8px", borderRadius: "5px" }}>
                {village.ngoId.ngoName}
              </span>
            )}
            <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
              <Users size={10} /> {village.totalFamilies || 0} families
            </span>
            <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
              <Star size={10} /> {village.milestones?.length || 0} milestones
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Since {fmtDate(village.adoptedAt)}</span>
          </div>

          {/* Basic needs mini badges */}
          <div style={{ display: "flex", justifyContent: "space-around", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
            {["water", "electricity", "sanitation", "roads"].map(need => (
              <NeedBadge key={need} need={need} pct={village.basicNeeds?.[need]?.coveragePercent || 0} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function VillageList() {
  const dispatch = useDispatch();
  const allVillages = useSelector(selectVillages);
  const status = useSelector(selectVillagesStatus);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === "idle") dispatch(fetchVillages());
  }, [status, dispatch]);

  const loading = status === "loading" || status === "idle";

  // Client-side filtering
  const filtered = useMemo(() => {
    let result = allVillages;
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(v => v.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(v => v.state?.toLowerCase().includes(q));
    }
    return result;
  }, [allVillages, statusFilter, search]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageVillages = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when filter/search changes
  useEffect(() => { setPage(1); }, [statusFilter, search]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", color: "#fff", padding: "60px 24px 48px", textAlign: "center" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: "900" }}>Village Adoptions</h1>
        <p style={{ margin: "0 auto", maxWidth: "520px", color: "#93c5fd", fontSize: "16px", lineHeight: 1.6 }}>
          NGOs are adopting villages to bring sustainable change — clean water, education, employment, and more.
        </p>
        {/* Search */}
        <div style={{ maxWidth: "420px", margin: "24px auto 0", position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by state…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: "10px", border: "none", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.95)" }}
          />
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 16px 60px" }}>
        {/* Stats row */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "24px" }}>
          <div style={{ padding: "12px 20px", background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{filtered.length}</span>
            <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "8px" }}>Villages Adopted</span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {["active", "paused", "completed", "all"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "7px 16px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                background: statusFilter === s ? "#2563eb" : "#fff",
                color: statusFilter === s ? "#fff" : "#374151",
                borderColor: statusFilter === s ? "#2563eb" : "#e2e8f0",
              }}>
              {s === "all" ? "All" : STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0", gap: "10px", color: "#64748b" }}>
            <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> Loading villages…
          </div>
        ) : pageVillages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <MapPin size={48} style={{ color: "#cbd5e1", marginBottom: "16px" }} />
            <p style={{ color: "#94a3b8", fontSize: "16px" }}>No villages found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: "18px" }}>
            {pageVillages.map(v => <VillageCard key={v._id} village={v} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginTop: "32px" }}>
            <button disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: currentPage <= 1 ? "not-allowed" : "pointer", opacity: currentPage <= 1 ? 0.5 : 1, fontWeight: "600" }}>← Prev</button>
            <span style={{ color: "#64748b" }}>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.5 : 1, fontWeight: "600" }}>Next →</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
