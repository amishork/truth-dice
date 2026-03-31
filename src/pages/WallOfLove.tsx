import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Quote } from "lucide-react";

type AudienceFilter = "all" | "family" | "school" | "organization" | "individual";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  audience: AudienceFilter;
}

// Replace these with real testimonials as they come in.
// Each testimonial needs: quote, full name, role/title, and audience category.
const testimonials: Testimonial[] = [
  // Example format — replace with real content:
  // {
  //   quote: "Words Incarnate helped our family...",
  //   name: "John & Maria Smith",
  //   role: "Parents, St. Thomas More Parish",
  //   audience: "family",
  // },
];

const filters: { value: AudienceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "family", label: "Families" },
  { value: "school", label: "Schools" },
  { value: "organization", label: "Organizations" },
  { value: "individual", label: "Individuals" },
];

const WallOfLove = () => {
  const [filter, setFilter] = useState<AudienceFilter>("all");

  const filtered =
    filter === "all"
      ? testimonials
      : testimonials.filter((t) => t.audience === filter);

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Wall of Love | Words Incarnate"
        description="What families, schools, and organizations are saying about Words Incarnate."
        path="/testimonials"
      />
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
              Wall of Love
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              What people are saying about their formation experience.
            </p>
          </motion.div>

          {/* Filters */}
          {testimonials.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-10 flex flex-wrap justify-center gap-2"
            >
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filter === f.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </motion.div>
          )}

          {/* Testimonials grid */}
          {filtered.length > 0 ? (
            <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
              {filtered.map((t, i) => (
                <motion.div
                  key={`${t.name}-${i}`}
                  className="mb-6 break-inside-avoid sketch-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.06 }}
                >
                  <Quote className="h-5 w-5 text-primary/30 mb-3" />
                  <p className="text-sm text-foreground leading-relaxed">"{t.quote}"</p>
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-16 text-center"
            >
              <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-10">
                <Quote className="mx-auto h-8 w-8 text-primary/20" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  We're just getting started.
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Testimonials from workshop participants, school partners, and families
                  will appear here as we collect them. If you've experienced Words Incarnate,
                  we'd love to hear from you.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button asChild>
                    <a href="/contact">Share Your Experience</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/quiz">Take the Free Assessment</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WallOfLove;
