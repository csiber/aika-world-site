import {Link, locales, type Locale} from "@/i18n.config";
import {getTranslations} from "next-intl/server";
import LocaleSwitcher from "./LocaleSwitcher";

export default async function NavBar({locale}: {locale: Locale}) {
  const t = await getTranslations("common");
  const languageNames = locales.reduce<Record<Locale, string>>((acc, value) => {
    acc[value] = t(`languages.${value}` as const);
    return acc;
  }, {} as Record<Locale, string>);

  const navigation = [
    {href: "/", label: t("nav.landing")},
    {href: "/about", label: t("nav.about")},
    {href: "/systems", label: t("nav.systems")},
    {href: "/world", label: t("nav.world")},
  ];

  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-neutral-900">
          Aika World
        </Link>
        <div className="flex items-center gap-6">
          <ul className="flex items-center gap-4 text-sm font-medium text-neutral-700">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-neutral-900">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <LocaleSwitcher
            currentLocale={locale}
            label={t("nav.language")}
            options={languageNames}
          />
        </div>
      </nav>
    </header>
  );
}
