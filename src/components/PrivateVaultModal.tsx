"use client";

import React, { useState } from "react";
import { Lock, Unlock, X, Shield, Plus, KeyRound, Image as ImageIcon } from "lucide-react";
import Portal from "@/components/Portal";

interface PrivateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VaultItem {
  id: string;
  title: string;
  category: string;
  secretText?: string | null;
  mediaUrls?: string | null;
  createdAt: string;
}

export default function PrivateVaultModal({ isOpen, onClose }: PrivateVaultModalProps) {
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // New item form state
  const [addingItem, setAddingItem] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSecretText, setNewSecretText] = useState("");
  const [newCategory, setNewCategory] = useState("note");

  if (!isOpen) return null;

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPinAndUnlock(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const verifyPinAndUnlock = async (pinToTest: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinToTest }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Incorrect Passcode");
        setPin("");
      } else {
        setIsUnlocked(true);
        setItems(data.items || []);
      }
    } catch (err) {
      setError("Network verification failure.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          action: "create",
          title: newTitle,
          secretText: newSecretText,
          category: newCategory,
        }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        setItems([data.item, ...items]);
        setAddingItem(false);
        setNewTitle("");
        setNewSecretText("");
      }
    } catch (err) {
      console.error("Failed to save vault item:", err);
    }
  };

  const handleClose = () => {
    setIsUnlocked(false);
    setPin("");
    setError(null);
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-lg quiet-card p-6 sm:p-8 space-y-5 bg-canvas-card">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-ink-muted hover:text-ink-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 mx-auto rounded-full bg-canvas-elevated border border-canvas-border flex items-center justify-center">
            {isUnlocked ? (
              <Unlock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Lock className="w-5 h-5 text-accent-primary" />
            )}
          </div>
          <h3 className="font-serif text-2xl text-ink-primary font-normal">
            Our Private Vault
          </h3>
          <p className="text-xs text-ink-muted font-sans max-w-sm mx-auto">
            {isUnlocked
              ? "Your private space is unlocked — view our hidden photos and memories."
              : "A private passcode-protected space for our most intimate photos, notes & memories."}
          </p>
        </div>

        {/* State 1: Locked - PIN Keypad */}
        {!isUnlocked ? (
          <div className="max-w-xs mx-auto space-y-5 pt-2">
            {/* PIN Dots */}
            <div className="flex justify-center space-x-3.5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    idx < pin.length
                      ? "bg-accent-primary border-accent-primary scale-110"
                      : "border-canvas-border bg-canvas-elevated"
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="text-center text-xs text-rose-500 font-sans animate-fade-in">
                {error}
              </div>
            )}

            {/* 3x4 Number Keypad */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinDigit(num)}
                  className="h-12 rounded-xl bg-canvas-elevated hover:bg-accent-primary/15 active:scale-95 border border-canvas-border text-base font-sans text-ink-primary transition-all"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handlePinDigit("0")}
                className="h-12 rounded-xl bg-canvas-elevated hover:bg-accent-primary/15 active:scale-95 border border-canvas-border text-base font-sans text-ink-primary transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-xl bg-canvas-elevated hover:bg-canvas-card active:scale-95 border border-canvas-border text-xs font-sans text-ink-muted transition-all flex items-center justify-center"
              >
                DEL
              </button>
            </div>

            <p className="text-center text-[11px] text-ink-muted font-sans pt-1">
              PIN default: 1409
            </p>
          </div>
        ) : (
          /* State 2: Unlocked - Vault Contents */
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-canvas-border/50 pb-2.5">
              <span className="text-xs text-ink-muted">
                {items.length} Vault Secrets
              </span>
              <button
                onClick={() => setAddingItem(!addingItem)}
                className="flex items-center space-x-1 px-3 py-1 quiet-btn-primary text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Secret</span>
              </button>
            </div>

            {addingItem && (
              <form onSubmit={handleSaveItem} className="quiet-card p-4 space-y-2.5 bg-canvas-elevated">
                <input
                  type="text"
                  required
                  placeholder="Secret Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full quiet-input px-3 py-1.5 text-xs"
                />
                <textarea
                  rows={3}
                  placeholder="Private text, vow, or code..."
                  value={newSecretText}
                  onChange={(e) => setNewSecretText(e.target.value)}
                  className="w-full quiet-input p-2.5 text-xs resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setAddingItem(false)}
                    className="px-3 py-1 text-xs text-ink-muted"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1 quiet-btn-primary text-xs">
                    Lock into Vault ♡
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="quiet-card p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-serif text-lg text-ink-primary font-normal">{item.title}</h4>
                    <span className="text-[10px] text-ink-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {item.secretText && (
                    <p className="font-serif italic text-xs text-ink-secondary leading-relaxed whitespace-pre-wrap">
                      &ldquo;{item.secretText}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </Portal>
  );
}
