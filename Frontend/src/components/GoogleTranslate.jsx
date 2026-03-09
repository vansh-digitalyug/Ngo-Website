import { useEffect, useState } from "react";
import "./GoogleTranslate.css";

function GoogleTranslate() {
  useEffect(() => {
    // ── 1. Inject kill-banner CSS into <head> ─────────────────────────
    if (!document.getElementById("gt-kill-banner-style")) {
      const style = document.createElement("style");
      style.id = "gt-kill-banner-style";
      style.textContent = `
        /* Hide all Google Translate banner/overlay iframes */
        .goog-te-banner-frame,
        iframe.goog-te-banner-frame,
        .goog-te-balloon-frame,
        #goog-gt-tt,
        #goog-gt-vt,
        iframe[src*="translate.google"],
        iframe[src*="translate_a/element"] {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          max-height: 0 !important;
          max-width: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
          opacity: 0 !important;
          overflow: hidden !important;
          border: 0 !important;
        }

        /* Hide the .skiptranslate wrapper Google injects */
        body > .skiptranslate {
          display: none !important;
          height: 0 !important;
          opacity: 0 !important;
          visibility: hidden !important;
          overflow: hidden !important;
        }

        /* Prevent body shift */
        body {
          top: 0px !important;
          margin-top: 0px !important;
          position: static !important;
        }
      `;
      document.head.appendChild(style);
    }

    // ── 2. Watch body AND html style attributes → reset top/position when Google changes them
    const resetStyles = (el) => {
      if (el.style.top && el.style.top !== "0px") {
        el.style.top = "0px";
      }
      if (el.style.position === "relative") {
        el.style.position = "";
      }
    };

    const bodyStyleObserver = new MutationObserver(() => resetStyles(document.body));
    bodyStyleObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    const htmlStyleObserver = new MutationObserver(() => resetStyles(document.documentElement));
    htmlStyleObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Helper: hide a single node aggressively
    const hideNode = (node) => {
      node.style.setProperty("display", "none", "important");
      node.style.setProperty("visibility", "hidden", "important");
      node.style.setProperty("height", "0", "important");
      node.style.setProperty("width", "0", "important");
      node.style.setProperty("position", "absolute", "important");
      node.style.setProperty("top", "-9999px", "important");
      node.style.setProperty("left", "-9999px", "important");
      node.style.setProperty("opacity", "0", "important");
      node.style.setProperty("pointer-events", "none", "important");
      node.style.setProperty("overflow", "hidden", "important");
    };

    // Check if a node is a Google Translate banner/iframe
    const isGTBanner = (node) => {
      if (node.nodeType !== 1) return false;
      // .skiptranslate wrapper
      if (node.classList?.contains("skiptranslate") && node.parentNode === document.body) {
        return true;
      }
      // Known GT iframe classes
      if (
        node.classList?.contains("goog-te-banner-frame") ||
        node.classList?.contains("goog-te-balloon-frame")
      ) {
        return true;
      }
      // iframe with GT-related src
      if (node.tagName === "IFRAME") {
        const src = node.src || "";
        if (
          src.includes("translate.google") ||
          src.includes("translate_a/element")
        ) {
          return true;
        }
        // Fixed-position iframe injected directly into body (banner)
        const style = node.getAttribute("style") || "";
        if (
          node.parentNode === document.body &&
          (style.includes("position: fixed") || style.includes("position:fixed"))
        ) {
          return true;
        }
      }
      return false;
    };

    // ── 3. Watch DOM for all Google Translate elements → hide immediately
    const domObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (isGTBanner(node)) {
            hideNode(node);
          }
        });
      }
    });

    domObserver.observe(document.body, { childList: true, subtree: true });

    // ── 3b. Periodically scan & hide any GT banners that slipped through
    const hideExisting = () => {
      // Hide .skiptranslate wrappers
      document.querySelectorAll("body > .skiptranslate").forEach(hideNode);

      // Hide banner iframes
      document.querySelectorAll(
        ".goog-te-banner-frame, .goog-te-balloon-frame, iframe[src*='translate.google'], iframe[src*='translate_a/element']"
      ).forEach(hideNode);

      // Hide any fixed-position iframes directly under body (Google banner)
      document.querySelectorAll("body > iframe").forEach((iframe) => {
        const style = iframe.getAttribute("style") || "";
        if (style.includes("position: fixed") || style.includes("position:fixed")) {
          hideNode(iframe);
        }
      });

      // Re-lock body top
      if (document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.top = "0px";
      }
    };

    hideExisting();
    const iframeCheckInterval = setInterval(hideExisting, 500);

    // ── 4. Inject Google Translate script once ───────────────────────
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,pa,ta,te,bn,gu,mr,ml,kn",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        } catch (error) {
          console.error("Google Translate initialization failed:", error);
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      bodyStyleObserver.disconnect();
      htmlStyleObserver.disconnect();
      domObserver.disconnect();
      clearInterval(iframeCheckInterval);
    };
  }, []);

  // Track the displayed language name
  const [langLabel, setLangLabel] = useState("Select Language");

  // Listen for changes on the Google Translate <select>
  useEffect(() => {
    const interval = setInterval(() => {
      const select = document.querySelector("#google_translate_element .goog-te-combo");
      if (select && !select.dataset.listening) {
        select.dataset.listening = "true";
        // Set initial label from current value
        const opt = select.options[select.selectedIndex];
        if (opt && opt.text) setLangLabel(opt.text);

        select.addEventListener("change", () => {
          const selected = select.options[select.selectedIndex];
          if (selected && selected.text) setLangLabel(selected.text);
        });
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gt-wrapper" title="Change Language">
      <svg
        className="gt-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span className="gt-label">{langLabel}</span>
      <svg
        className="gt-chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      {/* The invisible <select> stretches over the entire pill via CSS */}
      <div id="google_translate_element" />
    </div>
  );
}

export default GoogleTranslate;
