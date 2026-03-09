import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { storefrontApiRequest, STOREFRONT_QUERY, ShopifyProduct } from "@/lib/shopify";
import diceProductImg from "@/assets/dice-product.jpg";

interface DiceProductPopupProps {
  values: string[];
  visible: boolean;
}

export default function DiceProductPopup({ values, visible }: DiceProductPopupProps) {
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const [added, setAdded] = useState(false);

  // Delay appearance by 2s after becoming visible
  useEffect(() => {
    if (!visible || dismissed) return;
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, [visible, dismissed]);

  // Fetch product from Shopify
  useEffect(() => {
    if (!show) return;
    storefrontApiRequest(STOREFRONT_QUERY, { first: 1, query: "title:Values Dice" })
      .then((data) => {
        const edge = data?.data?.products?.edges?.[0];
        if (edge) setProduct({ node: edge.node });
      })
      .catch(console.error);
  }, [show]);

  const handleAddToCart = async () => {
    if (!product) return;
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    setAdded(true);
  };

  const displayValues = values.slice(0, 3);
  const price = product?.node.variants.edges[0]?.node.price;

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed bottom-4 left-4 z-40 w-[280px] rounded-xl border border-border bg-card shadow-xl overflow-hidden"
        >
          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 z-10 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Product image */}
          <div className="relative h-36 overflow-hidden">
            <img
              src={product?.node.images?.edges?.[0]?.node.url || diceProductImg}
              alt="Values Dice Conversation Game"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                Custom Engraved Values Dice
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">
                Your values, carved in wood. Spark real conversations at the table.
              </p>
            </div>

            {/* Value tags */}
            {displayValues.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {displayValues.map((v) => (
                  <span
                    key={v}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                  >
                    {v}
                  </span>
                ))}
                {values.length > 3 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    +{values.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Price + CTA */}
            <div className="flex items-center justify-between gap-2">
              {price && (
                <span className="text-sm font-bold text-foreground">
                  ${parseFloat(price.amount).toFixed(2)}
                </span>
              )}
              <Button
                size="sm"
                className="text-xs h-8"
                onClick={handleAddToCart}
                disabled={isLoading || !product || added}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : added ? (
                  "Added ✓"
                ) : (
                  <>
                    <ShoppingCart className="h-3 w-3" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
