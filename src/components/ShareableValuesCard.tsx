import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackResultsShared } from "@/lib/analytics";

interface ShareableValuesCardProps {
  values: string[];
}

// ─── Style Constitution Colors ────────────────────────────────────────────────
const WHITE = "#FFFFFF";
const PENCIL = "#C8C4BE";       // Layer 1: construction lines
const PEN = "#1A1A1A";          // Layer 2: commitment lines
const HATCH = "#9E9A93";        // Layer 3: cross-hatching
const RED = "#9B1B3A";          // Layer 4: accent (deep cherry/maroon)
const LIGHT_PENCIL = "#DBD8D2"; // Faint construction geometry

const ShareableValuesCard: React.FC<ShareableValuesCardProps> = ({ values }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    const w = 600;
    const h = 840;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // ─── Layer 0: White paper ──────────────────────────────────────────
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, w, h);

    // ─── Layer 1: Construction geometry (pencil) ───────────────────────
    ctx.strokeStyle = LIGHT_PENCIL;
    ctx.lineWidth = 0.5;

    // Vertical center line (extends past edges)
    ctx.beginPath();
    ctx.moveTo(w / 2, -20);
    ctx.lineTo(w / 2, h + 20);
    ctx.stroke();

    // Horizontal construction lines (extending past frame)
    const constructionYs = [80, 130, 175, 210];
    for (const y of constructionYs) {
      ctx.beginPath();
      ctx.moveTo(-10, y);
      ctx.lineTo(w + 10, y);
      ctx.stroke();
    }

    // Circle construction arc behind title area
    ctx.strokeStyle = PENCIL;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.arc(w / 2, 105, 55, 0, Math.PI * 2);
    ctx.stroke();

    // Larger outer construction circle
    ctx.strokeStyle = LIGHT_PENCIL;
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.arc(w / 2, 105, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Corner construction marks (architectural registration)
    const markLen = 18;
    const inset = 35;
    ctx.strokeStyle = PENCIL;
    ctx.lineWidth = 0.5;
    const corners: [number, number, number, number][] = [
      [inset, inset, 1, 1],
      [w - inset, inset, -1, 1],
      [inset, h - inset, 1, -1],
      [w - inset, h - inset, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + markLen * dx, cy);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy + markLen * dy);
      ctx.stroke();
    }

    // ─── Layer 2: Commitment lines (pen) ───────────────────────────────
    // Main frame border
    ctx.strokeStyle = PEN;
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Inner frame (thinner)
    ctx.strokeStyle = PEN;
    ctx.lineWidth = 0.4;
    ctx.strokeRect(46, 46, w - 92, h - 92);

    // Horizontal rule below header
    ctx.strokeStyle = PEN;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(80, 210);
    ctx.lineTo(w - 80, 210);
    ctx.stroke();

    // Diamond at center of rule
    ctx.fillStyle = RED;
    ctx.save();
    ctx.translate(w / 2, 210);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();

    // Horizontal rule above footer
    ctx.strokeStyle = PEN;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(80, h - 105);
    ctx.lineTo(w - 80, h - 105);
    ctx.stroke();

    // ─── Layer 3: Cross-hatching accents ───────────────────────────────
    // Top band
    ctx.strokeStyle = HATCH;
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = 0.18;
    for (let x = 42; x < w - 42; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 42);
      ctx.lineTo(x + 12, 58);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 12, 42);
      ctx.lineTo(x, 58);
      ctx.stroke();
    }
    // Bottom band
    ctx.globalAlpha = 0.12;
    for (let x = 42; x < w - 42; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, h - 58);
      ctx.lineTo(x + 12, h - 42);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 12, h - 58);
      ctx.lineTo(x, h - 42);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ─── Layer 4: Red accents + text ───────────────────────────────────
    // Red circle marker behind flame
    ctx.fillStyle = RED;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(w / 2, 105, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Geometric flame
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.moveTo(w / 2, 82);
    ctx.bezierCurveTo(w / 2 - 7, 93, w / 2 - 14, 108, w / 2 - 9, 120);
    ctx.bezierCurveTo(w / 2 - 5, 126, w / 2, 123, w / 2, 119);
    ctx.bezierCurveTo(w / 2, 123, w / 2 + 5, 126, w / 2 + 9, 120);
    ctx.bezierCurveTo(w / 2 + 14, 108, w / 2 + 7, 93, w / 2, 82);
    ctx.fill();

    // Brand name
    ctx.fillStyle = PEN;
    ctx.font = "800 13px 'Inter', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("W O R D S   I N C A R N A T E", w / 2, 158);

    // Subtitle
    ctx.fillStyle = RED;
    ctx.font = "700 9px 'Inter', system-ui, sans-serif";
    ctx.fillText("M Y   C O R E   V A L U E S", w / 2, 180);

    // ─── Values list ───────────────────────────────────────────────────
    const startY = 258;
    const spacing = 70;
    values.forEach((value, i) => {
      const y = startY + i * spacing;

      // Number (pencil)
      ctx.fillStyle = PENCIL;
      ctx.font = "500 9px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1).padStart(2, "0"), w / 2, y - 4);

      // Value text (pen)
      ctx.fillStyle = PEN;
      ctx.font = "600 17px 'Inter', system-ui, sans-serif";
      const spaced = value.toUpperCase().split("").join(" ");
      // Measure and fall back to unspaced if too wide
      const textWidth = ctx.measureText(spaced).width;
      ctx.fillText(textWidth < w - 160 ? spaced : value.toUpperCase(), w / 2, y + 18);

      // Pencil separator
      if (i < values.length - 1) {
        ctx.strokeStyle = LIGHT_PENCIL;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 80, y + 44);
        ctx.lineTo(w / 2 + 80, y + 44);
        ctx.stroke();
      }
    });

    // Small red accent dots flanking values
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(w / 2 - 140, startY + 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w / 2 + 140, startY + (values.length - 1) * spacing + 10, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // ─── Footer ────────────────────────────────────────────────────────
    ctx.fillStyle = HATCH;
    ctx.font = "500 8px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("W O R D S I N C A R N A T E . C O M", w / 2, h - 74);

    const date = new Date()
      .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      .toUpperCase();
    ctx.fillStyle = PENCIL;
    ctx.font = "400 7px 'Courier New', monospace";
    ctx.fillText(date, w / 2, h - 60);

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

      {/* Preview card — Style Constitution aesthetic */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-lg border border-[#C8C4BE] bg-white p-1.5"
      >
        {/* Inner frame */}
        <div className="relative border border-[#1A1A1A]/70 px-6 py-5 text-center">
          {/* Cross-hatch band top */}
          <div
            className="absolute top-0 left-0 right-0 h-3 opacity-[0.08]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, #9E9A93 2px, #9E9A93 2.5px), repeating-linear-gradient(-45deg, transparent, transparent 2px, #9E9A93 2px, #9E9A93 2.5px)",
            }}
          />

          {/* Construction circle + flame */}
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-[#C8C4BE]/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9B1B3A]/10">
              <svg width="14" height="18" viewBox="0 0 16 20" fill="#9B1B3A">
                <path d="M8 0C6 4 2 8 4 14C5 17 7 16 8 14C9 16 11 17 12 14C14 8 10 4 8 0Z" />
              </svg>
            </div>
          </div>

          {/* Brand */}
          <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#1A1A1A]">
            WORDS INCARNATE
          </p>
          <p className="mt-0.5 text-[8px] font-bold tracking-[0.18em] uppercase text-[#9B1B3A]">
            MY CORE VALUES
          </p>

          {/* Rule with diamond */}
          <div className="relative mt-3 mb-4 flex items-center justify-center">
            <div className="h-px flex-1 bg-[#1A1A1A]/60" />
            <div className="mx-2 h-2 w-2 rotate-45 bg-[#9B1B3A]" />
            <div className="h-px flex-1 bg-[#1A1A1A]/60" />
          </div>

          {/* Values */}
          <div className="space-y-2.5">
            {values.map((value, i) => (
              <div key={`${value}-${i}`} className="text-center">
                <p className="text-[7px] font-mono text-[#C8C4BE] tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-[#1A1A1A] mt-px">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom rule */}
          <div className="mt-4 h-px bg-[#1A1A1A]/30" />

          {/* Footer */}
          <p className="mt-2 text-[7px] font-mono tracking-[0.15em] text-[#9E9A93] uppercase">
            wordsincarnate.com
          </p>

          {/* Cross-hatch band bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-3 opacity-[0.05]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, #9E9A93 2px, #9E9A93 2.5px), repeating-linear-gradient(-45deg, transparent, transparent 2px, #9E9A93 2px, #9E9A93 2.5px)",
            }}
          />
        </div>

        {/* Construction corner marks */}
        <div className="absolute top-1 left-1 h-3 w-3 border-l border-t border-[#C8C4BE]" />
        <div className="absolute top-1 right-1 h-3 w-3 border-r border-t border-[#C8C4BE]" />
        <div className="absolute bottom-1 left-1 h-3 w-3 border-l border-b border-[#C8C4BE]" />
        <div className="absolute bottom-1 right-1 h-3 w-3 border-r border-b border-[#C8C4BE]" />
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
