import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {getTranslations, unstable_setRequestLocale} from "next-intl/server";
import type {ReactNode} from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import {createLanguageAlternates} from "@/lib/i18n";
import {isValidLocale, locales, type Locale} from "@/i18n.config";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: {locale: string};
}): Promise<Metadata> {
  const {locale} = params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const t = await getTranslations({
    locale,
    namespace: "common",
    keyPrefix: "metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: createLanguageAlternates("/"),
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: {locale: Locale};
}>) {
  const {locale} = params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  unstable_setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
