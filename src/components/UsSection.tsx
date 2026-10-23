"use client";

import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import {
  Compass,
  Heart,
  Music,
  MapPin,
  Smile,
  Mail,
  Sparkles,
  Plus,
  Star,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Film,
  Edit3,
  X,
  Search,
  Play,
  Pause,
  Volume2,
  Disc,
  Check,
  Radio,
} from "lucide-react";
import LettersSection from "@/components/LettersSection";
import Portal from "@/components/Portal";

interface FirstMoment {
  id: string;
  category: string;
  title: string;
  momentDate: string | null;
  description: string;
  photoUrl: string | null;
  isHappened: boolean;
}

interface CoupleIdentityData {
  ourSong?: string | null;
  ourNickname?: string | null;
  ourRestaurant?: string | null;
  ourEmoji?: string | null;
  ourFavoriteMovie?: string | null;
  ourCozyPlace?: string | null;
  ourCoffeeOrder?: string | null;
}

function getSpotifyEmbedUrl(url: string | null | undefined): string {
  if (!url) return "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0";
  if (url.startsWith("spotify:")) {
    const parts = url.split(":");
    return `https://open.spotify.com/embed/${parts[1]}/${parts[2]}?utm_source=generator&theme=0`;
  }
  const match = url.match(/open\.spotify\.com\/(playlist|track|album)\/([a-zA-Z0-9]+)/);
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  }
  return url;
}

