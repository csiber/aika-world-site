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
    <div className="space-y-16 py-12 text-slate-100 md:space-y-24 md:py-20">
      <section
        ref={heroRef}
        className="relative overflow-hidden rounded-[32px] border border-slate-800/80 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-900/40 p-10 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.6)]"
      >
        <HeroAurora containerRef={heroRef} />
        <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden />
        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-indigo-100">
                {content.hero.badgeLeft}
              </span>
              <span className="rounded-full border border-cyan-200/40 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                {content.hero.badgeRight}
              </span>
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-white md:text-6xl">
              {content.hero.title}
            </h1>
            <p className="max-w-2xl text-lg text-slate-200 md:text-xl">{content.hero.subtitle}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                ref={primaryCtaRef}
                href={`/${locale}/${content.hero.primaryCta.href === "home" ? "" : content.hero.primaryCta.href}`.replace(/\/$/, "")}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition-transform hover:-translate-y-0.5"
              >
                {content.hero.primaryCta.label}
              </Link>
              <Link
                ref={secondaryCtaRef}
                href={`/${locale}/${content.hero.secondaryCta.href === "home" ? "" : content.hero.secondaryCta.href}`.replace(/\/$/, "")}
                className="inline-flex items-center justify-center rounded-full border border-indigo-300/60 px-7 py-3 text-sm font-semibold text-indigo-100 transition-transform hover:-translate-y-0.5 hover:border-indigo-200 hover:text-white"
              >
                {content.hero.secondaryCta.label}
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {content.loops.items.map((loop) => (
                <div
                  key={loop.title}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-xs uppercase tracking-[0.25em] text-indigo-100"
                >
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden />
                    {loop.title}
                  </div>
                </div>
              ))}
            </div>
            <HeroSoundscape heroRef={heroRef} targets={[primaryCtaRef, secondaryCtaRef]} />
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-200">{content.hero.note}</p>
          </div>
          <figure className="relative mx-auto flex w-full max-w-lg flex-col gap-6 overflow-hidden rounded-3xl border border-indigo-500/40 bg-slate-950/60 p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-x-8 top-8 h-28 bg-gradient-to-b from-indigo-400/10 via-transparent to-transparent blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border border-indigo-400/40 bg-slate-900/60 p-4">
              <div aria-hidden className="absolute -inset-6 rounded-full border border-indigo-400/40 opacity-60 animate-spin-slow" />
              <div aria-hidden className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-400/20 via-blue-300/10 to-cyan-300/20 blur-2xl animate-pulse" />
              <div aria-hidden className="absolute inset-0 animate-spin-slower">
                <svg viewBox="0 0 400 400" className="h-full w-full">
                  <g stroke="rgba(130,160,255,0.25)" strokeWidth="1" fill="none">
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
                  className="relative h-auto w-full"
                />
              </div>
            </div>
            <div className="grid gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-indigo-200">
                <span>{content.pulse.feedBadge}</span>
                <span className="inline-flex items-center gap-2 text-cyan-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
                  Live signal
                </span>
              </div>
              <p className="text-sm text-slate-100">{content.pulse.intro}</p>
            </div>
          </figure>
        </div>
      </section>

      <RevealSection className="grid gap-8 rounded-[32px] border border-slate-800/80 bg-slate-950/60 p-10 text-sm leading-relaxed text-slate-200 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.7)]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-white">{content.what.title}</h2>
            <p className="text-base text-slate-200 md:text-lg">{content.what.description}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {content.what.pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/80 to-slate-900/40 p-4 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]"
                >
                  <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-2 text-sm text-slate-200">{pillar.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-indigo-500/40 bg-slate-900/70 p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-indigo-200">
              <span>{content.loops.title}</span>
              <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-[11px] text-cyan-100">
                {content.pulse.feedBadge}
              </span>
            </div>
            <p className="text-sm text-slate-200">{content.loops.intro}</p>
            <div className="space-y-3">
              {content.loops.items.map((loop) => (
                <article
                  key={loop.title}
                  className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-950/70 p-4"
                >
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" aria-hidden />
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-white">{loop.title}</h3>
                    <p className="text-sm text-slate-200">{loop.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="space-y-8 rounded-[32px] border border-slate-800/80 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/60 p-10 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.7)]">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-white">{content.factions.title}</h2>
          <p className="max-w-2xl text-base text-slate-200">{content.factions.intro}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {content.factions.items.map((faction) => (
            <article
              key={faction.name}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.8)] transition-transform hover:-translate-y-1"
            >
              <div className="absolute -right-14 top-0 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl transition duration-500 group-hover:scale-110" aria-hidden />
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-indigo-200">
                <span>{faction.tag}</span>
                <span className="rounded-full border border-indigo-300/40 bg-indigo-400/10 px-2 py-1 text-[10px] text-indigo-100">Signal</span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-white">{faction.name}</h3>
              <p className="mt-3 text-sm text-slate-200">{faction.text}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-8 rounded-[32px] border border-slate-800/80 bg-slate-950/60 p-10 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold text-white">{content.builders.title}</h2>
            <p className="text-base text-slate-200">{content.builders.intro}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100">
            Builder Deck
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {content.builders.items.map((feature) => (
            <div
              key={feature.title}
              className="flex h-full flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-[0_16px_50px_-30px_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-1"
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
                <span className="rounded-full border border-indigo-300/30 bg-indigo-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-indigo-100">
                  Core
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-slate-200">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="grid gap-8 rounded-[32px] border border-slate-800/80 bg-slate-950/60 p-10 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.7)] lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.pulse.title}</h2>
          <p className="max-w-2xl text-base text-slate-200">{content.pulse.intro}</p>
          <div className="rounded-2xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100">Live feed</div>
          <LivePulse {...content.pulse} />
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <div className="text-xs uppercase tracking-[0.35em] text-indigo-200">{content.roadmap.title}</div>
          <p className="text-sm text-slate-200">{content.roadmap.intro}</p>
          <div className="space-y-3">
            {content.roadmap.items.map((phase, index) => (
              <div
                key={phase.title}
                className="flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-indigo-300/50 bg-indigo-500/20 text-xs font-semibold text-indigo-100">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">{phase.title}</h3>
                  <p className="text-sm text-slate-200">{phase.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="rounded-[32px] border border-slate-800/80 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-900/50 p-10 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-semibold text-white">{content.signup.title}</h2>
            <p className="text-base text-slate-200">{content.signup.description}</p>
            <p className="text-xs text-indigo-200">{content.signup.legal}</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="relative flex w-full max-w-md flex-col gap-3 rounded-3xl border border-indigo-500/40 bg-slate-950/70 p-4 shadow-lg shadow-indigo-500/20"
          >
            <input
              required
              type="email"
              placeholder={content.signup.placeholder}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              name="email"
              autoComplete="email"
              disabled={isSubmitting || !isConfigured}
            />
            <label className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-indigo-500/10 px-4 py-3 text-left text-xs text-slate-200">
              <input
                required
                type="checkbox"
                name="consent"
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-500 bg-slate-950/60 text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={isSubmitting || !isConfigured}
              />
              <span className="leading-snug">{content.signup.consent}</span>
            </label>
            {turnstileSiteKey ? (
              <div className="rounded-2xl border border-slate-700 bg-indigo-500/10 px-4 py-2">
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
              <p className="rounded-2xl border border-dashed border-rose-400/70 bg-rose-900/30 px-4 py-2 text-xs text-rose-200">
                {content.signup.turnstileError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !isConfigured}
              className={cn(
                "rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5",
                (isSubmitting || !isConfigured) && "cursor-not-allowed from-indigo-300 to-cyan-300 text-white/80"
              )}
            >
              {isSubmitting ? content.signup.submitting : content.signup.button}
            </button>
            <p
              className={cn(
                "text-xs",
                !isConfigured
                  ? "text-rose-300"
                  : signupStatus === "success"
                    ? "text-emerald-300"
                    : signupStatus === "error"
                      ? "text-rose-300"
                      : "text-indigo-200"
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
