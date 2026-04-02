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
import DiceProductPopup from "@/components/DiceProductPopup";
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
  const [coreSlots, setCoreSlots] = useState<string[]>([]);
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

      {stage === "sorting" && <TheSorting onComplete={handleSortingComplete} />}
      {stage === "gratitude" && <GratitudeMoment onComplete={handleGratitudeComplete} />}

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
                <Button onClick={handlePersistAndContinue} size="lg" className="w-full">
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
          {confirmedCoreValues && confirmedCoreValues.length === 6 && (
            <DiceProductPopup coreValues={confirmedCoreValues} />
          )}

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

              {/* What's Next — decision tree for services */}
              {activeValues.length > 0 && (
                <div className="hub-sidebar-card">
                  <WhatsNext coreValues={activeValues} />
                </div>
              )}
            </aside>

            {/* ─── Col 2: Slots → Dice → Diagram → Share → Journey ─── */}
            <div className="hub-center">

              {/* ─── Confirmed Core 6 Slots (large, top of column) ─── */}
              {coreLocked && confirmedCoreValues && confirmedCoreValues.length === 6 && (
                <div className="mb-5">
                  <p className="label-technical text-center mb-2">Your Core Values</p>
                  <div className="grid grid-cols-6 gap-2">
                    {confirmedCoreValues.map((value, i) => (
                      <motion.div
                        key={`slot-${i}-${value}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
                        className="aspect-square rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center p-1.5"
                      >
                        <span className="text-[9px] sm:text-[10px] font-bold text-foreground text-center leading-tight break-words uppercase">
                          {value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Chord Diagram + Values List side by side */}
              <div className="hub-diagram-area">
                <div className="flex gap-4 items-start">
                  {/* Chord diagram — left */}
                  <div className="flex-1 min-w-0">
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
                  </div>

                  {/* Core Values Selector — right of diagram (only when 3+ areas) */}
                  {completedAreas.length >= 3 && isAuthenticated && user && (
                    <div className="w-[200px] flex-shrink-0">
                      <CoreValuesSelector
                        sessions={userSessions}
                        userId={user.id}
                        completedAreas={completedAreas}
                        onHighlightValue={setHighlightedValue}
                        onCoreValuesConfirmed={setConfirmedCoreValues}
                        onSelectionChange={(vals, locked) => {
                          setCoreSlots(vals);
                          setCoreLocked(locked);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Core Values teaser — below diagram when < 3 areas */}
                {completedAreas.length < 3 && completedAreas.length >= 1 && isAuthenticated && user && (
                  <CoreValuesSelector
                    sessions={userSessions}
                    userId={user.id}
                    completedAreas={completedAreas}
                    onHighlightValue={setHighlightedValue}
                    onCoreValuesConfirmed={setConfirmedCoreValues}
                    onSelectionChange={(vals, locked) => {
                      setCoreSlots(vals);
                      setCoreLocked(locked);
                    }}
                  />
                )}
              </div>

              {/* Share & Save — below diagram */}
              {activeValues.length >= 6 && (
                <div className="hub-dice-area mt-4 space-y-5">
                  <ShareValues values={activeValues} />
                  {!isAuthenticated && (
                    <EmailMyResults values={activeValues} areaLabel={areaLabel} />
                  )}
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
                  <ValuesChat rolledValue={dice1Result} rolledContext={dice2Result} coreValues={activeValues} onTriggerProductPopup={() => setShowDicePopup(true)} />
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