export default function UsSection() {
  const { user, partner, coupleSettings, refreshAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "firsts" | "identity" | "letters" | "places" | "soundtrack" | "jokes" | "reasons"
  >("firsts");

  // Spotify Search & Modal State
  const [spotifyModalOpen, setSpotifyModalOpen] = useState(false);
  const [spotifyQuery, setSpotifyQuery] = useState("");
  const [spotifyResults, setSpotifyResults] = useState<any[]>([]);
  const [isSearchingSpotify, setIsSearchingSpotify] = useState(false);
  const [selectedSpotifyTrack, setSelectedSpotifyTrack] = useState<any | null>(null);
  const [songPersonalNote, setSongPersonalNote] = useState("");
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Edit Playlist Modal State
  const [editPlaylistModalOpen, setEditPlaylistModalOpen] = useState(false);
  const [playlistUrlInput, setPlaylistUrlInput] = useState(
    coupleSettings?.spotifyPlaylistUrl || "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
  );
  const [isSavingPlaylist, setIsSavingPlaylist] = useState(false);

  const [firsts, setFirsts] = useState<FirstMoment[]>([]);
  const [identity, setIdentity] = useState<CoupleIdentityData>({});
  const [places, setPlaces] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [jokes, setJokes] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);

  const [littleThings, setLittleThings] = useState([
    { id: "1", note: "She loves her flat white with oat milk and never adds sugar.", author: "Abdel" },
    { id: "2", note: "He gets secretly nervous before important presentations and checks his watch.", author: "Nour" },
    { id: "3", note: "Her laughter is loudest when watching funny golden retriever videos.", author: "Abdel" },
    { id: "4", note: "He automatically places his arm around me whenever we wait for an elevator.", author: "Nour" },
  ]);
  const [newLittleThing, setNewLittleThing] = useState("");

  const [recordingFirst, setRecordingFirst] = useState<FirstMoment | null>(null);
  const [recordFirstDate, setRecordFirstDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [recordFirstDesc, setRecordFirstDesc] = useState("");

  const [showAddFirst, setShowAddFirst] = useState(false);
  const [newFirstTitle, setNewFirstTitle] = useState("");
  const [newFirstCategory, setNewFirstCategory] = useState("milestone");
  const [newFirstDesc, setNewFirstDesc] = useState("");
  const [newFirstHappened, setNewFirstHappened] = useState(false);
  const [newFirstDate, setNewFirstDate] = useState("");

  const [editIdentityOpen, setEditIdentityOpen] = useState(false);
  const [identityForm, setIdentityForm] = useState<CoupleIdentityData>({});

  const [newReason, setNewReason] = useState("");
  const [newJokeTitle, setNewJokeTitle] = useState("");
  const [newJokeContext, setNewJokeContext] = useState("");

  const loadData = () => {
    fetch("/api/firsts").then((r) => r.json()).then((d) => d.firsts && setFirsts(d.firsts));
    fetch("/api/identity").then((r) => r.json()).then((d) => {
      if (d.identity) {
        setIdentity(d.identity);
        setIdentityForm(d.identity);
      }
    });
    fetch("/api/places").then((r) => r.json()).then((d) => d.places && setPlaces(d.places));
    fetch("/api/songs").then((r) => r.json()).then((d) => d.songs && setSongs(d.songs));
    fetch("/api/jokes").then((r) => r.json()).then((d) => d.jokes && setJokes(d.jokes));
    fetch("/api/reasons").then((r) => r.json()).then((d) => d.reasons && setReasons(d.reasons));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFulfillFirst = async () => {
    if (!recordingFirst) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#9A6660", "#B7897E", "#E8DED5"],
    });

    try {
      const res = await fetch("/api/firsts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: recordingFirst.id,
          isHappened: true,
          momentDate: recordFirstDate,
          description: recordFirstDesc || recordingFirst.description,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setFirsts((prev) =>
          prev.map((f) => (f.id === recordingFirst.id ? d.first : f))
        );
        setRecordingFirst(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewFirst = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstTitle.trim()) return;

    try {
      const res = await fetch("/api/firsts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newFirstTitle.trim(),
          category: newFirstCategory,
          description: newFirstDesc.trim() || "A beautiful step in our story.",
          momentDate: newFirstHappened && newFirstDate ? newFirstDate : null,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.first) {
          if (!newFirstHappened) {
            await fetch("/api/firsts", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: d.first.id, isHappened: false }),
            });
          }
          loadData();
          setShowAddFirst(false);
          setNewFirstTitle("");
          setNewFirstDesc("");
          setNewFirstDate("");
          setNewFirstHappened(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(identityForm),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.identity) setIdentity(d.identity);
        setEditIdentityOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      console.error(err);
    }
  };

  const handleAddJoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJokeTitle.trim()) return;
    try {
      const res = await fetch("/api/jokes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newJokeTitle.trim(),
          punchlineOrContext: newJokeContext.trim() || "Something only we understand 😂",
        }),
      });
      if (res.ok) {
        setNewJokeTitle("");
        setNewJokeContext("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReason = async () => {
    if (!newReason.trim()) return;
    try {
      const res = await fetch("/api/reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: newReason.trim() }),
      });
      if (res.ok) {
        setNewReason("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLittleThing = () => {
    if (!newLittleThing.trim()) return;
    setLittleThings([
      ...littleThings,
      { id: String(Date.now()), note: newLittleThing.trim(), author: "Us" },
    ]);
    setNewLittleThing("");
  };

  const handleSearchSpotify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!spotifyQuery.trim()) return;
    setIsSearchingSpotify(true);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(spotifyQuery.trim())}`);
      const data = await res.json();
      setSpotifyResults(data.tracks || []);
    } catch (err) {
      console.error("Spotify search error:", err);
    } finally {
      setIsSearchingSpotify(false);
    }
  };

  const handleTogglePreview = (previewUrl: string) => {
    if (!previewAudioRef.current) return;
    if (activePreviewUrl === previewUrl && isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      setActivePreviewUrl(previewUrl);
      previewAudioRef.current.src = previewUrl;
      previewAudioRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  const handleAddSpotifySong = async () => {
    if (!selectedSpotifyTrack) return;
    setIsAddingSong(true);
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedSpotifyTrack.title,
          artist: selectedSpotifyTrack.artist,
          spotifyUrl: selectedSpotifyTrack.spotifyUrl,
          coverUrl: selectedSpotifyTrack.coverUrl,
          note: songPersonalNote.trim() || undefined,
        }),
      });
      if (res.ok) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setSpotifyModalOpen(false);
        setSelectedSpotifyTrack(null);
        setSongPersonalNote("");
        setSpotifyResults([]);
        setSpotifyQuery("");
        loadData();
      }
    } catch (err) {
      console.error("Add song error:", err);
    } finally {
      setIsAddingSong(false);
    }
  };

  const handleSavePlaylistUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrlInput.trim()) return;
    setIsSavingPlaylist(true);
    try {
      const res = await fetch("/api/spotify/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl: playlistUrlInput.trim() }),
      });
      if (res.ok) {
        await refreshAuth();
        setEditPlaylistModalOpen(false);
      }
    } catch (err) {
      console.error("Save playlist error:", err);
    } finally {
      setIsSavingPlaylist(false);
    }
  };

  const completedFirsts = firsts.filter((f) => f.isHappened);
  const pendingFirsts = firsts.filter((f) => !f.isHappened);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2.5 max-w-xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 text-xs font-sans text-accent-primary uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Our Identity &amp; Bond</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-ink-primary font-normal tracking-tight">
          Us &amp; Our World
        </h2>
        <p className="text-xs sm:text-sm text-ink-secondary font-sans leading-relaxed">
          Our milestone firsts, the little habits that define us, private letters, songs, and laughter.
        </p>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: "firsts", label: `Our Firsts (${firsts.length})`, desc: "The special milestone firsts of our relationship", icon: Compass },
            { id: "identity", label: "Our Little Things", desc: "Our favorite things, habits, and relationship facts", icon: Sparkles },
            { id: "letters", label: "Letters & Open When", desc: "Digital love letters and sealed Open When envelopes", icon: Mail },
            { id: "places", label: `Our Places (${places.length})`, desc: "Places that hold a special meaning in our hearts", icon: MapPin },
            { id: "soundtrack", label: `Soundtrack (${songs.length})`, desc: "Our songs, playlist, and favorite music together", icon: Music },
            { id: "jokes", label: `Inside Jokes (${jokes.length})`, desc: "Silly inside jokes and memories that make us laugh", icon: Smile },
            { id: "reasons", label: `Why I Love You (${reasons.length})`, desc: "All the reasons why I love you so much", icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                title={tab.desc}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
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
        </div>
      </div>

      {/* 1. OUR FIRSTS */}
      {activeTab === "firsts" && (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl text-ink-primary font-normal">Milestone Moments</h3>
            <button
              onClick={() => setShowAddFirst(true)}
              className="flex items-center space-x-2 px-4 py-2 quiet-btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Milestone</span>
            </button>
          </div>

          {/* Completed Chapters */}
          <div className="space-y-3">
            <h4 className="text-xs font-sans uppercase tracking-wider text-accent-primary flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Chapters Lived Together ({completedFirsts.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {completedFirsts.map((first) => (
                <div
                  key={first.id}
                  className="quiet-card p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-canvas-elevated text-accent-primary border border-canvas-border">
                        {first.category}
                      </span>
                      <span className="text-accent-primary font-sans text-[11px] flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Achieved</span>
                      </span>
                    </div>

                    <h4 className="font-serif text-lg text-ink-primary font-normal">
                      {first.title}
                    </h4>

                    <p className="font-serif italic text-xs text-ink-secondary leading-relaxed">
                      &ldquo;{first.description}&rdquo;
                    </p>
                  </div>

                  {first.momentDate && (
                    <div className="text-[11px] font-mono text-ink-muted pt-2 border-t border-canvas-border/50">
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
          </div>

          {/* Pending Chapters Awaiting Us */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-sans uppercase tracking-wider text-ink-muted flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-accent-primary" />
              <span>Chapters Waiting For Us ({pendingFirsts.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pendingFirsts.map((first) => (
                <div
                  key={first.id}
                  className="quiet-card p-5 space-y-3 flex flex-col justify-between border-dashed"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-canvas-elevated text-ink-muted border border-canvas-border">
                        {first.category}
                      </span>
                      <span className="text-accent-primary font-sans text-[11px]">Awaiting Us ♡</span>
                    </div>

                    <h4 className="font-serif text-lg text-ink-primary font-normal">
                      {first.title}
                    </h4>

                    <div className="p-2.5 rounded-xl bg-canvas-elevated border border-canvas-border text-xs space-y-1">
                      <p className="font-serif italic text-accent-primary">
                        Not yet... ♡
                      </p>
                      <p className="text-[11px] text-ink-secondary leading-relaxed">
                        &ldquo;{first.description}&rdquo;
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setRecordingFirst(first);
                      setRecordFirstDesc(first.description);
                    }}
                    className="w-full py-2 px-3 quiet-btn-primary text-xs flex items-center justify-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>We lived this! Record date ♡</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. OUR LITTLE THINGS */}
      {activeTab === "identity" && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl text-ink-primary font-normal">Our Shared Tokens</h3>
                <p className="text-xs text-ink-muted">The small definitions of our relationship.</p>
              </div>
              <button
                onClick={() => setEditIdentityOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 quiet-btn-outline text-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Our Tokens</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Our Song", val: identity.ourSong || "Until I Found You", icon: Music },
                { label: "Nicknames", val: identity.ourNickname || "Habibi & Moon", icon: Heart },
                { label: "Favorite Spot", val: identity.ourRestaurant || "The Shoreline Bistro", icon: MapPin },
                { label: "Our Emoji", val: identity.ourEmoji || "☕✨♡", icon: Smile },
                { label: "Comfort Movie", val: identity.ourFavoriteMovie || "Before Sunrise", icon: Film },
                { label: "Coffee Order", val: identity.ourCoffeeOrder || "Flat White & Cortado", icon: Coffee },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="quiet-card p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-sans text-accent-primary">
                      <Icon className="w-4 h-4" />
                      <span className="uppercase tracking-wider">{item.label}</span>
                    </div>
                    <p className="font-serif text-lg text-ink-primary font-normal pt-1">{item.val}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Little Things I Remember */}
          <div className="space-y-4 pt-4 border-t border-canvas-border/50">
            <h3 className="font-serif text-2xl text-ink-primary font-normal">Little Things I Remember</h3>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="A tiny habit or sweet detail I noticed about you..."
                value={newLittleThing}
                onChange={(e) => setNewLittleThing(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLittleThing()}
                className="flex-1 w-full quiet-input px-3.5 py-2 text-xs"
              />
              <button
                onClick={handleAddLittleThing}
                className="w-full sm:w-auto px-5 py-2 quiet-btn-primary text-xs shrink-0"
              >
                Record Detail ♡
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {littleThings.map((item) => (
                <div key={item.id} className="quiet-card p-4 space-y-2">
                  <p className="font-serif italic text-sm text-ink-primary leading-relaxed">
                    &ldquo;{item.note}&rdquo;
                  </p>
                  <p className="text-[10px] text-ink-muted text-right font-sans">
                    — Noticed by {item.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. LETTERS */}
      {activeTab === "letters" && (
        <div className="max-w-4xl mx-auto">
          <LettersSection />
        </div>
      )}

      {/* 4. PLACES */}
      {activeTab === "places" && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {places.map((place) => {
            let photos: string[] = [];
            try {
              if (place.photos) photos = JSON.parse(place.photos);
            } catch {}

            return (
              <div key={place.id} className="quiet-card p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  {photos.length > 0 && (
                    <div className="h-40 w-full rounded-xl overflow-hidden border border-canvas-border">
                      <img src={photos[0]} alt={place.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h4 className="font-serif text-lg text-ink-primary font-normal">{place.name}</h4>
                  <p className="text-xs text-ink-muted flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-accent-primary" />
                    <span>{[place.city, place.country].filter(Boolean).join(", ")}</span>
                  </p>
                  {place.description && (
                    <p className="font-serif italic text-xs text-ink-secondary">&ldquo;{place.description}&rdquo;</p>
                  )}
                </div>
                {place.visitedDate && (
                  <p className="text-[10px] text-ink-muted pt-2 border-t border-canvas-border/50">
                    Visited {new Date(place.visitedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. SOUNDTRACK & SPOTIFY PLAYLIST */}
      {activeTab === "soundtrack" && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-canvas-border">
            <div>
              <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Disc className="w-4 h-4 animate-spin" />
                <span className="uppercase tracking-wider">Spotify Web API Connected</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-ink-primary font-normal">
                Our Private Soundtrack
              </h3>
              <p className="text-xs text-ink-secondary">
                Our shared playlist and the songs that soundtrack our story.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setPlaylistUrlInput(
                    coupleSettings?.spotifyPlaylistUrl || "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
                  );
                  setEditPlaylistModalOpen(true);
                }}
                className="px-3.5 py-2 quiet-btn-outline text-xs flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Playlist Settings</span>
              </button>
              <button
                onClick={() => setSpotifyModalOpen(true)}
                className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-medium rounded-full text-xs flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Spotify</span>
              </button>
            </div>
          </div>

          {/* Couple Profiles Spotify Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="quiet-card p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/assets/avatar_abdel.jpg"
                  alt="Abdel"
                  className="w-10 h-10 rounded-full object-cover border border-canvas-border"
                />
                <div>
                  <div className="text-xs font-medium text-ink-primary">Abdel&apos;s Spotify</div>
                  <div className="text-[10px] text-ink-muted">
                    {user?.spotifyProfileUrl ? "Profile Connected" : "Shared listener"}
                  </div>
                </div>
              </div>
              {user?.spotifyProfileUrl ? (
                <a
                  href={user.spotifyProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <span>Open Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  onClick={() => setEditPlaylistModalOpen(true)}
                  className="text-[10px] text-ink-muted hover:text-ink-primary underline"
                >
                  + Add Link
                </button>
              )}
            </div>

            <div className="quiet-card p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/assets/avatar_nour.jpg"
                  alt="Nour"
                  className="w-10 h-10 rounded-full object-cover border border-canvas-border"
                />
                <div>
                  <div className="text-xs font-medium text-ink-primary">Nour&apos;s Spotify</div>
                  <div className="text-[10px] text-ink-muted">
                    {partner?.spotifyProfileUrl ? "Profile Connected" : "Shared listener"}
                  </div>
                </div>
              </div>
              {partner?.spotifyProfileUrl ? (
                <a
                  href={partner.spotifyProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <span>Open Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  onClick={() => setEditPlaylistModalOpen(true)}
                  className="text-[10px] text-ink-muted hover:text-ink-primary underline"
                >
                  + Add Link
                </button>
              )}
            </div>
          </div>

          {/* EMBEDDED OFFICIAL SPOTIFY PLAYLIST PLAYER */}
          <div className="quiet-card p-4 sm:p-6 space-y-4 rounded-3xl overflow-hidden border border-emerald-500/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center text-black">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-ink-primary font-medium">Our Shared Playlist</h4>
                  <p className="text-[11px] text-ink-muted">Synced between Abdel &amp; Nour</p>
                </div>
              </div>
              <a
                href={coupleSettings?.spotifyPlaylistUrl || "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>Open in App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/40">
              <iframe
                src={getSpotifyEmbedUrl(coupleSettings?.spotifyPlaylistUrl)}
                width="100%"
                height="352"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full rounded-2xl"
              />
            </div>
          </div>

          {/* SONGS ADDED BY ABDEL & NOUR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-xl text-ink-primary font-normal">
                Songs That Mean Something To Us ({songs.length})
              </h4>
              <button
                onClick={() => setSpotifyModalOpen(true)}
                className="text-xs text-accent-primary hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Search &amp; Add Track</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="quiet-card p-4 rounded-2xl flex items-start space-x-3.5 group hover:border-emerald-500/30 transition-all"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-canvas-border shrink-0 bg-stone-900">
                    <img
                      src={song.coverUrl || "/assets/song_album_cover.jpg"}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="overflow-hidden flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="font-serif text-base text-ink-primary truncate font-medium">
                        {song.title}
                      </h5>
                      {song.spotifyUrl && (
                        <a
                          href={song.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-500 hover:text-emerald-400 p-1 shrink-0"
                          title="Open on Spotify"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-ink-secondary truncate">{song.artist}</p>
                    {song.note && (
                      <p className="font-serif italic text-xs text-romantic-terracotta dark:text-romantic-rose line-clamp-2 pt-0.5">
                        &ldquo;{song.note}&rdquo;
                      </p>
                    )}
                    {song.addedBy && (
                      <p className="text-[10px] text-ink-muted pt-1">
                        Added by {song.addedBy.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. JOKES */}
      {activeTab === "jokes" && (
        <div className="max-w-3xl mx-auto space-y-4">
          <form onSubmit={handleAddJoke} className="quiet-card p-4 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Inside joke title..."
              value={newJokeTitle}
              onChange={(e) => setNewJokeTitle(e.target.value)}
              className="flex-1 w-full quiet-input px-3.5 py-1.5 text-xs"
            />
            <input
              type="text"
              placeholder="Context or punchline..."
              value={newJokeContext}
              onChange={(e) => setNewJokeContext(e.target.value)}
              className="flex-1 w-full quiet-input px-3.5 py-1.5 text-xs"
            />
            <button type="submit" className="w-full sm:w-auto px-4 py-1.5 quiet-btn-primary text-xs shrink-0">
              Add Joke 😂
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {jokes.map((j) => (
              <div key={j.id} className="quiet-card p-5 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-accent-primary font-sans">Our Joke 😂</span>
                  <h4 className="font-serif text-lg text-ink-primary font-normal">{j.title}</h4>
                  <p className="font-serif italic text-xs text-ink-secondary">&ldquo;{j.punchlineOrContext}&rdquo;</p>
                </div>
                <div className="pt-2 border-t border-canvas-border/50 flex items-center justify-between text-xs">
                  <span className="text-ink-muted text-[11px]">{j.laughCount} laughs</span>
                  <button
                    onClick={() => handleLaughJoke(j.id)}
                    className="px-2 py-0.5 quiet-btn-outline text-[11px]"
                  >
                    😂 +1
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. REASONS */}
      {activeTab === "reasons" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="quiet-card p-4 flex items-center space-x-2">
            <input
              type="text"
              placeholder="One more reason I love you..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddReason()}
              className="flex-1 quiet-input px-3.5 py-2 text-xs"
            />
            <button onClick={handleAddReason} className="px-5 py-2 quiet-btn-primary text-xs shrink-0">
              Add Reason ♡
            </button>
          </div>

          <div className="space-y-2">
            {reasons.map((r, idx) => (
              <div key={r.id || idx} className="quiet-card p-4 flex items-start space-x-3">
                <span className="font-mono text-xs text-accent-primary pt-0.5">
                  #{String(r.orderIndex || idx + 1).padStart(3, "0")}
                </span>
                <p className="font-serif text-base text-ink-primary leading-relaxed flex-1">
                  {r.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: RECORD FIRST DATE */}
      {recordingFirst && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="quiet-card p-6 sm:p-8 max-w-md w-full space-y-4 bg-canvas-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-wider text-accent-primary">
                  Milestone Lived
                </span>
                <button onClick={() => setRecordingFirst(null)} className="text-ink-muted hover:text-ink-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-serif text-2xl text-ink-primary font-normal">
                Record &ldquo;{recordingFirst.title}&rdquo;
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-ink-muted font-sans mb-1">Date It Happened</label>
                  <input
                    type="date"
                    value={recordFirstDate}
                    onChange={(e) => setRecordFirstDate(e.target.value)}
                    className="w-full quiet-input px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block text-ink-muted font-sans mb-1">Reflection / Notes</label>
                  <textarea
                    rows={3}
                    value={recordFirstDesc}
                    onChange={(e) => setRecordFirstDesc(e.target.value)}
                    placeholder="Record how it felt and what made it unforgettable..."
                    className="w-full quiet-input p-3 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRecordingFirst(null)}
                    className="px-4 py-2 text-xs text-ink-muted hover:text-ink-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFulfillFirst}
                    className="px-5 py-2 quiet-btn-primary text-xs"
                  >
                    Seal Milestone ♡
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* MODAL: EDIT IDENTITY */}
      {editIdentityOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="quiet-card p-6 sm:p-8 max-w-md w-full space-y-4 bg-canvas-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-wider text-accent-primary">
                  Relationship Tokens
                </span>
                <button onClick={() => setEditIdentityOpen(false)} className="text-ink-muted hover:text-ink-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-serif text-2xl text-ink-primary font-normal">Our Little Things</h3>

              <form onSubmit={handleSaveIdentity} className="space-y-2.5 text-xs">
                {[
                  { label: "Our Song", key: "ourSong", placeholder: "Until I Found You" },
                  { label: "Nicknames", key: "ourNickname", placeholder: "Habibi & Moon" },
                  { label: "Favorite Spot", key: "ourRestaurant", placeholder: "The Shoreline Bistro" },
                  { label: "Our Emoji", key: "ourEmoji", placeholder: "☕✨♡" },
                  { label: "Comfort Movie", key: "ourFavoriteMovie", placeholder: "Before Sunrise" },
                  { label: "Coffee Order", key: "ourCoffeeOrder", placeholder: "Flat White" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[11px] text-ink-muted font-sans mb-0.5">{field.label}</label>
                    <input
                      type="text"
                      value={(identityForm as any)[field.key] || ""}
                      onChange={(e) =>
                        setIdentityForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full quiet-input px-3 py-1.5"
                    />
                  </div>
                ))}

                <div className="flex items-center justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditIdentityOpen(false)}
                    className="px-4 py-2 text-xs text-ink-muted hover:text-ink-primary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 quiet-btn-primary text-xs">
                    Save Tokens ♡
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
      {/* Hidden Audio Player for 30s Track Previews */}
      <audio
        ref={previewAudioRef}
        onEnded={() => setIsPlayingPreview(false)}
        className="hidden"
      />

      {/* MODAL: SPOTIFY TRACK SEARCH */}
      {spotifyModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="quiet-card p-6 sm:p-8 max-w-lg w-full space-y-5 bg-canvas-card rounded-3xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center text-black">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-ink-primary font-normal">Search Spotify</h3>
                    <p className="text-[11px] text-ink-muted">Find any track on Spotify to add to our sanctuary</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSpotifyModalOpen(false);
                    setSelectedSpotifyTrack(null);
                    setSpotifyResults([]);
                    setSpotifyQuery("");
                  }}
                  className="text-ink-muted hover:text-ink-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSpotify} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Song name or artist..."
                  value={spotifyQuery}
                  onChange={(e) => setSpotifyQuery(e.target.value)}
                  className="flex-1 quiet-input px-3.5 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={isSearchingSpotify || !spotifyQuery.trim()}
                  className="px-4 py-2 quiet-btn-primary text-xs"
                >
                  {isSearchingSpotify ? "..." : "Search"}
                </button>
              </form>

              {/* Selected Track Config */}
              {selectedSpotifyTrack && (
                <div className="p-3.5 rounded-2xl bg-canvas-elevated border border-canvas-border space-y-3 animate-fade-in">
                  <div className="flex items-center space-x-3">
                    {selectedSpotifyTrack.coverUrl ? (
                      <img
                        src={selectedSpotifyTrack.coverUrl}
                        alt={selectedSpotifyTrack.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-canvas-card flex items-center justify-center">
                        <Music className="w-6 h-6 text-accent-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-base text-ink-primary truncate font-normal">
                        {selectedSpotifyTrack.title}
                      </h4>
                      <p className="text-xs text-ink-muted truncate">
                        {selectedSpotifyTrack.artist}
                      </p>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Why this song? (e.g. played on our 1st date)"
                    value={songPersonalNote}
                    onChange={(e) => setSongPersonalNote(e.target.value)}
                    className="w-full quiet-input px-3 py-1.5 text-xs"
                  />

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSpotifyTrack(null)}
                      className="px-3 py-1 text-xs text-ink-muted"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      disabled={isAddingSong}
                      onClick={handleAddSpotifySong}
                      className="px-4 py-1.5 quiet-btn-primary text-xs flex items-center space-x-1"
                    >
                      <span>{isAddingSong ? "Adding..." : "Add to Sanctuary ♡"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
                {spotifyResults.length > 0 ? (
                  <div className="space-y-1.5">
                    {spotifyResults.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-canvas-elevated border border-transparent hover:border-canvas-border transition-all"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {track.coverUrl ? (
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-canvas-card flex items-center justify-center">
                              <Music className="w-4 h-4 text-accent-primary" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-ink-primary truncate">
                              {track.title}
                            </p>
                            <p className="text-[11px] text-ink-muted truncate">
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          {track.previewUrl && (
                            <button
                              type="button"
                              onClick={() => handleTogglePreview(track.previewUrl)}
                              className="p-1.5 rounded-full hover:bg-canvas-card text-ink-secondary"
                              title="Listen to 30s preview"
                            >
                              {activePreviewUrl === track.previewUrl && isPlayingPreview ? (
                                <Pause className="w-4 h-4 text-accent-primary" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedSpotifyTrack(track)}
                            className="px-3 py-1 rounded-full quiet-btn-outline text-xs"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2 text-ink-muted">
                    <Music className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs">
                      {isSearchingSpotify ? "Searching Spotify tracks..." : "Search for your favorite songs to add to our couple soundtrack."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* MODAL: EDIT PLAYLIST SETTINGS */}
      {editPlaylistModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="quiet-card p-6 sm:p-8 max-w-md w-full space-y-4 bg-canvas-card rounded-3xl">
              <div className="flex items-center justify-between pb-2 border-b border-canvas-border">
                <span className="text-xs font-sans uppercase tracking-wider text-emerald-500 font-semibold">
                  Spotify Settings
                </span>
                <button onClick={() => setEditPlaylistModalOpen(false)} className="text-ink-muted hover:text-ink-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-serif text-2xl text-ink-primary font-normal">Shared Playlist URL</h3>
              <p className="text-xs text-ink-secondary">
                Paste the link to your shared Spotify playlist to embed it in the sanctuary.
              </p>

              <form onSubmit={handleSavePlaylistUrl} className="space-y-4 text-xs">
                <div>
                  <label className="block text-ink-muted mb-1">Spotify Playlist URL or URI</label>
                  <input
                    type="url"
                    placeholder="https://open.spotify.com/playlist/..."
                    value={playlistUrlInput}
                    onChange={(e) => setPlaylistUrlInput(e.target.value)}
                    className="w-full quiet-input text-xs"
                  />
                  <p className="text-[10px] text-ink-muted/70 mt-1">
                    Open your Spotify app, click Share on your playlist, and choose &quot;Copy link to playlist&quot;.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditPlaylistModalOpen(false)}
                    className="quiet-btn-outline text-xs px-3.5 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPlaylist}
                    className="quiet-btn-primary text-xs px-4 py-1.5"
                  >
                    {isSavingPlaylist ? "Saving..." : "Save Playlist ♡"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
