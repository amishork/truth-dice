import React, { useState, useEffect } from 'react';
import { ChevronRight, Dices, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ValueCard } from '@/components/ValueCard';
import { ValuePair } from '@/components/ValuePair';

const CORE_VALUES = [
  'Affection (love and caring)', 'Caring', 'Dependability', 'Forgiveness', 
  'Friendship', 'Fun', 'Giving', 'Gratitude', 'Growth', 'Honesty', 'Joy', 
  'Kindness', 'Loyalty', 'Open and Honest (i.e. being around people who are)', 
  'Patience', 'Purpose', 'Trustworthiness', 'Adding Value', 'Ethical Practice', 
  'Humor', 'Learning', 'Personal Growth & Development (living up to the fullest potential)', 
  'Religion', 'Truth', 'Meaningful Work', 'Wisdom', 'Family', 'Having a Family', 
  'Beauty', 'Discernment', 'Charity', 'Close Relationships', 'Community', 
  'Knowledge', 'Quality Relationships', 'Reliability', 'Chivalry', 'Considerate', 
  'Courage', 'Happiness', 'Life', 'Perseverance', 'Communication', 'Compassion', 
  'Cheerfulness', 'Clarity', 'Sharing', 'Togetherness', 'Authenticity', 
  'Excellence', 'Energy', 'Leadership', 'Confidence', 'God', 'Love', 'Nurturing', 
  'Tenderness', 'Trust', 'Humility', 'Team/Teamwork', 'Awareness', 'Creativity', 
  'Health', 'Intention', 'Value', 'Coaching', 'Fairness', 'Honor', 'Integrity', 
  'Justice', 'Nature', 'Quality', 'Respect', 'Responsibility and accountability', 
  'Contribution', 'Achievement/Drive', 'Helping Other People', 'Self-determinism', 
  'Self-Respect', 'Companionship', 'Conscientiousness', 'Conviction', 'Cooperation', 
  'Courteousness', 'Discovery', 'Helping Society', 'Making a difference', 
  'Public Service', 'Spontaneity', 'Adaptability', 'Commitment', 'Presence', 
  'Unity', 'Connection', 'Playfulness', 'Involvement', 'Music', 
  'Order (tranquility, stability, conformity)', 'Security', 'Simplicity', 
  'Excitement', 'Inner Harmony', 'Attractiveness', 'Competence', 'Intimacy', 
  'Passion', 'Vulnerability', 'Aesthetic', 'Certainty', 'Economic Security', 
  'Empathy', 'Enthusiasm', 'Freedom', 'Independence', 'Travel', 'Vigor', 
  'Advancement and Promotion', 'Adventure', 'Affinity', 'Aliveness', 'Arts', 
  'Articulate', 'Bliss', 'Challenging Problems', 'Change and Variety', 'Charisma', 
  'Competition', 'Congruence', 'Decisiveness', 'Democracy', 'Ecological Awareness', 
  'Effectiveness', 'Efficiency', 'Endurance', 'Environment', 'Equality', 
  'Expertise', 'Expression', 'Fame', 'Fast Living', 'Fast-Paced Work', 
  'Financial Gain', 'Flexibility', 'Focus', 'Heart', 'Inclusive', 
  'Influencing Others', 'Inspiration', 'Intellectual Status', 'Intelligence', 
  'Job Tranquility', 'Leverage', 'Location', 'Market Position', 'Mentorship', 
  'Meditation', 'Merit', 'Money/Making Money', 'Openness', 'Partnership', 'Peace', 
  'Perception', 'Physical Challenge', 'Pleasure', 'Power and Authority', 'Privacy', 
  'Probability', 'Productivity', 'Purity', 'Rational', 'Receptivity', 
  'Recognition (respect from others, status)', 'Reputation', 'Resolution', 
  'Resolve', 'Resourcefulness', 'Sensitivity', 'Sensuality', 'Serenity', 
  'Sophistication', 'Soul', 'Spirit', 'Spiritual', 'Stability', 'Strength', 
  'Status', 'Success', 'Supervising Others', 'Synergy', 'Technology', 
  'Time Freedom', 'Vision', 'Vitality', 'Wealth'
];

