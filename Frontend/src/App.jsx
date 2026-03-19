import { useEffect, useState, startTransition } from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "./components/common/navbar.jsx";
import Footer from "./components/common/footer.jsx";
import AppRoutes from "./routes/AppRoute.jsx";
import { FlashProvider } from "./components/common/FlashMessage.jsx";
function App() {
  const location = useLocation();
  const [flash, setFlash] = useState(null);

  // Hide navbar/footer for admin and NGO dashboards
  const hideNavFooter = (
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/ngo") ||
    location.pathname === "/login/admin" ||
    location.pathname === "/login/ngo"
  );

  // Add body padding-top only for non-dashboard pages
  useEffect(() => {
    if (!hideNavFooter) {
      document.body.style.paddingTop = "60px";
    } else {
      document.body.style.paddingTop = "0px";
    }
    return () => {
      document.body.style.paddingTop = "";
    };
  }, [hideNavFooter]);

  const consumeFlashMessage = () => {
    const raw = sessionStorage.getItem("flash_message");
    if (!raw) return;
    try {
      setFlash(JSON.parse(raw));
    } catch {
      setFlash({ type: "info", message: String(raw) });
    }
    sessionStorage.removeItem("flash_message");
  };


  useEffect(() => {
    startTransition(() => {
      consumeFlashMessage();
    });
  }, [location.key]);

  useEffect(() => {
    if (!flash?.message) return;
    const timer = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(timer);
  }, [flash]);

  return (
    <FlashProvider>
      {!hideNavFooter && <Navbar />}
      {flash?.message && (
        <div className={`flash-message ${flash.type || "info"}`}>
          <span>{flash.message}</span>
          <button
            type="button"
            className="flash-close"
            onClick={() => setFlash(null)}
            aria-label="Dismiss message"
          >
            x
          </button>
        </div>
      )}
      <main style={{ minHeight: "70vh" }}>
        <AppRoutes />
      </main>
      {!hideNavFooter && <Footer />}

      {/* ── Floating Feedback Button (visible on all public pages) ── */}
      {!hideNavFooter && (
        <div style={{
          position: "fixed",
          bottom: "28px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "10px",
        }}>
          {/* Report Problem */}
          <Link
            to="/report-problem"
            title="Report a local problem"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#f97316",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "50px",
              fontWeight: "700",
              fontSize: "13px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(249,115,22,0.45)",
              transition: "transform 0.2s, box-shadow 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(249,115,22,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(249,115,22,0.45)"; }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>⚠</span>
            Report Problem
          </Link>

          {/* Feedback */}
          <Link
            to="/feedback"
            title="Give us your feedback"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "50px",
              fontWeight: "700",
              fontSize: "13px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(99,102,241,0.45)",
              transition: "transform 0.2s, box-shadow 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.45)"; }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>💬</span>
            Feedback
          </Link>
        </div>
      )}
    </FlashProvider>
  );
}

export default App;
