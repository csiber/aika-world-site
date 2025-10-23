import {defaultLocale, locales, type Locale, type Namespace} from "@/i18n.config";

type Messages = Record<string, unknown>;

type NamespaceMessages = Record<Namespace, Messages>;

export async function loadMessages(locale: Locale, namespaces: Namespace[]) {
  const entries = await Promise.all(
    namespaces.map(async (namespace) => {
      const messages: Messages = (
        await import(`../messages/${locale}/${namespace}.json`)
      ).default;
      return [namespace, messages] as const;
    })
  );

  return Object.fromEntries(entries) as NamespaceMessages;
}

export function createLanguageAlternates(pathname: string) {
  const normalized =
    pathname === "/" || pathname === ""
      ? ""
      : pathname.startsWith("/")
        ? pathname
        : `/${pathname}`;

  const languages = locales.reduce<Record<string, string>>((acc, locale) => {
    acc[locale] = `/${locale}${normalized}`;
    return acc;
  }, {});

  const defaultHref = `/${defaultLocale}${normalized}`;

  return {
    ...languages,
    "x-default": defaultHref,
  };
}
