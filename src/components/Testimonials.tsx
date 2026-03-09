import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const testimonials = [
  {
    quote:
      "Words Incarnate helped our family stop talking about values and start living them. The transformation in our home has been profound.",
    name: "Sarah M.",
    role: "Homeschooling Parent",
  },
  {
    quote:
      "Our school culture shifted from compliance-driven to purpose-driven within one semester. Students and teachers are more engaged than ever.",
    name: "Dr. James L.",
    role: "Head of School",
  },
  {
    quote:
      "The values discovery process gave our leadership team a common language. We went from misalignment to genuine belonging.",
    name: "Rachel T.",
    role: "Nonprofit Executive Director",
  },
];

const stats = [
  { value: "200+", label: "Families served" },
  { value: "35+", label: "Schools transformed" },
  { value: "98%", label: "Would recommend" },
];

const Testimonials = () => {
  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        {/* Stats with animated counters */}
        <motion.div
          className="mb-16 grid gap-8 sm:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter
                value={stat.value}
                className="text-4xl font-semibold text-primary"
              />
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="sketch-card p-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Quote className="h-5 w-5 text-primary/40" />
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                "{t.quote}"
              </p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
