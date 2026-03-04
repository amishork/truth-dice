import React, { useState, useEffect } from 'react';
import { ChevronRight, Dices, Heart, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

  // ─── Decorative divider ───
  const Divider = () => (
    <div className="flex items-center gap-4 my-6 w-full max-w-md mx-auto">
      <div className="flex-1 h-px bg-border" />
      <Sparkles className="w-3 h-3 text-primary/40" />
      <div className="flex-1 h-px bg-border" />
    </div>
  );

  const WelcomeScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-warm-gradient animate-fade-in">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo mark */}
        <div className="w-20 h-20 mx-auto rounded-full border border-primary/30 flex items-center justify-center glow-gold">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-serif font-bold text-gold-gradient leading-tight">
            Discover Your<br />Core Values
          </h1>
          <p className="text-muted-foreground text-base">
            A guided journey to identify the 6 values that define who you are
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-left">
          <h3 className="font-serif text-sm text-primary tracking-wider uppercase">Your Journey</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[
              'Swipe through values — does it resonate?',
              'Filter values — true about you, or aspire to?',
              'Choose values for your funeral tribute',
              'Review your top values with statistics',
              'Select your final 6 core values',
              'Explore with dice & discover workshops',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border border-primary/30 flex items-center justify-center text-xs text-primary font-medium">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <Button 
          onClick={() => setStage('section1')}
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-serif text-base tracking-wide h-14"
        >
          Begin Your Journey
        </Button>
      </div>
    </div>
  );

  const SectionHeader = ({ title, subtitle, current, total }: { title: string; subtitle?: string; current: number; total: number }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-serif text-gold-gradient">{title}</h2>
        <span className="text-xs text-muted-foreground font-mono">
          {current} / {total}
        </span>
      </div>
      {subtitle && <p className="text-sm text-muted-foreground mb-3">{subtitle}</p>}
      <div className="h-1 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );

  const Section1Screen = () => {
    const value = CORE_VALUES[currentValueIndex];
    return (
      <div className="min-h-screen flex flex-col p-6 bg-warm-gradient">
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
      <div className="min-h-screen flex flex-col p-6 bg-warm-gradient">
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
      <div className="min-h-screen flex flex-col p-6 bg-warm-gradient">
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
      <div className="min-h-screen flex flex-col p-6 bg-warm-gradient">
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
      <div className="min-h-screen flex flex-col p-6 bg-warm-gradient">
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-gold-gradient mb-2">Your Top Values</h2>
          <p className="text-muted-foreground text-sm">
            These values won the most battles. The number shows how many times each was selected.
          </p>
        </div>
        
        <div className="space-y-2 max-w-md mx-auto w-full flex-1">
          {sortedValues.map((value, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono w-5">{index + 1}</span>
                <span className="font-serif text-foreground">{value}</span>
              </div>
              <span className="bg-primary/15 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-mono font-bold">
                {selectionCounts[value] || 0}
              </span>
            </div>
          ))}
        </div>
        
        <Divider />

        <Button
          onClick={() => setStage('final')}
          size="lg"
          className="w-full max-w-md mx-auto bg-primary text-primary-foreground hover:bg-primary/90 font-serif h-14"
        >
          Continue to Final Selection <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  };

  const FinalScreen = () => {
    const allWinners = [...section3Winners, ...section3RunoffWinners];
    
    return (
      <div className="min-h-screen flex flex-col p-6 bg-warm-gradient">
        <div className="mb-8 max-w-md mx-auto w-full">
          <h2 className="text-2xl font-serif text-gold-gradient mb-3">Your Final 6 Values</h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-serif italic">
            "At your funeral, if people only described you and what your life contributed to the world using 6 of these core values, which would you hope that they used?"
          </p>
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{finalSixValues.length} of 6 selected</span>
              <span>{6 - finalSixValues.length} remaining</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(finalSixValues.length / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 max-w-md mx-auto w-full flex-1">
          {allWinners.map((value, index) => {
            const isSelected = finalSixValues.includes(value);
            return (
              <button
                key={index}
                onClick={() => handleFinalValueToggle(value)}
                className={`p-4 rounded-xl text-left font-serif transition-all duration-200 border ${
                  isSelected
                    ? 'bg-primary/15 border-primary/40 text-foreground glow-gold'
                    : 'bg-card border-border text-foreground hover:border-primary/20'
                } ${!isSelected && finalSixValues.length >= 6 ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={!isSelected && finalSixValues.length >= 6}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <Heart className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span>{value}</span>
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
              className="w-full max-w-md mx-auto bg-primary text-primary-foreground hover:bg-primary/90 font-serif h-14"
            >
              Continue to Dice <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    );
  };

  const DiceScreen = () => {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-warm-gradient">
        {/* Left column - Dice & Values */}
        <div className="lg:w-1/2 w-full flex flex-col items-center justify-start p-6 lg:p-10 lg:overflow-y-auto lg:max-h-screen">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full border border-primary/30 flex items-center justify-center glow-gold animate-float">
                <Dices className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-gold-gradient">Explore Your Values</h2>
              <p className="text-muted-foreground text-sm">
                Roll the dice to explore your values in different contexts
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Value</p>
                <div className={`min-h-20 flex items-center justify-center ${isRolling ? 'animate-dice-roll' : ''}`}>
                  <p className="font-serif font-semibold text-lg text-gold-gradient">
                    {dice1Result || '?'}
                  </p>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Context</p>
                <div className={`min-h-20 flex items-center justify-center ${isRolling ? 'animate-dice-roll' : ''}`}>
                  <p className="font-serif font-semibold text-lg text-gold-gradient">
                    {dice2Result || '?'}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={rollDice}
              disabled={isRolling}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-serif h-14"
            >
              <Dices className="mr-2 h-5 w-5" />
              Roll Dice
            </Button>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-serif text-sm text-primary mb-3 tracking-wider uppercase">Your Core Values</h3>
              <ul className="space-y-2">
                {finalSixValues.map((value, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                    <Heart className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="font-serif">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Divider />

            <div className="space-y-4">
              <h3 className="font-serif text-lg text-center text-gold-gradient">Transform Your Life</h3>
              
              <a href="#" className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-serif text-foreground block">Define Your Personal Values Workshop</span>
                    <span className="text-xs text-muted-foreground block">
                      Deep dive into understanding and living your values
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
                </div>
              </a>

              <a href="#" className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-serif text-foreground block">Family Foundations Journey</span>
                    <span className="text-xs text-muted-foreground block">
                      3 workshops to transform your family with your values
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Right column - AI Chat */}
        <div className="lg:w-1/2 w-full border-t lg:border-t-0 lg:border-l border-border bg-card/30 flex flex-col min-h-[400px] lg:min-h-0 lg:max-h-screen">
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