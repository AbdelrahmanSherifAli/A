"use client";

import React, { useEffect, useState } from "react";
import { Mail, Lock, Unlock, PenTool, Sparkles, X, Heart, ShieldAlert } from "lucide-react";
import Portal from "@/components/Portal";

interface LetterItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isCurrentlyLocked: boolean;
  unlockDate?: string | null;
  author: { name: string; avatarUrl?: string | null };
  recipient: { name: string };
}

interface EnvelopeItem {
  id: string;
  title: string;
  prompt: string;
  content: string;
  waxColor: string;
  sealSymbol: string;
  isOpened: boolean;
  isCurrentlyLocked: boolean;
  unlockDate?: string | null;
}

export default function LettersSection() {
  const [letters, setLetters] = useState<LetterItem[]>([]);
  const [envelopes, setEnvelopes] = useState<EnvelopeItem[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<LetterItem | null>(null);
  const [openedEnvelope, setOpenedEnvelope] = useState<EnvelopeItem | null>(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  // Form state
  const [writeType, setWriteType] = useState<"letter" | "envelope">("letter");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formUnlockDate, setFormUnlockDate] = useState("");
  const [formPrompt, setFormPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const fetchLetters = () => {
    fetch("/api/letters")
      .then((res) => res.json())
      .then((data) => {
        if (data.letters) setLetters(data.letters);
        if (data.envelopes) setEnvelopes(data.envelopes);
      })
      .catch((err) => console.error("Error fetching letters:", err));
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleOpenEnvelope = async (env: EnvelopeItem) => {
    setOpenError(null);
    if (env.isCurrentlyLocked && env.unlockDate && new Date(env.unlockDate) > new Date()) {
      setOpenError(`This envelope is sealed with a temporal lock until ${new Date(env.unlockDate).toLocaleDateString()}.`);
      return;
    }

    setOpeningId(env.id);
    try {
      const res = await fetch("/api/letters/open-envelope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: env.id }),
      });
      const data = await res.json();
      if (res.ok && data.envelope) {
        setOpenedEnvelope(data.envelope);
        setEnvelopes((prev) =>
          prev.map((e) => (e.id === env.id ? { ...e, isOpened: true, content: data.envelope.content } : e))
        );
      } else {
        setOpenError(data.error || "Failed to open envelope.");
      }
    } catch (err) {
      console.error(err);
      setOpenError("Network error while breaking the wax seal.");
    } finally {
      setOpeningId(null);
    }
  };

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    setSubmitting(true);
    try {
      if (writeType === "letter") {
        const res = await fetch("/api/letters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle,
            content: formContent,
            unlockDate: formUnlockDate || null,
          }),
        });
        if (res.ok) {
          setWriteModalOpen(false);
          setFormTitle("");
          setFormContent("");
          setFormUnlockDate("");
          fetchLetters();
        }
      } else {
        const res = await fetch("/api/letters/create-envelope", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle,
            prompt: formPrompt || "Open when you need me most",
            content: formContent,
            unlockDate: formUnlockDate || null,
            waxColor: "gold",
            sealSymbol: "heart",
          }),
        });
        if (res.ok) {
          setWriteModalOpen(false);
          setFormTitle("");
          setFormPrompt("");
          setFormContent("");
          setFormUnlockDate("");
          fetchLetters();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-xs font-sans text-accent-primary uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5" />
            <span>Digital Drawer</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink-primary font-normal">
            Letters &amp; Open When
          </h2>
          <p className="text-xs text-ink-secondary font-serif italic">
            Digital sealed envelopes written just for you — open them whenever you need love, comfort, or a smile.
          </p>
        </div>

        <button
          onClick={() => setWriteModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 quiet-btn-primary text-xs self-start sm:self-auto shadow-sm"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Write a Letter ♡</span>
        </button>
      </div>

      {openError && (
        <div className="max-w-md mx-auto p-3.5 rounded-xl bg-accent-primary/15 border border-accent-primary/30 text-xs text-ink-primary flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-accent-primary shrink-0" />
          <span>{openError}</span>
        </div>
      )}

      {/* 1. Open When Envelopes Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-canvas-border/50 pb-2 gap-1">
          <div>
            <h3 className="font-serif text-xl text-ink-primary font-normal">
              &ldquo;Open When...&rdquo; Envelopes
            </h3>
            <p className="text-[11px] text-ink-muted">Special sealed envelopes to open during specific feelings or moments</p>
          </div>
          <span className="text-xs text-ink-muted font-sans shrink-0">
            {envelopes.length} Sealed Envelopes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {envelopes.map((env) => {
            const isLocked = env.isCurrentlyLocked;

            return (
              <div
                key={env.id}
                onClick={() => handleOpenEnvelope(env)}
                className={`quiet-card p-6 cursor-pointer flex flex-col justify-between h-60 relative overflow-hidden transition-all ${
                  env.isOpened
                    ? "bg-canvas-elevated/40"
                    : isLocked
                    ? "border-dashed"
                    : "hover:border-accent-primary"
                }`}
              >
                {/* Envelope Flap Accent */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/[0.04] dark:from-white/[0.04] to-transparent pointer-events-none" />

                {/* Top Label */}
                <div className="flex items-center justify-between relative z-10 text-xs text-ink-muted">
                  <span className="text-[10px] uppercase font-sans tracking-wider">
                    {env.isOpened ? "Opened" : isLocked ? "Locked" : "Sealed"}
                  </span>
                  {isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-accent-primary" />
                  ) : env.isOpened ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Heart className="w-3.5 h-3.5 text-accent-primary" />
                  )}
                </div>

                {/* Center Title */}
                <div className="text-center space-y-2 relative z-10 my-auto">
                  <h4 className="font-serif text-xl text-ink-primary font-normal leading-snug">
                    {env.title}
                  </h4>
                  <p className="text-xs text-ink-secondary line-clamp-2">
                    {env.prompt}
                  </p>

                  {/* Wax Seal Icon */}
                  <div className="pt-2 flex justify-center">
                    {isLocked ? (
                      <div className="w-10 h-10 rounded-full bg-canvas-elevated border border-canvas-border flex items-center justify-center text-ink-muted">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center text-accent-primary font-serif font-bold text-[11px] shadow-sm">
                        {env.isOpened ? "READ" : "US"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Status */}
                <div className="text-center text-[11px] text-ink-muted font-sans relative z-10">
                  {openingId === env.id ? (
                    <span className="animate-pulse">Unsealing...</span>
                  ) : env.unlockDate && isLocked ? (
                    <span>Locked until {new Date(env.unlockDate).toLocaleDateString()}</span>
                  ) : env.isOpened ? (
                    <span className="text-accent-secondary">Click to reread letter</span>
                  ) : (
                    <span className="text-accent-primary">Click to unseal ♡</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Personal Digital Letters */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-canvas-border/50 pb-2">
          <h3 className="font-serif text-xl text-ink-primary font-normal">
            Letters to Each Other
          </h3>
          <span className="text-xs text-ink-muted font-sans">
            {letters.length} Written Letters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {letters.map((letter) => (
            <div
              key={letter.id}
              onClick={() => setSelectedLetter(letter)}
              className="quiet-card p-6 space-y-3 cursor-pointer flex flex-col justify-between hover:border-accent-secondary"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>From {letter.author.name}</span>
                  <span>{new Date(letter.createdAt).toLocaleDateString()}</span>
                </div>

                <h4 className="font-serif text-2xl text-ink-primary font-normal">
                  {letter.title}
                </h4>

                <p className="font-serif italic text-xs text-ink-secondary line-clamp-3 leading-relaxed">
                  &ldquo;{letter.content}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-canvas-border/50 flex items-center justify-between text-xs text-accent-primary font-sans">
                <span>Click to unfold stationery</span>
                <span className="font-serif text-sm">♡</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unfolded Letter Modal */}
      {(selectedLetter || openedEnvelope) && (
        <Portal>
          <div
            onClick={() => {
              setSelectedLetter(null);
              setOpenedEnvelope(null);
            }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-white dark:bg-[#12151D]/90 backdrop-blur-2xl rounded-2xl p-6 sm:p-10 border border-white/10 shadow-2xl text-ink-primary space-y-5 max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  setSelectedLetter(null);
                  setOpenedEnvelope(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full text-ink-muted hover:text-ink-primary"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1.5 border-b border-canvas-border/60 pb-3">
                <span className="font-serif text-accent-primary text-sm">♡ US ♡</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-ink-primary">
                  {selectedLetter ? selectedLetter.title : openedEnvelope?.title}
                </h3>
                <p className="text-xs text-ink-muted font-sans">
                  {selectedLetter
                    ? `Written by ${selectedLetter.author.name} on ${new Date(selectedLetter.createdAt).toLocaleDateString()}`
                    : `Sealed Envelope: ${openedEnvelope?.prompt}`}
                </p>
              </div>

              <div className="font-serif text-base text-ink-primary leading-relaxed whitespace-pre-wrap px-2 py-2">
                {selectedLetter ? selectedLetter.content : openedEnvelope?.content}
              </div>

              <div className="text-center pt-3 border-t border-canvas-border/60 font-serif italic text-xs text-accent-primary">
                Forever &amp; Always Yours.
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Write Letter Modal */}
      {writeModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-lg quiet-card p-6 sm:p-8 space-y-4 bg-canvas-card">
              <div className="flex items-center justify-between border-b border-canvas-border/50 pb-3">
                <h3 className="font-serif text-2xl text-ink-primary font-normal">
                  {writeType === "letter" ? "Write a Letter" : "Create Open When Envelope"}
                </h3>
                <button onClick={() => setWriteModalOpen(false)} className="text-ink-muted hover:text-ink-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Switch type */}
              <div className="flex rounded-full bg-canvas-elevated p-1 border border-canvas-border text-xs">
                <button
                  type="button"
                  onClick={() => setWriteType("letter")}
                  className={`flex-1 py-1.5 rounded-full font-medium transition-all ${
                    writeType === "letter"
                      ? "bg-accent-primary text-white shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  Personal Letter
                </button>
                <button
                  type="button"
                  onClick={() => setWriteType("envelope")}
                  className={`flex-1 py-1.5 rounded-full font-medium transition-all ${
                    writeType === "envelope"
                      ? "bg-accent-primary text-white shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  Open When... Envelope
                </button>
              </div>

              <form onSubmit={handleWriteSubmit} className="space-y-3 text-xs">
                {writeType === "letter" ? (
                  <div>
                    <label className="block text-ink-muted font-sans mb-1">Letter Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., A note for when you wake up"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full quiet-input px-3 py-1.5"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-ink-muted font-sans mb-1">Envelope Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Open When You Need a Hug"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full quiet-input px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-ink-muted font-sans mb-1">Envelope Cue / Prompt</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., For when the world feels loud and exhausting."
                        value={formPrompt}
                        onChange={(e) => setFormPrompt(e.target.value)}
                        className="w-full quiet-input px-3 py-1.5"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-ink-muted font-sans mb-1">The Message Content</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Write from the deepest part of your heart..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full quiet-input p-3 font-serif italic text-sm resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-ink-muted font-sans mb-1">
                    Lock Until A Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formUnlockDate}
                    onChange={(e) => setFormUnlockDate(e.target.value)}
                    className="w-full quiet-input px-3 py-1.5"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setWriteModalOpen(false)}
                    className="px-4 py-2 text-xs text-ink-muted hover:text-ink-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 quiet-btn-primary text-xs"
                  >
                    {submitting ? "Sealing..." : "Seal Letter ♡"}
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
