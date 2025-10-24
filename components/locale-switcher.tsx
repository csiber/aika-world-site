"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  locale: Locale;
};

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
      {locales.map((entry) => {
        const nextSegments = segments.length > 0 ? [...segments] : [entry];
        nextSegments[0] = entry;
        const href = `/${nextSegments.join("/")}`;
        const isActive = entry === locale;

        return (
          <span key={entry} className="inline-flex">
            <Link
              href={href}
              className={cn(
                "px-2 py-1 text-foreground/70 transition-transform transition-opacity duration-150",
                "hover:scale-105 hover:text-foreground",
                isActive && "scale-110 text-foreground"
              )}
            >
              {entry.toUpperCase()}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
