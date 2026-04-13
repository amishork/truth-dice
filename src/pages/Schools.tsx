import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { openCalendlyPopup } from "@/components/Calendly";
import ContextualTestimonials from "@/components/ContextualTestimonials";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

const phases = [
  {
    step: "01",
    name: "Discovery",
    desc: "We listen. A deep conversation with leadership to understand your school's charism, culture, and the gap between stated mission and lived reality.",
  },
  {
    step: "02",
    name: "Assessment",
    desc: "Faculty and student values assessments surface what your community actually prioritizes — and where formation is needed most.",
  },
  {
    step: "03",
    name: "Design",
    desc: "A custom formation plan built around your school's calendar, culture, and capacity. No off-the-shelf programs.",
  },
  {
    step: "04",
    name: "Delivery",
    desc: "Faculty workshops, student programming, and parent engagement — facilitated on-site by Alex. Experiential, not lecture-based.",
  },
  {
    step: "05",
    name: "Integration",
    desc: "Ongoing advisory support to embed the values framework into daily operations, hiring, discipline, and culture-building.",
  },
];

const outcomes = [
  "A shared values vocabulary used across faculty, students, and families",
  "Faculty formation that re-energizes mission-driven teaching",
  "Student programming that builds character through experience, not compliance",
  "A values architecture visible in hallways, classrooms, and decision-making",
  "Parent engagement that extends formation into the home",
  "Measurable culture metrics to track formation over time",
];

const Schools = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="For Schools | Words Incarnate"
        description="Values formation consulting for Catholic schools. Faculty workshops, student programming, and institutional culture transformation."
        path="/schools"
      />
      <JsonLd data={webPageSchema("For Schools | Words Incarnate", "Values formation consulting for Catholic schools. Faculty workshops, student programming, and institutional culture transformation.", "/schools")} />
      <Navigation />

      <main id="main" className="pt-16">
        {/* ─── HERO ─── */}
        <section className="bg-card py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="label-technical mb-3">Words Incarnate for Schools</p>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Formation at the institutional level.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Catholic schools claim their values. Few have a systematic way of forming students
                into them. Words Incarnate builds the architecture that makes your mission real —
                in hallways, classrooms, and the daily texture of school life.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate("/contact")}>
                  Request a Proposal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/quiz")}>
                  Try the Free Assessment
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── THE PROBLEM ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl">
              <p className="label-technical mb-3">The Problem</p>
              <h2 className="text-3xl font-semibold text-foreground">
                Mission statements don't form students. Experiences do.
              </h2>
              <div className="mt-8 space-y-4 text-foreground leading-relaxed">
                <p>
                  Most Catholic schools have beautiful mission statements. But walk through the hallways
                  and ask students what the school values — you'll hear silence, or rehearsed answers
                  that don't connect to lived experience.
                </p>
                <p>
                  The gap isn't intention. The gap is architecture. Schools need a systematic way to
                  translate their charism into formation that students, faculty, and parents actually feel.
                </p>
                <p className="text-muted-foreground">
                  Words Incarnate provides that architecture using the HOLD method — Honor what the
                  school truly values, Observe where it's already alive in daily life, Live it through
                  redesigned systems and practices, and Declare it across the community.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── ENGAGEMENT MODEL ─── */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center mb-14">
              <p className="label-technical mb-3">The Model</p>
              <h2 className="text-3xl font-semibold text-foreground">
                Five phases. One transformed culture.
              </h2>
            </motion.div>

            <div className="mx-auto max-w-3xl space-y-6">
              {phases.map((phase, i) => (
                <motion.div
                  key={phase.step}
                  className="sketch-card p-6 flex gap-5"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-semibold text-primary">{phase.step}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{phase.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{phase.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── OUTCOMES ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl">
              <p className="label-technical mb-3">What You Get</p>
              <h2 className="text-3xl font-semibold text-foreground mb-10">
                Outcomes, not just workshops.
              </h2>
              <div className="space-y-4">
                {outcomes.map((outcome, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-foreground">{outcome}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
              <p className="label-technical mb-3">Investment</p>
              <h2 className="text-3xl font-semibold text-foreground">
                Custom engagements for every school.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Every engagement is scoped to your school's size, needs, and budget.
                Single workshops start at $2,500. Full-year consulting partnerships
                start at $4,000 per month. We'll build the right scope together on a
                discovery call.
              </p>
              <div className="mt-8">
                <Button onClick={() => openCalendlyPopup()} className="group">
                  Book a Discovery Call
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <ContextualTestimonials
          audience="school"
          label="From School Leaders"
          heading="What administrators are saying."
        />

        {/* ─── BOTTOM CTA ─── */}
        <motion.section
          className="bg-primary py-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold text-primary-foreground sm:text-3xl">
              Ready to bring formation to your school?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Tell us about your school and we'll scope a custom engagement.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/contact")}
              >
                Request a Proposal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Schools;
