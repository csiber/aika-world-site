"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";

export type SnowfallProps = {
  /** Hány hópelyhet rendereljünk. */
  density?: number;
};

type Snowflake = {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  offset: number;
  drift: number;
  scale: number;
  opacity: number;
};

type SnowflakeStyle = CSSProperties & {
  "--snow-offset"?: string;
  "--snow-drift"?: string;
  "--snow-scale"?: string;
};

type SnowAccumulateTarget = {
  key: string;
  element: HTMLElement;
};

type SettledFlake = {
  id: number;
  ratio: number;
  size: number;
  createdAt: number;
};

type SettledSnowMap = Record<string, SettledFlake[]>;

const MAX_SETTLED_PER_TARGET = 90;
const SETTLED_LIFETIME = 1000 * 60 * 3;
const ACCUMULATION_INTERVAL = 900;

const createSnowflakes = (density: number): Snowflake[] => {
  return Array.from({ length: density }, (_, index) => {
    const size = 3 + Math.random() * 5;
    return {
      id: index,
      size,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 10 + Math.random() * 18,
      offset: (Math.random() - 0.5) * 160,
      drift: (Math.random() - 0.5) * 120,
      scale: 0.8 + Math.random() * 0.6,
      opacity: 0.4 + Math.random() * 0.6,
    } satisfies Snowflake;
  });
};

export function Snowfall({ density = 140 }: SnowfallProps) {
  const [flakes, setFlakes] = useState<Snowflake[]>([]);
  const [targets, setTargets] = useState<SnowAccumulateTarget[]>([]);
  const [settledSnow, setSettledSnow] = useState<SettledSnowMap>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const settledCounter = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => {
      media.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateTargets = () => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-snow-accumulate]")
      ).map((element, index) => ({
        element,
        key: element.dataset.snowAccumulate || element.id || `target-${index}`,
      }));

      setTargets((previous) => {
        if (
          previous.length === elements.length &&
          previous.every((target, index) => target.element === elements[index].element && target.key === elements[index].key)
        ) {
          return previous;
        }

        return elements;
      });
    };

    updateTargets();

    const handleResize = () => updateTargets();
    window.addEventListener("resize", handleResize);

    const observer = new MutationObserver(() => updateTargets());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setFlakes([]);
      return;
    }

    setFlakes(createSnowflakes(density));
  }, [density, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || targets.length === 0 || typeof window === "undefined") {
      return;
    }

    const interval = window.setInterval(() => {
      const viewportWidth = window.innerWidth || 1;

      setSettledSnow((previous) => {
        const now = Date.now();
        const next: SettledSnowMap = {};
        let changed = false;
        const targetKeys = new Set(targets.map((target) => target.key));

        Object.keys(previous).forEach((key) => {
          if (!targetKeys.has(key)) {
            changed = true;
          }
        });

        targets.forEach(({ key, element }) => {
          const existing = previous[key] ?? [];
          const filtered = existing.filter((flake) => now - flake.createdAt < SETTLED_LIFETIME);
          if (filtered.length !== existing.length) {
            changed = true;
          }

          const rect = element.getBoundingClientRect();
          let updated = filtered;

          if (
            rect.width > 24 &&
            rect.height > 0 &&
            rect.bottom >= 0 &&
            rect.top <= window.innerHeight
          ) {
            const coverage = Math.min(1, rect.width / viewportWidth);
            const chance = Math.min(0.9, 0.25 + coverage * 0.75);

            if (Math.random() < chance) {
              const size = 14 + Math.random() * 26;
              const safeWidth = Math.max(rect.width - size, 0);
              const offset = safeWidth > 0 ? Math.random() * safeWidth + size / 2 : rect.width / 2;
              const ratio = rect.width > 0 ? offset / rect.width : 0.5;

              updated = [
                ...filtered,
                {
                  id: settledCounter.current++,
                  ratio: Math.min(1, Math.max(0, ratio)),
                  size,
                  createdAt: now,
                },
              ];

              if (updated.length > MAX_SETTLED_PER_TARGET) {
                updated = updated.slice(updated.length - MAX_SETTLED_PER_TARGET);
              }

              changed = true;
            }
          }

          next[key] = updated;
        });

        if (!changed) {
          return previous;
        }

        return next;
      });
    }, ACCUMULATION_INTERVAL);

    return () => window.clearInterval(interval);
  }, [targets, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setSettledSnow({});
    }
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || flakes.length === 0) {
    return null;
  }

  return (
    <>
      <div className="snowfall pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(148,197,255,0.22),_transparent_55%),_radial-gradient(circle_at_80%_10%,_rgba(14,165,233,0.18),_transparent_60%)]"
        />
        {flakes.map((flake) => {
          const style: SnowflakeStyle = {
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            opacity: flake.opacity,
            "--snow-offset": `${flake.offset}px`,
            "--snow-drift": `${flake.drift}px`,
            "--snow-scale": `${flake.scale}`,
          };

          return <span key={flake.id} className="snowflake" style={style} aria-hidden />;
        })}
      </div>
      {targets.map((target) => {
        const flakesForTarget = settledSnow[target.key] ?? [];
        const hasSnow = flakesForTarget.length > 0;

        return createPortal(
          <div className="settled-snow-layer" data-snow-present={hasSnow ? "true" : "false"} aria-hidden>
            {hasSnow && <div className="settled-snow-base" />}
            {flakesForTarget.map((flake) => {
              const style: CSSProperties = {
                left: `${flake.ratio * 100}%`,
                width: `${flake.size}px`,
                height: `${Math.max(10, flake.size * 0.7)}px`,
              };

              return <span key={flake.id} className="settled-snowflake" style={style} />;
            })}
          </div>,
          target.element
        );
      })}
    </>
  );
}
