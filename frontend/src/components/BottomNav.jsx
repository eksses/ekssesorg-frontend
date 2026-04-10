import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FileText, CreditCard, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const location = useLocation();

  const links = [
    { to: "/", icon: <LayoutDashboard size={22} />, label: "Home" },
    { to: "/clients", icon: <Users size={22} />, label: "Clients" },
    { to: "/projects", icon: <Briefcase size={22} />, label: "Projects" },
    { to: "/invoices", icon: <CreditCard size={22} />, label: "Invoices" },
    { to: "/contracts", icon: <FileText size={22} />, label: "Docs" },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-sm z-50">
      <nav className="bg-[#18181B]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <ul className="flex items-center justify-between gap-1 relative">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to} className="flex-1">
                <Link to={link.to}
                  className={`flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl transition-all duration-300 relative ${
                    isActive ? "text-white" : "text-zinc-500"
                  }`}>
                  <div className="relative z-10">
                    {link.icon}
                  </div>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="nav-bg"
                      className="absolute inset-0 bg-[#EF4444] rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
