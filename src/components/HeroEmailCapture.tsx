import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { toast } from "@/hooks/use-toast";

const HeroEmailCapture = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (honeypot) return;

    setLoading(true);
    const { error } = await supabase.from("email_captures").insert({
      email: email.trim(),
      source: "hero",
    });
    setLoading(false);

    if (error) {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
    sendNotification("newsletter", { email: email.trim() });
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-primary">
        <CheckCircle2 className="h-4 w-4" />
        <span>You're in — check your inbox.</span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          name="company"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
          aria-hidden="true"
        />
        <Input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 bg-background/80 text-sm backdrop-blur-sm"
        />
        <Button type="submit" size="sm" disabled={loading} className="h-10 px-5 whitespace-nowrap">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Free Resources"}
        </Button>
      </form>
      <p className="mt-2 text-[11px] text-muted-foreground/70">
        Formation insights, workshop invitations, and free tools. No spam.
      </p>
    </div>
  );
};

export default HeroEmailCapture;
