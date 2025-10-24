"use client";

import { useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PulseContent = Dictionary["home"]["pulse"];

const filterHistories: Record<string, number[]> = {
  stability: [62, 66, 67, 71, 74, 76, 79, 81],
  supplies: [48, 52, 55, 57, 60, 63, 65, 64],
  intel: [54, 56, 59, 62, 65, 68, 70, 72],
  weather: [36, 41, 43, 40, 45, 47, 50, 53],
  default: [62, 66, 67, 71, 74, 76, 79, 81],
};

export function LivePulse({ feedBadge, feedTitle, filters, graphCaption }: PulseContent) {
  const initialKey = filters[0]?.key ?? "all";
  const [activeFilter, setActiveFilter] = useState(initialKey);

  const history = useMemo(() => filterHistories[activeFilter] ?? filterHistories.default, [activeFilter]);
  const pathData = useMemo(() => createPath(history), [history]);

  const currentValue = history.at(-1) ?? 0;
  const startValue = history[0] ?? currentValue;
  const delta = currentValue - startValue;
  const deltaLabel = delta === 0 ? "±0" : `${delta > 0 ? "+" : ""}${delta.toFixed(0)}`;
  const activeLabel = filters.find((filter) => filter.key === activeFilter)?.label ?? feedTitle;

  return (
    <div className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-black/60 via-indigo-950/40 to-purple-950/40 p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/80 animate-pulse">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
          {feedBadge}
        </span>
        <h3 className="text-3xl font-semibold text-white">
          {feedTitle}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = filter.key === activeFilter;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition",
                isActive
                  ? "border-white/70 bg-white/20 text-white shadow-[0_0_25px_rgba(123,83,255,0.35)]"
                  : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-start">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.12),_transparent_65%)] animate-pulse"
          />
          {pathData ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="relative z-10 h-48 w-full">
              <defs>
                <linearGradient id="pulse-area" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(196,181,253,0.4)" />
                  <stop offset="100%" stopColor="rgba(59,130,246,0.15)" />
                </linearGradient>
                <linearGradient id="pulse-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(216,180,254,0.9)" />
                  <stop offset="100%" stopColor="rgba(56,189,248,0.9)" />
                </linearGradient>
              </defs>
              <path d={`${pathData} L 100 100 L 0 100 Z`} fill="url(#pulse-area)" opacity={0.6} />
              <path d={pathData} fill="none" stroke="url(#pulse-line)" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          ) : null}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-xs uppercase tracking-[0.3em] text-white/60">{activeLabel}</span>
            <div className="mt-3 flex items-baseline gap-2 text-3xl font-semibold text-white">
              {currentValue.toFixed(0)}
              <span className={cn("text-sm", delta >= 0 ? "text-emerald-300" : "text-rose-300")}>{deltaLabel}</span>
            </div>
          </div>
          <p className="text-sm text-white/75">{graphCaption}</p>
        </div>
      </div>
    </div>
  );
}

function createPath(history: number[]) {
  if (!history.length) {
    return "";
  }

  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = Math.max(max - min, 1);

  return history
    .map((value, index) => {
      const x = (index / Math.max(history.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / range) * 80 - 10;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}
