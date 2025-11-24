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
    <div className="space-y-24 py-12 text-slate-100 md:space-y-32 md:py-16">
      <section
        ref={heroRef}
        className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#1b2c4f] via-[#121d3a] to-[#0c162c] p-10 text-slate-100 shadow-[0_40px_120px_-60px_rgba(40,120,255,0.35)]"
      >
        <HeroAurora containerRef={heroRef} />
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" aria-hidden />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-50 shadow-sm backdrop-blur">
              <span>{content.hero.badgeLeft}</span>
              <span className="rounded-full bg-indigo-300/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-100">
                {content.hero.badgeRight}
              </span>
            </span>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-white md:text-6xl">
              {content.hero.title}
            </h1>
            <p className="max-w-2xl text-lg text-slate-200 md:text-xl">{content.hero.subtitle}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link
                ref={primaryCtaRef}
                href={`/${locale}/${content.hero.primaryCta.href === "home" ? "" : content.hero.primaryCta.href}`.replace(/\/$/, "")}
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-400/40 transition-transform hover:-translate-y-0.5 hover:shadow-indigo-500/60"
              >
                {content.hero.primaryCta.label}
              </Link>
              <Link
                ref={secondaryCtaRef}
                href={`/${locale}/${content.hero.secondaryCta.href === "home" ? "" : content.hero.secondaryCta.href}`.replace(/\/$/, "")}
                className="inline-flex items-center justify-center rounded-full border border-indigo-300/60 px-6 py-3 text-sm font-semibold text-indigo-100 transition-transform hover:-translate-y-0.5 hover:border-indigo-200 hover:text-white"
              >
                {content.hero.secondaryCta.label}
              </Link>
            </div>
            <HeroSoundscape
              heroRef={heroRef}
              targets={[primaryCtaRef, secondaryCtaRef]}
            />
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-200">{content.hero.note}</p>
          </div>
          <figure className="relative mx-auto max-w-sm overflow-hidden rounded-full border border-indigo-500/40 bg-slate-900/60 p-6 shadow-[0_30px_80px_-50px_rgba(30,160,255,0.35)] backdrop-blur">
            <div aria-hidden className="absolute -inset-3 rounded-full border border-indigo-400/40 opacity-60 animate-spin-slow" />
            <div
              aria-hidden
              className="absolute inset-6 rounded-full bg-gradient-to-br from-indigo-400/20 via-blue-300/10 to-cyan-300/20 blur-2xl animate-pulse"
            />
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
          </figure>
        </div>
      </section>

      <RevealSection className="grid gap-8 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-10 text-sm leading-relaxed text-slate-200 shadow-[0_30px_80px_-60px_rgba(30,140,255,0.3)] backdrop-blur">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.what.title}</h2>
          <p className="text-base text-slate-200 md:text-lg">{content.what.description}</p>
        </div>
        <ul className="grid gap-6 md:grid-cols-4">
          {content.what.pillars.map((pillar) => (
            <li
              key={pillar.title}
              className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#172642] via-[#131d35] to-[#0d152b] p-6 transition-transform hover:-translate-y-1 hover:shadow-[0_20px_60px_-40px_rgba(30,160,255,0.35)]"
            >
              <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm text-slate-200">{pillar.text}</p>
            </li>
          ))}
        </ul>
      </RevealSection>

      <RevealSection className="space-y-10 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-10 shadow-[0_30px_80px_-60px_rgba(30,140,255,0.3)] backdrop-blur">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.factions.title}</h2>
          <p className="max-w-2xl text-base text-slate-200">{content.factions.intro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {content.factions.items.map((faction) => (
            <article
              key={faction.name}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#192843] via-[#111b32] to-[#0c152b] p-6 transition-transform hover:-translate-y-1 hover:shadow-[0_24px_70px_-50px_rgba(30,170,255,0.35)]"
            >
              <div className="absolute -top-12 right-0 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl transition-transform duration-500 group-hover:scale-110" aria-hidden />
              <span className="text-xs uppercase tracking-[0.4em] text-indigo-200">{faction.tag}</span>
              <h3 className="mt-4 text-2xl font-semibold text-white">{faction.name}</h3>
              <p className="mt-3 text-sm text-slate-200">{faction.text}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-10 rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#1a2b4a] via-[#131f3b] to-[#0b1428] p-10 shadow-[0_30px_90px_-60px_rgba(40,160,255,0.35)] backdrop-blur">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.builders.title}</h2>
          <p className="max-w-2xl text-base text-slate-200">{content.builders.intro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {content.builders.items.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 transition-transform hover:-translate-y-1 shadow-[0_16px_50px_-30px_rgba(30,170,255,0.35)]"
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
              <p className="mt-3 text-sm text-slate-200">{feature.text}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-8 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-10 shadow-[0_30px_80px_-60px_rgba(30,140,255,0.3)] backdrop-blur">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-white">{content.pulse.title}</h2>
          <p className="max-w-2xl text-base text-slate-200">{content.pulse.intro}</p>
        </div>
        <LivePulse {...content.pulse} />
      </RevealSection>

      <RevealSection className="space-y-10 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-10 shadow-[0_30px_80px_-60px_rgba(30,140,255,0.3)] backdrop-blur">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.loops.title}</h2>
          <p className="max-w-2xl text-base text-slate-200">{content.loops.intro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {content.loops.items.map((loop) => (
            <article
              key={loop.title}
              className="flex h-full flex-col gap-4 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#182640] via-[#121b30] to-[#0c1328] p-6 transition-transform hover:-translate-y-1 hover:shadow-[0_24px_70px_-50px_rgba(30,160,255,0.35)]"
            >
              <div>
                <h3 className="text-xl font-semibold text-white">{loop.title}</h3>
                <p className="mt-2 text-sm text-slate-200">{loop.text}</p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-indigo-200">
                <span className="inline-flex h-2 w-2 rounded-full bg-cyan-300/80" aria-hidden />
                {content.pulse.feedBadge}
              </div>
            </article>
          ))}
        </div>
      </RevealSection>

      <RevealSection id="roadmap" className="space-y-10 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-10 shadow-[0_30px_80px_-60px_rgba(30,140,255,0.3)] backdrop-blur">
        <div>
          <h2 className="text-3xl font-semibold text-white">{content.roadmap.title}</h2>
          <p className="mt-3 max-w-2xl text-base text-slate-200">{content.roadmap.intro}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {content.roadmap.items.map((phase, index) => (
            <div
              key={phase.title}
              className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#1a2b4a] via-[#121f3c] to-[#0b152a] p-6 transition-transform hover:-translate-y-1 hover:shadow-[0_24px_70px_-50px_rgba(30,160,255,0.35)]"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-300/60 bg-indigo-500/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-indigo-100">
                <span className="inline-flex h-2 w-2 rounded-full bg-cyan-300" aria-hidden />
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-white">{phase.title}</h3>
              <p className="text-sm text-slate-200">{phase.text}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#1b2d4f] via-[#13203b] to-[#0c162b] p-10 shadow-[0_30px_90px_-60px_rgba(40,160,255,0.35)] backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-semibold text-white">{content.signup.title}</h2>
            <p className="text-base text-slate-200">{content.signup.description}</p>
            <p className="text-xs text-indigo-200">{content.signup.legal}</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="relative flex w-full max-w-md flex-col gap-3 rounded-2xl border border-indigo-500/50 bg-slate-900/60 p-4 shadow-lg shadow-indigo-500/20 backdrop-blur"
          >
            <input
              required
              type="email"
              placeholder={content.signup.placeholder}
              className="w-full rounded-full border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
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
                "rounded-full bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5",
                (isSubmitting || !isConfigured) && "cursor-not-allowed bg-indigo-300 text-white/80"
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
