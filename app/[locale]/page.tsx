import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {createLanguageAlternates} from "@/lib/i18n";
import {isValidLocale} from "@/i18n.config";

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
    namespace: "landing",
  });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      languages: createLanguageAlternates("/"),
    },
  };
}

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const highlightKeys = ["worldbuilding", "systems", "community"] as const;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-col gap-6 text-left">
        <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="max-w-2xl text-lg text-neutral-700 sm:text-xl">
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-col gap-2 text-neutral-700 sm:flex-row sm:items-center sm:gap-4">
          <span className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
            {t("hero.cta")}
          </span>
          <span className="text-sm text-neutral-600 sm:text-base">
            {t("hero.support")}
          </span>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {highlightKeys.map((key) => (
          <article
            key={key}
            className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-neutral-900">
              {t(`highlights.${key}.title`)}
            </h3>
            <p className="text-sm text-neutral-700">
              {t(`highlights.${key}.description`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
