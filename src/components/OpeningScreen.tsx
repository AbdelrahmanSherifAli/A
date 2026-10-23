"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface OpeningScreenProps {
  onEnter?: () => void;
}

export default function OpeningScreen({ onEnter }: OpeningScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if intro has already been viewed in this session
    const hasSeen = sessionStorage.getItem("an_intro_seen_v3");
    if (!hasSeen) {
      setIsVisible(true);
    }

    const handleReplay = () => {
      setIsFading(false);
      setIsVisible(true);
    };
    window.addEventListener("replay_intro", handleReplay);
    return () => window.removeEventListener("replay_intro", handleReplay);
  }, []);

  const handleEnter = () => {
    setIsFading(true);
    sessionStorage.setItem("an_intro_seen_v3", "true");
    setTimeout(() => {
      setIsVisible(false);
      onEnter?.();
    }, 600);
  };

  // Allow pressing Enter key to enter
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center select-none transition-all duration-700 ease-in-out ${
        isFading
          ? "opacity-0 backdrop-blur-none pointer-events-none"
          : "opacity-100 backdrop-blur-2xl bg-black/45"
      }`}
    >
      {/* Soft atmospheric middle ambient vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

      {/* Clean, minimalist frosted content box */}
      <div className="relative z-10 max-w-md w-full mx-auto px-6 py-12 text-center flex flex-col items-center justify-center space-y-7 animate-fade-in">
        
        {/* Subtle Semi-Transparent Tag */}
        <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] tracking-[0.3em] uppercase text-stone-200 font-sans shadow-sm">
          <span>Our Sanctuary</span>
          <span className="text-[#EF4444] text-[9px]">♡</span>
          <span className="text-[#D4A853] font-medium">A &amp; N</span>
        </div>

        {/* Names Header - Elegant Serif Floating Over Glass */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#FAF5F0] font-normal tracking-wide leading-tight drop-shadow-md">
            Abdelrahman <span className="text-[#D4A853] font-serif italic text-2xl sm:text-3xl">&amp;</span> Nour
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-stone-300 tracking-wide drop-shadow-sm">
            &ldquo;Together is our favorite place to be.&rdquo;
          </p>
        </div>

        {/* Minimal Subtle Glass Divider */}
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent my-1" />

        {/* Clean Frosted Glass Pill Enter Button */}
        <div className="pt-1">
          <button
            onClick={handleEnter}
            autoFocus
            className="group relative px-7 py-3 rounded-full border border-white/25 bg-white/15 hover:bg-white/25 hover:border-white/50 text-[#FAF5F0] hover:text-white backdrop-blur-md text-xs font-sans tracking-[0.2em] uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-black/20 flex items-center space-x-2.5"
          >
            <span>Enter Our Space</span>
            <Heart className="w-3 h-3 text-[#EF4444] fill-[#EF4444] group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Discrete hint */}
        <p className="text-[10px] text-stone-400/90 font-sans tracking-wider drop-shadow-xs">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-[9px] text-stone-300 font-mono">Enter</kbd> to open
        </p>
      </div>
    </div>
  );
}
