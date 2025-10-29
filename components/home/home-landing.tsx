"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { RevealSection } from "@/components/reveal-section";
import { TurnstileWidget } from "@/components/turnstile-widget";
import type { Dictionary, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { HeroAurora } from "./hero-aurora";
import { HeroSoundscape } from "./hero-soundscape";
import { HeroStoryAnimation } from "./hero-story-animation";
import { LivePulse } from "./live-pulse";

type HomeLandingProps = {
  locale: Locale;
  content: Dictionary["home"];
};

type FormStatus = "idle" | "submitting" | "success" | "error";

export function HomeLanding({ locale, content }: HomeLandingProps) {
  const [signupStatus, setSignupStatus] = useState<FormStatus>("idle");
  const [signupFeedback, setSignupFeedback] = useState<string | null>(null);
  const [signupToken, setSignupToken] = useState("");
  const [signupReset, setSignupReset] = useState(0);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const primaryCtaRef = useRef<HTMLAnchorElement | null>(null);
  const secondaryCtaRef = useRef<HTMLAnchorElement | null>(null);

  const signupEndpoint = process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const isConfigured = Boolean(signupEndpoint && turnstileSiteKey);
  const isSubmitting = signupStatus === "submitting";
  const configErrorMessage = !signupEndpoint
    ? content.signup.endpointError
    : !turnstileSiteKey
      ? content.signup.turnstileError
      : null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signupEndpoint) {
      setSignupStatus("error");
      setSignupFeedback(content.signup.endpointError);
      return;
    }

    if (!signupToken) {
      setSignupStatus("error");
      setSignupFeedback(content.signup.turnstileError);
      setSignupReset((value) => value + 1);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append("cf-turnstile-response", signupToken);

    setSignupStatus("submitting");
    setSignupFeedback(null);

    try {
      const response = await fetch(signupEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit signup form");
      }

      setSignupStatus("success");
      setSignupFeedback(content.signup.success);
      event.currentTarget.reset();
      setSignupToken("");
      setSignupReset((value) => value + 1);
    } catch (error) {
      console.error(error);
      setSignupStatus("error");
      setSignupFeedback(content.signup.error);
      setSignupReset((value) => value + 1);
    }
  };

  return (
    <div className="space-y-24 py-12 md:space-y-32 md:py-16">
      <section
        ref={heroRef}
        className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/70 via-slate-950/80 to-[#020b1f] p-10 text-white shadow-[0_50px_160px_-80px_rgba(56,189,248,0.6)] supports-[backdrop-filter]:backdrop-blur-2xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(148,197,255,0.2),_transparent_55%),_radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.14),_transparent_60%)]"
        />
        <HeroAurora containerRef={heroRef} />
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute inset-x-[-20%] bottom-0 h-48 bg-[radial-gradient(ellipse_at_bottom,_rgba(148,197,255,0.22),_transparent_70%)]" aria-hidden />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/80 shadow-[0_10px_30px_-20px_rgba(148,197,255,0.6)]">
              <span>{content.hero.badgeLeft}</span>
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-900/80">
                {content.hero.badgeRight}
              </span>
            </span>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-6xl">
              {content.hero.title}
            </h1>
            <p className="max-w-2xl text-lg text-white/80 md:text-xl">{content.hero.subtitle}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link
                ref={primaryCtaRef}
                href={`/${locale}/${content.hero.primaryCta.href === "home" ? "" : content.hero.primaryCta.href}`.replace(/\/$/, "")}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-100 via-white to-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 transition-transform hover:-translate-y-0.5 hover:shadow-cyan-400/40"
              >
                {content.hero.primaryCta.label}
              </Link>
              <Link
                ref={secondaryCtaRef}
                href={`/${locale}/${content.hero.secondaryCta.href === "home" ? "" : content.hero.secondaryCta.href}`.replace(/\/$/, "")}
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/20"
              >
                {content.hero.secondaryCta.label}
              </Link>
            </div>
            <HeroSoundscape
              heroRef={heroRef}
              targets={[primaryCtaRef, secondaryCtaRef]}
            />
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">{content.hero.note}</p>
          </div>
          <figure className="relative mx-auto max-w-sm overflow-hidden rounded-full border border-white/30 bg-slate-950/60 p-6 shadow-[0_30px_90px_-60px_rgba(56,189,248,0.55)] supports-[backdrop-filter]:backdrop-blur-xl">
            <div aria-hidden className="absolute -inset-3 rounded-full border border-white/10 opacity-70 animate-spin-slow" />
            <div
              aria-hidden
              className="absolute inset-6 rounded-full bg-gradient-to-br from-cyan-300/25 via-sky-500/10 to-indigo-400/10 blur-2xl animate-pulse"
            />
            <div aria-hidden className="absolute inset-0 animate-spin-slower">
              <svg viewBox="0 0 400 400" className="h-full w-full">
                <g stroke="rgba(191,219,254,0.25)" strokeWidth="1" fill="none">
                  <circle cx="200" cy="200" r="120" />
                  <circle cx="200" cy="200" r="170" />
                  <path d="M40 200 Q 200 40 360 200" />
                  <path d="M40 200 Q 200 360 360 200" />
                  <path d="M200 40 Q 120 200 200 360" />
                  <path d="M200 40 Q 280 200 200 360" />
                </g>
              </svg>
            </div>
            <div className="relative h-auto w-full">
              <HeroStoryAnimation className="pointer-events-none" />
              <Image
                src="/images/hero/aika-hero-orb.svg"
                alt={content.hero.imageAlt}
                width={600}
                height={600}
                priority
                sizes="(min-width: 1280px) 380px, (min-width: 768px) 320px, 240px"
                className="relative h-auto w-full drop-shadow-[0_30px_60px_rgba(56,189,248,0.35)]"
              />
            </div>
          </figure>
        </div>
      </section>

      <RevealSection className="glass-card grid gap-8 rounded-3xl p-10 text-sm leading-relaxed text-white/90 shadow-[0_30px_120px_-90px_rgba(148,197,255,0.45)]">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.what.title}</h2>
          <p className="text-base text-white/80 md:text-lg">{content.what.description}</p>
        </div>
        <ul className="grid gap-6 md:grid-cols-4">
          {content.what.pillars.map((pillar) => (
            <li
              key={pillar.title}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/20 via-white/5 to-transparent p-6 shadow-[0_20px_60px_-45px_rgba(148,197,255,0.45)] transition-transform hover:-translate-y-1 supports-[backdrop-filter]:backdrop-blur-lg"
            >
              <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm text-white/80">{pillar.text}</p>
            </li>
          ))}
        </ul>
      </RevealSection>

      <RevealSection className="glass-card space-y-10 rounded-3xl p-10 shadow-[0_30px_120px_-100px_rgba(125,211,252,0.45)]">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.factions.title}</h2>
          <p className="max-w-2xl text-base text-white/75">{content.factions.intro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {content.factions.items.map((faction) => (
            <article
              key={faction.name}
              className="group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/70 via-slate-950/60 to-sky-900/40 p-6 shadow-[0_25px_80px_-60px_rgba(56,189,248,0.55)] transition-transform hover:-translate-y-1 supports-[backdrop-filter]:backdrop-blur-lg"
            >
              <div className="absolute -top-12 right-0 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl transition-transform duration-500 group-hover:scale-110" aria-hidden />
              <span className="text-xs uppercase tracking-[0.4em] text-white/50">{faction.tag}</span>
              <h3 className="mt-4 text-2xl font-semibold text-white">{faction.name}</h3>
              <p className="mt-3 text-sm text-white/75">{faction.text}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="glass-card space-y-10 rounded-3xl p-10 shadow-[0_30px_120px_-100px_rgba(59,130,246,0.5)]">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.builders.title}</h2>
          <p className="max-w-2xl text-base text-white/80">{content.builders.intro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {content.builders.items.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-[0_20px_70px_-50px_rgba(148,197,255,0.5)] transition-transform hover:-translate-y-1 supports-[backdrop-filter]:backdrop-blur-lg"
            >
              <div className="flex items-center justify-between">
                <Image
                  src={`/images/features/${feature.icon}.svg`}
                  alt={feature.title}
                  width={144}
                  height={144}
                  loading="lazy"
                  sizes="(min-width: 1280px) 140px, (min-width: 768px) 120px, 96px"
                  className="h-16 w-16 shrink-0 md:h-20 md:w-20"
                />
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-white/75">{feature.text}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="glass-card space-y-8 rounded-3xl p-10 shadow-[0_30px_120px_-100px_rgba(125,211,252,0.45)]">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-white">{content.pulse.title}</h2>
          <p className="max-w-2xl text-base text-white/80">{content.pulse.intro}</p>
        </div>
        <LivePulse {...content.pulse} />
      </RevealSection>

      <RevealSection className="glass-card space-y-10 rounded-3xl p-10 shadow-[0_30px_120px_-100px_rgba(148,197,255,0.45)]">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.loops.title}</h2>
          <p className="max-w-2xl text-base text-white/80">{content.loops.intro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {content.loops.items.map((loop) => (
            <article
              key={loop.title}
              className="flex h-full flex-col gap-4 rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/70 via-transparent to-white/10 p-6 shadow-[0_20px_70px_-50px_rgba(59,130,246,0.45)] transition-transform hover:-translate-y-1 supports-[backdrop-filter]:backdrop-blur-lg"
            >
              <div>
                <h3 className="text-xl font-semibold text-white">{loop.title}</h3>
                <p className="mt-2 text-sm text-white/75">{loop.text}</p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
                <span className="inline-flex h-2 w-2 rounded-full bg-white/40" aria-hidden />
                {content.pulse.feedBadge}
              </div>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection id="roadmap" className="glass-card space-y-10 rounded-3xl p-10 shadow-[0_30px_120px_-100px_rgba(125,211,252,0.45)]">
        <div>
          <h2 className="text-3xl font-semibold text-white">{content.roadmap.title}</h2>
          <p className="mt-3 max-w-2xl text-base text-white/75">{content.roadmap.intro}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {content.roadmap.items.map((phase, index) => (
            <div
              key={phase.title}
              className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/70 via-slate-950/60 to-sky-900/40 p-6 shadow-[0_20px_70px_-50px_rgba(56,189,248,0.5)] transition-transform hover:-translate-y-1 supports-[backdrop-filter]:backdrop-blur-lg"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-300/80" aria-hidden />
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-white">{phase.title}</h3>
              <p className="text-sm text-white/75">{phase.text}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/70 via-sky-900/50 to-slate-950/80 p-10 shadow-[0_40px_140px_-80px_rgba(56,189,248,0.6)] supports-[backdrop-filter]:backdrop-blur-2xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-semibold text-white">{content.signup.title}</h2>
            <p className="text-base text-white/80">{content.signup.description}</p>
            <p className="text-xs text-white/60">{content.signup.legal}</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="relative flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/20 bg-white/20 p-4 shadow-lg shadow-cyan-500/20 supports-[backdrop-filter]:backdrop-blur-lg"
          >
            <input
              required
              type="email"
              placeholder={content.signup.placeholder}
              className="w-full rounded-full border border-white/30 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
              name="email"
              autoComplete="email"
              disabled={isSubmitting || !isConfigured}
            />
            <label className="flex items-start gap-3 rounded-2xl border border-white/20 bg-slate-950/60 px-4 py-3 text-left text-xs text-white/80 supports-[backdrop-filter]:backdrop-blur-lg">
              <input
                required
                type="checkbox"
                name="consent"
                className="mt-1 h-4 w-4 shrink-0 rounded border-white/40 bg-slate-950/70 text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                disabled={isSubmitting || !isConfigured}
              />
              <span className="leading-snug">{content.signup.consent}</span>
            </label>
            {turnstileSiteKey ? (
              <div className="rounded-2xl border border-white/20 bg-slate-950/60 px-4 py-2 supports-[backdrop-filter]:backdrop-blur-lg">
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  onSuccess={(token) => {
                    setSignupToken(token);
                    if (signupStatus === "error") {
                      setSignupStatus("idle");
                      setSignupFeedback(null);
                    }
                  }}
                  onError={() => {
                    setSignupToken("");
                    setSignupStatus("error");
                    setSignupFeedback(content.signup.turnstileError);
                  }}
                  onExpire={() => {
                    setSignupToken("");
                  }}
                  resetSignal={signupReset}
                  className="mx-auto"
                />
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-rose-400/60 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
                {content.signup.turnstileError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !isConfigured}
              className={cn(
                "rounded-full bg-gradient-to-r from-sky-200 via-white to-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition-transform hover:-translate-y-0.5",
                (isSubmitting || !isConfigured) && "cursor-not-allowed bg-white/60 text-slate-800/80"
              )}
            >
              {isSubmitting ? content.signup.submitting : content.signup.button}
            </button>
            <p
              className={cn(
                "text-xs",
                !isConfigured
                  ? "text-rose-200"
                  : signupStatus === "success"
                    ? "text-emerald-300"
                    : signupStatus === "error"
                      ? "text-rose-200"
                      : "text-white/60"
              )}
              aria-live="polite"
            >
              {!isConfigured
                ? configErrorMessage ?? content.signup.helperText
                : signupStatus === "success"
                  ? signupFeedback ?? content.signup.success
                  : signupStatus === "error"
                    ? signupFeedback ?? content.signup.error
                    : content.signup.helperText}
            </p>
          </form>
        </div>
      </RevealSection>
    </div>
  );
}
