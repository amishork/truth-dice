import { useCallback, useMemo } from "react";

export type Milestone = "quiz_started" | "results_viewed" | "chat_used" | "values_shared" | "contact_made";

const STORAGE_KEY = "wi-commitment-milestones";

const MILESTONE_META: Record<Milestone, { label: string; cta: string; ctaHref?: string }> = {
  quiz_started: { label: "Start Discovery", cta: "Begin your values journey" },
  results_viewed: { label: "View Results", cta: "Complete the quiz to see results" },
  chat_used: { label: "Chat with Coach", cta: "Explore your values with the AI coach" },
  values_shared: { label: "Share Values", cta: "Share your values card with others" },
  contact_made: { label: "Book a Call", cta: "Book a discovery call to go deeper", ctaHref: "/contact" },
};

const MILESTONE_ORDER: Milestone[] = ["quiz_started", "results_viewed", "chat_used", "values_shared", "contact_made"];

function readMilestones(): Record<Milestone, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { quiz_started: false, results_viewed: false, chat_used: false, values_shared: false, contact_made: false };
    return JSON.parse(raw);
  } catch {
    return { quiz_started: false, results_viewed: false, chat_used: false, values_shared: false, contact_made: false };
  }
}

export function useCommitmentTracker() {
  const milestones = useMemo(() => readMilestones(), []);

  const markMilestone = useCallback((key: Milestone) => {
    const current = readMilestones();
    if (current[key]) return;
    current[key] = true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {}
  }, []);

  const getMilestones = useCallback(() => readMilestones(), []);

  const completedCount = Object.values(milestones).filter(Boolean).length;

  const nextMilestone = MILESTONE_ORDER.find((m) => !milestones[m]) || null;

  return { milestones, markMilestone, getMilestones, completedCount, nextMilestone, MILESTONE_ORDER, MILESTONE_META };
}
