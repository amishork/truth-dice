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
}

export const CalendlyInline = ({
  eventType = "",
  className = "",
  minHeight = "700px",
}: CalendlyInlineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureCalendlyLoaded().then(() => {
      if (containerRef.current && (window as any).Calendly) {
        (window as any).Calendly.initInlineWidget({
          url: `${CALENDLY_URL}${eventType}`,
          parentElement: containerRef.current,
        });
      }
    });
  }, [eventType]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minWidth: "320px", minHeight }}
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
