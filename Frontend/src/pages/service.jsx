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
import "./service.css";
import heroImg from "../assets/images/service/hero.png";

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
          className={`carousel-slide${i === idx ? " active" : ""}`}
          loading="lazy"
        />
      ))}
      <div className="carousel-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={`carousel-dot${i === idx ? " active" : ""}`}
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
        // If URL has a :category param use it, otherwise fall back to first category
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
      <section className="service-page">
        <div className="service-layout">
          <p style={{ padding: "2rem", textAlign: "center" }}>Loading services…</p>
        </div>
      </section>
    );
  }

  if (fetchError) {
    return (
      <section className="service-page">
        <div className="service-layout">
          <p style={{ padding: "2rem", textAlign: "center", color: "#c0392b" }}>
            Could not load services. Please make sure the server is running.<br />
            <small>{fetchError}</small>
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
    {/* ══ HERO — full image + text overlapping ══════════════════════════ */}
    <div style={{
      position: "relative",
      width: "100%",
      overflow: "hidden",
    }}>
      {/* full image — not cropped */}
      <img
        src={heroImg}
        alt="Community — hands raised together"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      />

      {/* left-side gradient so text stays readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.72) 45%, rgba(255,255,255,0.10) 75%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* bottom fade into page bg */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
        background: "linear-gradient(to bottom, transparent, #f4f4f4)",
        pointerEvents: "none",
      }} />

      {/* text content — overlaid on image, anchored bottom-left */}
      <div style={{
        position: "absolute", zIndex: 2,
        bottom: 0, left: 0,
        maxWidth: 680,
        padding: "clamp(32px,5vw,60px) clamp(20px,5vw,60px) clamp(48px,6vw,80px)",
      }}>

        {/* CENTRAL HUB badge */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          border: "1.5px solid #93c5fd", borderRadius: 999,
          padding: "5px 16px", fontSize: 12, fontWeight: 700,
          color: "#1e3a5f", letterSpacing: "0.08em", marginBottom: 24,
          background: "rgba(219,234,254,0.55)",
          backdropFilter: "blur(4px)",
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10l-3.7 2.5 1.4-4.3L2 5.5h4.5Z" fill="#3b82f6"/>
          </svg>
          CENTRAL HUB
        </span>

        {/* heading */}
        <h1 style={{
          margin: "0 0 20px",
          fontSize: "clamp(3rem, 7vw, 5.5rem)",
          fontWeight: 900,
          color: "#0f172a",
          lineHeight: 1.0,
          letterSpacing: "-0.02em",
        }}>
          Services
        </h1>

        {/* description */}
        <p style={{
          margin: "0 0 36px",
          fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
          color: "#1f2937",
          lineHeight: 1.75,
          maxWidth: 520,
        }}>
          Weaving together essential services through a digital tapestry of support.
          Access healthcare, education, and community resources through our integrated ecosystem.
        </p>

        {/* search + explore */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.92)", border: "1.5px solid #e5e7eb",
            borderRadius: 14, padding: "14px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            flex: "1 1 260px", maxWidth: 460,
            backdropFilter: "blur(6px)",
          }}>
            <FaSearch style={{ color: "#0f766e", fontSize: 16, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search specific causes (e.g. Health, Education)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: 15, color: "#374151", width: "100%",
              }}
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
            onMouseEnter={e => { e.currentTarget.style.background = "#0d9488"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#0f766e"; e.currentTarget.style.transform = "none"; }}
          >
            Explore
          </button>
        </div>
      </div>
    </div>

    <section className="service-page">
      <div className="service-layout">
<div className="category-strip desktop-category-strip">
          <div className="category-list" ref={categoryScrollerRef}>
            {categoryOptions.map((svc) => {
              const SvcIcon = svc.icon;
              const isActive = svc.id === activeServiceId;
              return (
                <button
                  key={svc.id}
                  ref={(node) => { categoryItemRefs.current[svc.id] = node; }}
                  type="button"
                  className={`category-item ${isActive ? "is-active" : ""}`}
                  onClick={() => handleServiceChange(svc.id)}
                  aria-pressed={isActive}
                >
                  <span className="cat-icon-box">
                    <SvcIcon className="category-icon" aria-hidden="true" />
                  </span>
                  <span className="cat-label">{getCatLabel(svc.id)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="programs-head">
          <h2>DONATE ONE-TIME</h2>
          <span className="title-rule" />
        </div>

        <p className="programs-context">
          Showing programs under{" "}
          <strong>{getCatLabel(activeServiceId)}</strong>
        </p>

        <div className="program-grid">
          {visiblePrograms.length > 0 ? (
            visiblePrograms.map((program) => (
              <article
                key={`${program.serviceId}-${program.title}`}
                className="program-card"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const catId = activeServiceId === ALL_CAUSES_ID ? program.serviceId : activeServiceId;
                  const programSlug = program.href
                    ? program.href.split("/").filter(Boolean).pop()
                    : program.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  navigate(`/services/${catId}/${programSlug}`);
                }}
              >
                <div className="program-media-link" aria-label={`Read more about ${program.title}`}>
                  <div className="program-media">
                    {program.images ? (
                      <CardCarousel images={program.images} alt={program.title} />
                    ) : program.image ? (
                      <img src={program.image} alt={program.title} loading="lazy" />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%", minHeight: "180px",
                        background: "linear-gradient(135deg,#e8edf5 0%,#d0d9e8 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "2.5rem", color: "#aab4c8"
                      }}>🖼️</div>
                    )}
                    <div className="program-readmore" aria-hidden="true">
                      <span>Read More</span>
                      <span className="program-readmore-dots">...</span>
                    </div>
                  </div>
                </div>
                <div className="program-body">
                  {activeServiceId === ALL_CAUSES_ID && (
                    <span className="program-service-tag">{getCatLabel(program.serviceId)}</span>
                  )}
                  <h3>{program.title}</h3>
                  <p>{program.description}</p>
                  <button
                    className="program-donate-btn"
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
            <div className="empty-state">
              <h3>No programs found</h3>
              <p>Try another search term or switch to a different category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div
          className="program-modal-overlay"
          onClick={() => setSelectedProgram(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedProgram.title}
        >
          <div
            className="program-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="program-modal-close"
              onClick={() => setSelectedProgram(null)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <div className="program-modal-img">
              <img src={selectedProgram.image} alt={selectedProgram.title} />
            </div>
            <div className="program-modal-body">
              <h2>{selectedProgram.title}</h2>
              <p className="program-modal-about-label">About This Program</p>
              <p className="program-modal-desc">
                {selectedProgram.fullDescription || selectedProgram.description}
              </p>
              <div className="program-modal-actions">
                <button
                  type="button"
                  className="program-modal-btn secondary"
                  onClick={() => setSelectedProgram(null)}
                >
                  Learn More
                </button>
                <button
                  type="button"
                  className="program-modal-btn primary"
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

      <button
        type="button"
        className={`mobile-cause-backdrop ${mobileFilterOpen ? "open" : ""}`}
        onClick={() => setMobileFilterOpen(false)}
        aria-label="Close filter panel"
      />

      <div className={`mobile-cause-panel ${mobileFilterOpen ? "open" : ""}`}>
        <div className="mobile-cause-panel-head">
          <span className="line" />
          <h3>Filter by Cause</h3>
          <span className="line" />
        </div>
        <div className="mobile-cause-grid">
          {categoryOptions.map((cause) => {
            const CauseIcon = cause.icon;
            const isActive = cause.id === activeServiceId;
            return (
              <button
                key={cause.id}
                type="button"
                className={`mobile-cause-item ${isActive ? "is-active" : ""}`}
                onClick={() => handleServiceChange(cause.id)}
              >
                <CauseIcon className="category-icon" aria-hidden="true" />
                <span>{getCatLabel(cause.id)}</span>
              </button>
            );
          })}
        </div>
        <button type="button" className="mobile-show-less" onClick={() => setMobileFilterOpen(false)}>
          <FaChevronUp aria-hidden="true" />
          <span>Show Less</span>
        </button>
      </div>

      <div className="mobile-cause-footer">
        <div className="mobile-cause-footer-title">
          <span className="line" />
          <h3>Filter by Cause</h3>
          <span className="line" />
        </div>
        <div className="mobile-cause-footer-actions">
          <button
            type="button"
            className={`mobile-quick-cause ${activeServiceId === ALL_CAUSES_ID ? "is-active" : ""}`}
            onClick={() => handleServiceChange(ALL_CAUSES_ID)}
          >
            <FaThLarge className="quick-icon" aria-hidden="true" />
            <span>{getCatLabel(ALL_CAUSES_ID)}</span>
          </button>
          <button
            type="button"
            className={`mobile-quick-cause ${activeServiceId !== ALL_CAUSES_ID && activeServiceId === mobileQuickCause?.id ? "is-active" : ""}`}
            onClick={() => handleServiceChange(mobileQuickCause?.id || categoryOptions[1]?.id)}
          >
            {mobileQuickCause && <mobileQuickCause.icon className="quick-icon" aria-hidden="true" />}
            <span>{getCatLabel(mobileQuickCause?.id)}</span>
          </button>
          <button type="button" className="mobile-quick-cause more" onClick={() => setMobileFilterOpen(true)}>
            <span className="more-dots">...</span>
            <span>More</span>
          </button>
        </div>
      </div>
    </section>
    </>
  );
}

export default ServicePage;
