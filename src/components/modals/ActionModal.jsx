import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useStore } from "../../store/useStore";
import axios from "../../api/axios";

export default function ActionModal() {
  const { activeModal, closeModal, triggerRefetch } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Shared dropdowns
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  // CLIENT form
  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "", company: "", referralSource: "", businessContext: "" });

  // PROJECT form
  const [projectForm, setProjectForm] = useState({ title: "", clientId: "", amount: "" });

  // INVOICE form — links to a PROJECT (client auto-derived)
  const [invoiceForm, setInvoiceForm] = useState({ 
    projectId: "", 
    milestoneId: "", 
    amount: "", 
    paymentMethod: "Bank Transfer", 
    description: "Services rendered", 
    notes: "" 
  });
  const [milestones, setMilestones] = useState([]);

  // CONTRACT form — links to a CLIENT + PROJECT
  const [contractForm, setContractForm] = useState({ 
    clientId: "", 
    projectId: "", 
    terms: "", 
    status: "Draft",
    effectiveDate: "",
    expirationDate: "",
    specialClauses: "",
    revisionLimit: 2
  });

  useEffect(() => {
    setError("");
    if (!activeModal) return;

    // Reset forms
    setClientForm({ name: "", email: "", phone: "", company: "", referralSource: "", businessContext: "" });
    setProjectForm({ title: "", clientId: "", amount: "" });
    setInvoiceForm({ 
      projectId: "", 
      milestoneId: "", 
      amount: "", 
      paymentMethod: "Bank Transfer", 
      description: "Services rendered", 
      notes: "" 
    });
    setContractForm({ 
      clientId: "", 
      projectId: "", 
      terms: "", 
      status: "Draft",
      effectiveDate: "",
      expirationDate: "",
      specialClauses: "",
      revisionLimit: 2
    });
    setMilestones([]);

    // Fetch clients for project/contract/invoice creation
    if (["project", "contract", "invoice"].includes(activeModal)) {
      axios.get("/clients").then(r => setClients(r.data)).catch(console.error);
    }
    // Fetch projects for invoice/contract creation
    if (["invoice", "contract"].includes(activeModal)) {
      axios.get("/projects").then(r => setProjects(r.data)).catch(console.error);
    }
  }, [activeModal]);

  // Fetch milestones when project changes in invoice form
  useEffect(() => {
    if (activeModal === "invoice" && invoiceForm.projectId) {
      const selectedProject = projects.find(p => p._id === invoiceForm.projectId);
      if (selectedProject?.milestones) {
        setMilestones(selectedProject.milestones);
      } else {
        // Fetch full project details if milestones aren't in the list
        axios.get(`/projects/${invoiceForm.projectId}`).then(r => setMilestones(r.data.milestones || [])).catch(console.error);
      }
    }
  }, [invoiceForm.projectId, activeModal, projects]);

  if (!activeModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (activeModal === "client") {
        await axios.post("/clients", clientForm);
      } else if (activeModal === "project") {
        await axios.post("/projects", {
          title: projectForm.title,
          clientId: projectForm.clientId,
          amount: projectForm.amount ? Number(projectForm.amount) : 0,
          status: "Pending"
        });
      } else if (activeModal === "invoice") {
        const payload = { ...invoiceForm };
        if (!payload.milestoneId) delete payload.milestoneId;
        await axios.post("/invoices", {
          ...payload,
          invoiceNumber: `EKS-INV-${Date.now().toString().slice(-6)}`,
          amount: Number(invoiceForm.amount)
        });
      } else if (activeModal === "contract") {
        await axios.post("/contracts", contractForm);
      }
      triggerRefetch();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneSelect = (mId) => {
    const m = milestones.find(ms => ms._id === mId);
    setInvoiceForm({ 
      ...invoiceForm, 
      milestoneId: mId, 
      amount: m ? m.amount : invoiceForm.amount,
      description: m ? `Payment for: ${m.title}` : invoiceForm.description
    });
  };

  const modalTitles = {
    client: "Register New Client",
    project: "Launch Custom Project",
    invoice: "Generate Smart Invoice",
    contract: "Draft Lifecycle Contract"
  };

  const inputClass = "w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#EF4444] transition-colors text-sm placeholder:text-zinc-600";
  const labelClass = "text-xs text-zinc-400 font-semibold uppercase tracking-wider";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-[#09090B]/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#18181B] border border-[#EF4444]/30 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-[#18181B] z-10">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">{modalTitles[activeModal]}</h3>
            <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#EF4444] blur-[100px] opacity-5 pointer-events-none" />

            {error && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444] text-sm">{error}</div>
            )}

            {/* ========== CLIENT FORM ========== */}
            {activeModal === "client" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className={labelClass}>Full Name *</label>
                    <input required value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                      className={inputClass} placeholder="e.g. Samir Ahmed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Email *</label>
                    <input required type="email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                      className={inputClass} placeholder="client@email.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Phone</label>
                    <input type="tel" value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                      className={inputClass} placeholder="+880 1XXX XXXXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Company / Entity</label>
                    <input value={clientForm.company} onChange={e => setClientForm({ ...clientForm, company: e.target.value })}
                      className={inputClass} placeholder="e.g. ABC Corp" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Referral Source</label>
                    <input value={clientForm.referralSource} onChange={e => setClientForm({ ...clientForm, referralSource: e.target.value })}
                      className={inputClass} placeholder="e.g. Facebook, Friend" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className={labelClass}>Business Context / Notes</label>
                    <textarea value={clientForm.businessContext} onChange={e => setClientForm({ ...clientForm, businessContext: e.target.value })}
                      className={`${inputClass} h-20 resize-none`} placeholder="Industry, personality, trust level, how you found them..." />
                  </div>
                </div>
              </>
            )}

            {/* ========== PROJECT FORM ========== */}
            {activeModal === "project" && (
              <>
                <div className="space-y-1.5">
                  <label className={labelClass}>Project Title *</label>
                  <input required value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                    className={inputClass} placeholder="e.g. E-commerce Website" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Client *</label>
                  <select required value={projectForm.clientId} onChange={e => setProjectForm({ ...projectForm, clientId: e.target.value })} className={selectClass}>
                    <option value="" disabled>Select a client...</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ""}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Valuation (BDT) — Optional</label>
                  <input type="number" value={projectForm.amount} onChange={e => setProjectForm({ ...projectForm, amount: e.target.value })}
                    className={inputClass} placeholder="Leave blank to negotiate later" />
                </div>
              </>
            )}

            {/* ========== INVOICE FORM ========== */}
            {activeModal === "invoice" && (
              <>
                <div className="space-y-1.5">
                  <label className={labelClass}>Link to Project *</label>
                  <select required value={invoiceForm.projectId} onChange={e => setInvoiceForm({ ...invoiceForm, projectId: e.target.value })} className={selectClass}>
                    <option value="" disabled>Select a project...</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.title} {p.clientId?.name ? `— ${p.clientId.name}` : ""}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Payment Milestone</label>
                    <select value={invoiceForm.milestoneId} onChange={e => handleMilestoneSelect(e.target.value)} className={selectClass}>
                      <option value="">Full Payment / Custom</option>
                      {milestones.map(m => <option key={m._id} value={m._id}>{m.title} ({m.percentage}%)</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Payment Method</label>
                    <select value={invoiceForm.paymentMethod} onChange={e => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })} className={selectClass}>
                      {["Bank Transfer", "Credit Card", "bKash/Nagad", "Cash", "Other"].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Amount (BDT) *</label>
                  <input required type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    className={inputClass} placeholder="e.g. 5000" />
                </div>

                <div className="space-y-1.5">
                    <label className={labelClass}>Item Description</label>
                    <input value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                      className={inputClass} placeholder="What are you billing for?" />
                </div>
                
                <div className="space-y-1.5">
                    <label className={labelClass}>Private Internal Notes</label>
                    <textarea value={invoiceForm.notes} onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                      className={`${inputClass} h-16 resize-none`} placeholder="Internal records only..." />
                </div>
              </>
            )}

            {/* ========== CONTRACT FORM ========== */}
            {activeModal === "contract" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className={labelClass}>Link to Project *</label>
                    <select required value={contractForm.projectId} onChange={e => {
                      const p = projects.find(proj => proj._id === e.target.value);
                      setContractForm({ ...contractForm, projectId: e.target.value, clientId: p?.clientId?._id || p?.clientId || "" });
                    }} className={selectClass}>
                      <option value="" disabled>Select a project...</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.title} — {p.clientId?.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className={labelClass}>Initial Status</label>
                    <select value={contractForm.status} onChange={e => setContractForm({ ...contractForm, status: e.target.value })} className={selectClass}>
                      {["Draft", "Sent", "Signed", "Suspended", "Terminated"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Revision Limit</label>
                    <input type="number" value={contractForm.revisionLimit} onChange={e => setContractForm({ ...contractForm, revisionLimit: Number(e.target.value) })}
                      className={inputClass} />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Effective Date</label>
                    <input type="date" value={contractForm.effectiveDate} onChange={e => setContractForm({ ...contractForm, effectiveDate: e.target.value })}
                      className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Expiry Date</label>
                    <input type="date" value={contractForm.expirationDate} onChange={e => setContractForm({ ...contractForm, expirationDate: e.target.value })}
                      className={inputClass} />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className={labelClass}>Main Terms & Deliverables *</label>
                    <textarea required value={contractForm.terms} onChange={e => setContractForm({ ...contractForm, terms: e.target.value })}
                      className={`${inputClass} h-24 resize-none`} placeholder="Scope of work..." />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className={labelClass}>Special Clauses (Legalese)</label>
                    <textarea value={contractForm.specialClauses} onChange={e => setContractForm({ ...contractForm, specialClauses: e.target.value })}
                      className={`${inputClass} h-20 resize-none`} placeholder="Specific legal rules..." />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "EXECUTE"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
