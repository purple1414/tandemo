"use client";

import Link from "next/link";
import { Wallet, Mail, Lock, ArrowRight, Globe } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 mb-6">
            <Wallet className="text-white w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Log in to manage your shared finances.</p>
        </div>

        <div className="glass-card rounded-3xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                <Link href="/forgot-password" title="Forgot password?" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group">
            Sign In
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <button className="w-full border border-border py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-muted transition-colors">
            <Globe className="w-5 h-5" />
            GitHub
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">Create one for free</Link>
        </p>
      </div>
    </div>
  );
}
