import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ChapterProps {
  children: React.ReactNode;
  index: number;
  chapterLabel: string;
  total: number;
}

const Chapter: React.FC<ChapterProps> = ({ children, index, chapterLabel, total }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15% 0px" });

  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -30 : 30, index % 2 === 0 ? 30 : -30]);

  const isLast = index === total - 1;

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax gradient accent */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div
          className={`absolute ${
            index % 2 === 0 ? "right-0 top-1/4" : "left-0 bottom-1/4"
          } w-80 h-80 rounded-full opacity-[0.03]`}
          style={{
            background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-24 flex">
        {/* Timeline column */}
        <div className="hidden sm:flex flex-col items-center mr-12 pt-2">
          {/* Chapter number marker */}
          <motion.div
            className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/30 bg-background"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <motion.span
              className="text-xs font-mono font-semibold text-primary"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4 }}
            >
              {String(index + 1).padStart(2, "0")}
            </motion.span>
            {/* Pulse ring on reveal */}
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/40"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={isInView ? { scale: 2.2, opacity: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15 }}
            />
          </motion.div>

          {/* Vertical line extending down */}
          {!isLast && (
            <motion.div
              className="w-px flex-1 mt-4 origin-top"
              style={{ background: "linear-gradient(to bottom, hsl(var(--primary) / 0.2), hsl(var(--border)))" }}
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            />
          )}
        </div>

        {/* Content column */}
        <motion.div
          ref={contentRef}
          className="flex-1"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          {/* Chapter label with decorative line */}
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="h-px w-8 bg-primary/40" />
            <p className="label-technical text-primary/70">{chapterLabel}</p>
          </motion.div>

          {children}
        </motion.div>
      </div>
    </section>
  );
};

/* Staggered text block — each paragraph fades in sequentially */
const StaggeredBlock: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3 + delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const OurStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const CHAPTERS = [
    { label: "Chapter One" },
    { label: "Chapter Two" },
    { label: "Chapter Three" },
    { label: "Chapter Four" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <PageMeta
        title="Our Story"
        description="How Words Incarnate began — from a simple question about what we truly value to a conviction that values become real through practices."
        path="/our-story"
      />
      <Navigation />

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-16 left-0 h-px bg-primary z-40"
        style={{ width: progressWidth }}
      />

      <main>
        {/* Chapter 1: The Question */}
        <Chapter index={0} chapterLabel={CHAPTERS[0].label} total={CHAPTERS.length}>
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground leading-tight">
            The Question
          </h1>
          <StaggeredBlock>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              We began with a simple question: what do we truly value — and what would it look like to live it?
            </p>
          </StaggeredBlock>
          <StaggeredBlock delay={0.15}>
            <div className="mt-10 h-px w-24 bg-primary/40" />
          </StaggeredBlock>
        </Chapter>

        {/* Chapter 2: The Gap */}
        <Chapter index={1} chapterLabel={CHAPTERS[1].label} total={CHAPTERS.length}>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
            The Gap
          </h2>
          <StaggeredBlock>
            <p className="mt-8 text-foreground leading-relaxed text-lg">
              In many homes, classrooms, and workplaces, values remain abstract: important words, but not lived
              realities.
            </p>
          </StaggeredBlock>
          <StaggeredBlock delay={0.15}>
            <p className="mt-5 text-muted-foreground leading-relaxed text-lg">
              We speak of purpose and belonging. We post mission statements and values walls.
              But the distance between word and practice grows wider every year.
            </p>
          </StaggeredBlock>
        </Chapter>

        {/* Chapter 3: The Conviction */}
        <Chapter index={2} chapterLabel={CHAPTERS[2].label} total={CHAPTERS.length}>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
            The Conviction
          </h2>
          <StaggeredBlock>
            <p className="mt-8 text-foreground leading-relaxed text-lg">
              Words Incarnate formed around a conviction: values become real through practices — through repeatable
              experiences that shape attention, habits, and relationships.
            </p>
          </StaggeredBlock>
          <StaggeredBlock delay={0.15}>
            <p className="mt-5 text-muted-foreground leading-relaxed text-lg">
              Not slogans. Not aspirations. But daily, embodied rhythms that form the people we want to become.
            </p>
          </StaggeredBlock>
        </Chapter>

        {/* Chapter 4: The Invitation */}
        <Chapter index={3} chapterLabel={CHAPTERS[3].label} total={CHAPTERS.length}>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
            The Invitation
          </h2>
          <StaggeredBlock>
            <p className="mt-8 text-lg text-foreground leading-relaxed">
              Our work is an invitation to slow down, pay attention, and build something enduring — rooted in
              connection, animated by delight, and sustained by belonging.
            </p>
          </StaggeredBlock>
          <StaggeredBlock delay={0.15}>
            <div className="mt-10 rounded-xl border border-border bg-card p-8">
              <h3 className="text-2xl font-semibold text-foreground">A practical next step</h3>
              <p className="mt-3 text-muted-foreground">
                Start with a free values assessment and walk away with 6 core values you can carry into decisions,
                relationships, and daily rhythms.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <a href="/quiz">
                    Free Values Assessment
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </StaggeredBlock>
        </Chapter>
      </main>

      <Footer />
    </div>
  );
};

export default OurStory;
