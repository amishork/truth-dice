import React, { useState, useRef } from 'react';
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
  const [selected, setSelected] = useState<string | null>(null);
  const [pairKey, setPairKey] = useState(`${value1}-${value2}`);
  const isAnimating = useRef(false);

  const currentKey = `${value1}-${value2}`;
  if (currentKey !== pairKey && !selected) {
    setPairKey(currentKey);
  }

  const handleSelect = (value: string) => {
    if (selected || isAnimating.current) return;
    isAnimating.current = true;
    setSelected(value);
    setTimeout(() => {
      setSelected(null);
      isAnimating.current = false;
      onSelect(value);
    }, 400);
  };

  const loser = selected === value1 ? value2 : selected === value2 ? value1 : null;

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
      
      <AnimatePresence mode="wait">
        <motion.div
          key={pairKey}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4 w-full"
        >
          {/* First value */}
          <motion.button
            onClick={() => handleSelect(value1)}
            className="relative group sketch-card p-8 text-lg font-serif text-foreground hover:border-primary transition-all duration-200 text-center overflow-visible"
            animate={
              selected === value1
                ? { boxShadow: "0 0 24px -4px hsl(var(--primary) / 0.4)" }
                : loser === value1
                ? { y: 500, rotate: -15, opacity: 0 }
                : {}
            }
            transition={
              loser === value1
                ? { duration: 0.4, ease: [0.4, 0, 1, 1] }
                : { duration: 0.2 }
            }
            whileTap={{ scale: 0.97 }}
          >
            <div className="absolute top-0 right-0 w-10 h-10 cross-hatch opacity-20 pointer-events-none" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            {value1}
          </motion.button>

          {/* Or divider — between the two values */}
          <OrDivider />

          {/* Second value */}
          <motion.button
            onClick={() => handleSelect(value2)}
            className="relative group sketch-card p-8 text-lg font-serif text-foreground hover:border-primary transition-all duration-200 text-center overflow-visible"
            animate={
              selected === value2
                ? { boxShadow: "0 0 24px -4px hsl(var(--primary) / 0.4)" }
                : loser === value2
                ? { y: 500, rotate: -15, opacity: 0 }
                : {}
            }
            transition={
              loser === value2
                ? { duration: 0.4, ease: [0.4, 0, 1, 1] }
                : { duration: 0.2 }
            }
            whileTap={{ scale: 0.97 }}
          >
            <div className="absolute bottom-0 left-0 w-10 h-10 cross-hatch opacity-20 pointer-events-none" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            {value2}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
