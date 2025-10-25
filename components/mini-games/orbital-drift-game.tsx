"use client";

import { useMemo, useState } from "react";

type AxisDictionary = {
  id: string;
  label: string;
  lowHint: string;
  highHint: string;
};

type OrbitalDriftDictionary = {
  title: string;
  intro: string;
  objective: string;
  axesTitle: string;
  axesDescription: string;
  attemptsLabel: string;
  calibrateLabel: string;
  resetLabel: string;
  statusAdjust: string;
  successTitle: string;
  successDescription: string;
  logTitle: string;
  hintTitle: string;
  hints: string[];
  axes: AxisDictionary[];
};

type DriftStatus = "idle" | "adjust" | "success";

type AttemptRecord = {
  attempt: number;
  values: Record<string, number>;
};

const TARGET_MIN = 18;
const TARGET_MAX = 82;
const TARGET_TOLERANCE = 3;

function createTargetMap(axes: AxisDictionary[]): Record<string, number> {
  return Object.fromEntries(
    axes.map((axis) => [axis.id, Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN])
  );
}

function createInitialValues(axes: AxisDictionary[]): Record<string, number> {
  return Object.fromEntries(axes.map((axis) => [axis.id, 50]));
}

type OrbitalDriftGameProps = {
  dictionary: OrbitalDriftDictionary;
};

export function OrbitalDriftGame({ dictionary }: OrbitalDriftGameProps) {
  const [targets, setTargets] = useState<Record<string, number>>(() => createTargetMap(dictionary.axes));
  const [values, setValues] = useState<Record<string, number>>(() => createInitialValues(dictionary.axes));
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<DriftStatus>("idle");
  const [feedback, setFeedback] = useState<string[]>([]);
  const [history, setHistory] = useState<AttemptRecord[]>([]);

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

  const handleValueChange = (axisId: string, nextValue: number) => {
    setValues((prev) => ({ ...prev, [axisId]: nextValue }));
  };

  const handleCalibrate = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setHistory((prev) => [...prev, { attempt: nextAttempts, values: { ...values } }]);

    const nextFeedback: string[] = [];

    for (const axis of dictionary.axes) {
      const target = targets[axis.id];
      const current = values[axis.id];
      if (Math.abs(current - target) <= TARGET_TOLERANCE) {
        continue;
      }
      if (current < target) {
        nextFeedback.push(axis.lowHint);
      } else {
        nextFeedback.push(axis.highHint);
      }
    }

    if (nextFeedback.length === 0) {
      setStatus("success");
      setFeedback([]);
      return;
    }

    setStatus("adjust");
    setFeedback(nextFeedback);
  };

  const handleReset = () => {
    setTargets(createTargetMap(dictionary.axes));
    setValues(createInitialValues(dictionary.axes));
    setAttempts(0);
    setStatus("idle");
    setFeedback([]);
    setHistory([]);
  };

  return (
    <div className="space-y-6 rounded-3xl border border-blue-300/30 bg-black/60 p-6 text-white shadow-xl shadow-blue-500/20">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.35em] text-blue-200/70">{dictionary.title}</span>
        <p className="text-sm text-white/75">{dictionary.intro}</p>
        <p className="text-base font-medium text-white">{dictionary.objective}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-5">
        <div className="space-y-1 text-sm text-white/80">
          <p className="font-semibold text-white">{dictionary.axesTitle}</p>
          <p className="text-xs text-white/60">{dictionary.axesDescription}</p>
        </div>
        <div className="space-y-4">
          {dictionary.axes.map((axis) => (
            <div key={axis.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-white/80">
                <span className="font-medium text-white">{axis.label}</span>
                <span>
                  {values[axis.id]}
                  <span className="text-xs text-white/50">%</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={values[axis.id]}
                onChange={(event) => handleValueChange(axis.id, Number(event.target.value))}
                className="w-full accent-blue-400"
                disabled={isResolved}
                aria-label={axis.label}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCalibrate}
            disabled={isResolved}
            className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-500/60"
          >
            {dictionary.calibrateLabel}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            {dictionary.resetLabel}
          </button>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-black/40 px-4 py-2 text-sm text-white/80">
          <span>
            {dictionary.attemptsLabel}:{" "}
            <strong className="font-semibold text-white">{attempts}</strong>
          </span>
        </div>
      </div>

      {status === "adjust" && feedback.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p className="font-semibold text-white">{dictionary.statusAdjust}</p>
          <ul className="list-disc space-y-1 pl-5">
            {feedback.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {isResolved && (
        <div className="space-y-2 rounded-2xl border border-blue-300/40 bg-blue-500/10 p-4 text-sm text-blue-100">
          <p className="text-base font-semibold text-blue-100">{dictionary.successTitle}</p>
          <p>{dictionary.successDescription}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          <p className="font-semibold uppercase tracking-[0.3em] text-white/60">{dictionary.logTitle}</p>
          <ul className="space-y-1">
            {history.map((record) => (
              <li key={record.attempt}>
                <span className="font-semibold text-white">#{record.attempt}</span> —
                {" "}
                {dictionary.axes
                  .map((axis) => `${axis.label}: ${record.values[axis.id]}%`)
                  .join(" • ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {shownHints.length > 0 && !isResolved && (
        <div className="space-y-2 rounded-2xl border border-blue-200/30 bg-blue-500/10 p-4 text-sm text-blue-100">
          <p className="font-semibold uppercase tracking-[0.3em] text-blue-100">{dictionary.hintTitle}</p>
          <ul className="list-disc space-y-1 pl-5 text-blue-50">
            {shownHints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
