import { notFound } from "next/navigation";
import { RevealSection } from "@/components/reveal-section";
import { AnimatedPlanet } from "@/components/world/animated-planet";
import { getDictionary, isLocale } from "@/lib/i18n";
import { createPageMetadata, getRouteSegment } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dictionary = getDictionary(lang);

  return createPageMetadata({
    locale: lang,
    title: dictionary.world.title,
    description: dictionary.world.subtitle,
    slug: getRouteSegment("world"),
  });
}

export default async function WorldPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dictionary = getDictionary(lang);
  const world = dictionary.world;

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
        <span className="text-xs uppercase tracking-[0.4em] text-white/50">AIKA: World</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{world.title}</h1>
        <p className="max-w-3xl text-base text-white/75 md:text-lg">{world.subtitle}</p>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-white/10 bg-black/50 p-8 text-white">
        <p className="text-base text-white/80 md:text-lg">{world.disclaimer}</p>
      </RevealSection>

      <RevealSection>
        <AnimatedPlanet label={world.planet.label} description={world.planet.description} />
      </RevealSection>

      <RevealSection className="space-y-8">
        <div className="space-y-3 text-white">
          <h2 className="text-3xl font-semibold">{world.highlightsTitle}</h2>
          <p className="max-w-3xl text-base text-white/75">{world.highlightsIntro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {world.highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="group relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-white/5 via-transparent to-black/60 p-6 text-white shadow-lg shadow-cyan-500/10 transition-transform duration-500 hover:-translate-y-1"
            >
              <div
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl transition-transform duration-500 group-hover:scale-110"
                aria-hidden
              />
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                <span>{highlight.badge}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{highlight.name}</h2>
              <p className="mt-3 text-sm text-white/80">{highlight.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-8">
        <div className="space-y-3 text-white">
          <h2 className="text-3xl font-semibold">{world.strataTitle}</h2>
          <p className="max-w-3xl text-base text-white/75">{world.strataIntro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {world.strata.map((stratum) => (
            <div
              key={stratum.id}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 text-white shadow-inner shadow-sky-500/10"
            >
              <div
                className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-400/20 blur-3xl"
                aria-hidden
              />
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                <span>{stratum.badge}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{stratum.name}</h3>
              <p className="mt-3 text-sm text-white/80">{stratum.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-8">
        <div className="space-y-3 text-white">
          <h2 className="text-3xl font-semibold">{world.timelineTitle}</h2>
          <p className="max-w-3xl text-base text-white/75">{world.timelineIntro}</p>
        </div>
        <div className="space-y-4">
          {world.timeline.map((event) => (
            <div
              key={event.id}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-black/70 via-black/40 to-transparent p-6 text-white shadow-lg shadow-sky-500/5"
            >
              <div
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400 to-sky-500"
                aria-hidden
              />
              <div className="pl-4">
                <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">{event.cycle}</div>
                <p className="mt-3 text-sm text-white/80 md:text-base">{event.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/75">
        {world.footnote}
      </RevealSection>
    </div>
  );
}
