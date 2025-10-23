"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type MotionSectionProps = ComponentPropsWithoutRef<typeof motion.section> & {
  delay?: number;
};

export function RevealSection({
  className,
  delay = 0,
  children,
  ...props
}: MotionSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const offset = prefersReducedMotion ? 0 : 32;

  return (
    <motion.section
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: prefersReducedMotion ? 0 : delay,
      }}
      className={cn("will-change-transform will-change-opacity", className)}
      {...props}
    >
      {children}
    </motion.section>
  );
}
