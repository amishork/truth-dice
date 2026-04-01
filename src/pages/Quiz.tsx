import React, { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { ChevronRight, ChevronDown, Dices, Plus, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ValueCard } from "@/components/ValueCard";
import { ValuePair } from "@/components/ValuePair";
import { ValuesChat } from "@/components/ValuesChat";
import CommitmentEscalation from "@/components/CommitmentEscalation";
import WhatsNext from "@/components/WhatsNext";
import DiceProductPopup from "@/components/DiceProductPopup";
import TheSorting from "@/components/TheSorting";
import GratitudeMoment from "@/components/GratitudeMoment";
import ShareableValuesCard from "@/components/ShareableValuesCard";
import EmailMyResults from "@/components/EmailMyResults";
import QuizMilestone from "@/components/QuizMilestone";
import PhaseBanner from "@/components/PhaseBanner";
import QuizTimer from "@/components/QuizTimer";
import AuthModal from "@/components/AuthModal";
import AreaOfLifePicker, { AREAS_OF_LIFE, getAreaLabel } from "@/components/AreaOfLifePicker";
import type { AreaOfLife } from "@/components/AreaOfLifePicker";
import { useAuth } from "@/contexts/AuthContext";
import { useDynamicTabTitle, useAnimatedFavicon } from "@/hooks/useDynamicTabTitle";
import { toast } from "sonner";

import { useCommitmentTracker } from "@/hooks/useCommitmentTracker";
import { CORE_VALUES, DICE_CONTEXTS } from "@/data/values";
import {
  trackAreaSelected,
  trackSection1Complete,
  trackSection2Complete,
  trackSection3Complete,
  trackFinalSelectionComplete,
  trackQuizSaved,
  trackResultsViewed,
  trackDiceRolled,
} from "@/lib/analytics";
import {
  saveQuizSession,
  getCompletedAreas,
  getUserSessions,
  getAvgQuizDuration,
} from "@/lib/quizSessions";
import type { QuizSession } from "@/lib/quizSessions";

const ValuesChordDiagram = lazy(() => import("@/components/ValuesChordDiagram"));

type Stage =
  | "auth"
  | "area-of-life"
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
const RESUMABLE_STAGES: Stage[] = ["section1", "section2", "section3", "section3-runoff", "section4", "final"];

interface QuizState {
  stage: Stage;
  areaOfLife: string;
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
    const parsed = JSON.parse(raw);
    if (!RESUMABLE_STAGES.includes(parsed.stage)) return null;
    return parsed;
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

function getSection3Question(areaId: string, gender: "male" | "female" | null): string {
  switch (areaId) {
    case "leader":
      return "If your team could only use one of these values to describe your leadership, which would matter more?";
    case "spouse":
      return "If your ideal spouse embodied only one of these, which would matter more?";
    case "parent":
      return gender === "female"
        ? "As a mother, if your children remembered you for only one of these, which would it be?"
        : "As a father, if your children remembered you for only one of these, which would it be?";
    case "children":
      return "If your children could only hold one of these values, which would you choose for them?";
    case "spouse-values":
      return gender === "female"
        ? "If your children's father held only one of these, which would matter more?"
        : "If your children's mother held only one of these, which would matter more?";
    case "friends":
      return "If your closest friends valued only one of these, which would you want it to be?";
    case "work":
      return "If your workplace could only embody one of these, which would matter more?";
    case "leisure":
      return "When you imagine your best moments of rest, which of these would define them?";
    default:
      return "Which would you rather people describe you with at your funeral?";
  }
}

function getFinalQuestion(areaId: string, gender: "male" | "female" | null): string {
  switch (areaId) {
    case "leader":
      return "If your team could only describe your leadership using 6 values, which would you hope they chose?";
    case "spouse":
      return "If your ideal spouse lived by only 6 of these values, which 6 would matter most?";
    case "parent":
      return gender === "female"
        ? "If your children remembered you for only 6 of these values as their mother, which would you hope they were?"
        : "If your children remembered you for only 6 of these values as their father, which would you hope they were?";
    case "children":
      return "If your children lived by only 6 of these values, which 6 would you choose for them?";
    case "spouse-values":
      return gender === "female"
        ? "If your children's father lived by only 6 of these values, which 6 would matter most?"
        : "If your children's mother lived by only 6 of these values, which 6 would matter most?";
    case "friends":
      return "If your friends lived by only 6 of these values, which 6 would you want?";
    case "work":
      return "If your work environment was defined by only 6 of these values, which would you choose?";
    case "leisure":
      return "If your leisure time was shaped by only 6 of these values, which would you choose?";
    default:
      return "At your funeral, if people only described you using 6 of these values, which would you hope they used?";
  }
}

const Quiz = () => {
  const saved = useRef(loadQuizState());
  const hasResumable = !!saved.current;

  const { user, loading: authLoading, isAuthenticated, gender } = useAuth();

  const [stage, setStage] = useState<Stage>(hasResumable ? saved.current!.stage : "area-of-life");
  const [areaOfLife, setAreaOfLife] = useState<string>(saved.current?.areaOfLife ?? "personal");
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

  const [completedAreas, setCompletedAreas] = useState<string[]>([]);
  const [userSessions, setUserSessions] = useState<QuizSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [dashboardValues, setDashboardValues] = useState<string[]>([]);
  const [dashboardAllWinners, setDashboardAllWinners] = useState<string[]>([]);

  const [dice1Result, setDice1Result] = useState<string>("");
  const [dice2Result, setDice2Result] = useState<string>("");
  const [isRolling, setIsRolling] = useState(false);
  const [showDicePopup, setShowDicePopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // ─── Timing state ─────────────────────────────────────────────────────────
  const quizStartTime = useRef<number | null>(null);
  const cardTimestamps = useRef<number[]>([]);

  const areaOfLifeData = useMemo(() => AREAS_OF_LIFE.find((a) => a.id === areaOfLife) ?? null, [areaOfLife]);
  const areaLabel = useMemo(() => areaOfLifeData ? getAreaLabel(areaOfLifeData, gender) : "", [areaOfLifeData, gender]);
  const allWinners = useMemo(() => [...section3Winners, ...section3RunoffWinners], [section3Winners, section3RunoffWinners]);
  const activeValues = dashboardValues.length > 0 ? dashboardValues : finalSixValues;
  const activeAllWinners = dashboardAllWinners.length > 0 ? dashboardAllWinners : allWinners;
  const isQuizActive = RESUMABLE_STAGES.includes(stage);

  // ─── Auth-based routing ──────────────────────────────────────────────────────
  // If authenticated with existing sessions, skip to dashboard on initial load
  useEffect(() => {
    if (authLoading) return;
    if (hasResumable) return;
    if (stage !== "area-of-life") return;

    if (isAuthenticated && user) {
      setSessionsLoading(true);
      getCompletedAreas(user.id).then(async (areas) => {
        setCompletedAreas(areas);
        if (areas.length > 0) {
          const sessions = await getUserSessions(user.id);
          setUserSessions(sessions);
          if (sessions.length > 0) {
            const latest = sessions[0];
            setDashboardValues(latest.final_six_values);
            setDashboardAllWinners(latest.all_winners);
            setSelectedSessionId(latest.id);
          }
          setStage("dice");
        }
        setSessionsLoading(false);
      });
    }
  }, [authLoading, isAuthenticated, user, stage, hasResumable]);

  // ─── Hooks ───────────────────────────────────────────────────────────────────
  const quizProgress = useMemo(() => {
    if (stage === "section1") return { current: currentValueIndex + 1, total: CORE_VALUES.length };
    if (stage === "section2") return { current: section2Index + 1, total: section1Selections.length };
    if (stage === "section3") return { current: section3PairIndex + 1, total: section3Pairs.length };
    if (stage === "section3-runoff") return { current: section3RunoffIndex + 1, total: section3RunoffPairs.length };
    return undefined;
  }, [stage, currentValueIndex, section2Index, section1Selections.length, section3PairIndex, section3Pairs.length, section3RunoffIndex, section3RunoffPairs.length]);

  useDynamicTabTitle(stage === "sorting" || stage === "gratitude" ? "section1" : stage, quizProgress);
  useAnimatedFavicon(true);

  const { markMilestone } = useCommitmentTracker();
  useEffect(() => { markMilestone("quiz_started"); }, [markMilestone]);

  useEffect(() => {
    if (!RESUMABLE_STAGES.includes(stage)) return;
    saveQuizState({
      stage, areaOfLife, currentValueIndex, section1Selections, section2Index,
      section2Selections, section3PairIndex, section3Winners, section3Losers,
      section3RunoffIndex, section3RunoffWinners, selectionCounts, finalSixValues,
    });
  }, [stage, areaOfLife, currentValueIndex, section1Selections, section2Index, section2Selections, section3PairIndex, section3Winners, section3Losers, section3RunoffIndex, section3RunoffWinners, selectionCounts, finalSixValues]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage]);

  useEffect(() => {
    if (stage === "section3" && section3Pairs.length === 0 && section2Selections.length > 0) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < section2Selections.length; i += 2) {
        if (i + 1 < section2Selections.length) pairs.push([section2Selections[i], section2Selections[i + 1]]);
      }
      // If odd count, auto-advance the unpaired value as a winner
      if (section2Selections.length % 2 === 1) {
        const byeValue = section2Selections[section2Selections.length - 1];
        setSection3Winners((prev) => [...prev, byeValue]);
        incrementCount(byeValue);
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
      // If odd count, auto-advance the unpaired value as a runoff winner
      if (section3Losers.length % 2 === 1) {
        const byeValue = section3Losers[section3Losers.length - 1];
        setSection3RunoffWinners((prev) => [...prev, byeValue]);
        incrementCount(byeValue);
      }
      setSection3RunoffPairs(pairs);
      if (pairs.length === 0) setStage("section4");
    }
  }, [stage, section3Losers, section3RunoffPairs.length]);

  useEffect(() => {
    if (stage === "dice") {
      markMilestone("results_viewed");
      trackResultsViewed(areaOfLife);
    }
  }, [stage, markMilestone, areaOfLife]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
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
    quizStartTime.current = null;
    cardTimestamps.current = [];
    clearQuizState();
  };

  const handleAreaSelect = (area: AreaOfLife) => {
    setAreaOfLife(area.id);
    resetQuiz();
    trackAreaSelected(area.id);
    setStage("sorting");
  };

  const handleGuestContinue = () => {
    setShowAuthModal(false);
  };

  const routeAfterAuth = useCallback(async (userId: string) => {
    setSessionsLoading(true);
    const areas = await getCompletedAreas(userId);
    setCompletedAreas(areas);
    if (areas.length > 0) {
      const sessions = await getUserSessions(userId);
      setUserSessions(sessions);
      if (sessions.length > 0) {
        const latest = sessions[0];
        setDashboardValues(latest.final_six_values);
        setDashboardAllWinners(latest.all_winners);
        setSelectedSessionId(latest.id);
        setStage("dice");
        setSessionsLoading(false);
        return;
      }
    }
    setSessionsLoading(false);
    setShowAuthModal(false);
  }, []);

  // Handle auth state change (OAuth redirect or modal sign-in)
  const prevAuthRef = useRef(isAuthenticated);
  useEffect(() => {
    if (!prevAuthRef.current && isAuthenticated && user && !authLoading) {
      routeAfterAuth(user.id);
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, user, authLoading, routeAfterAuth]);

  const recordCardTimestamp = () => {
    const now = Date.now();
    if (!quizStartTime.current) quizStartTime.current = now;
    cardTimestamps.current = [...cardTimestamps.current, now];
  };

  const persistSessionAndContinue = useCallback(async () => {
    clearQuizState();
    const durationSeconds = quizStartTime.current
      ? Math.round((Date.now() - quizStartTime.current) / 1000)
      : undefined;
    trackFinalSelectionComplete(finalSixValues);
    const { error } = await saveQuizSession(user?.id ?? null, areaOfLife, finalSixValues, allWinners, selectionCounts, durationSeconds);
    if (error) {
      toast.error("Your results couldn't be saved. Please check your connection and try again.");
      return;
    }
    trackQuizSaved(areaOfLife, durationSeconds);
    setDashboardValues(finalSixValues);
    setDashboardAllWinners(allWinners);
    if (user) {
      const areas = await getCompletedAreas(user.id);
      setCompletedAreas(areas);
      const sessions = await getUserSessions(user.id);
      setUserSessions(sessions);
      if (sessions.length > 0) setSelectedSessionId(sessions[0].id);
    }
    setStage("gratitude");
  }, [user, areaOfLife, finalSixValues, allWinners, selectionCounts]);

  const handleSection1Right = () => {
    recordCardTimestamp();
    const value = CORE_VALUES[currentValueIndex];
    setSection1Selections((prev) => [...prev, value]);
    incrementCount(value);
    if (currentValueIndex < CORE_VALUES.length - 1) setCurrentValueIndex((v) => v + 1);
    else {
      trackSection1Complete(section1Selections.length + 1, CORE_VALUES.length);
      setStage("section2");
    }
  };

  const handleSection1Left = () => {
    recordCardTimestamp();
    if (currentValueIndex < CORE_VALUES.length - 1) setCurrentValueIndex((v) => v + 1);
    else {
      trackSection1Complete(section1Selections.length, CORE_VALUES.length);
      setStage("section2");
    }
  };

  const handleSection2Right = () => {
    recordCardTimestamp();
    const value = section1Selections[section2Index];
    if (!value) return;
    setSection2Selections((prev) => [...prev, value]);
    incrementCount(value);
    if (section2Index < section1Selections.length - 1) setSection2Index((v) => v + 1);
    else {
      trackSection2Complete(section2Selections.length + 1, section1Selections.length);
      setStage("section3");
    }
  };

  const handleSection2Left = () => {
    recordCardTimestamp();
    if (section2Index < section1Selections.length - 1) setSection2Index((v) => v + 1);
    else {
      trackSection2Complete(section2Selections.length, section1Selections.length);
      setStage("section3");
    }
  };

  const handleSection3Selection = (value: string) => {
    recordCardTimestamp();
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
    recordCardTimestamp();
    setSection3RunoffWinners((prev) => [...prev, value]);
    incrementCount(value);
    if (section3RunoffIndex < section3RunoffPairs.length - 1) setSection3RunoffIndex((v) => v + 1);
    else {
      trackSection3Complete(section3Winners.length + section3RunoffWinners.length + 1);
      setStage("section4");
    }
  };

  const handleFinalValueToggle = (value: string) => {
    setFinalSixValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : prev.length >= 6 ? prev : [...prev, value]
    );
  };

  const handleSessionSelect = (session: QuizSession) => {
    setSelectedSessionId(session.id);
    setDashboardValues(session.final_six_values);
    setDashboardAllWinners(session.all_winners);
    setDice1Result("");
    setDice2Result("");
  };

  const rollDice = () => {
    if (activeValues.length === 0) return;
    setIsRolling(true);
    trackDiceRolled();
    const randomDice1 = activeValues[Math.floor(Math.random() * activeValues.length)];
    const randomDice2 = DICE_CONTEXTS[Math.floor(Math.random() * DICE_CONTEXTS.length)];
    window.setTimeout(() => {
      setDice1Result(randomDice1);
      setDice2Result(randomDice2);
      setIsRolling(false);
    }, 600);
  };

  // ─── Sub-components ──────────────────────────────────────────────────────────
  const Divider = () => (
    <div className="my-10 flex w-full max-w-md items-center gap-4 self-center">
      <div className="h-px flex-1 bg-border" />
      <div className="h-2 w-2 rotate-45 border border-border" />
      <div className="h-px flex-1 bg-border" />
    </div>
  );

  const QuizTop = ({ title, current, total }: { title: string; current: number; total: number }) => {
    const pct = Math.round((current / Math.max(total, 1)) * 100);
    return (
      <div className="mx-auto w-full max-w-3xl px-6 pt-24">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/")}>Exit Quiz</Button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-foreground">{title}</span>
            <span className="label-technical">{current} of {Math.max(total, 1)}</span>
          </div>
        </div>
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  const ContextBanner = () => {
    if (!isQuizActive || !areaOfLifeData) return null;
    return (
      <div className="fixed top-16 left-0 right-0 z-40 border-b border-primary/20 bg-primary/5 py-1.5 text-center">
        <p className="font-serif text-sm text-primary tracking-wide">{areaLabel}</p>
      </div>
    );
  };

  // ─── Timer remaining calculation ────────────────────────────────────────────
  const timerCardsRemaining = useMemo(() => {
    if (stage === "section1") {
      // remaining in s1 + estimated s2 (~ half of s1 selections) + estimated s3 pairs (~ quarter)
      const s1Remaining = CORE_VALUES.length - currentValueIndex - 1;
      const estS2 = Math.round(section1Selections.length * 0.5);
      const estS3 = Math.round(section1Selections.length * 0.25);
      return s1Remaining + estS2 + estS3;
    }
    if (stage === "section2") {
      const s2Remaining = section1Selections.length - section2Index - 1;
      const estS3 = Math.round(section2Selections.length * 0.5);
      return s2Remaining + estS3;
    }
    if (stage === "section3") return section3Pairs.length - section3PairIndex - 1;
    if (stage === "section3-runoff") return section3RunoffPairs.length - section3RunoffIndex - 1;
    return 0;
  }, [stage, currentValueIndex, section1Selections.length, section2Index, section2Selections.length, section3PairIndex, section3Pairs.length, section3RunoffIndex, section3RunoffPairs.length]);

  const showTimer = ["section1", "section2", "section3", "section3-runoff"].includes(stage);

  const section3Q = getSection3Question(areaOfLife, gender);
  const finalQ = getFinalQuestion(areaOfLife, gender);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      <AuthModal
        open={showAuthModal}
        onClose={handleGuestContinue}
        onContinueAsGuest={handleGuestContinue}
      />

      {stage === "area-of-life" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <div className="pt-16">
            <AreaOfLifePicker
              completedAreas={completedAreas}
              onSelect={handleAreaSelect}
              onBack={() => window.location.href = "/"}
            />
          </div>
        </div>
      )}

      {stage === "sorting" && <TheSorting onComplete={() => setStage("section1")} />}
      {stage === "gratitude" && <GratitudeMoment onComplete={() => setStage("dice")} />}

      {stage === "section1" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <ContextBanner />
          <QuizMilestone current={currentValueIndex + 1} total={CORE_VALUES.length} />
          <QuizTop title="Does it resonate?" current={currentValueIndex + 1} total={CORE_VALUES.length} />
          <div className="flex items-center justify-center px-6">
            <ValueCard value={CORE_VALUES[currentValueIndex]} onSwipeLeft={handleSection1Left} onSwipeRight={handleSection1Right} leftLabel="No" rightLabel="Resonates" />
          </div>
          <div className="mx-auto w-full max-w-md px-6 pb-10">
            <PhaseBanner text="Trust your first instinct. If a word doesn't pull an immediate yes from you, let it pass. A maybe is a no. Move quickly — your gut knows more than you think." />
          </div>
          <QuizTimer cardTimestamps={cardTimestamps.current} totalCardsRemaining={timerCardsRemaining} visible={showTimer} />
        </div>
      )}

      {stage === "section2" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <ContextBanner />
          {section2Index >= section1Selections.length ? (
            <div className="mx-auto max-w-3xl px-6 pt-24">
              <p className="text-muted-foreground">No values selected in the first pass — return and try again.</p>
              <div className="mt-6"><Button onClick={() => { resetQuiz(); setStage("sorting"); }}>Start Over</Button></div>
            </div>
          ) : (
            <>
              <QuizMilestone current={section2Index + 1} total={section1Selections.length} />
              <QuizTop title="True or aspire?" current={section2Index + 1} total={section1Selections.length} />
              <div className="flex items-center justify-center px-6">
                <ValueCard value={section1Selections[section2Index]} onSwipeLeft={handleSection2Left} onSwipeRight={handleSection2Right} leftLabel="Admire in others" rightLabel="True / Aspire" />
              </div>
              <div className="mx-auto w-full max-w-md px-6 pb-10">
                <PhaseBanner text="Now slow down. For each value your gut said yes to, ask: is this genuinely true about me, or something I aspire to live? Or do I mostly admire it when I see it in others? If it's not clearly yours, let it go." />
              </div>
              <QuizTimer cardTimestamps={cardTimestamps.current} totalCardsRemaining={timerCardsRemaining} visible={showTimer} />
            </>
          )}
        </div>
      )}

      {stage === "section3" && section3Pairs[section3PairIndex] && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <ContextBanner />
          <QuizTop title="Legacy choice" current={section3PairIndex + 1} total={section3Pairs.length} />
          <div className="flex items-center justify-center px-6">
            <ValuePair value1={section3Pairs[section3PairIndex][0]} value2={section3Pairs[section3PairIndex][1]} onSelect={handleSection3Selection} title={section3Q} />
          </div>
          <div className="mx-auto w-full max-w-md px-6 pb-10">
            <PhaseBanner text="You've already said yes to each of these twice — at the gut level and the head level. Now go deeper. If someone looked into the very core of who you are and could only find one of these two values, which would you hope they'd see?" />
          </div>
          <QuizTimer cardTimestamps={cardTimestamps.current} totalCardsRemaining={timerCardsRemaining} visible={showTimer} />
        </div>
      )}

      {stage === "section3-runoff" && section3RunoffPairs[section3RunoffIndex] && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <ContextBanner />
          <QuizTop title="Runoff round" current={section3RunoffIndex + 1} total={section3RunoffPairs.length} />
          <div className="flex items-center justify-center px-6">
            <ValuePair value1={section3RunoffPairs[section3RunoffIndex][0]} value2={section3RunoffPairs[section3RunoffIndex][1]} onSelect={handleRunoffSelection} title={section3Q} />
          </div>
          <div className="mx-auto w-full max-w-md px-6 pb-10">
            <PhaseBanner text="You've already said yes to each of these twice — at the gut level and the head level. Now go deeper. If someone looked into the very core of who you are and could only find one of these two values, which would you hope they'd see?" />
          </div>
          <QuizTimer cardTimestamps={cardTimestamps.current} totalCardsRemaining={timerCardsRemaining} visible={showTimer} />
        </div>
      )}

      {stage === "section4" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <ContextBanner />
          <div className="mx-auto w-full max-w-3xl px-6 pt-24">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">Your top values</h2>
              <p className="mt-2 text-sm text-muted-foreground">These values won the most battles. The number shows how many times each was selected.</p>
            </div>
            <div className="sketch-card overflow-hidden">
              {[...allWinners].sort((a, b) => (selectionCounts[b] || 0) - (selectionCounts[a] || 0)).map((value, index) => (
                <div key={`${value}-${index}`} className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="label-technical w-6">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                  <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-foreground">{selectionCounts[value] || 0}</span>
                </div>
              ))}
            </div>
            <Divider />
            <Button onClick={() => setStage("final")} size="lg" className="w-full">Continue to final selection <ChevronRight /></Button>
          </div>
        </div>
      )}

      {stage === "final" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <ContextBanner />
          <div className="mx-auto w-full max-w-3xl px-6 pt-24">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Your final 6 values</h2>
              <p className="mt-4 text-xs text-muted-foreground">{finalSixValues.length} of 6 selected</p>
            </div>
            <PhaseBanner text={finalQ} />
            <div className="sketch-card overflow-hidden mt-6">
              {allWinners.map((value, index) => {
                const isSelected = finalSixValues.includes(value);
                const isDisabled = !isSelected && finalSixValues.length >= 6;
                return (
                  <button key={`${value}-${index}`} onClick={() => handleFinalValueToggle(value)} disabled={isDisabled}
                    className="quiz-final-row" data-selected={isSelected} data-disabled={isDisabled}
                  >
                    <span className="quiz-final-checkbox" data-checked={isSelected} aria-hidden>
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
                <Button onClick={persistSessionAndContinue} size="lg" className="w-full">
                  Continue to your results <ChevronRight />
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {stage === "dice" && (
        <div className="min-h-screen bg-background">
          <Navigation />
          <DiceProductPopup values={activeValues} visible={showDicePopup} />

          <div className="hub-page">
            {/* ─── Col 1: Discoveries sidebar ─── */}
            <aside className="hub-sidebar">
              {!isAuthenticated && (
                <motion.div className="hub-sidebar-card" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-medium">Save your results.</span>{" "}
                    Create an account to discover your values across every area of life.
                  </p>
                  <button onClick={() => setShowAuthModal(true)} className="mt-3 text-sm font-medium text-primary hover:underline">
                    Create free account →
                  </button>
                </motion.div>
              )}

              {sessionsLoading && (
                <div className="hub-sidebar-card space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              )}

              {!sessionsLoading && isAuthenticated && userSessions.length > 0 && (
                <div className="hub-sidebar-card">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="label-technical">Your Discoveries</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const allIds = userSessions.map(s => s.id);
                          const allExpanded = allIds.every(id => expandedSessions.has(id));
                          setExpandedSessions(allExpanded ? new Set() : new Set(allIds));
                        }}
                        className="text-[0.58rem] font-mono tracking-wider uppercase text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                      >
                        {userSessions.every(s => expandedSessions.has(s.id)) ? "Collapse" : "Expand"}
                      </button>
                      <button onClick={() => setStage("area-of-life")} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                        <Plus className="h-3 w-3" /> New Quiz
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {userSessions.map((session) => {
                      const area = AREAS_OF_LIFE.find((a) => a.id === session.area_of_life);
                      const label = area ? getAreaLabel(area, gender) : session.area_of_life;
                      const isActive = session.id === selectedSessionId;
                      const isExpanded = expandedSessions.has(session.id);
                      return (
                        <div key={session.id}>
                          <div className={`hub-session-btn ${isActive ? "hub-session-active" : ""}`}>
                            <button
                              onClick={() => {
                                setExpandedSessions(prev => {
                                  const next = new Set(prev);
                                  next.has(session.id) ? next.delete(session.id) : next.add(session.id);
                                  return next;
                                });
                              }}
                              className="flex items-center justify-center w-5 h-5 text-muted-foreground/35 hover:text-muted-foreground transition-colors"
                            >
                              <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                            <button
                              onClick={() => handleSessionSelect(session)}
                              className="flex items-center gap-2.5 flex-1 min-w-0"
                            >
                              <span className="text-base">{area?.icon ?? "🪞"}</span>
                              <span className="text-[0.8rem] font-medium text-foreground">{label}</span>
                              {isActive && <span className="ml-auto hub-active-badge">Active</span>}
                            </button>
                          </div>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-9 pr-2 pb-3 pt-1"
                            >
                              <div className="flex flex-wrap gap-1.5">
                                {session.final_six_values.map((v) => (
                                  <span key={v} className="rounded bg-background px-2.5 py-1 text-[0.68rem] text-muted-foreground border border-border/30 leading-none">{v}</span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {AREAS_OF_LIFE.filter((a) => !completedAreas.includes(a.id)).length > 0 && (
                    <div className="mt-5 pt-4 border-t border-border/25">
                      <p className="label-technical mb-3 text-muted-foreground/40">Still to explore</p>
                      <div className="space-y-0.5">
                        {AREAS_OF_LIFE.filter((a) => !completedAreas.includes(a.id)).map((area) => {
                          const label = getAreaLabel(area, gender);
                          const isLocked = area.requiresPersonal && !completedAreas.includes("personal");
                          return (
                            <button key={area.id} onClick={() => !isLocked && setStage("area-of-life")} disabled={isLocked}
                              className={`hub-explore-btn ${isLocked ? "hub-explore-locked" : ""}`}
                            >
                              <span className={`text-sm ${isLocked ? "opacity-18 grayscale" : "opacity-40"}`}>{area.icon}</span>
                              <span className={`text-[0.75rem] ${isLocked ? "text-muted-foreground/18" : "text-muted-foreground/45"}`}>{label}</span>
                              {isLocked && <Lock className="ml-auto h-3 w-3 text-muted-foreground/10" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!sessionsLoading && (!isAuthenticated || userSessions.length === 0) && (
                <div className="hub-sidebar-card">
                  <h3 className="label-technical mb-2">Get Started</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Complete the values quiz to begin building your profile.</p>
                </div>
              )}
            </aside>

            {/* ─── Col 2: Dice (top) → Diagram → Journey ─── */}
            <div className="hub-center">
              {/* Dice */}
              <div className="hub-dice-area">
                <div className="grid grid-cols-2 gap-3">
                  <div className="sketch-card p-5 text-center">
                    <p className="label-technical">Value</p>
                    <div className={`mt-3 min-h-14 flex items-center justify-center ${isRolling ? "animate-dice-roll" : ""}`}>
                      <p className="text-base font-medium text-foreground">{dice1Result || "?"}</p>
                    </div>
                  </div>
                  <div className="sketch-card p-5 text-center">
                    <p className="label-technical">Context</p>
                    <div className={`mt-3 min-h-14 flex items-center justify-center ${isRolling ? "animate-dice-roll" : ""}`}>
                      <p className="text-base font-medium text-foreground">{dice2Result || "?"}</p>
                    </div>
                  </div>
                </div>
                <Button onClick={rollDice} disabled={isRolling} size="lg" className="w-full mt-4">
                  <Dices /> Roll dice
                </Button>
              </div>

              {/* Chord Diagram — centered below dice */}
              <div className="hub-diagram-area">
                <Suspense fallback={
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Skeleton className="h-48 w-48 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                }>
                  <ValuesChordDiagram sessions={userSessions} activeSessionId={selectedSessionId} />
                </Suspense>
              </div>

              {/* Share & Save — below diagram */}
              {activeValues.length >= 6 && (
                <div className="hub-dice-area mt-4 space-y-5">
                  <ShareableValuesCard values={activeValues} />
                  {!isAuthenticated && (
                    <EmailMyResults values={activeValues} areaLabel={areaLabel} />
                  )}
                </div>
              )}

              {/* What's Next — decision tree for services */}
              {activeValues.length > 0 && (
                <div className="hub-dice-area mt-4">
                  <WhatsNext coreValues={activeValues} />
                </div>
              )}

              {/* Your Journey — centered below diagram */}
              <div className="hub-dice-area mt-4">
                <CommitmentEscalation onAction={(milestone) => {
                  if (milestone === "chat_used") {
                    const chatEl = document.querySelector(".chat-callout");
                    chatEl?.scrollIntoView({ behavior: "smooth" });
                  }
                }} />
              </div>
            </div>

            {/* ─── Col 3: Chat ─── */}
            <div className="hub-chat">
              <div className="chat-callout lg:sticky lg:top-[5.5rem] lg:h-[calc(100vh-6.5rem)]">
                <ValuesChat rolledValue={dice1Result} rolledContext={dice2Result} coreValues={activeValues} onTriggerProductPopup={() => setShowDicePopup(true)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
