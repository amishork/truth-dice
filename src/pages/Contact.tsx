import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import MultiStepContactForm from "@/components/MultiStepContactForm";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const Contact = () => {
  const [searchParams] = useSearchParams();
  const interest = searchParams.get("interest") ?? undefined;
  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Contact" description="Ready to make your values incarnate? Get in touch with Words Incarnate to explore formation experiences for your family, school, or organization." path="/contact" />
      <Navigation />

      <main id="main" className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Left info panel */}
            <motion.div {...fadeUp} className="lg:col-span-2">
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Let's talk
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Ready to make your values incarnate? Tell us about your needs and we'll craft a path forward together.
              </p>

              <div className="mt-10 space-y-6">
                <div>
                  <p className="label-technical mb-2">Email</p>
                  <a href="mailto:alex@wordsincarnate.com" className="text-foreground hover:text-primary transition-colors">
                    alex@wordsincarnate.com
                  </a>
                </div>
                <div>
                  <p className="label-technical mb-2">Response time</p>
                  <p className="text-foreground">1–2 business days</p>
                </div>
                <div>
                  <p className="label-technical mb-2">We serve</p>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li>Individuals & Families</li>
                    <li>Schools & Educators</li>
                    <li>Organizations & Leaders</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Multi-step form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-3"
            >
              <MultiStepContactForm initialInterest={interest} />
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
