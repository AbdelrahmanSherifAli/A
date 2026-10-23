"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  Heart,
  MessageCircle,
  Sparkles,
  Compass,
  BookOpen,
  CalendarCheck,
  Lock,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenVault: () => void;
  onOpenSettings: () => void;
  onSurpriseMe: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenVault,
  onOpenSettings,
  onSurpriseMe,
}: NavbarProps) {
  const { user, partner, logout } = useAuth();
  const { isPartnerOnline } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The 6 Main Navigation Pillars
  const navItems = [
    { id: "home", label: "Home", icon: Heart },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "discover", label: "Discover", icon: Sparkles },
    { id: "story", label: "Our Story", icon: BookOpen },
    { id: "plans", label: "Plans", icon: CalendarCheck },
    { id: "us", label: "Us", icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full luxury-glass border-b border-gold-400/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: Monogram */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => setActiveTab("home")}
        >
          <div className="w-10 h-10 rounded-full border border-gold-300/40 bg-espresso-800/80 flex items-center justify-center text-gold-200 font-serif font-semibold text-lg shadow-gold">
            A&amp;N
          </div>
          <div>
            <span className="font-serif text-xl tracking-wider text-gold-100 font-medium block leading-tight">
              Our Space
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gold-400/80 font-mono block">
              Private Universe
            </span>
          </div>
        </div>

        {/* Center: 6 Main Navigation Pillars */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-espresso-900/70 p-1.5 rounded-full border border-gold-400/15 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gold-400/20 text-gold-100 border border-gold-400/35 shadow-gold"
                    : "text-cashmere/75 hover:text-gold-200 hover:bg-espresso-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-gold-300" : "text-cashmere/60"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Action Controls */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Surprise Me Button */}
          <button
            onClick={onSurpriseMe}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-400/10 border border-gold-400/30 text-gold-200 text-xs font-medium hover:gold-glow transition-all"
            title="Surprise me with a moment"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-300" />
            <span>Surprise Me</span>
          </button>

          {/* Private Vault */}
          <button
            onClick={onOpenVault}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-espresso-800/80 hover:bg-espresso-700 border border-gold-400/20 text-gold-200 text-xs font-medium transition-all"
            title="Private Vault"
          >
            <Lock className="w-3.5 h-3.5 text-gold-400/80" />
            <span>Vault</span>
          </button>

          {/* User & Partner Avatars */}
          <div className="flex items-center space-x-2 pl-2 border-l border-gold-400/15">
            {partner && (
              <div
                className="relative group cursor-pointer"
                title={`${partner.name} (${isPartnerOnline ? "Online" : "Away"})`}
                onClick={() => setActiveTab("chat")}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gold-400/30 bg-espresso-700">
                  {partner.avatarUrl ? (
                    <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-serif text-gold-200">
                      {partner.name[0]}
                    </div>
                  )}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-espresso-950 ${
                    isPartnerOnline ? "bg-emerald-500 shadow-sm shadow-emerald-500" : "bg-neutral-600"
                  }`}
                />
              </div>
            )}

            {user && (
              <div
                className="relative cursor-pointer"
                onClick={onOpenSettings}
                title={`${user.name} (Settings)`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gold-400/50 bg-espresso-700 shadow-gold">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-serif text-gold-200">
                      {user.name[0]}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-full text-cashmere/70 hover:text-gold-200 hover:bg-espresso-800/60 transition-all"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              className="p-1.5 rounded-full text-cashmere/70 hover:text-rose-400 hover:bg-espresso-800/60 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={onSurpriseMe}
            className="p-2 rounded-full bg-gold-400/10 text-gold-200 border border-gold-400/20"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gold-200 hover:bg-espresso-800/70"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden luxury-glass border-b border-gold-400/20 px-4 pt-3 pb-5 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-gold-400/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gold-400/20 text-gold-100 border border-gold-400/30"
                      : "text-cashmere hover:bg-espresso-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 text-gold-300" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                onOpenVault();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-xs text-gold-200 px-3 py-2 rounded-lg bg-espresso-800 border border-gold-400/20"
            >
              <Lock className="w-3.5 h-3.5 text-gold-400" />
              <span>Private Vault</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 text-xs text-cashmere px-3 py-2 rounded-lg hover:bg-espresso-800"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center space-x-2 text-xs text-rose-400 px-3 py-2 rounded-lg hover:bg-espresso-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
