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
import CommitmentEscalation from "@/components/CommitmentEscalation";
import WhatsNext from "@/components/WhatsNext";
import TheSorting from "@/components/TheSorting";
import GratitudeMoment from "@/components/GratitudeMoment";
import EmailMyResults from "@/components/EmailMyResults";
import CoreValuesSelector from "@/components/CoreValuesSelector";
import QuizMilestone from "@/components/QuizMilestone";
import PhaseBanner from "@/components/PhaseBanner";
import QuizTimer from "@/components/QuizTimer";
import AuthModal from "@/components/AuthModal";
import AreaOfLifePicker, { AREAS_OF_LIFE, getAreaLabel } from "@/components/AreaOfLifePicker";
import { useAuth } from "@/contexts/AuthContext";
import { useDynamicTabTitle, useAnimatedFavicon } from "@/hooks/useDynamicTabTitle";

import { useCommitmentTracker } from "@/hooks/useCommitmentTracker";
import { useQuizEngine, RESUMABLE_STAGES, getSection3Question, getFinalQuestion } from "@/hooks/useQuizEngine";
import { CORE_VALUES, DICE_CONTEXTS } from "@/data/values";
import { trackResultsViewed, trackDiceRolled } from "@/lib/analytics";
import { getCompletedAreas, getUserSessions, claimGuestSession } from "@/lib/quizSessions";
import type { QuizSession } from "@/lib/quizSessions";

const ValuesChordDiagram = lazy(() => import("@/components/ValuesChordDiagram"));
const ValuesChat = lazy(() => import("@/components/ValuesChat").then(mod => ({ default: mod.ValuesChat })));
const InteractiveDie = lazy(() => import("@/components/InteractiveDie"));
import ShareValues from "@/components/ShareValues";
import ValuesPosterDownload from "@/components/ValuesPosterDownload";
import type { DieHandle } from "@/components/InteractiveDie";

