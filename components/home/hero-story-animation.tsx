import { memo } from "react";
import { cn } from "@/lib/utils";

type HeroStoryAnimationProps = {
  className?: string;
};

export const HeroStoryAnimation = memo(function HeroStoryAnimation({ className }: HeroStoryAnimationProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-labelledby="hero-story-title hero-story-description"
      className={cn("absolute inset-0 h-full w-full", className)}
    >
      <title id="hero-story-title">Lebegő űrváros animáció</title>
      <desc id="hero-story-description">
        Egy végtelenített, lágyan mozgó jelenet, amelyben egy város lebeg egy planéta felett, csillagok és fénycsóvák keringenek körülötte.
      </desc>
      <defs>
        <linearGradient id="auroraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(149,114,252,0.25)" />
          <stop offset="50%" stopColor="rgba(99,102,241,0.35)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0.25)" />
        </linearGradient>
        <radialGradient id="planetGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(180,198,255,0.7)" />
          <stop offset="70%" stopColor="rgba(99,102,241,0.25)" />
          <stop offset="100%" stopColor="rgba(15,23,42,0)" />
        </radialGradient>
        <linearGradient id="cityLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <path id="orbitPath" d="M40 160c40-60 200-60 240 0s-200 60-240 0z" />
        <style>{`
          @keyframes aurora-shift {
            0% { transform: translateX(-6px) scale(1.02); opacity: 0.6; }
            50% { transform: translateX(6px) scale(1.05); opacity: 0.85; }
            100% { transform: translateX(-6px) scale(1.02); opacity: 0.6; }
          }
          @keyframes city-float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
            100% { transform: translateY(0px); }
          }
          @keyframes drone-orbit {
            0% { offset-distance: 0%; }
            100% { offset-distance: 100%; }
          }
          @keyframes comet-dash {
            0% { stroke-dashoffset: 220; opacity: 0; }
            10% { opacity: 0.9; }
            60% { opacity: 0.9; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          @keyframes pulse-star {
            0%, 100% { transform: scale(0.9); opacity: 0.5; }
            50% { transform: scale(1.15); opacity: 1; }
          }
          .aurora { animation: aurora-shift 12s ease-in-out infinite; }
          .city { animation: city-float 6s ease-in-out infinite; }
          .drone {
            offset-path: path('M40 160c40-60 200-60 240 0s-200 60-240 0z');
            animation: drone-orbit 18s linear infinite;
          }
          .comet { animation: comet-dash 6s ease-in-out infinite; }
          .star { animation: pulse-star 5s ease-in-out infinite; transform-origin: center; }
        `}</style>
      </defs>
      <rect width="320" height="320" fill="url(#auroraGradient)" opacity="0.45" className="aurora" />
      <g filter="url(#softGlow)">
        <ellipse cx="160" cy="210" rx="120" ry="70" fill="url(#planetGlow)" opacity="0.85" />
        <ellipse cx="160" cy="220" rx="90" ry="28" fill="rgba(15,23,42,0.7)" />
        <g className="city" transform="translate(80 110)">
          <rect x="0" y="40" width="40" height="70" fill="url(#cityLight)" rx="6" />
          <rect x="52" y="20" width="36" height="90" fill="url(#cityLight)" rx="6" opacity="0.9" />
          <rect x="98" y="32" width="32" height="78" fill="url(#cityLight)" rx="6" opacity="0.75" />
          <rect x="24" y="0" width="20" height="60" fill="#6366f1" opacity="0.8" rx="4" />
          <rect x="74" y="4" width="18" height="58" fill="#818cf8" opacity="0.7" rx="4" />
          <rect x="112" y="12" width="16" height="54" fill="#6366f1" opacity="0.6" rx="4" />
          <circle cx="70" cy="-8" r="12" fill="#facc15" opacity="0.85" />
          <path d="M18 48h92" stroke="#312e81" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
          <path d="M18 66h92" stroke="#312e81" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
          <path d="M18 84h92" stroke="#312e81" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
        </g>
      </g>
      <g stroke="rgba(148,163,184,0.6)" strokeWidth="2" fill="none" strokeDasharray="6 4">
        <path d="M40 210c40-40 200-40 240 0" opacity="0.3" />
        <use href="#orbitPath" opacity="0.45" />
      </g>
      <g className="comet" stroke="rgba(244,114,182,0.7)" strokeWidth="3" strokeLinecap="round" strokeDasharray="220">
        <path d="M80 120c60-40 160-20 190 30" />
      </g>
      <g className="drone" transform="translate(-12 -12)">
        <circle cx="0" cy="0" r="10" fill="#f8fafc" opacity="0.9" />
        <circle cx="0" cy="0" r="18" stroke="rgba(148,163,184,0.4)" strokeWidth="2" fill="none" />
        <path d="M-10 -2 L10 0 L-10 2 Z" fill="#6366f1" opacity="0.8" />
      </g>
      <g fill="#e0f2fe">
        <circle className="star" cx="40" cy="60" r="2.4" style={{ animationDelay: "0s" }} />
        <circle className="star" cx="280" cy="50" r="2.2" style={{ animationDelay: "1.4s" }} />
        <circle className="star" cx="250" cy="130" r="3" style={{ animationDelay: "2.1s" }} />
        <circle className="star" cx="70" cy="150" r="2" style={{ animationDelay: "3.3s" }} />
        <circle className="star" cx="220" cy="90" r="2.6" style={{ animationDelay: "4.2s" }} />
      </g>
    </svg>
  );
});
