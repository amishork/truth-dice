import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import {
  Star,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  User,
  Sparkles,
  Send,
  Quote,
} from "lucide-react";

type Audience = "family" | "school" | "organization" | "individual";

interface FormData {
  name: string;
  role: string;
  email: string;
  audience: Audience;
  rating: number;
  challenge: string;
  experience: string;
  impact: string;
  testimonialDraft: string;
  consentDisplay: boolean;
}

const AUDIENCE_OPTIONS: { value: Audience; label: string; description: string }[] = [
  { value: "family", label: "Family", description: "We participated as a family" },
  { value: "school", label: "School", description: "Our school or classroom" },
  { value: "organization", label: "Organization", description: "Our parish, business, or group" },
  { value: "individual", label: "Individual", description: "I participated on my own" },
];

const STEPS = [
  { label: "About You", icon: User },
  { label: "Your Story", icon: Quote },
  { label: "Your Words", icon: Sparkles },
  { label: "Submit", icon: Send },
];

function synthesizeDraft(data: FormData): string {
  const parts: string[] = [];

  if (data.challenge.trim()) {
    parts.push(data.challenge.trim());
  }
  if (data.experience.trim()) {
    parts.push(data.experience.trim());
  }
  if (data.impact.trim()) {
    parts.push(data.impact.trim());
  }

  if (parts.length === 0) return "";

  // Join all three answers into a flowing testimonial.
  // We clean up by ensuring each part ends with punctuation.
  const cleaned = parts.map((p) => {
    const trimmed = p.replace(/\s+/g, " ").trim();
    if (/[.!?]$/.test(trimmed)) return trimmed;
    return trimmed + ".";
  });

  return cleaned.join(" ");
}

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              star <= (hover || value)
                ? "fill-primary text-primary"
                : "fill-none text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProgressBar = ({ step }: { step: number }) => (
  <div className="mx-auto mt-8 flex max-w-md items-center justify-between">
    {STEPS.map((s, i) => {
      const Icon = s.icon;
      const isActive = i === step;
      const isComplete = i < step;
      return (
        <div key={s.label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                isComplete
                  ? "border-primary bg-primary text-primary-foreground"
                  : isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <span
              className={`text-[11px] font-medium whitespace-nowrap ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-2 mt-[-18px] h-0.5 flex-1 transition-colors duration-300 ${
                isComplete ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

const ShareExperience = () => {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({
    name: "",
    role: "",
    email: "",
    audience: "family",
    rating: 5,
    challenge: "",
    experience: "",
    impact: "",
    testimonialDraft: "",
    consentDisplay: false,
  });

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canAdvance = (): boolean => {
    if (step === 0) return form.name.trim().length >= 2 && form.role.trim().length >= 2;
    if (step === 1)
      return (
        form.challenge.trim().length >= 10 ||
        form.experience.trim().length >= 10 ||
        form.impact.trim().length >= 10
      );
    if (step === 2) return form.testimonialDraft.trim().length >= 20 && form.consentDisplay;
    return true;
  };

  const goNext = () => {
    if (step === 1) {
      // Moving from story to review — synthesize draft
      const draft = synthesizeDraft(form);
      update("testimonialDraft", draft);
    }
    setStep((s) => Math.min(s + 1, 3));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const { error: dbError } = await supabase.from("testimonials" as any).insert({
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim() || null,
        audience: form.audience,
        rating: form.rating,
        challenge: form.challenge.trim() || null,
        experience: form.experience.trim() || null,
        impact: form.impact.trim() || null,
        testimonial_draft: form.testimonialDraft.trim(),
        status: "pending",
      } as any);

      if (dbError) throw dbError;

      // Fire notification to Alex
      try {
        await sendNotification("testimonial" as any, {
          name: form.name,
          role: form.role,
          audience: form.audience,
          rating: form.rating,
          testimonial: form.testimonialDraft,
          email: form.email || "not provided",
        });
      } catch {
        // Non-blocking
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <PageMeta
          title="Thank You | Words Incarnate"
          description="Thank you for sharing your experience with Words Incarnate."
          path="/testimonials/share"
        />
        <Navigation />
        <main className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 pt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-lg text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground">
              Thank you, {form.name.split(" ")[0]}.
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Your testimonial has been submitted for review. Once approved, it will
              appear on our Wall of Love. We're grateful you took the time to share
              your experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <a href="/testimonials">View Wall of Love</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Back to Home</a>
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Share Your Experience | Words Incarnate"
        description="Tell us about your experience with Words Incarnate. Your story helps other families, schools, and organizations find what they're looking for."
        path="/testimonials/share"
      />
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-20" ref={formRef}>
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Share Your Experience
            </h1>
            <p className="mt-3 text-muted-foreground">
              A few guided questions to help you tell your story — takes about two minutes.
            </p>
          </motion.div>

          <ProgressBar step={step} />

          {/* Step content */}
          <div className="mt-10">
            <AnimatePresence mode="wait">
              {/* ─── STEP 0: ABOUT YOU ─── */}
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="sketch-card p-6 sm:p-8"
                >
                  <h2 className="text-xl font-semibold text-foreground">
                    First, tell us a little about yourself.
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This helps visitors see themselves in your story.
                  </p>

                  <div className="mt-6 space-y-5">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. John & Maria Smith"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="role">Your Role or Title</Label>
                      <Input
                        id="role"
                        placeholder="e.g. Parents, St. Thomas More Parish"
                        value={form.role}
                        onChange={(e) => update("role", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">
                        Email{" "}
                        <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="We'll only use this to follow up if needed"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>How did you engage with Words Incarnate?</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {AUDIENCE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => update("audience", opt.value)}
                            className={`rounded-lg border-2 p-3 text-left transition-all ${
                              form.audience === opt.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40"
                            }`}
                          >
                            <span className="text-sm font-medium text-foreground">
                              {opt.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {opt.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Overall Rating</Label>
                      <div className="mt-2">
                        <StarRating
                          value={form.rating}
                          onChange={(v) => update("rating", v)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 1: YOUR STORY ─── */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="sketch-card p-6 sm:p-8"
                >
                  <h2 className="text-xl font-semibold text-foreground">
                    Walk us through your experience.
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Answer whatever feels natural — even one or two sentences per
                    question is perfect. We'll help you shape it into a testimonial
                    in the next step.
                  </p>

                  <div className="mt-6 space-y-6">
                    <div>
                      <Label htmlFor="challenge" className="text-base">
                        What challenge or question brought you to Words Incarnate?
                      </Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        What were you looking for? What wasn't working?
                      </p>
                      <Textarea
                        id="challenge"
                        rows={3}
                        placeholder="We wanted deeper family conversations but didn't know where to start..."
                        value={form.challenge}
                        onChange={(e) => update("challenge", e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience" className="text-base">
                        What was your experience like?
                      </Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        What stood out? What surprised you?
                      </p>
                      <Textarea
                        id="experience"
                        rows={3}
                        placeholder="The workshop was unlike anything we'd done before — the questions opened up conversations we'd been avoiding..."
                        value={form.experience}
                        onChange={(e) => update("experience", e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="impact" className="text-base">
                        What changed? What's different now?
                      </Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        How did this affect your family, school, or organization?
                      </p>
                      <Textarea
                        id="impact"
                        rows={3}
                        placeholder="Our family now has a shared language for what matters most to us..."
                        value={form.impact}
                        onChange={(e) => update("impact", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 2: REVIEW & EDIT ─── */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="sketch-card p-6 sm:p-8"
                >
                  <h2 className="text-xl font-semibold text-foreground">
                    Here's your testimonial draft.
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We've combined your answers into a single testimonial. Edit
                    freely — make it sound like you.
                  </p>

                  <div className="mt-6">
                    <div className="relative">
                      <Quote className="absolute top-3 left-3 h-5 w-5 text-primary/20" />
                      <Textarea
                        rows={8}
                        value={form.testimonialDraft}
                        onChange={(e) => update("testimonialDraft", e.target.value)}
                        className="pl-10 text-base leading-relaxed"
                        placeholder="Your testimonial..."
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {form.testimonialDraft.trim().split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>

                  {/* Preview card */}
                  {form.testimonialDraft.trim().length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Preview
                      </p>
                      <div className="rounded-lg border border-border bg-card p-5">
                        <div className="mb-3">
                          <StarRating
                            value={form.rating}
                            onChange={(v) => update("rating", v)}
                          />
                        </div>
                        <p className="text-sm text-foreground leading-relaxed italic">
                          "{form.testimonialDraft.trim()}"
                        </p>
                        <div className="mt-3 border-t border-border pt-3">
                          <p className="text-sm font-medium text-foreground">
                            {form.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{form.role}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.consentDisplay}
                        onChange={(e) => update("consentDisplay", e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-border text-primary accent-primary"
                      />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        I give Words Incarnate permission to display my name, role, and
                        testimonial on their website and marketing materials.
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 3: SUBMIT (auto-triggered) ─── */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="sketch-card p-6 sm:p-8 text-center"
                >
                  <h2 className="text-xl font-semibold text-foreground">
                    Ready to submit?
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Your testimonial will be reviewed before appearing on the site.
                    Thank you for taking the time — your words help other families
                    and organizations find what they're looking for.
                  </p>

                  {/* Final summary */}
                  <div className="mt-6 rounded-lg border border-border bg-card p-5 text-left">
                    <div className="flex gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= form.rating
                              ? "fill-primary text-primary"
                              : "fill-none text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed italic">
                      "{form.testimonialDraft.trim()}"
                    </p>
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-sm font-medium text-foreground">{form.name}</p>
                      <p className="text-xs text-muted-foreground">{form.role}</p>
                    </div>
                  </div>

                  {error && (
                    <p className="mt-4 text-sm text-red-600">{error}</p>
                  )}

                  <div className="mt-6">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-8"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Testimonial
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            {step < 3 && (
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={goBack}
                  disabled={step === 0}
                  className={step === 0 ? "invisible" : ""}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={goNext} disabled={!canAdvance()}>
                  {step === 2 ? "Review" : "Continue"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" onClick={goBack} className="text-muted-foreground">
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Go back and edit
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShareExperience;
