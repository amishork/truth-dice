import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TheSortingProps {
  onComplete: () => void;
}

const TheSorting = ({ onComplete }: TheSortingProps) => {
  const [phase, setPhase] = useState<"dim" | "ignite" | "text1" | "text2" | "fade">("dim");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("ignite"), 600),
      setTimeout(() => setPhase("text1"), 2400),
      setTimeout(() => setPhase("text2"), 5200),
      setTimeout(() => setPhase("fade"), 8200),
      setTimeout(() => onComplete(), 9600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const flameVisible = phase !== "dim";

  // Pre-generate ember particles with stable random values
  const embers = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 42 + Math.random() * 16,
      size: 1 + Math.random() * 2.5,
      drift: (Math.random() - 0.5) * 60,
      rise: 100 + Math.random() * 280,
      dur: 2.5 + Math.random() * 3.5,
      delay: 0.8 + Math.random() * 5,
      hue: 15 + Math.random() * 30,
      sat: 75 + Math.random() * 25,
      light: 48 + Math.random() * 22,
    })), []);

  return (
    <AnimatePresence>
      {phase !== "fade" ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "hsl(0 0% 4%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {/* Ambient warmth — radial background glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={flameVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 2 }}
            style={{
              background: "radial-gradient(ellipse 40% 50% at 50% 48%, hsla(20, 80%, 18%, 0.5) 0%, hsla(0, 0%, 4%, 0) 100%)",
            }}
          />

          {/* Ember particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {embers.map((e) => (
              <motion.div
                key={e.id}
                className="absolute rounded-full"
                style={{
                  width: e.size,
                  height: e.size,
                  left: `${e.x}%`,
                  bottom: "35%",
                  background: `hsl(${e.hue}, ${e.sat}%, ${e.light}%)`,
                  boxShadow: `0 0 ${e.size * 2}px hsla(${e.hue}, ${e.sat}%, ${e.light}%, 0.6)`,
                }}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                animate={flameVisible ? {
                  opacity: [0, 0.9, 0.7, 0],
                  y: [0, -e.rise * 0.3, -e.rise * 0.7, -e.rise],
                  x: [0, e.drift * 0.4, e.drift * 0.8, e.drift],
                  scale: [0, 1.2, 0.8, 0],
                } : {}}
                transition={{
                  duration: e.dur,
                  delay: e.delay,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: Math.random() * 1.5,
                }}
              />
            ))}
          </div>

          {/* ─── Multi-layer SVG flame ─── */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={flameVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="120" height="180" viewBox="0 0 120 180" className="overflow-visible">
              {/* Outer glow */}
              <defs>
                <radialGradient id="flame-glow" cx="50%" cy="55%" r="60%">
                  <stop offset="0%" stopColor="hsl(20, 85%, 50%)" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="hsl(350, 78%, 34%)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="flame-core" cx="50%" cy="70%" r="50%">
                  <stop offset="0%" stopColor="hsl(48, 100%, 85%)" />
                  <stop offset="30%" stopColor="hsl(38, 95%, 65%)" />
                  <stop offset="70%" stopColor="hsl(20, 90%, 50%)" />
                  <stop offset="100%" stopColor="hsl(350, 78%, 34%)" />
                </radialGradient>
                <radialGradient id="flame-inner" cx="50%" cy="75%" r="40%">
                  <stop offset="0%" stopColor="hsl(50, 100%, 92%)" />
                  <stop offset="40%" stopColor="hsl(42, 98%, 72%)" />
                  <stop offset="100%" stopColor="hsl(30, 90%, 55%)" stopOpacity="0" />
                </radialGradient>
                <filter id="flame-blur">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
                <filter id="flame-blur-sm">
                  <feGaussianBlur stdDeviation="1.2" />
                </filter>
              </defs>

              {/* Ambient glow circle */}
              <motion.circle
                cx="60" cy="100" r="80"
                fill="url(#flame-glow)"
                animate={{ r: [75, 90, 75], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Outer flame — crimson, largest teardrop */}
              <motion.path
                d="M60 20 Q40 60 35 95 Q30 125 42 145 Q50 160 60 165 Q70 160 78 145 Q90 125 85 95 Q80 60 60 20Z"
                fill="url(#flame-core)"
                filter="url(#flame-blur)"
                animate={{
                  d: [
                    "M60 20 Q40 60 35 95 Q30 125 42 145 Q50 160 60 165 Q70 160 78 145 Q90 125 85 95 Q80 60 60 20Z",
                    "M60 16 Q38 58 33 92 Q28 122 44 148 Q52 162 60 166 Q68 162 76 148 Q92 122 87 92 Q82 58 60 16Z",
                    "M60 22 Q42 62 37 97 Q32 128 40 143 Q48 158 60 163 Q72 158 80 143 Q88 128 83 97 Q78 62 60 22Z",
                    "M60 20 Q40 60 35 95 Q30 125 42 145 Q50 160 60 165 Q70 160 78 145 Q90 125 85 95 Q80 60 60 20Z",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Middle flame — amber/orange */}
              <motion.path
                d="M60 45 Q46 72 42 100 Q38 125 48 140 Q54 150 60 153 Q66 150 72 140 Q82 125 78 100 Q74 72 60 45Z"
                fill="hsl(30, 92%, 55%)"
                filter="url(#flame-blur-sm)"
                opacity={0.85}
                animate={{
                  d: [
                    "M60 45 Q46 72 42 100 Q38 125 48 140 Q54 150 60 153 Q66 150 72 140 Q82 125 78 100 Q74 72 60 45Z",
                    "M60 40 Q44 70 40 96 Q36 120 50 142 Q56 152 60 155 Q64 152 70 142 Q84 120 80 96 Q76 70 60 40Z",
                    "M60 48 Q48 74 44 102 Q40 128 46 138 Q52 148 60 151 Q68 148 74 138 Q80 128 76 102 Q72 74 60 48Z",
                    "M60 45 Q46 72 42 100 Q38 125 48 140 Q54 150 60 153 Q66 150 72 140 Q82 125 78 100 Q74 72 60 45Z",
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              />

              {/* Inner flame — bright gold/white core */}
              <motion.path
                d="M60 70 Q52 88 49 108 Q46 125 53 135 Q57 140 60 142 Q63 140 67 135 Q74 125 71 108 Q68 88 60 70Z"
                fill="url(#flame-inner)"
                filter="url(#flame-blur-sm)"
                animate={{
                  d: [
                    "M60 70 Q52 88 49 108 Q46 125 53 135 Q57 140 60 142 Q63 140 67 135 Q74 125 71 108 Q68 88 60 70Z",
                    "M60 65 Q50 86 47 104 Q44 120 55 137 Q58 142 60 144 Q62 142 65 137 Q76 120 73 104 Q70 86 60 65Z",
                    "M60 73 Q54 90 51 110 Q48 128 52 133 Q56 138 60 140 Q64 138 68 133 Q72 128 69 110 Q66 90 60 73Z",
                    "M60 70 Q52 88 49 108 Q46 125 53 135 Q57 140 60 142 Q63 140 67 135 Q74 125 71 108 Q68 88 60 70Z",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />

              {/* Bright core point */}
              <motion.ellipse
                cx="60" cy="125" rx="6" ry="8"
                fill="hsl(50, 100%, 92%)"
                filter="url(#flame-blur-sm)"
                animate={{
                  ry: [7, 10, 7],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>

          {/* Text — first line */}
          <motion.p
            className="relative z-10 mt-14 max-w-sm px-6 text-center font-serif text-xl leading-relaxed"
            style={{ color: "hsl(0, 0%, 88%)" }}
            initial={{ opacity: 0, y: 14 }}
            animate={
              phase === "text1" || phase === "text2"
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            You're about to name what matters most.
          </motion.p>

          {/* Text — second line */}
          <motion.p
            className="relative z-10 mt-4 max-w-sm px-6 text-center text-sm tracking-wide"
            style={{ color: "hsl(0, 0%, 55%)" }}
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

          {/* Skip */}
          <motion.button
            className="absolute bottom-8 right-8 z-20 text-xs transition-colors"
            style={{ color: "hsl(0, 0%, 30%)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0, 0%, 55%)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0, 0%, 30%)")}
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
