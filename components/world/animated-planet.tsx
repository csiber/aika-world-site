import type { CSSProperties } from "react";

export type AnimatedPlanetProps = {
  label: string;
  description: string;
};

const planetSurfaceTexture = encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'>
    <defs>
      <linearGradient id='ocean' x1='0%' x2='100%' y1='50%' y2='50%'>
        <stop offset='0%' stop-color='#06122d'/>
        <stop offset='50%' stop-color='#0a1a3c'/>
        <stop offset='100%' stop-color='#041029'/>
      </linearGradient>
    </defs>
    <rect width='800' height='400' fill='url(#ocean)'/>
    <g fill='#1fb6ff' opacity='0.7'>
      <path d='M60 150c40-35 110-30 150 0s20 110-60 120-150-50-120-90 30-25 30-30z'/>
      <path d='M290 120c35-25 80-20 110 10s25 70-20 95-110 10-120-35 20-45 30-70z'/>
      <path d='M530 160c60-45 140-40 180-10s20 90-40 115-170 5-170-55 40-45 30-50z'/>
    </g>
    <g fill='#22d3ee' opacity='0.55'>
      <path d='M200 240c45-25 100-15 130 20s-5 90-80 85-130-40-95-75 35-15 45-30z'/>
      <path d='M470 90c30-15 60-5 90 20s25 70-15 85-120-5-110-55 20-30 35-50z'/>
      <path d='M650 210c25-20 60-15 90 10s25 65-20 80-105 0-105-45 25-25 35-45z'/>
    </g>
    <g fill='#0ea5e9' opacity='0.4'>
      <path d='M120 70c25-15 55-10 80 10s15 60-20 70-95-10-85-45 25-15 25-35z'/>
      <path d='M360 260c20-10 55 0 85 25s20 65-25 75-110-20-95-60 15-20 35-40z'/>
      <path d='M600 40c35-20 70-15 95 10s20 60-30 75-110-15-95-55 30-20 30-30z'/>
    </g>
  </svg>
`);

const surfaceStyle: CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,${planetSurfaceTexture}")`,
  backgroundRepeat: "repeat-x",
  backgroundSize: "50% 100%",
};

export function AnimatedPlanet({ label, description }: AnimatedPlanetProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-950/80 via-slate-900/40 to-indigo-950/70 p-10 text-white shadow-xl shadow-sky-500/10">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <div className="relative mx-auto flex h-64 w-64 items-center justify-center md:h-80 md:w-80">
          <div
            aria-hidden
            className="planet-atmosphere absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/40 via-sky-500/20 to-transparent blur-3xl"
          />
          <div className="relative h-full w-full rounded-full bg-gradient-to-br from-sky-700 via-blue-900 to-slate-950 shadow-2xl shadow-cyan-500/30">
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                aria-hidden
                className="planet-surface absolute inset-y-0 left-0 h-full w-[200%]"
                style={surfaceStyle}
              />
            </div>
            <div
              aria-hidden
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_55%)]"
            />
            <div aria-hidden className="planet-clouds absolute inset-0 rounded-full" />
            <div aria-hidden className="absolute inset-0 rounded-full ring-1 ring-cyan-300/30" />
          </div>
          <div aria-hidden className="absolute -bottom-10 left-1/2 h-12 w-40 -translate-x-1/2 rounded-full bg-black/60 blur-2xl" />
        </div>
        <div className="space-y-4 text-center md:text-left">
          <span className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">{label}</span>
          <p className="text-sm text-white/70 md:text-base">{description}</p>
        </div>
      </div>
    </div>
  );
}
