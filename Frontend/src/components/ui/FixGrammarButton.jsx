import { useState } from "react";
import { SpellCheck, Loader2 } from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

/**
 * FixGrammarButton — drop next to any textarea/description field.
 *
 * Props:
 *   text        — current text in the field
 *   onFixed     — callback(fixedText: string) called with corrected text
 *   className   — extra classes on the button
 */
export default function FixGrammarButton({ text = "", onFixed, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleFix = async () => {
    if (!text?.trim()) {
      setError("Enter some text first");
      setTimeout(() => setError(""), 2500);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/fix-grammar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Fix failed");
      onFixed(data.text);
    } catch (e) {
      setError(e.message || "Failed to fix");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleFix}
        disabled={loading}
        title="Fix grammar with AI"
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full
          bg-emerald-50 border border-emerald-200 text-emerald-600
          hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-700
          disabled:opacity-50 disabled:cursor-not-allowed transition
          ${className}`}
      >
        {loading
          ? <Loader2 size={11} className="animate-spin" />
          : <SpellCheck size={11} />}
        {loading ? "Fixing…" : "Fix Grammar"}
      </button>
      {error && (
        <span className="text-[10px] text-red-500 font-medium">{error}</span>
      )}
    </span>
  );
}
