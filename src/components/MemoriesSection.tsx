"use client";

import React, { useEffect, useState } from "react";
import { Plus, Image as ImageIcon, Mic, Film, Sparkles, MapPin, Tag, Heart, Music, Play, Pause } from "lucide-react";

interface MemoryItem {
  id: string;
  title: string;
  description: string;
  memoryDate: string;
  location?: string | null;
  mood?: string | null;
  tags?: string | null;
  photos?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  songTitle?: string | null;
  songArtist?: string | null;
  author: {
    name: string;
    avatarUrl?: string | null;
  };
}

interface MemoriesSectionProps {
  onOpenAddMemory: () => void;
}

export default function MemoriesSection({ onOpenAddMemory }: MemoriesSectionProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"all" | "photos" | "voice" | "little_things">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Little things state (saved in local memory or database)
  const [littleThings, setLittleThings] = useState([
    { id: "1", note: "She loves her flat white with oat milk and never adds sugar.", author: "Abdel" },
    { id: "2", note: "He gets secretly nervous before important work presentations and checks his watch three times.", author: "Nour" },
    { id: "3", note: "Her laughter is loudest when she watches silly golden retriever videos.", author: "Abdel" },
    { id: "4", note: "He always places his arm around me automatically whenever we wait for an elevator.", author: "Nour" },
  ]);
  const [newLittleThing, setNewLittleThing] = useState("");

  useEffect(() => {
    fetch("/api/memories")
      .then((res) => res.json())
      .then((data) => {
        if (data.memories) {
          setMemories(data.memories);
        }
      })
      .catch((err) => console.error("Error fetching memories:", err));
  }, []);

  const handleAddLittleThing = () => {
    if (!newLittleThing.trim()) return;
    setLittleThings([
      ...littleThings,
      { id: String(Date.now()), note: newLittleThing.trim(), author: "Us" },
    ]);
    setNewLittleThing("");
  };

  // Collect all photos for photo wall
  const allPhotos: { url: string; title: string; date: string }[] = [];
  memories.forEach((m) => {
    try {
      if (m.photos) {
        const parsed = JSON.parse(m.photos);
        parsed.forEach((url: string) => {
          allPhotos.push({
            url,
            title: m.title,
            date: new Date(m.memoryDate).toLocaleDateString(),
          });
        });
      }
    } catch {}
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-gold-400">
          Digital Archive
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-gold-100">
          Memories & Moments
        </h2>
        <p className="text-cashmere/80 font-serif italic text-sm sm:text-base max-w-lg mx-auto">
          Preserving both life-changing milestones and the quiet, everyday moments.
        </p>

        {/* Sub Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setActiveSubTab("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSubTab === "all"
                ? "bg-gold-400/20 text-gold-100 border border-gold-400/30 shadow-gold"
                : "text-cashmere/70 hover:text-gold-200 bg-espresso-800/60"
            }`}
          >
            All Memories ({memories.length})
          </button>
          <button
            onClick={() => setActiveSubTab("photos")}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSubTab === "photos"
                ? "bg-gold-400/20 text-gold-100 border border-gold-400/30 shadow-gold"
                : "text-cashmere/70 hover:text-gold-200 bg-espresso-800/60"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photo Wall ({allPhotos.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("little_things")}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSubTab === "little_things"
                ? "bg-gold-400/20 text-gold-100 border border-gold-400/30 shadow-gold"
                : "text-cashmere/70 hover:text-gold-200 bg-espresso-800/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-300" />
            <span>Little Things I Remember</span>
          </button>
          <button
            onClick={onOpenAddMemory}
            className="flex items-center space-x-1 px-4 py-1.5 rounded-full bg-gold-500/20 hover:bg-gold-500/30 border border-gold-400/40 text-gold-200 text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Memory</span>
          </button>
        </div>
      </div>

      {/* 1. All Memories Grid */}
      {activeSubTab === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((m) => {
            let photos: string[] = [];
            try {
              if (m.photos) photos = JSON.parse(m.photos);
            } catch {}

            return (
              <div
                key={m.id}
                className="luxury-glass-card rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  {photos.length > 0 && (
                    <div
                      onClick={() => setSelectedPhoto(photos[0])}
                      className="h-48 w-full rounded-2xl overflow-hidden border border-gold-400/20 relative cursor-pointer group/img"
                    >
                      <img
                        src={photos[0]}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      {m.mood && (
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-espresso-900/80 backdrop-blur-md border border-gold-400/30 text-[10px] uppercase font-mono text-gold-200">
                          {m.mood}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-[11px] font-mono text-gold-400/70">
                      {new Date(m.memoryDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <h3 className="font-serif text-xl text-gold-100 font-medium leading-snug">
                      {m.title}
                    </h3>
                  </div>

                  <p className="font-serif italic text-xs sm:text-sm text-cashmere/85 line-clamp-3 leading-relaxed">
                    &ldquo;{m.description}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-gold-400/10 flex items-center justify-between text-xs text-cashmere/60">
                  {m.location ? (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      <span>{m.location}</span>
                    </div>
                  ) : (
                    <span>By {m.author.name}</span>
                  )}
                  {m.songTitle && (
                    <div className="flex items-center space-x-1 text-gold-300">
                      <Music className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{m.songTitle}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Photo Wall */}
      {activeSubTab === "photos" && (
        <div className="space-y-6">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {allPhotos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhoto(photo.url)}
                className="break-inside-avoid relative rounded-2xl overflow-hidden border border-gold-400/20 cursor-pointer group shadow-intimate bg-espresso-900"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <div className="text-sm font-serif text-gold-100">{photo.title}</div>
                  <div className="text-[11px] font-mono text-cashmere/70">{photo.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Little Things I Remember */}
      {activeSubTab === "little_things" && (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Add a Little Thing Input */}
          <div className="luxury-glass-card rounded-2xl p-4 flex items-center space-x-3 border border-gold-400/20">
            <input
              type="text"
              placeholder="A tiny detail I notice and remember about you..."
              value={newLittleThing}
              onChange={(e) => setNewLittleThing(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddLittleThing()}
              className="flex-1 bg-transparent text-sm text-gold-100 placeholder:text-cashmere/50 focus:outline-none"
            />
            <button
              onClick={handleAddLittleThing}
              className="px-4 py-2 rounded-xl bg-gold-400/20 hover:bg-gold-400/30 text-gold-200 text-xs font-medium border border-gold-400/30 transition-all"
            >
              Remember This
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {littleThings.map((item) => (
              <div
                key={item.id}
                className="luxury-glass rounded-2xl p-5 border border-gold-400/15 relative space-y-2 hover:border-gold-400/30 transition-all"
              >
                <div className="flex items-center space-x-2 text-gold-400 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase">Little Thing</span>
                </div>
                <p className="font-serif italic text-sm text-cashmere/90 leading-relaxed">
                  &ldquo;{item.note}&rdquo;
                </p>
                <div className="text-right text-[11px] font-serif text-gold-300/60">
                  — {item.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-gold-400/30 shadow-2xl">
            <img src={selectedPhoto} alt="Full memory view" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
