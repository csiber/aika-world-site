import { notFound } from "next/navigation";
import { RevealSection } from "@/components/reveal-section";
import { CrashSiteExplorer } from "@/components/world/crash-site-explorer";
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
        <CrashSiteExplorer dictionary={world.miniGame} />
      </RevealSection>

      <RevealSection className="space-y-8">
        <div className="space-y-3 text-white">
          <h2 className="text-3xl font-semibold">{world.regionsTitle}</h2>
          <p className="max-w-3xl text-base text-white/75">{world.regionsIntro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {world.regions.map((region) => (
            <div
              key={region.id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-black/60 p-6 text-white shadow-lg shadow-purple-500/10"
            >
              <div
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-110"
                aria-hidden
              />
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                <span>{region.badge}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{region.name}</h2>
              <p className="mt-3 text-sm text-white/80">{region.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-8">
        <div className="space-y-3 text-white">
          <h2 className="text-3xl font-semibold">{world.explorationsTitle}</h2>
          <p className="max-w-3xl text-base text-white/75">{world.explorationsIntro}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {world.explorations.map((exploration) => (
            <div
              key={exploration.id}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6 text-white shadow-inner shadow-purple-500/10"
            >
              <div
                className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-110"
                aria-hidden
              />
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">{exploration.id}</span>
              <p className="mt-4 text-sm text-white/80">{exploration.caption}</p>
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
