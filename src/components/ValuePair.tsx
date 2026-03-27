import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ValuePairProps {
  value1: string;
  value2: string;
  onSelect: (value: string) => void;
  title: string;
}

export const ValuePair: React.FC<ValuePairProps> = ({
  value1,
  value2,
  onSelect,
  title
}) => {
  const [displayPair, setDisplayPair] = useState({ v1: value1, v2: value2 });
  const [selected, setSelected] = useState<string | null>(null);
  const isAnimating = useRef(false);
  const pendingCallback = useRef<(() => void) | null>(null);

  const currentKey = `${value1}-${value2}`;
  const displayKey = `${displayPair.v1}-${displayPair.v2}`;

  // Only update displayed pair when NOT animating
  useEffect(() => {
    if (!selected && !isAnimating.current && currentKey !== displayKey) {
      setDisplayPair({ v1: value1, v2: value2 });
    }
  }, [value1, value2, selected, currentKey, displayKey]);

  const handleSelect = useCallback((value: string) => {
    if (selected || isAnimating.current) return;
    isAnimating.current = true;
    setSelected(value);
    pendingCallback.current = () => onSelect(value);
  }, [selected, onSelect]);

  const handleExitComplete = useCallback(() => {
    const cb = pendingCallback.current;
    pendingCallback.current = null;
    setSelected(null);
    isAnimating.current = false;
    if (cb) cb();
  }, []);

  const loser = selected === displayPair.v1 ? displayPair.v2 : selected === displayPair.v2 ? displayPair.v1 : null;

  const OrDivider = () => (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(0 0% 65%) 0, hsl(0 0% 65%) 4px, transparent 4px, transparent 8px)' }} />
      <span className="text-[0.55rem] font-mono text-muted-foreground tracking-[0.3em] uppercase">or</span>
      <div className="flex-1 h-px" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(0 0% 65%) 0, hsl(0 0% 65%) 4px, transparent 4px, transparent 8px)' }} />
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
      <p className="text-center text-muted-foreground font-serif italic text-lg leading-relaxed">{title}</p>

      <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
        <motion.div
          key={displayKey}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-4 w-full"
        >
          {/* First value */}
          <motion.button
            onClick={() => handleSelect(displayPair.v1)}
            className="quiz-pair-card"
            animate={
              selected === displayPair.v1
                ? { boxShadow: "0 0 24px -4px hsl(var(--primary) / 0.4)" }
                : loser === displayPair.v1
                ? { y: 500, rotate: -15, opacity: 0 }
                : {}
            }
            transition={
              loser === displayPair.v1
                ? { duration: 0.35, ease: [0.4, 0, 1, 1] }
                : { duration: 0.2 }
            }
            whileTap={{ scale: 0.97 }}
          >
            {displayPair.v1}
          </motion.button>

          <OrDivider />

          {/* Second value */}
          <motion.button
            onClick={() => handleSelect(displayPair.v2)}
            className="quiz-pair-card"
            animate={
              selected === displayPair.v2
                ? { boxShadow: "0 0 24px -4px hsl(var(--primary) / 0.4)" }
                : loser === displayPair.v2
                ? { y: 500, rotate: -15, opacity: 0 }
                : {}
            }
            transition={
              loser === displayPair.v2
                ? { duration: 0.35, ease: [0.4, 0, 1, 1] }
                : { duration: 0.2 }
            }
            whileTap={{ scale: 0.97 }}
          >
            {displayPair.v2}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
