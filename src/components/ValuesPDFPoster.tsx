/**
 * ValuesPDFPoster
 * Off-screen poster rendered at letter-size proportions (816x1056px at 96dpi).
 * Captured by html2canvas and exported as PDF.
 */
import React from "react";
import ValuesChordDiagramPrint from "./ValuesChordDiagramPrint";
import type { QuizSession } from "@/lib/quizSessions";

interface Props {
  sessions: QuizSession[];
  coreValues: string[];
}

const CRIMSON = "#9B1B3A";

const ValuesPDFPoster: React.FC<Props> = ({ sessions, coreValues }) => {
  return (
    <div
      id="values-pdf-poster"
      style={{
        width: 816,
        height: 1056,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "64px 48px 48px",
        boxSizing: "border-box",
        fontFamily: "Inter, Arial, sans-serif",
        position: "fixed",
        left: -9999,
        top: 0,
        visibility: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.35em",
          color: CRIMSON,
          textTransform: "uppercase",
          marginBottom: 10,
          fontFamily: "IBM Plex Mono, monospace",
        }}>
          Words Incarnate
        </div>
        <div style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "0.22em",
          color: "#1a1a1a",
          textTransform: "uppercase",
          lineHeight: 1.1,
        }}>
          My Core Values
        </div>
        {/* Thin crimson rule */}
        <div style={{
          width: 48,
          height: 2,
          backgroundColor: CRIMSON,
          margin: "18px auto 0",
          borderRadius: 1,
        }} />
      </div>

      {/* Chord Diagram */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "8px 0" }}>
        <div style={{ width: 620, height: 620 }}>
          <ValuesChordDiagramPrint sessions={sessions} coreValues={coreValues} />
        </div>
      </div>

      {/* Core values list under the diagram */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px 16px",
        marginBottom: 28,
        width: "100%",
        maxWidth: 600,
      }}>
        {coreValues.map((v) => (
          <span key={v} style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: CRIMSON,
            textTransform: "uppercase",
          }}>
            {v}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", borderTop: "1px solid #e8e8e8", paddingTop: 20, width: "100%" }}>
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "#1a1a1a",
          marginBottom: 4,
        }}>
          Words Incarnate
        </div>
        <div style={{
          fontSize: 11,
          color: "#999999",
          letterSpacing: "0.06em",
        }}>
          wordsincarnate.com
        </div>
      </div>
    </div>
  );
};

export default ValuesPDFPoster;
