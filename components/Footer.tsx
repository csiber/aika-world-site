import {getTranslations} from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-4 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <span>{t("copyright")}</span>
        <span>{t("tagline")}</span>
      </div>
    </footer>
  );
}
