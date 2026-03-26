import React, { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { ChevronRight, Dices, Zap, Image } from "lucide-react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { ValueCard } from "@/components/ValueCard";
import { ValuePair } from "@/components/ValuePair";
import { ValuesChat } from "@/components/ValuesChat";
import CommitmentEscalation from "@/components/CommitmentEscalation";
import SpeedRound from "@/components/SpeedRound";
import DiceProductPopup from "@/components/DiceProductPopup";
import ShareableValuesCard from "@/components/ShareableValuesCard";
import TheSorting from "@/components/TheSorting";
import GratitudeMoment from "@/components/GratitudeMoment";
import QuizMilestone from "@/components/QuizMilestone";
import { useDynamicTabTitle, useAnimatedFavicon } from "@/hooks/useDynamicTabTitle";
import { useAmbientMood } from "@/hooks/useAmbientMood";
import { useCommitmentTracker } from "@/hooks/useCommitmentTracker";
import { CORE_VALUES, DICE_CONTEXTS } from "@/data/values";

const ValuesConstellation = lazy(() => import("@/components/ValuesConstellation"));
const ValuesPosterGenerator = lazy(() => import("@/components/ValuesPosterGenerator"));

type Stage =
  | "sorting"
  | "section1"
  | "section2"
  | "section3"
  | "section3-runoff"
  | "section4"
  | "gratitude"
  | "final"
  | "dice";

const STORAGE_KEY = "wi-quiz-progress";

interface QuizState {
  stage: Stage;
  currentValueIndex: number;
  section1Selections: string[];
  section2Index: number;
  section2Selections: string[];
  section3PairIndex: number;
  section3Winners: string[];
  section3Losers: string[];
  section3RunoffIndex: number;
  section3RunoffWinners: string[];
  selectionCounts: Record<string, number>;
  finalSixValues: string[];
}

function loadQuizState(): QuizState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveQuizState(state: QuizState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function clearQuizState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

const Quiz = () => {
  const saved = useRef(loadQuizState());

  const [stage, setStage] = useState<Stage>(saved.current?.stage ?? "sorting");
  const [currentValueIndex, setCurrentValueIndex] = useState(saved.current?.currentValueIndex ?? 0);
  const [section1Selections, setSection1Selections] = useState<string[]>(saved.current?.section1Selections ?? []);
  const [section2Index, setSection2Index] = useState(saved.current?.section2Index ?? 0);
  const [section2Selections, setSection2Selections] = useState<string[]>(saved.current?.section2Selections ?? []);

  const [section3Pairs, setSection3Pairs] = useState<[string, string][]>([]);
  const [section3PairIndex, setSection3PairIndex] = useState(saved.current?.section3PairIndex ?? 0);
  const [section3Winners, setSection3Winners] = useState<string[]>(saved.current?.section3Winners ?? []);
  const [section3Losers, setSection3Losers] = useState<string[]>(saved.current?.section3Losers ?? []);

  const [section3RunoffPairs, setSection3RunoffPairs] = useState<[string, string][]>([]);
  const [section3RunoffIndex, setSection3RunoffIndex] = useState(saved.current?.section3RunoffIndex ?? 0);
  const [section3RunoffWinners, setSection3RunoffWinners] = useState<string[]>(saved.current?.section3RunoffWinners ?? []);

  const [selectionCounts, setSelectionCounts] = useState<Record<string, number>>(saved.current?.selectionCounts ?? {});
  const [finalSixValues, setFinalSixValues] = useState<string[]>(saved.current?.finalSixValues ?? []);

  const [dice1Result, setDice1Result] = useState<string>("");
  const [dice2Result, setDice2Result] = useState<string>("");
  const [isRolling, setIsRolling] = useState(false);
  const [showDicePopup, setShowDicePopup] = useState(false);

  const [showSpeedRound, setShowSpeedRound] = useState(false);
  const [showPosterGen, setShowPosterGen] = useState(false);

  // Dynamic tab title & animated favicon
  const quizProgress = useMemo(() => {
    if (stage === "section1") return { current: currentValueIndex + 1, total: CORE_VALUES.length };
    if (stage === "section2") return { current: section2Index + 1, total: section1Selections.length };
    if (stage === "section3") return { current: section3PairIndex + 1, total: section3Pairs.length };
    if (stage === "section3-runoff") return { current: section3RunoffIndex + 1, total: section3RunoffPairs.length };
    return undefined;
  }, [stage, currentValueIndex, section2Index, section1Selections.length, section3PairIndex, section3Pairs.length, section3RunoffIndex, section3RunoffPairs.length]);

  useDynamicTabTitle(stage === "sorting" || stage === "gratitude" ? "section1" : stage, quizProgress);
  useAnimatedFavicon(true);

  // Commitment tracker
  const { markMilestone } = useCommitmentTracker();

  // Mark quiz started on mount
  useEffect(() => {
    markMilestone("quiz_started");
  }, [markMilestone]);

  // Ambient mood shifting
  useAmbientMood(
    stage !== "sorting" && stage !== "gratitude",
    stage === "section1" ? section1Selections :
    stage === "section2" ? section2Selections :
    [...section3Winners, ...section3RunoffWinners]
  );

  // Persist quiz state
  useEffect(() => {
    if (stage === "dice" || stage === "sorting" || stage === "gratitude") return;
    saveQuizState({
      stage,
      currentValueIndex,
      section1Selections,
      section2Index,
      section2Selections,
      section3PairIndex,
      section3Winners,
      section3Losers,
      section3RunoffIndex,
      section3RunoffWinners,
      selectionCounts,
      finalSixValues,
    });
  }, [stage, currentValueIndex, section1Selections, section2Index, section2Selections, section3PairIndex, section3Winners, section3Losers, section3RunoffIndex, section3RunoffWinners, selectionCounts, finalSixValues]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage]);

  useEffect(() => {
    if (stage === "section3" && section3Pairs.length === 0 && section2Selections.length > 0) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < section2Selections.length; i += 2) {
        if (i + 1 < section2Selections.length) pairs.push([section2Selections[i], section2Selections[i + 1]]);
      }
      setSection3Pairs(pairs);
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
    clearQuizState();
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
      const next = prev.includes(value) ? prev.filter((v) => v !== value) : prev.length >= 6 ? prev : [...prev, value];
      return next;
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

  const isQuizActive = ["section1", "section2", "section3", "section3-runoff", "section4", "final"].includes(stage);

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
        <Button variant="ghost" size="sm" onClick={() => window.location.href = "/"}>
          Exit Quiz
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

  // Mark results_viewed milestone when entering dice screen
  useEffect(() => {
    if (stage === "dice") markMilestone("results_viewed");
  }, [stage, markMilestone]);

  return (
    <div className="min-h-screen bg-background ambient-mood">
      {stage === "sorting" && (
        <TheSorting onComplete={() => setStage("section1")} />
      )}
      {stage === "gratitude" && (
        <GratitudeMoment onComplete={() => setStage("dice")} />
      )}

      {/* Section 1 — Does it resonate? */}
      {stage === "section1" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <QuizMilestone current={currentValueIndex + 1} total={CORE_VALUES.length} />
          <QuizTop title="Does it resonate?" current={currentValueIndex + 1} total={CORE_VALUES.length} />
          <div className="flex items-center justify-center px-6 pb-10">
            <ValueCard
              value={CORE_VALUES[currentValueIndex]}
              onSwipeLeft={handleSection1Left}
              onSwipeRight={handleSection1Right}
              leftLabel="No"
              rightLabel="Resonates"
            />
          </div>
        </div>
      )}

      {/* Section 2 — True or aspire? */}
      {stage === "section2" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          {section2Index >= section1Selections.length ? (
            <div className="mx-auto max-w-3xl px-6 pt-24">
              <p className="text-muted-foreground">No values selected in the first pass — return and try again.</p>
              <div className="mt-6">
                <Button onClick={() => { resetQuiz(); setStage("sorting"); }}>Start Over</Button>
              </div>
            </div>
          ) : (
            <>
              <QuizMilestone current={section2Index + 1} total={section1Selections.length} />
              <QuizTop title="True or aspire?" current={section2Index + 1} total={section1Selections.length} />
              <div className="flex items-center justify-center px-6 pb-10">
                <ValueCard
                  value={section1Selections[section2Index]}
                  onSwipeLeft={handleSection2Left}
                  onSwipeRight={handleSection2Right}
                  leftLabel="Admire in others"
                  rightLabel="True / Aspire"
                  description="Is this true about you, or something you aspire to?"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Section 3 — Legacy choice */}
      {stage === "section3" && section3Pairs[section3PairIndex] && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <QuizTop title="Legacy choice" current={section3PairIndex + 1} total={section3Pairs.length} />
          <div className="flex items-center justify-center px-6 pb-10">
            <ValuePair
              value1={section3Pairs[section3PairIndex][0]}
              value2={section3Pairs[section3PairIndex][1]}
              onSelect={handleSection3Selection}
              title="Which would you rather people describe you with at your funeral?"
            />
          </div>
        </div>
      )}

      {/* Section 3 Runoff */}
      {stage === "section3-runoff" && section3RunoffPairs[section3RunoffIndex] && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <QuizTop
            title="Runoff round"
            subtitle="Second chance for values that didn't win the first round"
            current={section3RunoffIndex + 1}
            total={section3RunoffPairs.length}
          />
          <div className="flex items-center justify-center px-6 pb-10">
            <ValuePair
              value1={section3RunoffPairs[section3RunoffIndex][0]}
              value2={section3RunoffPairs[section3RunoffIndex][1]}
              onSelect={handleRunoffSelection}
              title="Which would you rather people describe you with at your funeral?"
            />
          </div>
        </div>
      )}

      {/* Section 4 — Top values review */}
      {stage === "section4" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <div className="mx-auto w-full max-w-3xl px-6 pt-24">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">Your top values</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                These values won the most battles. The number shows how many times each was selected.
              </p>
            </div>
            <div className="sketch-card overflow-hidden">
              {[...allWinners].sort((a, b) => (selectionCounts[b] || 0) - (selectionCounts[a] || 0)).map((value, index) => (
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
      )}

      {/* Final — Pick your 6 */}
      {stage === "final" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
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
                <Button onClick={() => { clearQuizState(); setStage("gratitude"); }} size="lg" className="w-full">
                  Continue to dice
                  <ChevronRight />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dice + Chat */}
      {stage === "dice" && (
        <div className="min-h-screen bg-background">
          <Navigation />
          <Suspense fallback={null}>
            <ValuesPosterGenerator values={finalSixValues} open={showPosterGen} onClose={() => setShowPosterGen(false)} />
          </Suspense>
          <DiceProductPopup values={finalSixValues} visible={showDicePopup} />
          <div className="pt-20 lg:flex lg:min-h-[calc(100vh-5rem)]">
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

                <CommitmentEscalation onAction={(milestone) => {
                  if (milestone === "chat_used") {
                    const chatEl = document.querySelector('[class*="lg:border-l"]');
                    chatEl?.scrollIntoView({ behavior: "smooth" });
                  }
                }} />

                <Suspense fallback={<div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
                  <ValuesConstellation values={finalSixValues} />
                </Suspense>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSpeedRound((s) => !s)}
                    className="text-xs"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Speed Round
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPosterGen(true)}
                    className="text-xs"
                  >
                    <Image className="h-3.5 w-3.5" />
                    Create Poster
                  </Button>
                </div>

                {showSpeedRound && (
                  <SpeedRound
                    values={allWinners}
                    deliberateValues={finalSixValues}
                    onClose={() => setShowSpeedRound(false)}
                  />
                )}

                <ShareableValuesCard values={finalSixValues} />
              </div>
            </div>
            <div className="w-full border-t border-border lg:w-1/2 lg:border-t-0 lg:border-l">
              <div className="min-h-[520px] lg:min-h-[calc(100vh-5rem)]">
                <ValuesChat rolledValue={dice1Result} rolledContext={dice2Result} onTriggerProductPopup={() => setShowDicePopup(true)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
