import { notFound } from "next/navigation";

import { OrbitalDriftGame } from "@/components/mini-games/orbital-drift-game";
import { SupplyRouteGame } from "@/components/mini-games/supply-route-game";
import { RevealSection } from "@/components/reveal-section";
import { SyncPulseGame } from "@/components/world/sync-pulse-game";
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
    title: dictionary.miniGames.title,
    description: dictionary.miniGames.subtitle,
    slug: getRouteSegment("mini-games"),
  });
}

export default async function MiniGamesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dictionary = getDictionary(lang);
  const content = dictionary.miniGames;

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
        <span className="text-xs uppercase tracking-[0.4em] text-white/50">{content.badge}</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{content.title}</h1>
        <p className="max-w-3xl text-base text-white/75 md:text-lg">{content.subtitle}</p>
        <p className="max-w-3xl text-sm text-white/60 md:text-base">{content.description}</p>
      </RevealSection>

      <RevealSection className="space-y-6">
        <h2 className="text-2xl font-semibold text-white md:text-3xl">{content.insightsTitle}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {content.insights.map((insight) => (
            <div
              key={insight.title}
              className="space-y-3 rounded-3xl border border-white/10 bg-black/60 p-6 text-white shadow-lg shadow-purple-500/10"
            >
              <h3 className="text-lg font-semibold">{insight.title}</h3>
              <p className="text-sm text-white/70">{insight.text}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection>
        <SyncPulseGame dictionary={content.syncPulse} />
      </RevealSection>

      <RevealSection>
        <OrbitalDriftGame dictionary={content.orbitalDrift} />
      </RevealSection>

      <RevealSection>
        <SupplyRouteGame dictionary={content.dataLink} />
      </RevealSection>

      <RevealSection className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/70">
        {content.closing}
      </RevealSection>
    </div>
  );
}
