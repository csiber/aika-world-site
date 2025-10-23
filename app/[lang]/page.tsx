import { HomeLanding } from "@/components/home/home-landing";
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
    title: dictionary.home.hero.title,
    description: dictionary.home.whatIs.subtitle,
    slug: getRouteSegment("home"),
  });
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = getDictionary(lang);

  return <HomeLanding locale={lang} content={dictionary.home} />;
}
