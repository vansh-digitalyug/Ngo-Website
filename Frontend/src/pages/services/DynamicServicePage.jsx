import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { fetchProgramByHref } from "../../services/serviceService.js";
import { FaChevronLeft, FaChevronRight, FaShieldAlt, FaHeart, FaRegClock, FaHandHoldingHeart } from "react-icons/fa";

// ─── Simple image carousel ────────────────────────────────────────────────────
function Carousel({ images, alt }) {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (images.length <= 1) return;
        const t = setInterval(() => setIdx(i => (i + 1) % images.length), 3000);
        return () => clearInterval(t);
    }, [images.length]);

    if (!images.length) return null;
    return (
        <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", background: "#e8edf5" }}>
            <img
                src={images[idx]}
                alt={`${alt} — image ${idx + 1}`}
                style={{ width: "100%", maxHeight: "420px", objectFit: "cover", display: "block", transition: "opacity 0.4s" }}
            />
            {images.length > 1 && (
                <>
                    <button onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
                        style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.45)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FaChevronLeft />
                    </button>
                    <button onClick={() => setIdx(i => (i + 1) % images.length)}
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.45)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FaChevronRight />
                    </button>
                    <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                        {images.map((_, i) => (
                            <span key={i} onClick={() => setIdx(i)}
                                style={{ width: 8, height: 8, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,.45)", cursor: "pointer", display: "block" }} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ h = 24, w = "100%", r = 8, mb = 12 }) {
    return (
        <div style={{
            height: h, width: w, borderRadius: r, marginBottom: mb,
            background: "linear-gradient(90deg,#e8edf5 25%,#d0d9e8 50%,#e8edf5 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
        }} />
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DynamicServicePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [shareLabel, setShareLabel] = useState("Share");

    const href = location.pathname; // e.g. /services/women-empowerment/test

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        setNotFound(false);
        fetchProgramByHref(href)
            .then(setProgram)
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [href]);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: program?.title || "Service", url: window.location.href });
                return;
            }
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(window.location.href);
                setShareLabel("Link Copied");
                setTimeout(() => setShareLabel("Share"), 1600);
            }
        } catch { setShareLabel("Share"); }
    };

    // ── Not found ────────────────────────────────────────────────────────────
    if (notFound) {
        return (
            <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "system-ui" }}>
                <div style={{ fontSize: 48 }}>🔍</div>
                <h2 style={{ margin: 0, fontSize: "1.4rem", color: "#2d3748" }}>Program not found</h2>
                <p style={{ margin: 0, color: "#718096" }}>This service may have been moved or is no longer available.</p>
                <button onClick={() => navigate("/services")}
                    style={{ marginTop: 8, padding: "10px 24px", borderRadius: 8, border: "none", background: "#4c63b6", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" }}>
                    ← Back to Services
                </button>
            </div>
        );
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui" }}>
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                <Skeleton h={320} mb={24} />
                <Skeleton h={36} w="60%" mb={12} />
                <Skeleton h={16} mb={8} />
                <Skeleton h={16} mb={8} />
                <Skeleton h={16} w="80%" mb={8} />
            </div>
        );
    }

    const allImages = [
        ...(program.coverUrl ? [program.coverUrl] : []),
        ...(program.galleryUrls || []),
    ];

    return (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui" }}>
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

            {/* Back link */}
            <button onClick={() => navigate(-1)}
                style={{ background: "none", border: "none", color: "#4c63b6", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <FaChevronLeft size={12} /> Back
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr min(340px, 38%)", gap: 32, alignItems: "start" }}>

                {/* ── LEFT: main content ── */}
                <div>
                    {/* Category badge */}
                    {program.categoryName && (
                        <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: "#ebf0ff", color: "#4c63b6", fontSize: "0.78rem", fontWeight: 600, marginBottom: 12, letterSpacing: ".5px", textTransform: "uppercase" }}>
                            {program.categoryName}
                        </span>
                    )}

                    <h1 style={{ margin: "0 0 12px", fontSize: "2rem", fontWeight: 800, color: "#1a202c", lineHeight: 1.25 }}>
                        {program.title}
                    </h1>
                    <p style={{ margin: "0 0 28px", color: "#4a5568", fontSize: "1.05rem", lineHeight: 1.7 }}>
                        {program.description}
                    </p>

                    {/* Image gallery or carousel */}
                    {allImages.length > 0 && (
                        <div style={{ marginBottom: 32 }}>
                            <Carousel images={allImages} alt={program.title} />
                        </div>
                    )}

                    {/* Full description */}
                    {program.fullDescription && (
                        <section style={{ marginBottom: 28 }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a202c", marginBottom: 12 }}>About This Program</h2>
                            <div style={{ color: "#4a5568", lineHeight: 1.8, fontSize: "0.98rem" }}>
                                {program.fullDescription.split("\n").map((p, i) => p.trim() && <p key={i} style={{ marginBottom: 12 }}>{p}</p>)}
                            </div>
                        </section>
                    )}

                    {/* Trust strip */}
                    <section style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 32, padding: "20px", background: "#f7fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                        {[
                            { icon: FaShieldAlt, title: "Secure", desc: "100% secure donation processing." },
                            { icon: FaHeart, title: "Life-Changing", desc: "Every rupee directly serves beneficiaries." },
                            { icon: FaRegClock, title: "Transparent", desc: "All fund usage is reported and verified." },
                        ].map(({ icon: Icon, title, desc }) => (
                            <article key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <Icon style={{ color: "#4c63b6", marginTop: 2, flexShrink: 0 }} />
                                <div>
                                    <strong style={{ display: "block", fontSize: "0.85rem", color: "#2d3748", marginBottom: 2 }}>{title}</strong>
                                    <span style={{ fontSize: "0.8rem", color: "#718096" }}>{desc}</span>
                                </div>
                            </article>
                        ))}
                    </section>
                </div>

                {/* ── RIGHT: campaign card ── */}
                <aside style={{ position: "sticky", top: 80 }}>
                    <article style={{ borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.07)" }}>
                        {/* cover image */}
                        <div style={{ height: 200, overflow: "hidden", background: "#e8edf5" }}>
                            {program.coverUrl
                                ? <img src={program.coverUrl} alt={program.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🖼️</div>
                            }
                        </div>

                        <div style={{ padding: "20px" }}>
                            <h2 style={{ margin: "0 0 6px", fontSize: "1.05rem", fontWeight: 700, color: "#1a202c" }}>
                                {program.donationTitle || program.title}
                            </h2>
                            <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#718096" }}>Help us make a difference</p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <Link
                                    to="/donate"
                                    state={{ serviceImage: program.coverUrl, serviceTitle: program.donationTitle || program.title }}
                                    style={{ display: "block", textAlign: "center", padding: "12px 0", borderRadius: 8, background: "#4c63b6", color: "#fff", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
                                    {program.cta || "Help Now"}
                                </Link>
                                <button onClick={handleShare}
                                    style={{ padding: "11px 0", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#4a5568", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>
                                    {shareLabel}
                                </button>
                            </div>

                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#718096" }}>
                                <FaHandHoldingHeart style={{ color: "#4c63b6" }} />
                                <span>80G tax exemption available on all donations</span>
                            </div>
                        </div>
                    </article>
                </aside>
            </div>
        </div>
    );
}
