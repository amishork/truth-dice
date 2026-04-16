import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, GraduationCap, Building } from "lucide-react";
import { openCalendlyPopup } from "@/components/Calendly";
import FAQ from "@/components/FAQ";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

const holdPhases = [
  {
    letter: "H",
    name: "Honor",
    subtitle: "Name what you actually value.",
    description:
      "Honoring begins with honesty. Most people and most institutions have never done the slow, uncomfortable work of naming what they truly hold sacred. Not the aspirational list. Not the polished version for the website. The real commitments, the ones that shape your decisions when no one is watching, when resources are scarce, when the easy path diverges from the right one. Honor means looking at your life, your family, your organization, and saying: this is what we actually orient around. And being willing to discover that it might not be what you expected.",
    practice:
      "Through guided conversation and structured reflection, we surface the values that are already alive in your life, your family, or your institution, and distinguish them from the ones you only claim.",
  },
  {
    letter: "O",
    name: "Observe",
    subtitle: "See where values are alive and where they aren't.",
    description:
      "Values show up in the texture of daily life, or they fail to. How you spend your evenings. How your school handles discipline. How your organization makes hiring decisions. Observe is the diagnostic phase: mapping the gap between stated values and lived reality.",
    practice:
      "We use structured assessments, interviews, and observation to build a clear picture of where formation is working and where it's breaking down. No assumptions. No shortcuts.",
  },
  {
    letter: "L",
    name: "Live",
    subtitle: "Build the architecture that makes values real.",
    description:
      "Knowing your values is not the same as living them. Live is the design phase: creating systems, rhythms, practices, and environments that make your values the default, not the exception. Formation happens through redesigned experiences, not through lectures or posters.",
    practice:
      "Custom formation plans built around your actual context. For families: rituals, conversations, and household rhythms. For schools: curriculum integration, faculty formation, student programming. For organizations: decision frameworks, culture systems, and leadership practices.",
  },
  {
    letter: "D",
    name: "Declare",
    subtitle: "Make your values visible and accountable.",
    description:
      "Values that stay private can't be shared, transmitted, or held accountable. Declare is the integration phase: articulating your values in language that others can understand, remember, and hold you to. Private conviction becomes public commitment.",
    practice:
      "Tangible artifacts: family charters, school values architecture, organizational culture documents. Operational tools that keep formation on track over time.",
  },
];

const segments = [
  {
    icon: GraduationCap,
    title: "For Schools",
    description: "Institutional formation that makes your charism visible in hallways, classrooms, and daily life.",
    to: "/schools",
  },
  {
    icon: Users,
    title: "For Families",
    description: "A guided formation experience that turns your household into a place of intentional culture.",
    to: "/families",
  },
  {
    icon: Building,
    title: "For Organizations",
    description: "Values-driven strategy that aligns leadership, culture, and decision-making around what matters.",
    to: "/organizations",
  },
];

const HowWeWork = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="How We Work | Words Incarnate"
        description="The HOLD method: a structured framework for translating abstract values into lived reality. Honor, Observe, Live, Declare."
        path="/how-we-work"
      />
      <JsonLd data={webPageSchema("How We Work | Words Incarnate", "The HOLD method: a structured framework for translating abstract values into lived reality.", "/how-we-work")} />
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
              <p className="label-technical mb-3">The Method</p>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Values don't form themselves.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Everyone has values. Few have a system for living them. The HOLD method is a
                structured framework for translating what you believe into how you actually live,
                whether in your family, your school, or your organization.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── THE PROBLEM ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl">
              <p className="label-technical mb-3">The Gap</p>
              <h2 className="text-3xl font-semibold text-foreground">
                The distance between what you say and what you do.
              </h2>
              <div className="mt-8 space-y-4 text-foreground leading-relaxed">
                <p>
                  Most families, schools, and organizations can articulate their values. Few
                  can point to the specific systems, practices, and rhythms that actually form
                  those values in the people they serve.
                </p>
                <p>
                  The gap is architectural, not intentional. Values require infrastructure
                  the same way a building requires a foundation. Without it, even the best
                  intentions remain aspirational. Words Incarnate builds that infrastructure.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── HOLD FRAMEWORK ─── */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center mb-16">
              <p className="label-technical mb-3">The HOLD Framework</p>
              <h2 className="text-3xl font-semibold text-foreground">
                Four phases of formation.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                HOLD is a formation methodology, not a workshop or a curriculum.
                Each phase builds on the last, moving from discovery to integration.
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl space-y-12">
              {holdPhases.map((phase, i) => (
                <motion.div
                  key={phase.letter}
                  className="sketch-card p-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-2xl font-bold text-primary">{phase.letter}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{phase.name}</h3>
                      <p className="mt-1 text-sm font-medium text-primary">{phase.subtitle}</p>
                      <p className="mt-4 text-foreground leading-relaxed">{phase.description}</p>
                      <p className="mt-4 text-sm text-muted-foreground leading-relaxed italic">
                        {phase.practice}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div {...fadeUp} className="mt-10 text-center">
              <Button
                variant="outline"
                className="group"
                onClick={() => navigate("/hold")}
              >
                Explore the HOLD Method in Depth
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ─── WHAT MAKES THIS DIFFERENT ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl">
              <p className="label-technical mb-3">The Difference</p>
              <h2 className="text-3xl font-semibold text-foreground">
                Formation goes deeper than information.
              </h2>
              <div className="mt-8 space-y-4 text-foreground leading-relaxed">
                <p>
                  Most values work stops at identification: you take an assessment, get a report,
                  and go home. The assessment is the beginning of our work, not the deliverable.
                  The real work is building the lived environment where values become habits,
                  habits become character, and character becomes culture.
                </p>
                <p>
                  Every engagement is facilitated personally by Alex Mishork — a consultant with
                  deep formation experience across philosophy, theology, institutional culture, and
                  organizational leadership. No junior staff. No outsourced facilitators. No
                  off-the-shelf programs.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── WHO WE SERVE ─── */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center mb-14">
              <p className="label-technical mb-3">Who We Serve</p>
              <h2 className="text-3xl font-semibold text-foreground">
                The HOLD method, applied to your context.
              </h2>
            </motion.div>

            <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-3">
              {segments.map((seg, i) => {
                const Icon = seg.icon;
                return (
                  <motion.div
                    key={seg.title}
                    className="sketch-card p-6 flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{seg.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                      {seg.description}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 w-full group"
                      onClick={() => navigate(seg.to)}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQ />

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
              Ready to close the gap?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Start with a free values assessment or book a discovery call.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" onClick={() => navigate("/quiz")}>
                Free Values Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => openCalendlyPopup()}
              >
                Book a Discovery Call
              </Button>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default HowWeWork;
