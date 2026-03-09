import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TheSortingProps {
  onComplete: () => void;
}

const TheSorting = ({ onComplete }: TheSortingProps) => {
  const [phase, setPhase] = useState<"dim" | "flame" | "text1" | "text2" | "fade">("dim");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("flame"), 800),
      setTimeout(() => setPhase("text1"), 2200),
      setTimeout(() => setPhase("text2"), 5000),
      setTimeout(() => setPhase("fade"), 8000),
      setTimeout(() => onComplete(), 9500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "fade" ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Ember particles during ceremony */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full"
                style={{
                  background: `hsl(${20 + Math.random() * 25}, ${80 + Math.random() * 20}%, ${50 + Math.random() * 20}%)`,
                  left: `${30 + Math.random() * 40}%`,
                  bottom: `${20 + Math.random() * 30}%`,
                }}
                initial={{ opacity: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  y: [0, -120 - Math.random() * 200],
                  x: [0, (Math.random() - 0.5) * 80],
                  scale: [0, 1 + Math.random(), 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  delay: 1.5 + Math.random() * 4,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Central flame */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={
              phase === "dim"
                ? { scale: 0, opacity: 0 }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative flex items-center justify-center">
              {/* Outer glow */}
              <motion.div
                className="absolute h-32 w-32 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)",
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Core flame shape */}
              <motion.div
                className="relative h-16 w-10"
                style={{
                  background: "linear-gradient(to top, hsl(var(--primary)), hsl(30 90% 55%), hsl(45 95% 70%))",
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  filter: "blur(1px)",
                }}
                animate={{
                  scaleX: [1, 0.9, 1.05, 0.95, 1],
                  scaleY: [1, 1.08, 0.95, 1.05, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

          {/* Text — first line */}
          <motion.p
            className="relative z-10 mt-12 max-w-md px-6 text-center font-serif text-xl leading-relaxed text-foreground"
            initial={{ opacity: 0, y: 12 }}
            animate={
              phase === "text1" || phase === "text2"
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            You're about to name what matters most.
          </motion.p>

          {/* Text — second line */}
          <motion.p
            className="relative z-10 mt-4 max-w-md px-6 text-center text-sm tracking-wide text-muted-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={
              phase === "text2"
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 8 }
            }
            transition={{ duration: 1, ease: "easeOut" }}
          >
            There are no wrong answers. Only honest ones.
          </motion.p>

          {/* Skip button */}
          <motion.button
            className="absolute bottom-8 right-8 z-20 text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={onComplete}
          >
            Skip →
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default TheSorting;
