"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Calendar, MapPin, Music, Heart, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onSurpriseMe: () => void;
  onExploreTimeline: () => void;
  onOpenAddMemory: () => void;
}

export default function HeroSection({
  onSurpriseMe,
  onExploreTimeline,
  onOpenAddMemory,
}: HeroSectionProps) {
  const { coupleSettings } = useAuth();

  // Relationship duration state
  const [duration, setDuration] = useState({
    totalDays: 0,
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [onThisDayMemory, setOnThisDayMemory] = useState<any>(null);
  const [isExactAnniversary, setIsExactAnniversary] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadingMemory, setLoadingMemory] = useState(true);

  // Anniversary date baseline
  const anniversaryDate = coupleSettings?.anniversaryDate
    ? new Date(coupleSettings.anniversaryDate)
    : new Date("2026-09-05T00:00:00Z");

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const start = new Date(anniversaryDate);
      const diffMs = now.getTime() - start.getTime();

      if (diffMs <= 0) {
        setDuration({ totalDays: 0, years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      let startYear = 2026, startMonth = 8, startDay = 5;
      if (coupleSettings?.anniversaryDate) {
        if (typeof coupleSettings.anniversaryDate === "string" && coupleSettings.anniversaryDate.includes("-")) {
          const parts = coupleSettings.anniversaryDate.split("T")[0].split("-");
          startYear = parseInt(parts[0], 10);
          startMonth = parseInt(parts[1], 10) - 1;
          startDay = parseInt(parts[2], 10);
        } else {
          const d = new Date(coupleSettings.anniversaryDate);
          startYear = d.getFullYear();
          startMonth = d.getMonth();
          startDay = d.getDate();
        }
      }

      const startMidnight = new Date(startYear, startMonth, startDay, 0, 0, 0, 0);
      const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const diffDays = Math.round((nowMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = Math.max(1, diffDays + 1);
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Precise Years, Months, Days breakdown
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days += prevMonthDays;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      setDuration({
        totalDays,
        years: Math.max(0, years),
        months: Math.max(0, months),
        days: Math.max(0, days),
        hours,
        minutes,
        seconds,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [anniversaryDate]);

  useEffect(() => {
    // Fetch On This Day memory
    fetch("/api/memories?onThisDay=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.memory) {
          setOnThisDayMemory(data.memory);
          setIsExactAnniversary(data.isExactAnniversary || false);
        }
      })
      .catch((err) => console.error("On this day error:", err))
      .finally(() => setLoadingMemory(false));

    // Fetch Stats
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Stats error:", err));
  }, []);

  return (
    <div className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-14">
      {/* Top Hero Section Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-300 text-xs tracking-wider uppercase">
          <Heart className="w-3 h-3 text-romantic-rose fill-romantic-rose animate-pulse-subtle" />
          <span>Our Private Little Universe</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-gold-100 via-champagne to-gold-400">
          Our Story
        </h1>

        {/* Dynamic Live Counter */}
        <div className="pt-2 space-y-2">
          <div className="font-serif text-3xl sm:text-5xl md:text-6xl text-gold-200 tracking-wide">
            {duration.totalDays.toLocaleString()} Days Together
          </div>
          <p className="text-cashmere/90 font-light text-sm sm:text-base tracking-widest uppercase">
            {duration.years} {duration.years === 1 ? "Year" : "Years"} • {duration.months} {duration.months === 1 ? "Month" : "Months"} • {duration.days} {duration.days === 1 ? "Day" : "Days"}
          </p>
          <div className="inline-flex items-center space-x-3 text-xs font-mono text-gold-400/70 pt-1">
            <span className="px-2 py-0.5 rounded bg-espresso-800/80 border border-gold-400/15">
              {String(duration.hours).padStart(2, "0")}h
            </span>
            <span>:</span>
            <span className="px-2 py-0.5 rounded bg-espresso-800/80 border border-gold-400/15">
              {String(duration.minutes).padStart(2, "0")}m
            </span>
            <span>:</span>
            <span className="px-2 py-0.5 rounded bg-espresso-800/80 border border-gold-400/15 text-gold-300">
              {String(duration.seconds).padStart(2, "0")}s
            </span>
          </div>
        </div>

        {/* Quote */}
        {coupleSettings?.relationshipQuote && (
          <p className="max-w-2xl mx-auto pt-3 text-xs sm:text-sm font-serif italic text-cashmere/75 leading-relaxed">
            &ldquo;{coupleSettings.relationshipQuote}&rdquo;
          </p>
        )}
      </div>

      {/* Main Interactive Row: On This Day Card + Surprise Me Button */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* On This Day Card */}
        <div className="lg:col-span-8">
          <div className="luxury-glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all group">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-5 border-b border-gold-400/10">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
                <span className="text-xs uppercase tracking-widest font-mono text-gold-300">
                  {isExactAnniversary ? "On This Very Day ❤️" : "Memory of the Day"}
                </span>
              </div>
              {onThisDayMemory && (
                <div className="flex items-center space-x-1.5 text-xs text-cashmere/70">
                  <Calendar className="w-3.5 h-3.5 text-gold-400/70" />
                  <span>
                    {new Date(onThisDayMemory.memoryDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {loadingMemory ? (
              <div className="py-16 text-center text-cashmere/60 text-sm">
                Retrieving shared moments...
              </div>
            ) : onThisDayMemory ? (
              <div className="pt-6 space-y-6">
                {/* Photo if available */}
                {(() => {
                  let photos: string[] = [];
                  try {
                    if (onThisDayMemory.photos) photos = JSON.parse(onThisDayMemory.photos);
                  } catch {}
                  return photos.length > 0 ? (
                    <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-gold-400/20 shadow-intimate">
                      <img
                        src={photos[0]}
                        alt={onThisDayMemory.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 via-transparent to-transparent" />
                      {onThisDayMemory.location && (
                        <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-espresso-900/80 backdrop-blur-md border border-gold-400/20 text-xs text-gold-200">
                          <MapPin className="w-3.5 h-3.5 text-gold-400" />
                          <span>{onThisDayMemory.location}</span>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}

                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-gold-100 leading-snug">
                    {onThisDayMemory.title}
                  </h3>
                  <p className="font-serif italic text-sm sm:text-base text-cashmere/90 leading-relaxed">
                    &ldquo;{onThisDayMemory.description}&rdquo;
                  </p>
                </div>

                {/* Song tag or Author */}
                <div className="flex flex-wrap items-center justify-between pt-2 text-xs text-cashmere/70 border-t border-gold-400/10">
                  {onThisDayMemory.songTitle ? (
                    <div className="flex items-center space-x-2 text-gold-300">
                      <Music className="w-3.5 h-3.5" />
                      <span>{onThisDayMemory.songTitle} - {onThisDayMemory.songArtist}</span>
                    </div>
                  ) : (
                    <div className="text-cashmere/50 italic">From our memory archives</div>
                  )}

                  <button
                    onClick={onExploreTimeline}
                    className="flex items-center space-x-1 text-gold-300 hover:text-gold-100 transition-colors"
                  >
                    <span>View in Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <p className="text-cashmere/70 text-sm">No memories recorded yet for today.</p>
                <button
                  onClick={onOpenAddMemory}
                  className="px-4 py-2 rounded-full bg-gold-400/20 border border-gold-400/30 text-gold-200 text-xs"
                >
                  Create Our First Memory
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Surprise Me CTA & Quick Memory Actions */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-center">
          {/* Surprise Me Luxury Card */}
          <div className="luxury-glass-card rounded-3xl p-6 text-center space-y-5 border border-gold-400/25 relative overflow-hidden">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-gold-400/30 to-romantic-wine/30 border border-gold-400/40 flex items-center justify-center text-gold-200 shadow-gold">
              <Sparkles className="w-6 h-6 text-gold-300 animate-pulse-subtle" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-2xl text-gold-100">Surprise Me ❤️</h4>
              <p className="text-xs text-cashmere/80 leading-relaxed">
                Rediscover a random moment, love letter, voice recording, or photo hidden in our universe.
              </p>
            </div>

            <button
              onClick={onSurpriseMe}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-espresso-950 font-medium text-sm tracking-wide shadow-gold hover:gold-glow hover:scale-[1.02] active:scale-[0.99] transition-all"
            >
              Surprise Us Now
            </button>
          </div>

          {/* Quick Add Memory Prompt */}
          <div className="luxury-glass rounded-2xl p-5 flex items-center justify-between border border-gold-400/15">
            <div>
              <div className="text-xs uppercase tracking-wider text-gold-400/80 font-mono">Today&apos;s Story</div>
              <div className="text-sm font-medium text-gold-100">Add a new moment</div>
            </div>
            <button
              onClick={onOpenAddMemory}
              className="px-4 py-2 rounded-xl bg-espresso-800 hover:bg-espresso-700 border border-gold-400/30 text-gold-200 text-xs font-medium transition-all"
            >
              + Add Memory
            </button>
          </div>
        </div>
      </div>

      {/* Relationship Statistics Row */}
      {stats && (
        <div className="pt-6 border-t border-gold-400/15">
          <div className="text-center pb-6">
            <span className="text-[11px] uppercase tracking-widest font-mono text-gold-400/70">
              Our Journey by the Numbers
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            <div className="luxury-glass rounded-2xl p-4 text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif text-gold-200">{stats.daysTogether}</div>
              <div className="text-[10px] uppercase tracking-wider text-cashmere/70">Days Together</div>
            </div>
            <div className="luxury-glass rounded-2xl p-4 text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif text-gold-200">{stats.memoriesCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-cashmere/70">Memories</div>
            </div>
            <div className="luxury-glass rounded-2xl p-4 text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif text-gold-200">{stats.lettersCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-cashmere/70">Letters</div>
            </div>
            <div className="luxury-glass rounded-2xl p-4 text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif text-gold-200">{stats.placesCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-cashmere/70">Places Visited</div>
            </div>
            <div className="luxury-glass rounded-2xl p-4 text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif text-gold-200">{stats.songsCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-cashmere/70">Soundtrack</div>
            </div>
            <div className="luxury-glass rounded-2xl p-4 text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif text-gold-200">{stats.jokesCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-cashmere/70">Inside Jokes</div>
            </div>
            <div className="luxury-glass rounded-2xl p-4 text-center space-y-1 col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl font-serif text-gold-200">{stats.bucketCompletedCount}</div>
              <div className="text-[10px] uppercase tracking-wider text-cashmere/70">Dreams Fulfilled</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
