"use client";

import { useMemo, useState } from "react";

type SupplyRouteDictionary = {
  title: string;
  intro: string;
  objective: string;
  targetLabel: string;
  selectionLabel: string;
  attemptsLabel: string;
  nodeAriaLabel: string;
  confirmLabel: string;
  resetLabel: string;
  statuses: {
    low: string;
    high: string;
    incomplete: string;
    success: string;
  };
  successTitle: string;
  successDescription: string;
  historyTitle: string;
  hintTitle: string;
  hints: string[];
};

type NodeState = {
  id: number;
  value: number;
};

type AttemptSummary = {
  attempt: number;
  selection: number[];
  sum: number;
};

type SupplyRouteGameProps = {
  dictionary: SupplyRouteDictionary;
};

const NODE_COUNT = 5;
const VALUE_MIN = 12;
const VALUE_MAX = 42;

function createUniqueValues(count: number): number[] {
  const values = new Set<number>();
  while (values.size < count) {
    const next = Math.floor(Math.random() * (VALUE_MAX - VALUE_MIN + 1)) + VALUE_MIN;
    values.add(next);
  }
  return Array.from(values);
}

function createPuzzle(): { nodes: NodeState[]; target: number } {
  const baseValues = createUniqueValues(NODE_COUNT);
  const firstIndex = Math.floor(Math.random() * NODE_COUNT);
  let secondIndex = firstIndex;
  while (secondIndex === firstIndex) {
    secondIndex = Math.floor(Math.random() * NODE_COUNT);
  }
  const target = baseValues[firstIndex] + baseValues[secondIndex];
  const nodes = baseValues.map((value, index) => ({ id: index + 1, value }));
  return { nodes, target };
}

function formatWithDifference(template: string, difference: number): string {
  return template.replace("{{difference}}", String(Math.abs(difference)));
}

function formatNodeAria(template: string, id: number): string {
  return template.replace("{{id}}", String(id));
}

export function SupplyRouteGame({ dictionary }: SupplyRouteGameProps) {
  const [{ nodes, target }, setPuzzle] = useState(createPuzzle);
  const [selected, setSelected] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<"idle" | "low" | "high" | "incomplete" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<AttemptSummary[]>([]);

  const isResolved = status === "success";

  const selectedSum = useMemo(() => selected.reduce((sum, id) => {
    const node = nodes.find((item) => item.id === id);
    return node ? sum + node.value : sum;
  }, 0), [nodes, selected]);

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

  const toggleNode = (id: number) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleCheck = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (selected.length < 2) {
      setStatus("incomplete");
      setMessage(dictionary.statuses.incomplete);
      return;
    }

    const sum = selectedSum;
    setHistory((prev) => [...prev, { attempt: nextAttempts, selection: [...selected], sum }]);

    if (sum === target) {
      setStatus("success");
      setMessage(dictionary.statuses.success);
      return;
    }

    if (sum < target) {
      setStatus("low");
      setMessage(formatWithDifference(dictionary.statuses.low, target - sum));
      return;
    }

    setStatus("high");
    setMessage(formatWithDifference(dictionary.statuses.high, sum - target));
  };

  const handleReset = () => {
    setPuzzle(createPuzzle());
    setSelected([]);
    setAttempts(0);
    setStatus("idle");
    setMessage(null);
    setHistory([]);
  };

  return (
    <div className="space-y-6 rounded-3xl border border-emerald-300/30 bg-black/60 p-6 text-white shadow-xl shadow-emerald-500/20">
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">{dictionary.title}</span>
        <p className="text-sm text-white/75">{dictionary.intro}</p>
        <p className="text-base font-medium text-white">{dictionary.objective}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/80">
          <span className="font-semibold text-white">{dictionary.targetLabel}: <span className="text-white/70">{target}</span></span>
          <span>
            {dictionary.selectionLabel}: <span className="font-semibold text-white">{selectedSum}</span>
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {nodes.map((node) => {
            const isActive = selected.includes(node.id);
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => toggleNode(node.id)}
                className={`flex flex-col items-center justify-center rounded-2xl border px-3 py-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${
                  isActive
                    ? "border-emerald-300 bg-emerald-500/20 text-emerald-100"
                    : "border-white/10 bg-black/40 text-white/70 hover:border-white/30 hover:bg-white/5"
                } ${isResolved ? "cursor-not-allowed opacity-70" : ""}`}
                disabled={isResolved}
                aria-pressed={isActive}
                aria-label={formatNodeAria(dictionary.nodeAriaLabel, node.id)}
              >
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">#{node.id}</span>
                <span className="mt-2 text-lg">{node.value}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCheck}
            disabled={isResolved}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
          >
            {dictionary.confirmLabel}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
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

      {message && (
        <div className={`space-y-2 rounded-2xl border p-4 text-sm ${
          status === "success"
            ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-100"
            : "border-white/10 bg-white/5 text-white/80"
        }`}
        >
          <p className="font-semibold">
            {status === "success" ? dictionary.successTitle : message}
          </p>
          {status === "success" && <p>{dictionary.successDescription}</p>}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          <p className="font-semibold uppercase tracking-[0.3em] text-white/60">{dictionary.historyTitle}</p>
          <ul className="space-y-1">
            {history.map((item) => (
              <li key={item.attempt}>
                <span className="font-semibold text-white">#{item.attempt}</span> — {item.selection.map((id) => `#${id}`).join(" + ")}
                <span className="text-white/50"> = {item.sum}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shownHints.length > 0 && status !== "success" && (
        <div className="space-y-2 rounded-2xl border border-emerald-200/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <p className="font-semibold uppercase tracking-[0.3em] text-emerald-100">{dictionary.hintTitle}</p>
          <ul className="list-disc space-y-1 pl-5 text-emerald-50">
            {shownHints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
