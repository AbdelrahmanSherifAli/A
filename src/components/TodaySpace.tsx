"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  Sparkles,
  MessageCircle,
  Calendar,
  Clock,
  Play,
  Pause,
  ArrowRight,
  Plus,
  RefreshCw,
  Mail,
  Camera,
  Gift,
  CheckSquare,
  Square,
  Search,
  Check,
  Disc,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";
import Portal from "@/components/Portal";

interface TodaySpaceProps {
  onNavigateTab: (tab: string) => void;
  onSurpriseMe: () => void;
  onOpenAddMemory: () => void;
  onOpenVault: () => void;
  onOpenSettings: () => void;
}

// Centralized Relationship Start Date Configuration (Can easily be customized here)
export const DEFAULT_RELATIONSHIP_START_DATE = "2026-09-05T00:00:00";

/**
 * Dynamic Time-Based Greeting Helper
 * 05:00 – 11:59 → Good morning,
 * 12:00 – 16:59 → Good afternoon,
 * 17:00 – 20:59 → Good evening,
 * 21:00 – 04:59 → Good night,
 */
export const getTimeBasedGreeting = (date: Date = new Date()): string => {
  const hr = date.getHours();
  if (hr >= 5 && hr < 12) return "Good morning,";
  if (hr >= 12 && hr < 17) return "Good afternoon,";
  if (hr >= 17 && hr < 21) return "Good evening,";
  return "Good night,";
};

/**
 * Formats local date in browser timezone as uppercase "DAY_OF_WEEK, MONTH DAY"
 * Example: "SUNDAY, SEPTEMBER 20"
 */
