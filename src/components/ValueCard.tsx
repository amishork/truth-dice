import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Info } from 'lucide-react';
import { VALUE_DESCRIPTIONS } from '@/lib/valueDescriptions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ValueCardProps {
  value: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  leftLabel: string;
  rightLabel: string;
  description?: string;
}

export const ValueCard: React.FC<ValueCardProps> = ({
  value,
  onSwipeLeft,
  onSwipeRight,
  leftLabel,
  rightLabel,
  description
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const isAnimating = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const minSwipeDistance = 50;
  const tooltipText = VALUE_DESCRIPTIONS[displayValue];

  // When parent changes value prop, sync display and reset animation state
  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(value);
      setExitDirection(null);
      isAnimating.current = false;
    }
  }, [value, displayValue]);

  const triggerExit = useCallback((dir: 'left' | 'right') => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setExitDirection(dir);

    // After animation completes, fire callback. Parent updates value prop,
    // which triggers the useEffect above to reset state.
    setTimeout(() => {
      if (dir === 'left') onSwipeLeft();
      else onSwipeRight();
    }, 250);
  }, [onSwipeLeft, onSwipeRight]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) triggerExit('left');
    else if (distance < -minSwipeDistance) triggerExit('right');
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const exitVariants = {
    left: {
      y: 600, x: -120, rotate: -25, opacity: 0,
      transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
    },
    right: {
      y: -30, x: 60, rotate: 8, opacity: 0, scale: 0.95,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={displayValue}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={exitDirection ? exitVariants[exitDirection] : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="quiz-value-card"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <h2 className="text-3xl font-serif font-medium text-center mb-4 text-foreground leading-tight relative z-10">
            {displayValue}
          </h2>

          {tooltipText && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="relative z-10 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>What does this mean?</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[250px] text-center">
                <p className="text-sm">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {description && (
            <p className="text-muted-foreground text-center text-sm italic font-serif relative z-10 mt-3">{description}</p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 w-full">
        <button
          onClick={() => triggerExit('left')}
          className="quiz-btn quiz-btn-secondary"
        >
          <X className="w-3.5 h-3.5" />
          <span>{leftLabel}</span>
        </button>
        <button
          onClick={() => triggerExit('right')}
          className="quiz-btn quiz-btn-primary"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{rightLabel}</span>
        </button>
      </div>

      <p className="text-[0.55rem] text-muted-foreground text-center font-mono tracking-[0.25em] uppercase opacity-40">
        Swipe or tap to proceed
      </p>
    </div>
  );
};
