import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Dices, ExternalLink, Heart } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ValueCard } from "@/components/ValueCard";
import { ValuePair } from "@/components/ValuePair";
import { ValuesChat } from "@/components/ValuesChat";

const CORE_VALUES = [
  "Affection (love and caring)",
  "Caring",
  "Dependability",
  "Forgiveness",
  "Friendship",
  "Fun",
  "Giving",
  "Gratitude",
  "Growth",
  "Honesty",
  "Joy",
  "Kindness",
  "Loyalty",
  "Open and Honest (i.e. being around people who are)",
  "Patience",
  "Purpose",
  "Trustworthiness",
  "Adding Value",
  "Ethical Practice",
  "Humor",
  "Learning",
  "Personal Growth & Development (living up to the fullest potential)",
  "Religion",
  "Truth",
  "Meaningful Work",
  "Wisdom",
  "Family",
  "Having a Family",
  "Beauty",
  "Discernment",
  "Charity",
  "Close Relationships",
  "Community",
  "Knowledge",
  "Quality Relationships",
  "Reliability",
  "Chivalry",
  "Considerate",
  "Courage",
  "Happiness",
  "Life",
  "Perseverance",
  "Communication",
  "Compassion",
  "Cheerfulness",
  "Clarity",
  "Sharing",
  "Togetherness",
  "Authenticity",
  "Excellence",
  "Energy",
  "Leadership",
  "Confidence",
  "God",
  "Love",
  "Nurturing",
  "Tenderness",
  "Trust",
  "Humility",
  "Team/Teamwork",
  "Awareness",
  "Creativity",
  "Health",
  "Intention",
  "Value",
  "Coaching",
  "Fairness",
  "Honor",
  "Integrity",
  "Justice",
  "Nature",
  "Quality",
  "Respect",
  "Responsibility and accountability",
  "Contribution",
  "Achievement/Drive",
  "Helping Other People",
  "Self-determinism",
  "Self-Respect",
  "Companionship",
  "Conscientiousness",
  "Conviction",
  "Cooperation",
  "Courteousness",
  "Discovery",
  "Helping Society",
  "Making a difference",
  "Public Service",
  "Spontaneity",
  "Adaptability",
  "Commitment",
  "Presence",
  "Unity",
  "Connection",
  "Playfulness",
  "Involvement",
  "Music",
  "Order (tranquility, stability, conformity)",
  "Security",
  "Simplicity",
  "Excitement",
  "Inner Harmony",
  "Attractiveness",
  "Competence",
  "Intimacy",
  "Passion",
  "Vulnerability",
  "Aesthetic",
  "Certainty",
  "Economic Security",
  "Empathy",
  "Enthusiasm",
  "Freedom",
  "Independence",
  "Travel",
  "Vigor",
  "Advancement and Promotion",
  "Adventure",
  "Affinity",
  "Aliveness",
  "Arts",
  "Articulate",
  "Bliss",
  "Challenging Problems",
  "Change and Variety",
  "Charisma",
  "Competition",
  "Congruence",
  "Decisiveness",
  "Democracy",
  "Ecological Awareness",
  "Effectiveness",
  "Efficiency",
  "Endurance",
  "Environment",
  "Equality",
  "Expertise",
  "Expression",
  "Fame",
  "Fast Living",
  "Fast-Paced Work",
  "Financial Gain",
  "Flexibility",
  "Focus",
  "Heart",
  "Inclusive",
  "Influencing Others",
  "Inspiration",
  "Intellectual Status",
  "Intelligence",
  "Job Tranquility",
  "Leverage",
  "Location",
  "Market Position",
  "Mentorship",
  "Meditation",
  "Merit",
  "Money/Making Money",
  "Openness",
  "Partnership",
  "Peace",
  "Perception",
  "Physical Challenge",
  "Pleasure",
  "Power and Authority",
  "Privacy",
  "Probability",
  "Productivity",
  "Purity",
  "Rational",
  "Receptivity",
  "Recognition (respect from others, status)",
  "Reputation",
  "Resolution",
  "Resolve",
  "Resourcefulness",
  "Sensitivity",
  "Sensuality",
  "Serenity",
  "Sophistication",
  "Soul",
  "Spirit",
  "Spiritual",
  "Stability",
  "Strength",
  "Status",
  "Success",
  "Supervising Others",
  "Synergy",
  "Technology",
  "Time Freedom",
  "Vision",
  "Vitality",
  "Wealth",
];

