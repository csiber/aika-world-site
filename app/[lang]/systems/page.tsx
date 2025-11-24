import { notFound } from "next/navigation";
import { RevealSection } from "@/components/reveal-section";
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
    title: dictionary.systems.title,
    description: dictionary.systems.subtitle,
    slug: getRouteSegment("systems"),
  });
}

export default async function SystemsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dictionary = getDictionary(lang);
  const systems = dictionary.systems;

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
        <span className="text-xs uppercase tracking-[0.4em] text-indigo-200">{dictionary.nav.systems}</span>
        <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">{systems.title}</h1>
        <p className="max-w-3xl text-base text-slate-200 md:text-lg">{systems.subtitle}</p>
      </RevealSection>

      <RevealSection className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">{systems.modulesTitle}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {systems.modules.map((module) => (
            <div
              key={module.name}
              className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#1a2641] via-[#111a33] to-[#0b1429] p-6 text-slate-100 shadow-[0_24px_70px_-60px_rgba(30,140,255,0.35)]"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-indigo-200">{module.badge}</div>
              <h3 className="mt-3 text-xl font-semibold text-white">{module.name}</h3>
              <p className="mt-3 text-sm text-slate-200">{module.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-8 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
        <h2 className="text-2xl font-semibold text-white">{systems.pillarsTitle}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {systems.pillars.map((pillar) => (
            <div key={pillar.name} className="rounded-2xl border border-slate-800/80 bg-indigo-500/10 p-6">
              <h3 className="text-lg font-semibold text-white">{pillar.name}</h3>
              <p className="mt-4 text-sm text-slate-200">{pillar.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 text-sm text-slate-200 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
        {systems.footnote}
      </RevealSection>
    </div>
  );
}
