import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackResultsShared } from "@/lib/analytics";
import html2canvas from "html2canvas";

interface ShareableValuesCardProps {
  values: string[];
}

const ShareableValuesCard: React.FC<ShareableValuesCardProps> = ({ values }) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const capture = async (): Promise<HTMLCanvasElement | null> => {
    if (!posterRef.current) return null;
    return html2canvas(posterRef.current, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
      logging: false,
    });
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const canvas = await capture();
      if (!canvas) throw new Error("Capture failed");
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
      const canvas = await capture();
      if (!canvas) throw new Error("Capture failed");
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

      {/* ═══ THE POSTER — this exact element is captured as the PNG ═══ */}
      <div
        ref={posterRef}
        style={{
          width: 480,
          padding: 28,
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          background: "#FAFAF8",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ── Layer 1: Construction geometry (pencil) ── */}
        {/* Vertical center axis */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            background: "linear-gradient(to bottom, transparent 8px, #E2DFD8 28px, #E2DFD8 calc(100% - 28px), transparent calc(100% - 8px))",
            opacity: 0.5,
          }}
        />
        {/* Horizontal construction lines */}
        {[92, 148].map((y) => (
          <div
            key={y}
            style={{
              position: "absolute",
              top: y,
              left: 20,
              right: 20,
              height: 1,
              background: "#E2DFD8",
              opacity: 0.45,
            }}
          />
        ))}

        {/* Corner registration marks */}
        {([
          { top: 12, left: 12 },
          { top: 12, right: 12 },
          { bottom: 12, left: 12 },
          { bottom: 12, right: 12 },
        ] as React.CSSProperties[]).map((pos, i) => (
          <div key={i} style={{ position: "absolute", ...pos, width: 14, height: 14 }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: pos.right !== undefined ? undefined : 0,
                right: pos.right !== undefined ? 0 : undefined,
                width: "100%",
                height: 1,
                background: "#CBC7BF",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: pos.right !== undefined ? undefined : 0,
                right: pos.right !== undefined ? 0 : undefined,
                width: 1,
                height: "100%",
                background: "#CBC7BF",
              }}
            />
          </div>
        ))}

        {/* ── Layer 2 + 4: The committed design ── */}
        <div
          style={{
            border: "1px solid rgba(28,28,28,0.55)",
            padding: "32px 28px 24px",
            position: "relative",
          }}
        >
          {/* Layer 3: Hatch band — top edge inside frame */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              opacity: 0.035,
              backgroundImage:
                "repeating-linear-gradient(45deg, #908C84 0px, #908C84 0.6px, transparent 0.6px, transparent 4px)",
            }}
          />

          {/* Flame icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ position: "relative" }}>
              {/* Construction circle */}
              <div
                style={{
                  position: "absolute",
                  inset: -10,
                  borderRadius: "50%",
                  border: "0.6px solid #DDD9D2",
                }}
              />
              <Flame
                size={22}
                color="#9B1B3A"
                strokeWidth={1.8}
                style={{ display: "block" }}
              />
            </div>
          </div>

          {/* Brand name */}
          <div
            style={{
              textAlign: "center",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase" as const,
              color: "#1C1C1C",
              lineHeight: 1,
            }}
          >
            Words Incarnate
          </div>

          {/* Subtitle */}
          <div
            style={{
              textAlign: "center",
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase" as const,
              color: "#9B1B3A",
              marginTop: 5,
              lineHeight: 1,
            }}
          >
            My Core Values
          </div>

          {/* Separator with diamond */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              margin: "18px 12px 20px",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "rgba(28,28,28,0.45)" }} />
            <div
              style={{
                width: 7,
                height: 7,
                background: "#9B1B3A",
                transform: "rotate(45deg)",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, height: 1, background: "rgba(28,28,28,0.45)" }} />
          </div>

          {/* ── Values list ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {values.map((value, i) => (
              <div key={`${value}-${i}`} style={{ textAlign: "center" }}>
                {/* Number */}
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
                    fontSize: 7.5,
                    fontWeight: 400,
                    letterSpacing: "0.2em",
                    color: "#CBC7BF",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                {/* Value name */}
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase" as const,
                    color: "#1C1C1C",
                    lineHeight: 1.1,
                  }}
                >
                  {value}
                </div>
                {/* Pencil separator between values */}
                {i < values.length - 1 && (
                  <div
                    style={{
                      width: 100,
                      height: 1,
                      background: "#E8E5DF",
                      margin: "14px auto 0",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Bottom separator */}
          <div
            style={{
              height: 1,
              background: "rgba(28,28,28,0.25)",
              margin: "24px 12px 14px",
            }}
          />

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
              fontSize: 7,
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase" as const,
              color: "#B0ACA4",
              lineHeight: 1,
            }}
          >
            wordsincarnate.com
          </div>
          <div
            style={{
              textAlign: "center",
              fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
              fontSize: 6,
              fontWeight: 400,
              letterSpacing: "0.15em",
              color: "#D4D0C8",
              marginTop: 5,
              lineHeight: 1,
            }}
          >
            {new Date()
              .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              .toUpperCase()}
          </div>

          {/* Layer 3: Hatch band — bottom edge */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 5,
              opacity: 0.025,
              backgroundImage:
                "repeating-linear-gradient(45deg, #908C84 0px, #908C84 0.6px, transparent 0.6px, transparent 4px)",
            }}
          />
        </div>

        {/* Red accent dots — flanking first and last values */}
        <div
          style={{
            position: "absolute",
            left: 38,
            top: 232,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#9B1B3A",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 38,
            bottom: 106,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#9B1B3A",
          }}
        />
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
          {isGenerating ? "Generating..." : "Download"}
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
