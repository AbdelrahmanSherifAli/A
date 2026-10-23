"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Settings, Heart, Lock, Calendar, Save, Check } from "lucide-react";
import Portal from "@/components/Portal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { coupleSettings, refreshAuth } = useAuth();

  const [partner1Name, setPartner1Name] = useState(coupleSettings?.partner1Name || "Abdel");
  const [partner2Name, setPartner2Name] = useState(coupleSettings?.partner2Name || "Nour");
  const [anniversaryDate, setAnniversaryDate] = useState(
    coupleSettings?.anniversaryDate
      ? new Date(coupleSettings.anniversaryDate).toISOString().split("T")[0]
      : "2026-09-05"
  );
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState(
    coupleSettings?.spotifyPlaylistUrl || "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
  );
  const [quote, setQuote] = useState(
    coupleSettings?.relationshipQuote || "Every little ordinary second with you is my favorite memory."
  );
  const [partner1SpotifyUrl, setPartner1SpotifyUrl] = useState("");
  const [partner2SpotifyUrl, setPartner2SpotifyUrl] = useState("");
  const [newPin, setNewPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner1Name,
          partner2Name,
          anniversaryDate,
          relationshipQuote: quote,
          spotifyPlaylistUrl,
          partner1SpotifyUrl: partner1SpotifyUrl || undefined,
          partner2SpotifyUrl: partner2SpotifyUrl || undefined,
          newVaultPin: newPin || undefined,
        }),
      });

      if (res.ok) {
        await refreshAuth();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg quiet-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-stone-800/60 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-romantic-terracotta dark:text-romantic-rose">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-canvas-text font-medium tracking-tight">Our Space Settings</h3>
              <p className="text-[11px] text-canvas-text-muted">Customize our names, anniversary date, Spotify playlist &amp; vault PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-200/50 dark:hover:bg-stone-800/50 text-canvas-text-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-canvas-text-muted mb-1.5 font-medium">Partner 1</label>
              <input
                type="text"
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
                className="quiet-input text-sm"
              />
            </div>
            <div>
              <label className="block text-canvas-text-muted mb-1.5 font-medium">Partner 2</label>
              <input
                type="text"
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                className="quiet-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-canvas-text-muted mb-1.5 font-medium">Anniversary Start Date</label>
            <input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="quiet-input text-sm"
            />
            <p className="text-[10px] text-canvas-text-muted/70 mt-1">
              Drives the live running counter card on the main dashboard.
            </p>
          </div>

          <div>
            <label className="block text-canvas-text-muted mb-1.5 font-medium">Our Relationship Quote</label>
            <textarea
              rows={2}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="quiet-input text-sm font-serif italic"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-stone-300/30 dark:border-stone-800/50">
            <div>
              <label className="block text-canvas-text-muted mb-1.5 font-medium flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Our Shared Spotify Playlist URL</span>
              </label>
              <input
                type="url"
                placeholder="https://open.spotify.com/playlist/..."
                value={spotifyPlaylistUrl}
                onChange={(e) => setSpotifyPlaylistUrl(e.target.value)}
                className="quiet-input text-sm"
              />
              <p className="text-[10px] text-canvas-text-muted/70 mt-1">
                Paste any Spotify Playlist link to embed it in our Soundtrack space.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-canvas-text-muted mb-1 font-medium">{partner1Name}&apos;s Spotify Profile</label>
                <input
                  type="url"
                  placeholder="https://open.spotify.com/user/..."
                  value={partner1SpotifyUrl}
                  onChange={(e) => setPartner1SpotifyUrl(e.target.value)}
                  className="quiet-input text-xs"
                />
              </div>
              <div>
                <label className="block text-canvas-text-muted mb-1 font-medium">{partner2Name}&apos;s Spotify Profile</label>
                <input
                  type="url"
                  placeholder="https://open.spotify.com/user/..."
                  value={partner2SpotifyUrl}
                  onChange={(e) => setPartner2SpotifyUrl(e.target.value)}
                  className="quiet-input text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-canvas-text-muted mb-1.5 font-medium">Update Vault PIN (4 digits)</label>
            <input
              type="password"
              maxLength={4}
              placeholder="Leave blank to keep existing PIN (default: 1234)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="quiet-input text-sm font-mono tracking-widest"
            />
          </div>

          {savedSuccess && (
            <div className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Settings updated successfully ♡</span>
            </div>
          )}

          <div className="pt-3 flex justify-end space-x-2.5 border-t border-stone-300/40 dark:border-stone-800/60">
            <button
              type="button"
              onClick={onClose}
              className="quiet-btn-outline text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="quiet-btn-primary text-xs px-5 py-2 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
