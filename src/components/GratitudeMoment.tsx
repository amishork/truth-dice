import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GratitudeMomentProps {
  onComplete: () => void;
}

const GratitudeMoment = ({ onComplete }: GratitudeMomentProps) => {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<"breathe" | "text" | "fade">("breathe");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("text"), 1200),
      setTimeout(() => setPhase("fade"), 6000),
      setTimeout(() => {
        setVisible(false);
        setTimeout(onComplete, 800);
      }, 6800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Concentric rings that expand like ripples
  const rings = [0, 1, 2, 3, 4];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "hsl(0 0% 100%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Soft warm ambient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 60% at 50% 42%, hsla(350, 40%, 96%, 1) 0%, hsla(0, 0%, 100%, 1) 100%)",
            }}
          />

          {/* Breathing rings — concentric expanding circles */}
          <div className="relative z-10 mb-12" style={{ width: 200, height: 200 }}>
            {rings.map((i) => {
              const baseSize = 20 + i * 22;
              const delay = i * 0.3;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: baseSize,
                    height: baseSize,
                    left: `calc(50% - ${baseSize / 2}px)`,
                    top: `calc(50% - ${baseSize / 2}px)`,
                    border: `1px solid hsl(350, 78%, 34%)`,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0, 0.12 + (4 - i) * 0.06, 0.08, 0.12 + (4 - i) * 0.06],
                    scale: [0.92, 1.15, 0.92],
                  }}
                  transition={{
                    duration: 5,
                    delay: delay + 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              );
            })}

            {/* Center dot — steady pulse */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 8,
                height: 8,
                left: "calc(50% - 4px)",
                top: "calc(50% - 4px)",
                background: "hsl(350, 78%, 34%)",
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.9, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Soft glow behind center */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 60,
                height: 60,
                left: "calc(50% - 30px)",
                top: "calc(50% - 30px)",
                background: "radial-gradient(circle, hsl(350, 78%, 34%, 0.08) 0%, transparent 70%)",
              }}
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Breathing guide text — inhale/exhale */}
            <motion.p
              className="absolute w-full text-center font-serif italic text-xs"
              style={{
                bottom: -30,
                color: "hsl(350, 30%, 65%)",
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.span
                animate={{
                  opacity: [1, 0, 0, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.45, 0.55, 1],
                }}
              >
                breathe in
              </motion.span>
              <motion.span
                className="absolute left-0 right-0"
                animate={{
                  opacity: [0, 0, 1, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.45, 0.65, 1],
                }}
              >
                breathe out
              </motion.span>
            </motion.p>
          </div>

          {/* Text content */}
          <motion.div
            className="relative z-10 max-w-xs px-6 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={
              phase === "text" || phase === "fade"
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            <p className="font-serif text-lg leading-relaxed text-foreground">
              Take a breath.
            </p>
            <motion.p
              className="mt-3 text-sm leading-relaxed text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={
                phase === "text" || phase === "fade"
                  ? { opacity: 1 }
                  : { opacity: 0 }
              }
              transition={{ delay: 1.2, duration: 1 }}
            >
              You just did something most people never do — you named what matters.
            </motion.p>
          </motion.div>

          {/* Skip */}
          <motion.button
            className="absolute bottom-8 right-8 z-20 text-xs text-muted-foreground/30 transition-colors hover:text-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            onClick={() => {
              setVisible(false);
              setTimeout(onComplete, 300);
            }}
          >
            Skip →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GratitudeMoment;
