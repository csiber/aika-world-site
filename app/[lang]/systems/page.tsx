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
      <RevealSection className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl shadow-indigo-100/50">
        <span className="text-xs uppercase tracking-[0.4em] text-slate-600">{dictionary.nav.systems}</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{systems.title}</h1>
        <p className="max-w-3xl text-base text-slate-700 md:text-lg">{systems.subtitle}</p>
      </RevealSection>

      <RevealSection className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">{systems.modulesTitle}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {systems.modules.map((module) => (
            <div
              key={module.name}
              className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 text-slate-900 shadow-sm"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-slate-600">{module.badge}</div>
              <h3 className="mt-3 text-xl font-semibold">{module.name}</h3>
              <p className="mt-3 text-sm text-slate-700">{module.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-8 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl shadow-indigo-100/50">
        <h2 className="text-2xl font-semibold">{systems.pillarsTitle}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {systems.pillars.map((pillar) => (
            <div key={pillar.name} className="rounded-2xl border border-slate-200 bg-indigo-50/50 p-6">
              <h3 className="text-lg font-semibold">{pillar.name}</h3>
              <p className="mt-4 text-sm text-slate-700">{pillar.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-700 shadow-sm">
        {systems.footnote}
      </RevealSection>
    </div>
  );
}
