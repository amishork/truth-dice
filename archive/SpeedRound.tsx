import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpeedRoundProps {
  values: string[];
  deliberateValues: string[];
  onClose: () => void;
}

const ROUND_MS = 2000;
const TOTAL_PAIRS = 10;

const SpeedRound: React.FC<SpeedRoundProps> = ({ values, deliberateValues, onClose }) => {
  const [phase, setPhase] = useState<"intro" | "playing" | "results">("intro");
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [winners, setWinners] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  // Build random pairs from available values
  const buildPairs = useCallback(() => {
    const shuffled = [...values].sort(() => Math.random() - 0.5);
    const p: [string, string][] = [];
    for (let i = 0; i < Math.min(shuffled.length - 1, TOTAL_PAIRS * 2); i += 2) {
      p.push([shuffled[i], shuffled[i + 1]]);
    }
    return p;
  }, [values]);

  const startGame = () => {
    const p = buildPairs();
    setPairs(p);
    setPairIndex(0);
    setWinners([]);
    setPhase("playing");
  };

  // Timer logic
  useEffect(() => {
    if (phase !== "playing" || pairIndex >= pairs.length) return;

    startTimeRef.current = Date.now();
    setTimeLeft(ROUND_MS);

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, ROUND_MS - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        // Auto-skip
        advance(null);
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [phase, pairIndex, pairs.length]);

  const advance = (selected: string | null) => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    if (selected) setWinners((prev) => [...prev, selected]);
    if (pairIndex + 1 >= pairs.length) {
      setPhase("results");
    } else {
      setPairIndex((i) => i + 1);
    }
  };

  const progress = timeLeft / ROUND_MS;
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference * (1 - progress);

  // Gut instinct top 6
  const gutCounts: Record<string, number> = {};
  winners.forEach((w) => { gutCounts[w] = (gutCounts[w] || 0) + 1; });
  const gutTop6 = [...new Set(winners)].sort((a, b) => (gutCounts[b] || 0) - (gutCounts[a] || 0)).slice(0, 6);
  const overlap = gutTop6.filter((v) => deliberateValues.includes(v));

  if (phase === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="sketch-card p-6 text-center"
      >
        <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground">Speed Round</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          2 seconds per choice. Trust your gut. See how your instincts compare to your deliberate values.
        </p>
        <div className="mt-5 flex gap-2 justify-center">
          <Button onClick={startGame}>
            <Zap className="h-4 w-4" />
            Start
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  if (phase === "results") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="sketch-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground text-center mb-4">Gut vs. Deliberate</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="label-technical mb-2 text-center">Gut instinct</p>
            <ul className="space-y-1.5">
              {gutTop6.map((v) => (
                <li key={v} className={`text-sm px-2 py-1 rounded ${deliberateValues.includes(v) ? "bg-primary/10 text-foreground" : "text-muted-foreground"}`}>
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-technical mb-2 text-center">Deliberate</p>
            <ul className="space-y-1.5">
              {deliberateValues.map((v) => (
                <li key={v} className={`text-sm px-2 py-1 rounded ${gutTop6.includes(v) ? "bg-primary/10 text-foreground" : "text-muted-foreground"}`}>
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {overlap.length} of 6 match — {overlap.length >= 5 ? "Your instincts and intentions are deeply aligned." : overlap.length >= 3 ? "Interesting tension between gut and deliberation." : "Your gut tells a different story than your deliberate self."}
          </p>
        </div>
        <div className="mt-4 flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={startGame}>
            <RotateCcw className="h-3 w-3" />
            Try again
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    );
  }

  // Playing phase
  const pair = pairs[pairIndex];
  if (!pair) return null;

  return (
    <div className="sketch-card p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="label-technical">{pairIndex + 1} / {pairs.length}</p>
        <svg width="64" height="64" className="transform -rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke={progress < 0.3 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 50ms linear" }}
          />
        </svg>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={pairIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => advance(pair[0])}
            className="sketch-card p-5 text-center text-foreground font-serif text-lg hover:border-primary transition-colors"
          >
            {pair[0]}
          </button>
          <button
            onClick={() => advance(pair[1])}
            className="sketch-card p-5 text-center text-foreground font-serif text-lg hover:border-primary transition-colors"
          >
            {pair[1]}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SpeedRound;