export const getFormattedLocalDate = (date: Date = new Date()): string => {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`.toUpperCase();
};

export default function TodaySpace({
  onNavigateTab,
  onSurpriseMe,
  onOpenAddMemory,
  onOpenVault,
  onOpenSettings,
}: TodaySpaceProps) {
  const { user, partner, coupleSettings } = useAuth();

  // Relationship live counter
  const [duration, setDuration] = useState({
    totalDays: 16,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Dynamic greeting based on time of day & dynamic local date
  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting());
  const [currentDateStr, setCurrentDateStr] = useState(() => getFormattedLocalDate());

  // Music player
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Today's Question state
  const [todayQuestion, setTodayQuestion] = useState<any>(null);
  const [questionAnswerInput, setQuestionAnswerInput] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answeringModalOpen, setAnsweringModalOpen] = useState(false);

  // Recent Chat
  const [recentChat, setRecentChat] = useState<any[]>([]);

  // Little Reminders
  const reminders = [
    "You're doing great. And I'm so proud of you.",
    "Being with you is my favorite place to be.",
    "Take a breath. You are deeply, unconditionally loved.",
    "Every day with you is my favorite day.",
    "Thank you for being my peace in a loud world.",
  ];
  const [reminderIndex, setReminderIndex] = useState(0);

  // Upcoming Plans
  const [plans, setPlans] = useState<any[]>([]);
  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");

  // Memories for Glimpse
  const [memories, setMemories] = useState<any[]>([]);

  // Little Things I Love
  const [reasons, setReasons] = useState<any[]>([]);
  const [newReasonInput, setNewReasonInput] = useState("");
  const [showAddReason, setShowAddReason] = useState(false);

  // Quick moment text
  const [quickMomentInput, setQuickMomentInput] = useState("");
  const [quickMomentSaved, setQuickMomentSaved] = useState(false);

  // Apple-style handwriting animation states for Abdelrahman's note
  const quoteLines = [
    "“I hope we always have",
    "little things to look forward",
    "to together.”",
  ];
  const signatureText = "— Abdelrahman";

  const [lineProgress, setLineProgress] = useState<number[]>([0, 0, 0]);
  const [sigProgress, setSigProgress] = useState(0);
  const [activeStep, setActiveStep] = useState<"idle" | "line0" | "line1" | "line2" | "sig" | "done">("idle");
  const [heartVisible, setHeartVisible] = useState(false);
  const [replayCount, setReplayCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: NodeJS.Timeout;

    // Reset initially
    setLineProgress([0, 0, 0]);
    setSigProgress(0);
    setHeartVisible(false);
    setActiveStep("idle");

    const runWritingAnimation = async () => {
      // Gentle initial pause after page mount so the user sees the card arrive
      await new Promise((r) => {
        timeoutId = setTimeout(r, 450);
      });
      if (isCancelled) return;

      // Line 0
      setActiveStep("line0");
      for (let i = 1; i <= quoteLines[0].length; i++) {
        if (isCancelled) return;
        setLineProgress([i, 0, 0]);
        const char = quoteLines[0][i - 1];
        const delay = char === " " ? 48 : char === "," ? 140 : 34;
        await new Promise((r) => {
          timeoutId = setTimeout(r, delay);
        });
      }

      // Line 0 -> Line 1 natural hand shift
      await new Promise((r) => {
        timeoutId = setTimeout(r, 140);
      });
      if (isCancelled) return;

      // Line 1
      setActiveStep("line1");
      for (let i = 1; i <= quoteLines[1].length; i++) {
        if (isCancelled) return;
        setLineProgress((prev) => [quoteLines[0].length, i, 0]);
        const char = quoteLines[1][i - 1];
        const delay = char === " " ? 48 : 34;
        await new Promise((r) => {
          timeoutId = setTimeout(r, delay);
        });
      }

      // Line 1 -> Line 2 natural hand shift
      await new Promise((r) => {
        timeoutId = setTimeout(r, 140);
      });
      if (isCancelled) return;

      // Line 2
      setActiveStep("line2");
      for (let i = 1; i <= quoteLines[2].length; i++) {
        if (isCancelled) return;
        setLineProgress((prev) => [quoteLines[0].length, quoteLines[1].length, i]);
        const char = quoteLines[2][i - 1];
        const delay = char === "." || char === "”" ? 140 : char === " " ? 48 : 34;
        await new Promise((r) => {
          timeoutId = setTimeout(r, delay);
        });
      }

      // Pause before signing
      await new Promise((r) => {
        timeoutId = setTimeout(r, 320);
      });
      if (isCancelled) return;

      // Signature: — Abdelrahman
      setActiveStep("sig");
      for (let i = 1; i <= signatureText.length; i++) {
        if (isCancelled) return;
        setSigProgress(i);
        const char = signatureText[i - 1];
        const delay = char === " " || char === "—" ? 70 : 40;
        await new Promise((r) => {
          timeoutId = setTimeout(r, delay);
        });
      }

      // Pop heart ♡ & finish
      await new Promise((r) => {
        timeoutId = setTimeout(r, 160);
      });
      if (isCancelled) return;
      setHeartVisible(true);
      setActiveStep("done");
    };

    runWritingAnimation();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [replayCount]);

  useEffect(() => {
    // Live relationship counter & dynamic time-based updates
    const updateTimer = () => {
      const now = new Date();

      // Dynamic real-time greeting and date updates
      setGreeting(getTimeBasedGreeting(now));
      setCurrentDateStr(getFormattedLocalDate(now));

      // Parse start date in local calendar terms (year, month, day)
      let startYear = 2026, startMonth = 8, startDay = 5; // Default: Sept 5, 2026
      const configStartDate = coupleSettings?.anniversaryDate || DEFAULT_RELATIONSHIP_START_DATE;
      if (typeof configStartDate === "string" && configStartDate.includes("-")) {
        const parts = configStartDate.split("T")[0].split("-");
        startYear = parseInt(parts[0], 10);
        startMonth = parseInt(parts[1], 10) - 1;
        startDay = parseInt(parts[2], 10);
      } else {
        const d = new Date(configStartDate);
        startYear = d.getFullYear();
        startMonth = d.getMonth();
        startDay = d.getDate();
      }

      const startMidnight = new Date(startYear, startMonth, startDay, 0, 0, 0, 0);
      const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

      // Local calendar days difference (increments by +1 at exactly 12:00 AM midnight)
      const diffDays = Math.round((nowMidnight.getTime() - startMidnight.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = Math.max(1, diffDays + 1);

      // Live hours, minutes, and seconds elapsed in the current day since 12:00 AM midnight
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      setDuration({ totalDays, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    // Fetch initial data
    fetch("/api/questions")
      .then((r) => r.json())
      .then((d) => d.todayQuestion && setTodayQuestion(d.todayQuestion))
      .catch(() => {});

    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => {
        if (d.messages && d.messages.length > 0) {
          setRecentChat(d.messages.slice(-3));
        } else {
          setRecentChat([]);
        }
      })
      .catch(() => {});

    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => {
        if (d.plans && d.plans.length > 0) {
          setPlans(d.plans.slice(0, 3));
        } else {
          setPlans([]);
        }
      })
      .catch(() => {});

    fetch("/api/memories")
      .then((r) => r.json())
      .then((d) => {
        if (d.memories && d.memories.length > 0) {
          setMemories(d.memories);
        } else {
          setMemories([]);
        }
      })
      .catch(() => {});

    fetch("/api/reasons")
      .then((r) => r.json())
      .then((d) => {
        if (d.reasons && d.reasons.length > 0) {
          setReasons(d.reasons.slice(0, 4));
        } else {
          setReasons([]);
        }
      })
      .catch(() => {});

    return () => clearInterval(interval);
  }, [coupleSettings, partner]);

  // Audio Play toggle
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingSong) {
      audioRef.current.pause();
      setIsPlayingSong(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingSong(true);
    }
  };

  // Submit Answer to Today's Question
  const handleAnswerQuestion = async () => {
    if (!questionAnswerInput.trim() || !todayQuestion) return;
    setSubmittingAnswer(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: todayQuestion.id,
          answerText: questionAnswerInput.trim(),
        }),
      });
      if (res.ok) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setAnsweringModalOpen(false);
        // Refresh question
        const qRes = await fetch("/api/questions").then((r) => r.json());
        if (qRes.todayQuestion) setTodayQuestion(qRes.todayQuestion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Quick Plan Creation
  const handleCreatePlan = async () => {
    if (!newPlanTitle.trim()) return;
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPlanTitle.trim(),
          category: "date",
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setPlans((prev) => [d.plan, ...prev].slice(0, 4));
        setNewPlanTitle("");
        setNewPlanModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Plan Status
  const handleTogglePlan = async (plan: any) => {
    const nextStatus = plan.status === "completed" ? "planned" : "completed";
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, status: nextStatus } : p))
    );
    try {
      await fetch("/api/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, status: nextStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Add reason
  const handleAddReason = async () => {
    if (!newReasonInput.trim()) return;
    try {
      const res = await fetch("/api/reasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: newReasonInput.trim() }),
      });
      if (res.ok) {
        const d = await res.json();
        setReasons((prev) => [...prev, d.reason]);
        setNewReasonInput("");
        setShowAddReason(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick moment capture
  const handleSaveQuickMoment = async () => {
    if (!quickMomentInput.trim()) return;
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "A Little Moment Captured",
          description: quickMomentInput.trim(),
          mood: "sweet",
          memoryDate: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setQuickMomentSaved(true);
        setQuickMomentInput("");
        setTimeout(() => setQuickMomentSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send a smile: Organic randomized float of A ❤️ N, eng ❤️ dr, Red Hearts & Roses
  const [smileSentToast, setSmileSentToast] = useState(false);

  const handleSendRomanticSmile = () => {
    try {
      // Coupled personalized symbols (Large, clear, and prominent)
      const anCoupleGold = confetti.shapeFromText({
        text: "A ❤️ N",
        scalar: 3.3,
        color: "#D4A853",
        fontFamily: "Georgia, serif",
      });
      const anCoupleWhite = confetti.shapeFromText({
        text: "A ♡ N",
        scalar: 3.3,
        color: "#FAF5F0",
        fontFamily: "Georgia, serif",
      });
      const engDrCouple = confetti.shapeFromText({
        text: "eng ❤️ dr",
        scalar: 3.0,
        color: "#FBBF24",
        fontFamily: "Georgia, serif",
      });
      const engDrRose = confetti.shapeFromText({
        text: "eng ♡ dr",
        scalar: 3.0,
        color: "#FDA4AF",
        fontFamily: "Georgia, serif",
      });

      // Clear, large Red Hearts and Roses
      const redHeart = confetti.shapeFromText({ text: "❤️", scalar: 3.0 });
      const sweetHeart = confetti.shapeFromText({ text: "💕", scalar: 2.7 });
      const classicRose = confetti.shapeFromText({ text: "🌹", scalar: 2.6 });

      // Randomized multi-burst across wide coordinates (completely organic & distributed)
      const totalPoints = 7;

      for (let i = 0; i < totalPoints; i++) {
        // Natural randomized coordinates across the screen (15% to 85% width)
        const randX = 0.15 + Math.random() * 0.70;
        const randY = 0.52 + Math.random() * 0.20;
        const randDelay = Math.random() * 220; // Staggered organic timing
        const randVelocity = 15 + Math.random() * 7;
        const randDrift = (Math.random() - 0.5) * 0.4;

        // Build a randomized mix of 2-3 particles per position
        const particles: any[] = [];

        // Distribute couple shapes naturally
        if (i === 1) particles.push(anCoupleGold);
        else if (i === 3) particles.push(engDrCouple);
        else if (i === 5 && Math.random() > 0.5) particles.push(anCoupleWhite);
        else particles.push(redHeart);

        // Add 1-2 more random romantic companions (mostly hearts, occasional rose)
        particles.push(Math.random() > 0.35 ? redHeart : classicRose);
        if (Math.random() > 0.45) particles.push(Math.random() > 0.3 ? redHeart : sweetHeart);

        setTimeout(() => {
          confetti({
            shapes: particles,
            scalar: 2.8,
            particleCount: particles.length, // Only 2-3 per point = ZERO CLUMPING, fully dispersed!
            spread: 45 + Math.random() * 25,
            startVelocity: randVelocity,
            origin: { x: randX, y: randY },
            ticks: 290 + Math.floor(Math.random() * 50),
            gravity: 0.30 + Math.random() * 0.08,
            flat: true, // Flat & front-facing: letters, hearts & roses never turn into thin slices!
            drift: randDrift,
          });
        }, randDelay);
      }
    } catch {
      confetti({
        particleCount: 18,
        spread: 90,
        origin: { x: 0.5, y: 0.6 },
        colors: ["#EF4444", "#DC2626", "#BE123C"],
        flat: true,
      });
    }

    setSmileSentToast(true);
    setTimeout(() => setSmileSentToast(false), 2400);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 space-y-8 animate-fade-in relative">
      {/* Floating Center Romantic Toast on Send a Smile */}
      {smileSentToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-fade-in select-none">
          <div className="bg-black/85 backdrop-blur-2xl border border-white/20 text-[#FAF5F0] px-6 sm:px-8 py-3.5 rounded-full shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex items-center space-x-3">
            <span className="text-xl animate-bounce">🌹</span>
            <span className="font-serif italic text-sm sm:text-base text-[#D4A853]">
              A sweet smile sent with all my love ♡
            </span>
            <span className="text-xl animate-pulse">❤️</span>
          </div>
        </div>
      )}

      {/* Hidden Audio Element for Personal Soundtrack */}
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3"
        onEnded={() => setIsPlayingSong(false)}
      />

      {/* TOP BAR: SEARCH PILL, CALENDAR, AVATARS */}
      <div className="flex items-center justify-between gap-4">
        {/* Search Pill */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
          <input
            type="text"
            placeholder="Search anything in our space..."
            className="w-full bg-black/25 backdrop-blur-md border border-white/10 pl-10 pr-4 py-2 text-xs rounded-full text-white placeholder:text-stone-300/80 focus:outline-none focus:border-[#C29352] transition-all shadow-sm"
          />
        </div>

        {/* Top Right Shortcuts & Avatars */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab("plans")}
            className="w-9 h-9 rounded-full bg-black/25 backdrop-blur-md border border-white/10 flex items-center justify-center text-stone-200 hover:text-[#C29352] transition-colors shadow-sm"
            title="Open Calendar"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Profile Avatars: Abdel ♡ Nour */}
          <div className="flex items-center space-x-1.5 pl-1">
            <div className="relative group cursor-pointer" onClick={() => onNavigateTab("us")}>
              <img
                src="/assets/avatar_abdel.jpg"
                alt="Abdel"
                className="w-9 h-9 rounded-full object-cover border border-canvas-border shadow-sm"
              />
            </div>
            <span className="font-serif text-[#EF4444] text-xs select-none animate-pulse">♡</span>
            <div className="relative group cursor-pointer" onClick={() => onNavigateTab("us")}>
              <img
                src="/assets/avatar_nour.jpg"
                alt="Nour"
                className="w-9 h-9 rounded-full object-cover border border-canvas-border shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1. CINEMATIC HERO SECTION (1:1 with Reference Mockup) */}
      <section className="relative w-full min-h-[480px] sm:min-h-[520px] lg:min-h-[540px] rounded-[24px] overflow-hidden shadow-2xl flex flex-col justify-between p-6 sm:p-10 border border-white/15 text-[#FAF5F0] bg-black/40 backdrop-blur-2xl">
        {/* Soft atmospheric gradient tint so text on the left is crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/10 pointer-events-none" />

        {/* Hero Top Content: Date & Floating Details */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1 max-w-md">
            <p className="text-xs font-sans tracking-wider text-stone-300 uppercase drop-shadow-sm font-medium">
              {currentDateStr}
            </p>
            <h2 className="font-serif text-4xl sm:text-6xl text-[#FAF5F0] font-normal tracking-tight leading-tight drop-shadow-md">
              {greeting}<br />
              <span className="italic font-normal text-[#D4A853]">my n ♡</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#F3F4F6]/90 font-sans pt-1 max-w-sm drop-shadow-sm">
              A little place for everything that becomes ours.
            </p>
          </div>
        </div>

        {/* Hero Middle Content: Romantic Note by Abdelrahman (Frameless, Large & Apple Handwriting Animation) */}
        <div className="relative z-10 my-6 lg:my-auto flex justify-center items-center w-full">
          <div className="relative text-center max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto py-2 transition-all duration-500 group select-none">
            {/* Header: A little note with subtle replay button */}
            <div className="flex items-center justify-center space-x-3 mb-3">
              <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#D4A853]/70" />
              <p className="text-xs sm:text-sm font-sans uppercase tracking-[0.32em] text-[#D4A853] font-medium drop-shadow-md">
                A little note
              </p>
              <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#D4A853]/70" />

              {/* Replay Handwriting Animation Button */}
              <button
                onClick={() => setReplayCount((c) => c + 1)}
                className="opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-all text-stone-300 hover:text-[#D4A853] p-1 rounded-full hover:bg-white/10 text-xs"
                title="Replay handwriting animation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quote Body with Apple-Style Handwriting Animation - BIGGER & BOLDER */}
            <div className="font-serif italic text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-[#FAF5F0] font-normal leading-snug sm:leading-tight lg:leading-[1.25] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] flex flex-col items-center space-y-1 sm:space-y-1.5">
              {quoteLines.map((line, idx) => {
                const isCurrentActive = activeStep === `line${idx}`;
                return (
                  <div key={idx} className="relative inline-flex items-center justify-center min-h-[1.35em]">
                    <span className="inline-block relative">
                      {line.split("").map((char, cIdx) => {
                        const isRevealed = cIdx < lineProgress[idx];
                        const isLatest = cIdx === lineProgress[idx] - 1 && isCurrentActive;
                        return (
                          <span
                            key={cIdx}
                            className={`inline-block transition-colors duration-150 ${
                              isRevealed
                                ? isLatest
                                  ? "text-[#E6C575] drop-shadow-[0_0_12px_rgba(212,168,83,0.7)]"
                                  : "text-[#FAF5F0]"
                                : "opacity-0 select-none pointer-events-none"
                            }`}
                          >
                            {char === " " ? "\u00A0" : char}
                          </span>
                        );
                      })}
                      {isCurrentActive && (
                        <span className="inline-block w-[3px] h-[0.9em] bg-[#D4A853] shadow-[0_0_10px_#D4A853] ml-1 align-middle animate-pen-glow" />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Author Signature with Handwriting & Flourish - BIGGER */}
            <div className="mt-4 sm:mt-5 flex flex-col items-center">
              <div className="text-sm sm:text-base md:text-lg font-serif italic text-stone-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] flex items-center justify-center min-h-[1.5em]">
                <span className="inline-block relative">
                  {signatureText.split("").map((char, cIdx) => {
                    const isRevealed = cIdx < sigProgress;
                    const isLatest = cIdx === sigProgress - 1 && activeStep === "sig";
                    return (
                      <span
                        key={cIdx}
                        className={`inline-block transition-colors duration-150 ${
                          isRevealed
                            ? isLatest
                              ? "text-[#E6C575] drop-shadow-[0_0_10px_rgba(212,168,83,0.7)]"
                              : "text-stone-200"
                            : "opacity-0 select-none pointer-events-none"
                        }`}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    );
                  })}
                  {activeStep === "sig" && (
                    <span className="inline-block w-[2.5px] h-[0.9em] bg-[#D4A853] shadow-[0_0_10px_#D4A853] ml-1 align-middle animate-pen-glow" />
                  )}
                </span>

                {/* Heart ♡ with pop animation */}
                {heartVisible && (
                  <span className="text-[#EF4444] text-sm sm:text-base md:text-lg select-none animate-heart-pop inline-block ml-1.5">
                    ♡
                  </span>
                )}
              </div>

              {/* Delicate Signature Underline Flourish - Scaled */}
              <div className="flex justify-center -mt-0.5 pointer-events-none select-none">
                <svg width="150" height="8" viewBox="0 0 150 8" fill="none" className="overflow-visible">
                  <path
                    d="M 10 4 Q 75 7.5, 140 4"
                    stroke="#D4A853"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeDasharray="150"
                    strokeDashoffset={activeStep === "done" ? 0 : 150}
                    className="transition-all duration-700 ease-out opacity-65"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Bottom Content: Relationship Counter & Mini Music Player */}
        <div className="relative z-10 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-6">
          {/* Relationship Counter Block with Heading */}
          <div className="space-y-2 w-full sm:w-auto">
            {/* Heading above the timer */}
            <div>
              <p className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.2em] text-stone-300/90 font-medium drop-shadow-sm flex items-center space-x-1.5 pl-1 select-none">
                <span>WE&apos;VE BEEN TOGETHER FOR</span>
                <span className="text-[#EF4444] text-[11px] animate-pulse">♡</span>
              </p>
              <p className="text-[10px] text-stone-400 font-sans tracking-wide pl-1">
                Counting every second of our story together
              </p>
            </div>

            {/* Relationship Counter Pill (Harmonized with website colors & smooth second tick transition) */}
            <div className="bg-[#0E1117]/85 backdrop-blur-2xl border border-white/10 rounded-[20px] sm:rounded-[22px] px-5 sm:px-7 py-3.5 sm:py-4 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center">
              {/* Days */}
              <div className="flex flex-col items-center min-w-[48px] sm:min-w-[56px] text-center">
                <span className="font-sans font-bold text-2xl sm:text-3xl text-[#FAF5F0] tracking-tight leading-none">
                  {duration.totalDays}
                </span>
                <span className="text-[11px] sm:text-xs text-stone-400 font-sans mt-1.5 leading-none">
                  Days
                </span>
              </div>

              {/* Divider 1 */}
              <div className="h-7 sm:h-8 w-[1px] bg-gradient-to-b from-white/5 via-white/20 to-white/5 mx-2.5 sm:mx-4 shrink-0" />

              {/* Hours */}
              <div className="flex flex-col items-center min-w-[44px] sm:min-w-[52px] text-center">
                <span className="font-sans font-bold text-2xl sm:text-3xl text-[#FAF5F0] tracking-tight leading-none tabular-nums">
                  {String(duration.hours).padStart(2, "0")}
                </span>
                <span className="text-[11px] sm:text-xs text-stone-400 font-sans mt-1.5 leading-none">
                  Hours
                </span>
              </div>

              {/* Divider 2 */}
              <div className="h-7 sm:h-8 w-[1px] bg-gradient-to-b from-white/5 via-white/20 to-white/5 mx-2.5 sm:mx-4 shrink-0" />

              {/* Minutes */}
              <div className="flex flex-col items-center min-w-[44px] sm:min-w-[52px] text-center">
                <span className="font-sans font-bold text-2xl sm:text-3xl text-[#FAF5F0] tracking-tight leading-none tabular-nums">
                  {String(duration.minutes).padStart(2, "0")}
                </span>
                <span className="text-[11px] sm:text-xs text-stone-400 font-sans mt-1.5 leading-none">
                  Minutes
                </span>
              </div>

              {/* Divider 3 */}
              <div className="h-7 sm:h-8 w-[1px] bg-gradient-to-b from-white/5 via-white/20 to-white/5 mx-2.5 sm:mx-4 shrink-0" />

              {/* Seconds - Warm Gold Accent with smooth second-tick micro-transition */}
              <div className="flex flex-col items-center min-w-[44px] sm:min-w-[52px] text-center overflow-hidden">
                <span
                  key={duration.seconds}
                  className="font-sans font-bold text-2xl sm:text-3xl text-[#D4A853] tracking-tight leading-none tabular-nums animate-second-tick"
                >
                  {String(duration.seconds).padStart(2, "0")}
                </span>
                <span className="text-[11px] sm:text-xs text-stone-400 font-sans mt-1.5 leading-none">
                  Seconds
                </span>
              </div>
            </div>
          </div>

          {/* Floating Mini Music Player */}
          <div className="bg-[#0E1117]/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center space-x-3.5 shadow-2xl">
            <img
              src="/assets/song_album_cover.jpg"
              alt="Album cover"
              className="w-10 h-10 rounded-xl object-cover border border-white/10"
            />
            <div className="text-left">
              <span className="text-[9px] font-sans tracking-widest text-[#D4A853] uppercase font-medium">
                Our Song
              </span>
              <p className="text-xs font-serif font-medium text-[#FAF5F0] leading-tight truncate max-w-[130px]">
                Until I Found You
              </p>
              <p className="text-[10px] text-stone-400 truncate max-w-[130px]">
                Stephen Sanchez
              </p>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={togglePlayAudio}
                className="w-8 h-8 rounded-full bg-[#D4A853]/25 hover:bg-[#D4A853]/40 text-[#D4A853] flex items-center justify-center transition-all"
                title={isPlayingSong ? "Pause" : "Play preview"}
              >
                {isPlayingSong ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <a
                href={coupleSettings?.spotifyPlaylistUrl || "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1DB954]/20 hover:bg-[#1DB954]/40 text-[#1DB954] flex items-center justify-center transition-all"
                title="Open our Spotify Playlist"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ROW 2: ROMANTIC BANNER (Complete Framing & Well-Proportioned) */}
      <div className="relative w-full min-h-[280px] sm:min-h-[320px] md:min-h-[350px] rounded-[24px] overflow-hidden border border-white/15 shadow-2xl flex flex-col justify-between p-6 sm:p-8 group">
        {/* Romantic Couple Embracing on Lake Dock at Sunset (Complete Framing, Zero Flowers) */}
        <img
          src="/assets/banner_couple_lake_sunset_complete.jpg"
          alt="Romantic couple sitting together on dock watching sunset over calm lake"
          className="absolute inset-0 w-full h-full object-cover object-[center_40%] filter brightness-[0.98] group-hover:scale-[1.02] transition-transform duration-700 ease-out"
        />

        {/* Soft atmospheric gradient vignette - gentle and tranquil */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 via-50% to-transparent pointer-events-none" />

        {/* Top Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-sans tracking-[0.25em] text-[#D4A853] uppercase font-medium shadow-sm">
            <Heart className="w-2.5 h-2.5 text-[#EF4444] fill-[#EF4444] animate-pulse" />
            <span>Sweet Reminder</span>
          </div>
        </div>

        {/* Center Quote */}
        <div className="relative z-10 space-y-1 my-auto pt-3 pb-2 max-w-xl">
          <p className="font-serif text-2xl sm:text-3xl lg:text-[34px] text-[#FAF5F0] font-normal leading-snug drop-shadow-md">
            &ldquo;You&apos;re my{" "}
            <span className="italic text-[#D4A853] font-normal">favorite notification.&rdquo;</span>
          </p>
        </div>

        {/* Bottom Bar: Signature & Interactive Smile Button */}
        <div className="relative z-10 flex items-center justify-between pt-2">
          <p className="text-xs font-serif italic text-stone-300 tracking-wide flex items-center space-x-1.5 drop-shadow-sm select-none">
            <span>— Always</span>
            <span className="text-[#EF4444] text-xs">♡</span>
          </p>

          <button
            onClick={handleSendRomanticSmile}
            className="px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 text-[12px] text-[#FAF5F0] hover:text-[#D4A853] flex items-center space-x-2 transition-all shadow-sm active:scale-95 group/btn"
            title="Send a sweet smile"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A853] group-hover/btn:rotate-12 transition-transform" />
            <span>Send a smile</span>
          </button>
        </div>
      </div>

      {/* 3. ROW 3: RECENT CHAT | A LITTLE REMINDER | ON THIS DAY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Recent Chat */}
        <div className="quiet-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center space-x-2 text-ink-secondary font-medium">
                  <MessageCircle className="w-4 h-4 text-accent-primary" />
                  <span>Recent Chat</span>
                </div>
                <p className="text-[10px] text-ink-muted pt-0.5">Quick look at your latest private messages</p>
              </div>
              <button
                onClick={() => onNavigateTab("chat")}
                className="text-xs text-ink-muted hover:text-accent-primary flex items-center space-x-1"
              >
                <span>See all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentChat.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs text-ink-muted">No messages yet</p>
                <p className="text-[11px] text-ink-muted/80">Send your first whisper or love note ♡</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentChat.map((msg, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs">
                    <div className="w-6 h-6 rounded-full bg-canvas-elevated border border-canvas-border flex items-center justify-center shrink-0 text-[10px] font-serif text-accent-primary">
                      {msg.sender?.name?.charAt(0) || "♡"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-ink-primary truncate">
                          {msg.sender?.name || "Partner"}
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-ink-secondary text-xs truncate pt-0.5">
                        {msg.text || "Shared a sweet moment"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab("chat")}
            className="w-full py-2 quiet-btn-outline text-xs text-center"
          >
            Open Private Chat
          </button>
        </div>

        {/* Column 2: A Little Reminder */}
        <div className="quiet-card p-6 flex flex-col justify-between space-y-4 text-center">
          <div>
            <div className="flex items-center justify-center space-x-1.5 text-xs text-ink-muted">
              <Heart className="w-3.5 h-3.5 text-accent-primary" />
              <span className="font-medium text-ink-secondary">A Little Reminder</span>
            </div>
            <p className="text-[10px] text-ink-muted pt-0.5">Sweet love notes to brighten your day</p>
          </div>

          <div className="space-y-2 py-4">
            <p className="font-serif text-xl sm:text-2xl text-ink-primary italic leading-relaxed">
              &ldquo;{reminders[reminderIndex]}&rdquo;
            </p>
            <span className="text-accent-primary font-serif text-sm">♡</span>
          </div>

          <button
            onClick={() => setReminderIndex((prev) => (prev + 1) % reminders.length)}
            className="inline-flex items-center justify-center space-x-1.5 text-xs text-ink-muted hover:text-accent-primary transition-colors self-center"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Tap for another one</span>
          </button>
        </div>

        {/* Column 3: On This Day */}
        <div className="quiet-card p-6 flex flex-col justify-between space-y-4 text-center">
          <div>
            <div className="flex items-center justify-center space-x-1.5 text-xs text-ink-muted">
              <Calendar className="w-3.5 h-3.5 text-accent-primary" />
              <span className="font-medium text-ink-secondary">On This Day</span>
            </div>
            <p className="text-[10px] text-ink-muted pt-0.5">Memories from this day in our story</p>
          </div>

          <div className="space-y-2 py-4">
            <p className="font-serif text-lg text-ink-primary">Nothing yet...</p>
            <p className="text-xs text-ink-muted font-serif italic max-w-xs mx-auto leading-relaxed">
              But one day, this date will hold a special memory ♡
            </p>
          </div>

          <button
            onClick={onOpenAddMemory}
            className="w-full py-2 quiet-btn-outline text-xs text-center"
          >
            Save A Memory Today
          </button>
        </div>
      </div>

      {/* 4. ROW 4: UPCOMING PLANS | A GLIMPSE OF OUR STORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Plans (5 cols) */}
        <div className="lg:col-span-5 quiet-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center space-x-2 text-ink-secondary font-medium">
                  <Calendar className="w-4 h-4 text-accent-primary" />
                  <span>Upcoming Plans</span>
                </div>
                <p className="text-[10px] text-ink-muted pt-0.5">Cute dates &amp; future adventures we want to do</p>
              </div>
              <button
                onClick={() => onNavigateTab("plans")}
                className="text-xs text-ink-muted hover:text-accent-primary flex items-center space-x-1"
              >
                <span>See all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {plans.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs text-ink-muted">No upcoming plans yet</p>
                <p className="text-[11px] text-ink-muted/80">Plan your next date or adventure together ♡</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {plans.map((p) => {
                  const isCompleted = p.status === "completed";
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleTogglePlan(p)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-canvas-elevated/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        {isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-ink-muted shrink-0" />
                        )}
                        <span
                          className={`text-xs truncate ${
                            isCompleted ? "line-through text-ink-muted" : "text-ink-primary"
                          }`}
                        >
                          {p.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-ink-muted font-sans shrink-0">
                        {p.targetDate ? new Date(p.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date yet"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => setNewPlanModalOpen(true)}
            className="w-full py-2.5 quiet-btn-primary text-xs flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add a new plan</span>
          </button>
        </div>

        {/* Right: A Glimpse of Our Story (7 cols) */}
        <div className="lg:col-span-7 quiet-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center space-x-2 text-ink-secondary font-medium">
                  <Heart className="w-4 h-4 text-accent-primary" />
                  <span>A Glimpse of Our Story</span>
                </div>
                <p className="text-[10px] text-ink-muted pt-0.5">Photos and milestones from our journey together</p>
              </div>
              <button
                onClick={() => onNavigateTab("story")}
                className="text-xs text-ink-muted hover:text-accent-primary flex items-center space-x-1"
              >
                <span>Chronicles</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Editorial Photo Spread */}
            {(() => {
              const memoryPhotos: { url: string; title: string }[] = [];
              memories.forEach((m) => {
                try {
                  if (m.photos) {
                    const parsed = JSON.parse(m.photos);
                    parsed.forEach((url: string) => {
                      memoryPhotos.push({ url, title: m.title });
                    });
                  }
                } catch {}
              });

              if (memoryPhotos.length === 0) {
                return (
                  <div className="py-10 px-4 text-center space-y-3 bg-canvas-elevated/40 rounded-xl border border-dashed border-canvas-border/80 my-auto">
                    <div className="w-10 h-10 mx-auto rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-serif text-lg text-ink-primary font-normal">Our Story Begins Here</p>
                      <p className="text-xs text-ink-muted max-w-xs mx-auto">
                        No memories added yet. Start capturing your special photos and moments together ♡
                      </p>
                    </div>
                    <button
                      onClick={onOpenAddMemory}
                      className="px-4 py-2 quiet-btn-primary text-xs inline-flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Our First Memory</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                  {/* Main Photo with Script Overlay */}
                  <div
                    onClick={() => onNavigateTab("story")}
                    className="sm:col-span-7 relative h-48 rounded-xl overflow-hidden cursor-pointer group border border-canvas-border"
                  >
                    <img
                      src={memoryPhotos[0].url}
                      alt={memoryPhotos[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 text-center">
                      <p className="font-script text-2xl text-[#FAF5F0] drop-shadow-md">
                        {memoryPhotos[0].title || "A thousand little moments with you ♡"}
                      </p>
                    </div>
                  </div>

                  {/* Supporting Thumbnails */}
                  <div className="sm:col-span-5 grid grid-cols-2 gap-2 h-48">
                    {memoryPhotos.slice(1, 4).map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => onNavigateTab("story")}
                        className="rounded-xl overflow-hidden cursor-pointer border border-canvas-border"
                      >
                        <img
                          src={p.url}
                          alt={p.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                    <button
                      onClick={onOpenAddMemory}
                      className="rounded-xl bg-canvas-elevated border border-dashed border-canvas-border flex flex-col items-center justify-center text-ink-muted hover:text-accent-primary hover:border-accent-primary transition-all min-h-[5.5rem]"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px] font-sans pt-1">Add</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          <p className="text-[11px] font-script text-accent-primary italic text-right">
            Every day adds a new page ♡
          </p>
        </div>
      </div>

      {/* 5. ROW 5: LITTLE THINGS I LOVE | OUR SONG | QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Little Things I Love */}
        <div className="quiet-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-2 text-xs text-ink-secondary font-medium">
                <Heart className="w-4 h-4 text-accent-primary" />
                <span>Little Things I Love</span>
              </div>
              <p className="text-[10px] text-ink-muted pt-0.5">The little things that make me fall in love with you</p>
            </div>

            {reasons.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-ink-muted">No reasons added yet</p>
                <button
                  onClick={() => setShowAddReason(true)}
                  className="text-xs text-accent-primary hover:underline"
                >
                  Add a sweet little reason why you love her ♡
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {reasons.slice(0, 4).map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="flex items-center justify-between py-1.5 border-b border-canvas-border/50 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-accent-primary text-xs">♥</span>
                      <span className="text-ink-primary font-sans">{r.reason}</span>
                    </div>
                    <span className="text-[10px] font-mono text-ink-muted">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {showAddReason && (
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="One more reason..."
                  value={newReasonInput}
                  onChange={(e) => setNewReasonInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddReason()}
                  className="flex-1 quiet-input px-3 py-1.5 text-xs"
                />
                <button
                  onClick={handleAddReason}
                  className="px-3 py-1.5 quiet-btn-primary text-xs shrink-0"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {!showAddReason && (
            <button
              onClick={() => setShowAddReason(true)}
              className="w-full py-2 quiet-btn-outline text-xs text-center flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add another reason</span>
            </button>
          )}
        </div>

        {/* Column 2: Our Song */}
        <div className="quiet-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 text-xs text-ink-secondary font-medium">
                <Sparkles className="w-4 h-4 text-accent-primary" />
                <span>Our Song</span>
              </div>
              <p className="text-[10px] text-ink-muted pt-0.5">Play our special song anytime to feel close</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <img
                src="/assets/song_album_cover.jpg"
                alt="Our Song Album Cover"
                className="w-24 h-24 rounded-2xl object-cover shadow-md border border-canvas-border"
              />
              <div>
                <h4 className="font-serif text-lg text-ink-primary font-medium">
                  Until I Found You
                </h4>
                <p className="text-xs text-ink-secondary">Stephen Sanchez</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-1">
                <div className="h-1.5 w-full bg-canvas-elevated rounded-full overflow-hidden border border-canvas-border">
                  <div className="h-full bg-accent-primary w-2/3 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-ink-muted font-mono">
                  <span>2:14</span>
                  <span>3:01</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-1">
            <button
              onClick={togglePlayAudio}
              className="w-11 h-11 rounded-full bg-accent-primary hover:bg-accent-secondary text-white flex items-center justify-center shadow-md transition-all"
              title={isPlayingSong ? "Pause audio" : "Play audio"}
            >
              {isPlayingSong ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <a
              href={coupleSettings?.spotifyPlaylistUrl || "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-full bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#1DB954] text-xs font-medium flex items-center space-x-1.5 transition-all"
              title="Open our Spotify Playlist"
            >
              <Disc className="w-3.5 h-3.5 animate-spin" />
              <span>Spotify</span>
            </a>
          </div>
        </div>

        {/* Column 3: Quick Actions */}
        <div className="quiet-card p-6 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-xs text-ink-secondary font-medium pb-0.5">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span>Quick Actions</span>
            </div>
            <p className="text-[10px] text-ink-muted pb-1">One-tap shortcuts to save memories, surprise, or chat</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Save this moment", icon: Heart, action: onOpenAddMemory },
              { label: "Write a letter", icon: Mail, action: () => onNavigateTab("letters") },
              { label: "Add a memory", icon: Camera, action: onOpenAddMemory },
              { label: "Plan something", icon: Calendar, action: () => setNewPlanModalOpen(true) },
              { label: "Take a photo", icon: Camera, action: onOpenAddMemory },
              { label: "Surprise me", icon: Gift, action: onSurpriseMe },
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={act.action}
                  className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-canvas-elevated/70 hover:bg-canvas-elevated border border-canvas-border/50 text-ink-primary hover:text-accent-primary text-xs font-sans transition-all text-left"
                >
                  <Icon className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. FOOTER / CLOSING MOMENT (1:1 with Reference Mockup) */}
      <div className="text-center pt-8 pb-24 space-y-2 select-none">
        <p className="font-script text-3xl sm:text-4xl text-white/90 drop-shadow-md italic tracking-wide">
          Here for all our tomorrows ♡
        </p>
      </div>

      {/* MODAL: ANSWER TODAY'S QUESTION */}
      {answeringModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="quiet-card p-6 sm:p-8 max-w-md w-full space-y-4 bg-canvas-card">
              <div className="space-y-2 text-center">
                <span className="text-xs font-serif text-accent-primary">Today&apos;s Question ♡</span>
                <h3 className="font-serif text-2xl text-ink-primary">
                  {todayQuestion?.prompt}
                </h3>
                <p className="text-xs text-ink-muted font-sans">
                  Your answer remains private until both of you reply.
                </p>
              </div>

              <textarea
                rows={4}
                placeholder="Write your honest, sweet, or funny answer..."
                value={questionAnswerInput}
                onChange={(e) => setQuestionAnswerInput(e.target.value)}
                className="w-full quiet-input p-3 text-xs resize-none"
              />

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAnsweringModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-ink-muted hover:text-ink-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingAnswer || !questionAnswerInput.trim()}
                  onClick={handleAnswerQuestion}
                  className="px-5 py-2.5 quiet-btn-primary text-xs"
                >
                  {submittingAnswer ? "Sealing..." : "Seal Answer ♡"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* MODAL: QUICK PLAN */}
      {newPlanModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="quiet-card p-6 sm:p-8 max-w-md w-full space-y-4 bg-canvas-card">
              <h3 className="font-serif text-2xl text-ink-primary">Plan Something Together</h3>
              <input
                type="text"
                placeholder="e.g. Watch the sunset from the roof"
                value={newPlanTitle}
                onChange={(e) => setNewPlanTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlan()}
                className="w-full quiet-input px-4 py-2.5 text-xs"
              />
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-ink-muted hover:text-ink-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreatePlan}
                  className="px-5 py-2.5 quiet-btn-primary text-xs"
                >
                  Save Plan
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
