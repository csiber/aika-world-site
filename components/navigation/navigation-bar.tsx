"use client";

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

export function NavigationBar({ items, locale }: NavigationBarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== `/${locale}` && pathname?.startsWith(item.href));

        return (
          <div key={item.href} className="group relative">
            <Link
              href={item.href}
              className={cn(
                "px-1 py-0.5 text-sm font-medium tracking-wide text-foreground/70 transition-colors",
                "after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0",
                "after:rounded-full after:bg-foreground after:transition-transform after:duration-200 after:ease-in-out",
                "group-hover:after:scale-x-100",
                isActive && "text-foreground after:scale-x-100"
              )}
              prefetch
            >
              {item.label}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
