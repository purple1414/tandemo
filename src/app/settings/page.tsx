"use client";

import { useState, useEffect } from "react";
import { useFinanceStore } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";
import { Users, Copy, Check, LogOut, Shield, Heart, Zap, Globe, X, ArrowRight, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const SettingCard = ({ icon: Icon, title, desc, onClick, color = "primary" }: any) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 text-left group"
  >
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110", {
      "bg-primary/10 text-primary": color === "primary",
      "bg-amber-500/10 text-amber-500": color === "amber",
      "bg-emerald-500/10 text-emerald-500": color === "emerald",
      "bg-rose-500/10 text-rose-500": color === "rose",
    })}>
      <Icon className="w-7 h-7" />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{desc}</p>
    </div>
    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
  </button>
);

const Modal = ({ title, isOpen, onClose, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tighter text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-10 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const { householdId, setProfile } = useFinanceStore();
  const { user, signOut } = useAuth();
  const [members, setMembers] = useState<{ email: string, full_name?: string, username?: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch profile data
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, username, phone, email')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setFullName(data.full_name || "");
        setUsername(data.username || "");
        setPhone(data.phone || "");
        setEmail(data.email || user.email || "");
      }
    };
    fetchProfile();
  }, [user]);

  // Fetch household members & Listen for real-time updates
  useEffect(() => {
    if (!householdId) return;

    const fetchMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('email, full_name, username')
        .eq('household_id', householdId);
      
      if (data) setMembers(data);
    };

    fetchMembers();

    // Subscribe to profile changes for this household
    const channel = supabase
      .channel(`members-${householdId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles',
        filter: `household_id=eq.${householdId}`
      }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      // Base updates that we know exist
      const updates: any = { 
        full_name: fullName, 
        username: username.replace('@', '')
      };

      // Only add phone/email if you've added them to your SQL
      if (phone) updates.phone = phone;
      if (email) updates.email = email;

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) {
        if (error.message.includes("column") || error.code === '42703') {
          throw new Error("Database columns missing. Please run the SQL script provided in the chat.");
        }
        throw error;
      }

      setProfile(updates);
      setUpdateMsg({ type: 'success', text: 'Identity protocol updated!' });
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      setUpdateMsg({ type: 'error', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setUpdateMsg({ type: 'success', text: 'Password secured!' });
      setTimeout(() => setUpdateMsg(null), 3000);
    } catch (err: any) {
      let message = err.message;
      if (message.includes("different from the old password")) {
        message = "Must be different from current password.";
      }
      setUpdateMsg({ type: 'error', text: message });
    } finally {
      setUpdating(false);
    }
  };

  const copyId = () => {
    if (householdId) {
      navigator.clipboard.writeText(householdId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode) return;
    
    setJoining(true);
    setJoinError(null);

    try {
      // 1. Verify household exists
      const { data: household, error: hError } = await supabase
        .from('households')
        .select('id')
        .eq('id', inviteCode)
        .single();

      if (hError || !household) throw new Error("Invalid Household ID. Please check with your partner.");

      // 2. Update user profile to join this household
      const { error: pError } = await supabase
        .from('profiles')
        .update({ household_id: household.id })
        .eq('id', user.id);

      if (pError) throw pError;

      // 3. Force reload to trigger sync
      window.location.reload();
    } catch (err: any) {
      setJoinError(err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-[0.2em]">Operational Control Center</p>
        </div>
        <div className="flex -space-x-3">
          {members.map((m, i) => (
            <div key={m.email} className={cn(
              "w-12 h-12 rounded-full border-4 border-slate-50 bg-primary/10 flex items-center justify-center text-[10px] font-black uppercase text-primary shadow-lg",
              `z-[${30-i}]`
            )}>
              {m.email.charAt(0)}
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SettingCard 
          icon={UserCircle} 
          title="Profile Identity" 
          desc="Legal Name, @Handle, Email"
          onClick={() => setActiveModal("identity")}
        />
        <SettingCard 
          icon={Shield} 
          title="Security Protocol" 
          desc="Encrypted Password & Access"
          onClick={() => setActiveModal("security")}
          color="amber"
        />
        <SettingCard 
          icon={Heart} 
          title="Partner Connection" 
          desc="Simultaneous Device Sync"
          onClick={() => setActiveModal("partner")}
          color="emerald"
        />
        <SettingCard 
          icon={Globe} 
          title="Data & Privacy" 
          desc="Export & Session Management"
          onClick={() => setActiveModal("privacy")}
          color="rose"
        />
      </div>

      {/* Identity Modal */}
      <Modal title="Profile Identity" isOpen={activeModal === "identity"} onClose={() => setActiveModal(null)}>
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Legal Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Unique Handle</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Email Protocol</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@cloud.com"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Mobile Link</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+63</span>
              <input 
                type="tel" 
                value={phone.replace('+63', '').trim()}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val ? `+63 ${val}` : "");
                }}
                placeholder="9XX XXX XXXX"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
            Push Identity Changes
          </button>
        </form>
      </Modal>

      {/* Security Modal */}
      <Modal title="Security Protocol" isOpen={activeModal === "security"} onClose={() => setActiveModal(null)}>
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">New System Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter complex password"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>
          <button type="submit" className="w-full py-5 bg-amber-500 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/10">
            Secure Password
          </button>
        </form>
      </Modal>

      {/* Partner Modal */}
      <Modal title="Partner Connection" isOpen={activeModal === "partner"} onClose={() => setActiveModal(null)}>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Connected Partners</p>
            <div className="space-y-3">
              {members.filter(m => m.email !== user?.email).length > 0 ? (
                members.filter(m => m.email !== user?.email).map((m) => (
                  <div key={m.email} className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xs font-black text-primary">
                        {m.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{m.full_name || m.email.split('@')[0]}</h4>
                        <p className="text-[10px] font-bold text-slate-400">{m.username ? `@${m.username}` : m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Active Sync</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for Connection</p>
                  <p className="text-xs text-slate-500 font-bold mt-2">Share your invitation code below to link a partner account.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Invitation Code</p>
            <div className="flex items-center gap-4">
              <code className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 text-xs font-mono font-bold text-slate-600 truncate">{householdId}</code>
              <button onClick={copyId} className="p-4 bg-white rounded-2xl shadow-sm hover:text-primary transition-all">
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400 bg-white px-4">OR JOIN PARTNER</div>
          </div>

          <form onSubmit={handleJoinHousehold} className="space-y-4">
            <input 
              type="text" 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Paste Partner ID"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none"
            />
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
              {joining ? "Synchronizing..." : "Initiate Connection"}
            </button>
            {joinError && <p className="text-rose-500 text-[10px] font-bold text-center">{joinError}</p>}
          </form>
        </div>
      </Modal>

      {/* Privacy Modal */}
      <Modal title="Data & Privacy" isOpen={activeModal === "privacy"} onClose={() => setActiveModal(null)}>
        <div className="space-y-4">
          <button className="w-full py-5 bg-slate-50 text-slate-600 border border-slate-100 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
            <Zap className="w-5 h-5 text-amber-500" /> Export System Data
          </button>
          <button onClick={signOut} className="w-full py-5 bg-rose-50 text-rose-500 border border-rose-100 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-3">
            <LogOut className="w-5 h-5" /> Terminate Session
          </button>
        </div>
      </Modal>

      {updateMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-500">
          <div className={cn("w-2 h-2 rounded-full", updateMsg.type === 'success' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500 shadow-[0_0_8px_#f43f5e]")} />
          <span className="text-[10px] font-black uppercase tracking-widest">{updateMsg.text}</span>
        </div>
      )}
    </div>
  );
}
