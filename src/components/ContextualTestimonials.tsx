import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  testimonial_draft: string | null;
  experience: string | null;
  impact: string | null;
  rating: number | null;
}

interface ContextualTestimonialsProps {
  /** Filter testimonials by audience: "school", "family", "organization", or "individual" */
  audience: string;
  /** Section label above the heading */
  label?: string;
  /** Section heading */
  heading?: string;
  /** Fallback message when no testimonials exist */
  fallbackMessage?: string;
  /** Max number of testimonials to show */
  limit?: number;
}

const ContextualTestimonials = ({
  audience,
  label = "What People Are Saying",
  heading = "From those who've done the work.",
  fallbackMessage,
  limit = 3,
}: ContextualTestimonialsProps) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, name, role, testimonial_draft, experience, impact, rating")
      .eq("status", "approved")
      .eq("audience", audience)
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        setTestimonials((data as Testimonial[]) || []);
        setLoading(false);
      });
  }, [audience, limit]);

  if (loading) return null;

  // Get the display text for a testimonial — prefer the draft, then impact, then experience
  const getText = (t: Testimonial): string =>
    t.testimonial_draft || t.impact || t.experience || "";

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto max-w-3xl text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="label-technical mb-3">{label}</p>
          <h2 className="text-3xl font-semibold text-foreground">{heading}</h2>
        </motion.div>

        {testimonials.length > 0 ? (
          <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                className="sketch-card p-6 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Quote className="h-5 w-5 text-primary/40 mb-3 shrink-0" />
                <p className="text-sm text-foreground leading-relaxed flex-1">
                  {getText(t)}
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  {t.role && (
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-muted-foreground">
              {fallbackMessage || (
                <>
                  Testimonials coming soon. If you've worked with Words Incarnate,{" "}
                  <a href="/testimonials/share" className="text-primary hover:underline">
                    share your experience
                  </a>.
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContextualTestimonials;
