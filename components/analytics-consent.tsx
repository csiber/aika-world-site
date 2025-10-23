"use client";

import { useEffect, useState } from "react";

const storageKey = "aika-consent-dismissed";

type AnalyticsConsentProps = {
  message: string;
  acknowledge: string;
};

export function AnalyticsConsent({ message, acknowledge }: AnalyticsConsentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, new Date().toISOString());
    }
    setVisible(false);
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 w-[min(90vw,520px)] -translate-x-1/2 rounded-3xl border border-white/20 bg-black/80 p-6 text-sm text-white shadow-[0_20px_80px_-40px_rgba(123,83,255,0.8)] backdrop-blur"
      role="dialog"
      aria-live="polite"
      aria-label={message}
    >
      <p className="text-pretty text-white/80">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-4 inline-flex items-center rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-950 transition-transform hover:-translate-y-0.5"
      >
        {acknowledge}
      </button>
    </div>
  );
}
