import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, CheckCircle } from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  role: z.string().optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
  service_interest: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    role: "",
    message: "",
    service_interest: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof ContactForm;
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
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

    setSubmitted(true);
    toast.success("Your message has been sent!");
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 pt-24 pb-20">
          <motion.div {...fadeUp} className="mx-auto max-w-lg text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-primary" />
            <h1 className="mt-6 text-3xl font-semibold text-foreground">Thank you!</h1>
            <p className="mt-4 text-muted-foreground">
              We've received your message and will be in touch within 1–2 business days.
            </p>
            <Button className="mt-8 wi-cta" onClick={() => window.location.href = "/"}>
              Return Home
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Left info panel */}
            <motion.div {...fadeUp} className="lg:col-span-2">
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Let's talk
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Ready to make your values incarnate? Tell us about your needs and we'll craft a path forward together.
              </p>

              <div className="mt-10 space-y-6">
                <div>
                  <p className="label-technical mb-2">Email</p>
                  <a href="mailto:hello@wordsincarnate.com" className="text-foreground hover:text-primary transition-colors">
                    hello@wordsincarnate.com
                  </a>
                </div>
                <div>
                  <p className="label-technical mb-2">Response time</p>
                  <p className="text-foreground">1–2 business days</p>
                </div>
                <div>
                  <p className="label-technical mb-2">We serve</p>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>Individuals & Families</li>
                    <li>Schools & Educators</li>
                    <li>Organizations & Leaders</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-3"
            >
              <form onSubmit={handleSubmit} className="sketch-card space-y-5 p-8">
                <div className="grid gap-5 sm:grid-cols-2">
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
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label-technical mb-1.5 block">Phone</label>
                    <Input
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
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

                <div>
                  <label className="label-technical mb-1.5 block">Message *</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Tell us about your needs, goals, or questions..."
                    rows={5}
                  />
                  {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
                </div>

                <Button type="submit" size="lg" disabled={submitting} className="w-full wi-cta">
                  {submitting ? "Sending..." : "Send Message"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
