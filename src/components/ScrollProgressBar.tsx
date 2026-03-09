import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const springProgress = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(pct);
      springProgress.set(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [springProgress]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] origin-left"
      style={{
        scaleX: springProgress,
        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))",
      }}
    />
  );
};

export default ScrollProgressBar;
