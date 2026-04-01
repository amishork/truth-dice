import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "wi-cookie-consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already consented
    try {
      if (localStorage.getItem(CONSENT_KEY)) return;
    } catch {
      return;
    }
    // Slight delay so it doesn't flash on initial load
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {}
    setVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "declined");
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm px-4 py-4 shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:w-[420px] sm:rounded-lg sm:border"
        >
          <p className="text-sm text-foreground leading-relaxed">
            We use cookies and local storage to save your quiz progress and improve your experience.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={handleAccept} className="h-8 text-xs">
              Accept
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDecline} className="h-8 text-xs text-muted-foreground">
              Decline
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
