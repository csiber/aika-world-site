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
    title: dictionary.about.title,
    description: dictionary.about.subtitle,
    slug: getRouteSegment("about"),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dictionary = getDictionary(lang);
  const about = dictionary.about;

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
        <span className="text-xs uppercase tracking-[0.4em] text-indigo-200">{dictionary.nav.about}</span>
        <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">{about.title}</h1>
        <p className="max-w-3xl text-base text-slate-200 md:text-lg">{about.subtitle}</p>
      </RevealSection>

      <RevealSection className="grid gap-8 md:grid-cols-3">
        {about.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#1a2641] via-[#111a33] to-[#0b1429] p-6 text-slate-100 shadow-[0_24px_70px_-60px_rgba(30,140,255,0.35)]"
          >
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <p className="mt-4 text-sm text-slate-200">{section.body}</p>
          </article>
        ))}
      </RevealSection>

      <RevealSection className="space-y-6 rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
        <h2 className="text-2xl font-semibold text-white">{about.team.title}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {about.team.members.map((member) => (
            <div key={member.name} className="rounded-2xl border border-slate-800/80 bg-indigo-500/10 p-6">
              <h3 className="text-lg font-semibold text-white">{member.name}</h3>
              <p className="text-sm text-slate-200">{member.role}</p>
              <p className="mt-3 text-sm text-slate-200">{member.focus}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 text-sm text-slate-200 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
        {about.closing}
      </RevealSection>
    </div>
  );
}
