import { useState } from "react";
import { Loader2, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { trackEmailCaptured, trackLeadMagnetDownloaded } from "@/lib/analytics";
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
    // Use upsert to handle duplicate emails gracefully
    await supabase.from("email_captures").upsert(
      { email: email.trim(), source: "hero" },
      { onConflict: "email" }
    );
    setLoading(false);
    setSubmitted(true);
    trackEmailCaptured("hero");
    sendNotification("newsletter", { email: email.trim() });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 text-sm">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <span>You're in — here's your free guide:</span>
        </div>
        <a
          href="/seven-conversations-that-matter.pdf"
          download
          onClick={() => trackLeadMagnetDownloaded()}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Seven Conversations That Matter (PDF)
        </a>
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Free Dinner Guide"}
        </Button>
      </form>
      <p className="mt-2 text-[11px] text-muted-foreground/70">
        Seven nights of guided family conversation — plus formation insights and workshop invitations.
      </p>
    </div>
  );
};

export default HeroEmailCapture;
