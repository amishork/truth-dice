import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAvgQuizDuration } from "@/lib/quizSessions";

interface QuizTimerProps {
  /** Timestamps (ms) of each card decision in the current session */
  cardTimestamps: number[];
  /** Total cards remaining across all remaining phases */
  totalCardsRemaining: number;
  /** Whether the timer should be visible */
  visible: boolean;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return "< 1 min";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatAvg(seconds: number): string {
  const m = Math.round(seconds / 60);
  return `~${m} min`;
}

const QuizTimer: React.FC<QuizTimerProps> = ({ cardTimestamps, totalCardsRemaining, visible }) => {
  const [avgDuration, setAvgDuration] = useState<number | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    getAvgQuizDuration().then(setAvgDuration);
  }, []);

  const estimatedRemaining = useMemo(() => {
    if (cardTimestamps.length < 3) return null;
    // Average ms per card based on recent decisions
    const intervals: number[] = [];
    for (let i = 1; i < cardTimestamps.length; i++) {
      intervals.push(cardTimestamps[i] - cardTimestamps[i - 1]);
    }
    const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const remainingMs = avgMs * totalCardsRemaining;
    return Math.max(0, remainingMs / 1000);
  }, [cardTimestamps, totalCardsRemaining]);

  if (!visible || avgDuration === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="quiz-timer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <span className="quiz-timer-label">Avg. completion</span>
          <span className="quiz-timer-value ml-1.5">{formatAvg(avgDuration)}</span>
        </div>
        {estimatedRemaining !== null && (
          <>
            <div className="w-px h-3 bg-border/40" />
            <div>
              <span className="quiz-timer-label">Est. remaining</span>
              <span className="quiz-timer-value ml-1.5">{formatTime(estimatedRemaining)}</span>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizTimer;
