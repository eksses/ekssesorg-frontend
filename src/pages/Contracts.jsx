import { useEffect, useState } from "react";
import { Loader2, FileText, Download, Trash2, X } from "lucide-react";
import axios from "../api/axios";
import { useStore } from "../store/useStore";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const { openModal } = useStore();

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/contracts");
      setContracts(res.data);
    } catch (err) {
      console.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/contracts/${id}`);
      setDeleteConfirm(null);
      fetchContracts();
    } catch (err) {
      setError(err.response?.data?.message || "Deletion failed.");
      setDeleteConfirm(null);
    }
  };

  const handleDownload = async (id, lang) => {
    try {
      const response = await axios.get(`/contracts/${id}/pdf?lang=${lang}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `EKS-CONTRACT-${id}-${lang.toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`/contracts/${id}`, { status: newStatus });
      fetchContracts();
    } catch (err) {
      setError("Failed to update status.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={48} className="animate-spin text-[#EF4444]" />
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Signed": return "text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10";
      case "Sent": return "text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10";
      case "Terminated": return "text-zinc-500 border-zinc-800 bg-zinc-900";
      default: return "text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-[#EF4444]" /> Legal Contracts
          </h2>
          <p className="text-zinc-500 mt-1">Lifecycle management for binding service agreements.</p>
        </div>
        <button 
          onClick={() => openModal("contract")}
          className="flex items-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[#EF4444]/30 active:scale-95 transition-all text-sm"
        >
          <X className="rotate-45" size={18} /> <span className="hidden sm:inline">New Contract</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-[#EF4444] text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      <div className="bg-[#18181B] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* === MOBILE CARD VIEW === */}
        <div className="md:hidden p-4 space-y-4">
          {contracts.length === 0 ? (
            <div className="text-center text-zinc-500 py-10">No contracts drafted yet.</div>
          ) : contracts.map((con) => (
            <div key={con._id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-zinc-200 text-sm">{con.clientId?.name || "No Client"}</p>
                  <p className="text-xs text-[#EF4444] font-medium uppercase tracking-wider">{con.projectId?.title || "Standalone Agreement"}</p>
                </div>
                <select 
                  value={con.status || "Draft"}
                  onChange={(e) => handleStatusUpdate(con._id, e.target.value)}
                  className={`px-2 py-1 rounded-md text-[9px] uppercase font-bold border outline-none ${getStatusColor(con.status)}`}
                >
                  {["Draft", "Sent", "Signed", "Suspended", "Terminated"].map(s => <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>)}
                </select>
              </div>

              <div className="bg-black/40 p-2.5 rounded-lg">
                <p className="text-[11px] text-zinc-500 italic line-clamp-2">
                  "{con.terms || "No conditions defined."}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-zinc-500">
                  {con.effectiveDate ? new Date(con.effectiveDate).toLocaleDateString("en-GB") : "—"} - {con.expirationDate ? new Date(con.expirationDate).toLocaleDateString("en-GB") : "Comp."}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(con._id, "en")} className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400">
                    <Download size={12} /> PDF
                  </button>
                  {deleteConfirm === con._id ? (
                    <button onClick={() => handleDelete(con._id)} className="text-[10px] bg-[#EF4444] text-white px-3 py-1.5 rounded-lg font-bold">DEL</button>
                  ) : (
                    <button onClick={() => setDeleteConfirm(con._id)} className="p-1.5 rounded-lg border border-zinc-800 text-zinc-600">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* === DESKTOP TABLE VIEW === */}
        <div className="hidden md:block overflow-x-auto p-4 md:p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-medium">Client / Project</th>
                <th className="pb-3 font-medium">Agreement Scope</th>
                <th className="pb-3 font-medium">Validity</th>
                <th className="pb-3 font-medium">Status Control</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-zinc-500">No contracts drafted yet.</td>
                </tr>
              ) : contracts.map((con) => (
                <tr key={con._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/25 transition-colors">
                  <td className="py-4">
                    <p className="font-bold text-zinc-200">{con.clientId?.name || "—"}</p>
                    <p className="text-xs text-[#EF4444] font-medium">{con.projectId?.title || "Standalone"}</p>
                  </td>
                  <td className="py-4 text-zinc-500 text-sm max-w-[200px]">
                    <span className="truncate block italic">"{con.terms?.slice(0, 50) || "—"}{con.terms?.length > 50 ? "..." : ""}"</span>
                  </td>
                  <td className="py-4 text-xs text-zinc-400">
                    {con.effectiveDate ? new Date(con.effectiveDate).toLocaleDateString("en-GB") : "—"} to {con.expirationDate ? new Date(con.expirationDate).toLocaleDateString("en-GB") : "Comp."}
                  </td>
                  <td className="py-4">
                    <select 
                      value={con.status || "Draft"}
                      onChange={(e) => handleStatusUpdate(con._id, e.target.value)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider border cursor-pointer outline-none transition-all ${getStatusColor(con.status)}`}
                    >
                      {["Draft", "Sent", "Signed", "Suspended", "Terminated"].map(s => <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>)}
                    </select>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleDownload(con._id, "en")} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#EF4444] hover:bg-[#EF4444]/10 transition-all">
                        <Download size={13} /> PDF
                      </button>
                      {deleteConfirm === con._id ? (
                        <div className="flex items-center gap-1 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-lg px-2 py-1">
                          <button onClick={() => handleDelete(con._id)} className="text-[10px] bg-[#EF4444] text-white px-2 py-0.5 rounded font-bold">PURGE</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-[10px] text-zinc-400 ml-1 underline">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(con._id)} className="p-1.5 rounded-lg border border-zinc-800 text-zinc-600 hover:text-[#EF4444] hover:border-[#EF4444]/40 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
