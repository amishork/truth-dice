import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Grid, AlignCenter, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ValuesPosterGeneratorProps {
  values: string[];
  open: boolean;
  onClose: () => void;
}

type Layout = "grid" | "stack" | "scatter";
type BgStyle = "light" | "dark" | "gradient";
type FontStyle = "serif" | "sans";

const SCATTER_POSITIONS = [
  { x: 15, y: 12, rotate: -8 },
  { x: 55, y: 8, rotate: 5 },
  { x: 25, y: 38, rotate: 3 },
  { x: 60, y: 42, rotate: -4 },
  { x: 18, y: 68, rotate: 6 },
  { x: 58, y: 72, rotate: -6 },
];

const ValuesPosterGenerator: React.FC<ValuesPosterGeneratorProps> = ({ values, open, onClose }) => {
  const [layout, setLayout] = useState<Layout>("stack");
  const [bg, setBg] = useState<BgStyle>("light");
  const [font, setFont] = useState<FontStyle>("serif");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bgColors: Record<BgStyle, { bg: string; fg: string; sub: string }> = {
    light: { bg: "#FFFFFF", fg: "#141414", sub: "#999999" },
    dark: { bg: "#111111", fg: "#F0F0F0", sub: "#666666" },
    gradient: { bg: "gradient", fg: "#FFFFFF", sub: "#CCCCCC" },
  };

  const fontFamily = font === "serif" ? "'EB Garamond', Georgia, serif" : "'Inter', system-ui, sans-serif";

  const renderPoster = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const colors = bgColors[bg];

      // Background
      if (bg === "gradient") {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, "#1a0a0a");
        grad.addColorStop(0.5, "#2a1020");
        grad.addColorStop(1, "#0a0a1a");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = colors.bg;
      }
      ctx.fillRect(0, 0, w, h);

      const scale = w / 600; // reference width

      if (layout === "stack") {
        // Centered stack
        ctx.textAlign = "center";
        ctx.fillStyle = colors.sub;
        ctx.font = `${11 * scale}px ${fontFamily}`;
        ctx.letterSpacing = `${4 * scale}px`;
        ctx.fillText("MY CORE VALUES", w / 2, 140 * scale);
        ctx.letterSpacing = "0px";

        values.forEach((v, i) => {
          const y = 260 * scale + i * 100 * scale;
          ctx.fillStyle = colors.fg;
          ctx.font = `${font === "serif" ? "italic " : "600 "}${32 * scale}px ${fontFamily}`;
          ctx.fillText(v, w / 2, y);

          // Rank number
          ctx.fillStyle = colors.sub;
          ctx.font = `${12 * scale}px 'IBM Plex Mono', monospace`;
          ctx.fillText(`${String(i + 1).padStart(2, "0")}`, w / 2, y + 28 * scale);
        });
      } else if (layout === "grid") {
        ctx.textAlign = "center";
        ctx.fillStyle = colors.sub;
        ctx.font = `${11 * scale}px ${fontFamily}`;
        ctx.letterSpacing = `${4 * scale}px`;
        ctx.fillText("MY CORE VALUES", w / 2, 100 * scale);
        ctx.letterSpacing = "0px";

        values.forEach((v, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const cx = w * (col === 0 ? 0.3 : 0.7);
          const cy = 220 * scale + row * 180 * scale;

          // Box
          const bw = 200 * scale;
          const bh = 120 * scale;
          ctx.strokeStyle = colors.sub + "44";
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);

          ctx.fillStyle = colors.fg;
          ctx.font = `${font === "serif" ? "italic " : "600 "}${22 * scale}px ${fontFamily}`;
          ctx.fillText(v, cx, cy + 6 * scale);

          ctx.fillStyle = colors.sub;
          ctx.font = `${10 * scale}px 'IBM Plex Mono', monospace`;
          ctx.fillText(`${String(i + 1).padStart(2, "0")}`, cx, cy - bh / 2 + 18 * scale);
        });
      } else {
        // Scatter
        ctx.textAlign = "center";
        values.forEach((v, i) => {
          const pos = SCATTER_POSITIONS[i] || { x: 50, y: 50, rotate: 0 };
          const px = (pos.x / 100) * w;
          const py = (pos.y / 100) * h;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate((pos.rotate * Math.PI) / 180);

          ctx.fillStyle = colors.fg;
          ctx.font = `${font === "serif" ? "italic " : "600 "}${28 * scale}px ${fontFamily}`;
          ctx.fillText(v, 0, 0);
          ctx.restore();
        });
      }

      // Watermark
      ctx.textAlign = "center";
      ctx.fillStyle = colors.sub + "88";
      ctx.font = `${9 * scale}px 'IBM Plex Mono', monospace`;
      ctx.letterSpacing = `${3 * scale}px`;
      ctx.fillText("WORDS INCARNATE", w / 2, h - 40 * scale);
      ctx.letterSpacing = "0px";
    },
    [bg, font, layout, values]
  );

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 2400;
    canvas.height = 3200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderPoster(ctx, 2400, 3200);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-values-poster.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>

          <h3 className="text-xl font-semibold text-foreground mb-1">Values Poster</h3>
          <p className="text-sm text-muted-foreground mb-5">Customize and download a printable poster of your values.</p>

          {/* Options */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex gap-1.5">
              <button onClick={() => setLayout("stack")} className={`p-2 rounded border transition-colors ${layout === "stack" ? "border-primary bg-primary/10" : "border-border"}`}>
                <AlignCenter className="h-4 w-4" />
              </button>
              <button onClick={() => setLayout("grid")} className={`p-2 rounded border transition-colors ${layout === "grid" ? "border-primary bg-primary/10" : "border-border"}`}>
                <Grid className="h-4 w-4" />
              </button>
              <button onClick={() => setLayout("scatter")} className={`p-2 rounded border transition-colors ${layout === "scatter" ? "border-primary bg-primary/10" : "border-border"}`}>
                <Shuffle className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-1.5">
              {(["light", "dark", "gradient"] as BgStyle[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setBg(b)}
                  className={`px-3 py-1.5 rounded border text-xs transition-colors ${bg === b ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}
                >
                  {b}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {(["serif", "sans"] as FontStyle[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFont(f)}
                  className={`px-3 py-1.5 rounded border text-xs transition-colors ${font === f ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"} ${f === "serif" ? "font-serif" : "font-sans"}`}
                >
                  {f === "serif" ? "Elegant" : "Modern"}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className={`relative rounded-lg border border-border aspect-[3/4] flex flex-col items-center justify-center overflow-hidden ${
              bg === "light" ? "bg-white text-black" : bg === "dark" ? "bg-[#111] text-white" : "bg-gradient-to-br from-[#1a0a0a] via-[#2a1020] to-[#0a0a1a] text-white"
            }`}
          >
            {layout === "stack" && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-[0.55rem] tracking-[0.3em] uppercase opacity-50 font-mono">My Core Values</p>
                {values.map((v, i) => (
                  <div key={v} className="text-center">
                    <p className={`text-lg ${font === "serif" ? "font-serif italic" : "font-sans font-semibold"}`}>{v}</p>
                    <p className="text-[0.5rem] font-mono opacity-40 mt-0.5">{String(i + 1).padStart(2, "0")}</p>
                  </div>
                ))}
              </div>
            )}
            {layout === "grid" && (
              <div className="w-full px-8">
                <p className="text-[0.55rem] tracking-[0.3em] uppercase opacity-50 font-mono text-center mb-4">My Core Values</p>
                <div className="grid grid-cols-2 gap-3">
                  {values.map((v, i) => (
                    <div key={v} className="border border-current/10 rounded p-3 text-center">
                      <p className="text-[0.5rem] font-mono opacity-40 mb-1">{String(i + 1).padStart(2, "0")}</p>
                      <p className={`text-sm ${font === "serif" ? "font-serif italic" : "font-sans font-semibold"}`}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {layout === "scatter" && (
              <div className="relative w-full h-full">
                {values.map((v, i) => {
                  const pos = SCATTER_POSITIONS[i];
                  return (
                    <p
                      key={v}
                      className={`absolute ${font === "serif" ? "font-serif italic" : "font-sans font-semibold"} text-base`}
                      style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `rotate(${pos.rotate}deg)` }}
                    >
                      {v}
                    </p>
                  );
                })}
              </div>
            )}
            <p className="absolute bottom-3 text-[0.45rem] font-mono tracking-[0.25em] uppercase opacity-30">Words Incarnate</p>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <Button onClick={handleDownload} className="w-full mt-5">
            <Download className="h-4 w-4" />
            Download poster (PNG)
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ValuesPosterGenerator;
