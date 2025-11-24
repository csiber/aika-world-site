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
      <RevealSection className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl shadow-indigo-100/50">
        <span className="text-xs uppercase tracking-[0.4em] text-slate-600">{dictionary.nav.about}</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{about.title}</h1>
        <p className="max-w-3xl text-base text-slate-700 md:text-lg">{about.subtitle}</p>
      </RevealSection>

      <RevealSection className="grid gap-8 md:grid-cols-3">
        {about.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 text-slate-900 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-4 text-sm text-slate-700">{section.body}</p>
          </article>
        ))}
      </RevealSection>

      <RevealSection className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl shadow-indigo-100/50">
        <h2 className="text-2xl font-semibold">{about.team.title}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {about.team.members.map((member) => (
            <div key={member.name} className="rounded-2xl border border-slate-200 bg-indigo-50/50 p-6">
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-slate-700">{member.role}</p>
              <p className="mt-3 text-sm text-slate-700">{member.focus}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-700 shadow-sm">
        {about.closing}
      </RevealSection>
    </div>
  );
}
