"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, MutableRefObject, RefObject } from "react";
import { cn } from "@/lib/utils";

type HeroAuroraProps = {
  containerRef: RefObject<HTMLDivElement> | MutableRefObject<HTMLDivElement | null>;
};

type OrbDefinition = {
  id: string;
  size: number;
  parallax: number;
  top: string;
  left: string;
  opacity: number;
  gradientClass: string;
};

type SparkDefinition = {
  id: string;
  top: string;
  left: string;
  delay: number;
  scale: number;
};

const orbs: OrbDefinition[] = [
  { id: "alpha", size: 420, parallax: 14, top: "-12%", left: "-6%", opacity: 0.8, gradientClass: "from-purple-500/60 via-indigo-500/20 to-transparent" },
  { id: "beta", size: 360, parallax: 18, top: "58%", left: "62%", opacity: 0.65, gradientClass: "from-fuchsia-500/40 via-sky-500/20 to-transparent" },
  { id: "gamma", size: 260, parallax: 10, top: "24%", left: "68%", opacity: 0.7, gradientClass: "from-emerald-400/40 via-cyan-400/20 to-transparent" },
  { id: "delta", size: 240, parallax: 20, top: "70%", left: "-10%", opacity: 0.55, gradientClass: "from-indigo-500/30 via-purple-500/10 to-transparent" },
];

const sparks: SparkDefinition[] = [
  { id: "spark-1", top: "22%", left: "18%", delay: 0, scale: 1 },
  { id: "spark-2", top: "36%", left: "42%", delay: 1.2, scale: 1.4 },
  { id: "spark-3", top: "12%", left: "72%", delay: 0.6, scale: 1.1 },
  { id: "spark-4", top: "62%", left: "28%", delay: 1.8, scale: 0.9 },
  { id: "spark-5", top: "78%", left: "54%", delay: 0.9, scale: 1.2 },
  { id: "spark-6", top: "44%", left: "82%", delay: 1.4, scale: 0.95 },
];

export function HeroAurora({ containerRef }: HeroAuroraProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const host = containerRef.current;

    if (!wrapper || !host) {
      return;
    }

    const updateOrigin = () => {
      const rect = host.getBoundingClientRect();
      originRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    updateOrigin();

    const resizeObserver = new ResizeObserver(updateOrigin);
    resizeObserver.observe(host);
    window.addEventListener("resize", updateOrigin);

    const applyTransform = () => {
      rafRef.current = null;
      if (!wrapper) {
        return;
      }
      wrapper.style.setProperty("--aurora-x", `${pointerRef.current.x}px`);
      wrapper.style.setProperty("--aurora-y", `${pointerRef.current.y}px`);
    };

    const scheduleUpdate = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(applyTransform);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const { x, y } = originRef.current;
      pointerRef.current = { x: event.clientX - x, y: event.clientY - y };
      scheduleUpdate();
    };

    const handlePointerLeave = () => {
      pointerRef.current = { x: 0, y: 0 };
      scheduleUpdate();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOrigin);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [containerRef]);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ "--aurora-x": "0px", "--aurora-y": "0px" } as CSSProperties}
    >
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={cn(
            "absolute rounded-full blur-3xl transition-transform duration-300 ease-out",
            "bg-gradient-to-br",
            orb.gradientClass
          )}
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            opacity: orb.opacity,
            transform: `translate3d(calc(var(--aurora-x) / ${orb.parallax}), calc(var(--aurora-y) / ${orb.parallax}), 0)` as string,
          }}
        />
      ))}

      <div
        aria-hidden
        className="absolute inset-0 animate-aurora-rotate"
        style={{ transform: "translate3d(calc(var(--aurora-x) * 0.02), calc(var(--aurora-y) * 0.02), 0)" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(129,140,248,0.18),_transparent_55%),_radial-gradient(circle_at_70%_60%,_rgba(192,132,252,0.16),_transparent_60%)]" />
      </div>

      <div className="absolute inset-0">
        <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full animate-aurora-glow">
          <g
            style={{
              transform: "translate3d(calc(var(--aurora-x) * 0.04), calc(var(--aurora-y) * 0.04), 0)",
              transformOrigin: "center",
            }}
          >
            <circle cx="180" cy="120" r="48" fill="url(#aurora-ring)" opacity="0.4" />
            <circle cx="420" cy="320" r="36" fill="url(#aurora-ring)" opacity="0.35" />
            <path d="M100 480 Q 260 380 420 420 T 560 340" stroke="url(#aurora-line)" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M60 200 Q 200 120 340 180 T 540 160" stroke="url(#aurora-line)" strokeWidth="1.2" fill="none" opacity="0.5" />
          </g>
          <defs>
            <radialGradient id="aurora-ring" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(192,132,252,0.6)" />
              <stop offset="60%" stopColor="rgba(99,102,241,0.35)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0)" />
            </radialGradient>
            <linearGradient id="aurora-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(165,180,252,0.65)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.45)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute rounded-full bg-gradient-to-br from-white/80 via-white/40 to-transparent opacity-60"
          style={{
            width: 12 * spark.scale,
            height: 12 * spark.scale,
            top: spark.top,
            left: spark.left,
            animationDelay: `${spark.delay}s`,
            animation: "spark-glow 5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}
