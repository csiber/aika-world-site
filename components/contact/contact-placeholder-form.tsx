"use client";

import { useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ContactPlaceholderFormProps = {
  content: Dictionary["contact"]["form"];
};

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactPlaceholderForm({ content }: ContactPlaceholderFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);

  const contactEndpoint = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const isConfigured = Boolean(contactEndpoint && turnstileSiteKey);
  const configErrorMessage = !contactEndpoint
    ? content.endpointError
    : !turnstileSiteKey
      ? content.turnstileError
      : null;
  const isSubmitting = status === "submitting";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contactEndpoint) {
      setStatus("error");
      setFeedback(content.endpointError);
      return;
    }

    if (!turnstileToken) {
      setStatus("error");
      setFeedback(content.turnstileError);
      setTurnstileReset((value) => value + 1);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append("cf-turnstile-response", turnstileToken);

    setStatus("submitting");
    setFeedback(null);

    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit contact form");
      }

      setStatus("success");
      setFeedback(content.success);
      event.currentTarget.reset();
      setTurnstileToken("");
      setTurnstileReset((value) => value + 1);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFeedback(content.error);
      setTurnstileReset((value) => value + 1);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_20px_60px_-40px_rgba(123,83,255,0.6)] transition-transform"
    >
      <label className="grid gap-2 text-sm">
        <span className="uppercase tracking-[0.3em] text-white/60">{content.nameLabel}</span>
        <input
          type="text"
          required
          name="name"
          autoComplete="name"
          disabled={isSubmitting || !isConfigured}
          className="rounded-full border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="uppercase tracking-[0.3em] text-white/60">{content.emailLabel}</span>
        <input
          type="email"
          required
          name="email"
          autoComplete="email"
          disabled={isSubmitting || !isConfigured}
          className="rounded-full border border-white/20 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="uppercase tracking-[0.3em] text-white/60">{content.messageLabel}</span>
        <textarea
          required
          name="message"
          disabled={isSubmitting || !isConfigured}
          rows={4}
          placeholder={content.messagePlaceholder}
          className="resize-none rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white focus:outline-none"
        />
      </label>
      {turnstileSiteKey ? (
        <div className="rounded-2xl border border-white/20 bg-black/40 px-4 py-3">
          <TurnstileWidget
            siteKey={turnstileSiteKey}
            onSuccess={(token) => {
              setTurnstileToken(token);
              if (status === "error") {
                setStatus("idle");
                setFeedback(null);
              }
            }}
            onError={() => {
              setTurnstileToken("");
              setStatus("error");
              setFeedback(content.turnstileError);
            }}
            onExpire={() => {
              setTurnstileToken("");
            }}
            resetSignal={turnstileReset}
            className="mx-auto"
          />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {content.turnstileError}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting || !isConfigured}
        className={cn(
          "mt-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-950 transition-transform hover:-translate-y-0.5",
          (isSubmitting || !isConfigured) && "cursor-not-allowed bg-white/60 text-indigo-900/80"
        )}
      >
        {isSubmitting ? content.submittingLabel : content.submitLabel}
      </button>
      <p
        className={cn(
          "text-xs",
          !isConfigured
            ? "text-rose-200"
            : status === "success"
              ? "text-emerald-300"
              : status === "error"
                ? "text-rose-200"
                : "text-white/60"
        )}
        aria-live="polite"
      >
        {!isConfigured
          ? configErrorMessage ?? content.helperText
          : status === "success"
            ? feedback ?? content.success
            : status === "error"
              ? feedback ?? content.error
              : content.helperText}
      </p>
    </form>
  );
}
