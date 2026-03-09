import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const OurStory = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-3xl">
          <motion.h1 {...fadeUp} className="text-4xl sm:text-5xl font-semibold text-foreground">
            Our Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 text-muted-foreground"
          >
            We began with a simple question: what do we truly value—and what would it look like to live it?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 space-y-5 text-foreground leading-relaxed"
          >
            <p>
              In many homes, classrooms, and workplaces, values remain abstract: important words, but not lived
              realities.
            </p>
            <p>
              Words Incarnate formed around the conviction that values become real through practices—through repeatable
              experiences that shape attention, habits, and relationships.
            </p>
            <p>
              Our work is an invitation to slow down, pay attention, and build something enduring—rooted in
              connection, animated by delight, and sustained by belonging.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mt-12 rounded-xl border border-border bg-card p-8"
          >
            <h2 className="text-2xl font-semibold text-foreground">A practical next step</h2>
            <p className="mt-3 text-muted-foreground">
              Start with a guided values discovery and walk away with 6 core values you can carry into decisions,
              relationships, and daily rhythms.
            </p>
            <div className="mt-8">
              <Button asChild>
                <a href="/">Start values discovery</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OurStory;
