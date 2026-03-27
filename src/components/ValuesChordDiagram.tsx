import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { QuizSession } from "@/lib/quizSessions";

interface ValuesChordDiagramProps {
  sessions: QuizSession[];
  activeSessionId: string | null;
}

const AREA_META: Record<string, { label: string; color: string; order: number }> = {
  personal:        { label: "Personal",       color: "hsl(350, 78%, 34%)", order: 0 },
  leader:          { label: "Leader",          color: "hsl(0, 0%, 25%)",   order: 1 },
  spouse:          { label: "Ideal Spouse",    color: "hsl(350, 45%, 55%)", order: 2 },
  parent:          { label: "Parent",          color: "hsl(350, 50%, 20%)", order: 3 },
  children:        { label: "Children",        color: "hsl(35, 30%, 55%)", order: 4 },
  "spouse-values": { label: "Spouse Values",   color: "hsl(350, 35%, 45%)", order: 5 },
  friends:         { label: "Friends",         color: "hsl(0, 0%, 42%)",   order: 6 },
  work:            { label: "Work",            color: "hsl(0, 0%, 30%)",   order: 7 },
  leisure:         { label: "Leisure",         color: "hsl(20, 12%, 65%)", order: 8 },
};

const ALL_AREAS = Object.keys(AREA_META).sort((a, b) => AREA_META[a].order - AREA_META[b].order);
const TAU = Math.PI * 2;
const CX = 250;
const CY = 250;
const OUTER_R = 210;
const INNER_R = 192;
const NODE_R = 175;
const LABEL_R = 155;
const AREA_LABEL_R = 228;
const GAP_RAD = 0.025;

function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function segmentPath(cx: number, cy: number, oR: number, iR: number, s: number, e: number): string {
  const os = polar(cx, cy, oR, s);
  const oe = polar(cx, cy, oR, e);
  const is_ = polar(cx, cy, iR, s);
  const ie = polar(cx, cy, iR, e);
  const lg = e - s > Math.PI ? 1 : 0;
  return `M ${os.x} ${os.y} A ${oR} ${oR} 0 ${lg} 1 ${oe.x} ${oe.y} L ${ie.x} ${ie.y} A ${iR} ${iR} 0 ${lg} 0 ${is_.x} ${is_.y} Z`;
}

