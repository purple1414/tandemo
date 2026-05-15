"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github" | "apple") => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) {
        if (error.message?.toLowerCase().includes("provider") || error.status === 400) {
          setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login isn't enabled yet. Enable it in your Supabase dashboard under Authentication → Providers. Use email/password for now.`);
        } else {
          throw error;
        }
      }
    } catch (err: any) {
      setError(err.message || "Social login failed.");
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 overflow-hidden">
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5] via-[#6d28d9] to-[#1e1b4b]" />
        {/* Glowing orbs */}
        <div className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] bg-indigo-400/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 max-w-sm text-center px-8">
          {/* Wordmark */}
          <div className="mb-10">
            <span className="text-7xl font-black text-white tracking-tighter leading-none">
              Tan<span className="text-indigo-300">demo</span>
            </span>
          </div>

          <p className="text-white/60 text-base font-medium leading-relaxed mb-12">
            The collaborative financial operating system designed for you and your partner.
            Real-time sync. Shared capital strategy.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            {[
              { label: "Live sync across both partners", dot: "bg-emerald-400" },
              { label: "Military-grade SQL encryption", dot: "bg-indigo-300" },
              { label: "AI-powered financial insights", dot: "bg-violet-300" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${f.dot}`} />
                <span className="text-sm font-bold text-white/80">{f.label}</span>
              </div>
            ))}
          </div>

          <p className="mt-12 text-[10px] font-black uppercase tracking-widest text-white/30">
            Powered by Tandemo Secure Cloud
          </p>
        </div>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[400px]">

          {/* Mobile wordmark */}
          <div className="lg:hidden text-center mb-10">
            <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
              Tan<span className="text-indigo-500">demo</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-2">
              {isLogin
                ? "Sign in to access your household dashboard."
                : "Start managing shared finances with your partner."}
            </p>
          </div>

          {success ? (
            <div className="py-12 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Check your inbox</h3>
                <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">
                  We sent a verification link to{" "}
                  <span className="text-indigo-500 font-bold">{email}</span>.
                </p>
              </div>
              <button
                onClick={() => setIsLogin(true)}
                className="text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              {/* Error */}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-500 text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-11 pr-5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-11 pr-12 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-slate-950 px-4 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Social */}
              <div className="grid grid-cols-3 gap-3">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  className="flex items-center justify-center py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                {/* Apple */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("apple")}
                  className="flex items-center justify-center py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                >
                  <svg className="w-5 h-5 text-slate-700 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05 1.61-3.22 1.61-1.14 0-1.53-.67-2.82-.67-1.28 0-1.74.65-2.82.67-1.15.02-2.35-.78-3.35-1.76-2.04-2.01-3.13-5.06-3.13-7.58 0-3.83 2.37-5.88 4.64-5.88 1.2 0 2.18.73 2.92.73.71 0 1.83-.8 3.2-.8 1.43 0 2.65.68 3.42 1.83-2.92 1.5-2.45 5.56.54 6.78-.65 1.76-1.5 3.51-2.42 5.09zm-3.52-16.71c0 1.7-1.42 3.11-3.14 3.11-.1 0-.19 0-.29-.01.12-1.68 1.56-3.14 3.23-3.14.07 0 .14 0 .2.04z"/>
                  </svg>
                </button>
                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("github")}
                  className="flex items-center justify-center py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                >
                  <svg className="w-5 h-5 text-slate-700 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </button>
              </div>

              {/* Toggle login/register */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(null); }}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {isLogin ? "New to Tandemo? Create Account →" : "Already registered? Sign In →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
