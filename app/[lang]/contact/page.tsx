import { notFound } from "next/navigation";
import { RevealSection } from "@/components/reveal-section";
import { isLocale } from "@/lib/i18n";
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

  return createPageMetadata({
    locale: lang,
    title: "Contact SyncNode Studio",
    description:
      "Reach the AIKA: World team for development, collaboration, press, or business inquiries through the direct channels listed on this page.",
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

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl shadow-indigo-100/50">
        <span className="text-xs uppercase tracking-[0.4em] text-slate-600">Contact</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Contact SyncNode Studio</h1>
        <p className="max-w-3xl text-base text-slate-700 md:text-lg">
          Reach us about AIKA: World — development, technical questions, collaboration, press, or business inquiries — through the direct channels below. We reply as quickly as production schedules allow while preparing the Steam launch.
        </p>
      </RevealSection>

      <RevealSection className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl shadow-indigo-100/50">
          <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-slate-700">Immediate Channels</h2>
          <div className="space-y-4 text-sm text-slate-700">
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-indigo-50/60 p-4">
              <h3 className="text-base font-semibold text-slate-900">Email (General &amp; Support)</h3>
              <p>hello@aika.world</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-indigo-50/60 p-4">
              <h3 className="text-base font-semibold text-slate-900">Business / Legal</h3>
              <p>business@syncnodestudio.com</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-indigo-50/60 p-4">
              <h3 className="text-base font-semibold text-slate-900">Discord</h3>
              <p>syncnode</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-indigo-50/60 p-4">
              <h3 className="text-base font-semibold text-slate-900">Matrix</h3>
              <p>@aika-world:matrix.org</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-indigo-50/60 p-4">
              <h3 className="text-base font-semibold text-slate-900">Press &amp; Media</h3>
              <p>For interviews, press kits, or assets, contact:</p>
              <p>press@aikaworld.com</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-indigo-50/60 p-4">
              <h3 className="text-base font-semibold text-slate-900">Community</h3>
              <p>
                Discord and Matrix are open for questions and feedback while we finish the Steam release.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl shadow-indigo-100/50">
          <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-slate-700">Studio Information</h2>
          <div className="space-y-3 text-sm text-slate-700">
            <p className="text-slate-900">SyncNode Studio — Polyák Csaba E.V.</p>
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
