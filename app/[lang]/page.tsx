import type { Metadata } from "next";
import { HomeLanding } from "@/components/home/home-landing";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = getDictionary(lang);

  return {
    title: dictionary.home.hero.title,
    description: dictionary.home.whatIs.subtitle,
  };
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
