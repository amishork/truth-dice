import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import TrustedByLogos from "@/components/TrustedByLogos";
import FloatingCTA from "@/components/FloatingCTA";
import BackToTop from "@/components/BackToTop";
import MorphingTagline from "@/components/MorphingTagline";
import { Button } from "@/components/ui/button";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import LeadMagnetModal from "@/components/LeadMagnetModal";
import MagneticButton from "@/components/MagneticButton";
import HeroEmailCapture from "@/components/HeroEmailCapture";
import HomeProgramCards from "@/components/HomeProgramCards";
import WelcomeBack from "@/components/WelcomeBack";
import PageMeta from "@/components/PageMeta";
import heroBg from "@/assets/hero-bg.webp";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

const Index = () => {
  const navigate = useNavigate();
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const startQuiz = () => navigate("/quiz");

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Values Formation for Families, Schools & Organizations"
        description="Discover your core values and build cultures of connection, delight, and belonging. Start your free values assessment today."
        path="/"
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        Skip to Main Content
      </a>

      <Navigation />
      <ExitIntentPopup onStartQuiz={startQuiz} />
      <LeadMagnetModal open={showLeadMagnet} onClose={() => setShowLeadMagnet(false)} />
      <WelcomeBack onStartQuiz={startQuiz} />
      <FloatingCTA onClick={startQuiz} />
      <BackToTop />

      <main id="main" className="pt-16">
        {/* ─── HERO ─── */}
        <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6">
          <div
            className="absolute inset-0 will-change-transform"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          >
            <div
              className="hero-bg-animated h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${heroBg})` }}
            />
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background/90 backdrop-blur-[3px]"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          />

          <motion.div
            className="relative z-10 mx-auto w-full max-w-3xl text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="wi-wordmark">WORDS INCARNATE</h1>
            <div className="mt-3 flex justify-center">
              <MorphingTagline />
            </div>

            <p className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto">
              Helping families, schools, and organizations close the gap between stated values and lived reality.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton>
                <Button size="lg" onClick={startQuiz} className="wi-cta">
                  Free Values Assessment
                  <ChevronRight />
                </Button>
              </MagneticButton>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">~5 minutes · guided assessment · 6-value takeaway</p>

            {/* Email capture */}
            <div className="mt-10">
              <HeroEmailCapture />
            </div>
          </motion.div>
        </section>

        {/* ─── THE PROBLEM (tight) ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeInUp} className="mx-auto max-w-3xl text-center">
              <p className="label-technical mb-3">The Gap</p>
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                We are rich in words but poor in lived meaning.
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Families talk about what matters but lack connection. Schools write mission statements
                that never reach the hallways. Organizations pursue efficiency but forget belonging.
                Words Incarnate helps close that gap — turning values into experiences, and experiences into culture.
              </p>
            </motion.div>

            {/* Three pillars */}
            <motion.div {...fadeInUp} className="mx-auto mt-14 max-w-3xl">
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  { title: "Connection", desc: "Practicing presence and undivided attention to what matters most." },
                  { title: "Delight", desc: "Restoring wonder, joy, and meaningful leisure to daily life." },
                  { title: "Belonging", desc: "Creating communion and solidarity in shared purpose." },
                ].map((x, i) => (
                  <motion.div
                    key={x.title}
                    className="rounded-lg border border-border bg-card p-5 text-center"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <p className="text-sm font-semibold text-foreground">{x.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{x.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── PROGRAMS (commitment ladder) ─── */}
        <HomeProgramCards />

        {/* ─── SOCIAL PROOF ─── */}
        <TrustedByLogos />
        <TestimonialCarousel />

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
              Ready to discover what drives you?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Start with our free assessment — or apply to go deeper.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" onClick={startQuiz} className="wi-cta">
                Free Values Assessment <ChevronRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="wi-cta border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate("/contact")}
              >
                Request a Proposal
              </Button>
            </div>
          </div>
        </motion.section>

        <Footer />
      </main>
    </div>
  );
};

export default Index;
