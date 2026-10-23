"use client";

import React, { useState } from "react";
import { X, Upload, MapPin, Calendar, Heart, Camera } from "lucide-react";
import Portal from "@/components/Portal";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryAdded: () => void;
}

export default function AddMemoryModal({ isOpen, onClose, onMemoryAdded }: AddMemoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState("romantic");
  const [addToTimeline, setAddToTimeline] = useState(true);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.url as string | undefined;
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((u): u is string => Boolean(u));
      if (validUrls.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...validUrls]);
      }
    } catch (err) {
      console.error("Failed to upload photos:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !memoryDate) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          memoryDate,
          location: location || null,
          mood,
          photos: uploadedPhotos,
          addToTimeline,
        }),
      });

      if (res.ok) {
        onMemoryAdded();
        onClose();
        setTitle("");
        setDescription("");
        setUploadedPhotos([]);
      }
    } catch (err) {
      console.error("Failed to create memory:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-xl quiet-card p-6 sm:p-8 space-y-4 bg-canvas-card max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-canvas-border/50 pb-3">
          <div>
            <h3 className="font-serif text-2xl text-ink-primary font-normal">Record a Memory</h3>
            <p className="text-xs text-ink-muted">Save a special moment with photos, date, and story to our shared scrapbook.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-ink-muted hover:text-ink-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-ink-muted font-sans font-medium">Title</label>
              <span className="text-[10px] text-ink-muted">Name this special moment</span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Sunset on the Citadel..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full quiet-input px-3.5 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-ink-muted font-sans font-medium">Date</label>
                <span className="text-[10px] text-ink-muted">When it happened</span>
              </div>
              <input
                type="date"
                required
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full quiet-input px-3 py-1.5"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-ink-muted font-sans font-medium">Location</label>
                <span className="text-[10px] text-ink-muted">Where we were</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Alexandria, Egypt"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full quiet-input px-3 py-1.5"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-ink-muted font-sans font-medium">Story &amp; Feelings</label>
              <span className="text-[10px] text-ink-muted">What made this unforgettable?</span>
            </div>
            <textarea
              required
              rows={3}
              placeholder="What made this moment special? What did we laugh about? How did you feel?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full quiet-input p-3 font-serif leading-relaxed resize-none text-xs"
            />
          </div>

          {/* Photo Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-ink-muted font-sans font-medium">Photos</label>
              <span className="text-[10px] text-ink-muted">Select multiple photos • click × to remove</span>
            </div>
            <div className="flex flex-wrap gap-2.5 items-center">
              {uploadedPhotos.map((url, i) => (
                <div key={i} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-canvas-border shadow-xs">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-xs"
                    title="Remove photo"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <label className="w-14 h-14 rounded-xl border-2 border-dashed border-canvas-border hover:border-accent-primary bg-canvas-elevated flex flex-col items-center justify-center cursor-pointer text-ink-muted hover:text-accent-primary transition-colors">
                <Camera className="w-4 h-4 mb-0.5" />
                <span className="text-[9px]">{uploading ? "..." : "+ Photo"}</span>
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="timelineCheck"
              checked={addToTimeline}
              onChange={(e) => setAddToTimeline(e.target.checked)}
              className="rounded border-canvas-border"
            />
            <label htmlFor="timelineCheck" className="text-ink-secondary text-xs cursor-pointer">
              Also pin this memory as a special milestone on our relationship timeline
            </label>
          </div>

          <div className="pt-2 flex justify-end space-x-2.5 border-t border-canvas-border/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-ink-muted hover:text-ink-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 quiet-btn-primary text-xs"
            >
              {submitting ? "Saving..." : "Preserve Forever ♡"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
