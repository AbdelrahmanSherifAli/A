"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  MessageSquare,
  Clock,
  ChevronDown,
  Video,
  Plus,
  Heart,
  Pin,
  BookmarkCheck,
  BookmarkPlus,
  Camera,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCheck,
  Sparkles,
  X,
  Smile,
  Mic,
  Play,
  Pause,
  Trash2,
  Compass,
  MapPin,
  Calendar,
  ArrowLeft,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface PlanItem {
  id: string;
  title: string;
  description?: string | null;
  targetDate?: string | null;
  location?: string | null;
  category: string;
  status: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface MessageItem {
  id: string;
  senderId: string;
  text?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt: string;
  isRead: boolean;
  isPinned?: boolean;
  savedToMemoryId?: string | null;
  reactions?: string | null;
  planId?: string | null;
  sender: {
    id: string;
    name: string;
    nickname?: string | null;
    avatarUrl?: string | null;
  };
}

// Relative time formatter to match mockup ("5 min ago", "4 min ago", "2 min ago", "03:42")
function formatMessageTime(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

// Custom Voice Note Player Component
function VoiceNoteBubble({ mediaUrl, isMe }: { mediaUrl: string; isMe: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bars = [35, 65, 40, 85, 55, 95, 45, 80, 50, 75, 35, 90, 60, 85, 40, 65, 80, 50, 70, 40];

  return (
    <div className="flex items-center space-x-3 py-1.5 px-1 min-w-[210px] sm:min-w-[250px] select-none">
      <audio
        ref={audioRef}
        src={mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
          isMe
            ? "bg-[#D4A853] text-black hover:scale-105 shadow-md shadow-[#D4A853]/25"
            : "bg-white/15 text-white hover:bg-white/25 hover:scale-105"
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center space-y-1">
        {/* Interactive Waveform bars */}
        <div
          className="flex items-center space-x-1 h-5 cursor-pointer"
          onClick={(e) => {
            if (!audioRef.current || !duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, clickX / rect.width));
            audioRef.current.currentTime = pct * duration;
          }}
        >
          {bars.map((h, i) => {
            const barPct = (i / bars.length) * 100;
            const isPassed = barPct <= progress;
            return (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? isMe
                      ? "bg-[#D4A853]"
                      : "bg-white"
                    : "bg-white/20"
                }`}
              />
            );
          })}
        </div>

        <div className="flex justify-between text-[10px] text-stone-400 font-mono">
          <span>{formatSeconds(currentTime)}</span>
          <span>{duration > 0 ? formatSeconds(duration) : "Voice Note"}</span>
        </div>
      </div>
    </div>
  );
}

export default function CoupleChat() {
  const { user, partner } = useAuth();
  const { socket, isPartnerOnline, partnerTyping, sendTypingStatus } = useSocket();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [memorySavedId, setMemorySavedId] = useState<string | null>(null);

  // Left sidebar collapse & plan threads
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [callingPartner, setCallingPartner] = useState(false);

  // Talk About Our Plans state
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [activePlan, setActivePlan] = useState<PlanItem | null>(null);
  const activePlanRef = useRef<PlanItem | null>(null);

  // New Plan Modal & Info Modal
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showPlanInfoModal, setShowPlanInfoModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newPlanCategory, setNewPlanCategory] = useState("date");
  const [newPlanTargetDate, setNewPlanTargetDate] = useState("");
  const [newPlanLocation, setNewPlanLocation] = useState("");
  const [newPlanDescription, setNewPlanDescription] = useState("");
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  // Keep activePlanRef in sync for realtime socket events
  useEffect(() => {
    activePlanRef.current = activePlan;
  }, [activePlan]);

  const loadPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (data.plans) {
        setPlans(data.plans);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Voice note recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = (planId?: string | null) => {
    const currentPlanId = planId !== undefined ? planId : (activePlan?.id || null);
    const url = currentPlanId ? `/api/chat?planId=${encodeURIComponent(currentPlanId)}` : "/api/chat";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
          setTimeout(scrollToBottom, 100);
        }
      })
      .catch((err) => console.error("Error fetching chat messages:", err));
  };

  // Reload messages when switching between general chat and a plan thread
  useEffect(() => {
    loadMessages(activePlan?.id || null);
  }, [activePlan?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: MessageItem) => {
      const currentPlanId = activePlanRef.current?.id || null;
      const msgPlanId = msg.planId || null;
      if (currentPlanId === msgPlanId) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 50);
      }
    };

    const handleMessageUpdated = (updated: MessageItem) => {
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_updated", handleMessageUpdated);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_updated", handleMessageUpdated);
    };
  }, [socket]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !user) return;

    setInputText("");
    setShowPlusMenu(false);
    sendTypingStatus(false);

    const payload = {
      senderId: user.id,
      text: textToSend,
      planId: activePlan?.id || null,
    };

    if (socket && socket.connected) {
      socket.emit("chat_message", payload);
      socket.emit("send_message", payload);
    } else {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => [...prev, data.message]);
          setTimeout(scrollToBottom, 50);
        }
      } catch (err) {
        console.error("Send message error:", err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setShowPlusMenu(false);
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await uploadRes.json();

      if (data.url) {
        const mediaType = file.type.startsWith("image/") ? "photo" : "voice";
        const payload = {
          senderId: user.id,
          mediaUrl: data.url,
          mediaType,
          planId: activePlan?.id || null,
        };

        if (socket && socket.connected) {
          socket.emit("chat_message", payload);
          socket.emit("send_message", payload);
        } else {
          const msgRes = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (msgRes.ok) {
            const mData = await msgRes.json();
            setMessages((prev) => [...prev, mData.message]);
            setTimeout(scrollToBottom, 50);
          }
        }
      }
    } catch (err) {
      console.error("File upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startVoiceRecording = async () => {
    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        alert("Microphone recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone permission is required to record voice notes.");
    }
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const sendVoiceRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") return;

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const mimeType = mediaRecorderRef.current.mimeType || "audio/webm";

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      if (audioBlob.size === 0) {
        setIsRecording(false);
        setRecordingSeconds(0);
        return;
      }

      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      const file = new File([audioBlob], `voice_${Date.now()}.${ext}`, { type: mimeType });

      const formData = new FormData();
      formData.append("file", file);

      setUploading(true);
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await uploadRes.json();

        if (data.url && user) {
          const payload = {
            senderId: user.id,
            mediaUrl: data.url,
            mediaType: "voice",
            planId: activePlan?.id || null,
          };

          if (socket && socket.connected) {
            socket.emit("chat_message", payload);
            socket.emit("send_message", payload);
          } else {
            const msgRes = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (msgRes.ok) {
              const mData = await msgRes.json();
              setMessages((prev) => [...prev, mData.message]);
              setTimeout(scrollToBottom, 50);
            }
          }
        }
      } catch (err) {
        console.error("Voice note upload failed:", err);
      } finally {
        setUploading(false);
        setIsRecording(false);
        setRecordingSeconds(0);
      }
    };

    mediaRecorderRef.current.stop();
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;

    setIsCreatingPlan(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPlanTitle.trim(),
          category: newPlanCategory,
          targetDate: newPlanTargetDate || null,
          location: newPlanLocation.trim() || null,
          description: newPlanDescription.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.plan) {
        setPlans((prev) => [data.plan, ...prev]);
        setActivePlan(data.plan);
        setShowAddPlanModal(false);
        setNewPlanTitle("");
        setNewPlanDescription("");
        setNewPlanLocation("");
        setNewPlanTargetDate("");
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#d4a853", "#9A6660", "#B7897E", "#FAF5F0"],
        });
      }
    } catch (err) {
      console.error("Create plan error:", err);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const handleSaveAsMemory = async (messageId: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_as_memory", messageId }),
      });
      if (res.ok) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#d4a853", "#9A6660", "#B7897E", "#FAF5F0"],
        });
        setMemorySavedId(messageId);
        setTimeout(() => setMemorySavedId(null), 3000);
        loadMessages();
      }
    } catch (err) {
      console.error("Save as memory error:", err);
    }
  };

  const handleTogglePin = async (messageId: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pin", messageId }),
      });
      if (res.ok) loadMessages();
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (!socket || !user) return;
    socket.emit("react_message", {
      messageId,
      emoji,
      userId: user.id,
    });
  };

  const isUserAbdel = user?.email.includes("abdel");
  const defaultUserAvatar = isUserAbdel ? "/assets/avatar_abdel.jpg" : "/assets/avatar_nour.jpg";
  const defaultPartnerAvatar = isUserAbdel ? "/assets/avatar_nour.jpg" : "/assets/avatar_abdel.jpg";
  const partnerName = partner?.name || (isUserAbdel ? "Nour" : "Abdel");

  const getCategoryEmoji = (category?: string) => {
    switch (category) {
      case "trip":
        return "✈️";
      case "date":
        return "🍷";
      case "experience":
        return "🎨";
      case "creative":
        return "✨";
      default:
        return "📍";
    }
  };

  const filteredMessages = messages;

  const lastMessage = messages[messages.length - 1];
  const lastTimeStr = lastMessage
    ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    : "03:42";

  return (
    <div className="relative z-10 w-full h-full flex-1 flex flex-col overflow-hidden bg-[#101216] text-[#E8DED5] min-h-0">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,audio/*"
        className="hidden"
      />

      {/* Full-width & Full-height Edge-to-Edge Chat Window */}
      <div className="w-full h-full flex-1 flex overflow-hidden min-h-0">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SIMPLE CHAT & RECENT CHATS (EXACT MATCH TO MOCKUP)           */}
        {/* ========================================================================= */}
        <div
          className={`${
            sidebarOpen ? "w-72 sm:w-80 flex" : "hidden sm:flex sm:w-16"
          } flex-col bg-[#14161C] border-r border-white/[0.08] transition-all duration-300 shrink-0 select-none h-full`}
        >
          {/* Top Header: Speech Bubble + Simple Chat + Underline + Collapse Icon */}
          <div className="p-5 pb-3 border-b border-white/[0.06] flex items-start justify-between">
            <div className="overflow-hidden">
              <div className="flex items-center space-x-2.5">
                <MessageSquare className="w-4 h-4 text-[#D4A853] stroke-[2]" />
                <span className="text-[15px] font-semibold text-white tracking-tight">
                  Our Chat
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-sans pt-0.5">
                Our private chat, whispers &amp; voice notes
              </p>
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-stone-400 hover:text-white transition-colors p-1"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 stroke-[1.75]" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 stroke-[1.75]" />
              )}
            </button>
          </div>

          {/* Category Header: Main Chat */}
          {sidebarOpen && (
            <div className="px-5 pt-4 pb-2 flex items-center justify-between text-stone-400">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-stone-400 stroke-[1.75]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300/80">
                  MAIN CONVERSATION
                </span>
              </div>
            </div>
          )}

          {/* Contact / Channel List */}
          <div className="flex-1 overflow-y-auto py-1 space-y-1">
            {/* 1. Main Partner Conversation (Our Chat / Nour) */}
            <button
              onClick={() => setActivePlan(null)}
              className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-all relative ${
                activePlan === null
                  ? "bg-[#D4A853]/15 border-l-2 border-[#D4A853] text-white shadow-inner"
                  : "hover:bg-white/[0.04] text-stone-300"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/15 bg-stone-900 shadow-md">
                  <img
                    src={partner?.avatarUrl || defaultPartnerAvatar}
                    alt={partnerName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-sm font-semibold text-white truncate">
                        {partnerName}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isPartnerOnline ? "bg-emerald-400" : "bg-emerald-400/80"
                        }`}
                      />
                    </div>
                    <span className="text-xs text-stone-400 font-mono pl-2 shrink-0">
                      {lastTimeStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-stone-400 truncate pr-2 font-normal">
                      {partnerTyping ? (
                        <span className="text-[#d4a853] italic">Typing...</span>
                      ) : activePlan === null && lastMessage?.text ? (
                        lastMessage.text
                      ) : (
                        "Our private space ♡"
                      )}
                    </p>
                    {activePlan === null && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#D4A853]/25 text-[#D4A853] font-bold text-[9px]">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>

            {/* 2. TALK ABOUT OUR PLANS SECTION HEADER */}
            <div className="pt-4 pb-2 px-4 border-t border-white/[0.06] mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-stone-400">
                <Compass className="w-3.5 h-3.5 text-[#D4A853]" />
                {sidebarOpen && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-300/90">
                    TALK ABOUT OUR PLANS
                  </span>
                )}
                {sidebarOpen && plans.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#D4A853]/20 text-[10px] font-bold text-[#D4A853]">
                    {plans.length}
                  </span>
                )}
              </div>

              {sidebarOpen && (
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(true)}
                  className="px-2 py-0.5 rounded-lg bg-[#D4A853]/15 hover:bg-[#D4A853]/25 text-[#D4A853] border border-[#D4A853]/30 text-[10px] font-semibold flex items-center space-x-1 transition-all cursor-pointer shadow-sm"
                  title="Add a new plan to discuss"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>New Plan</span>
                </button>
              )}
            </div>

            {/* List of Plans with Dedicated Persistent Threads */}
            {plans.length === 0 ? (
              sidebarOpen && (
                <div className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAddPlanModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#D4A853]/40 bg-[#D4A853]/5 hover:bg-[#D4A853]/10 text-xs text-[#D4A853] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add our first plan</span>
                  </button>
                </div>
              )
            ) : (
              plans.map((plan) => {
                const isSelected = activePlan?.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setActivePlan(plan)}
                    className={`w-full px-4 py-2.5 flex items-center space-x-3 text-left transition-all relative ${
                      isSelected
                        ? "bg-[#D4A853]/15 border-l-2 border-[#D4A853] text-white shadow-inner"
                        : "hover:bg-white/[0.04] text-stone-300"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1C1E26] border border-white/10 flex items-center justify-center text-sm shrink-0 shadow-sm">
                      {getCategoryEmoji(plan.category)}
                    </div>

                    {sidebarOpen && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                            {plan.title}
                          </span>
                          {plan.targetDate && (
                            <span className="text-[10px] text-stone-400 font-mono pl-1 shrink-0">
                              {new Date(plan.targetDate).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-0.5">
                          <p className="text-[11px] text-stone-400 truncate pr-1">
                            {plan.location ? `📍 ${plan.location}` : "Dedicated Plan Chat ♡"}
                          </p>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A853] shrink-0" />
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Sidebar Bottom Indicator `•••` from mockup */}
          <div className="py-3 border-t border-white/[0.05] flex items-center justify-center space-x-1 text-stone-500">
            <span className="w-1 h-1 rounded-full bg-stone-500/80" />
            <span className="w-1 h-1 rounded-full bg-stone-500/80" />
            <span className="w-1 h-1 rounded-full bg-stone-500/80" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: MAIN CHAT PANEL (ADAPTS TO MAIN OR ACTIVE PLAN)             */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col bg-[#0E1015] relative overflow-hidden h-full min-w-0">
          {/* Top Bar: "To: Partner Name" OR "Plan: Title" */}
          <div className="px-5 sm:px-6 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-[#14161C] shrink-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              {activePlan && (
                <button
                  type="button"
                  onClick={() => setActivePlan(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors mr-1 cursor-pointer"
                  title="Back to Main Chat"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {activePlan ? (
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-lg shrink-0">{getCategoryEmoji(activePlan.category)}</span>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                        {activePlan.title}
                      </span>
                      <span className="text-[#D4A853] text-xs">♡</span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-sans truncate">
                      {activePlan.location ? `📍 ${activePlan.location}` : "Our Shared Plan"}
                      {activePlan.targetDate
                        ? ` • 📅 ${new Date(activePlan.targetDate).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}`
                        : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-stone-400 font-normal">To:</span>
                  <span className="text-base font-semibold text-white tracking-tight flex items-center space-x-1.5">
                    <span>{partnerName}</span>
                    <span className="text-[#EF4444] text-xs">♡</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {activePlan && (
                <button
                  type="button"
                  onClick={() => setShowPlanInfoModal(true)}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Plan Details"
                >
                  <Info className="w-3.5 h-3.5 text-[#D4A853]" />
                  <span className="hidden sm:inline">Details</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCallingPartner(true);
                  setTimeout(() => setCallingPartner(false), 3500);
                }}
                className="text-stone-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                title="Private Video Call"
              >
                <Video className="w-5 h-5 stroke-[1.75]" />
              </button>
            </div>
          </div>

          {/* Calling private stream simulation */}
          {callingPartner && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl bg-black/85 border border-[#d4a853]/40 shadow-2xl flex items-center space-x-3 animate-fade-in text-xs backdrop-blur-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-stone-200">Connecting private video link to {partnerName}... ♡</span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Centered Capsule Date Pill "TODAY" from mockup */}
            <div className="flex justify-center my-1">
              <span className="px-3.5 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.08] text-[10px] font-semibold uppercase tracking-widest text-stone-400 shadow-sm backdrop-blur-md">
                TODAY
              </span>
            </div>

            {filteredMessages.length === 0 ? (
              activePlan ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#D4A853]/15 border border-[#D4A853]/30 flex items-center justify-center text-2xl shadow-lg">
                    {getCategoryEmoji(activePlan.category)}
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-base font-semibold text-white">
                      Let&apos;s talk about our plan: {activePlan.title}
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Share ideas, dates, things you want to do, photos, and voice notes! Everything in this thread is saved specifically for this plan. ♡
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 justify-center max-w-md">
                    {[
                      "What day works best for you? 🗓️",
                      "I have some cute ideas for this! ✨",
                      "Let's look at places to go 📍",
                      "Can't wait to do this together 🥰",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSendMessage(undefined, suggestion)}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-stone-300 transition-all hover:scale-105 cursor-pointer shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 text-stone-400">
                  <Heart className="w-8 h-8 text-[#d4a853]/60 stroke-[1.5] animate-pulse" />
                  <p className="text-sm italic">
                    Say something sweet to {partnerName}...
                  </p>
                </div>
              )
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const senderAvatar = isMe ? defaultUserAvatar : defaultPartnerAvatar;

                let reactions: Record<string, string[]> = {};
                try {
                  if (msg.reactions) reactions = JSON.parse(msg.reactions);
                } catch {}

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} group/msg relative`}
                  >
                    {/* Message Bubble + Avatar Row (Matching mockup layout) */}
                    <div
                      className={`flex items-start max-w-[85%] sm:max-w-md ${
                        isMe ? "flex-row justify-end" : "flex-row justify-start"
                      }`}
                    >
                      {/* Incoming Avatar (on LEFT side if Partner) */}
                      {!isMe && (
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shadow-sm shrink-0 mr-3 mt-0.5 bg-stone-900">
                          <img
                            src={msg.sender?.avatarUrl || senderAvatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Bubble & Timestamp column */}
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        {/* Glassy Translucent Bubble */}
                        <div
                          className={`p-3 px-4 transition-all text-[13px] leading-relaxed shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-md border ${
                            isMe
                              ? "bg-white/[0.08] text-[#FAF5F0] rounded-2xl rounded-tr-xs border-white/[0.09]"
                              : "bg-white/[0.07] text-[#FAF5F0] rounded-2xl rounded-tl-xs border-white/[0.08]"
                          }`}
                        >
                          {msg.mediaUrl && (
                            msg.mediaType === "voice" || msg.mediaUrl.endsWith(".webm") || msg.mediaUrl.endsWith(".mp3") || msg.mediaUrl.endsWith(".ogg") || msg.mediaUrl.endsWith(".wav") ? (
                              <VoiceNoteBubble mediaUrl={msg.mediaUrl} isMe={isMe} />
                            ) : (
                              <div className="rounded-xl overflow-hidden border border-white/10 max-h-60 max-w-sm mb-2 shadow-inner">
                                <img src={msg.mediaUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            )
                          )}

                          {msg.text && (
                            <p className="whitespace-pre-wrap font-normal">
                              {msg.text}
                            </p>
                          )}
                        </div>

                        {/* Timestamp below bubble matching mockup ("5 min ago", "4 min ago", "2 min ago") */}
                        <div
                          className={`flex items-center space-x-1.5 text-[10px] text-stone-400 mt-1 px-1 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {msg.savedToMemoryId && (
                            <span className="flex items-center space-x-0.5 text-[#d4a853]">
                              <BookmarkCheck className="w-3 h-3" />
                              <span>Saved</span>
                            </span>
                          )}
                          <span>{formatMessageTime(msg.createdAt)}</span>
                          {isMe && (
                            <CheckCheck
                              className={`w-3 h-3 ${msg.isRead ? "text-emerald-400" : "opacity-40"}`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Outgoing Avatar (on RIGHT side if Me) */}
                      {isMe && (
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shadow-sm shrink-0 ml-3 mt-0.5 bg-stone-900">
                          <img
                            src={msg.sender?.avatarUrl || senderAvatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Micro hover actions (Save to Story, Pin, Reactions) */}
                    <div
                      className={`opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center space-x-1.5 pt-1 px-12 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <button
                        onClick={() => handleSaveAsMemory(msg.id)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-[10px] text-stone-300 transition-all backdrop-blur-md"
                        title="Save to Our Story"
                      >
                        <BookmarkPlus className="w-3 h-3 text-[#d4a853]" />
                        <span>Save to Story ♡</span>
                      </button>

                      <button
                        onClick={() => handleTogglePin(msg.id)}
                        className="p-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-[10px] text-stone-300 backdrop-blur-md"
                        title="Pin message"
                      >
                        <Pin className="w-3 h-3" />
                      </button>

                      {["❤️", "🥰", "😂", "🥺"].map((em) => (
                        <button
                          key={em}
                          onClick={() => handleReact(msg.id, em)}
                          className="p-0.5 text-xs hover:scale-125 transition-transform"
                        >
                          {em}
                        </button>
                      ))}
                    </div>

                    {/* Active reactions pill */}
                    {Object.keys(reactions).length > 0 && (
                      <div
                        className={`flex items-center space-x-1 pt-0.5 px-12 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {Object.entries(reactions).map(([emoji, uids]) => (
                          <button
                            key={emoji}
                            onClick={() => handleReact(msg.id, emoji)}
                            className={`px-2 py-0.2 rounded-full text-xs flex items-center space-x-1 border backdrop-blur-md ${
                              uids.includes(user?.id || "")
                                ? "bg-[#d4a853]/20 border-[#d4a853] text-[#d4a853]"
                                : "bg-white/[0.06] border-white/10 text-stone-300"
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] font-mono">{uids.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Typing indicator matching mockup: ••• Typing... */}
            {partnerTyping && (
              <div className="flex items-center space-x-2 text-xs text-stone-400 italic py-1 px-2">
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
                </span>
                <span>Typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM INPUT BAR: EXACT MATCH TO MOCKUP (+ Type something... Send)        */}
          {/* ========================================================================= */}
          <div className="p-4 border-t border-white/[0.08] bg-[#14161C] relative shrink-0">
            {/* Quick Plus Media Menu */}
            {showPlusMenu && (
              <div className="absolute bottom-16 left-4 z-40 p-2 rounded-2xl bg-[#1A1D24] border border-white/15 shadow-2xl space-y-1 text-xs animate-fade-in backdrop-blur-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlusMenu(false);
                    startVoiceRecording();
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center space-x-2.5 text-stone-200 text-left transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-[#d4a853]" />
                  <span>Record Voice Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center space-x-2.5 text-stone-200 text-left transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#d4a853]" />
                  <span>Send Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, "Thinking of you right now ♡")}
                  className="w-full px-3 py-2 rounded-xl hover:bg-white/10 flex items-center space-x-2.5 text-stone-200 text-left transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Send Love Note</span>
                </button>
              </div>
            )}

            {isRecording ? (
              <div className="bg-[#1C1E26] border border-red-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-lg animate-fade-in">
                <div className="flex items-center space-x-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-mono text-red-400 font-semibold">
                    Recording: {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}
                  </span>
                  <div className="flex items-center space-x-1 h-4">
                    <span className="w-0.5 h-2 bg-red-400 animate-pulse" />
                    <span className="w-0.5 h-4 bg-red-400 animate-pulse [animation-delay:0.15s]" />
                    <span className="w-0.5 h-3 bg-red-400 animate-pulse [animation-delay:0.3s]" />
                    <span className="w-0.5 h-5 bg-red-400 animate-pulse [animation-delay:0.45s]" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={cancelVoiceRecording}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                    title="Cancel recording"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={sendVoiceRecording}
                    disabled={uploading}
                    className="px-3.5 py-1.5 rounded-lg bg-[#D4A853] hover:bg-[#c29845] text-black font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                    title="Send voice note"
                  >
                    <span>{uploading ? "Sending..." : "Send Voice Note"}</span>
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className="bg-[#1C1E26] hover:bg-[#21242E] focus-within:bg-[#21242E] border border-white/[0.08] focus-within:border-[#d4a853]/40 rounded-xl px-4 py-2.5 flex items-center space-x-3 shadow-lg transition-all"
              >
                {/* "+" Action Button from mockup */}
                <button
                  type="button"
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className="text-stone-400 hover:text-white transition-colors cursor-pointer p-0.5"
                  title="Add media or voice note"
                >
                  <Plus className="w-4 h-4 stroke-[2]" />
                </button>

                {/* Input field: Type something... */}
                <input
                  type="text"
                  value={inputText}
                  onChange={handleTextChange}
                  placeholder={uploading ? "Uploading media..." : "Type something..."}
                  disabled={uploading}
                  className="flex-1 bg-transparent text-sm text-[#FAF5F0] placeholder-stone-500 focus:outline-none"
                />

                {/* Microphone Button to record voice note */}
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  disabled={uploading}
                  className="text-stone-400 hover:text-[#d4a853] transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
                  title="Record Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* "Send" Text Button from mockup */}
                {inputText.trim() && (
                  <button
                    type="submit"
                    disabled={!inputText.trim() || uploading}
                    className="text-sm font-medium text-[#d4a853] hover:text-[#e4ba65] disabled:opacity-30 transition-colors cursor-pointer px-1 py-0.5"
                  >
                    Send
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW PLAN MODAL                                              */}
      {/* ========================================================================= */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-[#15181F] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🗺️</span>
                <div>
                  <h3 className="text-base font-semibold text-white">Add a New Plan</h3>
                  <p className="text-xs text-stone-400">Create a plan and start our discussion thread</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPlanModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Plan Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Picnic by the Seine, Stargazing roadtrip..."
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-[#D4A853]/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "date", label: "Date Night", icon: "🍷" },
                    { id: "trip", label: "Trip", icon: "✈️" },
                    { id: "experience", label: "Activity", icon: "🎨" },
                    { id: "creative", label: "Dream", icon: "✨" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewPlanCategory(cat.id)}
                      className={`p-2 rounded-xl text-xs flex flex-col items-center space-y-1 border transition-all cursor-pointer ${
                        newPlanCategory === cat.id
                          ? "bg-[#D4A853]/20 border-[#D4A853] text-[#D4A853] font-semibold"
                          : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-[10px]">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newPlanTargetDate}
                    onChange={(e) => setNewPlanTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4A853]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Paris, Corniche..."
                    value={newPlanLocation}
                    onChange={(e) => setNewPlanLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-[#D4A853]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Initial Thoughts / Ideas (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What are we imagining for this plan?"
                  value={newPlanDescription}
                  onChange={(e) => setNewPlanDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-[#D4A853]/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-white/10 text-stone-400 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPlan || !newPlanTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#D4A853] hover:bg-[#c29845] disabled:opacity-50 text-black font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <span>{isCreatingPlan ? "Creating..." : "Start Planning ♡"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PLAN INFO MODAL                                                 */}
      {/* ========================================================================= */}
      {showPlanInfoModal && activePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-[#15181F] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">{getCategoryEmoji(activePlan.category)}</span>
                <div>
                  <h3 className="text-base font-semibold text-white">{activePlan.title}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4A853] bg-[#D4A853]/15 px-2 py-0.5 rounded-full">
                    {activePlan.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPlanInfoModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-300">
              {activePlan.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#D4A853] shrink-0" />
                  <span>{activePlan.location}</span>
                </div>
              )}

              {activePlan.targetDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#D4A853] shrink-0" />
                  <span>
                    {new Date(activePlan.targetDate).toLocaleDateString([], {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {activePlan.description ? (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-stone-300 leading-relaxed italic">
                  &ldquo;{activePlan.description}&rdquo;
                </div>
              ) : (
                <p className="text-stone-400 italic">No notes added yet. Chat freely below to plan everything!</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPlanInfoModal(false)}
                className="w-full py-2 rounded-xl bg-[#D4A853]/20 hover:bg-[#D4A853]/30 text-[#D4A853] border border-[#D4A853]/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Back to Plan Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
