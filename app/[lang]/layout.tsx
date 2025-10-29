import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { LocaleEffect } from "@/components/locale-effect";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { Snowfall } from "@/components/winter/snowfall";
import { navOrder, getDictionary, type Locale, locales, isLocale } from "@/lib/i18n";

export function generateStaticParams(): Array<{ lang: Locale }> {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const dictionary = getDictionary(lang);
  const navItems = navOrder.map((key) => ({
    label: dictionary.nav[key],
    href: key === "home" ? `/${lang}` : `/${lang}/${key}`,
  }));
  const currentYear = new Date().getFullYear();
  const rights = dictionary.footer.rights.replace("{{year}}", String(currentYear));

  return (
    <>
      <LocaleEffect locale={lang} />
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,_rgba(5,17,32,0.95)_0%,_rgba(7,25,44,0.92)_45%,_rgba(10,36,56,0.88)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[-25%] top-[-45%] -z-10 h-[540px] rounded-[45%] bg-[radial-gradient(circle,_rgba(148,197,255,0.32)_0%,_rgba(56,189,248,0.1)_45%,_transparent_70%)] blur-3xl"
        />
        <Snowfall />
        <nav className="sticky top-0 z-30 border-b border-white/10 bg-white/10 text-white backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
            <Link href={`/${lang}`} className="text-sm font-semibold uppercase tracking-[0.5em] text-white/80">
              AIKA: World
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <NavigationBar items={navItems} locale={lang} />
              <LocaleSwitcher locale={lang} />
            </div>
          </div>
        </nav>
        <main className="relative z-10 flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 md:pb-32 md:pt-16">{children}</div>
        </main>
        <footer className="relative z-10 border-t border-white/10 bg-slate-900/70 py-12 text-white backdrop-blur-xl">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[2fr_1fr_1fr]">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">{dictionary.footer.studioBlurb}</p>
              <p className="text-sm text-white/70">{dictionary.footer.credit}</p>
              <p className="text-xs text-white/50">{dictionary.footer.builtWith}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">{dictionary.footer.navTitle}</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">{dictionary.footer.languageTitle}</h3>
              <LocaleSwitcher locale={lang} />
              <div>
                <h4 className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                  {dictionary.footer.reachUs}
                </h4>
                <ul className="mt-3 space-y-1 text-sm text-white/80">
                  {dictionary.contact.channels.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                  <li>
                    <Link href={`mailto:${dictionary.footer.contactEmail}`} className="hover:text-white">
                      {dictionary.footer.contactEmail}
                    </Link>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-white/50">
                {[dictionary.footer.privacy, dictionary.footer.terms, dictionary.footer.cookies].join(" • ")}
              </p>
            </div>
          </div>
          <p className="mt-10 text-center text-xs text-white/50">{rights}</p>
        </footer>
      </div>
      <AnalyticsConsent message={dictionary.consent.message} acknowledge={dictionary.consent.acknowledge} />
    </>
  );
}
