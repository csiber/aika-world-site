import type { Metadata, MetadataRoute } from "next";
import { getDictionary, locales, type Locale, type NavKey } from "@/lib/i18n";

const fallbackSiteUrl = "https://aika.world";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

const normalizedSiteUrl = configuredSiteUrl
  ? configuredSiteUrl.replace(/\/+$/, "")
  : fallbackSiteUrl;

const ogLocaleMap: Record<Locale, string> = {
  en: "en_US",
  hu: "hu_HU",
};

const descriptionByLocale = Object.fromEntries(
  locales.map((locale) => [locale, getDictionary(locale).meta.description]),
) as Record<Locale, string>;

export const siteConfig = {
  name: "AIKA: World",
  descriptions: descriptionByLocale,
  siteUrl: normalizedSiteUrl,
  defaultLocale: "en" as Locale,
};

export const routeSegments: Record<NavKey, string> = {
  home: "",
  world: "world",
  systems: "systems",
  devlog: "devlog",
  about: "about",
  contact: "contact",
};

export const openGraphImages = [
  {
    url: "/og/aika-world-light.svg",
    width: 1200,
    height: 630,
    alt: "AIKA: World open graph kártya világos témához",
    type: "image/svg+xml",
  },
  {
    url: "/og/aika-world-dark.svg",
    width: 1200,
    height: 630,
    alt: "AIKA: World open graph kártya sötét témához",
    type: "image/svg+xml",
  },
] satisfies Metadata["openGraph"]["images"];

type OpenGraphImage = (typeof openGraphImages)[number];

export const openGraphImageUrls = openGraphImages.map((image: OpenGraphImage) => image.url);

export function getSiteUrl(): string {
  return siteConfig.siteUrl;
}

export function buildLocalePath(locale: Locale, slug = ""): string {
  const cleanedSlug = slug.replace(/^\/+|\/+$/g, "");
  const suffix = cleanedSlug ? `/${cleanedSlug}` : "";
  return `/${locale}${suffix}`;
}

export function getRouteSegment(key: NavKey): string {
  return routeSegments[key];
}

function buildLanguageAlternates(slug = ""): Record<string, string> {
  const entries = locales.map((locale) => [locale, buildLocalePath(locale, slug)]);
  const languages = Object.fromEntries(entries) as Record<string, string>;
  languages["x-default"] = buildLocalePath(siteConfig.defaultLocale, slug);
  return languages;
}

function getAlternateOgLocales(current: Locale): string[] {
  return locales.filter((locale) => locale !== current).map((locale) => ogLocaleMap[locale]);
}

export function createPageMetadata({
  locale,
  title,
  description,
  slug = "",
  type = "website",
}: {
  locale: Locale;
  title: string;
  description: string;
  slug?: string;
  type?: Metadata["openGraph"]["type"];
}): Metadata {
  const canonicalPath = buildLocalePath(locale, slug);
  const languageAlternates = buildLanguageAlternates(slug);
  const ogLocale = ogLocaleMap[locale];

  const fullTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates,
    },
    openGraph: {
      type,
      url: canonicalPath,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      locale: ogLocale,
      alternateLocale: getAlternateOgLocales(locale),
      images: openGraphImages,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: openGraphImageUrls,
    },
  };
}

export function createSitemapEntries(slugs: Array<{ slug: string; priority?: number; changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"] }> = []): MetadataRoute.Sitemap {
  const now = new Date();
  const siteUrl = getSiteUrl();
  const baseEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  for (const locale of locales) {
    for (const { slug, priority, changeFrequency } of slugs) {
      const path = buildLocalePath(locale, slug);
      baseEntries.push({
        url: `${siteUrl}${path}`,
        lastModified: now,
        changeFrequency: changeFrequency ?? "weekly",
        priority: priority ?? (slug ? 0.6 : 0.8),
      });
    }
  }

  return baseEntries;
}
