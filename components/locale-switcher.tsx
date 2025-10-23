"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const switchVariants = {
  rest: { opacity: 0.4, scale: 1 },
  hover: { opacity: 1, scale: 1.05 },
  active: { opacity: 1, scale: 1.08 },
};

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
          <motion.span
            key={entry}
            variants={switchVariants}
            initial="rest"
            whileHover="hover"
            animate={isActive ? "active" : "rest"}
            className="inline-flex"
          >
            <Link
              href={href}
              className={cn(
                "px-2 py-1 text-foreground/80 transition-colors",
                isActive && "text-foreground"
              )}
            >
              {entry.toUpperCase()}
            </Link>
          </motion.span>
        );
      })}
    </div>
  );
}
