"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex items-center" data-snow-accumulate="navigation">
      <button
        type="button"
        className="flex items-center gap-3 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:hidden"
        aria-expanded={isOpen}
        aria-controls="main-navigation"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="sr-only">Navigáció megnyitása</span>
        <span className="flex flex-col gap-[5px]">
          <span
            className={cn(
              "h-0.5 w-5 origin-center rounded-full bg-white transition-transform",
              isOpen && "translate-y-[7px] rotate-45"
            )}
          />
          <span
            className={cn(
              "h-0.5 w-5 rounded-full bg-white transition-opacity",
              isOpen && "opacity-0"
            )}
          />
          <span
            className={cn(
              "h-0.5 w-5 origin-center rounded-full bg-white transition-transform",
              isOpen && "-translate-y-[7px] -rotate-45"
            )}
          />
        </span>
        <span className="tracking-[0.4em]">Menu</span>
      </button>
      <div
        id="main-navigation"
        className={cn(
          "absolute right-0 top-[calc(100%+1rem)] z-40 flex w-60 flex-col gap-3 rounded-2xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur transition-all duration-200",
          "md:static md:top-auto md:z-auto md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:border-none md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0",
          isOpen ? "scale-100 opacity-100" : "hidden scale-95 opacity-0 md:flex md:scale-100 md:opacity-100"
        )}
      >
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${locale}` && pathname?.startsWith(item.href));

          return (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className={cn(
                  "block px-1 py-1 text-sm font-medium tracking-wide text-foreground/70 transition-colors md:py-0.5",
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
    </div>
  );
}
