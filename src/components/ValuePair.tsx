import React from 'react';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
      <p className="text-center text-muted-foreground font-serif italic text-lg leading-relaxed">{title}</p>
      
      <div className="flex flex-col gap-4 w-full">
        <button
          onClick={() => onSelect(value1)}
          className="relative group bg-card border border-border rounded-2xl p-8 text-lg font-serif text-foreground hover:border-primary/50 hover:glow-gold transition-all duration-300 text-center"
        >
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/20 rounded-tl-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/20 rounded-br-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          {value1}
        </button>
        
        <div className="text-center text-xs text-muted-foreground tracking-[0.3em] uppercase">or</div>
        
        <button
          onClick={() => onSelect(value2)}
          className="relative group bg-card border border-border rounded-2xl p-8 text-lg font-serif text-foreground hover:border-primary/50 hover:glow-gold transition-all duration-300 text-center"
        >
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-primary/20 rounded-tl-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-primary/20 rounded-br-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          {value2}
        </button>
      </div>
    </div>
  );
};