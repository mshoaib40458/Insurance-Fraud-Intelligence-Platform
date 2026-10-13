// Login Page — Sentinel AI

import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, AlertCircle, Lock, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md px-4">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-8">
          
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_#10b981]" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 font-display tracking-tight">SENTINEL AI</h1>
            <p className="text-sm text-slate-400 mt-1">Fraud Risk Intelligence Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Platform"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center mb-3 font-medium uppercase tracking-wider">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: "Admin",       user: "admin",         pass: "admin123"  },
                { role: "Analyst",     user: "analyst",       pass: "analyst123"},
                { role: "Investigator",user: "investigator",  pass: "invest123" },
              ].map(({ role, user, pass }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setUsername(user); setPassword(pass); }}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/40 hover:bg-slate-800 transition-all group"
                >
                  <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300">{role}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">{user}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          © {new Date().getFullYear()} Sentinel Risk Intelligence Inc.
        </p>
      </div>
    </div>
  );
}
