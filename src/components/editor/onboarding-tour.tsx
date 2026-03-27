/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MousePointer2,
  Sparkles,
  Cable,
  Code,
  ArrowRight,
  ArrowLeft,
  X,
  Database,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface TourStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  visual: React.ReactNode;
}

const STEPS: TourStep[] = [
  {
    icon: <MousePointer2 className="w-5 h-5" />,
    title: "Design Visually",
    description:
      "Create tables on the canvas with a single click. Select any table to edit its name, columns, types, and constraints in the floating sidebar.",
    visual: <VisualCanvasIllustration />,
  },
  {
    icon: <Cable className="w-5 h-5" />,
    title: "Draw Relationships",
    description:
      "Hover over a column to reveal connection handles. Drag from one handle to another to create foreign key relationships — 1:1, 1:n, or m:n.",
    visual: <RelationshipIllustration />,
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Architect",
    description:
      "Describe your application in plain English and our AI will generate a complete relational schema. You can also ask it to modify an existing design.",
    visual: <AIIllustration />,
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: "Export Anywhere",
    description:
      "When you're done, export production-ready code for PostgreSQL, MySQL, SQLite, Prisma ORM, or Mongoose — all with one click.",
    visual: <ExportIllustration />,
  },
];

export function OnboardingTour({ isOpen, onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length - 1;

  // Reset to first step when tour opens
  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onComplete();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (isLastStep) onComplete();
        else setStep((s) => Math.min(s + 1, STEPS.length - 1));
      } else if (e.key === "ArrowLeft") {
        setStep((s) => Math.max(s - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLastStep, onComplete]);

  if (!isOpen) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onComplete}
      />

      {/* Tour Card */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-400"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Skip / Close Button */}
        <button
          onClick={onComplete}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all"
          aria-label="Skip tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Counter Pill */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Illustration Area */}
        <div className="h-44 sm:h-52 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.3] dark:opacity-[0.15] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div
            key={step}
            className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {current.visual}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8">
          <div
            key={`content-${step}`}
            className="animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white">
                {current.icon}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {current.title}
              </h2>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 sm:mb-8">
              {current.description}
            </p>
          </div>

          {/* Footer: Progress Dots + Navigation */}
          <div className="flex items-center justify-between">
            {/* Progress Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-6 h-2 bg-zinc-900 dark:bg-white"
                      : i < step
                        ? "w-2 h-2 bg-zinc-400 dark:bg-zinc-500"
                        : "w-2 h-2 bg-zinc-200 dark:bg-zinc-700"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}

              {isLastStep ? (
                <button
                  onClick={onComplete}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
                >
                  Start Building <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Docs link on last step */}
          {isLastStep && (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-center">
              <Link
                href="/docs"
                onClick={onComplete}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read the full documentation
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Mini illustrations for each step (pure CSS/JSX, no images)
// ═══════════════════════════════════════════════════════════════

function VisualCanvasIllustration() {
  return (
    <div className="flex items-center gap-6">
      {/* Mini table node */}
      <div className="w-36 bg-white dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-600 rounded-xl shadow-lg overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-500">
        <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5">
          <Database className="w-3 h-3 text-zinc-400" />
          <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">
            users
          </span>
        </div>
        <div className="p-2 space-y-1.5">
          <div className="flex justify-between text-[9px]">
            <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              id
            </span>
            <span className="text-zinc-400 font-mono">UUID</span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-zinc-600 dark:text-zinc-300 ml-2.5">
              email
            </span>
            <span className="text-zinc-400 font-mono">VARCHAR</span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-zinc-600 dark:text-zinc-300 ml-2.5">
              name
            </span>
            <span className="text-zinc-400 font-mono">VARCHAR</span>
          </div>
        </div>
      </div>

      {/* Cursor indicator */}
      <div className="flex flex-col items-center gap-2">
        <MousePointer2 className="w-6 h-6 text-zinc-900 dark:text-white animate-bounce" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
          Click to edit
        </span>
      </div>
    </div>
  );
}

function RelationshipIllustration() {
  return (
    <div className="flex items-center gap-4">
      {/* Source mini table */}
      <div className="w-24 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-md overflow-hidden">
        <div className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-200">
            orders
          </span>
        </div>
        <div className="p-1.5 space-y-1">
          <div className="text-[8px] text-zinc-500">id</div>
          <div className="text-[8px] text-zinc-900 dark:text-white font-bold flex items-center justify-between">
            user_id
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Animated connection line */}
      <svg width="60" height="24" className="overflow-visible">
        <path
          d="M 0 12 C 20 12, 40 12, 60 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="text-blue-500 dark:text-blue-400"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="8"
            to="0"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
        {/* Arrow head */}
        <polygon
          points="55,7 60,12 55,17"
          className="fill-blue-500 dark:fill-blue-400"
        />
      </svg>

      {/* Target mini table */}
      <div className="w-24 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-md overflow-hidden">
        <div className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-200">
            users
          </span>
        </div>
        <div className="p-1.5 space-y-1">
          <div className="text-[8px] text-zinc-900 dark:text-white font-bold flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            id
          </div>
          <div className="text-[8px] text-zinc-500">email</div>
        </div>
      </div>
    </div>
  );
}

function AIIllustration() {
  return (
    <div className="w-72 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-700 rounded-full shadow-xl p-1.5 flex items-center gap-2">
      <div className="pl-3 pr-1">
        <Sparkles className="w-4 h-4 text-zinc-900 dark:text-white" />
      </div>
      <div className="flex-1 py-2">
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
          &ldquo;A gym app with memberships…&rdquo;
        </span>
      </div>
      <div className="p-2 bg-black dark:bg-white rounded-full">
        <ArrowRight className="w-3.5 h-3.5 text-white dark:text-black" />
      </div>
    </div>
  );
}

function ExportIllustration() {
  return (
    <div className="w-64 bg-[#0d1117] rounded-xl border border-zinc-700 shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
        <Code className="w-3 h-3 text-zinc-500" />
        <span className="text-[9px] font-mono text-zinc-400">
          schema.prisma
        </span>
      </div>
      <div className="p-3 font-mono text-[10px] leading-relaxed">
        <div>
          <span className="text-zinc-500">model</span>{" "}
          <span className="text-white font-bold">User</span>{" "}
          <span className="text-zinc-500">{"{"}</span>
        </div>
        <div className="pl-3">
          <span className="text-zinc-300">id</span>
          <span className="text-zinc-600 ml-3">String @id</span>
        </div>
        <div className="pl-3">
          <span className="text-zinc-300">email</span>
          <span className="text-zinc-600 ml-1">String @unique</span>
        </div>
        <div>
          <span className="text-zinc-500">{"}"}</span>
        </div>
      </div>
    </div>
  );
}