const DICE_CONTEXTS = ["hope", "fear", "person", "place", "physical object", "experience"];

type Stage =
  | "home"
  | "section1"
  | "section2"
  | "section3"
  | "section3-runoff"
  | "section4"
  | "final"
  | "dice";

const Index = () => {
  const [stage, setStage] = useState<Stage>("home");

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

  const [dice1Result, setDice1Result] = useState<string>("");
  const [dice2Result, setDice2Result] = useState<string>("");
  const [isRolling, setIsRolling] = useState(false);

  const homeMainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Keep stage transitions predictable (nav is fixed)
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [stage]);

  useEffect(() => {
    if (stage === "section3" && section3Pairs.length === 0 && section2Selections.length > 0) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < section2Selections.length; i += 2) {
        if (i + 1 < section2Selections.length) pairs.push([section2Selections[i], section2Selections[i + 1]]);
      }
      setSection3Pairs(pairs);

      // If we don't have enough pairs to compare, skip ahead.
      if (pairs.length === 0) setStage("section4");
    }
  }, [stage, section2Selections, section3Pairs.length]);

  useEffect(() => {
    if (stage === "section3-runoff" && section3RunoffPairs.length === 0 && section3Losers.length > 0) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < section3Losers.length; i += 2) {
        if (i + 1 < section3Losers.length) pairs.push([section3Losers[i], section3Losers[i + 1]]);
      }
      setSection3RunoffPairs(pairs);

      if (pairs.length === 0) setStage("section4");
    }
  }, [stage, section3Losers, section3RunoffPairs.length]);

  const incrementCount = (value: string) => {
    setSelectionCounts((prev) => ({ ...prev, [value]: (prev[value] || 0) + 1 }));
  };

  const resetQuiz = () => {
    setCurrentValueIndex(0);
    setSection1Selections([]);
    setSection2Index(0);
    setSection2Selections([]);
    setSection3Pairs([]);
    setSection3PairIndex(0);
    setSection3Winners([]);
    setSection3Losers([]);
    setSection3RunoffPairs([]);
    setSection3RunoffIndex(0);
    setSection3RunoffWinners([]);
    setSelectionCounts({});
    setFinalSixValues([]);
    setDice1Result("");
    setDice2Result("");
    setIsRolling(false);
  };

  const startValuesDiscovery = () => {
    resetQuiz();
    setStage("section1");
  };

  const handleSection1Right = () => {
    const value = CORE_VALUES[currentValueIndex];
    setSection1Selections((prev) => [...prev, value]);
    incrementCount(value);

    if (currentValueIndex < CORE_VALUES.length - 1) setCurrentValueIndex((v) => v + 1);
    else setStage("section2");
  };

  const handleSection1Left = () => {
    if (currentValueIndex < CORE_VALUES.length - 1) setCurrentValueIndex((v) => v + 1);
    else setStage("section2");
  };

  const handleSection2Right = () => {
    const value = section1Selections[section2Index];
    if (!value) return;
    setSection2Selections((prev) => [...prev, value]);
    incrementCount(value);

    if (section2Index < section1Selections.length - 1) setSection2Index((v) => v + 1);
    else setStage("section3");
  };

  const handleSection2Left = () => {
    if (section2Index < section1Selections.length - 1) setSection2Index((v) => v + 1);
    else setStage("section3");
  };

  const handleSection3Selection = (value: string) => {
    const currentPair = section3Pairs[section3PairIndex];
    if (!currentPair) return;

    const loser = currentPair[0] === value ? currentPair[1] : currentPair[0];
    setSection3Winners((prev) => [...prev, value]);
    setSection3Losers((prev) => [...prev, loser]);
    incrementCount(value);

    if (section3PairIndex < section3Pairs.length - 1) setSection3PairIndex((v) => v + 1);
    else setStage("section3-runoff");
  };

  const handleRunoffSelection = (value: string) => {
    setSection3RunoffWinners((prev) => [...prev, value]);
    incrementCount(value);

    if (section3RunoffIndex < section3RunoffPairs.length - 1) setSection3RunoffIndex((v) => v + 1);
    else setStage("section4");
  };

  const handleFinalValueToggle = (value: string) => {
    setFinalSixValues((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= 6) return prev;
      return [...prev, value];
    });
  };

  const rollDice = () => {
    if (finalSixValues.length === 0) return;

    setIsRolling(true);
    const randomDice1 = finalSixValues[Math.floor(Math.random() * finalSixValues.length)];
    const randomDice2 = DICE_CONTEXTS[Math.floor(Math.random() * DICE_CONTEXTS.length)];

    window.setTimeout(() => {
      setDice1Result(randomDice1);
      setDice2Result(randomDice2);
      setIsRolling(false);
    }, 600);
  };

  const allWinners = useMemo(() => [...section3Winners, ...section3RunoffWinners], [section3Winners, section3RunoffWinners]);

  // ─── Decorative divider ───
  const Divider = () => (
    <div className="my-10 flex w-full max-w-md items-center gap-4 self-center">
      <div className="h-px flex-1 bg-border" />
      <div className="h-2 w-2 rotate-45 border border-border" />
      <div className="h-px flex-1 bg-border" />
    </div>
  );

  const QuizTop = ({ title, current, total, subtitle }: { title: string; current: number; total: number; subtitle?: string }) => (
    <div className="mx-auto w-full max-w-3xl px-6 pt-24">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => setStage("home")}>
          Home
        </Button>
        <span className="label-technical">
          {current} / {Math.max(total, 1)}
        </span>
      </div>

      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>

      {subtitle && <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>}

      <div className="relative h-px w-full bg-border">
        <div
          className="absolute left-0 top-0 h-[2px] bg-primary transition-all"
          style={{ width: `${(current / Math.max(total, 1)) * 100}%` }}
        />
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        Skip to Main Content
      </a>

      <Navigation />

      <main
        id="main"
        ref={(el) => {
          homeMainRef.current = el;
        }}
        className="pt-16"
      >
        {/* HERO */}
        <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/40" />

          <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
            <h1 className="wi-wordmark">WORDS INCARNATE</h1>
            <p className="wi-tagline">CONNECTION. DELIGHT. BELONGING.</p>
            <p className="mt-8 text-lg text-muted-foreground">Formation, strategy, and experience design</p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={startValuesDiscovery} className="wi-cta">
                Start Values Discovery
                <ChevronRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="wi-cta"
                onClick={() => {
                  const el = document.getElementById("making-values");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Learn more
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">~5 minutes • guided values discovery • 6-value takeaway</p>
          </div>
        </section>

        {/* CONTENT SECTIONS */}
        <section id="making-values" className="container mx-auto space-y-16 px-4 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold text-foreground">Making Values Incarnate</h2>
            <p className="mt-4 text-muted-foreground">Formation for Families, Schools, and Organizations</p>
            <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
              <p>
                Words Incarnate exists to help people name what they love—and build lives and cultures that embody it.
              </p>
              <p>
                In homes, classrooms, and workplaces, many of us are rich in words but poor in lived meaning. We speak
                often about values, mission, and purpose, yet struggle to see them take root in daily life.
              </p>
              <p>Words Incarnate helps close that gap—by turning values into experiences, and experiences into culture.</p>
            </div>
          </div>

          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold text-foreground">We Are Losing What Matters Most</h2>
            <p className="mt-4 text-muted-foreground">
              In a digitized and distracted world, something essential is being eroded:
            </p>
            <ul className="mt-8 space-y-3 text-foreground">
              <li>Families are together, but lack connection.</li>
              <li>Schools teach to standards, but lose delight in the process.</li>
              <li>Organizations pursue efficiency, but forget belonging.</li>
            </ul>
            <p className="mt-8 text-foreground">
              People are hungry for presence, meaning, and shared life—but often lack the tools, language, or
              structures to recover them.
            </p>
            <p className="mt-4 text-muted-foreground">
              Words Incarnate meets this cultural and spiritual hunger by helping individuals and communities make
              their values concrete, livable, and shared.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold text-foreground">How We Work</h2>
            <p className="mt-4 text-muted-foreground">Words Incarnate approaches strategy as formation.</p>
            <p className="mt-8 text-foreground leading-relaxed">
              Drawing from classical wisdom, Catholic anthropology, and lived experience, we help leaders and
              communities align belief, behavior, and daily life.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  title: "Connection",
                  desc: "practicing presence and undivided attention to your unique values",
                },
                {
                  title: "Delight",
                  desc: "restoring wonder, joy, and meaningful leisure to your routines",
                },
                {
                  title: "Belonging",
                  desc: "creating the near occasion of communion and solidarity in purpose",
                },
              ].map((x) => (
                <div key={x.title} className="rounded-lg border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground">{x.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{x.desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-10 text-foreground">
              We put our professional passion for clarity, intelligence, and expertise at the service of these core
              values—in everything we do.
            </p>
          </div>

          <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8">
            <h2 className="text-3xl font-semibold text-foreground">An Invitation</h2>
            <p className="mt-4 text-muted-foreground">Words Incarnate is not a quick fix or a branding exercise.</p>
            <p className="mt-8 text-foreground leading-relaxed">
              It is an invitation to slow down, pay attention, and build something enduring—rooted in connection,
              animated by delight, and sustained by belonging.
            </p>
            <p className="mt-4 text-foreground leading-relaxed">
              If you are ready to make your values visible again, to restore meaning to daily life, and to form
              people—not just systems—we would be honored to walk with you.
            </p>
            <div className="mt-8">
              <Button size="lg" onClick={startValuesDiscovery} className="wi-cta">
                Let's make values incarnate again
                <ChevronRight />
              </Button>
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-10">
          <div className="container mx-auto px-4">
            <p className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Words Incarnate</p>
          </div>
        </footer>
      </main>
    </div>
  );

  const Section1Screen = () => {
    const value = CORE_VALUES[currentValueIndex];

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <QuizTop title="Does it resonate?" current={currentValueIndex + 1} total={CORE_VALUES.length} />
        <div className="flex items-center justify-center px-6 pb-10">
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
    if (section2Index >= section1Selections.length) {
      return (
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="mx-auto max-w-3xl px-6 pt-24">
            <p className="text-muted-foreground">No values selected in the first pass—return and try again.</p>
            <div className="mt-6">
              <Button onClick={() => setStage("section1")}>Back</Button>
            </div>
          </div>
        </div>
      );
    }

    const value = section1Selections[section2Index];
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <QuizTop title="True or aspire?" current={section2Index + 1} total={section1Selections.length} />
        <div className="flex items-center justify-center px-6 pb-10">
          <ValueCard
            value={value}
            onSwipeLeft={handleSection2Left}
            onSwipeRight={handleSection2Right}
            leftLabel="Admire in others"
            rightLabel="True / Aspire"
            description="Is this true about you, or something you aspire to?"
          />
        </div>
      </div>
    );
  };

  const Section3Screen = () => {
    const pair = section3Pairs[section3PairIndex];
    if (!pair) return null;
    const [value1, value2] = pair;

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <QuizTop title="Legacy choice" current={section3PairIndex + 1} total={section3Pairs.length} />
        <div className="flex items-center justify-center px-6 pb-10">
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
    const pair = section3RunoffPairs[section3RunoffIndex];
    if (!pair) return null;
    const [value1, value2] = pair;

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <QuizTop
          title="Runoff round"
          subtitle="Second chance for values that didn't win the first round"
          current={section3RunoffIndex + 1}
          total={section3RunoffPairs.length}
        />
        <div className="flex items-center justify-center px-6 pb-10">
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
    const sortedValues = [...allWinners].sort((a, b) => (selectionCounts[b] || 0) - (selectionCounts[a] || 0));

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto w-full max-w-3xl px-6 pt-24">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground">Your top values</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These values won the most battles. The number shows how many times each was selected.
            </p>
          </div>

          <div className="sketch-card overflow-hidden">
            {sortedValues.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="label-technical w-6">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-foreground">{value}</span>
                </div>
                <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-foreground">
                  {selectionCounts[value] || 0}
                </span>
              </div>
            ))}
          </div>

          <Divider />

          <Button onClick={() => setStage("final")} size="lg" className="w-full">
            Continue to final selection
            <ChevronRight />
          </Button>
        </div>
      </div>
    );
  };

  const FinalScreen = () => {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto w-full max-w-3xl px-6 pt-24">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground">Your final 6 values</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              "At your funeral, if people only described you using 6 of these values, which would you hope they used?"
            </p>
            <p className="mt-4 text-xs text-muted-foreground">{finalSixValues.length} of 6 selected</p>
          </div>

          <div className="sketch-card overflow-hidden">
            {allWinners.map((value, index) => {
              const isSelected = finalSixValues.includes(value);
              const isDisabled = !isSelected && finalSixValues.length >= 6;

              return (
                <button
                  key={`${value}-${index}`}
                  onClick={() => handleFinalValueToggle(value)}
                  disabled={isDisabled}
                  className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 transition-colors ${
                    isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                  } ${isDisabled ? "opacity-40" : ""}`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                    aria-hidden
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                  <span className="text-sm text-foreground">{value}</span>
                </button>
              );
            })}
          </div>

          {finalSixValues.length === 6 && (
            <>
              <Divider />
              <Button onClick={() => setStage("dice")} size="lg" className="w-full">
                Continue to dice
                <ChevronRight />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  const DiceScreen = () => {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-20 lg:flex lg:min-h-[calc(100vh-5rem)]">
          {/* Left column */}
          <div className="w-full p-6 lg:w-1/2 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:p-10">
            <div className="mx-auto w-full max-w-md space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground">Explore your values</h2>
                <p className="mt-2 text-sm text-muted-foreground">Roll the dice to explore your values in different contexts.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="sketch-card p-6 text-center">
                  <p className="label-technical">Value</p>
                  <div className={`mt-4 min-h-16 flex items-center justify-center ${isRolling ? "animate-dice-roll" : ""}`}>
                    <p className="text-base font-medium text-foreground">{dice1Result || "?"}</p>
                  </div>
                </div>

                <div className="sketch-card p-6 text-center">
                  <p className="label-technical">Context</p>
                  <div className={`mt-4 min-h-16 flex items-center justify-center ${isRolling ? "animate-dice-roll" : ""}`}>
                    <p className="text-base font-medium text-foreground">{dice2Result || "?"}</p>
                  </div>
                </div>
              </div>

              <Button onClick={rollDice} disabled={isRolling} size="lg" className="w-full">
                <Dices />
                Roll dice
              </Button>

              <div className="sketch-card p-5">
                <p className="label-technical">Your core values</p>
                <ul className="mt-4 space-y-2.5">
                  {finalSixValues.map((value, index) => (
                    <li key={`${value}-${index}`} className="flex items-center gap-3 text-sm text-foreground">
                      <Heart className="h-4 w-4 text-primary" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Optional next steps</p>
                <a href="#" className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Define Your Personal Values Workshop</p>
                      <p className="mt-1 text-xs text-muted-foreground">Deep dive into understanding and living your values</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </a>
                <a href="#" className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Family Foundations Journey</p>
                      <p className="mt-1 text-xs text-muted-foreground">3 workshops to transform your family with your values</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="w-full border-t border-border lg:w-1/2 lg:border-t-0 lg:border-l">
            <div className="min-h-[520px] lg:min-h-[calc(100vh-5rem)]">
              <ValuesChat rolledValue={dice1Result} rolledContext={dice2Result} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {stage === "home" && <HomeScreen />}
      {stage === "section1" && <Section1Screen />}
      {stage === "section2" && <Section2Screen />}
      {stage === "section3" && <Section3Screen />}
      {stage === "section3-runoff" && <Section3RunoffScreen />}
      {stage === "section4" && <Section4Screen />}
      {stage === "final" && <FinalScreen />}
      {stage === "dice" && <DiceScreen />}
    </div>
  );
};

export default Index;
