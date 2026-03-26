import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizMilestoneProps {
  current: number;
  total: number;
}

const MILESTONES = [
  { pct: 25, message: "Great start — you're finding your rhythm.", emoji: "🔥" },
  { pct: 50, message: "Halfway there — your values are taking shape.", emoji: "⭐" },
  { pct: 75, message: "Almost done — the finish line is in sight.", emoji: "🚀" },
];

const QuizMilestone: React.FC<QuizMilestoneProps> = ({ current, total }) => {
  const [activeMilestone, setActiveMilestone] = useState<typeof MILESTONES[0] | null>(null);
  const shownRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (total === 0) return;
    const pct = (current / total) * 100;

    for (const milestone of MILESTONES) {
      if (pct >= milestone.pct && !shownRef.current.has(milestone.pct)) {
        shownRef.current.add(milestone.pct);
        setActiveMilestone(milestone);

        const timer = setTimeout(() => {
          setActiveMilestone(null);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [current, total]);

  return (
    <AnimatePresence>
      {activeMilestone && (
        <motion.div
          initial={{ opacity: 0, x: -40, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed bottom-6 left-6 z-50 overflow-hidden rounded-lg border border-primary/20 bg-card shadow-lg"
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.08) 50%, transparent 60%)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeInOut" }}
          />

          <div className="relative flex items-center gap-3 px-5 py-3">
            <span className="text-xl">{activeMilestone.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                {activeMilestone.pct}% Complete
              </p>
              <p className="text-sm text-foreground mt-0.5">{activeMilestone.message}</p>
            </div>
          </div>

          {/* Bottom progress accent */}
          <motion.div
            className="h-[2px] bg-primary"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 2.5, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizMilestone;
