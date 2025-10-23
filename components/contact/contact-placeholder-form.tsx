"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ContactPlaceholderFormProps = {
  content: Dictionary["contact"]["form"];
};

const formVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.6, 0.2, 1] },
  },
};

export function ContactPlaceholderForm({ content }: ContactPlaceholderFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={formVariants}
      className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_20px_60px_-40px_rgba(123,83,255,0.6)]"
    >
      <label className="grid gap-2 text-sm">
        <span className="uppercase tracking-[0.3em] text-white/60">{content.nameLabel}</span>
        <input
          type="text"
          required
          disabled={submitted}
          className="rounded-full border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="uppercase tracking-[0.3em] text-white/60">{content.emailLabel}</span>
        <input
          type="email"
          required
          disabled={submitted}
          className="rounded-full border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="uppercase tracking-[0.3em] text-white/60">{content.messageLabel}</span>
        <textarea
          required
          disabled={submitted}
          rows={4}
          placeholder={content.messagePlaceholder}
          className="resize-none rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={submitted}
        className={cn(
          "mt-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-950 transition-transform hover:-translate-y-0.5",
          submitted && "cursor-not-allowed bg-white/60 text-indigo-900/80"
        )}
      >
        {submitted ? content.success : content.submitLabel}
      </button>
      <p className="text-xs text-white/60">{content.disabledHint}</p>
    </motion.form>
  );
}
