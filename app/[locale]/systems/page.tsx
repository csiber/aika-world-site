import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {createLanguageAlternates} from "@/lib/i18n";
import {isValidLocale} from "@/i18n.config";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: {locale: string};
}): Promise<Metadata> {
  const {locale} = params;

  if (!isValidLocale(locale)) {
    return {};
  }

  const t = await getTranslations({
    locale,
    namespace: "systems",
    keyPrefix: "metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: createLanguageAlternates("/systems"),
    },
  };
}

export default async function SystemsPage() {
  const t = await getTranslations("systems");
  const systemKeys = ["magic", "technology", "economy"] as const;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-3xl text-neutral-700">{t("intro")}</p>
      </header>
      <div className="space-y-6">
        {systemKeys.map((key) => (
          <article
            key={key}
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-neutral-900">
              {t(`systems.${key}.title`)}
            </h2>
            <p className="mt-2 text-sm text-neutral-700">
              {t(`systems.${key}.description`)}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              {t(`systems.${key}.impact`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
