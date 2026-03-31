import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  {
    quote:
      "I never thought a simple exercise could reframe how our entire family operates. Now our kids remind US of our values.",
    name: "Mark & Lisa D.",
    role: "Parents of Four",
  },
  {
    quote:
      "We brought Words Incarnate into our parish council. Within weeks, we had a shared vocabulary that transformed how we make decisions.",
    name: "Fr. Anthony R.",
    role: "Parish Pastor",
  },
];

const stats = [
  { value: "200+", label: "Families served" },
  { value: "35+", label: "Schools transformed" },
  { value: "98%", label: "Would recommend" },
];

const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  };

  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        {/* Stats */}
        <motion.div
          className="mb-16 grid gap-8 sm:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter value={stat.value} className="text-4xl font-semibold text-primary" />
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Carousel */}
        <div className="mx-auto max-w-2xl">
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="sketch-card p-8 text-center"
              >
                <Quote className="mx-auto h-6 w-6 text-primary/40" />
                <p className="mt-5 text-base leading-relaxed text-foreground">
                  "{testimonials[current].quote}"
                </p>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground">{testimonials[current].name}</p>
                  <p className="text-xs text-muted-foreground">{testimonials[current].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => go(-1)} aria-label="Previous testimonial">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className={`h-2 w-2 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-border"}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={() => go(1)} aria-label="Next testimonial">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
