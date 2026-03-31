import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FounderBio from "@/components/FounderBio";
import PageMeta from "@/components/PageMeta";
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
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-3xl">
          <motion.h1 {...fadeUp} className="text-4xl sm:text-5xl font-semibold text-foreground">
            About
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 text-muted-foreground"
          >
            Connection. Delight. Belonging.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 space-y-5 text-foreground leading-relaxed"
          >
            <p>
              Words Incarnate exists to help people name what they love—and build lives and cultures that embody it.
            </p>
            <p>
              We work with families, schools, and organizations to translate values from "ideas we agree with" into
              practices that shape daily life.
            </p>
            <p>
              Our approach treats strategy as formation: aligning belief, behavior, and the lived experiences that
              become culture.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-12 rounded-xl border border-border bg-card p-8"
          >
            <h2 className="text-2xl font-semibold text-foreground">How we serve</h2>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              <li>Formation experiences designed for real life (not just retreats or slogans).</li>
              <li>Values discovery that produces clarity you can act on immediately.</li>
              <li>Practical rhythms that rebuild presence, joy, and shared purpose.</li>
            </ul>
            <div className="mt-8">
              <Button asChild>
                <a href="/quiz">Start free assessment</a>
              </Button>
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
