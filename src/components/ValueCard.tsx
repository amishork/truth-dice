import React, { useState, useRef } from 'react';
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [cardKey, setCardKey] = useState(value);
  const isAnimating = useRef(false);

  const minSwipeDistance = 50;
  const tooltipText = VALUE_DESCRIPTIONS[value];

  // Update key when value changes
  if (value !== cardKey && !exitDirection) {
    setCardKey(value);
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) triggerExit('left');
    else if (distance < -minSwipeDistance) triggerExit('right');
  };

  const triggerExit = (dir: 'left' | 'right') => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setExitDirection(dir);
    setTimeout(() => {
      setExitDirection(null);
      isAnimating.current = false;
      if (dir === 'left') onSwipeLeft();
      else onSwipeRight();
    }, 350);
  };

  const exitVariants = {
    left: {
      y: 600,
      x: -120,
      rotate: -25,
      opacity: 0,
      transition: { duration: 0.35, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
    },
    right: {
      y: -30,
      x: 60,
      rotate: 8,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={cardKey}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={exitDirection ? exitVariants[exitDirection] : { opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative sketch-card p-10 w-full min-h-[300px] flex flex-col items-center justify-center overflow-visible"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Construction grid inside card */}
          <div className="absolute inset-4 opacity-[0.06] construction-lines pointer-events-none" />

          {/* Corner extension lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ left: 0, top: 0 }}>
            <line x1="0" y1="-6" x2="0" y2="6" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
            <line x1="-6" y1="0" x2="6" y2="0" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
            <line x1="100%" y1="-6" x2="100%" y2="6" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
            <line x1="calc(100% - 6px)" y1="0" x2="calc(100% + 6px)" y2="0" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
            <line x1="0" y1="calc(100% - 6px)" x2="0" y2="calc(100% + 6px)" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
            <line x1="-6" y1="100%" x2="6" y2="100%" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
            <line x1="100%" y1="calc(100% - 6px)" x2="100%" y2="calc(100% + 6px)" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
            <line x1="calc(100% - 6px)" y1="100%" x2="calc(100% + 6px)" y2="100%" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
          </svg>

          {/* Cross-hatch shading */}
          <div className="absolute top-0 right-0 w-14 h-14 cross-hatch opacity-25 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-12 h-12 cross-hatch opacity-15 pointer-events-none" />
          
          <h2 className="text-3xl font-serif font-medium text-center mb-4 text-foreground leading-tight relative z-10">
            {value}
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
          disabled={isAnimating.current}
          className="flex-1 h-14 flex items-center justify-center gap-2 btn-sketch-secondary"
        >
          <X className="w-3.5 h-3.5" />
          <span>{leftLabel}</span>
        </button>
        <button
          onClick={() => triggerExit('right')}
          disabled={isAnimating.current}
          className="flex-1 h-14 flex items-center justify-center gap-2 btn-sketch-primary"
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
