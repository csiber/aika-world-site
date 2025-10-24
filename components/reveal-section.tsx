import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export type RevealSectionProps = ComponentPropsWithoutRef<"section">;

export function RevealSection({ className, children, ...props }: RevealSectionProps) {
  return (
    <section className={cn("transition-all", className)} {...props}>
      {children}
    </section>
  );
}
