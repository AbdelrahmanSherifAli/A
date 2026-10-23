"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  BookOpen,
  Image as ImageIcon,
  Mic,
  Film,
  Plus,
  Heart,
  MapPin,
  Sparkles,
  Music,
  Play,
  Pause,
  Filter,
  X,
  ExternalLink,
} from "lucide-react";
import Portal from "@/components/Portal";

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

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  eventDate: string;
  category: string;
  location?: string | null;
  photos?: string | null;
  songUrl?: string | null;
  author: {
    name: string;
    nickname?: string | null;
    avatarUrl?: string | null;
  };
}

interface OurStorySectionProps {
  onOpenAddMemory: () => void;
}

export default function OurStorySection({ onOpenAddMemory }: OurStorySectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "timeline" | "memories" | "photos" | "voice" | "videos"
  >("timeline");

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [timelineRes, memoriesRes] = await Promise.all([
        fetch("/api/timeline").then((r) => r.json()),
        fetch("/api/memories").then((r) => r.json()),
      ]);
      if (timelineRes.events) setTimelineEvents(timelineRes.events);
      if (memoriesRes.memories) setMemories(memoriesRes.memories);
    } catch (err) {
      console.error("OurStory loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Collect all photos
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

  timelineEvents.forEach((t) => {
    try {
      if (t.photos) {
        const parsed = JSON.parse(t.photos);
        parsed.forEach((url: string) => {
          if (!allPhotos.some((p) => p.url === url)) {
            allPhotos.push({
              url,
              title: t.title,
              date: new Date(t.eventDate).toLocaleDateString(),
            });
          }
        });
      }
    } catch {}
  });

  const voiceMemories = memories.filter((m) => m.audioUrl);
  const videoMemories = memories.filter((m) => m.videoUrl);

  const years = Array.from(new Set(timelineEvents.map((e) => e.year))).sort((a, b) => b - a);
  const filteredEvents = selectedYear
    ? timelineEvents.filter((e) => e.year === selectedYear)
    : timelineEvents;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2.5 max-w-xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 text-xs font-sans text-accent-primary uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Our Chronicles</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-ink-primary font-normal tracking-tight">
          Our Shared Story
        </h2>
        <p className="text-xs sm:text-sm text-ink-secondary font-sans leading-relaxed">
          A living scrapbook of every milestone, photo, and unforgettable memory we share together.
        </p>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: "timeline", label: `Timeline (${timelineEvents.length})`, desc: "Step-by-step milestones of our love journey", icon: Calendar },
            { id: "memories", label: `Memories (${memories.length})`, desc: "Saved stories and date memories", icon: Heart },
            { id: "photos", label: `Photo Wall (${allPhotos.length})`, desc: "Full gallery of our uploaded couple pictures", icon: ImageIcon },
            { id: "voice", label: `Voice Notes (${voiceMemories.length})`, desc: "Saved voice messages and audio moments", icon: Mic },
            { id: "videos", label: `Video Diary (${videoMemories.length})`, desc: "Video clips and live memories", icon: Film },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                title={tab.desc}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-accent-primary text-[#FAF5F0] shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary bg-canvas-elevated hover:bg-canvas-card border border-canvas-border"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenAddMemory}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full quiet-btn-primary text-xs shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save a Moment ♡</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: TIMELINE */}
      {activeSubTab === "timeline" && (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Year filters */}
          {years.length > 0 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setSelectedYear(null)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedYear === null
                    ? "bg-accent-primary text-[#FAF5F0]"
                    : "text-ink-muted hover:text-ink-primary bg-canvas-elevated"
                }`}
              >
                All Years
              </button>
              {years.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedYear === yr
                      ? "bg-accent-primary text-[#FAF5F0]"
                      : "text-ink-muted hover:text-ink-primary bg-canvas-elevated"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="quiet-card p-10 text-center space-y-3 max-w-md mx-auto">
              <Sparkles className="w-8 h-8 text-accent-primary/60 mx-auto stroke-1" />
              <h4 className="font-serif text-2xl text-ink-primary font-normal">
                Your story is just beginning. ♡
              </h4>
              <p className="text-ink-secondary text-xs font-serif italic leading-relaxed">
                Every love story starts with a first moment. Record your first conversation, coffee date, or little glance.
              </p>
              <button
                onClick={onOpenAddMemory}
                className="px-5 py-2.5 quiet-btn-primary text-xs"
              >
                Record Our First Memory ♡
              </button>
            </div>
          ) : (
            <div className="relative border-l border-canvas-border ml-4 sm:ml-28 space-y-10 py-4">
              {filteredEvents.map((event) => {
                let photos: string[] = [];
                try {
                  if (event.photos) photos = JSON.parse(event.photos);
                } catch {}

                const dateFormatted = new Date(event.eventDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div key={event.id} className="relative pl-6 sm:pl-8 group">
                    {/* Node Dot */}
                    <div className="absolute -left-[7px] top-2 w-3.5 h-3.5 rounded-full bg-stone-bg dark:bg-charcoal-bg border-2 border-accent-primary group-hover:scale-125 transition-all" />

                    {/* Date label */}
                    <div className="sm:absolute sm:-left-28 sm:top-1.5 text-xs font-mono text-ink-muted mb-1 sm:mb-0 sm:text-right sm:w-20">
                      {dateFormatted}, {event.year}
                    </div>

                    {/* Event Card */}
                    <div className="quiet-card p-6 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-sans tracking-wider px-2.5 py-0.5 rounded-full bg-canvas-elevated text-accent-primary border border-canvas-border">
                          {event.category}
                        </span>
                        {event.location && (
                          <span className="text-xs text-ink-muted flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-accent-primary" />
                            <span>{event.location}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-2xl text-ink-primary font-normal">
                        {event.title}
                      </h3>

                      <p className="font-serif italic text-sm text-ink-secondary leading-relaxed">
                        &ldquo;{event.description}&rdquo;
                      </p>

                      {photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                          {photos.map((url, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedPhoto(url)}
                              className="aspect-square rounded-xl overflow-hidden border border-canvas-border cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              <img src={url} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-ink-muted font-sans pt-2 border-t border-canvas-border/50 flex items-center justify-between">
                        <span>Recorded by {event.author.name}</span>
                        {event.songUrl && (
                          <a
                            href={event.songUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-primary hover:underline flex items-center space-x-1"
                          >
                            <Music className="w-3 h-3" />
                            <span>Soundtrack</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: MEMORIES ARCHIVE */}
      {activeSubTab === "memories" && (
        <div className="space-y-6">
          {memories.length === 0 ? (
            <div className="quiet-card p-10 text-center space-y-3 max-w-md mx-auto">
              <p className="font-serif text-2xl text-ink-primary font-normal">
                No memories archived yet. ♡
              </p>
              <p className="text-xs text-ink-secondary font-serif italic">
                Save messages from your chat, fulfill plans, or create an entry directly.
              </p>
              <button
                onClick={onOpenAddMemory}
                className="px-5 py-2.5 quiet-btn-primary text-xs"
              >
                Add First Memory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memories.map((m) => {
                let photos: string[] = [];
                try {
                  if (m.photos) photos = JSON.parse(m.photos);
                } catch {}

                return (
                  <div
                    key={m.id}
                    className="quiet-card p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {photos.length > 0 && (
                        <div
                          onClick={() => setSelectedPhoto(photos[0])}
                          className="h-48 w-full rounded-xl overflow-hidden border border-canvas-border cursor-pointer"
                        >
                          <img
                            src={photos[0]}
                            alt={m.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-ink-muted">
                        <span className="font-mono">
                          {new Date(m.memoryDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {m.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-accent-primary" />
                            <span>{m.location}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif text-xl text-ink-primary font-normal">{m.title}</h4>
                      <p className="font-serif italic text-xs sm:text-sm text-ink-secondary leading-relaxed">
                        &ldquo;{m.description}&rdquo;
                      </p>

                      {m.audioUrl && (
                        <div className="p-2.5 rounded-xl bg-canvas-elevated border border-canvas-border flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-ink-primary">
                            <Mic className="w-4 h-4 text-accent-primary" />
                            <span>Voice Memory</span>
                          </div>
                          <button
                            onClick={() =>
                              setPlayingAudioId(playingAudioId === m.id ? null : m.id)
                            }
                            className="w-7 h-7 rounded-full bg-accent-primary text-white flex items-center justify-center"
                          >
                            {playingAudioId === m.id ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-canvas-border/50 flex items-center justify-between text-[11px] font-sans text-ink-muted">
                      <span>By {m.author.name}</span>
                      {m.mood && <span className="capitalize text-accent-primary">♡ {m.mood}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: PHOTO WALL */}
      {activeSubTab === "photos" && (
        <div className="space-y-6">
          {allPhotos.length === 0 ? (
            <div className="quiet-card p-10 text-center space-y-2 max-w-md mx-auto">
              <ImageIcon className="w-8 h-8 text-accent-primary/60 mx-auto" />
              <p className="font-serif text-xl text-ink-primary font-normal">Our Photo Wall is waiting. 📷</p>
              <p className="text-xs text-ink-muted font-serif italic">
                Every photo attached to your memories will appear here in a gallery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(photo.url)}
                  className="aspect-square rounded-2xl overflow-hidden border border-canvas-border group relative cursor-pointer"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <p className="font-serif text-xs text-white truncate">{photo.title}</p>
                    <span className="text-[10px] text-white/75 font-mono">{photo.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: VOICE DIARY */}
      {activeSubTab === "voice" && (
        <div className="max-w-2xl mx-auto space-y-4">
          {voiceMemories.length === 0 ? (
            <div className="quiet-card p-10 text-center space-y-2">
              <Mic className="w-8 h-8 text-accent-primary/60 mx-auto" />
              <p className="font-serif text-xl text-ink-primary font-normal">No voice memories recorded yet. 🎙️</p>
              <p className="text-xs text-ink-muted font-serif italic">
                Record your voice or attach an audio clip when adding a memory to preserve the tone of your laughter and words.
              </p>
            </div>
          ) : (
            voiceMemories.map((m) => (
              <div
                key={m.id}
                className="quiet-card p-5 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="font-serif text-lg text-ink-primary font-normal">{m.title}</h4>
                  <p className="text-xs text-ink-muted font-serif italic">
                    {new Date(m.memoryDate).toLocaleDateString()} — {m.author.name}
                  </p>
                </div>
                <audio controls className="h-9 w-48 sm:w-64 rounded-xl opacity-90">
                  <source src={m.audioUrl!} type="audio/mpeg" />
                </audio>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBTAB 5: VIDEO DIARY */}
      {activeSubTab === "videos" && (
        <div className="max-w-4xl mx-auto space-y-6">
          {videoMemories.length === 0 ? (
            <div className="quiet-card p-10 text-center space-y-2">
              <Film className="w-8 h-8 text-accent-primary/60 mx-auto" />
              <p className="font-serif text-xl text-ink-primary font-normal">No video moments attached yet. 🎬</p>
              <p className="text-xs text-ink-muted font-serif italic">
                Attach short video clips to your memories to relive those moving moments together.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoMemories.map((m) => (
                <div key={m.id} className="quiet-card p-5 space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black border border-canvas-border">
                    <video controls className="w-full h-full object-cover">
                      <source src={m.videoUrl!} type="video/mp4" />
                    </video>
                  </div>
                  <h4 className="font-serif text-lg text-ink-primary font-normal">{m.title}</h4>
                  <p className="text-xs text-ink-secondary font-serif italic">{m.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {selectedPhoto && (
        <Portal>
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in cursor-pointer"
          >
            <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 text-white hover:text-accent-secondary bg-black/60 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedPhoto}
                alt="Enlarged memory"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-white/10 shadow-2xl"
              />
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
