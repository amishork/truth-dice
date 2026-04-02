import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Link2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackResultsShared } from "@/lib/analytics";
import { encodeValues } from "@/pages/ValuesReveal";

interface ShareValuesProps {
  values: string[];
}

const ShareValues: React.FC<ShareValuesProps> = ({ values }) => {
  const [copied, setCopied] = useState(false);

  if (values.length < 6) return null;

  const shareUrl = `${window.location.origin}/v?d=${encodeValues(values)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackResultsShared("link");
      toast.success("Link copied — share your values!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Couldn't copy link. Try again.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Core Values — Words Incarnate",
          text: `My 6 core values: ${values.join(", ")}`,
          url: shareUrl,
        });
        trackResultsShared("native");
      } catch {
        // User cancelled share — not an error
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-3"
    >
      <p className="label-technical">Share your values</p>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleNativeShare}
          className="flex-1 gap-2"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex-1 gap-2"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
      </div>

      <a
        href={shareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        <ExternalLink className="h-3 w-3" />
        Preview your shareable page
      </a>
    </motion.div>
  );
};

export default ShareValues;
