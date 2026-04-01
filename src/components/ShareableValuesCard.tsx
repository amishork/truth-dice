import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, Heart, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackResultsShared } from "@/lib/analytics";

interface ShareableValuesCardProps {
  values: string[];
}

const ShareableValuesCard: React.FC<ShareableValuesCardProps> = ({ values }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    const w = 600;
    const h = 800;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // Background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#1a0a0e");
    grad.addColorStop(0.5, "#2d0f18");
    grad.addColorStop(1, "#1a0a0e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle pattern overlay
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < w; i += 24) {
      for (let j = 0; j < h; j += 24) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(i, j, 0.5, 0.5);
      }
    }
    ctx.globalAlpha = 1;

    // Border
    ctx.strokeStyle = "rgba(200, 60, 80, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Flame icon area
    ctx.fillStyle = "rgba(200, 60, 80, 0.15)";
    ctx.beginPath();
    ctx.arc(w / 2, 100, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c83c50";
    ctx.font = "24px serif";
    ctx.textAlign = "center";
    ctx.fillText("🔥", w / 2, 108);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 11px 'Inter', system-ui, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.textAlign = "center";
    ctx.fillText("WORDS INCARNATE", w / 2, 160);

    ctx.fillStyle = "#c83c50";
    ctx.font = "800 9px 'Inter', system-ui, sans-serif";
    ctx.fillText("MY CORE VALUES", w / 2, 180);

    // Divider
    ctx.strokeStyle = "rgba(200, 60, 80, 0.4)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 80, 200);
    ctx.lineTo(w / 2 + 80, 200);
    ctx.stroke();

    // Diamond
    ctx.fillStyle = "rgba(200, 60, 80, 0.6)";
    ctx.save();
    ctx.translate(w / 2, 200);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();

    // Values
    const startY = 250;
    const spacing = 72;
    values.forEach((value, i) => {
      const y = startY + i * spacing;

      // Number
      ctx.fillStyle = "rgba(200, 60, 80, 0.4)";
      ctx.font = "600 9px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(i + 1).padStart(2, "0"), w / 2, y);

      // Value text
      ctx.fillStyle = "#ffffff";
      ctx.font = "500 18px 'Inter', system-ui, sans-serif";
      ctx.fillText(value, w / 2, y + 24);

      // Subtle line under
      if (i < values.length - 1) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 100, y + 48);
        ctx.lineTo(w / 2 + 100, y + 48);
        ctx.stroke();
      }
    });

    // Footer
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "9px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("wordsincarnate.com", w / 2, h - 50);

    const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.font = "8px 'Courier New', monospace";
    ctx.fillText(date, w / 2, h - 35);

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
          // Fallback: copy text
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

      {/* Preview card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-b from-[hsl(350,50%,8%)] to-[hsl(350,40%,6%)] p-6 text-center"
      >
        <div className="mb-4 flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
            <Flame className="h-5 w-5 text-primary" />
          </div>
        </div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/90">
          Words Incarnate
        </p>
        <p className="mt-1 text-[9px] font-bold tracking-[0.15em] uppercase text-primary">
          My Core Values
        </p>

        <div className="mt-5 space-y-3">
          {values.map((value, i) => (
            <div key={`${value}-${i}`} className="flex items-center justify-center gap-2">
              <Heart className="h-3 w-3 text-primary/50" />
              <span className="text-sm text-white/90">{value}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[8px] text-white/30 tracking-wide">wordsincarnate.com</p>
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
