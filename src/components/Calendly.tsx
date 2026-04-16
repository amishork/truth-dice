import { useEffect, useRef, useCallback } from "react";

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
  /** Specific event type path, e.g. "/30min" */
  eventType?: string;
  className?: string;
  height?: string;
  /** Hex colors without # for Calendly theming */
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
  /** Hide the left-side event details panel */
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
  const initializedRef = useRef(false);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (backgroundColor) params.set("background_color", backgroundColor);
    if (textColor) params.set("text_color", textColor);
    if (primaryColor) params.set("primary_color", primaryColor);
    if (hideEventTypeDetails) params.set("hide_event_type_details", "1");
    params.set("hide_gdpr_banner", "1");
    const paramString = params.toString();
    return `${CALENDLY_URL}${eventType}${paramString ? "?" + paramString : ""}`;
  }, [eventType, backgroundColor, textColor, primaryColor, hideEventTypeDetails]);

  useEffect(() => {
    initializedRef.current = false;

    ensureCalendlyLoaded().then(() => {
      if (!containerRef.current || initializedRef.current) return;
      if (!(window as any).Calendly) return;

      // Clear previous content
      containerRef.current.innerHTML = "";
      initializedRef.current = true;

      (window as any).Calendly.initInlineWidget({
        url: buildUrl(),
        parentElement: containerRef.current,
      });
    });

    return () => {
      initializedRef.current = false;
    };
  }, [buildUrl]);

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
