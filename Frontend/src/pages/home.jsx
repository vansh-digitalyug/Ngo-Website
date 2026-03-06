import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// IMPORT YOUR LOCAL IMAGE HERE
import elderImage from "../assets/images/elderly/elder.png";


function Home() {
  // 1. STATE FOR CAROUSEL
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  // 2. IMAGE ARRAY
  const heroImages = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600&auto=format&fit=crop", // Orphanage
    elderImage, // Your Local Elder Image
    "https://images.pexels.com/photos/1181216/pexels-photo-1181216.jpeg?auto=compress&cs=tinysrgb&w=1600"
  ];

  // 3. AUTO-CHANGE LOGIC
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  // 4. SCROLL ANIMATION OBSERVER
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const hiddenElements = document.querySelectorAll(".animate-on-scroll");
    hiddenElements.forEach((el) => observer.observe(el));

    return () => hiddenElements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="home-container" style={styles.container}>
      {/* CSS STYLES FOR ANIMATIONS */}
      <style>
        {`
          /* Smooth Hero Background Transition */
          .hero-section {
            transition: background-image 1.5s ease-in-out;
          }

          /* Keyframes */
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7); }
            70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(255, 152, 0, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
          }

          /* Scroll Animation Classes */
          .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
          }
          .animate-on-scroll.is-visible {
            opacity: 1;
            transform: translateY(0);
          }

          /* Staggered Delays */
          .delay-100 { transition-delay: 0.1s; }
          .delay-200 { transition-delay: 0.2s; }
          .delay-300 { transition-delay: 0.3s; }

          /* Interactive Hovers */
          .service-card {
            transition: transform 0.4s ease, box-shadow 0.4s ease;
          }
          .service-card:hover { 
            transform: translateY(-10px); 
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important; 
          }
          /* Link hover effect inside card */
          .service-card:hover .card-link {
            padding-left: 10px;
            color: #ff9800 !important; /* Changes link color on hover */
          }
          /* Icon hover effect */
          .service-card:hover svg {
            color: #ff9800 !important;
            transform: scale(1.1);
          }

          .primary-btn:hover { 
            background-color: #f57c00 !important;
            transform: translateY(-2px);
          }
          
          .secondary-btn:hover { 
            background-color: rgba(255,255,255,0.1) !important;
            transform: translateY(-2px);
          }

          .pulse-btn {
            animation: pulse 2s infinite;
          }

          @media (max-width: 768px) {
            .hero-title { font-size: 36px !important; }
            .impact-grid { flex-direction: column; gap: 30px; }
          }
        `}
      </style>

      {/* HERO SECTION */}
      <section
        className="hero-section"
        style={{
          ...styles.hero,
          backgroundImage: `url('${heroImages[currentImageIndex]}')`
        }}
      >
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div className="animate-hero-text" style={{ animation: 'fadeInUp 1s ease-out forwards' }}>
            <h1 className="hero-title" style={styles.heroTitle}>
              Empowering Lives Across India
            </h1>
            <p style={styles.heroSubtitle}>
              SevaIndia connects donors and volunteers with trusted NGOs to uplift children, support senior citizens, and bridge the digital divide.
            </p>
            <div style={styles.heroButtons}>
              <Link to="/donate" className="primary-btn pulse-btn" style={styles.primaryBtn}>
                Donate Now
              </Link>
              <Link to="/find-ngos" className="secondary-btn" style={styles.secondaryBtn}>
                Locate NGOs
              </Link>
            </div>
          </div>

          {/* DOT INDICATORS */}
          <div style={styles.dotsContainer}>
            {heroImages.map((_, index) => (
              <div
                key={index}
                style={{
                  ...styles.dot,
                  backgroundColor: currentImageIndex === index ? "#ff9800" : "rgba(255,255,255,0.4)",
                  transform: currentImageIndex === index ? "scale(1.3)" : "scale(1)"
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section style={styles.section}>
        <div className="animate-on-scroll" style={styles.missionBox}>
          <h2 style={styles.sectionTitle}>Our Mission</h2>
          <div style={styles.underline}></div>
          <p style={styles.sectionText}>
            We envision an India where no child sleeps hungry, no elder feels forgotten,
            and no student is left behind due to the digital divide. We are building an
            ecosystem of <strong>dignity, care, and transparency</strong> to turn your good intentions into measurable impact.
          </p>
        

        </div>
      </section>

      {/* SERVICES SECTION */}
      <section style={styles.sectionAlt}>
        <div style={styles.maxWidthWrapper}>
          <div className="animate-on-scroll">
            <h2 style={styles.sectionTitle}>Holistic Services</h2>
            <p style={styles.sectionSubtitle}>
              Targeted initiatives designed to solve real-world problems.
            </p>
          </div>

          <div style={styles.servicesGrid}>
            {/* Card 1: Orphanage */}
            <div className="service-card animate-on-scroll delay-100" style={styles.serviceCard}>
              <div style={{ overflow: 'hidden', height: '220px' }}>
                <img src={heroImages[0]} alt="Orphanage Support" style={styles.cardImage} />
              </div>
              <div style={styles.cardContent}>
                {/* SVG INLINE WITH HEADING */}
                <h3 style={styles.cardTitle}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.3s' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M8 11h8"></path>
                    <path d="M12 7v8"></path>
                  </svg>
                  Child Welfare
                </h3>
                <p style={styles.cardText}>Providing shelter, nutrition, and holistic education to orphaned children.</p>
                <Link to="/services/orphanage" className="card-link" style={styles.cardLink}>Support a Child →</Link>
              </div>
            </div>

            {/* Card 2: Elderly */}
            <div className="service-card animate-on-scroll delay-200" style={styles.serviceCard}>
              <div style={{ overflow: 'hidden', height: '220px' }}>
                <img src={heroImages[1]} alt="Elderly Care" style={styles.cardImage} />
              </div>
              <div style={styles.cardContent}>
                {/* SVG INLINE WITH HEADING */}
                <h3 style={styles.cardTitle}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.3s' }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  Honoring Seniors
                </h3>
                <p style={styles.cardText}>Ensuring healthcare, companionship, and dignity for our elderly citizens.</p>
                <Link to="/services/elderly" className="card-link" style={styles.cardLink}>Adopt a Grandparent →</Link>
              </div>
            </div>

            {/* Card 3: Digital */}
            <div className="service-card animate-on-scroll delay-300" style={styles.serviceCard}>
              <div style={{ overflow: 'hidden', height: '220px' }}>
                <img src={heroImages[2]} alt="Digital Empowerment" style={styles.cardImage} />
              </div>
              <div style={styles.cardContent}>
                {/* SVG INLINE WITH HEADING */}
                <h3 style={styles.cardTitle}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.3s' }}>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="2" y1="20" x2="22" y2="20"></line>
                  </svg>
                  Digital Bridge
                </h3>
                <p style={styles.cardText}>Empowering rural communities through digital skills.</p>
                <Link to="/services" className="card-link" style={styles.cardLink}>Enable Education →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION - Green & Orange + Cubes */}
      <section style={styles.impactSection}>
        <div style={styles.maxWidthWrapper}>
          <h2 className="animate-on-scroll" style={{ ...styles.sectionTitle, color: "white" }}>Creating Real Impact</h2>
          <div className="impact-grid" style={styles.impactGrid}>
            <div className="animate-on-scroll delay-100" style={styles.impactItem}>
              <h3 style={styles.impactNumber}>500+</h3>
              <p style={styles.impactLabel}>Trusted NGOs Verified</p>
            </div>
            <div className="animate-on-scroll delay-200" style={styles.impactItem}>
              <h3 style={styles.impactNumber}>10k+</h3>
              <p style={styles.impactLabel}>Lives Transformed</p>
            </div>
            <div className="animate-on-scroll delay-300" style={styles.impactItem}>
              <h3 style={styles.impactNumber}>25+</h3>
              <p style={styles.impactLabel}>States Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={styles.cta}>
        <div className="animate-on-scroll" style={styles.maxWidthWrapper}>
          <h2 style={styles.ctaTitle}>Ready to Be the Change?</h2>
          <p style={styles.ctaText}>Every small act of kindness creates a ripple of hope.</p>
          <div style={styles.heroButtons}>
            <Link to="/volunteer" className="primary-btn" style={styles.ctaBtnPrimary}>Become a Volunteer</Link>
            <Link to="/add-ngo" className="secondary-btn" style={styles.ctaBtnSecondary}>Register an NGO</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- UPDATED STYLES OBJECT ---
const styles = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
    color: "#333",
    lineHeight: "1.6",
    overflowX: "hidden"
  },
  maxWidthWrapper: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },

  // HERO STYLES
  hero: {
    position: "relative",
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "90vh",
    minHeight: "600px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "white",
  },
  heroOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "850px",
    padding: "20px"
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: "800",
    marginBottom: "20px",
    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
    lineHeight: "1.1"
  },
  heroSubtitle: {
    fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
    marginBottom: "40px",
    opacity: "0.95",
    fontWeight: "400",
    maxWidth: "700px",
    margin: "0 auto 40px auto"
  },
  heroButtons: { display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" },
  primaryBtn: {
    backgroundColor: "#ff9800",
    color: "white",
    padding: "16px 36px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "1.1rem",
    boxShadow: "0 5px 15px rgba(255, 152, 0, 0.4)",
    transition: "all 0.3s ease"
  },
  secondaryBtn: {
    border: "2px solid white",
    backgroundColor: "transparent",
    color: "white",
    padding: "16px 36px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "1.1rem",
    transition: "all 0.3s ease"
  },
  dotsContainer: { display: "flex", justifyContent: "center", gap: "12px", marginTop: "40px" },
  dot: { width: "12px", height: "12px", borderRadius: "50%", transition: "all 0.3s ease", border: "1px solid rgba(255,255,255,0.5)" },

  // SECTIONS
  section: { padding: "100px 20px", textAlign: "center", backgroundColor: "#fff" },
  sectionAlt: { padding: "100px 0", backgroundColor: "#f4f9f4", textAlign: "center" },
  sectionTitle: { fontSize: "2.5rem", marginBottom: "15px", color: "#2e7d32", fontWeight: "800" },
  sectionSubtitle: { fontSize: "1.2rem", color: "#666", marginBottom: "50px", maxWidth: "600px", margin: "0 auto 50px" },
  sectionText: { fontSize: "1.3rem", maxWidth: "800px", margin: "20px auto 0", color: "#444", lineHeight: "1.8" },
  underline: { width: "80px", height: "4px", backgroundColor: "#ff9800", margin: "0 auto 20px" },

  missionBox: {
    borderLeft: "5px solid #ff9800",
    paddingLeft: "30px",
    display: "inline-block",
    textAlign: "left",
    maxWidth: "900px"
  },

  // CARDS
  servicesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px", padding: "10px" },
  serviceCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    textAlign: "left",
    border: "1px solid #eee",
    display: "flex",
    flexDirection: "column"
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease"
  },
  cardContent: { padding: "30px" },

  // UPDATED CARD TITLE: Flexbox to keep icon and text in same line
  cardTitle: {
    fontSize: "1.4rem",
    marginBottom: "10px",
    fontWeight: "700",
    color: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  cardText: { fontSize: "1rem", color: "#666", marginBottom: "20px", lineHeight: "1.6" },
  cardLink: {
    color: "#2e7d32",
    fontWeight: "700",
    textDecoration: "none",
    display: "inline-block",
    transition: "all 0.2s"
  },

  // IMPACT - UPDATED WITH GREEN+ORANGE GRADIENT AND CUBES PATTERN
  impactSection: {
    position: "relative",
    padding: "100px 0",
    color: "white",
    textAlign: "center",
    // Linear Gradient (Green to Orange) + Cubes Pattern Overlay
    backgroundImage: "linear-gradient(135deg, rgba(46, 125, 50, 0.95), rgba(255, 152, 0, 0.9)), url('https://www.transparenttextures.com/patterns/cubes.png')",
    backgroundSize: "auto, auto", // Gradient covers, cubes repeat
    backgroundAttachment: "fixed" // Parallax effect
  },
  impactGrid: { display: "flex", justifyContent: "space-around", marginTop: "50px", flexWrap: "wrap", gap: "30px" },
  impactItem: { padding: "20px" },
  impactNumber: { fontSize: "3.5rem", fontWeight: "800", marginBottom: "5px", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.2)" },
  impactLabel: { fontSize: "1.2rem", opacity: 0.95, fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" },

  // CTA
  cta: { padding: "100px 20px", textAlign: "center", backgroundColor: "#fff" },
  ctaTitle: { fontSize: "2.8rem", marginBottom: "15px", fontWeight: "800", color: "#333" },
  ctaText: { fontSize: "1.3rem", marginBottom: "40px", color: "#555" },
  ctaBtnPrimary: {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "16px 36px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "1.1rem",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
    transition: "all 0.3s"
  },
  ctaBtnSecondary: {
    border: "2px solid #2e7d32",
    color: "#2e7d32",
    backgroundColor: "white",
    padding: "16px 36px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "1.1rem",
    transition: "all 0.3s"
  }
};

export default Home;