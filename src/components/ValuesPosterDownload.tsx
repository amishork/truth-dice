import React, { useRef, useState, useMemo } from "react";
import { CORE_VALUES } from "@/data/values";
import { trackResultsShared } from "@/lib/analytics";
import ValuesChordDiagramPrint from "./ValuesChordDiagramPrint";
import type { QuizSession } from "@/lib/quizSessions";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const CRIMSON = "#9B1B3A";
const CRIMSON_LIGHT = "#C4435F";
const GRAY_CHORD = "#EAE7E2";
const GRAY_NODE = "#DDDAD5";
const GRAY_LABEL = "#B0ADA8";
const DARK = "#1A1614";

// ─── Chord diagram geometry ───────────────────────────────────────────────────
const CX = 300;
const CY = 300;
const NODE_R = 225;       // radius at which value dots sit
const LABEL_R = 248;      // radius at which core value labels sit
const TOTAL = CORE_VALUES.length;
const TAU = Math.PI * 2;

function angle(i: number) {
  return -Math.PI / 2 + (i / TOTAL) * TAU;
}

function pt(r: number, a: number) {
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

// Cubic bezier chord path between two points, curving toward center
function chordPath(a1: number, a2: number, r: number, ctrl = 0.4) {
  const p1 = pt(r, a1);
  const p2 = pt(r, a2);
  const c = { x: CX * (1 - ctrl) + (p1.x + p2.x) / 2 * ctrl, y: CY * (1 - ctrl) + (p1.y + p2.y) / 2 * ctrl };
  return `M ${p1.x} ${p1.y} Q ${c.x} ${c.y} ${p2.x} ${p2.y}`;
}

// Label anchor and alignment for a given angle
function labelAnchor(a: number): "start" | "middle" | "end" {
  const deg = ((a * 180) / Math.PI + 360) % 360;
  if (deg > 350 || deg < 10) return "middle";
  if (deg >= 10 && deg < 170) return "start";
  if (deg >= 170 && deg < 190) return "middle";
  return "end";
}

// ─── Poster chord diagram (SVG) ───────────────────────────────────────────────
function PosterChordDiagram({ coreValues }: { coreValues: string[] }) {
  const coreSet = useMemo(() => new Set(coreValues), [coreValues]);

  const nodes = useMemo(() =>
    CORE_VALUES.map((v, i) => ({
      value: v,
      angle: angle(i),
      isCore: coreSet.has(v),
      ...pt(NODE_R, angle(i)),
    })),
    [coreSet]
  );

  const coreNodes = nodes.filter((n) => n.isCore);

  // Background chords: all values to their nearest neighbours (sparse, not all-to-all — too dense)
  const bgChords = useMemo(() => {
    const paths: string[] = [];
    const step = Math.floor(TOTAL / 16); // connect every ~12th node to create a web pattern
    for (let i = 0; i < TOTAL; i++) {
      for (let j = i + step; j < TOTAL; j += step) {
        paths.push(chordPath(angle(i), angle(j), NODE_R));
      }
    }
    return paths;
  }, []);

  // Foreground chords: all pairings among the 6 core values
  const coreChords = useMemo(() => {
    const paths: string[] = [];
    for (let i = 0; i < coreNodes.length; i++) {
      for (let j = i + 1; j < coreNodes.length; j++) {
        paths.push(chordPath(coreNodes[i].angle, coreNodes[j].angle, NODE_R, 0.35));
      }
    }
    return paths;
  }, [coreNodes]);

  return (
    <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Background web chords */}
      <g opacity="0.35">
        {bgChords.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={GRAY_CHORD} strokeWidth="0.6" />
        ))}
      </g>

      {/* All value nodes — gray */}
      {nodes.map((n) => !n.isCore && (
        <circle key={n.value} cx={n.x} cy={n.y} r={2} fill={GRAY_NODE} />
      ))}

      {/* Core value chord connections */}
      {coreChords.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={CRIMSON} strokeWidth="1.8" opacity="0.65" />
      ))}

      {/* Core value nodes — crimson, prominent */}
      {coreNodes.map((n) => (
        <g key={n.value}>
          {/* Glow ring */}
          <circle cx={n.x} cy={n.y} r={9} fill={CRIMSON} opacity="0.12" />
          <circle cx={n.x} cy={n.y} r={6} fill={CRIMSON} opacity="0.25" />
          <circle cx={n.x} cy={n.y} r={4} fill={CRIMSON} />
        </g>
      ))}

      {/* Core value labels */}
      {coreNodes.map((n) => {
        const lp = pt(LABEL_R + 18, n.angle);
        const anchor = labelAnchor(n.angle);
        // Strip parenthetical clarifications for cleaner label
        const label = n.value.replace(/\s*\(.*?\)/, "").replace(/\s*\(i\.e\..*?\)/, "").toUpperCase();
        return (
          <text
            key={n.value}
            x={lp.x}
            y={lp.y}
            textAnchor={anchor}
            dominantBaseline="central"
            fontSize="9.5"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="600"
            letterSpacing="0.08em"
            fill={CRIMSON}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Main export component ────────────────────────────────────────────────────
interface ValuesPosterDownloadProps {
  coreValues: string[];
  areaLabel?: string;
  sessions?: QuizSession[];
}

export default function ValuesPosterDownload({ coreValues, areaLabel, sessions }: ValuesPosterDownloadProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!posterRef.current || isGenerating) return;
    setIsGenerating(true);

    try {
      // Dynamic imports to keep bundle lean — only load when user clicks
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = jsPDFModule;

      const canvas = await html2canvas(posterRef.current, {
        scale: 3,           // 3x = ~288 DPI equivalent for print
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.97);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",  // 8.5 x 11 inches
      });
      pdf.addImage(imgData, "JPEG", 0, 0, 8.5, 11);
      pdf.save("my-core-values.pdf");

      trackResultsShared("pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden poster — rendered off-screen for capture */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "816px",      // 8.5in × 96dpi
          height: "1056px",    // 11in × 96dpi
          backgroundColor: "#FFFFFF",
          fontFamily: "'IBM Plex Mono', monospace",
          overflow: "hidden",
        }}
        ref={posterRef}
      >
        {/* Top rule */}
        <div style={{ width: "100%", height: "8px", backgroundColor: CRIMSON }} />

        {/* Heading area */}
        <div style={{
          padding: "48px 64px 0 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}>
          {/* Eyebrow */}
          {areaLabel && (
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: GRAY_LABEL,
              margin: "0 0 10px 0",
            }}>
              {areaLabel}
            </p>
          )}

          {/* Main heading */}
          <h1 style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "38px",
            fontWeight: "700",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: DARK,
            margin: 0,
            lineHeight: 1,
          }}>
            My Core Values
          </h1>

          {/* Crimson rule */}
          <div style={{ width: "64px", height: "3px", backgroundColor: CRIMSON, margin: "20px 0 0 0" }} />
        </div>

        {/* Chord diagram */}
        <div style={{
          width: "640px",
          height: "640px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {sessions && sessions.length > 0 ? (
            <ValuesChordDiagramPrint sessions={sessions} coreValues={coreValues} />
          ) : (
            <PosterChordDiagram coreValues={coreValues} />
          )}
        </div>

        {/* Bottom rule + branding */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 64px 36px 64px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: `1px solid ${GRAY_CHORD}`,
          paddingTop: "20px",
        }}>
          <div>
            <p style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "18px",
              fontWeight: "600",
              color: DARK,
              margin: 0,
              letterSpacing: "0.04em",
            }}>
              Words Incarnate
            </p>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              color: GRAY_LABEL,
              margin: "3px 0 0 0",
              letterSpacing: "0.06em",
            }}>
              wordsincarnate.com
            </p>
          </div>

          {/* Decorative crimson square */}
          <div style={{ width: "8px", height: "8px", backgroundColor: CRIMSON, marginBottom: "6px" }} />
        </div>
      </div>

      {/* Visible download button */}
      <button
        onClick={handleDownload}
        disabled={isGenerating || coreValues.length < 6}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1v9M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {isGenerating ? "Generating PDF…" : "Download Poster (PDF)"}
      </button>
    </div>
  );
}
