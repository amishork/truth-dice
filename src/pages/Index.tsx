import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Dices, Heart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const CORE_VALUES = [
  'Affection (love and caring)', 'Caring', 'Dependability', 'Forgiveness', 
  'Friendship', 'Fun', 'Giving', 'Gratitude', 'Growth', 'Honesty', 'Joy', 
  'Kindness', 'Loyalty', 'Open and Honest', 'Patience', 'Purpose', 
  'Trustworthiness', 'Adding Value', 'Ethical Practice', 'Humor', 'Learning', 
  'Personal Growth & Development', 'Religion', 'Truth', 'Meaningful Work', 
  'Wisdom', 'Family', 'Having a Family', 'Beauty', 'Discernment', 'Charity', 
  'Close Relationships', 'Community', 'Knowledge', 'Quality Relationships', 
  'Reliability', 'Chivalry', 'Considerate', 'Courage', 'Happiness', 'Life', 
  'Perseverance', 'Communication', 'Compassion', 'Cheerfulness', 'Clarity', 
  'Sharing', 'Togetherness', 'Authenticity', 'Excellence', 'Energy', 
  'Leadership', 'Confidence', 'God', 'Love', 'Nurturing', 'Tenderness', 
  'Trust', 'Humility', 'Team/Teamwork', 'Awareness', 'Creativity', 'Health', 
  'Intention', 'Value', 'Coaching', 'Fairness', 'Honor', 'Integrity', 
  'Justice', 'Nature', 'Quality', 'Respect', 'Responsibility and accountability', 
  'Contribution', 'Achievement/Drive', 'Helping Other People', 'Self-determinism', 
  'Self-Respect', 'Companionship', 'Conscientiousness', 'Conviction', 
  'Cooperation', 'Courteousness', 'Discovery', 'Helping Society', 
  'Making a difference', 'Public Service', 'Spontaneity', 'Adaptability', 
  'Commitment', 'Presence', 'Unity', 'Connection', 'Playfulness', 'Involvement', 
  'Music', 'Order', 'Security', 'Simplicity', 'Excitement', 'Inner Harmony', 
  'Attractiveness', 'Competence', 'Intimacy', 'Passion', 'Vulnerability', 
  'Aesthetic', 'Certainty', 'Economic Security', 'Empathy', 'Enthusiasm', 
  'Freedom', 'Independence', 'Travel', 'Vigor', 'Advancement and Promotion', 
  'Adventure', 'Affinity', 'Aliveness', 'Arts', 'Articulate', 'Bliss', 
  'Challenging Problems', 'Change and Variety', 'Charisma', 'Competition', 
  'Congruence', 'Decisiveness', 'Democracy', 'Ecological Awareness', 
  'Effectiveness', 'Efficiency', 'Endurance', 'Environment', 'Equality', 
  'Expertise', 'Expression', 'Fame', 'Fast Living', 'Fast-Paced Work', 
  'Financial Gain', 'Flexibility', 'Focus', 'Heart', 'Inclusive', 
  'Influencing Others', 'Inspiration', 'Intellectual Status', 'Intelligence', 
  'Job Tranquility', 'Leverage', 'Location', 'Market Position', 'Mentorship', 
  'Meditation', 'Merit', 'Money/Making Money', 'Openness', 'Partnership', 
  'Peace', 'Perception', 'Physical Challenge', 'Pleasure', 'Power and Authority', 
  'Privacy', 'Probability', 'Productivity', 'Purity', 'Rational', 'Receptivity', 
  'Recognition', 'Reputation', 'Resolution', 'Resolve', 'Resourcefulness', 
  'Sensitivity', 'Sensuality', 'Serenity', 'Sophistication', 'Soul', 'Spirit', 
  'Spiritual', 'Stability', 'Strength', 'Status', 'Success', 'Supervising Others', 
  'Synergy', 'Technology', 'Time Freedom', 'Vision', 'Vitality', 'Wealth'
];

