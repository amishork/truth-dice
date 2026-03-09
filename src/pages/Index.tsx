import React, { useState, useEffect } from 'react';
import { ChevronRight, Dices, Heart, ExternalLink, PenTool } from 'lucide-react';
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
    <div className="flex items-center gap-4 my-8 w-full max-w-md mx-auto">
      <div className="flex-1 h-px bg-foreground/12" />
      <div className="w-2 h-2 border border-foreground/20 rotate-45" />
      <div className="flex-1 h-px bg-foreground/12" />
    </div>
  );

  const WelcomeScreen = () => (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 cross-hatch opacity-8 rotate-12 pointer-events-none" />
        <div className="absolute bottom-40 right-16 w-20 h-20 cross-hatch opacity-6 -rotate-12 pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 cross-hatch opacity-4 rotate-45 pointer-events-none" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
        <div className="max-w-2xl w-full text-center space-y-12 animate-fade-in">
          
          {/* Brand Identity */}
          <div className="space-y-8">
            <div className="w-24 h-24 mx-auto sketch-card flex items-center justify-center animate-float">
              <div className="absolute inset-0 border-2 border-foreground/8 rotate-45 scale-75" />
              <div className="absolute top-0 right-0 w-10 h-10 cross-hatch opacity-15 pointer-events-none" />
              <PenTool className="w-8 h-8 text-primary/60" />
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl title-section text-foreground leading-none tracking-tight">
                Words<br />
                <span className="ink-red">Incarnate</span>
              </h1>
              
              {/* Core Brand Values */}
              <div className="flex items-center justify-center space-x-4 text-sm font-mono tracking-widest uppercase text-muted-foreground">
                <span className="relative">
                  Connection
                  <div className="absolute -bottom-1 left-0 w-full h-px bg-primary/30" />
                </span>
                <span className="text-foreground/20">•</span>
                <span className="relative">
                  Delight
                  <div className="absolute -bottom-1 left-0 w-full h-px bg-primary/30" />
                </span>
                <span className="text-foreground/20">•</span>
                <span className="relative">
                  Belonging
                  <div className="absolute -bottom-1 left-0 w-full h-px bg-primary/30" />
                </span>
              </div>
              
              <p className="text-lg text-muted-foreground font-serif italic leading-relaxed max-w-lg mx-auto">
                Transform your deepest values from abstract concepts into living principles that guide your most important decisions
              </p>
            </div>
          </div>
          
          {/* Process Overview - Reimagined */}
          <div className="sketch-card p-8 text-left overflow-visible relative">
            <div className="absolute -top-3 left-6 bg-background px-3">
              <span className="label-technical">Values Discovery Journey</span>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 cross-hatch opacity-12 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-12 h-12 cross-hatch opacity-8 pointer-events-none" />
            
            <div className="grid md:grid-cols-2 gap-6 mt-2">
              {[
                { step: '01', title: 'Resonance Filter', desc: 'Does this value speak to your heart?' },
                { step: '02', title: 'Truth Assessment', desc: 'Is this true about you or aspirational?' },
                { step: '03', title: 'Legacy Choice', desc: 'What would you want said at your funeral?' },
                { step: '04', title: 'Statistical Review', desc: 'See which values won the most battles' },
                { step: '05', title: 'Final Selection', desc: 'Choose your definitive 6 core values' },
                { step: '06', title: 'Living Exploration', desc: 'Roll dice & discover with AI coaching' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-8 h-8 border-2 border-foreground/20 flex items-center justify-center flex-shrink-0 transition-all group-hover:border-primary/40 group-hover:bg-primary/5">
                    <span className="text-xs font-mono text-foreground/60 group-hover:text-primary/80">{item.step}</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-6">
            <button 
              onClick={() => setStage('section1')} 
              className="w-full max-w-sm mx-auto h-16 btn-sketch-primary text-lg flex items-center justify-center gap-3 group"
            >
              <span>Begin Your Journey</span>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase">
              ~5 minutes • 194 values • 6 final selections
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, subtitle, current, total }: { title: string; subtitle?: string; current: number; total: number }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl title-section text-foreground">{title}</h2>
        <span className="label-technical">
          {current} / {total}
        </span>
      </div>
      {subtitle && <p className="text-sm text-muted-foreground mb-3 font-serif italic">{subtitle}</p>}
      <div className="h-px bg-foreground/10 relative">
        <div 
          className="h-[2px] bg-primary absolute top-0 left-0 transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
        {/* Tick mark at progress point */}
        <div 
          className="absolute -top-1.5 w-px h-3 bg-primary transition-all duration-300"
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
          <h2 className="text-2xl title-section text-foreground mb-2">Your Top Values</h2>
          <p className="text-muted-foreground text-sm font-sans">
            These values won the most battles. The number shows how many times each was selected.
          </p>
        </div>
        
        <div className="space-y-0 max-w-md mx-auto w-full flex-1 sketch-card overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 cross-hatch opacity-12 pointer-events-none" />
          {sortedValues.map((value, index) => (
            <div
              key={index}
              className="border-b border-foreground/6 py-3 px-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="label-technical w-5">{String(index + 1).padStart(2, '0')}</span>
                <span className="font-serif text-foreground">{value}</span>
              </div>
              <span className="ink-red font-mono text-xs font-medium sketch-card px-2 py-0.5">
                {selectionCounts[value] || 0}
              </span>
            </div>
          ))}
        </div>
        
        <Divider />

        <button onClick={() => setStage('final')} className="w-full max-w-md mx-auto h-14 btn-sketch-primary flex items-center justify-center gap-2">
          Continue to Final Selection <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const FinalScreen = () => {
    const allWinners = [...section3Winners, ...section3RunoffWinners];
    
    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="mb-8 max-w-md mx-auto w-full">
          <h2 className="text-2xl title-section text-foreground mb-3">Your Final 6 Values</h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-serif italic">
            "At your funeral, if people only described you and what your life contributed to the world using 6 of these core values, which would you hope that they used?"
          </p>
          <div className="mt-5">
            <div className="flex items-center justify-between label-technical mb-2">
              <span>{finalSixValues.length} of 6 selected</span>
              <span>{6 - finalSixValues.length} remaining</span>
            </div>
            <div className="h-px bg-foreground/10 relative">
              <div 
                className="h-[2px] bg-primary absolute top-0 left-0 transition-all duration-300"
                style={{ width: `${(finalSixValues.length / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-0 max-w-md mx-auto w-full flex-1 sketch-card overflow-hidden">
          <div className="absolute top-0 right-0 w-14 h-14 cross-hatch opacity-12 pointer-events-none" />
          {allWinners.map((value, index) => {
            const isSelected = finalSixValues.includes(value);
            return (
              <button
                key={index}
                onClick={() => handleFinalValueToggle(value)}
                className={`p-4 text-left font-serif transition-all duration-150 border-b border-foreground/6 ${
                  isSelected
                    ? 'bg-primary/5 text-foreground border-l-[3px] border-l-primary'
                    : 'bg-transparent text-foreground hover:bg-muted/20'
                } ${!isSelected && finalSixValues.length >= 6 ? 'opacity-25 cursor-not-allowed' : ''}`}
                disabled={!isSelected && finalSixValues.length >= 6}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all rounded-sm ${
                    isSelected ? 'border-primary bg-primary' : 'border-foreground/20'
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
            <button onClick={() => setStage('dice')} className="w-full max-w-md mx-auto h-14 btn-sketch-primary flex items-center justify-center gap-2">
              Continue to Dice <ChevronRight className="h-4 w-4" />
            </button>
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
              <div className="w-16 h-16 mx-auto sketch-card flex items-center justify-center animate-float">
                <div className="absolute inset-0 border border-foreground/6 rotate-45 scale-75" />
                <div className="absolute top-0 right-0 w-6 h-6 cross-hatch opacity-20 pointer-events-none" />
                <Dices className="w-6 h-6 text-foreground/50" />
              </div>
              <h2 className="text-2xl title-section text-foreground">Explore Your Values</h2>
              <p className="text-muted-foreground text-sm font-sans">
                Roll the dice to explore your values in different contexts
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="sketch-card p-6 text-center overflow-visible">
                <div className="absolute -top-2.5 left-3 bg-background px-1.5">
                  <p className="label-technical">Value</p>
                </div>
                <div className="absolute top-0 right-0 w-8 h-8 cross-hatch opacity-15 pointer-events-none" />
                <div className={`min-h-20 flex items-center justify-center ${isRolling ? 'animate-dice-roll' : ''}`}>
                  <p className="font-serif font-medium text-lg text-foreground">
                    {dice1Result || '?'}
                  </p>
                </div>
              </div>
              
              <div className="sketch-card p-6 text-center overflow-visible">
                <div className="absolute -top-2.5 left-3 bg-background px-1.5">
                  <p className="label-technical">Context</p>
                </div>
                <div className="absolute bottom-0 left-0 w-8 h-8 cross-hatch opacity-15 pointer-events-none" />
                <div className={`min-h-20 flex items-center justify-center ${isRolling ? 'animate-dice-roll' : ''}`}>
                  <p className="font-serif font-medium text-lg text-foreground">
                    {dice2Result || '?'}
                  </p>
                </div>
              </div>
            </div>

            <button onClick={rollDice} disabled={isRolling} className="w-full h-14 btn-sketch-primary flex items-center justify-center gap-2 disabled:opacity-50">
              <Dices className="h-4 w-4" />
              Roll Dice
            </button>

            <div className="sketch-card p-5 overflow-visible">
              <div className="absolute -top-2.5 left-3 bg-background px-1.5">
                <span className="label-technical">Your Core Values</span>
              </div>
              <div className="absolute top-0 right-0 w-10 h-10 cross-hatch opacity-12 pointer-events-none" />
              <ul className="space-y-2.5 mt-1">
                {finalSixValues.map((value, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-foreground">
                    <Heart className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="font-serif">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Divider />

            <div className="space-y-4">
              <h3 className="title-section text-lg text-center text-foreground">Transform Your Life</h3>
              
              <a href="#" className="block sketch-card p-5 hover:border-primary/50 transition-all group overflow-visible">
                <div className="absolute top-0 right-0 w-10 h-10 cross-hatch opacity-10 pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-serif text-foreground block text-sm">Define Your Personal Values Workshop</span>
                    <span className="text-[0.6rem] text-muted-foreground block font-sans">
                      Deep dive into understanding and living your values
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
                </div>
              </a>

              <a href="#" className="block sketch-card p-5 hover:border-primary/50 transition-all group overflow-visible">
                <div className="absolute bottom-0 left-0 w-10 h-10 cross-hatch opacity-10 pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-serif text-foreground block text-sm">Family Foundations Journey</span>
                    <span className="text-[0.6rem] text-muted-foreground block font-sans">
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
        <div className="lg:w-1/2 w-full border-t lg:border-t-0 lg:border-l border-foreground/12 flex flex-col min-h-[400px] lg:min-h-0 lg:max-h-screen">
          <ValuesChat rolledValue={dice1Result} rolledContext={dice2Result} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative">
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
