"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

type LocaleEffectProps = {
  locale: Locale;
};

export function LocaleEffect({ locale }: LocaleEffectProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
