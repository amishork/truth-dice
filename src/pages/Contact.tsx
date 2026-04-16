import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "next-themes";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import MultiStepContactForm from "@/components/MultiStepContactForm";
import Cal from "@calcom/embed-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const Contact = () => {
  const [searchParams] = useSearchParams();
  const interest = searchParams.get("interest") ?? undefined;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Contact" description="Ready to make your values incarnate? Get in touch with Words Incarnate to explore formation experiences for your family, school, or organization." path="/contact" />
      <Navigation />

      <main id="main" className="pt-24 pb-0">
        <div className="container mx-auto px-4">
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
        </div>

        {/* ─── INLINE BOOKING ─── */}
        <section className="mt-24 border-t border-border bg-background">
          <div className="container mx-auto px-4 pt-16 pb-8">
            <motion.div
              className="mx-auto max-w-xl text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="label-technical mb-4">Or book directly</p>
              <h2 className="text-3xl font-semibold text-foreground font-serif sm:text-4xl">
                Pick a time
              </h2>
              <p className="mt-4 text-muted-foreground">
                30 minutes. No preparation needed.
              </p>
            </motion.div>

            <div className="mx-auto max-w-4xl">
              <Cal
                key={resolvedTheme}
                calLink="words-incarnate/discovery-call"
                config={{
                  layout: "month_view",
                  theme: isDark ? "dark" : "light",
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: "scroll",
                }}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
