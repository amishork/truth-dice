import { useEffect, useRef } from "react";

const CALENDLY_URL = "https://calendly.com/wordsincarnate";
const CALENDLY_CSS = "https://assets.calendly.com/assets/external/widget.css";
const CALENDLY_JS = "https://assets.calendly.com/assets/external/widget.js";

/** Loads the Calendly script + CSS once, returns a promise that resolves when ready */
let loadPromise: Promise<void> | null = null;
function ensureCalendlyLoaded(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve) => {
    // CSS
    if (!document.querySelector(`link[href="${CALENDLY_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CALENDLY_CSS;
      document.head.appendChild(link);
    }
    // JS
    const existing = document.querySelector(`script[src="${CALENDLY_JS}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = CALENDLY_JS;
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
  return loadPromise;
}

// ─── Inline Embed ───

interface CalendlyInlineProps {
  /** Optional specific event type path, e.g. "/30min" */
  eventType?: string;
  className?: string;
  minHeight?: string;
  /** Hex colors without # for Calendly theming */
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
}

export const CalendlyInline = ({
  eventType = "",
  className = "",
  minHeight = "700px",
  backgroundColor,
  textColor,
  primaryColor,
}: CalendlyInlineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Build the full Calendly URL with color params
  const colorParams = new URLSearchParams();
  if (backgroundColor) colorParams.set("background_color", backgroundColor);
  if (textColor) colorParams.set("text_color", textColor);
  if (primaryColor) colorParams.set("primary_color", primaryColor);
  colorParams.set("hide_gdpr_banner", "1");
  const paramString = colorParams.toString();
  const url = `${CALENDLY_URL}${eventType}${paramString ? "?" + paramString : ""}`;

  useEffect(() => {
    ensureCalendlyLoaded().then(() => {
      // Programmatic init needed for SPA navigation (script already loaded)
      if (containerRef.current && (window as any).Calendly) {
        // Only init if Calendly hasn't auto-initialized this element already
        if (!containerRef.current.querySelector("iframe")) {
          (window as any).Calendly.initInlineWidget({
            url,
            parentElement: containerRef.current,
          });
        }
      }
    });
  }, [url]);

  return (
    <div
      ref={containerRef}
      className={`calendly-inline-widget ${className}`}
      data-url={url}
      style={{ minWidth: "320px", width: "100%", height: minHeight }}
    />
  );
};

// ─── Popup ───

interface OpenCalendlyOptions {
  /** Optional specific event type path, e.g. "/30min" */
  eventType?: string;
}

export function openCalendlyPopup({ eventType = "" }: OpenCalendlyOptions = {}) {
  ensureCalendlyLoaded().then(() => {
    if ((window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url: `${CALENDLY_URL}${eventType}`,
      });
    }
  });
}

export default CalendlyInline;
