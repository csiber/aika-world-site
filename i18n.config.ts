import {createNavigation} from "next-intl/navigation";
import {getRequestConfig} from "next-intl/server";

export const locales = ["hu", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "hu";

export const namespaces = [
  "common",
  "landing",
  "about",
  "systems",
  "world",
  "footer",
] as const;
export type Namespace = (typeof namespaces)[number];

export const localePrefix = "always" as const;

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export const {Link, redirect, usePathname, useRouter} = createNavigation({
  locales,
  localePrefix,
});

async function loadMessages(locale: Locale) {
  const entries = await Promise.all(
    namespaces.map(async (namespace) => {
      const module = await import(`./messages/${locale}/${namespace}.json`);
      return [namespace, module.default] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<Namespace, Record<string, unknown>>;
}

export default getRequestConfig(async ({locale}) => {
  const candidateLocale = locale ?? defaultLocale;
  const activeLocale = isValidLocale(candidateLocale) ? candidateLocale : defaultLocale;

  return {
    locale: activeLocale,
    messages: await loadMessages(activeLocale),
  };
});
