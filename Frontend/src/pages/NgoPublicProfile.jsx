import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaFacebook, FaInstagram,
  FaCheckCircle, FaBuilding, FaCalendarAlt, FaIdCard, FaHandHoldingHeart,
  FaUsers, FaImages, FaArrowLeft, FaWhatsapp, FaExternalLinkAlt,
  FaTag, FaStar, FaHeart, FaShareAlt, FaCheck, FaTwitter, FaYoutube,
} from "react-icons/fa";

const API = String(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Build correct URL for gallery items (handles both filename-only and full-path storage)
const getGalleryUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${API}${url}`;
  return `${API}/uploads/gallery/${url}`;
};

const C = {
  green:     "#2d6a4f",
  greenDark: "#1b4332",
  greenSoft: "#52b788",
  greenBg:   "#f0f4f1",
  orange:    "#c45c2e",
  orangeBg:  "#fdf3ed",
  warmBg:    "#f9f6f2",
  border:    "#e0dbd5",
  text:      "#1c1c1c",
  textMid:   "#4a4a4a",
  textLight: "#767676",
  white:     "#ffffff",
};

const SERVICE_COLORS = {
  "Medical":           "#b5456a",
  "Education":         "#2a6496",
  "Elderly Care":      "#5a7a2d",
  "Orphanage":         "#8b5e1a",
  "Environment":       "#2d7a4f",
  "Community Welfare": "#5a2d82",
  "Infrastructure":    "#1b5278",
  "Women Empowerment": "#8b2d55",
};
const tagColor = (s) => SERVICE_COLORS[s] || C.green;

export default function NgoPublicProfile() {
  const { id } = useParams();
  const [ngo, setNgo]           = useState(null);
  const [gallery, setGallery]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [galFilter, setGalFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const [copied, setCopied]     = useState(false);


  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ngoRes, galRes] = await Promise.all([
          fetch(`${API}/api/ngo/${id}`),
          fetch(`${API}/api/ngo/${id}/gallery?limit=18`),
        ]);
        const ngoJson = await ngoRes.json();
        const galJson = await galRes.json();

        if (!ngoRes.ok || !ngoJson.success) throw new Error(ngoJson.message || "NGO not found");
        setNgo(ngoJson.data);
        if (galJson.success) setGallery(galJson.data.items || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = galFilter === "all" ? gallery : gallery.filter(g => g.type === galFilter);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "18px", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: `4px solid ${C.greenBg}`, borderTopColor: C.green, animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: C.textLight, fontSize: ".9rem" }}>Loading NGO profile…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", fontFamily: "'Inter',sans-serif", padding: "40px 20px", textAlign: "center" }}>
      <FaBuilding style={{ fontSize: "3rem", color: C.border }} />
      <h2 style={{ color: C.text, margin: 0 }}>NGO Not Found</h2>
      <p style={{ color: C.textLight }}>{error}</p>
      <Link to="/find-ngos" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: C.green, fontWeight: "600", textDecoration: "none", fontSize: ".95rem" }}>
        <FaArrowLeft /> Back to Find NGOs
      </Link>
    </div>
  );

  const years = ngo.estYear ? new Date().getFullYear() - ngo.estYear : null;

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',Roboto,sans-serif", color: C.text, background: C.warmBg, minHeight: "100vh" }}>
      <style>{`
        .np-hero { background: linear-gradient(135deg, ${C.greenDark} 0%, ${C.green} 60%, #3a7d5e 100%); }
        .np-stat { text-align:center; padding:20px 28px; }
        .np-stat + .np-stat { border-left:1px solid ${C.border}; }
        .np-tag { display:inline-flex; align-items:center; gap:6px; padding:5px 13px; border-radius:50px; font-size:.72rem; font-weight:700; letter-spacing:.5px; text-transform:uppercase; margin:4px 4px 4px 0; }
        .np-info-row { display:flex; align-items:flex-start; gap:12px; padding:14px 0; border-bottom:1px solid ${C.border}; }
        .np-info-row:last-child { border-bottom:none; }
        .gal-img { width:100%; height:200px; object-fit:cover; border-radius:10px; display:block; cursor:zoom-in; transition:transform .3s ease; }
        .gal-img:hover { transform:scale(1.03); }
        .gal-cell { position:relative; overflow:hidden; border-radius:10px; background:#111; }
        .gal-cell-over { position:absolute; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .25s; border-radius:10px; }
        .gal-cell:hover .gal-cell-over { opacity:1; }
        .lb-close { position:fixed; top:20px; right:24px; background:rgba(255,255,255,.15); border:none; color:#fff; width:40px; height:40px; border-radius:50%; font-size:1.3rem; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10002; }
        .lb-close:hover { background:rgba(255,255,255,.28); }
        .np-btn-gr { display:inline-flex; align-items:center; gap:8px; background:${C.orange}; color:#fff; padding:12px 26px; border-radius:6px; font-weight:600; font-size:.92rem; text-decoration:none; border:none; cursor:pointer; transition:background .2s,transform .2s; }
        .np-btn-gr:hover { background:#a84a22; transform:translateY(-1px); }
        .np-btn-out { display:inline-flex; align-items:center; gap:8px; border:1.5px solid ${C.green}; color:${C.green}; background:${C.white}; padding:11px 24px; border-radius:6px; font-weight:600; font-size:.9rem; text-decoration:none; cursor:pointer; transition:all .2s; }
        .np-btn-out:hover { background:${C.greenBg}; }
        .np-card { background:${C.white}; border:1px solid ${C.border}; border-radius:12px; padding:28px; }
        .fil-btn { padding:7px 18px; border-radius:50px; border:1.5px solid ${C.border}; background:${C.white}; font-size:.8rem; font-weight:600; color:${C.textMid}; cursor:pointer; transition:all .2s; }
        .fil-btn.active { background:${C.green}; color:#fff; border-color:${C.green}; }
        @media(max-width:900px){
          .np-layout { flex-direction:column !important; }
          .np-sidebar { width:100% !important; }
          .np-stats-row { grid-template-columns:1fr 1fr !important; }
          .np-stat + .np-stat { border-left:none; border-top:1px solid ${C.border}; }
          .np-hero-inner { padding:40px 20px 32px !important; }
          .np-hero-btns { flex-wrap:wrap !important; }
          .gal-grid { grid-template-columns:1fr 1fr !important; }
        }
        @media(max-width:520px){
          .gal-grid { grid-template-columns:1fr !important; }
          .np-stats-row { grid-template-columns:1fr 1fr !important; }
          .gal-header-row { flex-direction:column !important; align-items:flex-start !important; }
        }
      `}</style>

      {/* ── BACK LINK ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "12px 36px" }}>
        <Link to="/find-ngos" style={{ display: "inline-flex", alignItems: "center", gap: "7px", color: C.textMid, fontWeight: "600", fontSize: ".85rem", textDecoration: "none" }}>
          <FaArrowLeft style={{ fontSize: ".75rem" }} /> Back to Find NGOs
        </Link>
      </div>

      {/* ── HERO ── */}
      <div className="np-hero">
        <div className="np-hero-inner" style={{ maxWidth: "1160px", margin: "0 auto", padding: "60px 36px 48px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>

            {/* Avatar */}
            <div style={{ width: "88px", height: "88px", borderRadius: "16px", background: "rgba(255,255,255,.15)", border: "2px solid rgba(255,255,255,.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "2rem", fontWeight: "800", color: "#fff" }}>
              {ngo.ngoName?.[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: "800", color: "#fff", margin: 0, lineHeight: 1.2 }}>{ngo.ngoName}</h1>
                {ngo.verified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#d1fae5", color: "#065f46", padding: "4px 12px", borderRadius: "50px", fontSize: ".72rem", fontWeight: "700", letterSpacing: ".5px", textTransform: "uppercase", flexShrink: 0 }}>
                    <FaCheckCircle /> Verified
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
                {ngo.city && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,.8)", fontSize: ".88rem" }}>
                    <FaMapMarkerAlt style={{ fontSize: ".8rem" }} /> {ngo.city}{ngo.state ? `, ${ngo.state}` : ""}
                  </span>
                )}
                {ngo.regType && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,.7)", fontSize: ".88rem" }}>
                    <FaBuilding style={{ fontSize: ".8rem" }} /> {ngo.regType}
                  </span>
                )}
                {ngo.estYear && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,.7)", fontSize: ".88rem" }}>
                    <FaCalendarAlt style={{ fontSize: ".8rem" }} /> Est. {ngo.estYear}{years ? ` · ${years} yrs` : ""}
                  </span>
                )}
              </div>

              {/* Services tags */}
              {ngo.services?.length > 0 && (
                <div style={{ marginBottom: "22px" }}>
                  {ngo.services.slice(0, 5).map(s => (
                    <span key={s} className="np-tag" style={{ background: "rgba(255,255,255,.14)", color: "rgba(255,255,255,.92)", border: "1px solid rgba(255,255,255,.2)" }}>
                      {s}
                    </span>
                  ))}
                  {ngo.services.length > 5 && (
                    <span style={{ fontSize: ".72rem", color: "rgba(255,255,255,.6)", marginLeft: "4px" }}>+{ngo.services.length - 5} more</span>
                  )}
                </div>
              )}

              {/* CTAs */}
              <div className="np-hero-btns" style={{ display: "flex", gap: "12px" }}>
                <Link to={`/donate?ngoId=${ngo._id}&ngoName=${encodeURIComponent(ngo.ngoName)}`} className="np-btn-gr">
                  <FaHeart /> Donate Now
                </Link>
                {ngo.whatsapp && (
                  <a href={`https://wa.me/91${ngo.whatsapp}`} target="_blank" rel="noreferrer" className="np-btn-out" style={{ borderColor: "rgba(255,255,255,.4)", color: "#fff", background: "rgba(255,255,255,.1)" }}>
                    <FaWhatsapp /> WhatsApp
                  </a>
                )}
                <button onClick={handleCopy} className="np-btn-out" style={{ borderColor: "rgba(255,255,255,.4)", color: "#fff", background: "rgba(255,255,255,.1)" }}>
                  {copied ? <><FaCheck /> Copied!</> : <><FaShareAlt /> Share</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div className="np-stats-row" style={{ maxWidth: "1160px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { Icon: FaStar,             val: "4.8 / 5",                                     label: "Trust Rating"     },
            { Icon: FaHandHoldingHeart, val: `₹${(ngo.stats?.totalDonations || 0).toLocaleString("en-IN")}`, label: "Total Raised" },
            { Icon: FaUsers,            val: ngo.stats?.totalVolunteers || 0,                label: "Volunteers"       },
            { Icon: FaImages,           val: ngo.stats?.totalGalleryItems || gallery.length, label: "Gallery Items"    },
          ].map((s, i) => (
            <div key={i} className="np-stat">
              <s.Icon style={{ color: C.green, fontSize: "1.1rem", marginBottom: "6px" }} />
              <div style={{ fontSize: "1.35rem", fontWeight: "800", color: C.text, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: ".72rem", color: C.textLight, textTransform: "uppercase", letterSpacing: "1.2px", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "40px 36px 80px" }}>
        <div className="np-layout" style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>

          {/* ── SIDEBAR ── */}
          <aside className="np-sidebar" style={{ width: "320px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Contact Card */}
            <div className="np-card">
              <h3 style={{ fontSize: ".9rem", fontWeight: "700", color: C.text, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "1px" }}>Contact</h3>
              <div>
                {ngo.contactName && (
                  <div className="np-info-row">
                    <div style={{ width: "36px", height: "36px", background: C.greenBg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FaUsers style={{ color: C.green, fontSize: ".9rem" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: ".7rem", color: C.textLight, fontWeight: "600", textTransform: "uppercase", letterSpacing: ".8px" }}>Contact Person</div>
                      <div style={{ fontSize: ".9rem", fontWeight: "600", color: C.text, marginTop: "2px" }}>{ngo.contactName}</div>
                      {ngo.contactRole && <div style={{ fontSize: ".78rem", color: C.textLight }}>{ngo.contactRole}</div>}
                    </div>
                  </div>
                )}
                {ngo.phone && (
                  <div className="np-info-row">
                    <div style={{ width: "36px", height: "36px", background: C.greenBg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FaPhone style={{ color: C.green, fontSize: ".85rem" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: ".7rem", color: C.textLight, fontWeight: "600", textTransform: "uppercase", letterSpacing: ".8px" }}>Phone</div>
                      <a href={`tel:${ngo.phone}`} style={{ fontSize: ".9rem", fontWeight: "600", color: C.green, textDecoration: "none", marginTop: "2px", display: "block" }}>{ngo.phone}</a>
                    </div>
                  </div>
                )}
                {ngo.email && (
                  <div className="np-info-row">
                    <div style={{ width: "36px", height: "36px", background: C.greenBg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FaEnvelope style={{ color: C.green, fontSize: ".85rem" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: ".7rem", color: C.textLight, fontWeight: "600", textTransform: "uppercase", letterSpacing: ".8px" }}>Email</div>
                      <a href={`mailto:${ngo.email}`} style={{ fontSize: ".88rem", fontWeight: "600", color: C.green, textDecoration: "none", marginTop: "2px", display: "block", wordBreak: "break-all" }}>{ngo.email}</a>
                    </div>
                  </div>
                )}
                {ngo.address && (
                  <div className="np-info-row">
                    <div style={{ width: "36px", height: "36px", background: C.greenBg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FaMapMarkerAlt style={{ color: C.green, fontSize: ".9rem" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: ".7rem", color: C.textLight, fontWeight: "600", textTransform: "uppercase", letterSpacing: ".8px" }}>Address</div>
                      <div style={{ fontSize: ".87rem", color: C.textMid, marginTop: "2px", lineHeight: 1.6 }}>{ngo.address}{ngo.pincode ? ` – ${ngo.pincode}` : ""}</div>
                    </div>
                  </div>
                )}
                {ngo.website && (
                  <div className="np-info-row">
                    <div style={{ width: "36px", height: "36px", background: C.greenBg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FaGlobe style={{ color: C.green, fontSize: ".85rem" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: ".7rem", color: C.textLight, fontWeight: "600", textTransform: "uppercase", letterSpacing: ".8px" }}>Website</div>
                      <a href={ngo.website.startsWith("http") ? ngo.website : `https://${ngo.website}`} target="_blank" rel="noreferrer" style={{ fontSize: ".88rem", fontWeight: "600", color: C.green, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        Visit Site <FaExternalLinkAlt style={{ fontSize: ".65rem" }} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {/* Social links */}
              {(ngo.socialMedia?.facebook || ngo.socialMedia?.instagram || ngo.socialMedia?.twitter || ngo.socialMedia?.youtube) && (
                <div style={{ display: "flex", gap: "10px", marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
                  {ngo.socialMedia.facebook && (
                    <a href={ngo.socialMedia.facebook} target="_blank" rel="noreferrer" style={{ width: "36px", height: "36px", background: "#e8f0fe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#1877f2", textDecoration: "none" }} title="Facebook">
                      <FaFacebook style={{ fontSize: "1rem" }} />
                    </a>
                  )}
                  {ngo.socialMedia.instagram && (
                    <a href={ngo.socialMedia.instagram} target="_blank" rel="noreferrer" style={{ width: "36px", height: "36px", background: "#fce4ec", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#e1306c", textDecoration: "none" }} title="Instagram">
                      <FaInstagram style={{ fontSize: "1rem" }} />
                    </a>
                  )}
                  {ngo.socialMedia.twitter && (
                    <a href={ngo.socialMedia.twitter} target="_blank" rel="noreferrer" style={{ width: "36px", height: "36px", background: "#e7f0f8", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", textDecoration: "none" }} title="X (Twitter)">
                      <FaTwitter style={{ fontSize: "1rem" }} />
                    </a>
                  )}
                  {ngo.socialMedia.youtube && (
                    <a href={ngo.socialMedia.youtube} target="_blank" rel="noreferrer" style={{ width: "36px", height: "36px", background: "#fde8e8", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff0000", textDecoration: "none" }} title="YouTube">
                      <FaYoutube style={{ fontSize: "1rem" }} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Registration Details */}
            <div className="np-card">
              <h3 style={{ fontSize: ".9rem", fontWeight: "700", color: C.text, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "1px" }}>Registration</h3>
              {[
                { label: "Reg. Number", val: ngo.regNumber,  Icon: FaIdCard    },
                { label: "Reg. Type",   val: ngo.regType,    Icon: FaBuilding  },
                { label: "Est. Year",   val: ngo.estYear,    Icon: FaCalendarAlt },
                { label: "Darpan ID",   val: ngo.darpanId || null, Icon: FaIdCard },
                { label: "PAN",         val: ngo.panNumber || null, Icon: FaIdCard },
              ].filter(r => r.val).map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: ".78rem", color: C.textLight, fontWeight: "600" }}>{r.label}</span>
                  <span style={{ fontSize: ".85rem", fontWeight: "700", color: C.text }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Donate CTA */}
            <div style={{ background: `linear-gradient(135deg, ${C.greenDark}, ${C.green})`, borderRadius: "12px", padding: "28px 24px", textAlign: "center" }}>
              <FaHeart style={{ color: "rgba(255,255,255,.7)", fontSize: "1.8rem", marginBottom: "12px" }} />
              <h4 style={{ color: "#fff", fontSize: "1.05rem", fontWeight: "700", margin: "0 0 8px" }}>Support This NGO</h4>
              <p style={{ color: "rgba(255,255,255,.75)", fontSize: ".83rem", margin: "0 0 18px", lineHeight: 1.7 }}>100% of your donation reaches the cause. Secure & 80G tax-deductible.</p>
              <Link to={`/donate?ngoId=${ngo._id}&ngoName=${encodeURIComponent(ngo.ngoName)}`} style={{ display: "block", background: C.orange, color: "#fff", padding: "12px", borderRadius: "7px", fontWeight: "700", fontSize: ".92rem", textDecoration: "none", textAlign: "center", transition: "background .2s" }}>
                Donate Now
              </Link>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* About */}
            {ngo.description && (
              <div className="np-card">
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: C.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "4px", height: "20px", background: C.orange, borderRadius: "2px", display: "inline-block" }} />
                  About {ngo.ngoName}
                </h2>
                <p style={{ color: C.textMid, lineHeight: "1.9", fontSize: ".95rem", margin: 0, whiteSpace: "pre-wrap" }}>{ngo.description}</p>
              </div>
            )}

            {/* Focus Areas */}
            {ngo.services?.length > 0 && (
              <div className="np-card">
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: C.text, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "4px", height: "20px", background: C.green, borderRadius: "2px", display: "inline-block" }} />
                  Focus Areas
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {ngo.services.map(s => (
                    <span key={s} className="np-tag" style={{ background: `${tagColor(s)}18`, color: tagColor(s), border: `1px solid ${tagColor(s)}40` }}>
                      <FaTag style={{ fontSize: ".6rem" }} /> {s}
                    </span>
                  ))}
                  {ngo.otherService && (
                    <span className="np-tag" style={{ background: "#f0f0f0", color: C.textMid, border: "1px solid #ddd" }}>
                      <FaTag style={{ fontSize: ".6rem" }} /> {ngo.otherService}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Gallery */}
            <div className="np-card" style={{ padding: "28px" }}>
              <div className="gal-header-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: C.text, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "4px", height: "20px", background: C.orange, borderRadius: "2px", display: "inline-block" }} />
                  Gallery
                  {gallery.length > 0 && <span style={{ fontSize: ".75rem", color: C.textLight, fontWeight: "600", marginLeft: "6px" }}>({gallery.length})</span>}
                </h2>
                {gallery.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["all", "image", "video"].map(f => (
                      <button key={f} className={`fil-btn${galFilter === f ? " active" : ""}`} onClick={() => setGalFilter(f)}>
                        {f === "all" ? "All" : f === "image" ? "Photos" : "Videos"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px" }}>
                  <FaImages style={{ fontSize: "2.5rem", color: C.border, marginBottom: "12px" }} />
                  <p style={{ color: C.textLight, margin: 0 }}>No gallery photos uploaded yet.</p>
                </div>
              ) : (
                <div className="gal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                  {filtered.map((item) => (
                    <div key={item._id} className="gal-cell" onClick={() => setLightbox({ url: getGalleryUrl(item.url), title: item.title, type: item.type })}>
                      {item.type === "image" ? (
                        <>
                          <img src={getGalleryUrl(item.url)} alt={item.title} className="gal-img" loading="lazy" />
                          <div className="gal-cell-over">
                            <FaImages style={{ color: "#fff", fontSize: "1.4rem" }} />
                          </div>
                        </>
                      ) : (
                        <>
                          <img src={getGalleryUrl(item.thumbnail) || `https://img.youtube.com/vi/${item.url.split("v=")[1]?.split("&")[0]}/hqdefault.jpg`} alt={item.title} className="gal-img" loading="lazy" />
                          <div className="gal-cell-over">
                            <div style={{ width: "48px", height: "48px", background: "rgba(255,0,0,.85)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderLeft: "16px solid #fff", marginLeft: "3px" }} />
                            </div>
                          </div>
                        </>
                      )}
                      {item.category && (
                        <span style={{ position: "absolute", bottom: "8px", left: "8px", background: "rgba(0,0,0,.6)", color: "#fff", fontSize: ".65rem", fontWeight: "600", padding: "3px 8px", borderRadius: "4px", backdropFilter: "blur(4px)" }}>
                          {item.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </main>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: "900px", width: "100%", textAlign: "center" }}>
            {lightbox.type === "image" ? (
              <img src={lightbox.url} alt={lightbox.title} style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "10px", objectFit: "contain" }} />
            ) : (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "10px", overflow: "hidden" }}>
                <iframe
                  src={lightbox.url.replace("watch?v=", "embed/")}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allowFullScreen
                  title={lightbox.title}
                />
              </div>
            )}
            {lightbox.title && (
              <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".88rem", marginTop: "12px" }}>{lightbox.title}</p>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM CTA ── */}
      <div style={{ background: C.greenDark, padding: "60px 36px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <FaHandHoldingHeart style={{ color: "rgba(255,255,255,.5)", fontSize: "2.5rem", marginBottom: "14px" }} />
          <h2 style={{ color: "#fff", fontSize: "clamp(1.4rem,2.5vw,2rem)", fontWeight: "800", margin: "0 0 10px" }}>
            Make a Difference Today
          </h2>
          <p style={{ color: "rgba(255,255,255,.7)", margin: "0 0 28px", lineHeight: 1.8, fontSize: ".95rem" }}>
            Your contribution to <strong style={{ color: "#fff" }}>{ngo.ngoName}</strong> is 100% transparent, 80G tax-deductible, and reaches those who need it most.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to={`/donate?ngoId=${ngo._id}&ngoName=${encodeURIComponent(ngo.ngoName)}`} className="np-btn-gr" style={{ fontSize: "1rem", padding: "14px 34px" }}>
              <FaHeart /> Donate Now
            </Link>
            <Link to="/find-ngos" className="np-btn-out" style={{ borderColor: "rgba(255,255,255,.35)", color: "#fff", background: "rgba(255,255,255,.08)" }}>
              Explore Other NGOs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
