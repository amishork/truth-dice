import { useEffect, useRef } from "react";

const CAL_URL = "https://cal.com/words-incarnate";

// ─── Inline Embed (kept for backward compat, use raw iframe on Contact page) ───

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
  eventType = "/discovery-call",
  className = "",
  height = "700px",
}: CalendlyInlineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={className}>
      <iframe
        src={`${CAL_URL}${eventType}/embed?layout=month_view&theme=light`}
        title="Schedule a call"
        width="100%"
        height={height}
        frameBorder="0"
        style={{ border: "none" }}
      />
    </div>
  );
};

// ─── Popup ───
// Opens Cal.com in a new centered window (popup style)

interface OpenCalendlyOptions {
  eventType?: string;
}

export function openCalendlyPopup({ eventType = "/discovery-call" }: OpenCalendlyOptions = {}) {
  const url = `${CAL_URL}${eventType}`;
  const w = 700;
  const h = 750;
  const left = (window.screen.width - w) / 2;
  const top = (window.screen.height - h) / 2;
  window.open(url, "cal-booking", `width=${w},height=${h},top=${top},left=${left},scrollbars=yes`);
}

export default CalendlyInline;
