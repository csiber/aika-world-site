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
    namespace: "about",
  });

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      languages: createLanguageAlternates("/about"),
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const sectionKeys = ["mission", "team", "approach"] as const;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-3xl text-neutral-700">{t("intro")}</p>
      </header>
      <div className="grid gap-8 md:grid-cols-3">
        {sectionKeys.map((key) => (
          <article
            key={key}
            className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-neutral-900">
              {t(`sections.${key}.title`)}
            </h2>
            <p className="text-sm text-neutral-700">
              {t(`sections.${key}.description`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
