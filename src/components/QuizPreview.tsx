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

/** Mini preview — represents the shareable values reveal page */
const MiniValuesCard = () => (
  <div
    className="relative rounded-md overflow-hidden"
    style={{
      background: "linear-gradient(170deg, #0C0A0D, #1A0F16, #0A080C)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)",
      padding: "16px 12px",
    }}
  >
    {/* Flame glow */}
    <div className="flex justify-center mb-2">
      <div className="relative">
        <div className="absolute inset-0 -m-2 rounded-full" style={{ background: "radial-gradient(circle, rgba(155,27,58,0.2) 0%, transparent 70%)" }} />
        <Flame className="h-3.5 w-3.5 text-[#C85046]" strokeWidth={1.4} style={{ filter: "drop-shadow(0 0 4px rgba(155,27,58,0.4))" }} />
      </div>
    </div>
    <p style={{ fontSize: "6px", letterSpacing: "0.35em" }} className="text-center uppercase text-white/30 mb-2 font-serif">My Values</p>
    <div className="space-y-1.5">
      {SAMPLE_VALUES.map((value) => (
        <p key={value} style={{ fontSize: "10px", letterSpacing: "0.02em" }} className="text-center italic text-white/85 font-serif">{value}</p>
      ))}
    </div>
    <div className="h-px bg-white/8 mt-3 mb-1.5 mx-2" />
    <p style={{ fontSize: "5px", letterSpacing: "0.25em" }} className="text-center uppercase text-white/20 font-serif">Words Incarnate</p>
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

          {/* Shareable Reveal */}
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
            <p className="mt-4 text-sm font-semibold text-foreground">Shareable Page</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Share a cinematic reveal of your values with family, friends, or your team.
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
