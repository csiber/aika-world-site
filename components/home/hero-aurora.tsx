"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
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
  {
    id: "alpha",
    size: 420,
    parallax: 14,
    top: "-12%",
    left: "-6%",
    opacity: 0.8,
    gradientClass: "from-purple-500/60 via-indigo-500/20 to-transparent",
  },
  {
    id: "beta",
    size: 360,
    parallax: 18,
    top: "58%",
    left: "62%",
    opacity: 0.65,
    gradientClass: "from-fuchsia-500/40 via-sky-500/20 to-transparent",
  },
  {
    id: "gamma",
    size: 260,
    parallax: 10,
    top: "24%",
    left: "68%",
    opacity: 0.7,
    gradientClass: "from-emerald-400/40 via-cyan-400/20 to-transparent",
  },
  {
    id: "delta",
    size: 240,
    parallax: 20,
    top: "70%",
    left: "-10%",
    opacity: 0.55,
    gradientClass: "from-indigo-500/30 via-purple-500/10 to-transparent",
  },
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
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const smoothX = useSpring(pointerX, {
    stiffness: 90,
    damping: 18,
    mass: 0.6,
  });

  const smoothY = useSpring(pointerY, {
    stiffness: 90,
    damping: 18,
    mass: 0.6,
  });

  const originRef = useRef({ x: 0, y: 0 });

  const groupTranslateX = useTransform(smoothX, (value) => value * 0.04);
  const groupTranslateY = useTransform(smoothY, (value) => value * 0.04);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || prefersReducedMotion) {
      return;
    }

    const updateOrigin = () => {
      const rect = element.getBoundingClientRect();
      originRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    updateOrigin();

    const resizeObserver = new ResizeObserver(updateOrigin);
    resizeObserver.observe(element);
    window.addEventListener("resize", updateOrigin);

    const handlePointerMove = (event: PointerEvent) => {
      const { x, y } = originRef.current;
      pointerX.set(event.clientX - x);
      pointerY.set(event.clientY - y);
    };

    const handlePointerLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOrigin);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [containerRef, pointerX, pointerY, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs.map((orb) => (
        <AuroraOrb
          key={orb.id}
          definition={orb}
          smoothX={smoothX}
          smoothY={smoothY}
        />
      ))}

      <motion.div
        aria-hidden
        className="absolute inset-0"
        animate={{ rotate: [0, 3, 0], scale: [1, 1.01, 1] }}
        transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(129, 140, 248, 0.18), transparent 55%), radial-gradient(circle at 70% 60%, rgba(192, 132, 252, 0.16), transparent 60%)",
        }}
      />

      <motion.svg
        aria-hidden
        className="absolute inset-0"
        viewBox="0 0 600 600"
        preserveAspectRatio="xMidYMid slice"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.g style={{ translateX: groupTranslateX, translateY: groupTranslateY }}>
          <circle cx="180" cy="120" r="48" fill="url(#aurora-ring)" opacity="0.4" />
          <circle cx="420" cy="320" r="36" fill="url(#aurora-ring)" opacity="0.35" />
          <path
            d="M100 480 Q 260 380 420 420 T 560 340"
            stroke="url(#aurora-line)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M60 200 Q 200 120 340 180 T 540 160"
            stroke="url(#aurora-line)"
            strokeWidth="1.2"
            fill="none"
            opacity="0.5"
          />
        </motion.g>
        <defs>
          <radialGradient id="aurora-ring" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(192,132,252,0.6)" />
            <stop offset="60%" stopColor="rgba(99,102,241,0.35)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </radialGradient>
          <linearGradient id="aurora-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(129,140,248,0)" />
            <stop offset="50%" stopColor="rgba(192,132,252,0.7)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </linearGradient>
        </defs>
      </motion.svg>

      {sparks.map((spark) => (
        <motion.span
          key={spark.id}
          aria-hidden
          className="absolute h-1 w-1 rounded-full bg-white"
          style={{ top: spark.top, left: spark.left, scale: spark.scale }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{ duration: 3 + spark.delay, repeat: Infinity, ease: "easeInOut", delay: spark.delay }}
        />
      ))}
    </div>
  );
}

type AuroraOrbProps = {
  definition: OrbDefinition;
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
};

function AuroraOrb({ definition, smoothX, smoothY }: AuroraOrbProps) {
  const { gradientClass, id, left, opacity, parallax, size, top } = definition;

  const translateX = useTransform(smoothX, (value) => value / parallax);
  const translateY = useTransform(smoothY, (value) => value / parallax);

  return (
    <motion.span
      key={id}
      aria-hidden
      className={cn(
        "absolute rounded-full blur-3xl",
        "bg-gradient-to-br",
        gradientClass,
      )}
      style={{
        width: size,
        height: size,
        top,
        left,
        opacity,
        translateX,
        translateY,
      }}
      animate={{ scale: [1, 1.08, 0.98, 1], rotate: [0, 4, -2, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

