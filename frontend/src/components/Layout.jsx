import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ActionModal from "./modals/ActionModal";

export default function Layout({ children }) {
  return (
    <div className="flex bg-[#09090B] min-h-screen text-slate-100 font-sans selection:bg-[#EF4444] selection:text-white">
      <ActionModal />
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#09090B] p-6 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center font-black text-white italic">
              E
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              eksses<span className="text-[#EF4444]">ORG</span>
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#EF4444]/20 to-transparent flex items-center justify-center text-[10px] font-bold text-[#EF4444]">
              ADMIN
            </div>
          </div>
        </header>

        {/* Global ambient background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#EF4444] blur-[180px] opacity-10 pointer-events-none rounded-full"></div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-40 md:pb-8 z-10 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
