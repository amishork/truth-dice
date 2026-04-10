import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CONSENT_KEY = "wi-cookie-consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(CONSENT_KEY)) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = (value: string) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    setExiting(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm px-4 py-4 shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:w-[420px] sm:rounded-lg sm:border"
      style={{
        animation: exiting ? "slideDown 0.3s ease forwards" : "slideUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards",
      }}
    >
      <p className="text-sm text-foreground leading-relaxed">
        We use cookies and local storage to save your quiz progress and improve your experience.{" "}
        <Link to="/privacy" className="text-primary underline hover:text-primary/80">
          Learn more
        </Link>
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={() => dismiss("accepted")} className="h-8 text-xs">
          Accept
        </Button>
        <Button size="sm" variant="ghost" onClick={() => dismiss("declined")} className="h-8 text-xs text-muted-foreground">
          Decline
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
