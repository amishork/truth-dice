import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
    name: "Honor",
    desc: "A structured diagnostic with leadership to surface the organization's actual operating values — not the ones on the website, but the ones visible in hiring decisions, resource allocation, and how conflict is handled.",
  },
  {
    step: "02",
    name: "Observe",
    desc: "Team assessments, stakeholder interviews, and culture mapping to identify where your stated mission aligns with daily operations — and where the gaps are creating drag, turnover, or misalignment.",
  },
  {
    step: "03",
    name: "Live",
    desc: "Custom frameworks for embedding values into the systems that matter: decision-making protocols, leadership development, team rituals, onboarding, and performance evaluation.",
  },
  {
    step: "04",
    name: "Declare",
    desc: "Operationalized culture documents, leadership alignment artifacts, and accountability structures that make values visible and measurable across the organization.",
  },
];

const outcomes = [
  "A clear values architecture aligned across leadership and teams",
  "Decision-making frameworks grounded in articulated principles",
  "Leadership formation that develops character alongside competence",
  "Culture systems that reduce misalignment, turnover, and drift",
  "Onboarding and evaluation processes built on shared commitments",
  "Measurable culture indicators to track alignment over time",
];

const Organizations = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="For Organizations | Words Incarnate"
        description="Values-driven consulting for mission-driven organizations. Culture strategy, leadership formation, and decision-making frameworks grounded in articulated principles."
        path="/organizations"
      />
      <JsonLd data={webPageSchema("For Organizations | Words Incarnate", "Values-driven consulting for mission-driven organizations.", "/organizations")} />
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
              <p className="label-technical mb-3">Words Incarnate for Organizations</p>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Culture is strategy. Treat it like one.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Mission-driven organizations know what they stand for. Few have the operational
                infrastructure to ensure those commitments shape daily decisions, leadership
                development, and team culture. Words Incarnate builds that infrastructure.
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
                Mission statements don't build culture. Systems do.
              </h2>
              <div className="mt-8 space-y-4 text-foreground leading-relaxed">
                <p>
                  Your organization has a mission statement. It probably appears on your
                  website, in your annual report, and on the wall in the lobby. But ask
                  five employees what it means for how they make decisions on Tuesday
                  afternoon, and you'll get five different answers — or silence.
                </p>
                <p>
                  The gap between stated values and organizational behavior is the single
                  largest source of culture erosion in mission-driven organizations. It
                  produces cynicism among staff, inconsistency in leadership, and a slow
                  drift away from the mission that no retreat or strategic plan can fix.
                </p>
                <p className="text-muted-foreground">
                  Words Incarnate addresses the root cause: your values aren't embedded in
                  the systems that run your organization. The HOLD method creates the
                  architecture that makes values operational.
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
                From diagnosis to integration.
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
                Operational values, not aspirational ones.
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

        {/* ─── INVESTMENT ─── */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
              <p className="label-technical mb-3">Investment</p>
              <h2 className="text-3xl font-semibold text-foreground">
                Scoped to your organization.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Single workshops start at $3,500. Full-year consulting partnerships
                start at $5,000 per month. Every engagement is custom-scoped to your
                organization's size, complexity, and goals.
              </p>
              <div className="mt-8">
                <Button onClick={() => navigate("/contact")} className="group">
                  Request a Proposal
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <ContextualTestimonials
          audience="organization"
          label="From Partners"
          heading="What organizational leaders are saying."
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
              Ready to align your culture with your mission?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Tell us about your organization and we'll scope a custom engagement.
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

export default Organizations;