function truncate(s: string, max: number): string {
  const clean = s.split("(")[0].trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

const ValuesChordDiagram: React.FC<ValuesChordDiagramProps> = ({ sessions, activeSessionId }) => {
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  const completedAreas = useMemo(() => {
    const areas = new Set<string>();
    sessions.forEach((s) => areas.add(s.area_of_life));
    return areas;
  }, [sessions]);

  const { nodes, chords, segmentAngles } = useMemo(() => {
    const segSize = TAU / ALL_AREAS.length;
    const segAngles: Record<string, { start: number; end: number; mid: number }> = {};

    ALL_AREAS.forEach((area, i) => {
      const start = -Math.PI / 2 + i * segSize + GAP_RAD;
      const end = -Math.PI / 2 + (i + 1) * segSize - GAP_RAD;
      segAngles[area] = { start, end, mid: (start + end) / 2 };
    });

    const latestByArea = new Map<string, QuizSession>();
    sessions.forEach((s) => {
      if (!latestByArea.has(s.area_of_life)) latestByArea.set(s.area_of_life, s);
    });

    const allNodes: { area: string; value: string; angle: number; x: number; y: number; lx: number; ly: number; color: string }[] = [];

    latestByArea.forEach((session, area) => {
      const seg = segAngles[area];
      if (!seg) return;
      const values = session.final_six_values;
      const meta = AREA_META[area];
      if (!meta) return;

      const arcSpan = seg.end - seg.start;
      const padding = arcSpan * 0.08;
      const usable = arcSpan - padding * 2;

      values.forEach((value, vi) => {
        const t = values.length > 1 ? vi / (values.length - 1) : 0.5;
        const angle = seg.start + padding + usable * t;
        const pos = polar(CX, CY, NODE_R, angle);
        const labelPos = polar(CX, CY, LABEL_R, angle);
        allNodes.push({ area, value, angle, x: pos.x, y: pos.y, lx: labelPos.x, ly: labelPos.y, color: meta.color });
      });
    });

    const valueGroups = new Map<string, typeof allNodes>();
    allNodes.forEach((node) => {
      const key = node.value.toLowerCase();
      if (!valueGroups.has(key)) valueGroups.set(key, []);
      valueGroups.get(key)!.push(node);
    });

    const allChords: { from: typeof allNodes[0]; to: typeof allNodes[0]; value: string }[] = [];
    valueGroups.forEach((group) => {
      if (group.length < 2) return;
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (group[i].area !== group[j].area) {
            allChords.push({ from: group[i], to: group[j], value: group[i].value });
          }
        }
      }
    });

    return { nodes: allNodes, chords: allChords, segmentAngles: segAngles };
  }, [sessions]);

  if (sessions.length === 0) return null;

  return (
    <motion.div
      className="relative mx-auto w-full max-w-md aspect-square"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <svg viewBox="0 0 500 500" className="w-full h-full">
        {/* Outer ring segments */}
        {ALL_AREAS.map((area) => {
          const seg = segmentAngles[area];
          if (!seg) return null;
          const meta = AREA_META[area];
          const completed = completedAreas.has(area);
          const isHovered = hoveredArea === area;

          // Area label — positioned along the midpoint of the arc, rotated radially
          const labelAngle = seg.mid;
          const degAngle = (labelAngle * 180) / Math.PI;
          const lp = polar(CX, CY, AREA_LABEL_R, labelAngle);
          // Flip text on bottom half so it reads left-to-right
          const isBottom = degAngle > 0 && degAngle < 180;
          const textRotation = isBottom ? degAngle + 90 : degAngle - 90;

          return (
            <g key={area}
              onMouseEnter={() => setHoveredArea(area)}
              onMouseLeave={() => setHoveredArea(null)}
              style={{ cursor: completed ? "pointer" : "default" }}
            >
              <path
                d={segmentPath(CX, CY, OUTER_R, INNER_R, seg.start, seg.end)}
                fill={completed ? meta.color : "hsl(0, 0%, 92%)"}
                opacity={completed ? (isHovered ? 0.9 : 0.65) : 0.2}
                stroke="hsl(0, 0%, 98%)"
                strokeWidth={1.5}
              />
              <text
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRotation}, ${lp.x}, ${lp.y})`}
                fill={completed ? meta.color : "hsl(0, 0%, 78%)"}
                fontSize={8}
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight={500}
                letterSpacing="0.12em"
                opacity={completed ? 0.8 : 0.35}
                style={{ textTransform: "uppercase" } as React.CSSProperties}
              >
                {meta.label}
              </text>
            </g>
          );
        })}

        {/* Chords — quadratic bezier through center */}
        {chords.map((chord, i) => {
          const isHighlighted =
            hoveredValue?.toLowerCase() === chord.value.toLowerCase() ||
            hoveredArea === chord.from.area ||
            hoveredArea === chord.to.area;
          const anyHover = hoveredValue || hoveredArea;
          const opacity = anyHover
            ? isHighlighted ? 0.45 : 0.03
            : 0.18;

          return (
            <path
              key={`chord-${i}`}
              d={`M ${chord.from.x} ${chord.from.y} Q ${CX} ${CY} ${chord.to.x} ${chord.to.y}`}
              fill="none"
              stroke={chord.from.color}
              strokeWidth={isHighlighted ? 2.5 : 1}
              opacity={opacity}
              style={{ transition: "opacity 250ms, stroke-width 250ms" }}
            />
          );
        })}

        {/* Value nodes + radial labels */}
        {nodes.map((node, i) => {
          const isHighlighted =
            hoveredValue?.toLowerCase() === node.value.toLowerCase() ||
            hoveredArea === node.area;
          const anyHover = hoveredValue || hoveredArea;
          const dimmed = anyHover && !isHighlighted;

          // Radial label rotation
          const degAngle = (node.angle * 180) / Math.PI;
          const isBottom = degAngle > 0 && degAngle < 180;
          const textRotation = isBottom ? degAngle + 90 : degAngle - 90;
          const anchor = isBottom ? "end" : "start";

          return (
            <g key={`node-${i}`}
              onMouseEnter={() => setHoveredValue(node.value)}
              onMouseLeave={() => setHoveredValue(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Glow on hover */}
              {isHighlighted && (
                <circle
                  cx={node.x} cy={node.y} r={9}
                  fill={node.color} opacity={0.12}
                />
              )}
              {/* Node dot */}
              <circle
                cx={node.x} cy={node.y}
                r={isHighlighted ? 4.5 : 3}
                fill={node.color}
                opacity={dimmed ? 0.2 : 0.9}
                style={{ transition: "opacity 200ms" }}
              />
              {/* Radial label */}
              <text
                x={node.lx}
                y={node.ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                transform={`rotate(${textRotation}, ${node.lx}, ${node.ly})`}
                fontSize={isHighlighted ? 9 : 7.5}
                fontFamily="EB Garamond, Georgia, serif"
                fill={dimmed ? "hsl(0, 0%, 80%)" : "hsl(0, 0%, 25%)"}
                opacity={dimmed ? 0.25 : 0.85}
                fontWeight={isHighlighted ? 600 : 400}
                style={{ transition: "opacity 200ms, fill 200ms" }}
              >
                {truncate(node.value, 20)}
              </text>
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
};

export default ValuesChordDiagram;
