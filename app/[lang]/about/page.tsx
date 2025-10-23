import { RevealSection } from "@/components/reveal-section";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata, getRouteSegment } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = getDictionary(lang);

  return createPageMetadata({
    locale: lang,
    title: dictionary.about.title,
    description: dictionary.about.subtitle,
    slug: getRouteSegment("about"),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = getDictionary(lang);
  const about = dictionary.about;

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
        <span className="text-xs uppercase tracking-[0.4em] text-white/50">{dictionary.nav.about}</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{about.title}</h1>
        <p className="max-w-3xl text-base text-white/75 md:text-lg">{about.subtitle}</p>
      </RevealSection>

      <RevealSection className="grid gap-8 md:grid-cols-3">
        {about.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/40 via-transparent to-white/5 p-6 text-white"
          >
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-4 text-sm text-white/80">{section.body}</p>
          </article>
        ))}
      </RevealSection>

      <RevealSection className="space-y-6 rounded-3xl border border-white/10 bg-black/50 p-8 text-white">
        <h2 className="text-2xl font-semibold">{about.team.title}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {about.team.members.map((member) => (
            <div key={member.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-white/70">{member.role}</p>
              <p className="mt-3 text-sm text-white/80">{member.focus}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/75">
        {about.closing}
      </RevealSection>
    </div>
  );
}
