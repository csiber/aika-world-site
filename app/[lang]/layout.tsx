import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { LocaleEffect } from "@/components/locale-effect";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { NavigationBar } from "@/components/navigation/navigation-bar";
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
      <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/40 text-slate-100">
        <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
            <Link href={`/${lang}`} className="text-sm font-semibold uppercase tracking-[0.55em] text-slate-100">
              AIKAWORLD.COM
            </Link>
            <div className="flex flex-wrap items-center gap-4">
              <NavigationBar items={navItems} locale={lang} />
              <LocaleSwitcher locale={lang} />
            </div>
          </div>
        </nav>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 md:pb-32 md:pt-16">{children}</div>
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-950/80 py-14 text-slate-200 backdrop-blur">
          <div className="mx-auto max-w-6xl space-y-10 px-6">
            <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-[0_20px_80px_-60px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.4em] text-indigo-200/80">aikaworld.com</p>
                  <p className="text-sm text-slate-200">{dictionary.footer.studioBlurb}</p>
                  <p className="text-sm text-slate-300">{dictionary.footer.credit}</p>
                  <p className="text-xs text-slate-400">{dictionary.footer.builtWith}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-indigo-200/80">
                  <LocaleSwitcher locale={lang} />
                  <span className="hidden text-slate-700 md:inline">|</span>
                  <span className="rounded-full border border-indigo-300/40 bg-indigo-400/10 px-3 py-1">{rights}</span>
                </div>
              </div>
              <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-200">{dictionary.footer.navTitle}</h3>
                  <ul className="grid grid-cols-2 gap-2 text-sm text-slate-100/90">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="rounded px-2 py-1 transition-colors hover:bg-indigo-500/10 hover:text-white">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-200">{dictionary.footer.reachUs}</h3>
                  <ul className="space-y-2 text-sm text-slate-100/90">
                    {dictionary.contact.channels.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-300/80" aria-hidden />
                        {item}
                      </li>
                    ))}
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-300/80" aria-hidden />
                      <Link href={`mailto:${dictionary.footer.contactEmail}`} className="transition-colors hover:text-white">
                        {dictionary.footer.contactEmail}
                      </Link>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-300/80" aria-hidden />
                      <Link href="https://aikaworld.com" className="transition-colors hover:text-white">
                        aikaworld.com
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-200">{dictionary.footer.languageTitle}</h3>
                  <p className="text-sm text-slate-300">
                    {[dictionary.footer.privacy, dictionary.footer.terms, dictionary.footer.cookies].join(" • ")}
                  </p>
                  <p className="text-xs text-slate-500">{rights}</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <AnalyticsConsent message={dictionary.consent.message} acknowledge={dictionary.consent.acknowledge} />
    </>
  );
}
