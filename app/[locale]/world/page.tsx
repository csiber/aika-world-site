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
    namespace: "world",
  });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      languages: createLanguageAlternates("/world"),
    },
  };
}

export default async function WorldPage() {
  const t = await getTranslations("world");
  const regionKeys = ["north", "central", "isles"] as const;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-3xl text-neutral-700">{t("intro")}</p>
      </header>
      <div className="grid gap-8 md:grid-cols-3">
        {regionKeys.map((key) => (
          <article
            key={key}
            className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-neutral-900">
              {t(`regions.${key}.title`)}
            </h2>
            <p className="text-sm text-neutral-700">
              {t(`regions.${key}.description`)}
            </p>
          </article>
        ))}
      </div>
      <div className="rounded-lg border border-neutral-200 bg-neutral-900 p-8 text-white shadow-sm">
        <h2 className="text-2xl font-semibold">{t("callToAction.title")}</h2>
        <p className="mt-2 text-sm text-neutral-100">{t("callToAction.description")}</p>
      </div>
    </section>
  );
}
