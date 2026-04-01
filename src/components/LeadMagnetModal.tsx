import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
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
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (honeypot) return; // Bot detected

    setLoading(true);
    await supabase.from("email_captures").upsert(
      { email: email.trim(), name: name.trim() || null, source: "lead_magnet" },
      { onConflict: "email" }
    );
    setLoading(false);
    setSubmitted(true);
    sendNotification("lead_magnet", { email: email.trim(), name: name.trim() || null });
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
                  Seven Conversations That Matter
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  A free printable dinner guide with seven nights of guided family conversation — designed to help you discover and live the values that matter most.
                </p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
                  <input type="text" name="organization" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }} aria-hidden="true" />
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
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send me the free guide"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
                </form>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Your guide is ready!</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Download your free copy of <em>Seven Conversations That Matter</em> and start tonight.
                </p>
                <a
                  href="/seven-conversations-that-matter.pdf"
                  download
                  className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
                <div className="mt-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeadMagnetModal;
