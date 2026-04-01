import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { trackEmailCaptured, trackResultsShared } from "@/lib/analytics";

interface EmailMyResultsProps {
  values: string[];
  areaLabel?: string;
}

const EmailMyResults: React.FC<EmailMyResultsProps> = ({ values, areaLabel }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (values.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await supabase.from("email_captures").upsert(
      { email: email.trim(), source: "results_email" },
      { onConflict: "email" }
    );
    setLoading(false);
    setSent(true);
    trackEmailCaptured("results_email");
    trackResultsShared("email");
    sendNotification("newsletter", {
      email: email.trim(),
      values: values,
      area: areaLabel || "Personal",
    });
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-foreground">
          Your values have been sent to <span className="font-medium">{email}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="label-technical">Email my results</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 text-sm"
        />
        <Button type="submit" size="sm" disabled={loading} className="h-9 shrink-0 gap-1.5">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Mail className="h-3.5 w-3.5" />
              Send
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default EmailMyResults;
