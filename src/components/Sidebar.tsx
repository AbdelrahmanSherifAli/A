"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  MessageCircle,
  BookOpen,
  CalendarCheck,
  Sparkles,
  Heart,
  Mail,
  MoreHorizontal,
  Sun,
  Moon,
  Lock,
  Settings,
  Gift,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenVault: () => void;
  onOpenSettings: () => void;
  onSurpriseMe: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isDark,
  onToggleTheme,
  onOpenVault,
  onOpenSettings,
  onSurpriseMe,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const { user, partner, logout } = useAuth();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", description: "Today's overview & song", icon: Home },
    { id: "chat", label: "Chat", description: "Private messaging & voice", icon: MessageCircle, hasBadge: true },
    { id: "story", label: "Our Story", description: "Photos & timeline", icon: BookOpen },
    { id: "plans", label: "Plans", description: "Dates & bucket list", icon: CalendarCheck },
    { id: "discover", label: "Discover", description: "Love quizzes & games", icon: Sparkles },
    { id: "us", label: "Us", description: "Our stats & milestones", icon: Heart },
    { id: "letters", label: "Letters", description: "Sealed love envelopes", icon: Mail },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
    setMoreMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] text-[#F3F4F6] border-r border-white/10 flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 select-none shadow-2xl bg-black/40 backdrop-blur-3xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="relative z-10 space-y-6">
          {/* Logo & Branding */}
          <div className="flex items-center justify-between px-1">
            <div
              onClick={() => handleSelectTab("home")}
              className="cursor-pointer group flex items-start space-x-2.5"
            >
              <span className="text-[#EF4444] text-base font-serif leading-none mt-0.5">
                ♡
              </span>
              <div>
                <h1 className="font-serif text-xl tracking-wide text-white group-hover:text-[#D4A853] transition-colors">
                  Our Space
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-[11px] text-stone-400 font-sans">Just us</p>
                  <div className="flex h-[2.5px] w-9 rounded-full overflow-hidden shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                    <div className="w-1/3 bg-[#2563EB]" />
                    <div className="w-1/3 bg-white" />
                    <div className="w-1/3 bg-[#EF4444]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={`${item.label} — ${item.description}`}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-[#D4A853]/15 text-white border border-[#D4A853]/25 shadow-[0_0_12px_rgba(212,168,83,0.15)]"
                      : "text-stone-300 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-[17px] h-[17px] stroke-[1.75] shrink-0 ${
                        isActive ? "text-[#D4A853]" : "text-stone-400"
                      }`}
                    />
                    <div className="text-left leading-tight">
                      <div className="text-[13px] font-medium">{item.label}</div>
                      <div className="text-[10px] text-stone-400 font-sans font-normal opacity-80">{item.description}</div>
                    </div>
                  </div>

                  {item.hasBadge && (
                    <span className="w-2 h-2 rounded-full bg-[#27AE60] shadow-[0_0_6px_rgba(39,174,96,0.6)] shrink-0" />
                  )}
                </button>
              );
            })}

            {/* More Menu Trigger */}
            <div className="relative pt-1">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  moreMenuOpen
                    ? "bg-[#D4A853]/15 text-white border border-[#D4A853]/25"
                    : "text-stone-300 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <MoreHorizontal className="w-[17px] h-[17px] text-stone-400 stroke-[1.75]" />
                <div className="text-left leading-tight">
                  <div>More</div>
                  <div className="text-[10px] text-stone-400 font-sans font-normal opacity-80">Vault, surprise &amp; settings</div>
                </div>
              </button>

              {/* More Dropdown Menu */}
              {moreMenuOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-full bg-[#12151D]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl space-y-1 text-xs animate-fade-in">
                  <button
                    onClick={() => {
                      onOpenVault();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.08] transition-colors text-left"
                  >
                    <Lock className="w-4 h-4 text-[#D4A853] shrink-0" />
                    <div>
                      <div className="font-medium">Private Vault</div>
                      <div className="text-[10px] text-stone-400">Passcode-locked photos</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSurpriseMe();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.08] transition-colors text-left"
                  >
                    <Gift className="w-4 h-4 text-[#D4A853] shrink-0" />
                    <div>
                      <div className="font-medium">Surprise Me</div>
                      <div className="text-[10px] text-stone-400">Random sweet note or idea</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setMoreMenuOpen(false);
                      window.dispatchEvent(new CustomEvent("replay_intro"));
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.08] transition-colors text-left"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4A853] shrink-0" />
                    <div>
                      <div className="font-medium">Replay Intro</div>
                      <div className="text-[10px] text-stone-400">Opening screen</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSettings();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/[0.08] transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-stone-400 shrink-0" />
                    <div>
                      <div className="font-medium">Settings</div>
                      <div className="text-[10px] text-stone-400">Anniversary &amp; names</div>
                    </div>
                  </button>

                  <div className="h-px bg-white/10 my-1" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-medium">Sign Out</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Section: Completely Transparent to reveal the background flowers */}
        <div className="relative z-10 space-y-4 pt-4 border-t border-white/[0.06]">
          {/* Handwritten Quote */}
          <div className="text-center">
            <p className="font-script text-base text-stone-200/90 italic tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              &ldquo;A better us, every day.&rdquo;
            </p>
          </div>

          {/* Theme Toggle Pill: Soft glass pill instead of opaque solid */}
          <div className="flex items-center justify-between bg-black/35 backdrop-blur-md p-1.5 rounded-full border border-white/15 shadow-md">
            <button
              onClick={() => isDark && onToggleTheme()}
              className={`flex-1 flex items-center justify-center py-1 rounded-full text-xs transition-all ${
                !isDark
                  ? "bg-white/20 text-[#D4A853] shadow-sm font-medium"
                  : "text-stone-300 hover:text-white"
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => !isDark && onToggleTheme()}
              className={`flex-1 flex items-center justify-center py-1 rounded-full text-xs transition-all ${
                isDark
                  ? "bg-white/20 text-[#D4A853] shadow-sm font-medium"
                  : "text-stone-300 hover:text-white"
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Couple Avatar Badge */}
          <div className="flex items-center space-x-3 pt-1">
            <div className="flex -space-x-2 shrink-0">
              <img
                src="/assets/avatar_abdel.jpg"
                alt="Abdel"
                className="w-7 h-7 rounded-full object-cover border border-white/20 shadow-md"
              />
              <img
                src="/assets/avatar_nour.jpg"
                alt="Nour"
                className="w-7 h-7 rounded-full object-cover border border-white/20 shadow-md"
              />
            </div>
            <div className="overflow-hidden">
              <p className="font-script text-xs text-stone-200 truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Same sky, Same us. <span className="text-[#EF4444]">♡</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E1117]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-2 flex items-center justify-around md:hidden">
        {[
          { id: "home", label: "Home", icon: Home },
          { id: "chat", label: "Chat", icon: MessageCircle },
          { id: "story", label: "Story", icon: BookOpen },
          { id: "plans", label: "Plans", icon: CalendarCheck },
          { id: "us", label: "Us", icon: Heart },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-0.5 py-1 px-2.5 rounded-xl transition-all ${
                isActive ? "text-[#D4A853]" : "text-stone-400"
              }`}
            >
              <Icon className="w-4 h-4 stroke-[1.75]" />
              <span className="text-[10px] font-sans">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
