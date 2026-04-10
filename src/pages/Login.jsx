import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Lock, User } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError("Invalid credentials. System locked.");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4 selection:bg-[#EF4444] selection:text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#EF4444] blur-[200px] opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#18181B] bg-opacity-80 backdrop-blur-2xl border border-zinc-800 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 border-t-[#EF4444]/30">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#DC2626] to-[#EF4444] tracking-tight">ekssesORG</h1>
          <p className="text-zinc-500 mt-2 text-sm uppercase tracking-widest font-semibold">Restricted Access</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444] text-sm font-medium flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Identity</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-zinc-600" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-[#EF4444] text-white rounded-xl pl-11 pr-4 py-3 outline-none transition-all focus:shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                placeholder="Enter root identity"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Passphrase</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-zinc-600" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-[#EF4444] text-white rounded-xl pl-11 pr-4 py-3 outline-none transition-all focus:shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                placeholder="Enter access passphrase"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold tracking-wide py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] mt-4"
          >
            AUTHORIZE ACCESS
          </button>
        </form>
      </div>
    </div>
  );
}
