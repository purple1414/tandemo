"use client";

import Link from "next/link";
import { Wallet, Mail, Lock, User, UserPlus, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 mb-6">
            <Wallet className="text-white w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">Start managing your shared finances today.</p>
        </div>

        <div className="glass-card rounded-3xl p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
            </div>

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
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-muted/50 border border-border rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Invite Partner (Optional)</span>
              </div>
              <input 
                type="email"
                placeholder="Partner's Email"
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              <p className="text-[10px] text-muted-foreground italic">They will receive an invite link to join your shared dashboard.</p>
            </div>
          </div>

          <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
