import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

const MESSAGES = [
  "Someone just completed their values discovery",
  "A family started their formation journey today",
  "A school leader booked a culture workshop",
  "Someone discovered their top 6 core values",
  "A parent just began their values exploration",
  "An organization aligned their team on shared values",
];

const FIRST_NAMES = [
  "Sarah", "Michael", "Emma", "James", "Olivia", "Daniel",
  "Isabella", "David", "Sophia", "Matthew", "Ava", "Andrew",
];

const LOCATIONS = [
  "Austin, TX", "Nashville, TN", "Denver, CO", "Portland, OR",
  "Charlotte, NC", "Phoenix, AZ", "Columbus, OH", "Raleigh, NC",
];

const INTERVALS = [15000, 25000, 35000, 45000];

const SocialProofToasts = () => {
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [timeAgo, setTimeAgo] = useState("");

  const showToast = useCallback(() => {
    setCurrentMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setCurrentName(FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]);
    setCurrentLocation(LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]);
    const minutes = Math.floor(Math.random() * 15) + 2;
    setTimeAgo(`${minutes} min ago`);
    setVisible(true);

    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    // Initial delay before first toast
    const initialDelay = setTimeout(() => {
      showToast();
    }, 8000);

    // Recurring toasts at random intervals
    let intervalId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
      intervalId = setTimeout(() => {
        showToast();
        scheduleNext();
      }, delay);
    };

    const startRecurring = setTimeout(() => {
      scheduleNext();
    }, 13000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(startRecurring);
      clearTimeout(intervalId);
    };
  }, [showToast]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <div className="sketch-card flex items-start gap-3 p-4 pr-10 shadow-lg">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{currentMessage}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {currentName} from {currentLocation} · {timeAgo}
              </p>
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

export default SocialProofToasts;
