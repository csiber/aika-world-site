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
    title: dictionary.devlog.title,
    description: dictionary.devlog.description,
    slug: getRouteSegment("devlog"),
  });
}

export default async function DevlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dictionary = getDictionary(lang);
  const devlog = dictionary.devlog;

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl shadow-indigo-100/50">
        <span className="text-xs uppercase tracking-[0.4em] text-slate-600">{dictionary.nav.devlog}</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{devlog.title}</h1>
        <p className="max-w-3xl text-base text-slate-700 md:text-lg">{devlog.description}</p>
      </RevealSection>

      <RevealSection className="space-y-6">
        <ul className="space-y-4">
          {devlog.entries.map((entry) => (
            <li
              key={entry.title}
              className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-6 text-slate-900 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-[0.3em] text-slate-600">
                <span>{entry.date}</span>
                <span>Build {entry.build}</span>
                <span>{entry.status}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{entry.title}</h2>
              <p className="mt-3 text-sm text-slate-700">{entry.summary}</p>
              <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-700">
                {entry.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </RevealSection>

      <RevealSection className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-700 shadow-sm">
        {devlog.disclaimer}
      </RevealSection>
    </div>
  );
}
