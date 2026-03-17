import { useEffect, useState, startTransition } from "react";
import { useLocation } from "react-router-dom";
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
      <main>
        <AppRoutes />
       

      </main>
      {!hideNavFooter && <Footer />}
    </FlashProvider>
  );
}

export default App;