const CONTEXTS = ['Personal', 'Professional', 'Relationships', 'Community'];
const DICE_CONTEXTS = ['hope', 'fear', 'person', 'place', 'physical object', 'experience'];

const Index = () => {
  const [stage, setStage] = useState('welcome');
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [valuePairs, setValuePairs] = useState<string[][]>([]);
  const [selectedFromPairs, setSelectedFromPairs] = useState<string[]>([]);
  
  const [currentContext, setCurrentContext] = useState(0);
  const [contextValues, setContextValues] = useState<Record<string, string[]>>({});
  const [contextPairIndex, setContextPairIndex] = useState(0);
  const [contextPairs, setContextPairs] = useState<string[][]>([]);
  const [contextTopTen, setContextTopTen] = useState<Record<string, string[]>>({});
  
  const [topThreePairIndex, setTopThreePairIndex] = useState(0);
  const [topThreePairs, setTopThreePairs] = useState<string[][]>([]);
  const [contextTopThree, setContextTopThree] = useState<Record<string, string[]>>({});
  
  const [finalThreeValues, setFinalThreeValues] = useState<string[]>([]);
  
  const [dice1Result, setDice1Result] = useState<string>('');
  const [dice2Result, setDice2Result] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);

  // Generate initial pairs
  useEffect(() => {
    if (stage === 'initial-comparison' && valuePairs.length === 0) {
      const pairs: string[][] = [];
      for (let i = 0; i < CORE_VALUES.length; i += 2) {
        if (i + 1 < CORE_VALUES.length) {
          pairs.push([CORE_VALUES[i], CORE_VALUES[i + 1]]);
        }
      }
      setValuePairs(pairs);
    }
  }, [stage]);

  // Generate context pairs
  useEffect(() => {
    if (stage === 'context-refinement' && contextPairs.length === 0 && selectedFromPairs.length > 0) {
      const pairs: string[][] = [];
      for (let i = 0; i < selectedFromPairs.length; i += 2) {
        if (i + 1 < selectedFromPairs.length) {
          pairs.push([selectedFromPairs[i], selectedFromPairs[i + 1]]);
        }
      }
      setContextPairs(pairs);
    }
  }, [stage, selectedFromPairs]);

  // Generate top three pairs
  useEffect(() => {
    if (stage === 'context-top-three' && topThreePairs.length === 0) {
      const contextName = CONTEXTS[currentContext];
      const values = contextTopTen[contextName] || [];
      const pairs: string[][] = [];
      for (let i = 0; i < values.length; i += 2) {
        if (i + 1 < values.length) {
          pairs.push([values[i], values[i + 1]]);
        }
      }
      setTopThreePairs(pairs);
    }
  }, [stage, currentContext, contextTopTen]);

  const handlePairSelection = (value: string) => {
    const newSelected = [...selectedFromPairs, value];
    setSelectedFromPairs(newSelected);
    
    if (currentPairIndex < valuePairs.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
    } else {
      setStage('context-refinement');
      setCurrentPairIndex(0);
    }
  };

  const handleContextPairSelection = (value: string) => {
    const contextName = CONTEXTS[currentContext];
    const currentValues = contextValues[contextName] || [];
    const newValues = [...currentValues, value];
    
    setContextValues({ ...contextValues, [contextName]: newValues });
    
    if (contextPairIndex < contextPairs.length - 1 && newValues.length < 10) {
      setContextPairIndex(contextPairIndex + 1);
    } else if (newValues.length >= 10) {
      setContextTopTen({ ...contextTopTen, [contextName]: newValues.slice(0, 10) });
      
      if (currentContext < CONTEXTS.length - 1) {
        setCurrentContext(currentContext + 1);
        setContextPairIndex(0);
      } else {
        setStage('context-top-three');
        setCurrentContext(0);
        setTopThreePairIndex(0);
      }
    }
  };

  const handleTopThreePairSelection = (value: string) => {
    const contextName = CONTEXTS[currentContext];
    const currentTop = contextTopThree[contextName] || [];
    const newTop = [...currentTop, value];
    
    setContextTopThree({ ...contextTopThree, [contextName]: newTop });
    
    if (topThreePairIndex < topThreePairs.length - 1 && newTop.length < 3) {
      setTopThreePairIndex(topThreePairIndex + 1);
    } else if (newTop.length >= 3) {
      if (currentContext < CONTEXTS.length - 1) {
        setCurrentContext(currentContext + 1);
        setTopThreePairIndex(0);
        setTopThreePairs([]);
      } else {
        setStage('final-three');
      }
    }
  };

  const handleFinalValueToggle = (value: string) => {
    if (finalThreeValues.includes(value)) {
      setFinalThreeValues(finalThreeValues.filter(v => v !== value));
    } else if (finalThreeValues.length < 3) {
      setFinalThreeValues([...finalThreeValues, value]);
    }
  };

  const rollDice = () => {
    setIsRolling(true);
    const dice1Values = [...finalThreeValues, 'Personal Growth', 'Marriage', 'Community'];
    const randomDice1 = dice1Values[Math.floor(Math.random() * dice1Values.length)];
    const randomDice2 = DICE_CONTEXTS[Math.floor(Math.random() * DICE_CONTEXTS.length)];
    
    setTimeout(() => {
      setDice1Result(randomDice1);
      setDice2Result(randomDice2);
      setIsRolling(false);
    }, 500);
  };

  const WelcomeScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full text-center space-y-6">
        <Heart className="w-16 h-16 mx-auto text-primary" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Discover Your Core Values
        </h1>
        <p className="text-muted-foreground text-lg">
          A guided journey to identify the three values that matter most to you
        </p>
        <div className="bg-card rounded-2xl p-6 space-y-3 text-left shadow-lg">
          <h3 className="font-semibold text-card-foreground">Your Journey:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">1.</span>
              <span>Compare values to find what resonates</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">2.</span>
              <span>Refine by context (Personal, Professional, Relationships, Community)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">3.</span>
              <span>Select your top three in each context</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">4.</span>
              <span>Choose your final three core values</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">5.</span>
              <span>Explore with digital dice</span>
            </li>
          </ol>
        </div>
        <Button 
          onClick={() => setStage('initial-comparison')}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          Begin Your Journey
        </Button>
      </div>
    </div>
  );

  const InitialComparisonScreen = () => {
    if (!valuePairs[currentPairIndex]) return null;
    const [value1, value2] = valuePairs[currentPairIndex];
    const progress = ((currentPairIndex + 1) / valuePairs.length) * 100;

    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Initial Selection</h2>
            <span className="text-sm text-muted-foreground">
              {currentPairIndex + 1} / {valuePairs.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto w-full">
          <p className="text-center text-muted-foreground mb-4">
            Which value resonates more with you?
          </p>
          <Button
            onClick={() => handlePairSelection(value1)}
            variant="outline"
            className="w-full h-24 text-lg hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {value1}
          </Button>
          <Button
            onClick={() => handlePairSelection(value2)}
            variant="outline"
            className="w-full h-24 text-lg hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {value2}
          </Button>
        </div>
      </div>
    );
  };

  const ContextRefinementScreen = () => {
    if (!contextPairs[contextPairIndex]) return null;
    const [value1, value2] = contextPairs[contextPairIndex];
    const contextName = CONTEXTS[currentContext];
    const currentCount = (contextValues[contextName] || []).length;
    const progress = (currentCount / 10) * 100;

    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">{contextName} Context</h2>
            <span className="text-sm text-muted-foreground">
              {currentCount} / 10 values
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto w-full">
          <p className="text-center text-muted-foreground mb-4">
            In your {contextName.toLowerCase()} life, which matters more?
          </p>
          <Button
            onClick={() => handleContextPairSelection(value1)}
            variant="outline"
            className="w-full h-24 text-lg hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {value1}
          </Button>
          <Button
            onClick={() => handleContextPairSelection(value2)}
            variant="outline"
            className="w-full h-24 text-lg hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {value2}
          </Button>
        </div>
      </div>
    );
  };

  const ContextTopThreeScreen = () => {
    if (!topThreePairs[topThreePairIndex]) return null;
    const [value1, value2] = topThreePairs[topThreePairIndex];
    const contextName = CONTEXTS[currentContext];
    const currentCount = (contextTopThree[contextName] || []).length;
    const progress = (currentCount / 3) * 100;

    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">{contextName} - Top 3</h2>
            <span className="text-sm text-muted-foreground">
              {currentCount} / 3 values
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto w-full">
          <p className="text-center text-muted-foreground mb-4">
            Select your top 3 values for {contextName.toLowerCase()}
          </p>
          <Button
            onClick={() => handleTopThreePairSelection(value1)}
            variant="outline"
            className="w-full h-24 text-lg hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {value1}
          </Button>
          <Button
            onClick={() => handleTopThreePairSelection(value2)}
            variant="outline"
            className="w-full h-24 text-lg hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {value2}
          </Button>
        </div>
      </div>
    );
  };

  const FinalThreeScreen = () => {
    const allTopThree = Object.values(contextTopThree).flat();
    
    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Final Three</h2>
          <p className="text-muted-foreground">
            Select the 3 values that matter most across all areas of your life
          </p>
          <div className="mt-4">
            <Progress value={(finalThreeValues.length / 3) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {finalThreeValues.length} / 3 selected
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto w-full">
          {allTopThree.map((value, index) => (
            <Button
              key={index}
              onClick={() => handleFinalValueToggle(value)}
              variant={finalThreeValues.includes(value) ? "default" : "outline"}
              className="h-16 text-base transition-all"
            >
              {value}
            </Button>
          ))}
        </div>
        
        {finalThreeValues.length === 3 && (
          <Button
            onClick={() => setStage('dice')}
            size="lg"
            className="mt-6 w-full max-w-md mx-auto bg-gradient-to-r from-primary to-accent"
          >
            Continue to Dice <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    );
  };

  const DiceScreen = () => {
    const dice1Values = [...finalThreeValues, 'Personal Growth', 'Marriage', 'Community'];
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Dices className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Explore Your Values</h2>
            <p className="text-muted-foreground">
              Roll the dice to explore your values in different contexts
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">Value</p>
              <div className={`min-h-20 flex items-center justify-center ${isRolling ? 'animate-dice-roll' : ''}`}>
                <p className="font-semibold text-lg">
                  {dice1Result || '?'}
                </p>
              </div>
            </div>
            
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <p className="text-sm text-muted-foreground mb-2">Context</p>
              <div className={`min-h-20 flex items-center justify-center ${isRolling ? 'animate-dice-roll' : ''}`}>
                <p className="font-semibold text-lg">
                  {dice2Result || '?'}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={rollDice}
            disabled={isRolling}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            <Dices className="mr-2 h-5 w-5" />
            Roll Dice
          </Button>

          <div className="bg-muted rounded-xl p-4">
            <h3 className="font-semibold mb-2 text-sm">Your Core Values:</h3>
            <ul className="space-y-1 text-sm">
              {finalThreeValues.map((value, index) => (
                <li key={index} className="flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-primary" />
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {stage === 'welcome' && <WelcomeScreen />}
      {stage === 'initial-comparison' && <InitialComparisonScreen />}
      {stage === 'context-refinement' && <ContextRefinementScreen />}
      {stage === 'context-top-three' && <ContextTopThreeScreen />}
      {stage === 'final-three' && <FinalThreeScreen />}
      {stage === 'dice' && <DiceScreen />}
    </div>
  );
};

export default Index;
