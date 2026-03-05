import React from 'react';

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
          className="relative group border border-foreground/40 bg-card p-8 text-lg font-serif text-foreground hover:border-primary hover:bg-muted/50 transition-all duration-200 text-center"
        >
          {/* Dimension arrows on hover */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          {value1}
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-foreground/15" />
          <span className="text-[0.6rem] font-mono text-muted-foreground tracking-[0.3em] uppercase">or</span>
          <div className="flex-1 h-px bg-foreground/15" />
        </div>
        
        <button
          onClick={() => onSelect(value2)}
          className="relative group border border-foreground/40 bg-card p-8 text-lg font-serif text-foreground hover:border-primary hover:bg-muted/50 transition-all duration-200 text-center"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          {value2}
        </button>
      </div>
    </div>
  );
};
