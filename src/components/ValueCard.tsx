import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

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
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const minSwipeDistance = 50;

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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSwipeDirection('left');
      setTimeout(() => {
        onSwipeLeft();
        setSwipeDirection(null);
      }, 200);
    }
    if (isRightSwipe) {
      setSwipeDirection('right');
      setTimeout(() => {
        onSwipeRight();
        setSwipeDirection(null);
      }, 200);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
      <div
        className={`relative sketch-card p-10 w-full min-h-[300px] flex flex-col items-center justify-center transition-all duration-300 overflow-visible ${
          swipeDirection === 'left' ? 'translate-x-[-100px] opacity-0 rotate-[-3deg]' : ''
        } ${swipeDirection === 'right' ? 'translate-x-[100px] opacity-0 rotate-[3deg]' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Construction grid inside card */}
        <div className="absolute inset-4 opacity-[0.06] construction-lines pointer-events-none" />

        {/* Corner extension lines — drafting overshoot marks */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ left: 0, top: 0 }}>
          {/* Top-left */}
          <line x1="0" y1="-6" x2="0" y2="6" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
          <line x1="-6" y1="0" x2="6" y2="0" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
          {/* Top-right */}
          <line x1="100%" y1="-6" x2="100%" y2="6" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
          <line x1="calc(100% - 6px)" y1="0" x2="calc(100% + 6px)" y2="0" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
          {/* Bottom-left */}
          <line x1="0" y1="calc(100% - 6px)" x2="0" y2="calc(100% + 6px)" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
          <line x1="-6" y1="100%" x2="6" y2="100%" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
          {/* Bottom-right */}
          <line x1="100%" y1="calc(100% - 6px)" x2="100%" y2="calc(100% + 6px)" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
          <line x1="calc(100% - 6px)" y1="100%" x2="calc(100% + 6px)" y2="100%" stroke="hsl(0 0% 60%)" strokeWidth="0.5" />
        </svg>

        {/* Cross-hatch shading in top-right corner */}
        <div className="absolute top-0 right-0 w-14 h-14 cross-hatch opacity-25 pointer-events-none" />
        {/* Pencil shading bottom-left */}
        <div className="absolute bottom-0 left-0 w-12 h-12 cross-hatch opacity-15 pointer-events-none" />
        
        <h2 className="text-3xl font-serif font-medium text-center mb-4 text-foreground leading-tight relative z-10">
          {value}
        </h2>
        {description && (
          <p className="text-muted-foreground text-center text-sm italic font-serif relative z-10">{description}</p>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onSwipeLeft}
          className="flex-1 h-14 flex items-center justify-center gap-2 btn-sketch-secondary"
        >
          <X className="w-3.5 h-3.5" />
          <span>{leftLabel}</span>
        </button>
        <button
          onClick={onSwipeRight}
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
