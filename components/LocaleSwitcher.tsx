"use client";

import {usePathname, useRouter} from "@/i18n.config";
import {useTransition, type ChangeEvent} from "react";
import type {Locale} from "@/i18n.config";
import {locales} from "@/i18n.config";

type LocaleSwitcherProps = {
  currentLocale: Locale;
  label: string;
  options: Record<Locale, string>;
};

export default function LocaleSwitcher({
  currentLocale,
  label,
  options,
}: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as Locale;
    if (nextLocale === currentLocale) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  };

  return (
    <label className="flex items-center gap-2 text-sm text-neutral-700">
      <span className="font-medium text-neutral-800">{label}</span>
      <select
        className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-800 shadow-sm focus:border-neutral-500 focus:outline-none"
        value={currentLocale}
        onChange={handleChange}
        disabled={isPending}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {options[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
