import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { QuizSession } from "@/lib/quizSessions";

interface ValuesChordDiagramProps {
  sessions: QuizSession[];
  activeSessionId: string | null;
}

const AREA_META: Record<string, { label: string; color: string; order: number }> = {
  personal:       { label: "Personal",         color: "hsl(350, 78%, 34%)", order: 0 },
  leader:         { label: "Leader",           color: "hsl(0, 0%, 25%)",    order: 1 },
  spouse:         { label: "Ideal Spouse",     color: "hsl(350, 45%, 55%)", order: 2 },
  parent:         { label: "Parent",           color: "hsl(350, 50%, 20%)", order: 3 },
  children:       { label: "Children",         color: "hsl(35, 30%, 65%)",  order: 4 },
  "spouse-values":{ label: "Spouse Values",    color: "hsl(350, 35%, 45%)", order: 5 },
  friends:        { label: "Friends",          color: "hsl(0, 0%, 45%)",    order: 6 },
  work:           { label: "Work",             color: "hsl(0, 0%, 35%)",    order: 7 },
  leisure:        { label: "Leisure",          color: "hsl(20, 10%, 75%)",  order: 8 },
};

const ALL_AREAS = Object.keys(AREA_META).sort((a, b) => AREA_META[a].order - AREA_META[b].order);
const TAU = Math.PI * 2;
const CX = 200;
const CY = 200;
const OUTER_R = 175;
const INNER_R = 155;
const NODE_R = 140;
const GAP_RAD = 0.02; // gap between segments in radians

