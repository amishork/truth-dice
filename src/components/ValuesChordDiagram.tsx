import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  children:        { label: "Children",        color: "hsl(35, 30%, 50%)", order: 4 },
  "spouse-values": { label: "Spouse Values",   color: "hsl(350, 35%, 45%)", order: 5 },
  friends:         { label: "Friends",         color: "hsl(0, 0%, 42%)",   order: 6 },
  work:            { label: "Work",            color: "hsl(0, 0%, 30%)",   order: 7 },
  leisure:         { label: "Leisure",         color: "hsl(20, 12%, 58%)", order: 8 },
};

const ALL_AREAS = Object.keys(AREA_META).sort((a, b) => AREA_META[a].order - AREA_META[b].order);
const TAU = Math.PI * 2;
const CX = 250;
const CY = 250;
const OUTER_R = 215;
const INNER_R = 195;
const NODE_R = 180;
const LABEL_R = 204; // midpoint of outer ring for area labels
const GAP_RAD = 0.03;

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

interface NodeData {
  area: string;
  value: string;
  angle: number;
  x: number;
  y: number;
  color: string;
}

const ValuesChordDiagram: React.FC<ValuesChordDiagramProps> = ({ sessions, activeSessionId }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

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

    const allNodes: NodeData[] = [];

    latestByArea.forEach((session, area) => {
      const seg = segAngles[area];
      if (!seg) return;
      const values = session.final_six_values;
      const meta = AREA_META[area];
      if (!meta) return;

      const arcSpan = seg.end - seg.start;
      const padding = arcSpan * 0.1;
      const usable = arcSpan - padding * 2;

      values.forEach((value, vi) => {
        const t = values.length > 1 ? vi / (values.length - 1) : 0.5;
        const angle = seg.start + padding + usable * t;
        const pos = polar(CX, CY, NODE_R, angle);
        allNodes.push({ area, value, angle, x: pos.x, y: pos.y, color: meta.color });
      });
    });

    const valueGroups = new Map<string, NodeData[]>();
    allNodes.forEach((node) => {
      const key = node.value.toLowerCase();
      if (!valueGroups.has(key)) valueGroups.set(key, []);
      valueGroups.get(key)!.push(node);
    });

    const allChords: { from: NodeData; to: NodeData; value: string }[] = [];
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

  // Which areas contain the selected value?
  const highlightedAreas = useMemo(() => {
    if (!selectedValue) return new Set<string>();
    const areas = new Set<string>();
    nodes.forEach((n) => {
      if (n.value.toLowerCase() === selectedValue.toLowerCase()) areas.add(n.area);
    });
    return areas;
  }, [selectedValue, nodes]);

  const handleNodeClick = useCallback((value: string) => {
    setSelectedValue((prev) => prev?.toLowerCase() === value.toLowerCase() ? null : value);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedValue(null);
  }, []);

  if (sessions.length === 0) return null;

  // Clean display name
  const displayName = selectedValue ? selectedValue.split("(")[0].trim() : "";

  return (
    <motion.div
      className="relative mx-auto w-full max-w-md aspect-square"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <svg viewBox="0 0 500 500" className="w-full h-full" onClick={handleBackgroundClick}>
        <defs>
          {/* Radial gradient for curved chord fill region */}
          <radialGradient id="chord-fill-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
            <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </radialGradient>
          {/* Radial gradient for center callout backdrop */}
          <radialGradient id="callout-backdrop" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--background))" stopOpacity="0.95" />
            <stop offset="70%" stopColor="hsl(var(--background))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.6" />
          </radialGradient>
        </defs>

        {/* Outer ring segments + area labels inside them */}
        {ALL_AREAS.map((area) => {
          const seg = segmentAngles[area];
          if (!seg) return null;
          const meta = AREA_META[area];
          const completed = completedAreas.has(area);
          const isSelected = selectedValue && highlightedAreas.has(area);

          // Arc path for textPath — label follows the curve inside the segment
          const arcId = `arc-${area}`;
          const labelMid = polar(CX, CY, LABEL_R, seg.start);
          const labelEnd = polar(CX, CY, LABEL_R, seg.end);
          const arcSweep = seg.end - seg.start;
          const largeArc = arcSweep > Math.PI ? 1 : 0;

          return (
            <g key={area}>
              <path
                d={segmentPath(CX, CY, OUTER_R, INNER_R, seg.start, seg.end)}
                fill={completed ? meta.color : "hsl(0, 0%, 92%)"}
                opacity={
                  selectedValue
                    ? isSelected ? 0.92 : (completed ? 0.15 : 0.08)
                    : completed ? 0.6 : 0.15
                }
                stroke="hsl(var(--background))"
                strokeWidth={1.5}
                style={{ transition: "opacity 250ms" }}
              />
              {/* Hidden arc path for textPath */}
              <defs>
                <path
                  id={arcId}
                  d={`M ${labelMid.x} ${labelMid.y} A ${LABEL_R} ${LABEL_R} 0 ${largeArc} 1 ${labelEnd.x} ${labelEnd.y}`}
                  fill="none"
                />
              </defs>
              <text
                fill={completed ? "hsl(0, 0%, 98%)" : "hsl(0, 0%, 78%)"}
                fontSize={selectedValue && isSelected ? 8.5 : 7.5}
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight={selectedValue && isSelected ? 700 : 600}
                letterSpacing="0.14em"
                opacity={
                  selectedValue
                    ? isSelected ? 1 : (completed ? 0.2 : 0.15)
                    : completed ? 0.9 : 0.3
                }
                style={{ transition: "opacity 250ms, font-size 250ms" }}
              >
                <textPath
                  href={`#${arcId}`}
                  startOffset="50%"
                  textAnchor="middle"
                >
                  {meta.label.toUpperCase()}
                </textPath>
              </text>
            </g>
          );
        })}

        {/* Filled curved region between connected chord paths */}
        {selectedValue && (() => {
          const matchingNodes = nodes
            .filter(n => n.value.toLowerCase() === selectedValue.toLowerCase())
            .sort((a, b) => a.angle - b.angle);
          if (matchingNodes.length < 2) return null;
          // Build closed path following the actual bezier curves through center
          const first = matchingNodes[0];
          let d = `M ${first.x} ${first.y}`;
          for (let i = 1; i < matchingNodes.length; i++) {
            d += ` Q ${CX} ${CY} ${matchingNodes[i].x} ${matchingNodes[i].y}`;
          }
          // Close back to first node via center
          d += ` Q ${CX} ${CY} ${first.x} ${first.y} Z`;
          return (
            <path
              d={d}
              fill="url(#chord-fill-gradient)"
              style={{ transition: "opacity 250ms" }}
            />
          );
        })()}

        {/* Chords */}
        {chords.map((chord, i) => {
          const isHighlighted = selectedValue?.toLowerCase() === chord.value.toLowerCase();
          const opacity = selectedValue
            ? isHighlighted ? 0.55 : 0.02
            : 0.12;

          return (
            <path
              key={`chord-${i}`}
              d={`M ${chord.from.x} ${chord.from.y} Q ${CX} ${CY} ${chord.to.x} ${chord.to.y}`}
              fill="none"
              stroke={isHighlighted ? chord.from.color : "hsl(0, 0%, 60%)"}
              strokeWidth={isHighlighted ? 2.5 : 0.8}
              opacity={opacity}
              style={{ transition: "opacity 250ms, stroke-width 250ms, stroke 250ms" }}
            />
          );
        })}

        {/* Value nodes — no labels, just dots */}
        {nodes.map((node, i) => {
          const isMatch = selectedValue?.toLowerCase() === node.value.toLowerCase();
          const dimmed = selectedValue && !isMatch;

          return (
            <g key={`node-${i}`}
              onClick={(e) => { e.stopPropagation(); handleNodeClick(node.value); }}
              style={{ cursor: "pointer" }}
            >
              {/* Pulse ring on selected match */}
              {isMatch && (
                <circle
                  cx={node.x} cy={node.y} r={10}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={1.5}
                  opacity={0.3}
                />
              )}
              {/* Dot */}
              <circle
                cx={node.x} cy={node.y}
                r={isMatch ? 5 : 3.5}
                fill={node.color}
                opacity={dimmed ? 0.15 : 0.85}
                style={{ transition: "opacity 200ms, r 200ms" }}
              />
              {/* Invisible hit area */}
              <circle
                cx={node.x} cy={node.y}
                r={12}
                fill="transparent"
              />
            </g>
          );
        })}

        {/* Center callout label */}
        <AnimatePresence>
          {selectedValue && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Gradient backdrop */}
              <circle
                cx={CX} cy={CY} r={55}
                fill="url(#callout-backdrop)"
              />
              <circle
                cx={CX} cy={CY} r={55}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                opacity={0.2}
              />
              <text
                x={CX}
                y={highlightedAreas.size > 1 ? CY - 7 : CY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={18}
                fontFamily="EB Garamond, Georgia, serif"
                fontWeight={600}
                fill="hsl(var(--foreground))"
              >
                {displayName}
              </text>
              {highlightedAreas.size > 1 && (
                <text
                  x={CX}
                  y={CY + 13}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={7.5}
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight={500}
                  letterSpacing="0.1em"
                  fill="hsl(var(--primary))"
                >
                  {`ACROSS ${highlightedAreas.size} AREAS`}
                </text>
              )}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
};

export default ValuesChordDiagram;
