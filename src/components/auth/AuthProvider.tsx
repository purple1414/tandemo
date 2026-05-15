"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session && pathname !== "/auth") {
        router.push("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session && pathname !== "/auth") {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto mb-8">
            <Lock className="text-rose-500 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-4">Backend Connection Required</h2>
          <p className="text-sm text-slate-500 font-bold mb-8 leading-relaxed">
            Tandemo requires a Supabase connection to enable multi-user sync. Please update your <code className="bg-slate-100 px-2 py-1 rounded">.env.local</code> file with your API keys.
          </p>
          <div className="p-6 bg-slate-50 rounded-[2rem] text-left space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Required Variables:</p>
            <code className="block text-[10px] font-mono text-slate-400">NEXT_PUBLIC_SUPABASE_URL</code>
            <code className="block text-[10px] font-mono text-slate-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {!loading ? children : (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Tandemo Intelligence...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
