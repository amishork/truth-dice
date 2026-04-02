import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Pencil, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { aggregateValuesAcrossSessions, getCoreValues, saveCoreValues } from "@/lib/quizSessions";
import type { QuizSession } from "@/lib/quizSessions";
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";

const InteractiveDie = lazy(() => import("@/components/InteractiveDie"));

const CONTEXTS = ["Hope", "Fear", "Person", "Place", "Physical Object", "Experience"];
const MIN_AREAS = 3;

interface CoreValuesSelectorProps {
  sessions: QuizSession[];
  userId: string | null;
  completedAreas: string[];
  /** Callback to highlight a value in the chord diagram */
  onHighlightValue?: (value: string | null) => void;
  /** Callback when core values are confirmed — dice should switch to these */
  onCoreValuesConfirmed?: (values: string[]) => void;
}

const CoreValuesSelector: React.FC<CoreValuesSelectorProps> = ({
  sessions,
  userId,
  completedAreas,
  onHighlightValue,
  onCoreValuesConfirmed,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);

  // Aggregate values across all sessions
  const rankedValues = useMemo(
    () => aggregateValuesAcrossSessions(sessions),
    [sessions]
  );

  // Pre-suggested: top 6 by area count
  const preSuggested = useMemo(
    () => new Set(rankedValues.slice(0, 6).map((v) => v.value)),
    [rankedValues]
  );

  // Load saved core values
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    getCoreValues(userId).then((saved) => {
      if (saved.length === 6) {
        setSelectedValues(saved);
        setIsLocked(true);
        onCoreValuesConfirmed?.(saved);
      }
      setLoading(false);
    });
  }, [userId]);

  // Confirmation animation trigger
  useEffect(() => {
    if (selectedValues.length === 6 && !isLocked && !isEditing) {
      setShowConfirmation(true);
      const timer = setTimeout(async () => {
        setShowConfirmation(false);
        setIsLocked(true);
        onCoreValuesConfirmed?.(selectedValues);
        if (userId) {
          const { error } = await saveCoreValues(userId, selectedValues);
          if (error) toast.error("Couldn't save your core values. Try again.");
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [selectedValues, isLocked, isEditing, userId, onCoreValuesConfirmed]);

  const toggleValue = useCallback(
    (value: string) => {
      setSelectedValues((prev) => {
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value);
        }
        if (prev.length >= 6) return prev;
        return [...prev, value];
      });
    },
    []
  );

  const handleEdit = () => {
    setIsLocked(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (userId) {
      getCoreValues(userId).then((saved) => {
        if (saved.length === 6) setSelectedValues(saved);
        setIsLocked(true);
        setIsEditing(false);
      });
    }
  };

  // ─── Teaser state ───────────────────────────────────────────────────────────
  if (completedAreas.length < MIN_AREAS) {
    return (
      <div className="hub-dice-area mt-6">
        <div className="sketch-card p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lock className="h-4 w-4 text-muted-foreground/40" />
            <h3 className="text-sm font-semibold text-foreground">Your Core Values</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Complete {MIN_AREAS - completedAreas.length} more{" "}
            {MIN_AREAS - completedAreas.length === 1 ? "area" : "areas"} of life to
            unlock your Core Values — the values that define you across every context.
          </p>
          <div className="mt-4 flex justify-center gap-1">
            {Array.from({ length: MIN_AREAS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full ${
                  i < completedAreas.length ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="hub-dice-area mt-6 space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  // ─── Split values into columns ──────────────────────────────────────────────
  const midpoint = Math.ceil(rankedValues.length / 2);
  const col1 = rankedValues.slice(0, midpoint);
  const col2 = rankedValues.slice(midpoint);

  const isSelecting = !isLocked || isEditing;

  return (
    <div className="mt-6 space-y-4">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Your Core Values</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSelecting
              ? "Select the 6 core values that you want to make incarnate across all areas of your life."
              : `${selectedValues.length} core values locked in.`}
          </p>
        </div>
        {isLocked && !isEditing && (
          <Button variant="ghost" size="sm" onClick={handleEdit} className="gap-1.5 text-xs">
            <Pencil className="h-3 w-3" /> Edit
          </Button>
        )}
        {isEditing && (
          <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-xs">
            Cancel
          </Button>
        )}
      </div>

      {/* ─── Values list + chord diagram interaction ─── */}
      {isSelecting && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-2 gap-1.5"
        >
          {[col1, col2].map((col, colIdx) => (
            <div key={colIdx} className="space-y-1">
              {col.map(({ value, areaCount }) => {
                const isSelected = selectedValues.includes(value);
                const isSuggested = preSuggested.has(value) && !isSelected;
                const isDisabled = selectedValues.length >= 6 && !isSelected;

                return (
                  <button
                    key={value}
                    onClick={() => !isDisabled && toggleValue(value)}
                    onMouseEnter={() => onHighlightValue?.(value)}
                    onMouseLeave={() => onHighlightValue?.(null)}
                    disabled={isDisabled}
                    className={`
                      group flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-left transition-all text-xs
                      ${isSelected
                        ? "bg-primary text-primary-foreground"
                        : isSuggested
                        ? "bg-primary/8 text-foreground ring-1 ring-primary/20"
                        : "bg-muted/40 text-foreground hover:bg-muted/70"
                      }
                      ${isDisabled ? "opacity-35 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <span className="flex-1 truncate font-medium">{value}</span>
                    <span
                      className={`
                        flex h-4 min-w-4 items-center justify-center rounded text-[9px] font-semibold px-1
                        ${isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-foreground/8 text-muted-foreground"
                        }
                      `}
                    >
                      {areaCount}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Selection count */}
          <div className="col-span-2 text-center pt-1">
            <span className="text-[10px] font-medium text-muted-foreground">
              {selectedValues.length} of 6 selected
            </span>
          </div>
        </motion.div>
      )}

      {/* ─── 6 Slots ─── */}
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => {
          const value = selectedValues[i];
          const isPulsing = showConfirmation;

          return (
            <motion.div
              key={i}
              className={`
                relative flex items-center justify-center rounded-md border text-center
                aspect-square
                ${value
                  ? "border-primary/40 bg-primary/5"
                  : "border-dashed border-border bg-muted/20"
                }
              `}
              animate={
                isPulsing
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(155, 27, 58, 0)",
                        "0 0 12px 4px rgba(155, 27, 58, 0.3)",
                        "0 0 0 0 rgba(155, 27, 58, 0)",
                      ],
                    }
                  : {}
              }
              transition={
                isPulsing
                  ? { duration: 0.8, repeat: 1, ease: "easeInOut" }
                  : {}
              }
            >
              {value ? (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center p-1 cursor-pointer rounded-md hover:bg-primary/10 transition-colors"
                  onClick={() => isSelecting && toggleValue(value)}
                  title={isSelecting ? `Remove ${value}` : value}
                >
                  <span className="text-[8px] sm:text-[9px] font-semibold text-foreground leading-tight text-center break-words">
                    {value}
                  </span>
                </motion.button>
              ) : (
                <span className="text-[9px] text-muted-foreground/30 font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ─── 3D Dice (after confirmation) ─── */}
      <AnimatePresence>
        {isLocked && !isEditing && selectedValues.length === 6 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Dice row — 3D dice left, virtual result boxes right */}
            <div className="flex items-center justify-center gap-4 py-2">
              <Suspense
                fallback={
                  <div className="flex gap-3">
                    <Skeleton className="h-24 w-24 rounded-md" />
                    <Skeleton className="h-24 w-24 rounded-md" />
                  </div>
                }
              >
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <InteractiveDie
                      faceLabels={CONTEXTS}
                      variant="light"
                      size={110}
                    />
                    <p className="text-[8px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                      Context
                    </p>
                  </div>
                  <div className="text-center">
                    <InteractiveDie
                      faceLabels={selectedValues}
                      variant="dark"
                      size={110}
                    />
                    <p className="text-[8px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                      Values
                    </p>
                  </div>
                </div>
              </Suspense>
            </div>

            {/* CTA */}
            <motion.div
              className="text-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() =>
                  window.open(
                    `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="h-4 w-4" />
                A Custom Game — To Share Your Values
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoreValuesSelector;
