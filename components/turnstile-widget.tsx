"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Appearance = "always" | "execute" | "interaction-only";
type Theme = "light" | "dark" | "auto";

type TurnstileWidgetProps = {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  resetSignal?: number;
  className?: string;
  appearance?: Appearance;
  theme?: Theme;
  action?: string;
};

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  appearance?: Appearance;
  theme?: Theme;
  action?: string;
};

type TurnstileInstanceId = string;

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => TurnstileInstanceId;
      reset: (id: TurnstileInstanceId) => void;
      remove: (id: TurnstileInstanceId) => void;
    };
  }
}

const scriptId = "cf-turnstile-script";
const scriptSrc = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function TurnstileWidget({
  siteKey,
  onSuccess,
  onError,
  onExpire,
  resetSignal,
  className,
  appearance = "always",
  theme = "auto",
  action,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<TurnstileInstanceId | null>(null);
  const [ready, setReady] = useState(() => typeof window !== "undefined" && Boolean(window.turnstile));
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);
  const expireRef = useRef(onExpire);

  useEffect(() => {
    successRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const handleLoad = () => {
      setReady(true);
    };

    if (existingScript) {
      if (window.turnstile) {
        setReady(true);
      } else {
        existingScript.addEventListener("load", handleLoad);
      }

      return () => {
        existingScript.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleLoad);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || !window.turnstile) {
      return;
    }

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
      containerRef.current.innerHTML = "";
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        successRef.current(token);
      },
      "error-callback": () => {
        errorRef.current?.();
      },
      "expired-callback": () => {
        expireRef.current?.();
        errorRef.current?.();
      },
      appearance,
      theme,
      action,
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [ready, siteKey, appearance, theme, action]);

  useEffect(() => {
    if (resetSignal === undefined || resetSignal === null) {
      return;
    }

    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  return <div ref={containerRef} className={cn("cf-turnstile", className)} />;
}
