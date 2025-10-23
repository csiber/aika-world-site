import Link from "next/link";
import type { ReactNode } from "react";
import { LocaleEffect } from "@/components/locale-effect";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { navOrder, getDictionary, type Locale, locales } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams(): Array<{ lang: Locale }> {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
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
      <div className="relative flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(123,83,255,0.15),_transparent_60%)]">
        <nav className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur">
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
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 md:pb-32 md:pt-16">{children}</div>
        </main>
        <footer className="border-t border-white/10 bg-black/70 py-12 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[2fr_1fr_1fr]">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">{dictionary.footer.tagline}</p>
              <p className="max-w-md text-sm text-white/70">{dictionary.footer.description}</p>
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
                  {dictionary.footer.contactLabel}
                </h4>
                <ul className="mt-3 space-y-1 text-sm text-white/80">
                  {dictionary.contact.channels.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-10 text-center text-xs text-white/50">{rights}</p>
        </footer>
      </div>
    </>
  );
}
