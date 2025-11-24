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
    title: dictionary.contact.title,
    description: dictionary.contact.description,
    slug: getRouteSegment("contact"),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dictionary = getDictionary(lang);
  const contact = dictionary.contact;
  const studioHeading = lang === "hu" ? "Stúdióinformáció" : "Studio Information";

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-[32px] border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
        <span className="text-xs uppercase tracking-[0.4em] text-indigo-200">{dictionary.nav.contact}</span>
        <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">{contact.title}</h1>
        <p className="max-w-3xl text-base text-slate-200 md:text-lg">{contact.description}</p>
      </RevealSection>

      <RevealSection className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6 rounded-[32px] border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
          <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-indigo-200">{contact.channels.title}</h2>
          <ul className="space-y-4 text-sm text-slate-200">
            {contact.channels.items.map((item) => (
              <li
                key={item}
                className="space-y-2 rounded-2xl border border-slate-800/80 bg-indigo-500/10 p-4"
              >
                <p className="text-base font-semibold text-white">{item}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4 rounded-[32px] border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
          <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-indigo-200">{studioHeading}</h2>
          <div className="space-y-3 text-sm text-slate-200">
            <p className="text-white">SyncNode Studio — Polyák Csaba E.V.</p>
            <p>Cím: 4324 Kállósemjén, Kölcsey Ferenc út 11</p>
            <p>Telefon: +36 20 549 4107</p>
            <p>Nyilvántartási szám: 52193909</p>
            <p>Adószám: HU68747961</p>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