const DICE_CONTEXTS = ['hope', 'fear', 'person', 'place', 'physical object', 'experience'];

const Index = () => {
  const [stage, setStage] = useState<'welcome' | 'section1' | 'section2' | 'section3' | 'section3-runoff' | 'section4' | 'final' | 'dice'>('welcome');
  
  // Section 1: Does it resonate?
  const [currentValueIndex, setCurrentValueIndex] = useState(0);
  const [section1Selections, setSection1Selections] = useState<string[]>([]);
  
  // Section 2: True about me or aspire to?
  const [section2Index, setSection2Index] = useState(0);
  const [section2Selections, setSection2Selections] = useState<string[]>([]);
  
  // Section 3: Pair battles
  const [section3Pairs, setSection3Pairs] = useState<[string, string][]>([]);
  const [section3PairIndex, setSection3PairIndex] = useState(0);
  const [section3Winners, setSection3Winners] = useState<string[]>([]);
  const [section3Losers, setSection3Losers] = useState<string[]>([]);
  
  // Section 3 Runoff
  const [section3RunoffPairs, setSection3RunoffPairs] = useState<[string, string][]>([]);
  const [section3RunoffIndex, setSection3RunoffIndex] = useState(0);
  const [section3RunoffWinners, setSection3RunoffWinners] = useState<string[]>([]);
  
  // Section 4 & Final
  const [selectionCounts, setSelectionCounts] = useState<Record<string, number>>({});
  const [finalSixValues, setFinalSixValues] = useState<string[]>([]);
  
  // Dice
  const [dice1Result, setDice1Result] = useState<string>('');
  const [dice2Result, setDice2Result] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);

  // Generate section 3 pairs when entering stage
  useEffect(() => {
    if (stage === 'section3' && section3Pairs.length === 0 && section2Selections.length > 0) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < section2Selections.length; i += 2) {
        if (i + 1 < section2Selections.length) {
          pairs.push([section2Selections[i], section2Selections[i + 1]]);
        }
      }
      setSection3Pairs(pairs);
    }
  }, [stage, section2Selections]);

  // Generate runoff pairs from losers
  useEffect(() => {
    if (stage === 'section3-runoff' && section3RunoffPairs.length === 0 && section3Losers.length > 0) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < section3Losers.length; i += 2) {
        if (i + 1 < section3Losers.length) {
          pairs.push([section3Losers[i], section3Losers[i + 1]]);
        }
      }
      setSection3RunoffPairs(pairs);
    }
  }, [stage, section3Losers]);

  // Track selection counts
  const incrementCount = (value: string) => {
    setSelectionCounts(prev => ({
      ...prev,
      [value]: (prev[value] || 0) + 1
    }));
  };

  // Section 1 handlers
  const handleSection1Right = () => {
    const value = CORE_VALUES[currentValueIndex];
    setSection1Selections(prev => [...prev, value]);
    incrementCount(value);
    
    if (currentValueIndex < CORE_VALUES.length - 1) {
      setCurrentValueIndex(currentValueIndex + 1);
    } else {
      setStage('section2');
    }
  };

  const handleSection1Left = () => {
    if (currentValueIndex < CORE_VALUES.length - 1) {
      setCurrentValueIndex(currentValueIndex + 1);
    } else {
      setStage('section2');
    }
  };

  // Section 2 handlers
  const handleSection2Right = () => {
    const value = section1Selections[section2Index];
    setSection2Selections(prev => [...prev, value]);
    incrementCount(value);
    
    if (section2Index < section1Selections.length - 1) {
      setSection2Index(section2Index + 1);
    } else {
      setStage('section3');
    }
  };

  const handleSection2Left = () => {
    if (section2Index < section1Selections.length - 1) {
      setSection2Index(section2Index + 1);
    } else {
      setStage('section3');
    }
  };

  // Section 3 handlers
  const handleSection3Selection = (value: string) => {
    const currentPair = section3Pairs[section3PairIndex];
    const loser = currentPair[0] === value ? currentPair[1] : currentPair[0];
    
    setSection3Winners(prev => [...prev, value]);
    setSection3Losers(prev => [...prev, loser]);
    incrementCount(value);
    
    if (section3PairIndex < section3Pairs.length - 1) {
      setSection3PairIndex(section3PairIndex + 1);
    } else {
      setStage('section3-runoff');
    }
  };

  // Section 3 Runoff handlers
  const handleRunoffSelection = (value: string) => {
    setSection3RunoffWinners(prev => [...prev, value]);
    incrementCount(value);
    
    if (section3RunoffIndex < section3RunoffPairs.length - 1) {
      setSection3RunoffIndex(section3RunoffIndex + 1);
    } else {
      setStage('section4');
    }
  };

  const handleFinalValueToggle = (value: string) => {
    if (finalSixValues.includes(value)) {
      setFinalSixValues(finalSixValues.filter(v => v !== value));
    } else if (finalSixValues.length < 6) {
      setFinalSixValues([...finalSixValues, value]);
    }
  };

  const rollDice = () => {
    setIsRolling(true);
    const randomDice1 = finalSixValues[Math.floor(Math.random() * finalSixValues.length)];
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
          A guided journey to identify the 6 values that define who you are
        </p>
        <div className="bg-card rounded-2xl p-6 space-y-3 text-left shadow-lg">
          <h3 className="font-semibold text-card-foreground">Your Journey:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">1.</span>
              <span>Swipe through values - does it resonate?</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">2.</span>
              <span>Filter values - is it true about you or do you aspire to it?</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">3.</span>
              <span>Choose values you'd want mentioned at your funeral</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">4.</span>
              <span>Review your top values with selection statistics</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">5.</span>
              <span>Select your final 6 core values</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">6.</span>
              <span>Explore with digital dice and discover workshops</span>
            </li>
          </ol>
        </div>
        <Button 
          onClick={() => setStage('section1')}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          Begin Your Journey
        </Button>
      </div>
    </div>
  );

  const Section1Screen = () => {
    const value = CORE_VALUES[currentValueIndex];
    const progress = ((currentValueIndex + 1) / CORE_VALUES.length) * 100;

    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Section 1: Does it Resonate?</h2>
            <span className="text-sm text-muted-foreground">
              {currentValueIndex + 1} / {CORE_VALUES.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <ValueCard
            value={value}
            onSwipeLeft={handleSection1Left}
            onSwipeRight={handleSection1Right}
            leftLabel="No"
            rightLabel="Resonates"
          />
        </div>
      </div>
    );
  };

  const Section2Screen = () => {
    if (section2Index >= section1Selections.length) return null;
    const value = section1Selections[section2Index];
    const progress = ((section2Index + 1) / section1Selections.length) * 100;

    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Section 2: True or Aspire?</h2>
            <span className="text-sm text-muted-foreground">
              {section2Index + 1} / {section1Selections.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <ValueCard
            value={value}
            onSwipeLeft={handleSection2Left}
            onSwipeRight={handleSection2Right}
            leftLabel="Admire in Others"
            rightLabel="True/Aspire"
            description="Is this true about you or something you aspire to?"
          />
        </div>
      </div>
    );
  };

  const Section3Screen = () => {
    if (!section3Pairs[section3PairIndex]) return null;
    const [value1, value2] = section3Pairs[section3PairIndex];
    const progress = ((section3PairIndex + 1) / section3Pairs.length) * 100;

    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Section 3: Funeral Values</h2>
            <span className="text-sm text-muted-foreground">
              {section3PairIndex + 1} / {section3Pairs.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <ValuePair
            value1={value1}
            value2={value2}
            onSelect={handleSection3Selection}
            title="Which would you rather people describe you with at your funeral?"
          />
        </div>
      </div>
    );
  };

  const Section3RunoffScreen = () => {
    if (!section3RunoffPairs[section3RunoffIndex]) return null;
    const [value1, value2] = section3RunoffPairs[section3RunoffIndex];
    const progress = ((section3RunoffIndex + 1) / section3RunoffPairs.length) * 100;

    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Section 3: Runoff Round</h2>
            <span className="text-sm text-muted-foreground">
              {section3RunoffIndex + 1} / {section3RunoffPairs.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <ValuePair
            value1={value1}
            value2={value2}
            onSelect={handleRunoffSelection}
            title="Which would you rather people describe you with at your funeral?"
          />
        </div>
      </div>
    );
  };

  const Section4Screen = () => {
    const allWinners = [...section3Winners, ...section3RunoffWinners];
    const sortedValues = allWinners.sort((a, b) => 
      (selectionCounts[b] || 0) - (selectionCounts[a] || 0)
    );

    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Top Values</h2>
          <p className="text-muted-foreground text-sm">
            These values won the most battles. The number shows how many times each was selected.
          </p>
        </div>
        
        <div className="space-y-3 max-w-md mx-auto w-full flex-1">
          {sortedValues.map((value, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-4 shadow-md flex items-center justify-between"
            >
              <span className="font-medium">{value}</span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold">
                {selectionCounts[value] || 0}
              </span>
            </div>
          ))}
        </div>
        
        <Button
          onClick={() => setStage('final')}
          size="lg"
          className="mt-6 w-full max-w-md mx-auto bg-gradient-to-r from-primary to-accent"
        >
          Continue to Final Selection <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  };

  const FinalScreen = () => {
    const allWinners = [...section3Winners, ...section3RunoffWinners];
    
    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Final 6 Values</h2>
          <p className="text-muted-foreground">
            At your funeral, if people only described you and what your life contributed to the world using 6 of these core values, which would you hope that they used?
          </p>
          <div className="mt-4">
            <Progress value={(finalSixValues.length / 6) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {finalSixValues.length} / 6 selected
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 max-w-md mx-auto w-full flex-1">
          {allWinners.map((value, index) => (
            <Button
              key={index}
              onClick={() => handleFinalValueToggle(value)}
              variant={finalSixValues.includes(value) ? "default" : "outline"}
              className="h-16 text-base transition-all"
            >
              {value}
            </Button>
          ))}
        </div>
        
        {finalSixValues.length === 6 && (
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
              {finalSixValues.map((value, index) => (
                <li key={index} className="flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-primary" />
                  {value}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg text-center mb-4">Transform Your Life</h3>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full h-auto py-4 flex flex-col items-start gap-2 hover:bg-primary/10"
              asChild
            >
              <a href="#" className="no-underline">
                <span className="font-semibold text-base">Define Your Personal Values Workshop</span>
                <span className="text-xs text-muted-foreground">
                  Deep dive into understanding and living your values
                </span>
                <ExternalLink className="w-4 h-4 absolute top-4 right-4" />
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-auto py-4 flex flex-col items-start gap-2 hover:bg-primary/10"
              asChild
            >
              <a href="#" className="no-underline">
                <span className="font-semibold text-base">Family Foundations Journey</span>
                <span className="text-xs text-muted-foreground">
                  3 workshops to transform your family with your values
                </span>
                <ExternalLink className="w-4 h-4 absolute top-4 right-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {stage === 'welcome' && <WelcomeScreen />}
      {stage === 'section1' && <Section1Screen />}
      {stage === 'section2' && <Section2Screen />}
      {stage === 'section3' && <Section3Screen />}
      {stage === 'section3-runoff' && <Section3RunoffScreen />}
      {stage === 'section4' && <Section4Screen />}
      {stage === 'final' && <FinalScreen />}
      {stage === 'dice' && <DiceScreen />}
    </div>
  );
};

export default Index;
