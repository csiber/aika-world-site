"use client";

import type { MutableRefObject, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type HeroSoundscapeProps = {
  heroRef: MutableRefObject<HTMLDivElement | null>;
  targets: RefObject<HTMLElement>[];
};

type AmbientNodes = {
  baseOsc: OscillatorNode;
  modulationOsc: OscillatorNode;
  baseGain: GainNode;
};

export function HeroSoundscape({ heroRef, targets }: HeroSoundscapeProps) {
  const [enabled, setEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<AmbientNodes | null>(null);

  const isAudioSupported = useMemo(
    () =>
      typeof window !== "undefined" &&
      ("AudioContext" in window || "webkitAudioContext" in (window as Window & { webkitAudioContext?: typeof AudioContext })),
    [],
  );

  const ensureContext = useCallback(async () => {
    if (!isAudioSupported) {
      return null;
    }

    if (!audioContextRef.current) {
      const contextCtor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!contextCtor) {
        return null;
      }

      audioContextRef.current = new contextCtor();
    }

    const context = audioContextRef.current;
    if (context.state === "suspended") {
      await context.resume();
    }

    return context;
  }, [isAudioSupported]);

  const playTone = useCallback(
    async (frequency: number, type: OscillatorType = "sine", duration = 0.4) => {
      const context = await ensureContext();
      if (!context) {
        return;
      }

      const now = context.currentTime;
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + duration + 0.05);
    },
    [ensureContext],
  );

  const startAmbient = useCallback(
    async () => {
      const context = await ensureContext();
      if (!context) {
        return;
      }

      if (ambientRef.current) {
        return;
      }

      const baseOsc = context.createOscillator();
      baseOsc.type = "sine";
      baseOsc.frequency.setValueAtTime(138, context.currentTime);

      const baseGain = context.createGain();
      baseGain.gain.setValueAtTime(0.0001, context.currentTime);
      baseGain.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 1.2);

      const modulationOsc = context.createOscillator();
      modulationOsc.type = "sine";
      modulationOsc.frequency.setValueAtTime(0.055, context.currentTime);

      const modulationGain = context.createGain();
      modulationGain.gain.setValueAtTime(18, context.currentTime);

      modulationOsc.connect(modulationGain);
      modulationGain.connect(baseOsc.frequency);

      baseOsc.connect(baseGain);
      baseGain.connect(context.destination);

      baseOsc.start();
      modulationOsc.start();

      ambientRef.current = { baseOsc, modulationOsc, baseGain };
    },
    [ensureContext],
  );

  const stopAmbient = useCallback(() => {
    if (!ambientRef.current) {
      return;
    }

    const { baseOsc, modulationOsc, baseGain } = ambientRef.current;
    const context = baseOsc.context;
    const now = context.currentTime;

    baseGain.gain.cancelScheduledValues(now);
    baseGain.gain.setValueAtTime(baseGain.gain.value, now);
    baseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    baseOsc.stop(now + 0.85);
    modulationOsc.stop(now + 0.85);

    ambientRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopAmbient();
      return;
    }

    void startAmbient();
  }, [enabled, startAmbient, stopAmbient]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listeners: Array<{ target: HTMLElement; type: keyof HTMLElementEventMap; listener: EventListener }>
      = [];

    const hoverHandler: EventListener = () => {
      void playTone(520, "triangle");
    };

    const clickHandler: EventListener = () => {
      void playTone(760, "sine", 0.55);
    };

    for (const ref of targets) {
      const element = ref.current;
      if (!element) continue;
      element.addEventListener("pointerenter", hoverHandler);
      element.addEventListener("click", clickHandler);
      listeners.push({ target: element, type: "pointerenter", listener: hoverHandler });
      listeners.push({ target: element, type: "click", listener: clickHandler });
    }

    const heroElement = heroRef.current;
    const heroHandler: EventListener = () => {
      void playTone(310, "sawtooth", 0.6);
    };
    if (heroElement) {
      heroElement.addEventListener("pointerenter", heroHandler);
      listeners.push({ target: heroElement, type: "pointerenter", listener: heroHandler });
    }

    return () => {
      for (const { target, type, listener } of listeners) {
        target.removeEventListener(type, listener);
      }
    };
  }, [enabled, heroRef, targets, playTone]);

  useEffect(() => {
    return () => {
      stopAmbient();
      if (!audioContextRef.current) {
        return;
      }

      const context = audioContextRef.current;
      if (context.state !== "closed") {
        context.close().catch(() => {
          /* intentionally ignored */
        });
      }
    };
  }, [stopAmbient]);

  if (!isAudioSupported) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 transition",
          enabled
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-white/5 text-white/70 hover:bg-white/10",
        )}
        onClick={() => setEnabled((value) => !value)}
      >
        <span aria-hidden>{enabled ? "🔊" : "🔈"}</span>
        <span>{enabled ? "Hanghatások aktívak" : "Hanghatások bekapcsolása"}</span>
      </button>
      <span className="text-white/40">
        A gombokra vitt kurzor űrszerű hangokat szólaltat meg.
      </span>
    </div>
  );
}
