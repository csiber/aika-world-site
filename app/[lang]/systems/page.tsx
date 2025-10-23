import type { Metadata } from "next";
import { RevealSection } from "@/components/reveal-section";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = getDictionary(lang);

  return {
    title: `${dictionary.systems.title} | AIKA: World`,
    description: dictionary.systems.description,
  };
}

export default async function SystemsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = getDictionary(lang);
  const systems = dictionary.systems;

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
        <span className="text-xs uppercase tracking-[0.4em] text-white/50">{dictionary.nav.systems}</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{systems.title}</h1>
        <p className="max-w-3xl text-base text-white/75 md:text-lg">{systems.description}</p>
      </RevealSection>

      <RevealSection className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">{systems.modulesTitle}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {systems.modules.map((module) => (
            <div
              key={module.name}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/50 via-transparent to-white/10 p-6 text-white"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">{module.category}</div>
              <h3 className="mt-3 text-xl font-semibold">{module.name}</h3>
              <p className="mt-3 text-sm text-white/80">{module.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="space-y-8 rounded-3xl border border-white/10 bg-black/50 p-8 text-white">
        <h2 className="text-2xl font-semibold">{systems.pillarsTitle}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {systems.pillars.map((pillar) => (
            <div key={pillar.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">{pillar.name}</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/75">
                {pillar.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-white/60" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/75">
        {systems.closing}
      </RevealSection>
    </div>
  );
}
