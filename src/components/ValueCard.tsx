import React, { useState } from 'react';
import { X, Heart } from 'lucide-react';
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
        className={`relative bg-card border border-border rounded-2xl p-10 w-full min-h-[300px] flex flex-col items-center justify-center transition-all duration-300 glow-gold ${
          swipeDirection === 'left' ? 'translate-x-[-100px] opacity-0 rotate-[-5deg]' : ''
        } ${swipeDirection === 'right' ? 'translate-x-[100px] opacity-0 rotate-[5deg]' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-primary/30 rounded-tl-md" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-primary/30 rounded-tr-md" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-primary/30 rounded-bl-md" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-primary/30 rounded-br-md" />
        
        <h2 className="text-3xl font-serif font-semibold text-center mb-4 text-gold-gradient leading-tight">
          {value}
        </h2>
        {description && (
          <p className="text-muted-foreground text-center text-sm italic">{description}</p>
        )}
      </div>

      <div className="flex gap-4 w-full">
        <Button
          onClick={onSwipeLeft}
          variant="outline"
          size="lg"
          className="flex-1 h-14 gap-2 border-border hover:bg-accent/10 hover:border-accent/40 transition-all duration-300"
        >
          <X className="w-4 h-4" />
          <span className="text-sm">{leftLabel}</span>
        </Button>
        <Button
          onClick={onSwipeRight}
          size="lg"
          className="flex-1 h-14 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
        >
          <Heart className="w-4 h-4" />
          <span className="text-sm">{rightLabel}</span>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center opacity-60">
        Swipe left or right on the card, or use the buttons
      </p>
    </div>
  );
};