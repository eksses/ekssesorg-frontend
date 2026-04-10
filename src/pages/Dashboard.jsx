import { useEffect, useState } from "react";
import { Activity, CircleDollarSign, TrendingUp, Loader2, UserPlus, FolderPlus, CreditCard, AlertCircle, ArrowRight, FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { useStore } from "../store/useStore";

export default function Dashboard() {
  const [data, setData] = useState({
    totalEarnings: 0,
    activeProjectsCount: 0,
    pendingPayments: 0,
    overduePayments: 0,
    recentProjects: []
  });
  const [loading, setLoading] = useState(true);
  const { openModal, refetchTrigger } = useStore();

  const formatBDT = (amount) => `৳${Number(amount || 0).toLocaleString()}`;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get("/dashboard");
        setData(response.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [refetchTrigger]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={48} className="animate-spin text-[#EF4444]" />
    </div>
  );

  const stats = [
    {
      title: "Total Earnings",
      amount: formatBDT(data.totalEarnings),
      sub: "From paid milestones",
      icon: <CircleDollarSign size={20} />,
      color: "text-[#22C55E]",
      bg: "bg-[#22C55E]/10 border-[#22C55E]/20"
    },
    {
      title: "Active Projects",
      amount: data.activeProjectsCount || 0,
      sub: "In progress or pending",
      icon: <Activity size={20} />,
      color: "text-[#EF4444]",
      bg: "bg-[#EF4444]/10 border-[#EF4444]/20"
    },
    {
      title: "Pending Payments",
      amount: formatBDT(data.pendingPayments),
      sub: "Awaiting collection",
      icon: <TrendingUp size={20} />,
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20"
    },
    {
      title: "Overdue Payments",
      amount: formatBDT(data.overduePayments),
      sub: data.overduePayments > 0 ? "⚠ Needs attention" : "On track",
      icon: <AlertCircle size={20} />,
      color: data.overduePayments > 0 ? "text-[#EF4444]" : "text-zinc-600",
      bg: data.overduePayments > 0 ? "bg-[#EF4444]/15 border-[#EF4444]/40" : "bg-zinc-800/20 border-zinc-800/40",
      pulse: data.overduePayments > 0
    },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Command <span className="text-[#EF4444]">Center</span>
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Operational overview for Samir.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
           <button onClick={() => openModal('project')} className="bg-[#EF4444] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#EF4444]/20">
             Launch Project
           </button>
        </div>
      </motion.div>

      {/* Stats Grid - 2 cols on mobile, 4 on desktop */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-[#18181B] border rounded-2xl p-4 relative overflow-hidden ${stat.bg}`}>
            {stat.pulse && <div className="absolute inset-0 animate-pulse bg-[#EF4444]/5 rounded-2xl" />}
            <div className="relative z-10">
              <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-2`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">{stat.title}</p>
              <p className="text-xl font-black text-white tracking-tight">{stat.amount}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* Recent Projects */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#18181B] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/20">
            <h3 className="font-bold text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              Active Datasets
            </h3>
            <Link to="/projects" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-[#EF4444] transition-colors">
              Full Access →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-600 text-[10px] uppercase tracking-widest border-b border-zinc-800/50 bg-zinc-900/50">
                  <th className="py-3 px-5 font-bold">Instance</th>
                  <th className="py-3 px-5 font-bold">Valuation</th>
                  <th className="py-3 px-5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-16 text-center text-zinc-600 text-sm">No active processes.</td>
                  </tr>
                ) : data.recentProjects.slice(0, 5).map((project) => {
                  const statusMap = {
                    "Pending": "text-[#F59E0B] border-[#F59E0B]/30",
                    "In progress": "text-[#EF4444] border-[#EF4444]/30",
                    "Completed": "text-[#22C55E] border-[#22C55E]/30"
                  };
                  return (
                    <tr key={project._id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-all duration-200">
                      <td className="py-4 px-5">
                        <p className="font-bold text-zinc-200 text-sm">{project.title}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter truncate max-w-[120px]">{project.clientId?.name || "—"}</p>
                      </td>
                      <td className="py-4 px-5 text-zinc-300 text-sm font-black">{project.amount > 0 ? formatBDT(project.amount) : "negotiating"}</td>
                      <td className="py-4 px-5 text-right sm:text-left">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest border border-dashed ${statusMap[project.status] || "border-zinc-700 text-zinc-500"}`}>
                          {project.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Mobile Quick Quick Actions (only visible on mobile as a grid) */}
        <motion.div variants={itemVariants} className="block bg-[#18181B] border border-zinc-800 rounded-3xl p-5 shadow-2xl">
          <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
            <Plus size={16} className="text-[#EF4444]" /> New Records
          </h3>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => openModal('client')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900 border border-zinc-800 active:scale-95 transition-all text-zinc-400 gap-2">
                <UserPlus size={20} className="text-[#22C55E]" />
                <span className="text-[10px] font-bold uppercase">Client</span>
             </button>
             <button onClick={() => openModal('project')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900 border border-zinc-800 active:scale-95 transition-all text-zinc-400 gap-2">
                <FolderPlus size={20} className="text-[#EF4444]" />
                <span className="text-[10px] font-bold uppercase">Project</span>
             </button>
             <button onClick={() => openModal('invoice')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900 border border-zinc-800 active:scale-95 transition-all text-zinc-400 gap-2">
                <CreditCard size={20} className="text-[#F59E0B]" />
                <span className="text-[10px] font-bold uppercase">Invoice</span>
             </button>
             <button onClick={() => openModal('contract')} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900 border border-zinc-800 active:scale-95 transition-all text-zinc-400 gap-2">
                <FileText size={20} className="text-zinc-500" />
                <span className="text-[10px] font-bold uppercase">Contract</span>
             </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
