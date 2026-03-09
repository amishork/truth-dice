import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import EmberParticles from "@/components/EmberParticles";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ChapterProps {
  children: React.ReactNode;
  index: number;
}

const Chapter: React.FC<ChapterProps> = ({ children, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [60, 0, 0, -40]);
  const bgY = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -40 : 40, index % 2 === 0 ? 40 : -40]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax background accent */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div
          className={`absolute ${
            index % 2 === 0 ? "right-0 top-1/4" : "left-0 bottom-1/4"
          } w-64 h-64 rounded-full opacity-[0.04]`}
          style={{
            background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      <motion.div
        className="relative z-10 mx-auto max-w-3xl px-6 py-24"
        style={{ opacity, y }}
      >
        {children}
      </motion.div>
    </section>
  );
};

const OurStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <Navigation />

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-16 left-0 h-px bg-primary z-40"
        style={{ width: progressWidth }}
      />

      <EmberParticles />

      <main>
        {/* Chapter 1: The Question */}
        <Chapter index={0}>
          <p className="label-technical mb-6">Chapter One</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground leading-tight">
            The Question
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            We began with a simple question: what do we truly value — and what would it look like to live it?
          </p>
          <div className="mt-10 h-px w-24 bg-primary/40" />
        </Chapter>

        {/* Chapter 2: The Gap */}
        <Chapter index={1}>
          <p className="label-technical mb-6">Chapter Two</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
            The Gap
          </h2>
          <div className="mt-8 space-y-5 text-foreground leading-relaxed text-lg">
            <p>
              In many homes, classrooms, and workplaces, values remain abstract: important words, but not lived
              realities.
            </p>
            <p className="text-muted-foreground">
              We speak of purpose and belonging. We post mission statements and values walls.
              But the distance between word and practice grows wider every year.
            </p>
          </div>
        </Chapter>

        {/* Chapter 3: The Conviction */}
        <Chapter index={2}>
          <p className="label-technical mb-6">Chapter Three</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
            The Conviction
          </h2>
          <div className="mt-8 space-y-5 text-foreground leading-relaxed text-lg">
            <p>
              Words Incarnate formed around a conviction: values become real through practices — through repeatable
              experiences that shape attention, habits, and relationships.
            </p>
            <p className="text-muted-foreground">
              Not slogans. Not aspirations. But daily, embodied rhythms that form the people we want to become.
            </p>
          </div>
        </Chapter>

        {/* Chapter 4: The Invitation */}
        <Chapter index={3}>
          <p className="label-technical mb-6">Chapter Four</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
            The Invitation
          </h2>
          <p className="mt-8 text-lg text-foreground leading-relaxed">
            Our work is an invitation to slow down, pay attention, and build something enduring — rooted in
            connection, animated by delight, and sustained by belonging.
          </p>
          <div className="mt-10 rounded-xl border border-border bg-card p-8">
            <h3 className="text-2xl font-semibold text-foreground">A practical next step</h3>
            <p className="mt-3 text-muted-foreground">
              Start with a guided values discovery and walk away with 6 core values you can carry into decisions,
              relationships, and daily rhythms.
            </p>
            <div className="mt-6">
              <Button asChild>
                <a href="/">
                  Start values discovery
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </Chapter>
      </main>

      <Footer />
    </div>
  );
};

export default OurStory;
