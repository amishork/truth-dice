import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "wi-exit-intent-shown";

interface ExitIntentPopupProps {
  onStartQuiz: () => void;
}

const ExitIntentPopup = ({ onStartQuiz }: ExitIntentPopupProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already shown this session
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, "1");
        document.removeEventListener("mouseout", handler);
      }
    };

    // Delay attaching so it doesn't fire immediately
    const timer = setTimeout(() => {
      document.addEventListener("mouseout", handler);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", handler);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShow(false)}
        >
          <motion.div
            className="relative w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShow(false)}
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">
              <p className="label-technical mb-3">Before you go</p>
              <h3 className="text-xl font-semibold text-foreground">
                Discover your core values in 5 minutes
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Our free assessment helps you name the 6 values that matter most — so you can build a life that embodies them.
              </p>
              <div className="mt-6 space-y-3">
                <Button
                  size="lg"
                  className="w-full wi-cta"
                  onClick={() => {
                    setShow(false);
                    onStartQuiz();
                  }}
                >
                  Start Free Assessment
                  <ChevronRight />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setShow(false)}
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
