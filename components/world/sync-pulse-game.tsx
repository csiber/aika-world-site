"use client";

import { useMemo, useState } from "react";

type MiniGameDictionary = {
  title: string;
  intro: string;
  objective: string;
  sliderLabel: string;
  sliderDescription: string;
  buttonLabel: string;
  resetLabel: string;
  attemptsLabel: string;
  feedback: {
    low: string;
    high: string;
    success: string;
  };
  hintTitle: string;
  hints: string[];
  successTitle: string;
  successDescription: string;
};

const TARGET_MIN = 18;
const TARGET_MAX = 82;
const TARGET_TOLERANCE = 2;

function getRandomTarget() {
  return Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN;
}

type PulseStatus = "idle" | "low" | "high" | "success";

type SyncPulseGameProps = {
  dictionary: MiniGameDictionary;
};

export function SyncPulseGame({ dictionary }: SyncPulseGameProps) {
  const [target, setTarget] = useState(() => getRandomTarget());
  const [sliderValue, setSliderValue] = useState<number>(50);
  const [attempts, setAttempts] = useState<number>(0);
  const [status, setStatus] = useState<PulseStatus>("idle");
  const [history, setHistory] = useState<number[]>([]);

  const isResolved = status === "success";

  const shownHints = useMemo(() => {
    if (dictionary.hints.length === 0) {
      return [] as string[];
    }
    if (attempts >= 7) {
      return dictionary.hints;
    }
    if (attempts >= 5) {
      return dictionary.hints.slice(0, Math.min(2, dictionary.hints.length));
    }
    if (attempts >= 3) {
      return dictionary.hints.slice(0, 1);
    }
    return [] as string[];
  }, [attempts, dictionary.hints]);

  const handlePulse = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setHistory((prev) => [...prev, sliderValue]);

    if (Math.abs(sliderValue - target) <= TARGET_TOLERANCE) {
      setStatus("success");
      return;
    }

    if (sliderValue < target) {
      setStatus("low");
      return;
    }

    setStatus("high");
  };

  const handleReset = () => {
    setTarget(getRandomTarget());
    setSliderValue(50);
    setAttempts(0);
    setStatus("idle");
    setHistory([]);
  };

  return (
    <div className="space-y-6 rounded-3xl border border-purple-300/30 bg-black/60 p-6 text-white shadow-xl shadow-purple-500/20">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.35em] text-purple-200/70">
          {dictionary.title}
        </span>
        <p className="text-sm text-white/75">{dictionary.intro}</p>
        <p className="text-base font-medium text-white">{dictionary.objective}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-5">
        <label htmlFor="sync-pulse-slider" className="flex flex-col gap-1 text-sm text-white/80">
          <span className="font-medium text-white">{dictionary.sliderLabel}</span>
          <span className="text-xs text-white/60">{dictionary.sliderDescription}</span>
        </label>
        <input
          id="sync-pulse-slider"
          type="range"
          min={0}
          max={100}
          value={sliderValue}
          onChange={(event) => setSliderValue(Number(event.target.value))}
          className="w-full accent-purple-400"
          aria-describedby="sync-pulse-readout"
          disabled={isResolved}
        />
        <div
          id="sync-pulse-readout"
          className="flex items-center justify-between rounded-xl bg-black/40 px-4 py-2 text-sm text-white/80"
        >
          <span>
            {dictionary.attemptsLabel}: <strong className="font-semibold text-white">{attempts}</strong>
          </span>
          <span>
            {sliderValue}
            <span className="text-xs text-white/50"> Hz</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePulse}
            disabled={isResolved}
            className="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:cursor-not-allowed disabled:bg-purple-500/60"
          >
            {dictionary.buttonLabel}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
          >
            {dictionary.resetLabel}
          </button>
        </div>
      </div>

      {status !== "idle" && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p className="font-semibold text-white">
            {status === "success"
              ? dictionary.feedback.success
              : status === "low"
                ? dictionary.feedback.low
                : dictionary.feedback.high}
          </p>
          {history.length > 0 && (
            <p className="text-xs text-white/60">
              {history
                .map((value, index) => `${index + 1}. ${value} Hz`)
                .join(" • ")}
            </p>
          )}
        </div>
      )}

      {isResolved && (
        <div className="space-y-2 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <p className="text-base font-semibold text-emerald-200">{dictionary.successTitle}</p>
          <p>{dictionary.successDescription}</p>
        </div>
      )}

      {shownHints.length > 0 && !isResolved && (
        <div className="space-y-2 rounded-2xl border border-purple-200/30 bg-purple-500/10 p-4 text-sm text-purple-100">
          <p className="font-semibold uppercase tracking-[0.3em] text-purple-100">
            {dictionary.hintTitle}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-purple-50">
            {shownHints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

