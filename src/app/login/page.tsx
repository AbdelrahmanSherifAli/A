"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Heart, ArrowRight, Shield } from "lucide-react";

export default function LoginPage() {
  const [selectedEmail, setSelectedEmail] = useState<string>("abdel@ourstory.private");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(selectedEmail, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || "Incorrect password. Please try again.");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0B0D12] text-[#F3F4F6] transition-colors duration-300">
      {/* Scenic Atmosphere Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4A853]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md quiet-card rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 space-y-7 animate-fade-in border border-white/10 bg-[#12151D]/80 backdrop-blur-2xl">
        {/* Monogram & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 flex items-center justify-center text-[#D4A853] font-serif font-bold text-lg shadow-[0_0_15px_rgba(212,168,83,0.2)]">
            A&amp;N
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-medium tracking-tight">
            Our Space
          </h1>
          <p className="text-xs text-stone-400 font-serif italic">
            Just us — our private universe.
          </p>
        </div>

        {/* Account Selector (Abdel & Nour) */}
        <div className="space-y-2.5">
          <label className="block text-center text-[10px] font-mono uppercase tracking-widest text-stone-400">
            Select Your Profile
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedEmail("abdel@ourstory.private");
                setError(null);
              }}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center space-y-2 text-center ${
                selectedEmail === "abdel@ourstory.private"
                  ? "bg-[#D4A853]/15 border-[#D4A853]/50 shadow-[0_0_15px_rgba(212,168,83,0.2)]"
                  : "bg-white/[0.04] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 bg-stone-900 shadow-sm">
                <img
                  src="/assets/avatar_abdel.jpg"
                  alt="Abdel"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Abdel</div>
                <div className="text-[10px] text-stone-400 font-mono">abdel@...</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedEmail("nour@ourstory.private");
                setError(null);
              }}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center space-y-2 text-center ${
                selectedEmail === "nour@ourstory.private"
                  ? "bg-[#D4A853]/15 border-[#D4A853]/50 shadow-[0_0_15px_rgba(212,168,83,0.2)]"
                  : "bg-white/[0.04] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 bg-stone-900 shadow-sm">
                <img
                  src="/assets/avatar_nour.jpg"
                  alt="Nour"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Nour</div>
                <div className="text-[10px] text-stone-400 font-mono">nour@...</div>
              </div>
            </button>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-stone-300 mb-1.5 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="quiet-input w-full pr-10 py-2.5 px-3.5 text-sm bg-black/40 border border-white/10 text-white placeholder-stone-500 rounded-xl focus:border-[#D4A853] focus:outline-none"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-[10px] text-stone-500 font-mono pt-1">
              Default password: love2024
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 text-center animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full quiet-btn-primary py-3 px-5 text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{submitting ? "Opening Sanctuary..." : "Enter Our Space ♡"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Bottom Privacy Notice */}
        <div className="pt-2 text-center text-[11px] text-stone-500 font-mono flex items-center justify-center space-x-1.5">
          <Shield className="w-3 h-3 text-[#D4A853]/80" />
          <span>Strictly Private • Two Authorized Souls</span>
        </div>
      </div>
    </div>
  );
}
