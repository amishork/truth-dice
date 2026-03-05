import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        className={`relative sketch-border bg-card p-10 w-full min-h-[300px] flex flex-col items-center justify-center transition-all duration-300 ${
          swipeDirection === 'left' ? 'translate-x-[-100px] opacity-0 rotate-[-3deg]' : ''
        } ${swipeDirection === 'right' ? 'translate-x-[100px] opacity-0 rotate-[3deg]' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Corner tick marks */}
        <div className="absolute top-0 left-4 w-px h-4 bg-foreground/25" />
        <div className="absolute top-4 left-0 w-4 h-px bg-foreground/25" />
        <div className="absolute top-0 right-4 w-px h-4 bg-foreground/25" />
        <div className="absolute top-4 right-0 w-4 h-px bg-foreground/25" />
        <div className="absolute bottom-0 left-4 w-px h-4 bg-foreground/25" />
        <div className="absolute bottom-4 left-0 w-4 h-px bg-foreground/25" />
        <div className="absolute bottom-0 right-4 w-px h-4 bg-foreground/25" />
        <div className="absolute bottom-4 right-0 w-4 h-px bg-foreground/25" />

        {/* Cross-hatch shading in corners */}
        <div className="absolute top-0 right-0 w-12 h-12 cross-hatch opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-10 h-10 cross-hatch opacity-20 pointer-events-none" />

        {/* Light construction grid */}
        <div className="absolute inset-6 opacity-[0.04] construction-lines pointer-events-none" />
        
        <h2 className="text-3xl font-serif font-medium text-center mb-4 text-foreground leading-tight relative z-10">
          {value}
        </h2>
        {description && (
          <p className="text-muted-foreground text-center text-sm italic font-serif relative z-10">{description}</p>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <Button
          onClick={onSwipeLeft}
          variant="outline"
          size="lg"
          className="flex-1 h-14 gap-2 border-foreground/30 hover:bg-muted hover:border-foreground/50 transition-all font-mono text-[0.65rem] tracking-[0.15em] uppercase rounded-sm"
        >
          <X className="w-3.5 h-3.5" />
          <span>{leftLabel}</span>
        </Button>
        <Button
          onClick={onSwipeRight}
          size="lg"
          className="flex-1 h-14 gap-2 bg-primary text-primary-foreground hover:bg-primary/85 transition-all font-mono text-[0.65rem] tracking-[0.15em] uppercase rounded-sm shadow-[2px_2px_0_hsl(350_50%_22%)]"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{rightLabel}</span>
        </Button>
      </div>

      <p className="text-[0.55rem] text-muted-foreground text-center font-mono tracking-[0.25em] uppercase opacity-40">
        Swipe or tap to proceed
      </p>
    </div>
  );
};
