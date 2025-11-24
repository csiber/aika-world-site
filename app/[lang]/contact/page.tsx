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
      <RevealSection className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
        <span className="text-xs uppercase tracking-[0.4em] text-white/50">Contact</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Contact SyncNode Studio</h1>
        <p className="max-w-3xl text-base text-white/75 md:text-lg">
          If you want to reach us about AIKA: World — development, technical questions,
          collaboration, press, or business inquiries — use the direct channels below. We respond
          as soon as development schedules allow.
        </p>
      </RevealSection>

      <RevealSection className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/50 p-8 text-white">
          <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-white/70">
            Immediate Channels
          </h2>
          <div className="space-y-4 text-sm text-white/80">
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-base font-semibold text-white">Email (General &amp; Support)</h3>
              <p className="text-white/80">info@aikaworld.com</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-base font-semibold text-white">Business / Legal</h3>
              <p className="text-white/80">business@syncnodestudio.com</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-base font-semibold text-white">Discord</h3>
              <p className="text-white/80">syncnode</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-base font-semibold text-white">Matrix</h3>
              <p className="text-white/80">@aika-world:matrix.org</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-base font-semibold text-white">Press &amp; Media</h3>
              <p className="text-white/80">For interviews, press kits, assets or logo usage, reach us via:</p>
              <p className="text-white/80">press@aikaworld.com</p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-base font-semibold text-white">Community</h3>
              <p className="text-white/80">
                The community channels open in phases as new survival slices release. Discord and Matrix remain
                the primary entry points for early testers.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
          <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-white/70">Studio Information</h2>
          <div className="space-y-3 text-sm text-white/80">
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
