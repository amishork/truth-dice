import { useEffect, useRef } from "react";

const CALENDLY_URL = "https://calendly.com/wordsincarnate";
const CALENDLY_CSS = "https://assets.calendly.com/assets/external/widget.css";
const CALENDLY_JS = "https://assets.calendly.com/assets/external/widget.js";

/** Loads the Calendly script + CSS once, returns a promise that resolves when ready */
let loadPromise: Promise<void> | null = null;
function ensureCalendlyLoaded(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve) => {
    if (!document.querySelector(`link[href="${CALENDLY_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CALENDLY_CSS;
      document.head.appendChild(link);
    }
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
  eventType?: string;
  className?: string;
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
  hideEventTypeDetails?: boolean;
}

export const CalendlyInline = ({
  eventType = "/30min",
  className = "",
  height = "700px",
  backgroundColor,
  textColor,
  primaryColor,
  hideEventTypeDetails = false,
}: CalendlyInlineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (backgroundColor) params.set("background_color", backgroundColor);
    if (textColor) params.set("text_color", textColor);
    if (primaryColor) params.set("primary_color", primaryColor);
    if (hideEventTypeDetails) params.set("hide_event_type_details", "1");
    params.set("hide_gdpr_banner", "1");
    const url = `${CALENDLY_URL}${eventType}?${params.toString()}`;

    ensureCalendlyLoaded().then(() => {
      const el = containerRef.current;
      if (!el) return;
      const C = (window as any).Calendly;
      if (!C) return;

      el.innerHTML = "";
      C.initInlineWidget({ url, parentElement: el });
    });
  }, [eventType, backgroundColor, textColor, primaryColor, hideEventTypeDetails]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height, overflow: "hidden" }}
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
