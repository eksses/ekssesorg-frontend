import React, { useEffect, useState } from "react";
import { Users, Loader2, Trash2, ChevronDown, ChevronUp, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../api/axios";
import { useStore } from "../store/useStore";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const { openModal } = useStore();

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/clients");
      setClients(res.data);
    } catch (err) {
      console.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (client) => {
    setEditingId(client._id);
    setEditForm({ ...client });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    try {
      await axios.put(`/clients/${id}`, editForm);
      setEditingId(null);
      fetchClients();
    } catch (err) {
      setError("Failed to save changes.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/clients/${id}`);
      setDeleteConfirm(null);
      fetchClients();
    } catch (err) {
      setError(err.response?.data?.message || "Deletion failed.");
      setDeleteConfirm(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={48} className="animate-spin text-[#EF4444]" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-[#EF4444]" /> Client Registry
          </h2>
          <p className="text-zinc-500 mt-1">Full CRM intelligence — Referrals, Context & History.</p>
        </div>
        <button 
          onClick={() => openModal("client")}
          className="flex items-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[#EF4444]/30 active:scale-95 transition-all text-sm"
        >
          <X className="rotate-45" size={18} /> <span className="hidden sm:inline">New Client</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-[#EF4444] text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      <div className="space-y-3">
        {clients.length === 0 ? (
          <div className="text-center text-zinc-500 py-16">No clients registered yet.</div>
        ) : clients.map((client) => (
          <div key={client._id} className="bg-[#18181B] border border-zinc-800 rounded-2xl overflow-hidden">
            {/* Row header */}
            <div className="flex items-center justify-between p-4 md:p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center font-black text-[#EF4444] text-lg">
                  {client.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white">{client.name}</p>
                  <p className="text-xs text-zinc-500">{client.company || "—"} · {client.email}</p>
                  {client.referralSource && (
                    <p className="text-xs text-[#F59E0B] mt-0.5">Referred via: {client.referralSource}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Delete */}
                {deleteConfirm === client._id ? (
                  <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-[#EF4444] font-bold">Confirm erase?</span>
                    <button onClick={() => handleDelete(client._id)} className="text-xs bg-[#EF4444] text-white px-2 py-0.5 rounded font-bold">Yes, Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-xs text-zinc-400">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(client._id)} className="p-2 rounded-lg border border-zinc-800 text-zinc-600 hover:text-[#EF4444] hover:border-[#EF4444]/40 transition-all">
                    <Trash2 size={15} />
                  </button>
                )}
                <button onClick={() => setExpandedId(expandedId === client._id ? null : client._id)} className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-all">
                  {expandedId === client._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>

            {/* Expanded CRM Detail Panel */}
            <AnimatePresence>
              {expandedId === client._id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="border-t border-zinc-800 bg-[#09090B] p-5">
                  {editingId === client._id ? (
                    /* Edit Mode */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "Full Name", key: "name" },
                        { label: "Email", key: "email" },
                        { label: "Phone", key: "phone" },
                        { label: "Company", key: "company" },
                        { label: "Referral Source", key: "referralSource", hint: "e.g., Facebook, Friend, Cold Outreach" },
                      ].map(({ label, key, hint }) => (
                        <div key={key}>
                          <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
                          <input value={editForm[key] || ""} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                            placeholder={hint || label}
                            className="w-full bg-black border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#EF4444]" />
                        </div>
                      ))}
                      <div className="md:col-span-2">
                        <label className="text-xs text-zinc-500 mb-1 block">Business Context / Notes</label>
                        <textarea value={editForm.businessContext || ""} onChange={e => setEditForm({ ...editForm, businessContext: e.target.value })}
                          placeholder="Background on client, their industry, personality, trust level, etc."
                          className="w-full bg-black border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 h-20 focus:outline-none focus:border-[#EF4444]" />
                      </div>
                      <div className="md:col-span-2 flex gap-3 justify-end">
                        <button onClick={cancelEdit} className="flex items-center gap-1 text-sm text-zinc-400 px-4 py-2 border border-zinc-800 rounded-lg hover:border-zinc-600">
                          <X size={14} /> Cancel
                        </button>
                        <button onClick={() => saveEdit(client._id)} className="flex items-center gap-1 text-sm font-bold bg-[#22C55E] text-black px-4 py-2 rounded-lg shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                          <Save size={14} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {[
                          { label: "Phone", value: client.phone || "—" },
                          { label: "Company", value: client.company || "—" },
                          { label: "Referral Source", value: client.referralSource || "Direct" },
                          { label: "Registered", value: new Date(client.createdAt).toLocaleDateString() },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-black border border-zinc-800 rounded-lg p-3">
                            <span className="text-xs text-zinc-500 block mb-1">{label}</span>
                            <span className="text-sm text-white font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-black border border-zinc-800 rounded-lg p-3 mb-4">
                        <span className="text-xs text-zinc-500 block mb-1">Business Context</span>
                        <span className="text-sm text-zinc-300">{client.businessContext || "No context notes on file."}</span>
                      </div>
                      <button onClick={() => startEdit(client)} className="text-xs font-semibold text-[#EF4444] border border-[#EF4444]/40 px-4 py-2 rounded-lg hover:bg-[#EF4444]/10 transition-all">
                        Edit CRM Profile
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
