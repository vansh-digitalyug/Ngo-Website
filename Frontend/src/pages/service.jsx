import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaBuilding,
  FaChevronUp,
  FaFemale,
  FaHandHoldingHeart,
  FaHeartbeat,
  FaSearch,
  FaShieldAlt,
  FaThLarge,
  FaTimes,
} from "react-icons/fa";
import { FaChildren } from "react-icons/fa6";
import { MdElderly } from "react-icons/md";
import { API } from "../utils/S3.js";
import heroImg from "../assets/images/service/hero.png";

const STYLES = `
  .sp-carousel-slide{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity 0.7s ease;}
  .sp-carousel-slide.active{opacity:1;}
  .sp-carousel-dots{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:3;pointer-events:all;}
  .sp-carousel-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.5);cursor:pointer;transition:background 0.2s ease,transform 0.2s ease;}
  .sp-carousel-dot.active{background:#fff;transform:scale(1.3);}
  @keyframes spModalIn{from{opacity:0;transform:translateY(18px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
  .sp-modal-card{animation:spModalIn 0.2s ease;}
  .sp-cat-label.is-active::after{content:"";position:absolute;bottom:-4px;left:0;right:0;height:2px;background:#ef4444;border-radius:2px;}
  .sp-cat-list::-webkit-scrollbar{display:none;}
  .sp-program-card{transition:transform 0.2s ease,box-shadow 0.2s ease;}
  .sp-program-card:hover{transform:translateY(-3px);box-shadow:0 16px 36px rgba(0,0,0,0.14);}
  .sp-program-card:focus-within{transform:translateY(-3px);box-shadow:0 16px 36px rgba(0,0,0,0.14);}
  .sp-program-card:hover .sp-readmore,.sp-program-card:focus-within .sp-readmore{opacity:1;transform:translateY(0);}
`;

// Map backend category names → frontend id + icon
const CATEGORY_META = {
  "Women Empowerment": { id: "women-empowerment", icon: FaFemale },
  "Orphan": { id: "orphan", icon: FaChildren },
  "Elderly": { id: "elder", icon: MdElderly },
  "Community Safety": { id: "community-safety", icon: FaShieldAlt },
  "Social Welfare": { id: "social-welfare", icon: FaHandHoldingHeart },
  "Medical Support": { id: "medical-support", icon: FaHeartbeat },
  "Infrastructure": { id: "infrastructure-development", icon: FaBuilding },
};

function metaFor(name) {
  if (CATEGORY_META[name]) return CATEGORY_META[name];
  return { id: name.toLowerCase().replace(/\s+/g, "-"), icon: FaHandHoldingHeart };
}

const ALL_CAUSES_ID = "all-causes";

function CardCarousel({ images, alt }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 2800);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={alt}
          className={`sp-carousel-slide${i === idx ? " active" : ""}`}
          loading="lazy"
        />
      ))}
      <div className="sp-carousel-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={`sp-carousel-dot${i === idx ? " active" : ""}`}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
          />
        ))}
      </div>
    </>
  );
}

