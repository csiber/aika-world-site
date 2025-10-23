"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

type NavItem = {
  label: string;
  href: string;
};

type NavigationBarProps = {
  items: NavItem[];
  locale: Locale;
};

const underlineVariants = {
  rest: { scaleX: 0, opacity: 0 },
  hover: { scaleX: 1, opacity: 1 },
};

export function NavigationBar({ items, locale }: NavigationBarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== `/${locale}` && pathname?.startsWith(item.href));

        return (
          <motion.div
            key={item.href}
            initial="rest"
            whileHover="hover"
            animate={isActive ? "hover" : "rest"}
            className="relative"
          >
            <Link
              href={item.href}
              className={cn(
                "px-1 py-0.5 text-sm font-medium tracking-wide text-foreground/80 transition-colors",
                isActive && "text-foreground"
              )}
              prefetch
            >
              {item.label}
            </Link>
            <motion.span
              aria-hidden
              variants={underlineVariants}
              transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-full bg-foreground/80"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
