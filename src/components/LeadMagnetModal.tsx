import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LeadMagnetModalProps {
  open: boolean;
  onClose: () => void;
}

const LeadMagnetModal = ({ open, onClose }: LeadMagnetModalProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("email_captures").insert({
      email: email.trim(),
      name: name.trim() || null,
      source: "lead_magnet",
    });
    setLoading(false);

    if (error) {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setEmail("");
      setName("");
      setSubmitted(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {!submitted ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Free Values Discovery Worksheet
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  A printable guide to help you and your family identify, discuss, and live your core values together.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
                  <div>
                    <Input
                      placeholder="Your first name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      required
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full wi-cta" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send me the worksheet"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
                </form>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Check your inbox!</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  We've sent the Values Discovery Worksheet to your email. Start exploring your values today.
                </p>
                <Button variant="outline" className="mt-6" onClick={handleClose}>
                  Close
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeadMagnetModal;
