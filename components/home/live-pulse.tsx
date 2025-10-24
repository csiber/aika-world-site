"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PulseContent = Dictionary["home"]["pulse"];
type PulseSignal = PulseContent["signals"][number];

const trendStyles: Record<PulseSignal["trend"], string> = {
  up: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  down: "text-rose-300 border-rose-400/40 bg-rose-400/10",
  steady: "text-sky-200 border-sky-300/40 bg-sky-300/10",
};

export function LivePulse({ liveLabel, signals, telemetryLabel, trendLabels }: PulseContent) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (signals.length === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      if (!isPaused) {
        setActiveIndex((index) => (index + 1) % signals.length);
      }
    }, 4500);

    return () => {
      window.clearInterval(interval);
    };
  }, [signals.length, isPaused]);

  useEffect(() => {
    if (activeIndex >= signals.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, signals.length]);

  const activeSignal = signals[activeIndex];

  const tickerItems = useMemo(
    () =>
      signals.map((signal) => `${signal.name}: ${signal.status} (${signal.delta}) ${trendLabel(signal.trend, trendLabels)}`),
    [signals, trendLabels],
  );

  const pathData = useMemo(() => createPath(activeSignal?.history ?? []), [activeSignal?.history]);

  return (
    <div
      className="grid gap-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/60 via-indigo-950/40 to-purple-950/40 p-8"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/80">
            <motion.span
              className="inline-flex h-2 w-2 rounded-full bg-emerald-300"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {liveLabel}
          </span>
          <AnimatePresence mode="wait">
            <motion.h3
              key={activeSignal?.name ?? "fallback"}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl font-semibold text-white"
            >
              {activeSignal?.name}
            </motion.h3>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeSignal?.description ?? "fallback-description"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl text-sm text-white/75 md:text-base"
            >
              {activeSignal?.description}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex flex-wrap gap-2">
          {signals.map((signal, index) => {
            const isActive = index === activeIndex;
            return (
              <motion.button
                key={signal.name}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setIsPaused(true);
                }}
                className={cn(
                  "relative overflow-hidden rounded-full border px-4 py-2 text-left text-xs uppercase tracking-[0.3em] text-white/70 transition",
                  isActive ? "border-white/70 bg-white/20 text-white" : "border-white/20 bg-white/5 hover:border-white/40",
                )}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
              >
                <span className="block text-[10px] font-semibold">{signal.status}</span>
                <span className="mt-1 block text-[10px] text-white/60">{signal.delta}</span>
                {isActive ? (
                  <motion.span
                    layoutId="pulse-active-pill"
                    className="pointer-events-none absolute inset-0 rounded-full border border-white/40"
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  />
                ) : null}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSignal ? (
          <motion.div
            key={activeSignal.name}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6"
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-white/40 to-transparent mix-blend-screen"
              animate={{ x: ["-5%", "105%"], opacity: [0, 1, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">{activeSignal.status}</span>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                  <TrendBadge trend={activeSignal.trend} delta={activeSignal.delta} labels={trendLabels} />
                </div>
              </div>
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span>{telemetryLabel}</span>
                <motion.span
                  className="inline-flex h-2 w-2 rounded-full bg-cyan-300"
                  animate={{ scale: [0.7, 1.1, 0.7] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>

            <div className="relative z-10 mt-6 h-44 w-full">
              <MetricGraph signal={activeSignal} pathData={pathData} />
            </div>

            <div className="relative z-10 mt-6 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <motion.div
                className="flex min-w-full gap-8 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/60"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                {[...tickerItems, ...tickerItems].map((item, index) => (
                  <span key={`${item}-${index}`} className="whitespace-nowrap">
                    {item}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MetricGraph({ signal, pathData }: { signal: PulseSignal; pathData: string }) {
  if (!pathData) {
    return null;
  }

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(192,132,252,0.55)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0.2)" />
        </linearGradient>
        <linearGradient id="pulse-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(196,181,253,0.8)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0.9)" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${pathData} L 100 100 L 0 100 Z`}
        fill="url(#pulse-gradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#pulse-line)"
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.circle
        r={1.8}
        fill="rgba(125,211,252,0.95)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <animateMotion dur="6s" repeatCount="indefinite" path={pathData} keyPoints="0;1" keyTimes="0;1" />
      </motion.circle>
      <text x="0" y="96" className="fill-white/60 text-[7px] uppercase tracking-[0.3em]">
        {signal.name}
      </text>
    </svg>
  );
}

function createPath(history: number[]) {
  if (!history.length) {
    return "";
  }

  const max = Math.max(...history, 100);
  const min = Math.min(...history, 0);
  const range = Math.max(max - min, 1);

  return history
    .map((value, index) => {
      const x = (index / Math.max(history.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / range) * 80 - 10;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function TrendBadge({ trend, delta, labels }: { trend: PulseSignal["trend"]; delta: string; labels: PulseContent["trendLabels"] }) {
  const label = trendLabel(trend, labels);

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", trendStyles[trend])}>
      <TrendIcon trend={trend} />
      <span>{delta}</span>
      <span className="text-white/60">{label}</span>
    </span>
  );
}

function TrendIcon({ trend }: { trend: PulseSignal["trend"] }) {
  if (trend === "up") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M5 15.5 12 8.5l4 4 4-4V16h-2V12.5l-2 2-4-4-5 5z" />
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M5 8.5 12 15.5l4-4 4 4V8h-2v3.5l-2-2-4 4-5-5z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M5 12h14v2H5z" />
    </svg>
  );
}

function trendLabel(trend: PulseSignal["trend"], labels: PulseContent["trendLabels"]) {
  switch (trend) {
    case "up":
      return labels.up;
    case "down":
      return labels.down;
    default:
      return labels.steady;
  }
}

