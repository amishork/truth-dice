import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { useCommitmentTracker, type Milestone } from "@/hooks/useCommitmentTracker";
import { Button } from "@/components/ui/button";

interface CommitmentEscalationProps {
  onAction?: (milestone: Milestone) => void;
}

const CommitmentEscalation: React.FC<CommitmentEscalationProps> = ({ onAction }) => {
  const { getMilestones, completedCount, nextMilestone, MILESTONE_ORDER, MILESTONE_META } = useCommitmentTracker();
  const milestones = getMilestones();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="sketch-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="label-technical">Your journey</p>
        <span className="text-xs text-muted-foreground">{completedCount} of {MILESTONE_ORDER.length}</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 w-full rounded-full bg-border mb-5">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / MILESTONE_ORDER.length) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between gap-1">
        {MILESTONE_ORDER.map((key, i) => {
          const done = milestones[key];
          const isNext = key === nextMilestone;
          return (
            <div key={key} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`relative flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-all duration-300 ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : isNext
                    ? "border-primary text-primary animate-pulse"
                    : "border-border text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[0.5rem] text-center leading-tight font-mono tracking-wider uppercase ${
                done ? "text-foreground" : isNext ? "text-primary" : "text-muted-foreground"
              }`}>
                {MILESTONE_META[key].label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Next step CTA */}
      {nextMilestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 pt-4 border-t border-border"
        >
          <p className="text-xs text-muted-foreground mb-2">Next step</p>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => {
              if (MILESTONE_META[nextMilestone].ctaHref) {
                window.location.href = MILESTONE_META[nextMilestone].ctaHref!;
              } else {
                onAction?.(nextMilestone);
              }
            }}
          >
            {MILESTONE_META[nextMilestone].cta}
            <ChevronRight className="h-3 w-3" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CommitmentEscalation;
