import { useState, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, IndianRupee, Plus, Edit2, Trash2, 
  Loader2, X, ChevronDown, Eye, EyeOff, Wallet 
} from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const fmtINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const CATEGORIES = ["donation","govt_grant","salary","materials","event","operations","village_work","medical","education","other"];

const CAT_LABELS = {
  donation: "Donations", govt_grant: "Govt Grants", salary: "Salaries",
  materials: "Materials", event: "Events", operations: "Operations",
  village_work: "Village Work", medical: "Medical", education: "Education", other: "Other",
};

const CAT_THEMES = {
  donation:     "bg-[#f0f4ea] text-[#5a6b46] border-[#d6e3c9]",
  govt_grant:   "bg-blue-50 text-blue-700 border-blue-200",
  salary:       "bg-purple-50 text-purple-700 border-purple-200",
  materials:    "bg-orange-50 text-orange-700 border-orange-200",
  event:        "bg-cyan-50 text-cyan-700 border-cyan-200",
  operations:   "bg-slate-50 text-slate-700 border-slate-200",
  village_work: "bg-amber-50 text-amber-700 border-amber-200",
  medical:      "bg-red-50 text-red-700 border-red-200",
  education:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  other:        "bg-gray-50 text-gray-700 border-gray-200",
};

const emptyEntry = {
  type: "credit", category: "donation", amount: "", description: "", date: new Date().toISOString().slice(0,10), isPublic: true,
};

const inputCls = "w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all text-[#222222]";
const labelCls = "block text-sm font-bold text-[#222222] mb-1.5";

