import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock, Pencil, Save } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  const rankedValues = useMemo(() => aggregateValuesAcrossSessions(sessions), [sessions]);
  const preSuggested = useMemo(() => new Set(rankedValues.slice(0, 6).map((v) => v.value)), [rankedValues]);

  useEffect(() => { onSelectionChange?.(selectedValues, isLocked && !isEditing); }, [selectedValues, isLocked, isEditing]);

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

  // Auto-lock on first 6 selection
  useEffect(() => {
    if (selectedValues.length === 6 && !isLocked && !isEditing) {
      const timer = setTimeout(async () => {
        setIsLocked(true);
        onCoreValuesConfirmed?.(selectedValues);
        if (userId) {
          const { error } = await saveCoreValues(userId, selectedValues);
          if (error) toast.error("Couldn't save your core values. Try again.");
        }
      }, 800);
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
  const handleSave = async () => {
    if (selectedValues.length !== 6) { toast.error("Please select exactly 6 values."); return; }
    setIsLocked(true);
    setIsEditing(false);
    onCoreValuesConfirmed?.(selectedValues);
    if (userId) {
      const { error } = await saveCoreValues(userId, selectedValues);
      if (error) toast.error("Couldn't save your core values. Try again.");
      else toast.success("Core values updated!");
    }
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

  // Teaser — shown when < 3 areas
  if (completedAreas.length < MIN_AREAS) {
    return (
      <div className="mt-4">
        <div className="sketch-card p-4 flex items-center gap-4">
          <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">Your Core Values</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Complete {MIN_AREAS - completedAreas.length} more{" "}
              {MIN_AREAS - completedAreas.length === 1 ? "area" : "areas"} of life to unlock your Core Values.
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            {Array.from({ length: MIN_AREAS }).map((_, i) => (
              <div key={i} className={`h-1.5 w-5 rounded-full ${i < completedAreas.length ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Skeleton className="h-16 w-full rounded-md mt-4" />;

  const isSelecting = !isLocked || isEditing;

  // Split values into 3 columns for horizontal layout
  const third = Math.ceil(rankedValues.length / 3);
  const cols = [
    rankedValues.slice(0, third),
    rankedValues.slice(third, third * 2),
    rankedValues.slice(third * 2),
  ];

  return (
    <div className="mt-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">
            {isSelecting ? "Your Core Values" : "Your Core Values"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isSelecting
              ? "Select the 6 core values that you want to make incarnate across all areas of your life."
              : "Locked in — these drive your dice rolls."}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {isLocked && !isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit} className="gap-1 text-[10px] h-7 px-2.5">
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-[10px] h-7 px-2.5">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={selectedValues.length !== 6} className="gap-1 text-[10px] h-7 px-2.5">
                <Save className="h-3 w-3" /> Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Selecting / editing — 3-column grid */}
      {isSelecting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-3 gap-1.5">
            {cols.map((col, colIdx) => (
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
                        ${isSelected ? "bg-primary text-primary-foreground"
                          : isSuggested ? "bg-primary/8 ring-1 ring-primary/20 text-foreground"
                          : "bg-muted/40 text-foreground hover:bg-muted/60"}
                        ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <span className="flex-1 truncate text-[10px] font-medium">{value}</span>
                      <span className={`
                        flex h-3.5 min-w-3.5 items-center justify-center rounded text-[8px] font-bold px-0.5
                        ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-foreground/8 text-muted-foreground"}
                      `}>{areaCount}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="text-center text-[9px] text-muted-foreground pt-2">
            {selectedValues.length} of 6 selected
          </p>
        </motion.div>
      )}

      {/* Locked state — horizontal row of 6 values */}
      {isLocked && !isEditing && (
        <div className="grid grid-cols-6 gap-2">
          {selectedValues.map((v) => (
            <div
              key={v}
              className="aspect-square flex items-center justify-center rounded-lg bg-muted/30 cursor-default p-2"
              style={{ boxShadow: "0 0 8px rgba(155, 27, 58, 0.15), 0 0 2px rgba(155, 27, 58, 0.1)" }}
              onMouseEnter={() => onHighlightValue?.(v)}
              onMouseLeave={() => onHighlightValue?.(null)}
            >
              <span className="text-[11px] sm:text-xs font-semibold text-foreground text-center leading-tight break-words">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoreValuesSelector;
