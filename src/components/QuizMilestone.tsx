import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "./Confetti";

interface QuizMilestoneProps {
  current: number;
  total: number;
}

const MILESTONES = [
  { pct: 25, message: "Great start! You're finding your rhythm.", emoji: "🔥" },
  { pct: 50, message: "Halfway there — your values are taking shape!", emoji: "⭐" },
  { pct: 75, message: "Almost done! The finish line is in sight.", emoji: "🚀" },
];

const QuizMilestone: React.FC<QuizMilestoneProps> = ({ current, total }) => {
  const [activeMilestone, setActiveMilestone] = useState<typeof MILESTONES[0] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const shownRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (total === 0) return;
    const pct = (current / total) * 100;

    for (const milestone of MILESTONES) {
      if (pct >= milestone.pct && !shownRef.current.has(milestone.pct)) {
        shownRef.current.add(milestone.pct);
        setActiveMilestone(milestone);
        setShowConfetti(true);

        const timer = setTimeout(() => {
          setActiveMilestone(null);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [current, total]);

  return (
    <>
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <AnimatePresence>
        {activeMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-primary/30 bg-card px-6 py-3 shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeMilestone.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {activeMilestone.pct}% Complete
                </p>
                <p className="text-sm text-foreground mt-0.5">{activeMilestone.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuizMilestone;
