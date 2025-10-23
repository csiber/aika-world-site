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
    title: `${dictionary.world.title} | AIKA: World`,
    description: dictionary.world.description,
  };
}

export default async function WorldPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = getDictionary(lang);
  const world = dictionary.world;

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
        <span className="text-xs uppercase tracking-[0.4em] text-white/50">AIKA: World</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{world.title}</h1>
        <p className="max-w-3xl text-base text-white/75 md:text-lg">{world.description}</p>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-white/10 bg-black/50 p-8 text-white">
        <p className="text-base text-white/80 md:text-lg">{world.highlight}</p>
      </RevealSection>

      <RevealSection className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {world.cards.map((card) => (
            <div
              key={card.name}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-black/60 p-6 text-white shadow-lg shadow-purple-500/10"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-110" aria-hidden />
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                <span>{card.tone}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{card.name}</h2>
              <p className="mt-3 text-sm text-white/80">{card.description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/75">
        {world.closing}
      </RevealSection>
    </div>
  );
}
