import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

/**
 * AIDescribeButton — drop next to any description textarea.
 *
 * Props:
 *   context      — one of: "ngo" | "event" | "service-category" | "service-program"
 *                           | "service-program-full" | "gallery" | "task" | "community"
 *   hint         — optional string: title/name to give the AI context (e.g. event title)
 *   onGenerated  — callback(text: string) called with the generated description
 *   className    — extra classes on the button
 */
export default function AIDescribeButton({ context, hint = "", onGenerated, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/ai/generate-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ context, hint: hint.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Generation failed");
      onGenerated(data.description);
    } catch (err) {
      setError(err.message || "Failed to generate");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        title="Generate description with AI"
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full
          bg-violet-50 border border-violet-200 text-violet-600
          hover:bg-violet-100 hover:border-violet-300 hover:text-violet-700
          disabled:opacity-50 disabled:cursor-not-allowed transition
          ${className}`}
      >
        {loading
          ? <Loader2 size={11} className="animate-spin" />
          : <Sparkles size={11} />}
        {loading ? "Generating…" : "AI Generate"}
      </button>
      {error && (
        <span className="text-[10px] text-red-500 font-medium">{error}</span>
      )}
    </span>
  );
}
