import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackResultsShared } from "@/lib/analytics";

interface ShareableValuesCardProps {
  values: string[];
}

// ─── Style Constitution Palette ───────────────────────────────────────────────
const C = {
  white: "#FFFFFF",
  paper: "#FAFAF8",      // Warm white paper
  pencil: "#D4D0C8",     // Layer 1
  pencilFaint: "#E8E5DF",
  pen: "#1C1C1C",        // Layer 2
  hatch: "#B0ACA4",      // Layer 3
  red: "#9B1B3A",        // Layer 4
};

// Lucide Flame path at 24x24 viewBox
const FLAME_PATH = "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z";

const ShareableValuesCard: React.FC<ShareableValuesCardProps> = ({ values }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    const scale = 3; // High DPI
    const w = 600;
    const h = 800;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // ─── Paper ─────────────────────────────────────────────────────────
    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, w, h);

    // ─── Layer 1: Construction (pencil) — minimal, purposeful ─────────
    ctx.strokeStyle = C.pencilFaint;
    ctx.lineWidth = 0.4;

    // Single vertical center axis — faint, extends past frame
    ctx.beginPath();
    ctx.moveTo(w / 2, 24);
    ctx.lineTo(w / 2, h - 24);
    ctx.stroke();

    // Two horizontal construction lines framing the header zone
    for (const y of [115, 190]) {
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(w - 50, y);
      ctx.stroke();
    }

    // Construction circle — single, centered on flame
    ctx.strokeStyle = C.pencil;
    ctx.lineWidth = 0.35;
    ctx.beginPath();
    ctx.arc(w / 2, 82, 32, 0, Math.PI * 2);
    ctx.stroke();

    // Corner registration marks — precise L-shapes
    ctx.strokeStyle = C.pencil;
    ctx.lineWidth = 0.5;
    const reg = 42;
    const regLen = 14;
    for (const [x, y, dx, dy] of [
      [reg, reg, 1, 1], [w - reg, reg, -1, 1],
      [reg, h - reg, 1, -1], [w - reg, h - reg, -1, -1],
    ] as [number, number, number, number][]) {
      ctx.beginPath();
      ctx.moveTo(x + regLen * dx, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + regLen * dy);
      ctx.stroke();
    }

    // ─── Layer 2: Commitment (pen) — clean, confident ──────────────────
    // Outer frame
    ctx.strokeStyle = C.pen;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(48, 48, w - 96, h - 96);

    // Flame icon — using Lucide path, centered
    ctx.save();
    ctx.translate(w / 2 - 14, 62);
    ctx.scale(1.15, 1.15);
    ctx.fillStyle = C.red;
    const flamePath = new Path2D(FLAME_PATH);
    ctx.fill(flamePath);
    ctx.restore();

    // Brand name — tracked uppercase
    ctx.fillStyle = C.pen;
    ctx.font = "700 11.5px 'Inter', 'Helvetica Neue', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("W O R D S   I N C A R N A T E", w / 2, 128);

    // Subtitle
    ctx.fillStyle = C.red;
    ctx.font = "600 8px 'Inter', 'Helvetica Neue', system-ui, sans-serif";
    ctx.fillText("M Y   C O R E   V A L U E S", w / 2, 146);

    // Header separator — thin line, small red diamond
    const sepY = 172;
    ctx.strokeStyle = C.pen;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(90, sepY);
    ctx.lineTo(w / 2 - 8, sepY);
    ctx.moveTo(w / 2 + 8, sepY);
    ctx.lineTo(w - 90, sepY);
    ctx.stroke();

    ctx.fillStyle = C.red;
    ctx.save();
    ctx.translate(w / 2, sepY);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3.5, -3.5, 7, 7);
    ctx.restore();

    // ─── Values list ───────────────────────────────────────────────────
    const listTop = 218;
    const spacing = 76;

    values.forEach((value, i) => {
      const y = listTop + i * spacing;

      // Number — small, monospace, pencil gray
      ctx.fillStyle = C.pencil;
      ctx.font = "400 8px 'Courier New', 'SF Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1).padStart(2, "0"), w / 2, y);

      // Value name — strong, tracked
      ctx.fillStyle = C.pen;
      ctx.font = "600 18px 'Inter', 'Helvetica Neue', system-ui, sans-serif";
      // Add letter spacing by manually spacing
      const text = value.toUpperCase();
      const measured = ctx.measureText(text).width;
      if (measured < w - 200) {
        // Draw with letter spacing
        const chars = text.split("");
        const letterSpacing = 2.5;
        const totalWidth = measured + (chars.length - 1) * letterSpacing;
        let cx = w / 2 - totalWidth / 2;
        ctx.textAlign = "left";
        for (const char of chars) {
          ctx.fillText(char, cx, y + 22);
          cx += ctx.measureText(char).width + letterSpacing;
        }
        ctx.textAlign = "center";
      } else {
        ctx.fillText(text, w / 2, y + 22);
      }

      // Subtle separator between values
      if (i < values.length - 1) {
        ctx.strokeStyle = C.pencilFaint;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 60, y + 52);
        ctx.lineTo(w / 2 + 60, y + 52);
        ctx.stroke();
      }
    });

    // ─── Layer 3: Hatching — subtle top/bottom bands inside frame ──────
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = C.hatch;
    ctx.lineWidth = 0.5;
    // Top band (inside frame, thin strip)
    for (let x = 50; x < w - 50; x += 5) {
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x + 6, 56);
      ctx.stroke();
    }
    // Bottom band
    for (let x = 50; x < w - 50; x += 5) {
      ctx.beginPath();
      ctx.moveTo(x, h - 56);
      ctx.lineTo(x + 6, h - 50);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ─── Footer ────────────────────────────────────────────────────────
    // Bottom separator
    ctx.strokeStyle = C.pen;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(90, h - 100);
    ctx.lineTo(w - 90, h - 100);
    ctx.stroke();

    ctx.fillStyle = C.hatch;
    ctx.font = "500 7.5px 'Courier New', 'SF Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("W O R D S I N C A R N A T E . C O M", w / 2, h - 76);

    const date = new Date()
      .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      .toUpperCase();
    ctx.fillStyle = C.pencil;
    ctx.font = "400 6.5px 'Courier New', 'SF Mono', monospace";
    ctx.fillText(date, w / 2, h - 62);

    return canvas;
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateImage();
      const link = document.createElement("a");
      link.download = "my-core-values-words-incarnate.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      trackResultsShared("download");
      toast.success("Your values card has been downloaded!");
    } catch {
      toast.error("Failed to generate image. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateImage();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.share) {
          const file = new File([blob], "my-core-values.png", { type: "image/png" });
          await navigator.share({
            title: "My Core Values — Words Incarnate",
            text: `My 6 core values: ${values.join(", ")}`,
            files: [file],
          });
        } else {
          await navigator.clipboard.writeText(
            `My 6 core values: ${values.join(", ")} — Discover yours at wordsincarnate.com`
          );
          toast.success("Copied to clipboard!");
        }
      }, "image/png");
    } catch {
      toast.error("Sharing failed. Try downloading instead.");
    }
    setIsGenerating(false);
  };

  if (values.length < 6) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <p className="label-technical">Share your values</p>

      {/* ─── Preview card ─── */}
      <div
        ref={cardRef}
        className="relative bg-[#FAFAF8] rounded-md overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
        }}
      >
        {/* Outer padding with corner marks */}
        <div className="relative p-3">
          {/* Corner registration marks */}
          <div className="absolute top-2 left-2 w-3 h-3">
            <div className="absolute top-0 left-0 w-full h-px bg-[#D4D0C8]" />
            <div className="absolute top-0 left-0 w-px h-full bg-[#D4D0C8]" />
          </div>
          <div className="absolute top-2 right-2 w-3 h-3">
            <div className="absolute top-0 right-0 w-full h-px bg-[#D4D0C8]" />
            <div className="absolute top-0 right-0 w-px h-full bg-[#D4D0C8]" />
          </div>
          <div className="absolute bottom-2 left-2 w-3 h-3">
            <div className="absolute bottom-0 left-0 w-full h-px bg-[#D4D0C8]" />
            <div className="absolute bottom-0 left-0 w-px h-full bg-[#D4D0C8]" />
          </div>
          <div className="absolute bottom-2 right-2 w-3 h-3">
            <div className="absolute bottom-0 right-0 w-full h-px bg-[#D4D0C8]" />
            <div className="absolute bottom-0 right-0 w-px h-full bg-[#D4D0C8]" />
          </div>

          {/* Inner frame */}
          <div className="border border-[#1C1C1C]/60 px-5 py-6">
            {/* Subtle hatch band at top */}
            <div
              className="absolute top-3 left-3 right-3 h-[5px] opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #B0ACA4 0px, #B0ACA4 0.5px, transparent 0.5px, transparent 4px)",
              }}
            />

            {/* Flame icon — matches nav */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                {/* Construction circle behind flame */}
                <div className="absolute inset-0 -m-2 rounded-full border border-[#E8E5DF]" />
                <Flame className="h-5 w-5 text-[#9B1B3A]" strokeWidth={1.8} />
              </div>
            </div>

            {/* Brand */}
            <p
              className="text-center font-semibold uppercase text-[#1C1C1C]"
              style={{ fontSize: "10px", letterSpacing: "0.28em" }}
            >
              Words Incarnate
            </p>
            <p
              className="text-center font-semibold uppercase text-[#9B1B3A] mt-0.5"
              style={{ fontSize: "7px", letterSpacing: "0.22em" }}
            >
              My Core Values
            </p>

            {/* Separator with diamond */}
            <div className="flex items-center gap-1.5 my-3 px-2">
              <div className="flex-1 h-px bg-[#1C1C1C]/50" />
              <div className="h-[5px] w-[5px] rotate-45 bg-[#9B1B3A]" />
              <div className="flex-1 h-px bg-[#1C1C1C]/50" />
            </div>

            {/* Values */}
            <div className="space-y-2 py-1">
              {values.map((value, i) => (
                <div key={`${value}-${i}`} className="text-center">
                  <p
                    className="font-mono text-[#D4D0C8]"
                    style={{ fontSize: "6px", letterSpacing: "0.15em" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p
                    className="font-semibold uppercase text-[#1C1C1C] -mt-px"
                    style={{ fontSize: "12px", letterSpacing: "0.16em" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom separator */}
            <div className="h-px bg-[#1C1C1C]/30 mt-3 mb-2 mx-2" />

            {/* Footer */}
            <p
              className="text-center font-mono uppercase text-[#B0ACA4]"
              style={{ fontSize: "6px", letterSpacing: "0.2em" }}
            >
              wordsincarnate.com
            </p>

            {/* Subtle hatch band at bottom */}
            <div
              className="absolute bottom-3 left-3 right-3 h-[5px] opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #B0ACA4 0px, #B0ACA4 0.5px, transparent 0.5px, transparent 4px)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex-1 gap-2"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
        <Button
          size="sm"
          onClick={handleShare}
          disabled={isGenerating}
          className="flex-1 gap-2"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
      </div>
    </motion.div>
  );
};

export default ShareableValuesCard;