function polarToXY(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToXY(cx, cy, r, startAngle);
  const end = polarToXY(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function segmentPath(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number): string {
  const outerStart = polarToXY(cx, cy, outerR, startAngle);
  const outerEnd = polarToXY(cx, cy, outerR, endAngle);
  const innerStart = polarToXY(cx, cy, innerR, startAngle);
  const innerEnd = polarToXY(cx, cy, innerR, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    `Z`,
  ].join(" ");
}

const ValuesChordDiagram: React.FC<ValuesChordDiagramProps> = ({ sessions, activeSessionId }) => {
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  const completedAreas = useMemo(() => {
    const areas = new Set<string>();
    sessions.forEach((s) => areas.add(s.area_of_life));
    return areas;
  }, [sessions]);

  // Build nodes: { area, value, angle, x, y, color }
  const { nodes, chords, segmentAngles } = useMemo(() => {
    const segSize = TAU / ALL_AREAS.length;
    const segAngles: Record<string, { start: number; end: number; mid: number }> = {};

    ALL_AREAS.forEach((area, i) => {
      const start = -Math.PI / 2 + i * segSize + GAP_RAD;
      const end = -Math.PI / 2 + (i + 1) * segSize - GAP_RAD;
      segAngles[area] = { start, end, mid: (start + end) / 2 };
    });

    // Build nodes from sessions (latest per area)
    const latestByArea = new Map<string, QuizSession>();
    sessions.forEach((s) => {
      if (!latestByArea.has(s.area_of_life)) latestByArea.set(s.area_of_life, s);
    });

    const allNodes: { area: string; value: string; angle: number; x: number; y: number; color: string }[] = [];

    latestByArea.forEach((session, area) => {
      const seg = segAngles[area];
      if (!seg) return;
      const values = session.final_six_values;
      const meta = AREA_META[area];
      if (!meta) return;

      values.forEach((value, vi) => {
        const t = values.length > 1 ? vi / (values.length - 1) : 0.5;
        const angle = seg.start + (seg.end - seg.start) * (0.15 + t * 0.7);
        const pos = polarToXY(CX, CY, NODE_R, angle);
        allNodes.push({ area, value, angle, x: pos.x, y: pos.y, color: meta.color });
      });
    });

    // Build chords: connect nodes with identical value names across different areas
    const valueGroups = new Map<string, typeof allNodes>();
    allNodes.forEach((node) => {
      const key = node.value.toLowerCase();
      if (!valueGroups.has(key)) valueGroups.set(key, []);
      valueGroups.get(key)!.push(node);
    });

    const allChords: { from: typeof allNodes[0]; to: typeof allNodes[0]; value: string }[] = [];
    valueGroups.forEach((group, key) => {
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
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Outer ring segments */}
        {ALL_AREAS.map((area) => {
          const seg = segmentAngles[area];
          if (!seg) return null;
          const meta = AREA_META[area];
          const completed = completedAreas.has(area);
          const isHovered = hoveredArea === area;

          return (
            <g key={area}
              onMouseEnter={() => setHoveredArea(area)}
              onMouseLeave={() => setHoveredArea(null)}
              style={{ cursor: completed ? "pointer" : "default" }}
            >
              <path
                d={segmentPath(CX, CY, OUTER_R, INNER_R, seg.start, seg.end)}
                fill={completed ? meta.color : "hsl(0, 0%, 90%)"}
                opacity={completed ? (isHovered ? 0.95 : 0.75) : 0.25}
                stroke="hsl(0, 0%, 100%)"
                strokeWidth={1}
              />
              {/* Segment label */}
              {(() => {
                const labelR = OUTER_R + 12;
                const labelAngle = seg.mid;
                const pos = polarToXY(CX, CY, labelR, labelAngle);
                const deg = (labelAngle * 180) / Math.PI;
                const flip = deg > 90 || deg < -90;
                return (
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${flip ? deg + 180 : deg}, ${pos.x}, ${pos.y})`}
                    fill={completed ? meta.color : "hsl(0, 0%, 75%)"}
                    fontSize={7}
                    fontFamily="IBM Plex Mono, monospace"
                    letterSpacing="0.06em"
                    opacity={completed ? 0.85 : 0.45}
                  >
                    {meta.label.toUpperCase()}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Chords */}
        {chords.map((chord, i) => {
          const isHighlighted =
            hoveredValue?.toLowerCase() === chord.value.toLowerCase() ||
            hoveredArea === chord.from.area ||
            hoveredArea === chord.to.area;
          const opacity = hoveredValue || hoveredArea
            ? isHighlighted ? 0.5 : 0.04
            : 0.2;

          return (
            <path
              key={`chord-${i}`}
              d={`M ${chord.from.x} ${chord.from.y} Q ${CX} ${CY} ${chord.to.x} ${chord.to.y}`}
              fill="none"
              stroke={chord.from.color}
              strokeWidth={isHighlighted ? 2 : 1}
              opacity={opacity}
              style={{ transition: "opacity 200ms, stroke-width 200ms" }}
            />
          );
        })}

        {/* Value nodes */}
        {nodes.map((node, i) => {
          const isHighlighted =
            hoveredValue?.toLowerCase() === node.value.toLowerCase() ||
            hoveredArea === node.area;
          const dimmed = (hoveredValue || hoveredArea) && !isHighlighted;

          return (
            <g key={`node-${i}`}
              onMouseEnter={() => setHoveredValue(node.value)}
              onMouseLeave={() => setHoveredValue(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Glow */}
              {isHighlighted && (
                <circle
                  cx={node.x} cy={node.y} r={10}
                  fill={node.color}
                  opacity={0.15}
                />
              )}
              {/* Dot */}
              <circle
                cx={node.x} cy={node.y}
                r={isHighlighted ? 5 : 3.5}
                fill={node.color}
                opacity={dimmed ? 0.25 : 1}
                style={{ transition: "r 200ms, opacity 200ms" }}
              />
              {/* Label */}
              <text
                x={node.x}
                y={node.y - 8}
                textAnchor="middle"
                fontSize={isHighlighted ? 7.5 : 6.5}
                fontFamily="EB Garamond, Georgia, serif"
                fill={dimmed ? "hsl(0, 0%, 75%)" : "hsl(0, 0%, 20%)"}
                opacity={dimmed ? 0.3 : 0.9}
                style={{ transition: "opacity 200ms, fill 200ms" }}
              >
                {node.value.length > 18 ? node.value.split("(")[0].trim() : node.value}
              </text>
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
};

export default ValuesChordDiagram;
