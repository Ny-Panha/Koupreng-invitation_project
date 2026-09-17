import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AdminAuthProvider";
import { Sparkles, Lock, Mail, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";

function safeNext(searchParams) {
  const next = searchParams.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate(safeNext(searchParams), { replace: true });
    } catch (err) {
      setError(err?.message || "ការចូលប្រើប្រាស់បានបរាជ័យ សូមពិនិត្យព័ត៌មានម្តងទៀត");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#09090b] overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-zinc-800 bg-[#121215]/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl transition-all">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 mb-4">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-moul">
              គូព្រេង
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              ចូលប្រើប្រាស់ផ្ទាំងគ្រប់គ្រងសម្រាប់អ្នកគ្រប់គ្រងប្រព័ន្ធ
            </p>
            <div className="mt-3 flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Portal v1.0</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs font-semibold text-red-400 animate-in fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-semibold text-zinc-300 mb-1.5"
              >
                អ៊ីមែល ឬ លេខទូរស័ព្ទ
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@koupreng.com"
                  autoComplete="username"
                  required
                  className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-amber-500 focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-zinc-300 mb-1.5"
              >
                លេខសម្ងាត់
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 pl-10 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-amber-500 focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? "លាក់លេខសម្ងាត់" : "បង្ហាញលេខសម្ងាត់"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-bold text-slate-950 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>កំពុងផ្ទៀងផ្ទាត់...</span>
                </>
              ) : (
                <>
                  <span>ចូលគណនី</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 text-center text-[11px] text-zinc-500">
            © 2026 Koupreng Platform. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
