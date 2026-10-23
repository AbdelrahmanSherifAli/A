"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, X, MapPin, Music, Calendar, Heart, RefreshCw } from "lucide-react";
import Portal from "@/components/Portal";

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SurpriseMeModal({ isOpen, onClose }: SurpriseMeModalProps) {
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRandomMemory = () => {
    setLoading(true);
    fetch("/api/memories?surprise=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.memory) {
          setMemory(data.memory);
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.5 },
            colors: ["#9A6660", "#B7897E", "#E8DED5"],
          });
        }
      })
      .catch((err) => console.error("Surprise memory error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchRandomMemory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  let photos: string[] = [];
  try {
    if (memory?.photos) photos = JSON.parse(memory.photos);
  } catch {}

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-xl quiet-card p-6 sm:p-8 space-y-5 bg-canvas-card">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-ink-muted hover:text-ink-primary transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-canvas-elevated border border-canvas-border text-accent-primary text-[11px] font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Surprise Rediscovered</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl text-ink-primary font-normal">
            Remember This Day?
          </h3>
          <p className="text-xs text-ink-muted font-sans max-w-sm mx-auto">
            Tap whenever you miss me for a random love note, date idea, or sweet memory ♡
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-ink-muted text-xs font-serif italic">
            Searching our universe for a surprise...
          </div>
        ) : memory ? (
          <div className="space-y-4">
            {photos.length > 0 && (
              <div className="relative h-60 w-full rounded-2xl overflow-hidden border border-canvas-border">
                <img src={photos[0]} alt={memory.title} className="w-full h-full object-cover" />
                {memory.location && (
                  <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs text-white">
                    <MapPin className="w-3.5 h-3.5 text-accent-primary" />
                    <span>{memory.location}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5 text-center">
              <span className="text-[11px] text-ink-muted font-mono">
                {new Date(memory.memoryDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <h4 className="font-serif text-2xl text-ink-primary font-normal">
                {memory.title}
              </h4>
              <p className="font-serif italic text-xs sm:text-sm text-ink-secondary leading-relaxed pt-0.5">
                &ldquo;{memory.description}&rdquo;
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center space-x-3 pt-3 border-t border-canvas-border/50">
              <button
                onClick={fetchRandomMemory}
                className="flex items-center space-x-1.5 px-4 py-2 quiet-btn-outline text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Another Surprise</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 quiet-btn-primary text-xs"
              >
                Close &amp; Cherish
              </button>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-ink-muted text-xs font-serif italic">
            Your story is just beginning. Save a moment to enable surprise memories!
          </div>
        )}
      </div>
    </div>
    </Portal>
  );
}
