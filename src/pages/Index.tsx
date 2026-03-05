import React, { useState, useEffect } from 'react';
import { ChevronRight, Dices, Heart, ExternalLink, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ValueCard } from '@/components/ValueCard';
import { ValuePair } from '@/components/ValuePair';
import { ValuesChat } from '@/components/ValuesChat';

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
  
  const [currentValueIndex, setCurrentValueIndex] = useState(0);
  const [section1Selections, setSection1Selections] = useState<string[]>([]);
  
  const [section2Index, setSection2Index] = useState(0);
  const [section2Selections, setSection2Selections] = useState<string[]>([]);
  
  const [section3Pairs, setSection3Pairs] = useState<[string, string][]>([]);
  const [section3PairIndex, setSection3PairIndex] = useState(0);
  const [section3Winners, setSection3Winners] = useState<string[]>([]);
  const [section3Losers, setSection3Losers] = useState<string[]>([]);
  
  const [section3RunoffPairs, setSection3RunoffPairs] = useState<[string, string][]>([]);
  const [section3RunoffIndex, setSection3RunoffIndex] = useState(0);
  const [section3RunoffWinners, setSection3RunoffWinners] = useState<string[]>([]);
  
  const [selectionCounts, setSelectionCounts] = useState<Record<string, number>>({});
  const [finalSixValues, setFinalSixValues] = useState<string[]>([]);
  
  const [dice1Result, setDice1Result] = useState<string>('');
  const [dice2Result, setDice2Result] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);

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

  const incrementCount = (value: string) => {
    setSelectionCounts(prev => ({
      ...prev,
      [value]: (prev[value] || 0) + 1
    }));
  };

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
    }, 600);
  };

  // ─── Decorative divider — like a section break line in a notebook ───
  const Divider = () => (
    <div className="flex items-center gap-4 my-8 w-full max-w-md mx-auto">
      <div className="flex-1 h-px bg-foreground/20" />
      <div className="w-1.5 h-1.5 border border-foreground/30 rotate-45" />
      <div className="flex-1 h-px bg-foreground/20" />
    </div>
  );

  const WelcomeScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full text-center space-y-10">
        {/* Compass-like logo mark */}
        <div className="w-20 h-20 mx-auto border border-foreground/40 flex items-center justify-center relative">
          <div className="absolute inset-0 border border-foreground/10 rotate-45 scale-[0.7]" />
          <PenTool className="w-7 h-7 text-foreground/70" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-medium text-foreground leading-tight tracking-tight">
            Discover Your<br />Core Values
          </h1>
          <p className="text-muted-foreground text-sm font-sans leading-relaxed max-w-xs mx-auto">
            A guided journey to identify the 6 values that define who you are
          </p>
        </div>

        <div className="border border-foreground/25 p-6 space-y-4 text-left relative">
          {/* Title block like a drawing title block */}
          <div className="absolute -top-3 left-4 bg-background px-2">
            <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground">Process Overview</span>
          </div>
          <ol className="space-y-3 text-sm text-foreground/70 font-sans">
            {[
              'Swipe through values — does it resonate?',
              'Filter values — true about you, or aspire to?',
              'Choose values for your funeral tribute',
              'Review your top values with statistics',
              'Select your final 6 core values',
              'Explore with dice & discover workshops',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 border border-foreground/30 flex items-center justify-center text-[0.6rem] font-mono text-foreground/50">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <Button 
          onClick={() => setStage('section1')}
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-mono text-xs tracking-[0.15em] uppercase h-14 rounded-none"
        >
          Begin Your Journey
        </Button>
      </div>
    </div>
  );

  const SectionHeader = ({ title, subtitle, current, total }: { title: string; subtitle?: string; current: number; total: number }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-serif text-foreground">{title}</h2>
        <span className="text-[0.6rem] text-muted-foreground font-mono tracking-wider">
          {current} / {total}
        </span>
      </div>
      {subtitle && <p className="text-sm text-muted-foreground mb-3 font-serif italic">{subtitle}</p>}
      <div className="h-px bg-foreground/15 relative">
        <div 
          className="h-px bg-primary absolute top-0 left-0 transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
        {/* Tick mark at progress point */}
        <div 
          className="absolute -top-1 w-px h-2.5 bg-primary transition-all duration-300"
          style={{ left: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );

  const Section1Screen = () => {
    const value = CORE_VALUES[currentValueIndex];
    return (
      <div className="min-h-screen flex flex-col p-6">
        <SectionHeader title="Does it Resonate?" current={currentValueIndex + 1} total={CORE_VALUES.length} />
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
    return (
      <div className="min-h-screen flex flex-col p-6">
        <SectionHeader title="True or Aspire?" current={section2Index + 1} total={section1Selections.length} />
        <div className="flex-1 flex items-center justify-center">
          <ValueCard
            value={value}
            onSwipeLeft={handleSection2Left}
            onSwipeRight={handleSection2Right}
            leftLabel="Admire in Others"
            rightLabel="True / Aspire"
            description="Is this true about you, or something you aspire to?"
          />
        </div>
      </div>
    );
  };

  const Section3Screen = () => {
    if (!section3Pairs[section3PairIndex]) return null;
    const [value1, value2] = section3Pairs[section3PairIndex];
    return (
      <div className="min-h-screen flex flex-col p-6">
        <SectionHeader title="Funeral Values" current={section3PairIndex + 1} total={section3Pairs.length} />
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
    return (
      <div className="min-h-screen flex flex-col p-6">
        <SectionHeader title="Runoff Round" subtitle="Second chance for values that didn't win the first round" current={section3RunoffIndex + 1} total={section3RunoffPairs.length} />
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
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-foreground mb-2">Your Top Values</h2>
          <p className="text-muted-foreground text-sm font-sans">
            These values won the most battles. The number shows how many times each was selected.
          </p>
        </div>
        
        <div className="space-y-1 max-w-md mx-auto w-full flex-1">
          {sortedValues.map((value, index) => (
            <div
              key={index}
              className="border-b border-foreground/10 py-3 px-2 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[0.6rem] text-muted-foreground font-mono w-5">{String(index + 1).padStart(2, '0')}</span>
                <span className="font-serif text-foreground">{value}</span>
              </div>
              <span className="text-primary font-mono text-xs font-medium border border-primary/30 px-2 py-0.5">
                {selectionCounts[value] || 0}
              </span>
            </div>
          ))}
        </div>
        
        <Divider />

        <Button
          onClick={() => setStage('final')}
          size="lg"
          className="w-full max-w-md mx-auto bg-primary text-primary-foreground hover:bg-primary/80 font-mono text-xs tracking-[0.15em] uppercase h-14 rounded-none"
        >
          Continue to Final Selection <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  };

  const FinalScreen = () => {
    const allWinners = [...section3Winners, ...section3RunoffWinners];
    
    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-8 max-w-md mx-auto w-full">
          <h2 className="text-2xl font-serif text-foreground mb-3">Your Final 6 Values</h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-serif italic">
            "At your funeral, if people only described you and what your life contributed to the world using 6 of these core values, which would you hope that they used?"
          </p>
          <div className="mt-5">
            <div className="flex items-center justify-between text-[0.6rem] text-muted-foreground font-mono tracking-wider uppercase mb-2">
              <span>{finalSixValues.length} of 6 selected</span>
              <span>{6 - finalSixValues.length} remaining</span>
            </div>
            <div className="h-px bg-foreground/15 relative">
              <div 
                className="h-px bg-primary absolute top-0 left-0 transition-all duration-300"
                style={{ width: `${(finalSixValues.length / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-0 max-w-md mx-auto w-full flex-1">
          {allWinners.map((value, index) => {
            const isSelected = finalSixValues.includes(value);
            return (
              <button
                key={index}
                onClick={() => handleFinalValueToggle(value)}
                className={`p-4 text-left font-serif transition-all duration-150 border-b border-foreground/10 ${
                  isSelected
                    ? 'bg-primary/8 text-foreground border-l-2 border-l-primary'
                    : 'bg-transparent text-foreground hover:bg-muted/30'
                } ${!isSelected && finalSixValues.length >= 6 ? 'opacity-30 cursor-not-allowed' : ''}`}
                disabled={!isSelected && finalSixValues.length >= 6}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'border-primary bg-primary' : 'border-foreground/30'
                  }`}>
                    {isSelected && <span className="text-primary-foreground text-[0.5rem]">✓</span>}
                  </div>
                  <span className="text-sm">{value}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        {finalSixValues.length === 6 && (
          <>
            <Divider />
            <Button
              onClick={() => setStage('dice')}
              size="lg"
              className="w-full max-w-md mx-auto bg-primary text-primary-foreground hover:bg-primary/80 font-mono text-xs tracking-[0.15em] uppercase h-14 rounded-none"
            >
              Continue to Dice <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  };

  const DiceScreen = () => {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left column - Dice & Values */}
        <div className="lg:w-1/2 w-full flex flex-col items-center justify-start p-6 lg:p-10 lg:overflow-y-auto lg:max-h-screen">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto border border-foreground/30 flex items-center justify-center animate-float relative">
                <div className="absolute inset-0 border border-foreground/10 rotate-45 scale-75" />
                <Dices className="w-6 h-6 text-foreground/60" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">Explore Your Values</h2>
              <p className="text-muted-foreground text-sm font-sans">
                Roll the dice to explore your values in different contexts
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-foreground/30 p-6 text-center relative">
                <div className="absolute -top-2 left-3 bg-background px-1">
                  <p className="text-[0.55rem] text-muted-foreground font-mono tracking-[0.2em] uppercase">Value</p>
                </div>
                <div className={`min-h-20 flex items-center justify-center ${isRolling ? 'animate-dice-roll' : ''}`}>
                  <p className="font-serif font-medium text-lg text-foreground">
                    {dice1Result || '?'}
                  </p>
                </div>
              </div>
              
              <div className="border border-foreground/30 p-6 text-center relative">
                <div className="absolute -top-2 left-3 bg-background px-1">
                  <p className="text-[0.55rem] text-muted-foreground font-mono tracking-[0.2em] uppercase">Context</p>
                </div>
                <div className={`min-h-20 flex items-center justify-center ${isRolling ? 'animate-dice-roll' : ''}`}>
                  <p className="font-serif font-medium text-lg text-foreground">
                    {dice2Result || '?'}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={rollDice}
              disabled={isRolling}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-mono text-xs tracking-[0.15em] uppercase h-14 rounded-none"
            >
              <Dices className="mr-2 h-4 w-4" />
              Roll Dice
            </Button>

            <div className="border border-foreground/20 p-5 relative">
              <div className="absolute -top-2 left-3 bg-background px-1">
                <span className="font-mono text-[0.55rem] text-muted-foreground tracking-[0.2em] uppercase">Your Core Values</span>
              </div>
              <ul className="space-y-2 mt-1">
                {finalSixValues.map((value, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                    <span className="text-primary text-[0.6rem] font-mono">{String(index + 1).padStart(2, '0')}</span>
                    <span className="font-serif">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Divider />

            <div className="space-y-4">
              <h3 className="font-serif text-lg text-center text-foreground">Transform Your Life</h3>
              
              <a href="#" className="block border border-foreground/20 p-5 hover:border-primary/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-serif text-foreground block text-sm">Define Your Personal Values Workshop</span>
                    <span className="text-[0.65rem] text-muted-foreground block font-sans">
                      Deep dive into understanding and living your values
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
                </div>
              </a>

              <a href="#" className="block border border-foreground/20 p-5 hover:border-primary/50 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-serif text-foreground block text-sm">Family Foundations Journey</span>
                    <span className="text-[0.65rem] text-muted-foreground block font-sans">
                      3 workshops to transform your family with your values
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Right column - AI Chat */}
        <div className="lg:w-1/2 w-full border-t lg:border-t-0 lg:border-l border-foreground/15 flex flex-col min-h-[400px] lg:min-h-0 lg:max-h-screen">
          <ValuesChat rolledValue={dice1Result} rolledContext={dice2Result} />
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
