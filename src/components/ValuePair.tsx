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
    <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
      <p className="text-center text-muted-foreground mb-4">{title}</p>
      
      <div className="flex flex-col gap-4 w-full">
        <Button
          onClick={() => onSelect(value1)}
          variant="outline"
          className="h-24 text-lg hover:bg-primary hover:text-primary-foreground transition-all"
        >
          {value1}
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">or</div>
        
        <Button
          onClick={() => onSelect(value2)}
          variant="outline"
          className="h-24 text-lg hover:bg-primary hover:text-primary-foreground transition-all"
        >
          {value2}
        </Button>
      </div>
    </div>
  );
};
