import { motion } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SAMPLE_VALUES = ["Love", "Wisdom", "Courage", "Integrity", "Faith", "Purpose"];

const SAMPLE_CONNECTIONS: [number, number][] = [
  [0, 1], [0, 3], [1, 2], [1, 5], [2, 3], [3, 4], [4, 5], [0, 5],
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

/** Mini chord diagram rendered as SVG — no interactivity, purely illustrative */
const MiniChordDiagram = () => {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 85;

  const points = SAMPLE_VALUES.map((_, i) => {
    const angle = (i / SAMPLE_VALUES.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px] mx-auto">
      {/* Connection lines */}
      {SAMPLE_CONNECTIONS.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={points[a].x} y1={points[a].y}
          x2={points[b].x} y2={points[b].y}
          stroke="hsl(350, 78%, 34%)"
          strokeWidth={1.5}
          strokeOpacity={0.25}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
        />
      ))}
      {/* Value nodes */}
      {points.map((pt, i) => (
        <motion.g
          key={SAMPLE_VALUES[i]}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 + i * 0.06 }}
        >
          <circle cx={pt.x} cy={pt.y} r={20} fill="hsl(350, 78%, 34%)" fillOpacity={0.1} stroke="hsl(350, 78%, 34%)" strokeWidth={1.5} strokeOpacity={0.4} />
          <text x={pt.x} y={pt.y + 1} textAnchor="middle" dominantBaseline="central" fill="hsl(350, 78%, 34%)" fontSize={8} fontWeight={600} fontFamily="Inter, sans-serif">
            {SAMPLE_VALUES[i]}
          </text>
        </motion.g>
      ))}
    </svg>
  );
};

/** Mini values card — matches the ShareableValuesCard visual */
const MiniValuesCard = () => (
  <div
    className="relative bg-[#FAFAF8] rounded-md overflow-hidden"
    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.03)" }}
  >
    <div className="relative p-1.5">
      {/* Corner marks */}
      <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-[#D4D0C8]" />
      <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-[#D4D0C8]" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-[#D4D0C8]" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-[#D4D0C8]" />

      <div className="border border-[#1C1C1C]/50 px-3 py-3 text-center">
        <Flame className="mx-auto h-3.5 w-3.5 text-[#9B1B3A] mb-1.5" strokeWidth={1.8} />
        <p style={{ fontSize: "7px", letterSpacing: "0.25em" }} className="font-semibold uppercase text-[#1C1C1C]">Words Incarnate</p>
        <p style={{ fontSize: "5.5px", letterSpacing: "0.2em" }} className="font-semibold uppercase text-[#9B1B3A] mt-px">My Core Values</p>
        <div className="flex items-center gap-1 my-2 px-1">
          <div className="flex-1 h-px bg-[#1C1C1C]/40" />
          <div className="h-1 w-1 rotate-45 bg-[#9B1B3A]" />
          <div className="flex-1 h-px bg-[#1C1C1C]/40" />
        </div>
        <div className="space-y-1">
          {SAMPLE_VALUES.map((value) => (
            <p key={value} style={{ fontSize: "9px", letterSpacing: "0.12em" }} className="font-semibold uppercase text-[#1C1C1C]">{value}</p>
          ))}
        </div>
        <div className="h-px bg-[#1C1C1C]/20 mt-2 mb-1 mx-1" />
        <p style={{ fontSize: "5px", letterSpacing: "0.18em" }} className="font-mono uppercase text-[#B0ACA4]">wordsincarnate.com</p>
      </div>
    </div>
  </div>
);

const QuizPreview = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div {...fadeInUp} className="mx-auto max-w-3xl text-center mb-12">
          <p className="label-technical mb-3">What You'll Discover</p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Walk away with your 6 core values.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            The assessment reveals the values already shaping your decisions — then gives you tools
            to reflect on them, share them, and put them into practice.
          </p>
        </motion.div>

        <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-3 items-start">
          {/* Values Profile */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MiniChordDiagram />
            <p className="mt-4 text-sm font-semibold text-foreground">Values Profile</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              See how your values connect across different areas of life with an interactive diagram.
            </p>
          </motion.div>

          {/* Shareable Card */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="max-w-[200px] mx-auto">
              <MiniValuesCard />
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">Shareable Card</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Download a branded values card to share with family, friends, or your team.
            </p>
          </motion.div>

          {/* AI Reflection */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mx-auto max-w-[200px] rounded-lg border border-border bg-background p-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Flame className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-foreground">Guided Reflection</span>
              </div>
              <div className="space-y-2">
                <div className="rounded bg-muted/50 px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">When you think about Courage, what moment comes to mind?</p>
                </div>
                <div className="rounded bg-primary/10 px-2.5 py-1.5 ml-4">
                  <p className="text-[10px] text-primary leading-relaxed">The day I left my job to start this.</p>
                </div>
                <div className="rounded bg-muted/50 px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">What did that cost you — and what did it give you?</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">AI Reflection</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              An AI conversation partner helps you go deeper into what your values mean in practice.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button size="lg" onClick={() => navigate("/quiz")} className="wi-cta">
            Start Free Assessment <ChevronRight />
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">~5 minutes · no account required</p>
        </motion.div>
      </div>
    </section>
  );
};

export default QuizPreview;
