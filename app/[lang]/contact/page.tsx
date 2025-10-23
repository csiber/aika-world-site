import { ContactPlaceholderForm } from "@/components/contact/contact-placeholder-form";
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
    title: dictionary.contact.title,
    description: dictionary.contact.description,
    slug: getRouteSegment("contact"),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = getDictionary(lang);
  const contact = dictionary.contact;

  return (
    <div className="space-y-16 md:space-y-20">
      <RevealSection className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
        <span className="text-xs uppercase tracking-[0.4em] text-white/50">{dictionary.nav.contact}</span>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{contact.title}</h1>
        <p className="max-w-3xl text-base text-white/75 md:text-lg">{contact.description}</p>
      </RevealSection>

      <RevealSection className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/50 p-8 text-white">
          <h2 className="text-xl font-semibold uppercase tracking-[0.3em] text-white/70">{contact.channels.title}</h2>
          <ul className="space-y-3 text-sm text-white/80">
            {contact.channels.items.map((item) => (
              <li key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <ContactPlaceholderForm content={contact.form} />
      </RevealSection>
    </div>
  );
}
