import { useState, useRef, useMemo, useCallback } from "react";
import { CORE_VALUES } from "@/data/values";
import {
  trackAreaSelected,
  trackSection1Complete,
  trackSection2Complete,
  trackSection3Complete,
  trackFinalSelectionComplete,
  trackQuizSaved,
} from "@/lib/analytics";
import { saveQuizSession, GUEST_SESSION_KEY } from "@/lib/quizSessions";
import { toast } from "sonner";
import type { AreaOfLife } from "@/components/AreaOfLifePicker";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Stage =
  | "area-of-life"
  | "sorting"
  | "section1"
  | "section2"
  | "section3"
  | "section3-runoff"
  | "section4"
  | "final"
  | "gratitude"
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

function saveQuizStateToStorage(state: QuizState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function clearQuizState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuizEngine(userId: string | null, gender: "male" | "female" | null) {
  const saved = useRef(loadQuizState());
  const hasResumable = !!saved.current;

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

  // Timing
  const quizStartTime = useRef<number | null>(null);
  const cardTimestamps = useRef<number[]>([]);

  // Derived
  const allWinners = useMemo(() => [...section3Winners, ...section3RunoffWinners], [section3Winners, section3RunoffWinners]);
  const isQuizActive = RESUMABLE_STAGES.includes(stage);

  const quizProgress = useMemo(() => {
    if (stage === "section1") return { current: currentValueIndex + 1, total: CORE_VALUES.length };
    if (stage === "section2") return { current: section2Index + 1, total: section1Selections.length };
    if (stage === "section3") return { current: section3PairIndex + 1, total: section3Pairs.length };
    if (stage === "section3-runoff") return { current: section3RunoffIndex + 1, total: section3RunoffPairs.length };
    return undefined;
  }, [stage, currentValueIndex, section2Index, section1Selections.length, section3PairIndex, section3Pairs.length, section3RunoffIndex, section3RunoffPairs.length]);

  const timerCardsRemaining = useMemo(() => {
    if (stage === "section1") {
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

  // ─── Internal helpers ────────────────────────────────────────────────────────

  const incrementCount = (value: string) => {
    setSelectionCounts((prev) => ({ ...prev, [value]: (prev[value] || 0) + 1 }));
  };

  const recordCardTimestamp = () => {
    const now = Date.now();
    if (!quizStartTime.current) quizStartTime.current = now;
    cardTimestamps.current = [...cardTimestamps.current, now];
  };

  // ─── Auto-save to localStorage ───────────────────────────────────────────────

  // Called by the parent via effect — we expose the state for it
  const getResumableState = (): QuizState => ({
    stage, areaOfLife, currentValueIndex, section1Selections, section2Index,
    section2Selections, section3PairIndex, section3Winners, section3Losers,
    section3RunoffIndex, section3RunoffWinners, selectionCounts, finalSixValues,
  });

  // ─── Public handlers ─────────────────────────────────────────────────────────

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

  const handleSortingComplete = () => setStage("section1");

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

  const persistSessionAndContinue = useCallback(async (): Promise<boolean> => {
    clearQuizState();
    const durationSeconds = quizStartTime.current
      ? Math.round((Date.now() - quizStartTime.current) / 1000)
      : undefined;
    trackFinalSelectionComplete(finalSixValues);
    const { error, sessionId } = await saveQuizSession(userId, areaOfLife, finalSixValues, allWinners, selectionCounts, durationSeconds);
    if (error) {
      toast.error("Your results couldn't be saved. Please check your connection and try again.");
      return false;
    }
    // Save guest session ID so it can be claimed after account creation
    if (!userId && sessionId) {
      try { localStorage.setItem(GUEST_SESSION_KEY, sessionId); } catch {}
    }
    trackQuizSaved(areaOfLife, durationSeconds);
    setStage("gratitude");
    return true;
  }, [userId, areaOfLife, finalSixValues, allWinners, selectionCounts]);

  const handleGratitudeComplete = () => setStage("dice");

  // ─── Section 3 pairing effects (must be called by parent in useEffect) ──────

  const buildSection3Pairs = () => {
    if (stage === "section3" && section3Pairs.length === 0 && section2Selections.length > 0) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < section2Selections.length; i += 2) {
        if (i + 1 < section2Selections.length) pairs.push([section2Selections[i], section2Selections[i + 1]]);
      }
      if (section2Selections.length % 2 === 1) {
        const byeValue = section2Selections[section2Selections.length - 1];
        setSection3Winners((prev) => [...prev, byeValue]);
        incrementCount(byeValue);
      }
      setSection3Pairs(pairs);
      if (pairs.length === 0) setStage("section4");
    }
  };

  const buildRunoffPairs = () => {
    if (stage === "section3-runoff" && section3RunoffPairs.length === 0 && section3Losers.length > 0) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < section3Losers.length; i += 2) {
        if (i + 1 < section3Losers.length) pairs.push([section3Losers[i], section3Losers[i + 1]]);
      }
      if (section3Losers.length % 2 === 1) {
        const byeValue = section3Losers[section3Losers.length - 1];
        setSection3RunoffWinners((prev) => [...prev, byeValue]);
        incrementCount(byeValue);
      }
      setSection3RunoffPairs(pairs);
      if (pairs.length === 0) setStage("section4");
    }
  };

  return {
    // State
    stage,
    setStage,
    areaOfLife,
    currentValueIndex,
    section1Selections,
    section2Index,
    section2Selections,
    section3Pairs,
    section3PairIndex,
    section3RunoffPairs,
    section3RunoffIndex,
    section3Winners,
    section3RunoffWinners,
    selectionCounts,
    finalSixValues,
    allWinners,
    isQuizActive,
    hasResumable,

    // Progress & timing
    quizProgress,
    timerCardsRemaining,
    cardTimestamps,

    // Handlers
    resetQuiz,
    handleAreaSelect,
    handleSortingComplete,
    handleSection1Right,
    handleSection1Left,
    handleSection2Right,
    handleSection2Left,
    handleSection3Selection,
    handleRunoffSelection,
    handleFinalValueToggle,
    persistSessionAndContinue,
    handleGratitudeComplete,

    // Pair building (call in useEffect)
    buildSection3Pairs,
    buildRunoffPairs,

    // Persistence
    getResumableState,
    saveQuizStateToStorage,
    clearQuizState,
  };
}

export { RESUMABLE_STAGES, getSection3Question, getFinalQuestion };

// ─── Context-aware question generators ────────────────────────────────────────

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
