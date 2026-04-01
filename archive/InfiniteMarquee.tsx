import { motion } from "framer-motion";

const VALUES_WORDS = [
  "Connection", "Delight", "Belonging", "Integrity", "Courage",
  "Wisdom", "Compassion", "Purpose", "Growth", "Honesty",
  "Joy", "Gratitude", "Faith", "Love", "Freedom",
  "Excellence", "Humility", "Beauty", "Truth", "Honor",
];

const InfiniteMarquee = () => {
  const doubled = [...VALUES_WORDS, ...VALUES_WORDS];

  return (
    <div className="relative overflow-hidden py-8 border-y border-border bg-muted/30">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-background to-transparent" />

      <motion.div
        className="flex whitespace-nowrap gap-8"
        animate={{ x: [0, -50 * VALUES_WORDS.length] }}
        transition={{
          x: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" },
        }}
      >
        {doubled.map((word, i) => (
          <span
            key={i}
            className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 select-none"
          >
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default InfiniteMarquee;
