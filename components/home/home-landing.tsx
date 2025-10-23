"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RevealSection } from "@/components/reveal-section";
import { TurnstileWidget } from "@/components/turnstile-widget";
import type { Dictionary, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type HomeLandingProps = {
  locale: Locale;
  content: Dictionary["home"];
};

const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.12,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: 0.08 * index,
      ease: [0.2, 0.6, 0.2, 1] as const,
    },
  }),
};

type FormStatus = "idle" | "submitting" | "success" | "error";

export function HomeLanding({ locale, content }: HomeLandingProps) {
  const [newsletterStatus, setNewsletterStatus] = useState<FormStatus>("idle");
  const [newsletterFeedback, setNewsletterFeedback] = useState<string | null>(null);
  const [newsletterToken, setNewsletterToken] = useState("");
  const [newsletterReset, setNewsletterReset] = useState(0);

  const newsletterEndpoint = process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const isConfigured = Boolean(newsletterEndpoint && turnstileSiteKey);
  const isSubmitting = newsletterStatus === "submitting";
  const configErrorMessage = !newsletterEndpoint
    ? content.newsletter.endpointError
    : !turnstileSiteKey
      ? content.newsletter.turnstileError
      : null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newsletterEndpoint) {
      setNewsletterStatus("error");
      setNewsletterFeedback(content.newsletter.endpointError);
      return;
    }

    if (!newsletterToken) {
      setNewsletterStatus("error");
      setNewsletterFeedback(content.newsletter.turnstileError);
      setNewsletterReset((value) => value + 1);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append("cf-turnstile-response", newsletterToken);

    setNewsletterStatus("submitting");
    setNewsletterFeedback(null);

    try {
      const response = await fetch(newsletterEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit newsletter form");
      }

      setNewsletterStatus("success");
      setNewsletterFeedback(content.newsletter.success);
      event.currentTarget.reset();
      setNewsletterToken("");
      setNewsletterReset((value) => value + 1);
    } catch (error) {
      console.error(error);
      setNewsletterStatus("error");
      setNewsletterFeedback(content.newsletter.error);
      setNewsletterReset((value) => value + 1);
    }
  };

  return (
    <div className="space-y-24 py-12 md:space-y-32 md:py-16">
      <motion.section
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-700/30 via-indigo-900/40 to-gray-950 p-10 text-white shadow-[0_40px_120px_-60px_rgba(123,83,255,0.65)]"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-purple-500/40 blur-3xl" aria-hidden />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)] lg:items-center">
          <div>
            <motion.span variants={heroItem} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em]">
              {content.hero.eyebrow}
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]">
                {content.hero.badge}
              </span>
            </motion.span>
            <motion.h1
              variants={heroItem}
              className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-6xl"
            >
              {content.hero.title}
            </motion.h1>
            <motion.p
              variants={heroItem}
              className="mt-6 max-w-2xl text-lg text-white/80 md:text-xl"
            >
              {content.hero.description}
            </motion.p>
            <motion.div
              variants={heroItem}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href={`/${locale}/${content.hero.primaryCta.href === "home" ? "" : content.hero.primaryCta.href}`.replace(/\/$/, "")}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-950 shadow-lg shadow-indigo-500/30 transition-transform hover:-translate-y-0.5 hover:shadow-indigo-500/50"
              >
                {content.hero.primaryCta.label}
              </Link>
              <Link
                href={`/${locale}/${content.hero.secondaryCta.href === "home" ? "" : content.hero.secondaryCta.href}`.replace(/\/$/, "")}
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:border-white/60"
              >
                {content.hero.secondaryCta.label}
              </Link>
            </motion.div>
          </div>
          <motion.figure
            variants={heroItem}
            className="relative mx-auto max-w-sm overflow-hidden rounded-full border border-white/20 bg-black/50 p-6 shadow-[0_20px_60px_-40px_rgba(123,83,255,0.6)]"
          >
            <Image
              src="/images/hero/aika-hero-orb.svg"
              alt={content.hero.imageAlt}
              width={600}
              height={600}
              priority
              sizes="(min-width: 1280px) 380px, (min-width: 768px) 320px, 240px"
              className="h-auto w-full"
            />
          </motion.figure>
        </div>
      </motion.section>

      <RevealSection className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-10 text-sm leading-relaxed text-white/90">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-white">{content.whatIs.title}</h2>
          <p className="text-base text-white/80 md:text-lg">{content.whatIs.subtitle}</p>
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {content.whatIs.bullets.map((bullet, index) => (
            <motion.li
              key={bullet.title}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={cardVariants}
              className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/10 to-white/5 p-6"
            >
              <h3 className="text-lg font-semibold text-white">{bullet.title}</h3>
              <p className="mt-3 text-sm text-white/80">{bullet.description}</p>
            </motion.li>
          ))}
        </ul>
      </RevealSection>

      <RevealSection className="space-y-10 rounded-3xl border border-white/10 bg-white/[0.04] p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">{content.pillars.title}</h2>
            <p className="mt-3 max-w-2xl text-base text-white/75">{content.pillars.description}</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {content.pillars.items.map((pillar, index) => (
            <motion.article
              key={pillar.name}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur"
            >
              <div className="absolute -top-12 right-0 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl transition-transform group-hover:scale-110" aria-hidden />
              <span className="text-xs uppercase tracking-[0.4em] text-white/50">{pillar.tagline}</span>
              <h3 className="mt-4 text-2xl font-semibold text-white">{pillar.name}</h3>
              <p className="mt-3 text-sm text-white/75">{pillar.description}</p>
            </motion.article>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-10 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-black/70 p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">{content.features.title}</h2>
            <p className="mt-3 max-w-2xl text-base text-white/80">{content.features.description}</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {content.features.items.map((feature, index) => (
            <motion.div
              key={feature.name}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={cardVariants}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center justify-between">
                <Image
                  src={`/images/features/${feature.icon}.svg`}
                  alt={feature.name}
                  width={144}
                  height={144}
                  loading="lazy"
                  sizes="(min-width: 1280px) 140px, (min-width: 768px) 120px, 96px"
                  className="h-16 w-16 shrink-0 md:h-20 md:w-20"
                />
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
              <p className="mt-3 text-sm text-white/75">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      <RevealSection id="roadmap" className="space-y-10 rounded-3xl border border-white/10 bg-white/[0.05] p-10">
        <div>
          <h2 className="text-3xl font-semibold text-white">{content.roadmap.title}</h2>
          <p className="mt-3 max-w-2xl text-base text-white/75">{content.roadmap.description}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {content.roadmap.phases.map((phase, index) => (
            <motion.div
              key={phase.title}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={cardVariants}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-6"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
                <span>{phase.status}</span>
                <span>{phase.timeframe}</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{phase.title}</h3>
              <p className="text-sm text-white/75">{phase.description}</p>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/50 via-indigo-900/40 to-black/80 p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-semibold text-white">{content.newsletter.title}</h2>
            <p className="text-base text-white/80">{content.newsletter.description}</p>
            <p className="text-xs text-white/60">{content.newsletter.disclaimer}</p>
          </div>
          <motion.form
            onSubmit={handleSubmit}
            className="relative flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg shadow-purple-500/20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            custom={0}
          >
            <input
              required
              type="email"
              placeholder={content.newsletter.placeholder}
              className="w-full rounded-full border border-white/30 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none"
              name="email"
              autoComplete="email"
              disabled={isSubmitting || !isConfigured}
            />
            {turnstileSiteKey ? (
              <div className="rounded-2xl border border-white/20 bg-black/40 px-4 py-2">
                <TurnstileWidget
                  siteKey={turnstileSiteKey}
                  onSuccess={(token) => {
                    setNewsletterToken(token);
                    if (newsletterStatus === "error") {
                      setNewsletterStatus("idle");
                      setNewsletterFeedback(null);
                    }
                  }}
                  onError={() => {
                    setNewsletterToken("");
                    setNewsletterStatus("error");
                    setNewsletterFeedback(content.newsletter.turnstileError);
                  }}
                  onExpire={() => {
                    setNewsletterToken("");
                  }}
                  resetSignal={newsletterReset}
                  className="mx-auto"
                />
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-rose-400/60 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
                {content.newsletter.turnstileError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !isConfigured}
              className={cn(
                "rounded-full bg-white px-4 py-3 text-sm font-semibold text-indigo-950 transition-transform hover:-translate-y-0.5",
                (isSubmitting || !isConfigured) && "cursor-not-allowed bg-white/60 text-indigo-900/80"
              )}
            >
              {isSubmitting ? content.newsletter.submitting : content.newsletter.button}
            </button>
            <p
              className={cn(
                "text-xs",
                !isConfigured
                  ? "text-rose-200"
                  : newsletterStatus === "success"
                    ? "text-emerald-300"
                    : newsletterStatus === "error"
                      ? "text-rose-200"
                      : "text-white/60"
              )}
              aria-live="polite"
            >
              {!isConfigured
                ? configErrorMessage ?? content.newsletter.helperText
                : newsletterStatus === "success"
                  ? newsletterFeedback ?? content.newsletter.success
                  : newsletterStatus === "error"
                    ? newsletterFeedback ?? content.newsletter.error
                    : content.newsletter.helperText}
            </p>
          </motion.form>
        </div>
      </RevealSection>
    </div>
  );
}
