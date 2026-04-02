import { motion } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SAMPLE_VALUES = ["Love", "Wisdom", "Courage", "Integrity", "Faith", "Purpose"];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

/** Static fully-completed chord diagram — illustrative, not interactive */
const StaticChordDiagram = () => {
  const S = 260;
  const CX = S / 2;
  const CY = S / 2;
  const OR = 118; // outer ring
  const IR = 105; // inner ring
  const NR = 96;  // node radius

  const AREAS = [
    { label: "Personal", color: "hsl(350,78%,34%)" },
    { label: "Leader", color: "hsl(0,0%,25%)" },
    { label: "Spouse", color: "hsl(350,45%,55%)" },
    { label: "Parent", color: "hsl(350,50%,20%)" },
    { label: "Children", color: "hsl(35,30%,50%)" },
    { label: "Family", color: "hsl(350,35%,45%)" },
    { label: "Friends", color: "hsl(0,0%,42%)" },
    { label: "Work", color: "hsl(0,0%,30%)" },
    { label: "Leisure", color: "hsl(20,12%,58%)" },
  ];

  // Sample values per area (6 per area)
  const AREA_VALUES = [
    ["Love", "Integrity", "Faith", "Wisdom", "Growth", "Presence"],
    ["Integrity", "Courage", "Vision", "Discipline", "Service", "Wisdom"],
    ["Love", "Loyalty", "Humor", "Patience", "Faith", "Kindness"],
    ["Integrity", "Patience", "Love", "Discipline", "Wisdom", "Purpose"],
    ["Integrity", "Kindness", "Courage", "Growth", "Faith", "Joy"],
    ["Love", "Faith", "Patience", "Integrity", "Loyalty", "Service"],
    ["Loyalty", "Humor", "Integrity", "Fun", "Courage", "Kindness"],
    ["Purpose", "Discipline", "Excellence", "Courage", "Growth", "Vision"],
    ["Joy", "Fun", "Creativity", "Freedom", "Humor", "Adventure"],
  ];

  const TAU = Math.PI * 2;
  const GAP = 0.025;
  const segAngle = TAU / AREAS.length;

  const polar = (r: number, a: number) => ({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) });

  const arcPath = (oR: number, iR: number, start: number, end: number) => {
    const os = polar(oR, start), oe = polar(oR, end);
    const is_ = polar(iR, start), ie = polar(iR, end);
    const lg = end - start > Math.PI ? 1 : 0;
    return `M ${os.x} ${os.y} A ${oR} ${oR} 0 ${lg} 1 ${oe.x} ${oe.y} L ${ie.x} ${ie.y} A ${iR} ${iR} 0 ${lg} 0 ${is_.x} ${is_.y} Z`;
  };

  // Compute node positions
  type Node = { value: string; x: number; y: number; areaIdx: number; isHighlighted: boolean };
  const nodes: Node[] = [];

  AREAS.forEach((_, aIdx) => {
    const segStart = aIdx * segAngle - Math.PI / 2 + GAP;
    const segEnd = (aIdx + 1) * segAngle - Math.PI / 2 - GAP;
    const vals = AREA_VALUES[aIdx];
    vals.forEach((v, vIdx) => {
      const t = (vIdx + 0.5) / vals.length;
      const angle = segStart + (segEnd - segStart) * t;
      const pos = polar(NR, angle);
      nodes.push({ value: v, x: pos.x, y: pos.y, areaIdx: aIdx, isHighlighted: v === "Integrity" });
    });
  });

  // "Integrity" nodes — connected across areas
  const highlightedNodes = nodes.filter((n) => n.isHighlighted);

  // Build chord paths between highlighted nodes
  const chords: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < highlightedNodes.length; i++) {
    for (let j = i + 1; j < highlightedNodes.length; j++) {
      chords.push({
        x1: highlightedNodes[i].x, y1: highlightedNodes[i].y,
        x2: highlightedNodes[j].x, y2: highlightedNodes[j].y,
      });
    }
  }

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[240px] mx-auto" aria-label="Values chord diagram preview">
      {/* Area arc segments */}
      {AREAS.map((area, i) => {
        const start = i * segAngle - Math.PI / 2 + GAP;
        const end = (i + 1) * segAngle - Math.PI / 2 - GAP;
        const hasHighlight = AREA_VALUES[i].includes("Integrity");
        return (
          <path
            key={area.label}
            d={arcPath(OR, IR, start, end)}
            fill={area.color}
            opacity={hasHighlight ? 0.85 : 0.2}
          />
        );
      })}

      {/* Non-highlighted chords (faint connections between other shared values) */}
      {nodes.filter(n => n.value === "Love").length > 1 && (() => {
        const loveNodes = nodes.filter(n => n.value === "Love");
        return loveNodes.map((n, i) =>
          loveNodes.slice(i + 1).map((m, j) => (
            <line key={`love-${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y}
              stroke="hsl(350,78%,34%)" strokeWidth={0.5} opacity={0.08} />
          ))
        );
      })()}
      {nodes.filter(n => n.value === "Faith").length > 1 && (() => {
        const faithNodes = nodes.filter(n => n.value === "Faith");
        return faithNodes.map((n, i) =>
          faithNodes.slice(i + 1).map((m, j) => (
            <line key={`faith-${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y}
              stroke="hsl(350,78%,34%)" strokeWidth={0.5} opacity={0.06} />
          ))
        );
      })()}

      {/* Highlighted chords — "Integrity" across 6 areas */}
      {chords.map((c, i) => {
        const mx = (c.x1 + c.x2) / 2;
        const my = (c.y1 + c.y2) / 2;
        const cpx = CX + (mx - CX) * 0.3;
        const cpy = CY + (my - CY) * 0.3;
        return (
          <path
            key={`chord-${i}`}
            d={`M ${c.x1} ${c.y1} Q ${cpx} ${cpy} ${c.x2} ${c.y2}`}
            fill="none"
            stroke="hsl(350,78%,34%)"
            strokeWidth={1.2}
            opacity={0.35}
          />
        );
      })}

      {/* All value nodes */}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x} cy={node.y}
          r={node.isHighlighted ? 4 : 2.5}
          fill={node.isHighlighted ? "hsl(350,78%,34%)" : AREAS[node.areaIdx].color}
          opacity={node.isHighlighted ? 1 : 0.3}
        />
      ))}

      {/* Center label for highlighted value */}
      <text x={CX} y={CY - 4} textAnchor="middle" fill="hsl(350,78%,34%)" fontSize={10} fontWeight={700} fontFamily="Inter, sans-serif">
        Integrity
      </text>
      <text x={CX} y={CY + 8} textAnchor="middle" fill="hsl(350,78%,34%)" fontSize={6} fontWeight={500} fontFamily="Inter, sans-serif" opacity={0.6}>
        ACROSS 6 AREAS
      </text>
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
            <StaticChordDiagram />
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
