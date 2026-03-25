import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { toast } from "sonner";
import { Send, ChevronRight, ChevronLeft, CheckCircle, User, Briefcase, MessageSquare } from "lucide-react";
import Confetti from "@/components/Confetti";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  role: z.string().optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
  service_interest: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

const STEPS = [
  { icon: User, label: "About You", fields: ["name", "email", "phone"] as const },
  { icon: Briefcase, label: "Your Needs", fields: ["role", "service_interest"] as const },
  { icon: MessageSquare, label: "Your Message", fields: ["message"] as const },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
};

const MultiStepContactForm = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<ContactForm>({
    name: "", email: "", phone: "", role: "", message: "", service_interest: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (stepIndex: number): boolean => {
    const stepFields = STEPS[stepIndex].fields;
    const newErrors: Partial<Record<keyof ContactForm, string>> = {};
    
    if (stepIndex === 0) {
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    }
    if (stepIndex === 2) {
      if (!form.message.trim()) newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    if (honeypot) return; // Bot detected
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      toast.error("Please check your inputs.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      role: result.data.role || null,
      message: result.data.message,
      service_interest: result.data.service_interest || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setShowConfetti(true);
    setSubmitted(true);
    toast.success("Your message has been sent!");
    sendNotification("contact", result.data);
  };

  if (submitted) {
    return (
      <>
        <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sketch-card p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <CheckCircle className="mx-auto h-16 w-16 text-primary" />
          </motion.div>
          <h3 className="mt-6 text-2xl font-semibold text-foreground">Thank you!</h3>
          <p className="mt-3 text-muted-foreground">
            We've received your message and will be in touch within 1–2 business days.
          </p>
          <Button className="mt-6 wi-cta" onClick={() => window.location.href = "/"}>
            Return Home
          </Button>
        </motion.div>
      </>
    );
  }

  return (
    <div className="sketch-card overflow-hidden">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-3 px-8 pt-6">
        {/* Honeypot - hidden from users, catches bots */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
          aria-hidden="true"
        />
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isComplete = i < step;
          return (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (i < step) { setDirection(-1); setStep(i); }
                }}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                    ? "bg-primary/10 text-primary cursor-pointer"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="relative min-h-[280px] px-8 py-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-5"
          >
            {step === 0 && (
              <>
                <div>
                  <label className="label-technical mb-1.5 block">Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Your name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <label className="label-technical mb-1.5 block">Email *</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <label className="label-technical mb-1.5 block">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="label-technical mb-1.5 block">Your role</label>
                  <Select value={form.role} onValueChange={(v) => handleChange("role", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent / Family Leader</SelectItem>
                      <SelectItem value="educator">School Leader / Educator</SelectItem>
                      <SelectItem value="org-leader">Organization Leader</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="label-technical mb-1.5 block">Service interest</label>
                  <Select value={form.service_interest} onValueChange={(v) => handleChange("service_interest", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="What are you looking for?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family Formation</SelectItem>
                      <SelectItem value="school">School Culture Advisory</SelectItem>
                      <SelectItem value="org">Organizational Strategy</SelectItem>
                      <SelectItem value="values-discovery">Values Discovery Workshop</SelectItem>
                      <SelectItem value="not-sure">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 2 && (
              <div>
                <label className="label-technical mb-1.5 block">Message *</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Tell us about your needs, goals, or questions..."
                  rows={6}
                />
                {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t border-border px-8 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goPrev}
          disabled={step === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <p className="text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>

        {step < STEPS.length - 1 ? (
          <Button size="sm" onClick={goNext} className="gap-1 wi-cta">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} disabled={submitting} className="gap-1 wi-cta">
            {submitting ? "Sending..." : "Send"}
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiStepContactForm;
