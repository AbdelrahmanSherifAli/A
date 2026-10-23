"use client";

import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Plus, Music, Sparkles, Filter } from "lucide-react";

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

interface TimelineSectionProps {
  onOpenAddMemory: () => void;
}

export default function TimelineSection({ onOpenAddMemory }: TimelineSectionProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/timeline")
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
        }
      })
      .catch((err) => console.error("Fetch timeline error:", err))
      .finally(() => setLoading(false));
  }, []);

  const years = Array.from(new Set(events.map((e) => e.year))).sort((a, b) => b - a);

  const filteredEvents = selectedYear
    ? events.filter((e) => e.year === selectedYear)
    : events;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-gold-400">
          <Sparkles className="w-3.5 h-3.5 text-gold-300" />
          <span>Eternal Journeys</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-gold-100 tracking-tight">
          Our Shared Story
        </h2>
        <p className="text-cashmere/80 font-serif italic text-sm sm:text-base max-w-xl mx-auto">
          Every conversation, destination, and tiny moment that built our universe.
        </p>

        {/* Year Filter Buttons & Add Button */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedYear(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedYear === null
                ? "bg-gold-400/20 text-gold-100 border border-gold-400/40 shadow-gold"
                : "text-cashmere/70 hover:text-gold-200 bg-espresso-800/60"
            }`}
          >
            All Years
          </button>
          {years.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedYear === yr
                  ? "bg-gold-400/20 text-gold-100 border border-gold-400/40 shadow-gold"
                  : "text-cashmere/70 hover:text-gold-200 bg-espresso-800/60"
              }`}
            >
              {yr}
            </button>
          ))}
          <button
            onClick={onOpenAddMemory}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gold-500/20 hover:bg-gold-500/30 border border-gold-400/40 text-gold-200 text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-cashmere/60">Loading our story...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 text-cashmere/60">No events found for this filter.</div>
      ) : (
        /* The Vertical Timeline Spine */
        <div className="relative border-l-2 border-gold-400/20 ml-4 sm:ml-32 space-y-12 py-6">
          {filteredEvents.map((event, idx) => {
            let photos: string[] = [];
            try {
              if (event.photos) photos = JSON.parse(event.photos);
            } catch {}

            return (
              <div key={event.id} className="relative pl-6 sm:pl-10 group">
                {/* Glowing Timeline Node */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-espresso-900 border-2 border-gold-400 shadow-gold group-hover:scale-125 group-hover:bg-gold-400 transition-all" />

                {/* Date on Desktop (Left Side) */}
                <div className="hidden sm:block absolute -left-36 top-1 text-right w-28 font-mono text-xs text-gold-300/80">
                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                {/* Event Card */}
                <div className="luxury-glass-card rounded-2xl p-5 sm:p-6 space-y-4 max-w-2xl transition-all">
                  {/* Mobile Date Header */}
                  <div className="sm:hidden flex items-center justify-between text-xs text-gold-300 font-mono pb-2 border-b border-gold-400/10">
                    <span>
                      {new Date(event.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="capitalize text-cashmere/60">{event.category}</span>
                  </div>

                  {/* Title & Author */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl text-gold-100 font-medium leading-tight">
                        {event.title}
                      </h3>
                      {event.location && (
                        <div className="flex items-center space-x-1.5 text-xs text-cashmere/80 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-gold-400" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pl-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-gold-400/30 bg-espresso-800" title={event.author.name}>
                        {event.author.avatarUrl ? (
                          <img src={event.author.avatarUrl} alt={event.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gold-300">
                            {event.author.name[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-serif italic text-sm text-cashmere/90 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Photos Carousel/Grid */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {photos.map((photoUrl, pIdx) => (
                        <div
                          key={pIdx}
                          className="h-44 rounded-xl overflow-hidden border border-gold-400/15 relative group/photo"
                        >
                          <img
                            src={photoUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Music link */}
                  {event.songUrl && (
                    <a
                      href={event.songUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs text-gold-300 hover:text-gold-100 pt-1"
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>Soundtrack for this moment</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