function EntryModal({ entry, onClose, onSaved }) {
  const [form, setForm] = useState(entry ? {
    type: entry.type,
    category: entry.category,
    amount: entry.amount,
    description: entry.description || "",
    date: entry.date ? new Date(entry.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    isPublic: entry.isPublic ?? true,
  } : { ...emptyEntry });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.amount || Number(form.amount) <= 0) { setError("Enter a valid amount"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    setSaving(true); setError("");
    const url = entry ? `${API_BASE_URL}/api/fund-ledger/${entry._id}` : `${API_BASE_URL}/api/fund-ledger`;
    fetch(url, {
      method: entry ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) { onSaved(d.data.entry); onClose(); }
        else setError(d.message || "Failed to save");
      })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  // close on backdrop click
  const onBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div onClick={onBackdrop} className="fixed inset-0 z-[1000] bg-[#222222]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-100 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden p-6 sm:p-8">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-[#222222]">{entry ? "Edit Entry" : "Add Fund Entry"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm font-bold flex items-center gap-2">
            {error}
          </div>
        )}

        {/* Type toggle */}
        <div className="flex gap-3 mb-6">
          {["credit","debit"].map(t => (
            <button key={t} onClick={() => set("type", t)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-extrabold transition-all ${
                form.type === t 
                  ? t === "credit" 
                    ? "bg-[#f0f4ea] text-[#5a6b46] border-[#d6e3c9] ring-2 ring-offset-1 ring-[#d6e3c9]" 
                    : "bg-red-50 text-red-700 border-red-200 ring-2 ring-offset-1 ring-red-200"
                  : "bg-white text-[#6c6c6c] border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t === "credit" ? "↑ Income" : "↓ Expense"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Amount (₹) *</label>
            <input type="number" className={inputCls} value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className={labelCls}>Category *</label>
            <div className="relative">
              <select value={form.category} onChange={e => set("category", e.target.value)} className={`${inputCls} appearance-none pr-10 cursor-pointer`}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description *</label>
            <textarea rows={2} className={`${inputCls} resize-y min-h-[80px]`} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Briefly describe this transaction…" />
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" className={inputCls} value={form.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div className="mt-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" checked={form.isPublic} onChange={e => set("isPublic", e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-[#e5e5e5] rounded-md bg-[#f8f7f5] checked:bg-[#6c5d46] checked:border-[#6c5d46] transition-colors cursor-pointer" />
                <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <span className="text-sm font-bold text-[#222222] group-hover:text-[#6c5d46] transition-colors">Show on public transparency dashboard</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : entry ? "Save Changes" : "Add Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NgoFundLedger() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ totals: { credit: 0, debit: 0 }, byCategory: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [typeFilter, setTypeFilter] = useState("all");
  const [modal, setModal] = useState(null); // null | "create" | entry
  const token = localStorage.getItem("token");

  const loadSummary = () => {
    fetch(`${API_BASE_URL}/api/fund-ledger/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setSummary(d.data); })
      .catch(() => {});
  };

  const loadEntries = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 20 });
    if (typeFilter !== "all") params.set("type", typeFilter);
    fetch(`${API_BASE_URL}/api/fund-ledger?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setEntries(d.data.entries);
          setPagination(d.data.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSummary(); }, []);
  useEffect(() => { setPage(1); loadEntries(1); }, [typeFilter]);
  useEffect(() => { loadEntries(page); }, [page]);

  const onSaved = (entry) => {
    setEntries(es => {
      const idx = es.findIndex(e => e._id === entry._id);
      if (idx >= 0) { const n = [...es]; n[idx] = entry; return n; }
      return [entry, ...es];
    });
    loadSummary();
  };

  const deleteEntry = (id) => {
    if (!confirm("Delete this fund entry?")) return;
    fetch(`${API_BASE_URL}/api/fund-ledger/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setEntries(es => es.filter(e => e._id !== id));
          loadSummary();
        }
      })
      .catch(() => {});
  };

  const balance = summary.totals.credit - summary.totals.debit;

  return (
    <div className="min-h-screen bg-[#f8f7f5] p-4 sm:p-6 lg:p-8 font-sans text-[#2c2c2c] selection:bg-[#eaddc8] selection:text-[#2c2c2c] flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222222] flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[#6c5d46]">
              <Wallet size={24} />
            </div>
            Fund Ledger
          </h1>
          <p className="text-[#6c6c6c] text-sm sm:text-base font-medium">
            Track income and expenses for your NGO securely
          </p>
        </div>
        <button onClick={() => setModal("create")} className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-xl text-sm font-bold hover:bg-[#584a36] transition-all shadow-sm flex items-center gap-2">
          <Plus size={18} /> Add Entry
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Income", value: fmtINR(summary.totals.credit), icon: TrendingUp, wrapperClass: "bg-[#f0f4ea] border-[#d6e3c9] text-[#5a6b46]" },
          { label: "Total Expense", value: fmtINR(summary.totals.debit), icon: TrendingDown, wrapperClass: "bg-red-50 border-red-200 text-red-700" },
          { label: "Net Balance", value: fmtINR(Math.abs(balance)), icon: IndianRupee, wrapperClass: balance >= 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-red-50 border-red-200 text-red-700" },
        ].map(({ label, value, icon: Icon, wrapperClass }) => (
          <div key={label} className={`p-6 rounded-2xl border ${wrapperClass} shadow-sm relative overflow-hidden`}>
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/80 shadow-sm flex items-center justify-center backdrop-blur-sm">
                <Icon size={20} />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider opacity-90">{label}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold relative z-10 tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {["all","credit","debit"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border
              ${typeFilter === t 
                ? "bg-[#6c5d46] text-white border-[#6c5d46] shadow-sm" 
                : "bg-white text-[#6c6c6c] border-gray-200 hover:bg-[#f8f7f5]"}`}
          >
            {t === "all" ? "All Entries" : t === "credit" ? "↑ Income" : "↓ Expenses"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-4 border-[#eaddc8] border-t-[#6c5d46] rounded-full animate-spin"></div>
          <p className="text-[#888888] font-medium">Loading ledger…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-[#f8f7f5] rounded-full flex items-center justify-center text-[#d5cfc4] mb-4">
            <IndianRupee size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-[#222222] mb-2">No entries yet</h3>
          <p className="text-sm font-medium text-[#888888] mb-6">Start tracking your funds by adding your first transaction.</p>
          <button onClick={() => setModal("create")} className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-xl text-sm font-bold hover:bg-[#584a36] transition-all shadow-sm">
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-[#f8f7f5] border-b border-gray-100">
                  {["Date", "Type", "Category", "Description", "Amount", "Public", "Actions"].map(h => (
                    <th key={h} className={`py-3 px-4 text-[11px] font-extrabold text-[#888888] uppercase tracking-wider whitespace-nowrap ${h === "Amount" ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => {
                  const themeCls = CAT_THEMES[e.category] || "bg-gray-50 text-gray-700 border-gray-200";
                  return (
                    <tr key={e._id} className="border-b border-gray-50 hover:bg-[#f8f7f5] transition-colors group">
                      <td className="py-4 px-4 text-xs font-bold text-[#6c6c6c] whitespace-nowrap">{fmtDate(e.date)}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                          e.type === "credit" ? "bg-[#f0f4ea] text-[#5a6b46] border-[#d6e3c9]" : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {e.type === "credit" ? "↑ Income" : "↓ Expense"}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${themeCls}`}>
                          {CAT_LABELS[e.category] || e.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-[#222222] max-w-[200px] truncate group-hover:text-[#6c5d46] transition-colors">
                        {e.description}
                      </td>
                      <td className={`py-4 px-4 text-right font-extrabold text-sm whitespace-nowrap ${e.type === "credit" ? "text-[#5a6b46]" : "text-red-600"}`}>
                        {e.type === "credit" ? "+" : "-"}{fmtINR(e.amount)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        {e.isPublic ? (
                          <div className="flex items-center justify-center bg-green-50 text-green-600 w-8 h-8 rounded-lg mx-auto">
                            <Eye size={16} />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center bg-gray-50 text-gray-400 w-8 h-8 rounded-lg mx-auto">
                            <EyeOff size={16} />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModal(e)} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteEntry(e._id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[#222222]">
            &larr; Prev
          </button>
          <span className="text-sm font-bold text-[#888888]">
            Page {page} of {pagination.pages}
          </span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[#222222]">
            Next &rarr;
          </button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <EntryModal
          entry={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}