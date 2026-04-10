import { useEffect, useState } from "react";
import { Loader2, CreditCard, Download, Trash2, X } from "lucide-react";
import axios from "../api/axios";
import { useStore } from "../store/useStore";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const { openModal } = useStore();

  const formatBDT = (amount) => `৳${Number(amount).toLocaleString()}`;

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/invoices");
      setInvoices(res.data);
    } catch (err) {
      console.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/invoices/${id}`);
      setDeleteConfirm(null);
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || "Deletion failed.");
      setDeleteConfirm(null);
    }
  };

  const handleDownload = async (id, lang) => {
    try {
      const response = await axios.get(`/invoices/${id}/pdf?lang=${lang}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `EKS-INVOICE-${id}-${lang.toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await axios.patch(`/invoices/${id}`, { status: "paid" });
      fetchInvoices();
    } catch (err) {
      setError("Failed to verify payment.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={48} className="animate-spin text-[#EF4444]" />
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <CreditCard className="text-[#EF4444]" /> Fiscal Index
          </h2>
          <p className="text-zinc-500 mt-1">Aggregated monetary transmissions and milestone billing.</p>
        </div>
        <button 
          onClick={() => openModal("invoice")}
          className="flex items-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[#EF4444]/30 active:scale-95 transition-all text-sm"
        >
          <X className="rotate-45" size={18} /> <span className="hidden sm:inline">New Invoice</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-[#EF4444] text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      <div className="bg-[#18181B] bg-opacity-80 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* === MOBILE CARD VIEW === */}
        <div className="md:hidden p-4 space-y-4">
          {invoices.length === 0 ? (
            <div className="text-center text-zinc-500 py-8">No invoices found.</div>
          ) : invoices.map((inv) => {
            const isPaid = inv.status === "paid";
            const milestone = (inv.projectId?.milestones || []).find(m => m._id === inv.milestoneId || m._id.toString() === inv.milestoneId);
            return (
              <div key={inv._id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#EF4444] uppercase">{inv.invoiceNumber}</p>
                    <p className="font-bold text-white text-sm">{inv.projectId?.title || "Custom Billing"}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{inv.projectId?.clientId?.name || "No Client"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white text-lg">{formatBDT(inv.amount)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] uppercase font-bold border ${isPaid ? "text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10" : "text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10"}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-500 italic">{milestone ? milestone.title : "Custom Phase"}</span>
                  <div className="flex gap-2">
                    {!isPaid && (
                      <button onClick={() => handleMarkAsPaid(inv._id)} className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-3 py-1 rounded-md">
                        PAY
                      </button>
                    )}
                    <button onClick={() => handleDownload(inv._id, "en")} className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400">
                      <Download size={14} />
                    </button>
                    <button onClick={() => setDeleteConfirm(inv._id)} className="p-1.5 rounded-lg border border-zinc-800 text-zinc-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {deleteConfirm === inv._id && (
                  <div className="pt-2 flex items-center justify-between text-[10px] bg-[#EF4444]/5 p-2 rounded-lg border border-[#EF4444]/20">
                    <span className="text-[#EF4444] font-bold">Confirm Deletion?</span>
                    <div className="flex gap-3">
                      <button onClick={() => handleDelete(inv._id)} className="text-[#EF4444] font-black underline">YES</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-zinc-500">NO</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* === DESKTOP TABLE VIEW === */}
        <div className="hidden md:block overflow-x-auto p-4 md:p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-medium">Invoice #</th>
                <th className="pb-3 font-medium">Project Context</th>
                <th className="pb-3 font-medium">Billing Phase</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status / Method</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-zinc-500">No invoices found.</td>
                </tr>
              ) : invoices.map((inv) => {
                const isPaid = inv.status === "paid";
                const milestone = (inv.projectId?.milestones || []).find(m => m._id === inv.milestoneId || m._id.toString() === inv.milestoneId);
                return (
                  <tr key={inv._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 font-bold text-zinc-300">{inv.invoiceNumber}</td>
                    <td className="py-4">
                        <p className="text-white font-medium">{inv.projectId?.title || "—"}</p>
                        <p className="text-[10px] text-zinc-500 uppercase">{inv.projectId?.clientId?.name || "No Client"}</p>
                    </td>
                    <td className="py-4 text-zinc-400 text-sm italic">{milestone ? milestone.title : "Custom Billing"}</td>
                    <td className="py-4 font-semibold text-white">{formatBDT(inv.amount)}</td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${isPaid ? "text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10" : "text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]"}`}>
                            {inv.status}
                        </span>
                        <span className="text-[10px] text-zinc-600 px-1">{inv.paymentMethod || "Bank"}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isPaid && (
                            <button 
                                onClick={() => handleMarkAsPaid(inv._id)}
                                className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-1.5 rounded-lg hover:bg-[#22C55E] hover:text-white transition-all shadow-lg shadow-[#22C55E]/5"
                            >
                                MARK PAID
                            </button>
                        )}
                        <button onClick={() => handleDownload(inv._id, "en")} className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#EF4444] transition-all">
                          <Download size={14} />
                        </button>
                        {deleteConfirm === inv._id ? (
                          <div className="flex items-center gap-1 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-lg px-2 py-1">
                            <button onClick={() => handleDelete(inv._id)} className="text-[10px] bg-[#EF4444] text-white px-2 py-0.5 rounded font-bold uppercase transition-all">Del</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-[10px] text-zinc-500 ml-1">X</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(inv._id)} className="p-2 rounded-lg border border-zinc-800 text-zinc-600 hover:text-[#EF4444] transition-all">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
