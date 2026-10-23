"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  MapPin,
  Music,
  Compass,
  CheckSquare,
  Target,
  Smile,
  Heart,
  Plus,
  Star,
  ExternalLink,
  Calendar,
} from "lucide-react";

export default function SharedWorld() {
  const [activeTab, setActiveTab] = useState<
    "places" | "songs" | "firsts" | "bucket_list" | "goals" | "jokes" | "reasons"
  >("places");

  const [places, setPlaces] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [firsts, setFirsts] = useState<any[]>([]);
  const [bucketList, setBucketList] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [jokes, setJokes] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);

  // Input states for quick additions
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemExtra, setNewItemExtra] = useState("");

  const loadData = () => {
    fetch("/api/places").then((res) => res.json()).then((d) => d.places && setPlaces(d.places));
    fetch("/api/songs").then((res) => res.json()).then((d) => d.songs && setSongs(d.songs));
    fetch("/api/firsts").then((res) => res.json()).then((d) => d.firsts && setFirsts(d.firsts));
    fetch("/api/bucket-list").then((res) => res.json()).then((d) => d.items && setBucketList(d.items));
    fetch("/api/goals").then((res) => res.json()).then((d) => d.goals && setGoals(d.goals));
    fetch("/api/jokes").then((res) => res.json()).then((d) => d.jokes && setJokes(d.jokes));
    fetch("/api/reasons").then((res) => res.json()).then((d) => d.reasons && setReasons(d.reasons));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle Bucket List completion with celebratory confetti!
  const handleToggleBucket = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    if (nextStatus) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#c7a066", "#e8d7b8", "#9c4857"],
      });
    }

    try {
      const res = await fetch("/api/bucket-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isCompleted: nextStatus }),
      });
      if (res.ok) {
        setBucketList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isCompleted: nextStatus } : item))
        );
      }
    } catch (err) {
      console.error("Bucket toggle error:", err);
    }
  };

  // Laugh counter increment
  const handleLaughJoke = async (id: string) => {
    try {
      const res = await fetch("/api/jokes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setJokes((prev) =>
          prev.map((j) => (j.id === id ? { ...j, laughCount: j.laughCount + 1 } : j))
        );
      }
    } catch (err) {
      console.error("Joke laugh error:", err);
    }
  };

  // Add reason
  const handleAddReason = async () => {
    if (!newItemTitle.trim()) return;
    try {
      const res = await fetch("/api/reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: newItemTitle }),
      });
      if (res.ok) {
        setNewItemTitle("");
        loadData();
      }
    } catch (err) {
      console.error("Add reason error:", err);
    }
  };

  // Add bucket list item
  const handleAddBucket = async () => {
    if (!newItemTitle.trim()) return;
    try {
      const res = await fetch("/api/bucket-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newItemTitle, description: newItemExtra }),
      });
      if (res.ok) {
        setNewItemTitle("");
        setNewItemExtra("");
        loadData();
      }
    } catch (err) {
      console.error("Add bucket error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-gold-400">
          Shared Universe
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-gold-100">
          Our Shared World
        </h2>
        <p className="text-cashmere/80 font-serif italic text-sm sm:text-base max-w-lg mx-auto">
          Places explored, songs remembered, milestones, dreams, and inside laughter.
        </p>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: "places", label: `Our Places (${places.length})`, icon: MapPin },
            { id: "songs", label: `Soundtrack (${songs.length})`, icon: Music },
            { id: "firsts", label: `Firsts (${firsts.length})`, icon: Compass },
            { id: "bucket_list", label: `Bucket List (${bucketList.length})`, icon: CheckSquare },
            { id: "goals", label: `Goals (${goals.length})`, icon: Target },
            { id: "jokes", label: `Inside Jokes (${jokes.length})`, icon: Smile },
            { id: "reasons", label: `Why I Love You (${reasons.length})`, icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gold-400/20 text-gold-100 border border-gold-400/30 shadow-gold"
                    : "text-cashmere/70 hover:text-gold-200 bg-espresso-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-gold-300" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Our Places */}
      {activeTab === "places" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => {
            let photos: string[] = [];
            try {
              if (place.photos) photos = JSON.parse(place.photos);
            } catch {}

            return (
              <div
                key={place.id}
                className="luxury-glass-card rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {photos.length > 0 && (
                    <div className="h-44 w-full rounded-2xl overflow-hidden border border-gold-400/20">
                      <img src={photos[0]} alt={place.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-xl text-gold-100 font-medium">{place.name}</h4>
                      <p className="text-xs text-cashmere/70 flex items-center space-x-1 pt-0.5">
                        <MapPin className="w-3 h-3 text-gold-400" />
                        <span>{[place.city, place.country].filter(Boolean).join(", ")}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-0.5 text-gold-400">
                      <Star className="w-3.5 h-3.5 fill-gold-400" />
                      <span className="text-xs font-mono">{place.rating}</span>
                    </div>
                  </div>

                  {place.description && (
                    <p className="font-serif italic text-xs text-cashmere/85 leading-relaxed">
                      &ldquo;{place.description}&rdquo;
                    </p>
                  )}
                </div>

                {place.visitedDate && (
                  <div className="text-[11px] font-mono text-gold-400/70 pt-2 border-t border-gold-400/10">
                    Visited {new Date(place.visitedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Our Songs */}
      {activeTab === "songs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <div key={song.id} className="luxury-glass-card rounded-3xl p-5 space-y-4 flex flex-col justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gold-400/20 bg-espresso-800 shrink-0">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold-400">
                      <Music className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-serif text-lg text-gold-100 truncate">{song.title}</h4>
                  <p className="text-xs text-cashmere/80 truncate">{song.artist}</p>
                  <p className="text-[10px] text-gold-400/70 font-mono">Added by {song.addedBy.name}</p>
                </div>
              </div>

              {song.note && (
                <p className="font-serif italic text-xs text-cashmere/80 border-t border-gold-400/10 pt-2">
                  &ldquo;{song.note}&rdquo;
                </p>
              )}

              <div className="flex items-center space-x-2 pt-2 border-t border-gold-400/10">
                {song.spotifyUrl && (
                  <a
                    href={song.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center space-x-1.5"
                  >
                    <span>Spotify</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {song.youtubeUrl && (
                  <a
                    href={song.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs text-center flex items-center justify-center space-x-1.5"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Milestone Firsts */}
      {activeTab === "firsts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {firsts.map((first) => (
            <div key={first.id} className="luxury-glass-card rounded-3xl p-6 space-y-3">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-gold-400/10 border border-gold-400/20 text-[10px] uppercase font-mono text-gold-300">
                <Compass className="w-3 h-3 text-gold-400" />
                <span>{first.category}</span>
              </div>
              <h4 className="font-serif text-xl text-gold-100 font-medium">{first.title}</h4>
              <p className="font-serif italic text-xs sm:text-sm text-cashmere/85 leading-relaxed">
                &ldquo;{first.description}&rdquo;
              </p>
              {first.momentDate && (
                <div className="text-[11px] font-mono text-gold-400/70 pt-2 border-t border-gold-400/10">
                  {new Date(first.momentDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. Bucket List */}
      {activeTab === "bucket_list" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Add input */}
          <div className="luxury-glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 border border-gold-400/20">
            <input
              type="text"
              placeholder="Add something we want to do together..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="flex-1 w-full bg-transparent text-sm text-gold-100 placeholder:text-cashmere/50 focus:outline-none"
            />
            <button
              onClick={handleAddBucket}
              className="px-4 py-2 rounded-xl bg-gold-400/20 hover:bg-gold-400/30 text-gold-200 text-xs font-medium border border-gold-400/30 w-full sm:w-auto"
            >
              Add to List
            </button>
          </div>

          <div className="space-y-3">
            {bucketList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleBucket(item.id, item.isCompleted)}
                className={`luxury-glass rounded-2xl p-4 sm:p-5 flex items-start space-x-4 cursor-pointer transition-all border ${
                  item.isCompleted
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : "border-gold-400/15 hover:border-gold-400/30"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                    item.isCompleted
                      ? "bg-emerald-500 border-emerald-400 text-espresso-950"
                      : "border-gold-400/40 bg-espresso-800"
                  }`}
                >
                  {item.isCompleted && <span className="text-xs font-bold">✓</span>}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-serif text-base sm:text-lg transition-all ${
                      item.isCompleted ? "line-through text-cashmere/60" : "text-gold-100"
                    }`}
                  >
                    {item.title}
                  </div>
                  {item.description && (
                    <p className="text-xs text-cashmere/75 pt-1">{item.description}</p>
                  )}
                  {item.completedAt && (
                    <div className="text-[10px] font-mono text-emerald-400 pt-1">
                      Completed on {new Date(item.completedAt).toLocaleDateString()} ❤️
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Couple Goals */}
      {activeTab === "goals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {goals.map((g) => (
            <div key={g.id} className="luxury-glass-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-gold-400">
                  {g.category}
                </span>
                <span className="text-xs font-mono text-emerald-400">{g.status}</span>
              </div>
              <h4 className="font-serif text-2xl text-gold-100">{g.title}</h4>
              {g.description && <p className="text-xs text-cashmere/80">{g.description}</p>}

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono text-gold-300">
                  <span>Progress</span>
                  <span>{g.progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-espresso-800 overflow-hidden border border-gold-400/20">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all"
                    style={{ width: `${g.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Inside Jokes */}
      {activeTab === "jokes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jokes.map((j) => (
            <div key={j.id} className="luxury-glass-card rounded-3xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-gold-400 text-xs font-mono">
                  <Smile className="w-4 h-4 text-romantic-amber" />
                  <span>Our Inside Joke 😂</span>
                </div>
                <h4 className="font-serif text-xl text-gold-100 font-medium">{j.title}</h4>
                <p className="font-serif italic text-xs sm:text-sm text-cashmere/85 leading-relaxed">
                  &ldquo;{j.punchlineOrContext}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-gold-400/10 flex items-center justify-between">
                <span className="text-xs text-cashmere/60 font-mono">
                  {j.laughCount} Laughs Shared
                </span>
                <button
                  onClick={() => handleLaughJoke(j.id)}
                  className="px-3 py-1 rounded-full bg-gold-400/20 hover:bg-gold-400/30 text-gold-200 text-xs font-medium border border-gold-400/30 transition-all flex items-center space-x-1"
                >
                  <span>😂 +1 Laugh</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. Reasons I Love You */}
      {activeTab === "reasons" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Add input */}
          <div className="luxury-glass-card rounded-2xl p-4 flex items-center space-x-3 border border-gold-400/20">
            <input
              type="text"
              placeholder="One reason I love you..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddReason()}
              className="flex-1 bg-transparent text-sm text-gold-100 placeholder:text-cashmere/50 focus:outline-none"
            />
            <button
              onClick={handleAddReason}
              className="px-4 py-2 rounded-xl bg-gold-400/20 hover:bg-gold-400/30 text-gold-200 text-xs font-medium border border-gold-400/30"
            >
              Add Reason ❤️
            </button>
          </div>

          <div className="space-y-3">
            {reasons.map((r) => (
              <div
                key={r.id}
                className="luxury-glass rounded-2xl p-4 sm:p-5 flex items-start space-x-4 border border-gold-400/15 hover:border-gold-400/30 transition-all"
              >
                <div className="font-mono text-xs font-bold text-gold-400/80 pt-0.5 shrink-0">
                  #{String(r.orderIndex).padStart(3, "0")}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-serif text-base sm:text-lg text-gold-100 leading-relaxed">
                    {r.reason}
                  </p>
                  <p className="text-[11px] font-serif text-cashmere/60 text-right">
                    — {r.author.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
