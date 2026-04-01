import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const VISIT_KEY = "wi-visit-data";

interface VisitData {
  visitCount: number;
  lastVisit: string;
  hasCompletedQuiz: boolean;
  finalValues?: string[];
}

function getVisitData(): VisitData {
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { visitCount: 0, lastVisit: "", hasCompletedQuiz: false };
}

function saveVisitData(data: VisitData) {
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(data));
  } catch {}
}

interface WelcomeBackProps {
  onStartQuiz?: () => void;
}

const WelcomeBack: React.FC<WelcomeBackProps> = ({ onStartQuiz }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [subMessage, setSubMessage] = useState("");
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const data = getVisitData();
    const now = new Date();
    const isReturning = data.visitCount > 0;
    const lastVisit = data.lastVisit ? new Date(data.lastVisit) : null;

    // Update visit data
    const quizProgress = localStorage.getItem("wi-quiz-progress");
    const hasQuiz = !!quizProgress || data.hasCompletedQuiz;

    let finalValues: string[] | undefined;
    if (quizProgress) {
      try {
        const parsed = JSON.parse(quizProgress);
        if (parsed.finalSixValues?.length === 6) {
          finalValues = parsed.finalSixValues;
          data.hasCompletedQuiz = true;
        }
      } catch {}
    }

    data.visitCount += 1;
    data.lastVisit = now.toISOString();
    if (finalValues) data.finalValues = finalValues;
    saveVisitData(data);

    if (!isReturning) return; // First visit, no welcome back

    // Determine greeting
    const daysSinceLastVisit = lastVisit
      ? Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceLastVisit < 0.01) return; // Same session, skip

    if (data.hasCompletedQuiz && data.finalValues?.length) {
      setMessage("Welcome back! Your values are waiting.");
      setSubMessage(`Your core values: ${data.finalValues.slice(0, 3).join(", ")}${data.finalValues.length > 3 ? "..." : ""}`);
      setShowCta(false);
    } else if (hasQuiz) {
      setMessage("Welcome back! You have a quiz in progress.");
      setSubMessage("Pick up right where you left off.");
      setShowCta(true);
    } else if (daysSinceLastVisit > 7) {
      setMessage("It's been a while! Welcome back.");
      setSubMessage("Ready to discover your core values?");
      setShowCta(true);
    } else {
      setMessage(`Welcome back!`);
      setSubMessage("Good to see you again.");
      setShowCta(false);
    }

    // Show after slight delay
    const timer = setTimeout(() => setVisible(true), 1500);
    const hideTimer = setTimeout(() => setVisible(false), 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md"
        >
          <div className="sketch-card flex items-start gap-3 p-4 pr-10 shadow-xl">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Flame className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{subMessage}</p>
              {showCta && onStartQuiz && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 text-xs"
                  onClick={() => {
                    setVisible(false);
                    onStartQuiz();
                  }}
                >
                  Continue Assessment
                </Button>
              )}
            </div>
            <button
              onClick={() => setVisible(false)}
              className="absolute right-2 top-2 rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBack;