const Quiz = () => {
  const { user, loading: authLoading, isAuthenticated, gender } = useAuth();

  // ─── Quiz engine (all quiz flow state + handlers) ───────────────────────────
  const quiz = useQuizEngine(user?.id ?? null, gender);
  const {
    stage, setStage, areaOfLife, currentValueIndex, section1Selections,
    section2Index, section2Selections, section3Pairs, section3PairIndex,
    section3RunoffPairs, section3RunoffIndex, selectionCounts,
    finalSixValues, allWinners, isQuizActive, hasResumable,
    quizProgress, timerCardsRemaining, cardTimestamps,
    handleAreaSelect, handleSortingComplete, handleSection1Right, handleSection1Left,
    handleSection2Right, handleSection2Left, handleSection3Selection,
    handleRunoffSelection, handleFinalValueToggle, persistSessionAndContinue,
    handleGratitudeComplete, buildSection3Pairs, buildRunoffPairs,
    getResumableState, saveQuizStateToStorage, resetQuiz,
  } = quiz;

  const [showResumePrompt, setShowResumePrompt] = useState<boolean>(hasResumable);

  // ─── Dashboard state (sessions, dice, UI) ───────────────────────────────────
  const [completedAreas, setCompletedAreas] = useState<string[]>([]);
  const [userSessions, setUserSessions] = useState<QuizSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [dashboardValues, setDashboardValues] = useState<string[]>([]);
  const [dashboardAllWinners, setDashboardAllWinners] = useState<string[]>([]);

  const [dice1Result, setDice1Result] = useState<string>("");
  const [dice2Result, setDice2Result] = useState<string>("");
  const [isRolling, setIsRolling] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const [confirmedCoreValues, setConfirmedCoreValues] = useState<string[] | null>(null);
  const [coreLocked, setCoreLocked] = useState(false);
  const valueDieRef = useRef<DieHandle>(null);
  const contextDieRef = useRef<DieHandle>(null);

  // ─── Derived ────────────────────────────────────────────────────────────────
  const areaOfLifeData = useMemo(() => AREAS_OF_LIFE.find((a) => a.id === areaOfLife) ?? null, [areaOfLife]);
  const areaLabel = useMemo(() => areaOfLifeData ? getAreaLabel(areaOfLifeData, gender) : "", [areaOfLifeData, gender]);
  const activeValues = dashboardValues.length > 0 ? dashboardValues : finalSixValues;
  const activeAllWinners = dashboardAllWinners.length > 0 ? dashboardAllWinners : allWinners;

  // ─── Auth-based routing ─────────────────────────────────────────────────────
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
  }, [authLoading, isAuthenticated, user, stage, hasResumable, setStage]);

  // ─── Hooks ──────────────────────────────────────────────────────────────────
  useDynamicTabTitle(stage === "sorting" || stage === "gratitude" ? "section1" : stage, quizProgress);
  useAnimatedFavicon(true);

  const { markMilestone } = useCommitmentTracker();
  useEffect(() => { markMilestone("quiz_started"); }, [markMilestone]);

  // Auto-save quiz state to localStorage
  useEffect(() => {
    if (!RESUMABLE_STAGES.includes(stage)) return;
    saveQuizStateToStorage(getResumableState());
  }, [stage, areaOfLife, currentValueIndex, section1Selections, section2Index, section2Selections, section3PairIndex, finalSixValues, selectionCounts]);

  // Scroll to top on stage change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [stage]);

  // Build section 3 pairs when entering that stage
  useEffect(() => { buildSection3Pairs(); }, [stage, section2Selections, section3Pairs]);
  useEffect(() => { buildRunoffPairs(); }, [stage]);

  // Track results viewed
  useEffect(() => {
    if (stage === "dice") {
      markMilestone("results_viewed");
      trackResultsViewed(areaOfLife);
    }
  }, [stage, markMilestone, areaOfLife]);

  // ─── Dashboard handlers ─────────────────────────────────────────────────────
  const handleGuestContinue = () => {
    setShowAuthModal(false);
  };

  const routeAfterAuth = useCallback(async (userId: string) => {
    setSessionsLoading(true);
    // Claim any guest session created before account creation
    await claimGuestSession(userId);
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
  }, [setStage]);

  // Handle auth state change (OAuth redirect or modal sign-in)
  const prevAuthRef = useRef(isAuthenticated);
  useEffect(() => {
    if (!prevAuthRef.current && isAuthenticated && user && !authLoading) {
      routeAfterAuth(user.id);
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, user, authLoading, routeAfterAuth]);

  const handlePersistAndContinue = useCallback(async () => {
    const success = await persistSessionAndContinue();
    if (success) {
      setDashboardValues(finalSixValues);
      setDashboardAllWinners(allWinners);
      if (user) {
        const areas = await getCompletedAreas(user.id);
        setCompletedAreas(areas);
        const sessions = await getUserSessions(user.id);
        setUserSessions(sessions);
        if (sessions.length > 0) setSelectedSessionId(sessions[0].id);
      }
    }
  }, [persistSessionAndContinue, finalSixValues, allWinners, user]);

  const handleSessionSelect = (session: QuizSession) => {
    setSelectedSessionId(session.id);
    setDashboardValues(session.final_six_values);
    setDashboardAllWinners(session.all_winners);
    setDice1Result("");
    setDice2Result("");
  };

  const rollDice = () => {
    const diceValues = confirmedCoreValues ?? activeValues;
    if (diceValues.length === 0) return;
    setIsRolling(true);
    setDice1Result("");
    setDice2Result("");
    trackDiceRolled();

    const valueIdx = Math.floor(Math.random() * Math.min(diceValues.length, 6));
    const contextIdx = Math.floor(Math.random() * Math.min(DICE_CONTEXTS.length, 6));
    const valueResult = diceValues[valueIdx];
    const contextResult = DICE_CONTEXTS[contextIdx];

    // Trigger 3D dice animations if refs are available
    if (confirmedCoreValues && valueDieRef.current && contextDieRef.current) {
      Promise.all([
        valueDieRef.current.roll(valueIdx),
        contextDieRef.current.roll(contextIdx),
      ]).then(() => {
        setDice1Result(valueResult);
        setDice2Result(contextResult);
        setIsRolling(false);
      });
    } else {
      window.setTimeout(() => {
        setDice1Result(valueResult);
        setDice2Result(contextResult);
        setIsRolling(false);
      }, 600);
    }
  };

  // ─── Sub-components ─────────────────────────────────────────────────────────
  const Divider = () => (
    <div className="my-10 flex w-full max-w-md items-center gap-4 self-center">
      <div className="h-px flex-1 bg-border" />
      <div className="h-2 w-2 rotate-45 border border-border" />
      <div className="h-px flex-1 bg-border" />
    </div>
  );

  // Quiz section definitions with disproportionate widths
  const QUIZ_SECTIONS = [
    { id: "section1", label: "Gut Check", width: 45 },
    { id: "section2", label: "True Self", width: 25 },
    { id: "section3", label: "Legacy", width: 17 },
    { id: "final", label: "Final Cut", width: 13 },
  ];

  const getActiveSection = (): number => {
    if (stage === "section1") return 0;
    if (stage === "section2") return 1;
    if (stage === "section3" || stage === "section3-runoff") return 2;
    if (stage === "section4" || stage === "final") return 3;
    return 0;
  };

  const QuizTop = ({ current, total }: { current: number; total: number }) => {
    const activeIdx = getActiveSection();
    const pct = Math.round((current / Math.max(total, 1)) * 100);

    return (
      <div className="mx-auto w-full max-w-3xl px-6 pt-24 pb-2">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/")}>Exit Quiz</Button>
            {isAuthenticated && userSessions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 text-[11px]"
                onClick={() => setStage("dice")}
              >
                ← My Results
              </Button>
            )}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
            {QUIZ_SECTIONS[activeIdx]?.label} — {current} of {Math.max(total, 1)}
          </span>
        </div>

        {/* Segmented progress bar with dot milestones */}
        <div className="flex items-center w-full gap-0">
          {QUIZ_SECTIONS.map((section, i) => {
            const isComplete = i < activeIdx;
            const isActive = i === activeIdx;
            const isFuture = i > activeIdx;

            return (
              <React.Fragment key={section.id}>
                {/* Dot milestone */}
                <div className="flex flex-col items-center shrink-0" style={{ zIndex: 2 }}>
                  <div
                    className={`rounded-full border-2 transition-all duration-300 ${
                      isComplete
                        ? "w-3 h-3 bg-primary border-primary"
                        : isActive
                        ? "w-3.5 h-3.5 bg-primary border-primary shadow-[0_0_6px_rgba(155,27,58,0.4)]"
                        : "w-2.5 h-2.5 bg-muted border-border"
                    }`}
                  />
                </div>

                {/* Segment bar */}
                {i < QUIZ_SECTIONS.length - 1 && (
                  <div
                    className="h-1 rounded-full bg-border relative overflow-hidden"
                    style={{ width: `${section.width}%`, flexShrink: 0 }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: isComplete ? "100%" : isActive ? `${pct}%` : "0%",
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Final dot */}
          <div className="flex flex-col items-center shrink-0" style={{ zIndex: 2 }}>
            <div className={`rounded-full border-2 transition-all duration-300 ${
              activeIdx >= QUIZ_SECTIONS.length - 1 && pct >= 100
                ? "w-3 h-3 bg-primary border-primary"
                : "w-2.5 h-2.5 bg-muted border-border"
            }`} />
          </div>
        </div>

        {/* Section labels below dots */}
        <div className="flex items-start w-full mt-1.5" style={{ gap: 0 }}>
          {QUIZ_SECTIONS.map((section, i) => {
            const isActive = i === getActiveSection();
            const isComplete = i < getActiveSection();
            return (
              <div
                key={`label-${section.id}`}
                className="text-center"
                style={{ width: i < QUIZ_SECTIONS.length - 1 ? `${section.width}%` : "auto", flexShrink: 0 }}
              >
                <span className={`text-[8px] tracking-wider uppercase ${
                  isActive ? "text-primary font-semibold" : isComplete ? "text-primary/50" : "text-muted-foreground/40"
                }`}>
                  {section.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ContextBanner = () => null; // Sentence starter moved into value cards

  const showTimer = ["section1", "section2", "section3", "section3-runoff"].includes(stage);
  const section3Q = getSection3Question(areaOfLife, gender);
  const finalQ = getFinalQuestion(areaOfLife, gender);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div id="main" className="min-h-screen bg-background">
      <PageMeta title="Discover Your Core Values | Free Assessment" description="Discover your 6 core values in a guided assessment. Free, no account required. Understand what drives you and how to live with greater intention." path="/quiz" />

      <AuthModal
        open={showAuthModal}
        onClose={handleGuestContinue}
        onContinueAsGuest={handleGuestContinue}
      />

      {showResumePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm px-6">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-xl text-center space-y-5">
            <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">Quiz in Progress</p>
            <h2 className="font-serif text-2xl text-foreground">You left off here.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have an unfinished values assessment. Pick up where you left off, or start fresh from the beginning.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => setShowResumePrompt(false)}
                className="w-full rounded-lg bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Resume where I left off
              </button>
              <button
                onClick={() => { resetQuiz(); setShowResumePrompt(false); setStage("area-of-life"); }}
                className="w-full rounded-lg border border-border px-6 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Start fresh
              </button>
            </div>
          </div>
        </div>
      )}


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

      {stage === "sorting" && <TheSorting onComplete={handleSortingComplete} />}
      {stage === "gratitude" && <GratitudeMoment onComplete={handleGratitudeComplete} />}

      {stage === "section1" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <ContextBanner />
          <QuizMilestone current={currentValueIndex + 1} total={CORE_VALUES.length} />
          <QuizTop current={currentValueIndex + 1} total={CORE_VALUES.length} />
          <div className="flex items-center justify-center px-6 mt-6">
            <ValueCard value={CORE_VALUES[currentValueIndex]} onSwipeLeft={handleSection1Left} onSwipeRight={handleSection1Right} leftLabel="No" rightLabel="Resonates" prefix={areaLabel} />
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
              <QuizTop current={section2Index + 1} total={section1Selections.length} />
              <div className="flex items-center justify-center px-6 mt-6">
                <ValueCard value={section1Selections[section2Index]} onSwipeLeft={handleSection2Left} onSwipeRight={handleSection2Right} leftLabel="Admire in others" rightLabel="True / Aspire" prefix={areaLabel} />
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
          <QuizTop current={section3PairIndex + 1} total={section3Pairs.length} />
          <div className="flex items-center justify-center px-6 mt-6">
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
          <QuizTop current={section3RunoffIndex + 1} total={section3RunoffPairs.length} />
          <div className="flex items-center justify-center px-6 mt-6">
            <ValuePair value1={section3RunoffPairs[section3RunoffIndex][0]} value2={section3RunoffPairs[section3RunoffIndex][1]} onSelect={handleRunoffSelection} title={section3Q} />
          </div>
          <div className="mx-auto w-full max-w-md px-6 pb-10">
            <PhaseBanner text="You've already said yes to each of these twice — at the gut level and the head level. Now go deeper. If someone looked into the very core of who you are and could only find one of these two values, which would you hope they'd see?" />
          </div>
          <QuizTimer cardTimestamps={cardTimestamps.current} totalCardsRemaining={timerCardsRemaining} visible={showTimer} />
        </div>
      )}

      {stage === "final" && (
        <div className="min-h-screen bg-background">
          <Navigation quizMode />
          <QuizTop current={1} total={1} />
          <div className="mx-auto w-full max-w-3xl px-6 mt-6">
            <PhaseBanner text={finalQ} />
            <p className="text-center text-xs text-muted-foreground mt-3 mb-6">
              {finalSixValues.length} of 6 selected
            </p>

            {/* Value card grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allWinners.map((value, index) => {
                const isSelected = finalSixValues.includes(value);
                const isDisabled = !isSelected && finalSixValues.length >= 6;
                return (
                  <button
                    key={`${value}-${index}`}
                    onClick={() => handleFinalValueToggle(value)}
                    disabled={isDisabled}
                    className="quiz-pair-card"
                    style={{
                      borderColor: isSelected ? "hsl(350, 78%, 34%)" : undefined,
                      boxShadow: isSelected
                        ? "0 0 0 2px hsl(350, 78%, 34%, 0.3), 0 0 12px hsl(350, 78%, 34%, 0.1), 0 4px 12px -2px hsl(0, 0%, 0%, 0.06)"
                        : undefined,
                      opacity: isDisabled ? 0.35 : 1,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                    }}
                  >
                    {value}
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {finalSixValues.length === 6 && (
              <div className="mt-8">
                <Button onClick={handlePersistAndContinue} size="lg" className="w-full">
                  Continue to your results <ChevronRight />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "dice" && (
        <div className="min-h-screen bg-background">
          <Navigation />

          <div className="hub-page">
            {/* ─── Col 1: Discoveries sidebar ─── */}
            <aside className="hub-sidebar">

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
                <>
                  {/* Account creation prompt */}
                  {!isAuthenticated && (
                    <div className="hub-sidebar-card">
                      <h3 className="text-sm font-semibold text-foreground mb-2">Save your results</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Create a free account to discover your values across every area of life and unlock your full values profile.
                      </p>
                      <button onClick={() => setShowAuthModal(true)} className="mt-3 text-sm font-medium text-primary hover:underline">
                        Create free account →
                      </button>
                    </div>
                  )}

                  {/* Grayed-out areas of life preview */}
                  <div className="hub-sidebar-card opacity-40">
                    <p className="label-technical mb-3">Areas to Explore</p>
                    <div className="space-y-0.5">
                      {AREAS_OF_LIFE.map((area) => {
                        const label = getAreaLabel(area, gender);
                        const isCompleted = completedAreas.includes(area.id);
                        return (
                          <div
                            key={area.id}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md"
                          >
                            <span className={`text-sm ${isCompleted ? "" : "grayscale opacity-50"}`}>{area.icon}</span>
                            <span className={`text-[0.75rem] ${isCompleted ? "text-foreground font-medium" : "text-muted-foreground/60"}`}>{label}</span>
                            {isCompleted && <span className="ml-auto text-[8px] font-mono text-primary">✓</span>}
                            {!isCompleted && <Lock className="ml-auto h-2.5 w-2.5 text-muted-foreground/20" />}
                          </div>
                        );
                      })}
                    </div>
                    {!isAuthenticated && (
                      <p className="text-[9px] text-muted-foreground/50 text-center mt-3 italic">
                        Create an account to unlock all areas
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* What's Next — decision tree for services */}
              {activeValues.length > 0 && (
                <div className="hub-sidebar-card">
                  <WhatsNext coreValues={activeValues} />
                </div>
              )}
            </aside>

            {/* ─── Col 2: Dice → Diagram → Share → Journey ─── */}
            <div className="hub-center">

              {/* ─── Dice Area ─── */}
              <div className="hub-dice-area">
                <div className="grid grid-cols-2 gap-3">
                  {/* Value die box */}
                  <div className="sketch-card p-3 text-center flex flex-col items-center">
                    <p className="label-technical mb-1">Value</p>
                    {confirmedCoreValues && coreLocked ? (
                      <Suspense fallback={<Skeleton className="h-40 w-40 rounded-md" />}>
                        <InteractiveDie
                          ref={valueDieRef}
                          faceLabels={confirmedCoreValues}
                          variant="dark"
                          size={180}
                        />
                      </Suspense>
                    ) : (
                      <div className={`min-h-14 flex items-center justify-center ${isRolling ? "animate-dice-roll" : ""}`}>
                        <p className="text-base font-medium text-foreground">{dice1Result || "?"}</p>
                      </div>
                    )}
                  </div>

                  {/* Context die box */}
                  <div className="sketch-card p-3 text-center flex flex-col items-center">
                    <p className="label-technical mb-1">Context</p>
                    {confirmedCoreValues && coreLocked ? (
                      <Suspense fallback={<Skeleton className="h-40 w-40 rounded-md" />}>
                        <InteractiveDie
                          ref={contextDieRef}
                          faceLabels={DICE_CONTEXTS}
                          variant="light"
                          size={180}
                        />
                      </Suspense>
                    ) : (
                      <div className={`min-h-14 flex items-center justify-center ${isRolling ? "animate-dice-roll" : ""}`}>
                        <p className="text-base font-medium text-foreground">{dice2Result || "?"}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={rollDice} disabled={isRolling} size="lg" className="w-full mt-4">
                  <Dices /> {isRolling ? "Rolling..." : "Roll dice"}
                </Button>
              </div>

              {/* ─── Core Values Selector (horizontal, full width) ─── */}
              {isAuthenticated && user && (
                <CoreValuesSelector
                  sessions={userSessions}
                  userId={user.id}
                  completedAreas={completedAreas}
                  onHighlightValue={setHighlightedValue}
                  onCoreValuesConfirmed={setConfirmedCoreValues}
                  onSelectionChange={(_vals, locked) => {
                    setCoreLocked(locked);
                  }}
                />
              )}

              {/* ─── Chord Diagram (centered) ─── */}
              <div className="hub-diagram-area">
                {isAuthenticated && userSessions.length > 0 ? (
                  <Suspense fallback={
                    <div className="flex flex-col items-center gap-3 py-8">
                      <Skeleton className="h-64 w-64 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  }>
                    <ValuesChordDiagram
                      sessions={userSessions}
                      activeSessionId={selectedSessionId}
                      externalHighlight={highlightedValue}
                    />
                  </Suspense>
                ) : (
                  /* Demo grayed-out chord diagram + locked value tags for guests */
                  <div className="relative">
                    <div className="opacity-20 pointer-events-none grayscale">
                      <Suspense fallback={null}>
                        <ValuesChordDiagram
                          sessions={[
                            { id: "demo-1", user_id: null, area_of_life: "personal", final_six_values: ["Love", "Wisdom", "Courage", "Integrity", "Faith", "Purpose"], all_winners: [], selection_counts: {}, created_at: "" },
                            { id: "demo-2", user_id: null, area_of_life: "leader", final_six_values: ["Integrity", "Courage", "Vision", "Wisdom", "Service", "Discipline"], all_winners: [], selection_counts: {}, created_at: "" },
                            { id: "demo-3", user_id: null, area_of_life: "work", final_six_values: ["Purpose", "Discipline", "Integrity", "Growth", "Excellence", "Courage"], all_winners: [], selection_counts: {}, created_at: "" },
                          ] as Array<{ id: string; user_id: string | null; area_of_life: string; final_six_values: string[]; all_winners: string[]; selection_counts: Record<string, number>; created_at: string }>}
                          activeSessionId={null}
                        />
                      </Suspense>
                    </div>

                    {/* Demo locked value tags — grayed out */}
                    <div className="opacity-15 pointer-events-none mt-4">
                      <div className="grid grid-cols-6 gap-2">
                        {["Love", "Wisdom", "Courage", "Integrity", "Faith", "Purpose"].map((v) => (
                          <div key={v} className="aspect-square flex items-center justify-center rounded-lg bg-muted/30 p-2"
                            style={{ boxShadow: "0 0 8px rgba(155, 27, 58, 0.15)" }}>
                            <span className="text-[10px] font-semibold text-foreground text-center">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Unlock prompt overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center bg-background/80 backdrop-blur-sm rounded-lg px-6 py-4 border border-border shadow-lg max-w-xs">
                        <Lock className="h-5 w-5 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-foreground">Values Profile</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Create an account and take the assessment for 2 more areas of life to unlock your cross-area values analysis.
                        </p>
                        {!isAuthenticated && (
                          <button onClick={() => setShowAuthModal(true)} className="mt-3 text-xs font-medium text-primary hover:underline">
                            Create free account →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Share & Save — below diagram */}
              {activeValues.length >= 6 && (
                <div className="hub-dice-area mt-4 space-y-5">
                  <ShareValues values={activeValues} />
                  {!isAuthenticated && (
                    <EmailMyResults values={activeValues} areaLabel={areaLabel} />
                  )}
                  <ValuesPosterDownload coreValues={activeValues} areaLabel={areaLabel || undefined} sessions={userSessions} />
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
                <Suspense fallback={
                  <div className="flex flex-col gap-3 p-6">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex-1" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                }>
                  <ValuesChat rolledValue={dice1Result} rolledContext={dice2Result} coreValues={activeValues} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
