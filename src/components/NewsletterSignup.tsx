import { useState } from "react";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { toast } from "sonner";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (honeypot) return; // Bot detected

    setLoading(true);
    const { error } = await supabase.from("email_captures").upsert(
      { email: email.trim(), source: "newsletter" },
      { onConflict: "email" }
    );
    setLoading(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    setEmail("");
    sendNotification("newsletter", { email: email.trim() });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle2 className="h-4 w-4" />
        <span>You're subscribed!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="text" name="company" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }} aria-hidden="true" />
      <Input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-9 bg-background text-sm max-w-[200px]"
      />
      <Button type="submit" size="sm" disabled={loading} className="h-9 px-3">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
      </Button>
    </form>
  );
};

export default NewsletterSignup;
