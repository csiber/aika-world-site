"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setFlakes(createSnowflakes(density));
  }, [density]);

  if (flakes.length === 0) {
    return null;
  }

  return (
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
  );
}
