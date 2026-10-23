"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import TodaySpace from "@/components/TodaySpace";
import CoupleChat from "@/components/CoupleChat";
import DiscoverSection from "@/components/DiscoverSection";
import OurStorySection from "@/components/OurStorySection";
import PlansSection from "@/components/PlansSection";
import UsSection from "@/components/UsSection";
import LettersSection from "@/components/LettersSection";
import PrivateVaultModal from "@/components/PrivateVaultModal";
import SurpriseMeModal from "@/components/SurpriseMeModal";
import AddMemoryModal from "@/components/AddMemoryModal";
import SettingsModal from "@/components/SettingsModal";
import OpeningScreen from "@/components/OpeningScreen";
import { Menu } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("home");
  const [isDark, setIsDark] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals
  const [vaultOpen, setVaultOpen] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [addMemoryOpen, setAddMemoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Initialize theme from localStorage - Default to DARK romantic sanctuary!
  useEffect(() => {
    const savedTheme = localStorage.getItem("ourspace_theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("ourspace_theme", "dark");
    }
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ourspace_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ourspace_theme", "light");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-stone-bg dark:bg-charcoal-bg">
        <div className="w-10 h-10 rounded-full border-2 border-accent-primary/30 border-t-accent-primary animate-spin" />
        <p className="font-serif text-ink-secondary text-base italic tracking-wide">
          Entering our space...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex text-ink-primary transition-colors duration-500 relative selection:bg-[#C29352]/30">
      {/* Minimalist Quiet Luxury Opening Screen */}
      <OpeningScreen />

      {/* 1:1 Fixed Atmospheric Wallpaper Matching Mockup */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src="/assets/home_full_wallpaper.jpg"
          alt="Sanctuary Aesthetic Wallpaper"
          className="w-full h-full object-cover object-top filter brightness-[0.98]"
        />
        {/* Soft overlay matching mockup */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/35" />
      </div>

      {/* 240px Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenVault={() => setVaultOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onSurpriseMe={() => setSurpriseOpen(true)}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Fluid Content Area */}
      <div className={`flex-1 md:pl-[240px] flex flex-col ${activeTab === "chat" ? "h-screen overflow-hidden" : "min-h-screen"}`}>
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-canvas-border bg-canvas-card sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <span className="text-accent-primary text-base">♡</span>
            <span className="font-serif text-lg font-medium text-ink-primary">Our Space</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-canvas-elevated"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Tab Content */}
        <main className={`flex-1 ${activeTab === "chat" ? "h-full overflow-hidden flex flex-col" : "pb-24 md:pb-12"}`}>
          {activeTab === "home" && (
            <TodaySpace
              onNavigateTab={(t) => setActiveTab(t)}
              onSurpriseMe={() => setSurpriseOpen(true)}
              onOpenAddMemory={() => setAddMemoryOpen(true)}
              onOpenVault={() => setVaultOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          )}

          {activeTab === "chat" && (
            <CoupleChat />
          )}

          {activeTab === "story" && (
            <OurStorySection onOpenAddMemory={() => setAddMemoryOpen(true)} />
          )}

          {activeTab === "plans" && (
            <PlansSection onNavigateToStory={() => setActiveTab("story")} />
          )}

          {activeTab === "discover" && <DiscoverSection />}

          {activeTab === "us" && <UsSection />}

          {activeTab === "letters" && (
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6">
              <LettersSection />
            </div>
          )}
        </main>
      </div>

      {/* Shared Sanctuary Modals */}
      <PrivateVaultModal isOpen={vaultOpen} onClose={() => setVaultOpen(false)} />
      <SurpriseMeModal isOpen={surpriseOpen} onClose={() => setSurpriseOpen(false)} />
      <AddMemoryModal
        isOpen={addMemoryOpen}
        onClose={() => setAddMemoryOpen(false)}
        onMemoryAdded={() => {
          window.location.reload();
        }}
      />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
