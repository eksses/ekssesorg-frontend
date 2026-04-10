import React, { useEffect, useState } from "react";
import { Loader2, FolderPlus, Download, CheckCircle, PlusCircle, Save, Trash2, X, Users, FileText, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../api/axios";
import { useStore } from "../store/useStore"; // Added import

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [newMilestone, setNewMilestone] = useState({});
  const [editingCore, setEditingCore] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const { openModal } = useStore(); // Add this

  const formatBDT = (amount) => `৳${Number(amount || 0).toLocaleString()}`;

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (projectId, status) => {
    try {
      await axios.patch(`/projects/${projectId}/status`, { status });
      fetchProjects();
    } catch (err) {
      setError("Failed to update status.");
    }
  };

  const handleUpdateCore = async (projectId) => {
    try {
      await axios.put(`/projects/${projectId}/update-core`, editingCore[projectId]);
      setEditingCore({ ...editingCore, [projectId]: null });
      fetchProjects();
    } catch (err) { console.error("Error updating core", err); }
  };

  const initEditCore = (project) => {
    setEditingCore({
      ...editingCore,
      [project._id]: {
        amount: project.amount,
        scopeDescription: project.scopeDescription,
        teamNotes: project.teamNotes,
        techStack: project.techStack,
        internalDeadline: project.internalDeadline ? project.internalDeadline.split("T")[0] : ""
      }
    });
  };

  const handleCreateMilestone = async (e, projectId) => {
    e.preventDefault();
    try {
      await axios.post(`/projects/${projectId}/milestones`, newMilestone[projectId]);
      setNewMilestone({ ...newMilestone, [projectId]: null });
      fetchProjects();
    } catch (err) { console.error("Error creating milestone", err); }
  };

  const handleMarkPaid = async (projectId, mId) => {
    try {
      await axios.put(`/projects/${projectId}/milestones/${mId}/pay`);
      fetchProjects();
    } catch (err) { console.error("Payment sync failed", err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/projects/${id}`);
      setDeleteConfirm(null);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Deletion failed.");
      setDeleteConfirm(null);
    }
  };

  const handleDownload = async (projectId, type, lang) => {
    try {
      const response = await axios.get(`/projects/${projectId}/pdf/${type}?lang=${lang}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `EKS-${type.toUpperCase()}-${projectId}-${lang.toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) { console.error("Failed to download PDF", err); }
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
            <FolderPlus className="text-[#EF4444]" /> Pipeline Core
          </h2>
          <p className="text-zinc-500 mt-1">Payment protection, milestones & team operation engine.</p>
        </div>
        <button 
          onClick={() => openModal("project")}
          className="flex items-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-[#EF4444]/30 active:scale-95 transition-all text-sm"
        >
          <PlusCircle size={18} /> <span className="hidden sm:inline">New Project</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-[#EF4444] text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center text-zinc-500 py-16">No projects found. Launch one from the dashboard.</div>
        ) : projects.map((project) => {
          const isNegotiating = !project.amount || project.amount === 0;
          const totalPaid = (project.milestones || []).reduce((s, m) => s + (m.paidAmount || 0), 0);
          const outstanding = (project.amount || 0) - totalPaid;

          return (
            <div key={project._id} className="bg-[#18181B] border border-zinc-800 rounded-2xl overflow-hidden">
              {/* Main Row */}
              <div className="flex items-center justify-between p-4 md:p-5 cursor-pointer" onClick={() => setExpandedRow(expandedRow === project._id ? null : project._id)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center">
                    <FolderPlus size={18} className="text-[#EF4444]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white">{project.title}</p>
                      {isNegotiating && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-bold animate-pulse">NEGOTIATING</span>}
                      {project.milestones?.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">{project.milestones.length} phase{project.milestones.length > 1 ? "s" : ""}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-xs text-zinc-500 flex items-center gap-1"><Users size={11}/> {project.clientId?.name || "—"}</p>
                      
                      {/* Status Pills */}
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        {["Pending", "In progress", "Completed"].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(project._id, s)}
                            className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                              project.status === s
                                ? s === "Completed" ? "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40"
                                  : s === "In progress" ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40"
                                  : "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40"
                                : "bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            {s.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4" onClick={e => e.stopPropagation()}>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-zinc-500">Budget</p>
                    <p className="font-black text-white">{isNegotiating ? "TBD" : formatBDT(project.amount)}</p>
                  </div>
                  {outstanding > 0 && <div className="text-right hidden md:block">
                    <p className="text-xs text-zinc-500">Outstanding</p>
                    <p className="font-bold text-[#EF4444]">{formatBDT(outstanding)}</p>
                  </div>}
                  {/* Safe Delete */}
                  {deleteConfirm === project._id ? (
                    <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-[#EF4444] font-bold">Confirm?</span>
                      <button onClick={() => handleDelete(project._id)} className="text-xs bg-[#EF4444] text-white px-2 py-0.5 rounded font-bold">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs text-zinc-400">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(project._id)} className="p-2 rounded-lg border border-zinc-800 text-zinc-600 hover:text-[#EF4444] hover:border-[#EF4444]/40 transition-all">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Panel */}
              <AnimatePresence>
                {expandedRow === project._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-800 bg-[#09090B]">
                    <div className="p-5 space-y-6">

                      {/* === AGREEMENT FORMULATION === */}
                      <div className="p-4 rounded-xl border border-zinc-800">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-white">📋 Agreement Formulation</h4>
                          {!editingCore[project._id] ? (
                            <button onClick={() => initEditCore(project)} className="text-xs text-[#EF4444] border border-[#EF4444]/40 px-3 py-1 rounded-lg hover:bg-[#EF4444]/10">Edit Terms</button>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => setEditingCore({ ...editingCore, [project._id]: null })} className="text-xs text-zinc-500 px-3 py-1 border border-zinc-800 rounded-lg">Cancel</button>
                              <button onClick={() => handleUpdateCore(project._id)} className="text-xs font-bold text-black bg-[#22C55E] px-3 py-1 rounded-lg flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.3)]"><Save size={12}/> Lock Final</button>
                            </div>
                          )}
                        </div>
                        {editingCore[project._id] ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="text-xs text-zinc-500 mb-1 block">Scope (Client-Facing)</label>
                              <textarea className="w-full bg-black border border-zinc-700 text-white text-sm rounded-lg p-3 h-20 focus:outline-none focus:border-[#EF4444]"
                                value={editingCore[project._id].scopeDescription || ""}
                                onChange={e => setEditingCore({ ...editingCore, [project._id]: { ...editingCore[project._id], scopeDescription: e.target.value } })} />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 mb-1 block">Locked Valuation (BDT)</label>
                              <input type="number" className="w-full bg-black border border-[#EF4444] text-white text-lg font-black rounded-lg p-3 focus:outline-none"
                                value={editingCore[project._id].amount || ""}
                                onChange={e => setEditingCore({ ...editingCore, [project._id]: { ...editingCore[project._id], amount: e.target.value } })} />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 mb-1 block">Internal Deadline</label>
                              <input type="date" className="w-full bg-black border border-zinc-700 text-zinc-300 text-sm rounded-lg p-3 focus:outline-none focus:border-[#EF4444]"
                                value={editingCore[project._id].internalDeadline || ""}
                                onChange={e => setEditingCore({ ...editingCore, [project._id]: { ...editingCore[project._id], internalDeadline: e.target.value } })} />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-500 mb-1 block">Tech Stack</label>
                              <input type="text" placeholder="e.g., React, Node.js, MongoDB" className="w-full bg-black border border-zinc-700 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-[#EF4444]"
                                value={editingCore[project._id].techStack || ""}
                                onChange={e => setEditingCore({ ...editingCore, [project._id]: { ...editingCore[project._id], techStack: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs text-zinc-500 mb-1 block">Team Notes (Internal Only)</label>
                              <textarea placeholder="Notes for your dev team — client temperament, priority flags, etc." className="w-full bg-black border border-zinc-700 text-white text-sm rounded-lg p-3 h-16 focus:outline-none focus:border-[#EF4444]"
                                value={editingCore[project._id].teamNotes || ""}
                                onChange={e => setEditingCore({ ...editingCore, [project._id]: { ...editingCore[project._id], teamNotes: e.target.value } })} />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="col-span-2 bg-black border border-zinc-800 rounded-lg p-3">
                              <span className="text-xs text-zinc-500 block mb-1">Scope Restrictions</span>
                              <p className="text-sm text-zinc-300">{project.scopeDescription || "No scope defined."}</p>
                            </div>
                            <div className="bg-black border border-zinc-800 rounded-lg p-3">
                              <span className="text-xs text-zinc-500 block mb-1">Budget</span>
                              <p className="text-lg font-black text-[#EF4444]">{isNegotiating ? "TBD" : formatBDT(project.amount)}</p>
                            </div>
                            <div className="bg-black border border-zinc-800 rounded-lg p-3">
                              <span className="text-xs text-zinc-500 block mb-1">Internal Deadline</span>
                              <p className="text-sm text-zinc-300">{project.internalDeadline ? new Date(project.internalDeadline).toLocaleDateString() : "—"}</p>
                            </div>
                            <div className="bg-black border border-zinc-800 rounded-lg p-3">
                              <span className="text-xs text-zinc-500 block mb-1">Tech Stack</span>
                              <p className="text-sm text-zinc-300">{project.techStack || "—"}</p>
                            </div>
                            <div className="col-span-2 bg-black border border-zinc-700 border-dashed rounded-lg p-3">
                              <span className="text-xs text-[#F59E0B] block mb-1">🔒 Internal Notes</span>
                              <p className="text-sm text-zinc-400">{project.teamNotes || "No internal notes."}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* === PDF ACTIONS === */}
                      <div className="p-4 rounded-xl border border-zinc-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">PDF Outputs</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { label: "Client Contract (EN)", type: "receipt", lang: "en", icon: <FileText size={13}/>, color: "border-zinc-700 text-zinc-400 hover:border-[#EF4444] hover:text-[#EF4444]" },
                            { label: "Client Contract (BN)", type: "receipt", lang: "bn", icon: <FileText size={13}/>, color: "border-zinc-700 text-zinc-400 hover:border-[#22C55E] hover:text-[#22C55E]" },
                            { label: "Final Summary (EN)", type: "summary", lang: "en", icon: <File size={13}/>, color: "border-zinc-700 text-zinc-400 hover:border-[#F59E0B] hover:text-[#F59E0B]" },
                            { label: "🔒 Team Brief (Internal)", type: "internal", lang: "en", icon: <Users size={13}/>, color: "border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B]/10" },
                          ].map(({ label, type, lang, icon, color }) => (
                            <button key={label} onClick={() => handleDownload(project._id, type, lang)}
                              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${color}`}>
                              <Download size={12} />{icon} {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* === PAYMENT MILESTONES === */}
                      <div className="p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-white">💰 Payment Milestones</h4>
                          <button onClick={() => setNewMilestone({ ...newMilestone, [project._id]: {} })}
                            className="flex items-center gap-1 text-xs text-[#F59E0B] border border-[#F59E0B]/40 px-3 py-1 rounded-lg hover:bg-[#F59E0B]/10">
                            <PlusCircle size={13} /> Add Phase
                          </button>
                        </div>

                        {/* New Milestone Form */}
                        {newMilestone[project._id] !== undefined && newMilestone[project._id] !== null && (
                          <form onSubmit={(e) => handleCreateMilestone(e, project._id)}
                            className="flex flex-wrap items-center gap-3 mb-4 p-4 border border-dashed border-[#F59E0B]/50 rounded-xl bg-zinc-900/50">
                            <input required type="text" placeholder="Phase (e.g., Advance)" className="bg-black border border-zinc-700 text-sm px-3 py-2 rounded text-white flex-1 min-w-[120px]"
                              onChange={e => setNewMilestone({ ...newMilestone, [project._id]: { ...newMilestone[project._id], title: e.target.value } }) } />
                            <input required type="number" placeholder="%" className="bg-black border border-zinc-700 text-sm px-3 py-2 rounded text-white w-20"
                              onChange={e => setNewMilestone({ ...newMilestone, [project._id]: { ...newMilestone[project._id], percentage: parseFloat(e.target.value) } }) } />
                            <input required type="number" placeholder="BDT Amount" className="bg-black border border-zinc-700 text-sm px-3 py-2 rounded text-white w-32"
                              onChange={e => setNewMilestone({ ...newMilestone, [project._id]: { ...newMilestone[project._id], amount: parseFloat(e.target.value) } }) } />
                            <input required type="date" className="bg-black border border-zinc-700 text-sm px-3 py-2 rounded text-zinc-400"
                              onChange={e => setNewMilestone({ ...newMilestone, [project._id]: { ...newMilestone[project._id], dueDate: e.target.value } }) } />
                            <button type="submit" className="px-4 py-2 bg-[#F59E0B] text-black font-bold text-sm rounded">SAVE</button>
                            <button type="button" onClick={() => setNewMilestone({ ...newMilestone, [project._id]: null })} className="text-zinc-500 hover:text-white"><X size={16}/></button>
                          </form>
                        )}

                        <div className="space-y-2">
                          {(!project.milestones || project.milestones.length === 0) ? (
                            <p className="text-xs text-zinc-600 italic">No payment phases defined. Finalize scope & valuation first.</p>
                          ) : project.milestones.map((ms, idx) => {
                            const overdue = ms.status !== "Paid" && new Date(ms.dueDate) < new Date();
                            return (
                              <div key={ms._id} className={`flex flex-wrap items-center justify-between p-3 rounded-lg border ${overdue ? "border-[#EF4444]/50 bg-[#EF4444]/5" : "border-zinc-800 bg-zinc-900/40"}`}>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold px-2 py-1 bg-zinc-800 rounded">{idx + 1}</span>
                                  <div>
                                    <p className="text-sm font-semibold text-zinc-200">{ms.title} <span className="text-xs text-zinc-500">({ms.percentage}%)</span></p>
                                    <p className={`text-xs ${overdue ? "text-[#EF4444]" : "text-zinc-500"}`}>
                                      {overdue ? "⚠ OVERDUE — " : "Due: "}{new Date(ms.dueDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <p className="font-black text-white">{formatBDT(ms.amount)}</p>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 border rounded ${
                                        ms.status === "Paid" ? "text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10" : 
                                        ms.status === "Billed" ? "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10 shadow-[0_0_10px_rgba(245,158,11,0.1)]" :
                                        "text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10"
                                      }`}>
                                      {ms.status}
                                    </span>
                                    {ms.invoiceId && (
                                      <span className="text-[9px] text-zinc-500 italic flex items-center gap-1">
                                        <FileText size={10}/> Verify Invoice
                                      </span>
                                    )}
                                  </div>
                                  {ms.status !== "Paid" && (
                                    <button onClick={() => handleMarkPaid(project._id, ms._id)}
                                      className="flex items-center gap-1 text-xs font-bold text-[#22C55E] border border-[#22C55E] px-2 py-1 rounded hover:bg-[#22C55E] hover:text-black transition-all">
                                      <CheckCircle size={13} /> {ms.status === "Billed" ? "Clear Bill" : "Secured"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {project.milestones?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between text-xs">
                            <span className="text-zinc-500">Total Secured: <span className="text-[#22C55E] font-bold">{formatBDT(totalPaid)}</span></span>
                            <span className="text-zinc-500">Outstanding: <span className={`font-bold ${outstanding > 0 ? "text-[#EF4444]" : "text-[#22C55E]"}`}>{formatBDT(outstanding)}</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
