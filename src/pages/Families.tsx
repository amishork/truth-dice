import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
    desc: "We start with an honest conversation about what your family actually values — not what you think you should value. Through guided reflection, you and your spouse articulate the commitments that shape your household.",
  },
  {
    step: "02",
    name: "Observe",
    desc: "Together we look at the daily texture of your family life — meals, evenings, weekends, discipline, screen time, traditions — and map where your values are already alive, and where they're getting lost.",
  },
  {
    step: "03",
    name: "Live",
    desc: "We design practical rhythms, rituals, and conversations tailored to your family's ages, stage, and temperament. These aren't abstract principles — they're specific practices that fit your actual life.",
  },
  {
    step: "04",
    name: "Declare",
    desc: "Your family walks away with a values charter — a clear, beautiful articulation of who you are and what you're building together. Something your children can grow into, not just grow up around.",
  },
];

const outcomes = [
  "A shared language your whole family uses for what matters most",
  "Practical rituals and rhythms that form character through daily life",
  "A family values charter — your household's operating document",
  "Age-appropriate ways to include every child in the conversation",
  "Conflict resolution grounded in shared commitments, not power struggles",
  "A living framework that grows with your family over time",
];

const Families = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="For Families | Words Incarnate"
        description="A guided formation experience that turns your household into a place of intentional culture. Values discovery, family rituals, and a charter your children can grow into."
        path="/families"
      />
      <JsonLd data={webPageSchema("For Families | Words Incarnate", "A guided formation experience that turns your household into a place of intentional culture.", "/families")} />
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
              <p className="label-technical mb-3">Words Incarnate for Families</p>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Your family has values. Do your children know what they are?
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Most families assume their values are being transmitted. They aren't — at least
                not intentionally. Words Incarnate helps your family name what matters most and
                build the daily rhythms that actually form it.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate("/contact")}>
                  Book a Discovery Call
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
              <p className="label-technical mb-3">The Challenge</p>
              <h2 className="text-3xl font-semibold text-foreground">
                Good intentions don't raise children. Intentional culture does.
              </h2>
              <div className="mt-8 space-y-4 text-foreground leading-relaxed">
                <p>
                  You know what kind of family you want to be. You probably talk about it
                  with your spouse — usually after something goes wrong. But between the
                  morning rush, the evening chaos, and the weight of keeping everything
                  running, the values you care about most end up being the things you think
                  about least.
                </p>
                <p>
                  The problem isn't that you don't care. The problem is that family culture
                  happens whether you design it or not. Without intentional architecture,
                  your household defaults to whatever patterns are easiest — and those
                  patterns rarely form the character you're hoping for.
                </p>
                <p className="text-muted-foreground">
                  Words Incarnate gives your family the structure to move from aspiration
                  to formation — using the HOLD method to build a household culture your
                  children will carry with them.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── THE HOLD JOURNEY ─── */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center mb-14">
              <p className="label-technical mb-3">The Journey</p>
              <h2 className="text-3xl font-semibold text-foreground">
                Four steps to a family that lives its values.
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
              <p className="label-technical mb-3">What Your Family Gets</p>
              <h2 className="text-3xl font-semibold text-foreground mb-10">
                More than a conversation — a way of life.
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
                Tailored to your family.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Family formation workshops start at $450. Every engagement is
                scoped to your family's size, ages, and goals. We'll design the
                right experience together on a discovery call.
              </p>
              <div className="mt-8">
                <Button onClick={() => navigate("/contact")} className="group">
                  Book a Discovery Call
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── TESTIMONIALS PLACEHOLDER ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
              <p className="label-technical mb-3">From Families</p>
              <h2 className="text-3xl font-semibold text-foreground mb-4">
                What families are saying.
              </h2>
              <p className="text-muted-foreground">
                Testimonials from families coming soon. If you've worked with Words Incarnate,{" "}
                <a href="/testimonials/share" className="text-primary hover:underline">share your experience</a>.
              </p>
            </motion.div>
          </div>
        </section>

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
              Your family deserves an intentional culture.
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Start with the free assessment or book a conversation.
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
                onClick={() => navigate("/contact")}
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

export default Families;
