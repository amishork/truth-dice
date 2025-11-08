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
    <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
      <div
        className={`bg-card rounded-2xl p-8 shadow-xl w-full min-h-[300px] flex flex-col items-center justify-center transition-all duration-200 ${
          swipeDirection === 'left' ? 'translate-x-[-100px] opacity-0' : ''
        } ${swipeDirection === 'right' ? 'translate-x-[100px] opacity-0' : ''}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <h2 className="text-3xl font-bold text-center mb-4">{value}</h2>
        {description && (
          <p className="text-muted-foreground text-center text-sm">{description}</p>
        )}
      </div>

      <div className="flex gap-4 w-full">
        <Button
          onClick={onSwipeLeft}
          variant="outline"
          size="lg"
          className="flex-1 h-16 gap-2 hover:bg-destructive/10 hover:border-destructive"
        >
          <X className="w-5 h-5" />
          {leftLabel}
        </Button>
        <Button
          onClick={onSwipeRight}
          size="lg"
          className="flex-1 h-16 gap-2 bg-gradient-to-r from-primary to-accent"
        >
          <Heart className="w-5 h-5" />
          {rightLabel}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Swipe left or right on the card, or use the buttons
      </p>
    </div>
  );
};
