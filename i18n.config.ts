import {createNavigation} from "next-intl/navigation";

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