function ServicePage() {
  const navigate = useNavigate();
  const { category } = useParams();
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeServiceId, setActiveServiceId] = useState(ALL_CAUSES_ID);
  const [query, setQuery] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileQuickCauseId, setMobileQuickCauseId] = useState(ALL_CAUSES_ID);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const categoryScrollerRef = useRef(null);
  const categoryItemRefs = useRef({});

  // Inject styles for pseudo-elements, animations and carousel
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "sp-styles";
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // Fetch services from backend on mount
  useEffect(() => {
    fetch(`${API}/api/services`)
      .then((r) => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const raw = Array.isArray(json.data) ? json.data : [];
        const mapped = raw.map((cat) => {
          const meta = metaFor(cat.name);
          return {
            id: meta.id,
            label: cat.name,
            icon: meta.icon,
            programs: (cat.programs || []).map((p) => ({
              title: p.title,
              description: p.description,
              fullDescription: p.fullDescription || p.description,
              image: p.imagekeys || "",
              images: p.galleryImageKeys?.length ? p.galleryImageKeys : undefined,
              cta: p.cta || "Help Now",
              href: p.href || null,
              donationTitle: p.donationTitle || p.title,
            })),
          };
        });
        setServiceData(mapped);
        const fromUrl = category ? mapped.find((s) => s.id === category) : null;
        const defaultId = fromUrl ? fromUrl.id : (mapped.length > 0 ? mapped[0].id : ALL_CAUSES_ID);
        setActiveServiceId(defaultId);
        setMobileQuickCauseId(defaultId !== ALL_CAUSES_ID ? defaultId : (mapped.length > 0 ? mapped[0].id : ALL_CAUSES_ID));
      })
      .catch((err) => {
        console.error("[ServicePage] Failed to load services:", err.message);
        setFetchError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const categoryOptions = useMemo(
    () => [
      { id: ALL_CAUSES_ID, icon: FaThLarge },
      ...serviceData.map((s) => ({ id: s.id, icon: s.icon })),
    ],
    [serviceData]
  );

  const getCatLabel = (serviceId) => {
    if (serviceId === ALL_CAUSES_ID) return "All Causes";
    const svc = serviceData.find((s) => s.id === serviceId);
    return svc ? svc.label : serviceId;
  };

  const selectedService = useMemo(
    () => serviceData.find((s) => s.id === activeServiceId) || null,
    [activeServiceId, serviceData]
  );

  const allPrograms = useMemo(
    () =>
      serviceData.flatMap((s) =>
        s.programs.map((p) => ({ ...p, serviceId: s.id }))
      ),
    [serviceData]
  );

  const sourcePrograms = useMemo(() => {
    if (activeServiceId === ALL_CAUSES_ID) return allPrograms;
    if (!selectedService) return [];
    return selectedService.programs.map((p) => ({ ...p, serviceId: selectedService.id }));
  }, [activeServiceId, allPrograms, selectedService]);

  const visiblePrograms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sourcePrograms;
    return sourcePrograms.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query, sourcePrograms]);

  const centerActiveCategory = (serviceId) => {
    const container = categoryScrollerRef.current;
    const item = categoryItemRefs.current[serviceId];
    if (!container || !item) return;
    const idealLeft = item.offsetLeft - (container.clientWidth - item.clientWidth) / 2;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    container.scrollTo({ left: Math.max(0, Math.min(idealLeft, maxScrollLeft)), behavior: "smooth" });
  };

  useEffect(() => {
    if (activeServiceId) centerActiveCategory(activeServiceId);
  }, [activeServiceId]);

  useEffect(() => {
    if (!selectedProgram) return;
    const handleKey = (e) => { if (e.key === "Escape") setSelectedProgram(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedProgram]);

  const mobileQuickCause = useMemo(
    () =>
      categoryOptions.find((c) => c.id === mobileQuickCauseId) ||
      categoryOptions[1],
    [mobileQuickCauseId, categoryOptions]
  );

  const handleServiceChange = (serviceId) => {
    setActiveServiceId(serviceId);
    if (serviceId !== ALL_CAUSES_ID) setMobileQuickCauseId(serviceId);
    setMobileFilterOpen(false);
    navigate(serviceId === ALL_CAUSES_ID ? "/services" : `/services/${serviceId}`);
  };

  if (loading) {
    return (
      <section className="bg-[#f1efef] text-[#2f2f2f] min-h-full pb-[90px]">
        <div className="max-w-[1380px] mx-auto pt-11 px-5">
          <p className="py-8 text-center">Loading services…</p>
        </div>
      </section>
    );
  }

  if (fetchError) {
    return (
      <section className="bg-[#f1efef] text-[#2f2f2f] min-h-full pb-[90px]">
        <div className="max-w-[1380px] mx-auto pt-11 px-5">
          <p className="py-8 text-center text-[#c0392b]">
            Could not load services. Please make sure the server is running.<br />
            <small>{fetchError}</small>
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <img
          src={heroImg}
          alt="Community — hands raised together"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.72) 45%, rgba(255,255,255,0.10) 75%, transparent 100%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
          background: "linear-gradient(to bottom, transparent, #f4f4f4)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", zIndex: 2, bottom: 0, left: 0,
          maxWidth: 680,
          padding: "clamp(32px,5vw,60px) clamp(20px,5vw,60px) clamp(48px,6vw,80px)",
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            border: "1.5px solid #93c5fd", borderRadius: 999,
            padding: "5px 16px", fontSize: 12, fontWeight: 700,
            color: "#1e3a5f", letterSpacing: "0.08em", marginBottom: 24,
            background: "rgba(219,234,254,0.55)", backdropFilter: "blur(4px)",
          }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5Z" fill="#3b82f6" />
            </svg>
            CENTRAL HUB
          </span>
          <h1 style={{
            margin: "0 0 20px",
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            fontWeight: 900, color: "#0f172a",
            lineHeight: 1.0, letterSpacing: "-0.02em",
          }}>
            Services
          </h1>
          <p style={{
            margin: "0 0 36px",
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            color: "#1f2937", lineHeight: 1.75, maxWidth: 520,
          }}>
            Weaving together essential services through a digital tapestry of support.
            Access healthcare, education, and community resources through our integrated ecosystem.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.92)", border: "1.5px solid #e5e7eb",
              borderRadius: 14, padding: "14px 20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
              flex: "1 1 260px", maxWidth: 460, backdropFilter: "blur(6px)",
            }}>
              <FaSearch style={{ color: "#0f766e", fontSize: 16, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search specific causes (e.g. Health, Education)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 15, color: "#374151", width: "100%" }}
              />
            </div>
            <button
              style={{
                background: "#0f766e", color: "#fff",
                border: "none", borderRadius: 14,
                padding: "14px 36px", fontSize: 15, fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(15,118,110,0.35)",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#0d9488"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#0f766e"; e.currentTarget.style.transform = "none"; }}
            >
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* ══ MAIN SECTION ════════════════════════════════════════════════ */}
      <section className="bg-[#f1efef] text-[#2f2f2f] min-h-full pb-[210px] lg:pb-[90px]">
        <div className="max-w-[1380px] mx-auto pt-7 px-[14px] md:pt-11 md:px-5">

          {/* Desktop category strip */}
          <div className="hidden lg:flex bg-white border-[3px] border-[#1e6e6e] rounded-[28px] px-7 py-5 mb-14 items-center">
            <div
              className="sp-cat-list flex items-center justify-evenly w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] py-1"
              ref={categoryScrollerRef}
            >
              {categoryOptions.map((svc) => {
                const SvcIcon = svc.icon;
                const isActive = svc.id === activeServiceId;
                return (
                  <button
                    key={svc.id}
                    ref={(node) => { categoryItemRefs.current[svc.id] = node; }}
                    type="button"
                    className="flex-1 border-0 bg-transparent flex flex-col items-center gap-[10px] cursor-pointer pt-1 px-2 pb-[6px] font-sans hover:-translate-y-[2px] transition-transform duration-200"
                    onClick={() => handleServiceChange(svc.id)}
                    aria-pressed={isActive}
                  >
                    <span className={`w-[58px] h-[58px] rounded-[14px] flex items-center justify-center transition-colors duration-200 ${isActive ? "bg-[#fce8e8]" : "bg-[#f1f3f5]"}`}>
                      <SvcIcon className={`text-2xl transition-colors duration-200 ${isActive ? "text-[#ef4444]" : "text-[#4b5563]"}`} aria-hidden="true" />
                    </span>
                    <span className={`sp-cat-label${isActive ? " is-active" : ""} text-[0.72rem] font-bold tracking-[0.08em] uppercase relative transition-colors duration-200 ${isActive ? "text-[#ef4444]" : "text-[#6b7280]"}`}>
                      {getCatLabel(svc.id)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Programs head */}
          <div className="flex items-center gap-[18px] mb-[10px]">
            <h2
              className="m-0 font-sans tracking-[0.01em] text-[#4a4a4a] font-extrabold"
              style={{ fontSize: "clamp(1.5rem,2.3vw,2rem)" }}
            >
              DONATE ONE-TIME
            </h2>
            <span className="inline-block w-16 h-[2px] bg-[#b9b9b9]" />
          </div>

          <p className="m-0 mb-[26px] text-[#6b7280] text-base">
            Showing programs under <strong>{getCatLabel(activeServiceId)}</strong>
          </p>

          {/* Program grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[30px]">
            {visiblePrograms.length > 0 ? (
              visiblePrograms.map((program) => (
                <article
                  key={`${program.serviceId}-${program.title}`}
                  className="sp-program-card bg-white rounded-[22px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.09)] border border-[#ececec] cursor-pointer"
                  onClick={() => {
                    const catId = activeServiceId === ALL_CAUSES_ID ? program.serviceId : activeServiceId;
                    const programSlug = program.href
                      ? program.href.split("/").filter(Boolean).pop()
                      : program.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    navigate(`/services/${catId}/${programSlug}`);
                  }}
                >
                  <div className="block cursor-pointer" aria-label={`Read more about ${program.title}`}>
                    <div className="relative h-[255px] overflow-hidden">
                      {program.images ? (
                        <CardCarousel images={program.images} alt={program.title} />
                      ) : program.image ? (
                        <img src={program.image} alt={program.title} loading="lazy" className="w-full h-full object-cover block" />
                      ) : (
                        <div className="w-full h-full min-h-[180px] bg-gradient-to-br from-[#e8edf5] to-[#d0d9e8] flex items-center justify-center text-[2.5rem] text-[#aab4c8]">🖼️</div>
                      )}
                      <div className="sp-readmore absolute inset-0 flex items-center justify-center gap-[6px] bg-gradient-to-b from-[rgba(0,0,0,0.12)] to-[rgba(0,0,0,0.58)] text-white text-base font-bold opacity-0 translate-y-2 transition-all duration-200 pointer-events-none">
                        <span>Read More</span>
                        <span className="text-[1.25rem] leading-none -mt-[2px]">...</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-[22px] pt-[22px] pb-6">
                    {activeServiceId === ALL_CAUSES_ID && (
                      <span className="inline-block mb-[10px] px-[9px] py-1 rounded-full text-[0.78rem] font-bold tracking-[0.02em] text-[#4b5563] bg-[#eef2f7]">
                        {getCatLabel(program.serviceId)}
                      </span>
                    )}
                    <h3 className="m-0 mb-2 text-[1.22rem] font-sans font-bold">{program.title}</h3>
                    <p className="m-0 mb-[18px] text-[#5f6570] leading-[1.5]">{program.description}</p>
                    <button
                      className="inline-flex items-center justify-center w-full min-h-[44px] px-[14px] py-2 rounded-[10px] bg-[#ef4444] text-white text-[0.95rem] font-bold tracking-[0.01em] shadow-[0_8px_16px_rgba(239,68,68,0.22)] transition-colors duration-200 border-0 cursor-pointer hover:bg-[#dc2626] font-sans"
                      aria-label={`Donate now for ${program.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/donate", {
                          state: {
                            serviceImage: program.image,
                            serviceTitle: program.donationTitle,
                          },
                        });
                      }}
                    >
                      Help Now
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full text-center bg-white rounded-2xl border border-dashed border-[#d0d5dd] py-11 px-5">
                <h3 className="m-0 mb-2 font-bold">No programs found</h3>
                <p className="m-0 text-[#6b7280]">Try another search term or switch to a different category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Program Detail Modal */}
        {selectedProgram && (
          <div
            className="fixed inset-0 z-[2000] bg-[rgba(0,0,0,0.55)] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedProgram(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selectedProgram.title}
          >
            <div
              className="sp-modal-card relative bg-white rounded-2xl w-full max-w-[620px] max-h-[90vh] overflow-y-auto shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-[14px] z-10 border-0 bg-white/80 rounded-full w-[34px] h-[34px] flex items-center justify-center text-base text-[#444] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-colors duration-150 hover:text-[#ef4444]"
                onClick={() => setSelectedProgram(null)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
              <div className="w-full h-[200px] sm:h-[260px] overflow-hidden rounded-t-2xl">
                <img src={selectedProgram.image} alt={selectedProgram.title} className="w-full h-full object-cover block" />
              </div>
              <div className="px-[18px] pt-[18px] pb-[22px] sm:px-7 sm:pt-6 sm:pb-7">
                <h2 className="m-0 mb-[6px] font-sans font-bold text-[#1f2937] leading-[1.3] text-[1.15rem] sm:text-[1.35rem]">
                  {selectedProgram.title}
                </h2>
                <p className="text-[0.82rem] font-bold uppercase tracking-[0.08em] text-[#ef4444] m-0 mb-3">About This Program</p>
                <p className="text-[0.97rem] leading-[1.75] text-[#374151] m-0 mb-6">
                  {selectedProgram.fullDescription || selectedProgram.description}
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    className="flex-[1_1_100%] sm:flex-1 min-w-[130px] border-0 rounded-[10px] px-5 py-3 font-sans text-[0.97rem] font-bold cursor-pointer bg-[#f3f4f6] text-[#374151] transition-all duration-150 hover:opacity-90 hover:-translate-y-[1px]"
                    onClick={() => setSelectedProgram(null)}
                  >
                    Learn More
                  </button>
                  <button
                    type="button"
                    className="flex-[1_1_100%] sm:flex-1 min-w-[130px] border-0 rounded-[10px] px-5 py-3 font-sans text-[0.97rem] font-bold cursor-pointer bg-[#ef4444] text-white transition-all duration-150 hover:opacity-90 hover:-translate-y-[1px]"
                    onClick={() => {
                      setSelectedProgram(null);
                      navigate("/donate", {
                        state: {
                          serviceImage: selectedProgram.image,
                          serviceTitle: selectedProgram.donationTitle,
                        },
                      });
                    }}
                  >
                    Help Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile cause backdrop */}
        <button
          type="button"
          className={`lg:hidden fixed inset-0 border-0 m-0 bg-[rgba(22,26,34,0.3)] z-[1290] transition-opacity duration-[220ms] ${mobileFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setMobileFilterOpen(false)}
          aria-label="Close filter panel"
        />

        {/* Mobile cause panel */}
        <div
          className="lg:hidden fixed left-0 right-0 bottom-0 z-[1300] bg-[#f2f0f0] border-t border-[#dfd8d8] rounded-t-[20px] shadow-[0_-20px_35px_rgba(0,0,0,0.16)] transition-transform duration-[240ms] ease-out max-h-[78vh] overflow-y-auto px-[14px] pt-[14px]"
          style={{ transform: mobileFilterOpen ? "translateY(0)" : "translateY(106%)", paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-center gap-[10px]">
            <span className="w-[38px] h-[1px] bg-[#9ea4ad]" />
            <h3 className="m-0 text-[1.05rem] font-sans text-[#3f444f] font-semibold">Filter by Cause</h3>
            <span className="w-[38px] h-[1px] bg-[#9ea4ad]" />
          </div>
          <div className="mt-4 grid grid-cols-3 xs:grid-cols-4 gap-y-[14px] gap-x-2">
            {categoryOptions.map((cause) => {
              const CauseIcon = cause.icon;
              const isActive = cause.id === activeServiceId;
              return (
                <button
                  key={cause.id}
                  type="button"
                  className={`border-0 bg-transparent font-sans text-[0.88rem] font-semibold flex flex-col items-center justify-start gap-2 min-h-[84px] pt-1 px-[2px] cursor-pointer transition-colors duration-150 ${isActive ? "text-[#ef4444]" : "text-[#4d535c]"}`}
                  onClick={() => handleServiceChange(cause.id)}
                >
                  <CauseIcon className="text-[1.75rem]" aria-hidden="true" />
                  <span>{getCatLabel(cause.id)}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="w-full mt-[10px] border-0 bg-transparent text-[#60656e] inline-flex items-center justify-center gap-2 font-sans text-base font-bold pt-2 pb-[2px] cursor-pointer"
            onClick={() => setMobileFilterOpen(false)}
          >
            <FaChevronUp aria-hidden="true" />
            <span>Show Less</span>
          </button>
        </div>

        {/* Mobile cause footer */}
        <div
          className="lg:hidden fixed left-0 right-0 bottom-0 z-[1280] bg-[#f3f3f3] border-t border-[#dfdfdf] px-3 pt-[10px]"
          style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-center gap-[10px]">
            <span className="w-[38px] h-[1px] bg-[#9ea4ad]" />
            <h3 className="m-0 text-[1.05rem] font-sans text-[#3f444f] font-semibold">Filter by Cause</h3>
            <span className="w-[38px] h-[1px] bg-[#9ea4ad]" />
          </div>
          <div className="mt-[10px] grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-[10px] items-center">
            <button
              type="button"
              className={`border-0 rounded-full min-h-[40px] px-3 py-[6px] inline-flex items-center justify-center gap-2 font-sans text-[0.98rem] font-bold cursor-pointer whitespace-nowrap transition-colors duration-150 ${activeServiceId === ALL_CAUSES_ID ? "bg-[#ece6e6] text-[#ef4444]" : "bg-transparent text-[#474d56]"}`}
              onClick={() => handleServiceChange(ALL_CAUSES_ID)}
            >
              <FaThLarge className="text-[1.25rem]" aria-hidden="true" />
              <span>{getCatLabel(ALL_CAUSES_ID)}</span>
            </button>
            <button
              type="button"
              className={`border-0 rounded-full min-h-[40px] px-3 py-[6px] inline-flex items-center justify-center gap-2 font-sans text-[0.98rem] font-bold cursor-pointer whitespace-nowrap transition-colors duration-150 ${activeServiceId !== ALL_CAUSES_ID && activeServiceId === mobileQuickCause?.id ? "bg-[#ece6e6] text-[#ef4444]" : "bg-transparent text-[#474d56]"}`}
              onClick={() => handleServiceChange(mobileQuickCause?.id || categoryOptions[1]?.id)}
            >
              {mobileQuickCause && <mobileQuickCause.icon className="text-[1.25rem]" aria-hidden="true" />}
              <span>{getCatLabel(mobileQuickCause?.id)}</span>
            </button>
            <button
              type="button"
              className="col-span-full sm:col-span-1 border-0 bg-transparent rounded-[12px] min-h-[40px] px-[10px] py-[6px] text-[#474d56] inline-flex items-center justify-center gap-2 font-sans text-[0.98rem] font-bold cursor-pointer whitespace-nowrap"
              onClick={() => setMobileFilterOpen(true)}
            >
              <span className="text-[1.2rem] leading-none">...</span>
              <span>More</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default ServicePage;
