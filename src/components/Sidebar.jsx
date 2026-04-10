import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FileText, CreditCard, Users, Plus, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { openModal } = useStore();
  const { logout } = useAuth();

  const links = [
    { to: "/", icon: <LayoutDashboard size={19} />, label: "Dashboard" },
    { to: "/clients", icon: <Users size={19} />, label: "Clients" },
    { to: "/projects", icon: <Briefcase size={19} />, label: "Projects" },
    { to: "/invoices", icon: <CreditCard size={19} />, label: "Invoices" },
    { to: "/contracts", icon: <FileText size={19} />, label: "Contracts" },
  ];

  const quickActions = [
    { label: "New Client", modal: "client", color: "text-[#22C55E]" },
    { label: "New Project", modal: "project", color: "text-[#EF4444]" },
    { label: "New Invoice", modal: "invoice", color: "text-[#F59E0B]" },
    { label: "New Contract", modal: "contract", color: "text-zinc-400" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-[#111113] border-r border-zinc-800/80 sticky top-0 shrink-0">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-zinc-800/80">
        <h2 className="text-xl font-bold tracking-tight text-white">
          eksses<span className="text-[#EF4444]">ORG</span>
        </h2>
        <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-widest">Agency OS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold px-3 mb-2">Navigation</p>
        <ul className="space-y-0.5">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? "bg-[#EF4444] text-white font-semibold shadow-[0_2px_12px_rgba(239,68,68,0.35)]"
                      : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                  }`}>
                  {link.icon}
                  <span>{link.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
                </Link>
              </li>
            );
          })}
        </ul>

      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-zinc-800/80">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/70 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DC2626] to-[#EF4444] flex items-center justify-center text-white text-xs font-bold shrink-0">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Samir</p>
            <p className="text-xs text-zinc-600 truncate">ekssesORG Admin</p>
          </div>
          <button onClick={logout} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-[#EF4444]">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
