import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
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

// Map backend category names → frontend id + icon
const CATEGORY_META = {
  "Women Empowerment":      { id: "women-empowerment",         icon: FaFemale },
  "Orphan":                 { id: "orphan",                    icon: FaChildren },
  "Elderly":                { id: "elder",                     icon: MdElderly },
  "Community Safety":       { id: "community-safety",          icon: FaShieldAlt },
  "Social Welfare":         { id: "social-welfare",            icon: FaHandHoldingHeart },
  "Medical Support":        { id: "medical-support",           icon: FaHeartbeat },
  "Infrastructure":         { id: "infrastructure-development", icon: FaBuilding },
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
        if (mapped.length > 0) {
          setActiveServiceId(mapped[0].id);
          setMobileQuickCauseId(mapped[0].id);
        }
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
  };

  const moveActiveService = (direction) => {
    const currentIndex = categoryOptions.findIndex((s) => s.id === activeServiceId);
    if (currentIndex < 0) return;
    const nextIndex = Math.max(0, Math.min(currentIndex + direction, categoryOptions.length - 1));
    const nextId = categoryOptions[nextIndex].id;
    setActiveServiceId(nextId);
    if (nextId !== ALL_CAUSES_ID) setMobileQuickCauseId(nextId);
    setMobileFilterOpen(false);
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
    <section className="service-page">
      <div className="service-layout">
        <div className="service-topbar">
          <div className="title-block">
            <h1>Explore Causes</h1>
            <span className="title-rule" />
          </div>
          <div className="topbar-controls">
            <label className="search-control" htmlFor="service-search">
              <FaSearch aria-hidden="true" />
              <input
                id="service-search"
                type="text"
                placeholder="Search for a cause"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="category-strip desktop-category-strip">
          <button type="button" className="scroll-btn" aria-label="Scroll left" onClick={() => moveActiveService(-1)}>
            <FaChevronLeft />
          </button>
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
                  <SvcIcon className="category-icon" aria-hidden="true" />
                  <span>{getCatLabel(svc.id)}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="scroll-btn" aria-label="Scroll right" onClick={() => moveActiveService(1)}>
            <FaChevronRight />
          </button>
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
                onClick={() => program.href ? navigate(program.href) : setSelectedProgram(program)}
              >
                <div className="program-media-link" aria-label={`Read more about ${program.title}`}>
                  <div className="program-media">
                    {program.images ? (
                      <CardCarousel images={program.images} alt={program.title} />
                    ) : (
                      <img src={program.image} alt={program.title} loading="lazy" />
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
  );
}

export default ServicePage;
