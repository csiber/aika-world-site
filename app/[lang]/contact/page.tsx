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
      <RevealSection className="space-y-6 rounded-[32px] border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
        <span className="text-xs uppercase tracking-[0.4em] text-indigo-200">Contact</span>
        <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">Contact SyncNode Studio</h1>
        <p className="max-w-3xl text-base text-slate-200 md:text-lg">
          Reach us about AIKA: World — development, technical questions, collaboration, press, or business inquiries — through the direct channels below. We reply as quickly as production schedules allow while preparing the Steam launch.
        </p>
      </RevealSection>

      <RevealSection className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6 rounded-[32px] border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
          <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-indigo-200">Immediate Channels</h2>
          <div className="space-y-4 text-sm text-slate-200">
            <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-indigo-500/10 p-4">
              <h3 className="text-base font-semibold text-white">Email (General &amp; Support)</h3>
              <p>info@aikaworld.com</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-indigo-500/10 p-4">
              <h3 className="text-base font-semibold text-white">Business / Legal</h3>
              <p>business@syncnodestudio.com</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-indigo-500/10 p-4">
              <h3 className="text-base font-semibold text-white">Discord</h3>
              <p>syncnode</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-indigo-500/10 p-4">
              <h3 className="text-base font-semibold text-white">Matrix</h3>
              <p>@aika-world:matrix.org</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-indigo-500/10 p-4">
              <h3 className="text-base font-semibold text-white">Press &amp; Media</h3>
              <p>For interviews, press kits, or assets, contact:</p>
              <p>press@aikaworld.com</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-indigo-500/10 p-4">
              <h3 className="text-base font-semibold text-white">Community</h3>
              <p>
                Discord and Matrix are open for questions and feedback while we finish the Steam release.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-[32px] border border-slate-800/80 bg-slate-950/70 p-8 text-slate-100 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]">
          <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-indigo-200">Studio Information</h2>
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
