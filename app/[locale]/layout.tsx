import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {getTranslations, setRequestLocale} from "next-intl/server";
import type {ReactNode} from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import {createLanguageAlternates} from "@/lib/i18n";
import {isValidLocale, type Locale} from "@/i18n.config";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const t = await getTranslations({
    locale,
    namespace: "common",
  });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      languages: createLanguageAlternates("/"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{locale: Locale}>;
}>) {
  const {locale} = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
