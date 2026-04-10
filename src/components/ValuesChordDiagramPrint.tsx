/**
 * ValuesChordDiagramPrint
 * Static SVG-only chord diagram for PDF export.
 * No Framer Motion, no interactivity.
 * coreValues: the user's final 6 — rendered in crimson.
 * All other nodes rendered in light gray.
 */
import React, { useMemo } from "react";
import type { QuizSession } from "@/lib/quizSessions";

interface Props {
  sessions: QuizSession[];
  coreValues: string[];
}

const CRIMSON = "#9B1B3A";
const GRAY_LIGHT = "#d8d8d8";
const GRAY_SEGMENT = "#ebebeb";

const AREA_META: Record<string, { label: string; color: string; order: number }> = {
  personal:        { label: "Personal",      color: CRIMSON, order: 0 },
  leader:          { label: "Leader",         color: CRIMSON, order: 1 },
  spouse:          { label: "Ideal Spouse",   color: CRIMSON, order: 2 },
  parent:          { label: "Parent",         color: CRIMSON, order: 3 },
  children:        { label: "Children",       color: CRIMSON, order: 4 },
  "spouse-values": { label: "Spouse Values",  color: CRIMSON, order: 5 },
  friends:         { label: "Friends",        color: CRIMSON, order: 6 },
  work:            { label: "Work",           color: CRIMSON, order: 7 },
  leisure:         { label: "Leisure",        color: CRIMSON, order: 8 },
};

const ALL_AREAS = Object.keys(AREA_META).sort((a, b) => AREA_META[a].order - AREA_META[b].order);
const TAU = Math.PI * 2;
const CX = 250;
const CY = 250;
const OUTER_R = 215;
const INNER_R = 195;
const NODE_R = 180;
const LABEL_R = 204;
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
}

const ValuesChordDiagramPrint: React.FC<Props> = ({ sessions, coreValues }) => {
  const coreSet = useMemo(() => new Set(coreValues.map((v) => v.toLowerCase())), [coreValues]);

  const { nodes, chords, segmentAngles, completedAreas } = useMemo(() => {
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

    const completed = new Set<string>(latestByArea.keys());
    const allNodes: NodeData[] = [];

    latestByArea.forEach((session, area) => {
      const seg = segAngles[area];
      if (!seg) return;
      const values = session.final_six_values;

      const arcSpan = seg.end - seg.start;
      const padding = arcSpan * 0.1;
      const usable = arcSpan - padding * 2;

      values.forEach((value, vi) => {
        const t = values.length > 1 ? vi / (values.length - 1) : 0.5;
        const angle = seg.start + padding + usable * t;
        const pos = polar(CX, CY, NODE_R, angle);
        allNodes.push({ area, value, angle, x: pos.x, y: pos.y });
      });
    });

    const valueGroups = new Map<string, NodeData[]>();
    allNodes.forEach((node) => {
      const key = node.value.toLowerCase();
      if (!valueGroups.has(key)) valueGroups.set(key, []);
      valueGroups.get(key)!.push(node);
    });

    const allChords: { from: NodeData; to: NodeData; isCore: boolean }[] = [];
    valueGroups.forEach((group, key) => {
      if (group.length < 2) return;
      const isCore = coreSet.has(key);
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (group[i].area !== group[j].area) {
            allChords.push({ from: group[i], to: group[j], isCore });
          }
        }
      }
    });

    return { nodes: allNodes, chords: allChords, segmentAngles: segAngles, completedAreas: completed };
  }, [sessions, coreSet]);

  return (
    <svg viewBox="0 0 500 500" width="500" height="500" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring segments */}
      {ALL_AREAS.map((area) => {
        const seg = segmentAngles[area];
        if (!seg) return null;
        const completed = completedAreas.has(area);

        const arcId = `arc-print-${area}`;
        const labelStart = polar(CX, CY, LABEL_R, seg.start);
        const labelEnd = polar(CX, CY, LABEL_R, seg.end);
        const arcSweep = seg.end - seg.start;
        const largeArc = arcSweep > Math.PI ? 1 : 0;

        return (
          <g key={area}>
            <path
              d={segmentPath(CX, CY, OUTER_R, INNER_R, seg.start, seg.end)}
              fill={completed ? CRIMSON : GRAY_SEGMENT}
              opacity={completed ? 0.55 : 0.4}
              stroke="white"
              strokeWidth={1.5}
            />
            <defs>
              <path
                id={arcId}
                d={`M ${labelStart.x} ${labelStart.y} A ${LABEL_R} ${LABEL_R} 0 ${largeArc} 1 ${labelEnd.x} ${labelEnd.y}`}
                fill="none"
              />
            </defs>
            {completed && (
              <text fontSize={7} fontFamily="Inter, Arial, sans-serif" fontWeight={600} fill="white" opacity={0.9} letterSpacing={0.5}>
                <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                  {AREA_META[area].label.toUpperCase()}
                </textPath>
              </text>
            )}
          </g>
        );
      })}

      {/* Chords — gray first, then crimson on top */}
      {chords
        .filter((c) => !c.isCore)
        .map((chord, i) => (
          <line
            key={`gray-${i}`}
            x1={chord.from.x} y1={chord.from.y}
            x2={chord.to.x} y2={chord.to.y}
            stroke={GRAY_LIGHT}
            strokeWidth={0.8}
            opacity={0.5}
          />
        ))}
      {chords
        .filter((c) => c.isCore)
        .map((chord, i) => (
          <line
            key={`core-${i}`}
            x1={chord.from.x} y1={chord.from.y}
            x2={chord.to.x} y2={chord.to.y}
            stroke={CRIMSON}
            strokeWidth={1.8}
            opacity={0.7}
          />
        ))}

      {/* Nodes — gray first, core on top */}
      {nodes
        .filter((n) => !coreSet.has(n.value.toLowerCase()))
        .map((node, i) => (
          <circle
            key={`gray-node-${i}`}
            cx={node.x} cy={node.y} r={3}
            fill={GRAY_LIGHT}
            opacity={0.6}
          />
        ))}
      {nodes
        .filter((n) => coreSet.has(n.value.toLowerCase()))
        .map((node, i) => (
          <g key={`core-node-${i}`}>
            <circle cx={node.x} cy={node.y} r={5.5} fill={CRIMSON} opacity={0.15} />
            <circle cx={node.x} cy={node.y} r={3.5} fill={CRIMSON} />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={6.5}
              fontFamily="Inter, Arial, sans-serif"
              fontWeight={700}
              fill={CRIMSON}
              dx={Math.cos(node.angle) * 16}
              dy={Math.sin(node.angle) * 16}
            >
              {node.value.toUpperCase()}
            </text>
          </g>
        ))}
    </svg>
  );
};

export default ValuesChordDiagramPrint;
