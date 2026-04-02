import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { aggregateValuesAcrossSessions, getCoreValues, saveCoreValues } from "@/lib/quizSessions";
import type { QuizSession } from "@/lib/quizSessions";

const MIN_AREAS = 3;

interface CoreValuesSelectorProps {
  sessions: QuizSession[];
  userId: string | null;
  completedAreas: string[];
  onHighlightValue?: (value: string | null) => void;
  onCoreValuesConfirmed?: (values: string[]) => void;
  onSelectionChange?: (values: string[], locked: boolean) => void;
}

const CoreValuesSelector: React.FC<CoreValuesSelectorProps> = ({
  sessions,
  userId,
  completedAreas,
  onHighlightValue,
  onCoreValuesConfirmed,
  onSelectionChange,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);

  const rankedValues = useMemo(
    () => aggregateValuesAcrossSessions(sessions),
    [sessions]
  );

  const preSuggested = useMemo(
    () => new Set(rankedValues.slice(0, 6).map((v) => v.value)),
    [rankedValues]
  );

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedValues, isLocked && !isEditing);
  }, [selectedValues, isLocked, isEditing]);

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

  // Confirmation animation on 6th selection
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
  }, [selectedValues, isLocked, isEditing, userId]);

  const toggleValue = useCallback((value: string) => {
    setSelectedValues((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      if (prev.length >= 6) return prev;
      return [...prev, value];
    });
  }, []);

  const handleEdit = () => { setIsLocked(false); setIsEditing(true); };

  const handleCancelEdit = () => {
    if (userId) {
      getCoreValues(userId).then((saved) => {
        if (saved.length === 6) setSelectedValues(saved);
        setIsLocked(true);
        setIsEditing(false);
      });
    }
  };

  // Teaser
  if (completedAreas.length < MIN_AREAS) {
    return (
      <div className="mt-4">
        <div className="sketch-card p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
            <h3 className="text-xs font-semibold text-foreground">Your Core Values</h3>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Complete {MIN_AREAS - completedAreas.length} more{" "}
            {MIN_AREAS - completedAreas.length === 1 ? "area" : "areas"} to unlock.
          </p>
          <div className="mt-3 flex justify-center gap-1">
            {Array.from({ length: MIN_AREAS }).map((_, i) => (
              <div key={i} className={`h-1 w-6 rounded-full ${i < completedAreas.length ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Skeleton className="h-28 w-full rounded-md mt-4" />;

  const midpoint = Math.ceil(rankedValues.length / 2);
  const col1 = rankedValues.slice(0, midpoint);
  const col2 = rankedValues.slice(midpoint);
  const isSelecting = !isLocked || isEditing;

  return (
    <div className="mt-2 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">
          {isSelecting ? "Select Your Core 6" : "Core Values Locked"}
        </h3>
        {isLocked && !isEditing && (
          <Button variant="ghost" size="sm" onClick={handleEdit} className="gap-1 text-[10px] h-6 px-2">
            <Pencil className="h-2.5 w-2.5" /> Edit
          </Button>
        )}
        {isEditing && (
          <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-[10px] h-6 px-2">
            Cancel
          </Button>
        )}
      </div>

      {/* Values list — only when selecting */}
      {isSelecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-1"
        >
          {[col1, col2].map((col, colIdx) => (
            <div key={colIdx} className="space-y-0.5">
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
                      flex items-center gap-1.5 w-full rounded px-2 py-1 text-left transition-all
                      ${isSelected
                        ? "bg-primary text-primary-foreground"
                        : isSuggested
                        ? "bg-primary/8 ring-1 ring-primary/20 text-foreground"
                        : "bg-muted/40 text-foreground hover:bg-muted/60"
                      }
                      ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <span className="flex-1 truncate text-[10px] font-medium">{value}</span>
                    <span className={`
                      flex h-3.5 min-w-3.5 items-center justify-center rounded text-[8px] font-bold px-0.5
                      ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-foreground/8 text-muted-foreground"}
                    `}>
                      {areaCount}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          <p className="col-span-2 text-center text-[9px] text-muted-foreground pt-1">
            {selectedValues.length} of 6 selected
          </p>
        </motion.div>
      )}

      {/* Locked summary when not editing */}
      {isLocked && !isEditing && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((v) => (
            <span key={v} className="text-[9px] font-medium bg-primary/10 text-primary rounded px-1.5 py-0.5">
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoreValuesSelector;
