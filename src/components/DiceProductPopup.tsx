import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";
import diceProductImage from "@/assets/dice-product.webp";

interface DiceProductPopupProps {
  coreValues: string[];
}

const DiceProductPopup: React.FC<DiceProductPopupProps> = ({ coreValues }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || coreValues.length < 6) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-4 left-4 z-50 w-72 rounded-lg border border-border bg-card shadow-2xl overflow-hidden"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="relative h-28 bg-muted/30 flex items-center justify-center overflow-hidden">
        <img src={diceProductImage} alt="Conversation Dice" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
      </div>

      <div className="p-3 space-y-2">
        <p className="text-xs font-semibold text-foreground leading-tight">
          A Custom Game — To Share Your Values
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Your 6 core values, engraved on real dice.
        </p>
        <div className="flex flex-wrap gap-0.5">
          {coreValues.map((v) => (
            <span key={v} className="text-[8px] font-medium bg-primary/10 text-primary rounded px-1 py-px">{v}</span>
          ))}
        </div>
        <Button size="sm" className="w-full gap-1.5 text-xs" onClick={() => window.open(`https://${SHOPIFY_STORE_PERMANENT_DOMAIN}`, "_blank")}>
          <ShoppingCart className="h-3 w-3" /> Shop Now <ExternalLink className="h-2.5 w-2.5 ml-auto opacity-50" />
        </Button>
      </div>
    </motion.div>
  );
};

export default DiceProductPopup;
