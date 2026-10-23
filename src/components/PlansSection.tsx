"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Calendar,
  Compass,
  CheckCircle2,
  Circle,
  Plus,
  Heart,
  MapPin,
  Clock,
  Sparkles,
  Trash2,
  ArrowRight,
  Target,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import Portal from "@/components/Portal";

interface PlanItem {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  location: string | null;
  category: string;
  status: string;
  completedAt: string | null;
  completedToMemoryId: string | null;
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface BucketItem {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  completedAt: string | null;
}

interface CoupleGoal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  progressPercent: number;
  status: string;
  targetDate: string | null;
}

interface PlansSectionProps {
  onNavigateToStory?: () => void;
}

export default function PlansSection({ onNavigateToStory }: PlansSectionProps) {
  const [activeTab, setActiveTab] = useState<"plans" | "bucket" | "goals" | "calendar">("plans");
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [bucketList, setBucketList] = useState<BucketItem[]>([]);
  const [goals, setGoals] = useState<CoupleGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // New Plan modal state
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [planCategory, setPlanCategory] = useState("date");
  const [planTargetDate, setPlanTargetDate] = useState("");
  const [planLocation, setPlanLocation] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  // Complete & Convert to Memory modal state
  const [completingPlan, setCompletingPlan] = useState<PlanItem | null>(null);
  const [memoryNotes, setMemoryNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bucket list quick add
  const [newBucketTitle, setNewBucketTitle] = useState("");
  const [newBucketDesc, setNewBucketDesc] = useState("");

  // Goal quick add
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDesc, setGoalDesc] = useState("");
  const [goalCategory, setGoalCategory] = useState("adventure");

  const loadAll = async () => {
    try {
      setLoading(true);
      const [plansRes, bucketRes, goalsRes] = await Promise.all([
        fetch("/api/plans").then((r) => r.json()),
        fetch("/api/bucket-list").then((r) => r.json()),
        fetch("/api/goals").then((r) => r.json()),
      ]);
      if (plansRes.plans) setPlans(plansRes.plans);
      if (bucketRes.items) setBucketList(bucketRes.items);
      if (goalsRes.goals) setGoals(goalsRes.goals);
    } catch (err) {
      console.error("Error loading plans data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: planTitle.trim(),
          category: planCategory,
          targetDate: planTargetDate || null,
          location: planLocation.trim() || null,
          description: planDescription.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlans((prev) => [data.plan, ...prev]);
        setShowAddPlan(false);
        setPlanTitle("");
        setPlanTargetDate("");
        setPlanLocation("");
        setPlanDescription("");
      }
    } catch (err) {
      console.error("Create plan error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePlanDone = async (plan: PlanItem) => {
    if (plan.status === "planned") {
      setCompletingPlan(plan);
      setMemoryNotes(plan.description || "");
    } else {
      try {
        const res = await fetch("/api/plans", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: plan.id, status: "planned" }),
        });
        if (res.ok) {
          setPlans((prev) =>
            prev.map((p) =>
              p.id === plan.id ? { ...p, status: "planned", completedAt: null } : p
            )
          );
        }
      } catch (err) {
        console.error("Plan revert error:", err);
      }
    }
  };

  const handleConfirmCompletion = async (saveAsMemory: boolean) => {
    if (!completingPlan) return;

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#9A6660", "#B7897E", "#E8DED5", "#694744"],
    });

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: completingPlan.id,
          status: "completed",
          convertToMemory: saveAsMemory,
          memoryNotes: memoryNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === completingPlan.id
              ? {
                  ...p,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                  completedToMemoryId: data.memoryId || null,
                }
              : p
          )
        );
        setCompletingPlan(null);
        setMemoryNotes("");
      }
    } catch (err) {
      console.error("Plan complete error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      const res = await fetch(`/api/plans?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Delete plan error:", err);
    }
  };

  const handleToggleBucket = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    if (nextStatus) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#9A6660", "#B7897E", "#E8DED5"],
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

  const handleAddBucketItem = async () => {
    if (!newBucketTitle.trim()) return;
    try {
      const res = await fetch("/api/bucket-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBucketTitle.trim(),
          description: newBucketDesc.trim() || undefined,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.item) {
          setBucketList((prev) => [d.item, ...prev]);
        } else {
          loadAll();
        }
        setNewBucketTitle("");
        setNewBucketDesc("");
      }
    } catch (err) {
      console.error("Add bucket error:", err);
    }
  };

  const handleUpdateGoalProgress = async (id: string, newPercent: number) => {
    const status = newPercent >= 100 ? "completed" : "in_progress";
    if (newPercent >= 100) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
        colors: ["#9A6660", "#B7897E", "#694744"],
      });
    }
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, progressPercent: newPercent, status }),
      });
      if (res.ok) {
        setGoals((prev) =>
          prev.map((g) =>
            g.id === id ? { ...g, progressPercent: newPercent, status } : g
          )
        );
      }
    } catch (err) {
      console.error("Update goal error:", err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalTitle.trim(),
          description: goalDesc.trim() || undefined,
          category: goalCategory,
          progressPercent: 0,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.goal) setGoals((prev) => [d.goal, ...prev]);
        setShowAddGoal(false);
        setGoalTitle("");
        setGoalDesc("");
      }
    } catch (err) {
      console.error("Create goal error:", err);
    }
  };

  const activePlans = plans.filter((p) => p.status === "planned");
  const completedPlans = plans.filter((p) => p.status === "completed");

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2.5 max-w-xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 text-xs font-sans text-accent-primary uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Shared Horizon</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-ink-primary font-normal tracking-tight">
          Our Plans &amp; Dreams
        </h2>
        <p className="text-xs sm:text-sm text-ink-secondary font-sans leading-relaxed">
          All the dream dates, trips, and adventures waiting for us to experience together.
        </p>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: "plans", label: `Our Plans (${activePlans.length})`, desc: "Dates and upcoming events we have planned", icon: Calendar },
            { id: "bucket", label: `Bucket List (${bucketList.length})`, desc: "Things we want to do and achieve together in life", icon: CheckSquare },
            { id: "goals", label: `Shared Goals (${goals.length})`, desc: "Long-term relationship goals and progress", icon: Target },
            { id: "calendar", label: "Couple Calendar", desc: "Monthly calendar view of our dates", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                title={tab.desc}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
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

      {/* TAB 1: OUR PLANS */}
      {activeTab === "plans" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Action bar */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl text-ink-primary font-normal">
              Upcoming Plans ({activePlans.length})
            </h3>
            <button
              onClick={() => setShowAddPlan(true)}
              className="flex items-center space-x-2 px-4 py-2 quiet-btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Plan</span>
            </button>
          </div>

          {activePlans.length === 0 ? (
            <div className="quiet-card p-10 text-center space-y-3 max-w-md mx-auto">
              <Sparkles className="w-8 h-8 text-accent-primary/60 mx-auto" />
              <h4 className="font-serif text-2xl text-ink-primary font-normal">
                Your first adventure is waiting. ✈️
              </h4>
              <p className="text-ink-secondary font-serif italic text-xs leading-relaxed">
                Plan a quiet coffee date, a weekend getaway, or a dinner under the stars. Once completed, seal it forever into Our Story.
              </p>
              <button
                onClick={() => setShowAddPlan(true)}
                className="px-5 py-2.5 quiet-btn-primary text-xs"
              >
                Create Our First Plan ♡
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="quiet-card p-6 flex flex-col justify-between space-y-4 hover:border-accent-secondary transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-canvas-elevated text-accent-primary border border-canvas-border">
                        {plan.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-ink-muted font-sans">
                          Added by {plan.createdBy.name}
                        </span>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="text-ink-muted hover:text-rose-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                          title="Delete plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-serif text-2xl text-ink-primary font-normal">
                      {plan.title}
                    </h4>

                    {plan.description && (
                      <p className="font-serif italic text-xs text-ink-secondary leading-relaxed">
                        &ldquo;{plan.description}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-canvas-border/50 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                      {plan.targetDate && (
                        <div className="flex items-center space-x-1 text-accent-primary">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(plan.targetDate)}</span>
                        </div>
                      )}
                      {plan.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-ink-muted" />
                          <span>{plan.location}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleTogglePlanDone(plan)}
                      className="w-full py-2 px-3 rounded-xl bg-canvas-elevated hover:bg-accent-primary/10 border border-canvas-border text-ink-primary hover:text-accent-primary text-xs font-sans transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />
                      <span>Fulfill &amp; Save as Memory ♡</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fulfilled Plans */}
          {completedPlans.length > 0 && (
            <div className="pt-6 space-y-3">
              <h4 className="font-serif text-xl text-ink-secondary font-normal">
                Fulfilled Adventures ({completedPlans.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {completedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="quiet-card p-4 space-y-1.5 bg-canvas-elevated/40"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-accent-primary font-sans text-[11px] flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Fulfilled</span>
                      </span>
                      {plan.completedAt && (
                        <span className="text-[10px] text-ink-muted">
                          {formatDate(plan.completedAt)}
                        </span>
                      )}
                    </div>
                    <p className="font-serif text-base text-ink-primary">{plan.title}</p>
                    {plan.completedToMemoryId && (
                      <div className="pt-1.5 border-t border-canvas-border/40 flex items-center justify-between text-[11px] text-accent-secondary">
                        <span>In Our Story ♡</span>
                        {onNavigateToStory && (
                          <button
                            onClick={onNavigateToStory}
                            className="hover:underline flex items-center space-x-0.5"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUCKET LIST */}
      {activeTab === "bucket" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="quiet-card p-5 space-y-3">
            <h4 className="text-xs font-sans uppercase tracking-wider text-accent-primary">
              Add To Our Bucket List
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="What dream or adventure should we experience together?"
                value={newBucketTitle}
                onChange={(e) => setNewBucketTitle(e.target.value)}
                className="w-full quiet-input px-3.5 py-2 text-xs"
              />
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="Optional detail or note (e.g. In autumn, on a train)"
                  value={newBucketDesc}
                  onChange={(e) => setNewBucketDesc(e.target.value)}
                  className="w-full sm:flex-1 quiet-input px-3.5 py-1.5 text-xs"
                />
                <button
                  onClick={handleAddBucketItem}
                  className="w-full sm:w-auto px-4 py-1.5 quiet-btn-primary text-xs shrink-0"
                >
                  Add Wish ♡
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {bucketList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleBucket(item.id, item.isCompleted)}
                className={`quiet-card p-4 flex items-start space-x-3.5 cursor-pointer transition-all ${
                  item.isCompleted ? "opacity-75 bg-canvas-elevated/40" : ""
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                    item.isCompleted
                      ? "bg-accent-primary border-accent-primary text-white text-[10px]"
                      : "border-canvas-border"
                  }`}
                >
                  {item.isCompleted && "✓"}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-serif text-lg leading-snug ${
                      item.isCompleted ? "line-through text-ink-muted" : "text-ink-primary"
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-ink-secondary pt-0.5">{item.description}</p>
                  )}
                  {item.completedAt && (
                    <p className="text-[10px] text-accent-primary pt-0.5 font-sans">
                      Accomplished on {formatDate(item.completedAt)} ♡
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COUPLE GOALS */}
      {activeTab === "goals" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl text-ink-primary font-normal">
              Shared Milestones &amp; Growth
            </h3>
            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center space-x-2 px-4 py-2 quiet-btn-primary text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((g) => (
              <div key={g.id} className="quiet-card p-6 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-sans tracking-wider text-accent-primary">
                      {g.category}
                    </span>
                    <span className="font-mono text-xs text-ink-muted">
                      {g.progressPercent}%
                    </span>
                  </div>
                  <h4 className="font-serif text-xl text-ink-primary font-normal">{g.title}</h4>
                  {g.description && (
                    <p className="text-xs text-ink-secondary">{g.description}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-canvas-border/50">
                  <div className="h-1.5 w-full bg-canvas-elevated rounded-full overflow-hidden border border-canvas-border">
                    <div
                      className="h-full bg-accent-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(g.progressPercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-ink-muted">Progress:</span>
                    <div className="flex items-center space-x-1">
                      {[25, 50, 75, 100].map((step) => (
                        <button
                          key={step}
                          onClick={() => handleUpdateGoalProgress(g.id, step)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                            g.progressPercent >= step
                              ? "bg-accent-primary text-[#FAF5F0]"
                              : "bg-canvas-elevated text-ink-muted hover:text-ink-primary"
                          }`}
                        >
                          {step}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COUPLE CALENDAR */}
      {activeTab === "calendar" && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-2xl text-ink-primary font-normal">Chronological Itinerary</h3>
            <p className="text-xs text-ink-muted font-serif italic">
              All scheduled plans, dates, and upcoming moments in order.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {plans
              .filter((p) => p.targetDate)
              .sort(
                (a, b) =>
                  new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime()
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="quiet-card p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-canvas-elevated border border-canvas-border flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[9px] font-sans uppercase text-accent-primary font-medium">
                        {new Date(item.targetDate!).toLocaleString("en-US", { month: "short" })}
                      </span>
                      <span className="font-serif text-base font-normal text-ink-primary leading-none">
                        {new Date(item.targetDate!).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif text-base text-ink-primary font-normal">{item.title}</h4>
                      {item.location && (
                        <p className="text-[11px] text-ink-muted flex items-center space-x-1 pt-0.5">
                          <MapPin className="w-3 h-3 text-accent-primary" />
                          <span>{item.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-ink-muted font-sans capitalize bg-canvas-elevated px-2.5 py-1 rounded-full border border-canvas-border">
                    {item.status === "completed" ? "Fulfilled ♡" : "Upcoming"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW PLAN */}
      {showAddPlan && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="quiet-card p-6 sm:p-8 max-w-lg w-full space-y-4 bg-canvas-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-wider text-accent-primary">
                  Our Next Horizon
                </span>
                <button onClick={() => setShowAddPlan(false)} className="text-ink-muted hover:text-ink-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-serif text-2xl text-ink-primary font-normal">Plan An Adventure Together</h3>

              <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
                <div>
                  <label className="block text-ink-muted font-sans mb-1">Title / Idea *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Midnight beach walk & campfire"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="w-full quiet-input px-3.5 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink-muted font-sans mb-1">Category</label>
                    <select
                      value={planCategory}
                      onChange={(e) => setPlanCategory(e.target.value)}
                      className="w-full quiet-input px-3 py-2 text-xs bg-canvas-elevated"
                    >
                      <option value="date">Romantic Date 🥂</option>
                      <option value="trip">Travel &amp; Roadtrip 🚗</option>
                      <option value="creative">Creative &amp; Cozy 🎨</option>
                      <option value="experience">New Experience ✨</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-ink-muted font-sans mb-1">Target Date</label>
                    <input
                      type="date"
                      value={planTargetDate}
                      onChange={(e) => setPlanTargetDate(e.target.value)}
                      className="w-full quiet-input px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ink-muted font-sans mb-1">Location / Setting</label>
                  <input
                    type="text"
                    placeholder="e.g., The balcony, Alexandria shore, cozy kitchen"
                    value={planLocation}
                    onChange={(e) => setPlanLocation(e.target.value)}
                    className="w-full quiet-input px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-ink-muted font-sans mb-1">Details &amp; Notes</label>
                  <textarea
                    rows={3}
                    placeholder="What should we bring? What makes this special?"
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    className="w-full quiet-input p-3 text-xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPlan(false)}
                    className="px-4 py-2 text-xs text-ink-muted hover:text-ink-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 quiet-btn-primary text-xs flex items-center space-x-1.5"
                  >
                    <span>{isSubmitting ? "Saving..." : "Save Plan"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* MODAL: PLAN TO MEMORY CELEBRATION */}
      {completingPlan && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="quiet-card p-6 sm:p-8 max-w-md w-full space-y-4 text-center bg-canvas-card">
              <Heart className="w-10 h-10 text-accent-primary mx-auto stroke-1 animate-pulse" />
              <div className="space-y-1">
                <h3 className="font-serif text-2xl text-ink-primary font-normal">
                  You lived this plan! 🎉
                </h3>
                <p className="text-xs text-ink-secondary font-serif italic">
                  &ldquo;{completingPlan.title}&rdquo;
                </p>
              </div>

              <div className="text-left space-y-1.5 bg-canvas-elevated p-3.5 rounded-xl border border-canvas-border">
                <label className="block text-[11px] text-ink-muted font-sans">
                  Memory Reflection (Optional)
                </label>
                <textarea
                  rows={3}
                  value={memoryNotes}
                  onChange={(e) => setMemoryNotes(e.target.value)}
                  placeholder="How was the moment? What did you feel?"
                  className="w-full quiet-input p-2.5 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmCompletion(false)}
                  className="px-4 py-2 text-xs text-ink-muted hover:text-ink-primary"
                >
                  Mark Done Only
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmCompletion(true)}
                  className="px-5 py-2.5 quiet-btn-primary text-xs flex items-center space-x-1.5"
                >
                  <span>Save to Our Story ♡</span>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* MODAL: ADD GOAL */}
      {showAddGoal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="quiet-card p-6 sm:p-8 max-w-md w-full space-y-4 bg-canvas-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-wider text-accent-primary">
                  Shared Milestone
                </span>
                <button onClick={() => setShowAddGoal(false)} className="text-ink-muted hover:text-ink-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-serif text-2xl text-ink-primary font-normal">Add Couple Goal</h3>

              <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
                <div>
                  <label className="block text-ink-muted font-sans mb-1">Goal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Travel to our dream destination"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full quiet-input px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block text-ink-muted font-sans mb-1">Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full quiet-input px-3 py-2 bg-canvas-elevated text-ink-primary"
                  >
                    <option value="adventure">Adventure</option>
                    <option value="growth">Personal Growth</option>
                    <option value="future">Future &amp; Home</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(false)}
                    className="px-4 py-2 text-xs text-ink-muted hover:text-ink-primary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 quiet-btn-primary text-xs">
                    Save Goal
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
