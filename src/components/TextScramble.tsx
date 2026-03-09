import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

interface TextScrambleProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  duration?: number;
}

const TextScramble = ({
  text,
  className = "",
  as: Tag = "h2",
  delay = 0,
  duration = 1.2,
}: TextScrambleProps) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [displayText, setDisplayText] = useState(text);
  const [hasScrambled, setHasScrambled] = useState(false);

  useEffect(() => {
    if (!isInView || hasScrambled) return;

    const totalFrames = Math.round(duration * 60);
    const staggerPerChar = totalFrames / text.length;
    let frame = 0;
    let rafId: number;

    const delayTimer = setTimeout(() => {
      const animate = () => {
        frame++;
        const result = text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            const revealFrame = i * staggerPerChar;
            if (frame > revealFrame) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");

        setDisplayText(result);

        if (frame < totalFrames) {
          rafId = requestAnimationFrame(animate);
        } else {
          setDisplayText(text);
          setHasScrambled(true);
        }
      };

      rafId = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(delayTimer);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isInView, text, delay, duration, hasScrambled]);

  return (
    <motion.span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={`inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
    >
      {Tag === "span" ? (
        displayText
      ) : (
        <Tag className={className}>{displayText}</Tag>
      )}
    </motion.span>
  );
};

export default TextScramble;
