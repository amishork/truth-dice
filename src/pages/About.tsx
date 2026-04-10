import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FounderBio from "@/components/FounderBio";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="About" description="Learn about Words Incarnate — values formation, strategy, and experience design for families, schools, and organizations." path="/about" />
      <JsonLd data={webPageSchema("About", "Learn about Words Incarnate — values formation, strategy, and experience design for families, schools, and organizations.", "/about")} />
      <Navigation />

      <main id="main" className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-3xl">
          <motion.h1 {...fadeUp} className="text-4xl sm:text-5xl font-semibold text-foreground">
            About Words Incarnate
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Helping people name what they love — and build lives that embody it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 space-y-5 text-foreground leading-relaxed"
          >
            <p>
              Words Incarnate exists because most people already know what they value — they just
              struggle to live it. We work with families, schools, and organizations to close that gap,
              turning values from ideas we agree with into practices that shape daily life.
            </p>
            <p>
              Our approach treats strategy as formation: aligning belief, behavior, and the lived
              experiences that become culture. Drawing from classical wisdom, Catholic anthropology,
              and real operational experience, we help communities build something that lasts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-12 rounded-xl border border-border bg-card p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Our Method</p>
            <h2 className="text-2xl font-semibold text-foreground">The HOLD Method</h2>
            <p className="mt-3 text-muted-foreground">
              Whether it's a single conversation or a year-long school transformation, the posture is the same.
            </p>
            <div className="mt-6 space-y-5">
              {[
                { letter: "H", word: "Honor", desc: "Name the one thing that matters most. Force a commitment — not a list of aspirations, but the single value you'd fight for." },
                { letter: "O", word: "Observe", desc: "Follow the value into lived experience. Find where it's already alive — the small practice, the overlooked ritual, the thing you do but have never named. When this is done well, people experience permission to take something small very seriously." },
                { letter: "L", word: "Live", desc: "Build the architecture to sustain it. Design practices, rhythms, and systems that move the value from belief into the texture of daily life." },
                { letter: "D", word: "Declare", desc: "Share it outward. Invite others in. A value held silently is fragile. A value declared becomes accountable — and contagious." },
              ].map((item) => (
                <div key={item.letter} className="flex gap-4">
                  <span className="text-2xl font-semibold text-primary shrink-0 w-8">{item.letter}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.word}</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button asChild>
                <a href="/quiz">Free Values Assessment</a>
              </Button>
            </div>
          </motion.div>

          {/* ─── Invitation (from archived homepage copy) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-12"
          >
            <div className="border-l-2 border-primary/30 pl-6 py-2">
              <p className="text-lg italic text-foreground leading-relaxed">
                Words Incarnate is not a quick fix or a branding exercise. It is an invitation
                to slow down, pay attention, and build something enduring — rooted in connection,
                animated by delight, and sustained by belonging.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                If you are ready to make your values visible again, to restore meaning to daily
                life, and to form people — not just systems — we would be honored to walk with you.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <FounderBio />

      <Footer />
    </div>
  );
};

export default About;
