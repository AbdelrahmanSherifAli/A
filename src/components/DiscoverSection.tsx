"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, HelpCircle, CheckCircle2, Lock, ArrowRight, Heart, Smile, BookOpen, Send, X } from "lucide-react";
import confetti from "canvas-confetti";

export default function DiscoverSection() {
  const { user, partner } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<"questions" | "this_or_that" | "guess" | "journal">("questions");

  // Questions state
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionCategory, setActiveQuestionCategory] = useState<"all" | "light" | "deep" | "relationship">("all");
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerInputText, setAnswerInputText] = useState("");

  // Games state
  const [thisOrThatList, setThisOrThatList] = useState<any[]>([]);
  const [guessList, setGuessList] = useState<any[]>([]);

  // Journal state
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [newJournalContent, setNewJournalContent] = useState("");
  const [savingJournal, setSavingJournal] = useState(false);

  const loadData = () => {
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        const all = [];
        if (data.todayQuestion) all.push(data.todayQuestion);
        if (data.pastQuestions) all.push(...data.pastQuestions);
        setQuestions(all);
      });

    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        if (data.thisOrThat) setThisOrThatList(data.thisOrThat);
        if (data.guessMyAnswer) setGuessList(data.guessMyAnswer);
      });

    fetch("/api/journal")
      .then((res) => res.json())
      .then((data) => {
        if (data.entries) setJournalEntries(data.entries);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnswerQuestion = async (qId: string) => {
    if (!answerInputText.trim()) return;
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qId, answerText: answerInputText.trim() }),
      });
      if (res.ok) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#9A6660", "#B7897E", "#E8DED5"],
        });
        setAnsweringQuestionId(null);
        setAnswerInputText("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectThisOrThat = async (gameId: string, option: string) => {
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameItemId: gameId, selectedOption: option }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectGuessAnswer = async (gameId: string, choice: string) => {
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameItemId: gameId, selectedOption: choice }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalContent.trim()) return;
    try {
      setSavingJournal(true);
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "What made you feel grateful for us this week?",
          content: newJournalContent.trim(),
        }),
      });
      if (res.ok) {
        setNewJournalContent("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingJournal(false);
    }
  };

  const filteredQuestions = activeQuestionCategory === "all"
    ? questions
    : questions.filter((q) => q.category === activeQuestionCategory);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2.5 max-w-xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 text-xs font-sans text-accent-primary uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curiosity &amp; Intimacy</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-ink-primary font-normal tracking-tight">
          Discover Each Other
        </h2>
        <p className="text-xs sm:text-sm text-ink-secondary font-sans leading-relaxed">
          Daily questions, lighthearted games, and reflections to keep conversation alive every day.
        </p>

        {/* Sub-tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: "questions", label: `Daily Questions (${questions.length})`, desc: "Answer one cute or deep question together every day", icon: HelpCircle },
            { id: "this_or_that", label: `This or That (${thisOrThatList.length})`, desc: "Quick fun choices to compare what each of us prefers", icon: Sparkles },
            { id: "guess", label: `Guess My Answer (${guessList.length})`, desc: "Test how well you know each other's secrets & favorites", icon: Smile },
            { id: "journal", label: `Reflections (${journalEntries.length})`, desc: "Shared private thoughts, gratitude, and diary notes", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
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

      {/* 1. DAILY QUESTIONS */}
      {activeSubTab === "questions" && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Category Filters */}
          <div className="flex items-center justify-center space-x-2">
            {[
              { id: "all", label: "All Questions" },
              { id: "light", label: "Sweet & Light" },
              { id: "deep", label: "Deep Reflections" },
              { id: "relationship", label: "Us & Our Bond" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveQuestionCategory(cat.id as any)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  activeQuestionCategory === cat.id
                    ? "bg-accent-primary text-[#FAF5F0]"
                    : "text-ink-muted hover:text-ink-primary bg-canvas-elevated"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <div key={q.id} className="quiet-card p-6 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase font-sans tracking-wider text-accent-primary bg-canvas-elevated px-2.5 py-0.5 rounded-full border border-canvas-border">
                    {q.category}
                  </span>
                  {q.bothAnswered ? (
                    <span className="text-accent-primary text-[11px] font-sans flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Revealed ♡</span>
                    </span>
                  ) : q.myAnswer ? (
                    <span className="text-ink-muted text-[11px] font-sans flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-accent-primary" />
                      <span>Waiting for {q.partnerName}</span>
                    </span>
                  ) : (
                    <span className="text-ink-muted text-[11px] font-sans">Sealed until you answer</span>
                  )}
                </div>

                <h3 className="font-serif text-2xl text-ink-primary font-normal leading-snug">
                  {q.prompt}
                </h3>

                {/* Answers View */}
                {q.bothAnswered ? (
                  <div className="space-y-2 pt-2 border-t border-canvas-border/50 text-xs text-ink-secondary">
                    <div className="bg-canvas-elevated p-3 rounded-xl space-y-1">
                      <span className="font-medium text-accent-primary">{user?.name} (You):</span>
                      <p className="italic font-serif text-ink-primary">{q.myAnswer}</p>
                    </div>
                    <div className="bg-canvas-elevated p-3 rounded-xl space-y-1">
                      <span className="font-medium text-accent-primary">{q.partnerName}:</span>
                      <p className="italic font-serif text-ink-primary">{q.partnerAnswer}</p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    {answeringQuestionId === q.id ? (
                      <div className="space-y-2.5">
                        <textarea
                          rows={3}
                          placeholder="Your answer remains hidden until both reply..."
                          value={answerInputText}
                          onChange={(e) => setAnswerInputText(e.target.value)}
                          className="w-full quiet-input p-3 text-xs resize-none"
                        />
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setAnsweringQuestionId(null)}
                            className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink-primary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAnswerQuestion(q.id)}
                            className="px-4 py-1.5 quiet-btn-primary text-xs"
                          >
                            Seal Answer ♡
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAnsweringQuestionId(q.id);
                          setAnswerInputText(q.myAnswer || "");
                        }}
                        className="px-4 py-2 quiet-btn-outline text-xs flex items-center space-x-1.5"
                      >
                        <span>{q.myAnswer ? "Edit My Answer" : "Answer Question"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. THIS OR THAT */}
      {activeSubTab === "this_or_that" && (
        <div className="max-w-2xl mx-auto space-y-4">
          {thisOrThatList.map((game) => (
            <div key={game.id} className="quiet-card p-6 space-y-4 text-center">
              <span className="text-[10px] uppercase tracking-wider text-accent-primary font-sans">
                {game.category} • Mood
              </span>
              <h3 className="font-serif text-2xl text-ink-primary font-normal">{game.prompt}</h3>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[game.optionA, game.optionB].map((opt, idx) => {
                  const isMyChoice = game.myChoice === opt;
                  const isPartnerChoice = game.bothAnswered && game.partnerChoice === opt;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectThisOrThat(game.id, opt)}
                      className={`p-4 rounded-xl border text-xs sm:text-sm font-sans transition-all flex flex-col items-center justify-center space-y-1.5 ${
                        isMyChoice
                          ? "bg-accent-primary text-white border-accent-primary shadow-sm"
                          : "bg-canvas-elevated hover:bg-canvas-card border-canvas-border text-ink-primary"
                      }`}
                    >
                      <span className="font-medium">{opt}</span>
                      {isMyChoice && <span className="text-[10px] opacity-80">(Your Pick)</span>}
                      {isPartnerChoice && (
                        <span className="text-[10px] text-accent-secondary">
                          ({game.partnerName}&apos;s Pick)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {game.bothAnswered && (
                <p className="text-xs font-serif italic text-accent-primary pt-1">
                  {game.isMatch ? "You both matched! ♡" : "Sweet differences make us complete ♡"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. GUESS MY ANSWER */}
      {activeSubTab === "guess" && (
        <div className="max-w-2xl mx-auto space-y-4">
          {guessList.map((game) => (
            <div key={game.id} className="quiet-card p-6 space-y-4">
              <span className="text-[10px] uppercase tracking-wider text-accent-primary font-sans">
                Quiz • {game.category}
              </span>
              <h3 className="font-serif text-2xl text-ink-primary font-normal">{game.prompt}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {game.options.map((choice: string, idx: number) => {
                  const isMyChoice = game.myChoice === choice;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectGuessAnswer(game.id, choice)}
                      className={`p-3 rounded-xl border text-xs font-sans text-left transition-all ${
                        isMyChoice
                          ? "bg-accent-primary text-white border-accent-primary"
                          : "bg-canvas-elevated hover:bg-canvas-card border-canvas-border text-ink-primary"
                      }`}
                    >
                      <span>{choice}</span>
                      {isMyChoice && <span className="float-right text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. REFLECTIONS JOURNAL */}
      {activeSubTab === "journal" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <form onSubmit={handleAddJournal} className="quiet-card p-6 space-y-3">
            <h4 className="font-serif text-xl text-ink-primary font-normal">Weekly Gratitude Reflection</h4>
            <p className="text-xs text-ink-muted">What made you feel grateful for us this week?</p>
            <textarea
              rows={3}
              value={newJournalContent}
              onChange={(e) => setNewJournalContent(e.target.value)}
              placeholder="Record a thought, a feeling, or a quiet thank you..."
              className="w-full quiet-input p-3 text-xs resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingJournal || !newJournalContent.trim()}
                className="px-5 py-2 quiet-btn-primary text-xs"
              >
                {savingJournal ? "Saving..." : "Save Reflection ♡"}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {journalEntries.map((j) => (
              <div key={j.id} className="quiet-card p-5 space-y-2">
                <p className="font-serif italic text-sm text-ink-primary leading-relaxed">
                  &ldquo;{j.content}&rdquo;
                </p>
                <div className="text-[11px] text-ink-muted font-sans flex items-center justify-between pt-2 border-t border-canvas-border/50">
                  <span>Written by {j.author.name}</span>
                  <span>{new Date(j.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
