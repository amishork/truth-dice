import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import TrustedByLogos from "@/components/TrustedByLogos";
import CaseStudyCards from "@/components/CaseStudyCards";
import FloatingCTA from "@/components/FloatingCTA";
import BackToTop from "@/components/BackToTop";
import MorphingTagline from "@/components/MorphingTagline";
import GradientBlobs from "@/components/GradientBlobs";
import { Button } from "@/components/ui/button";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import LeadMagnetModal from "@/components/LeadMagnetModal";
import MagneticButton from "@/components/MagneticButton";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import InfiniteMarquee from "@/components/InfiniteMarquee";
import SocialProofToasts from "@/components/SocialProofToasts";
import WelcomeBack from "@/components/WelcomeBack";
import PageMeta from "@/components/PageMeta";
import heroBg from "@/assets/hero-bg.jpg";

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
        description="Discover your core values and build cultures of connection, delight, and belonging. Start your free values discovery today."
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
      <SocialProofToasts />
      <WelcomeBack onStartQuiz={startQuiz} />
      <FloatingCTA onClick={startQuiz} />
      <BackToTop />

      <main id="main" className="pt-16">
        {/* HERO */}
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
            <p className="mt-8 text-lg text-muted-foreground">Formation, strategy, and experience design</p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton>
                <Button size="lg" onClick={startQuiz} className="wi-cta">
                  Start Values Discovery
                  <ChevronRight />
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="wi-cta"
                  onClick={() => {
                    const el = document.getElementById("making-values");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Learn more
                </Button>
              </MagneticButton>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">~5 minutes · guided values discovery · 6-value takeaway</p>
          </motion.div>
        </section>

        <InfiniteMarquee />

        <section id="making-values" className="relative container mx-auto space-y-16 px-4 py-20">
          <GradientBlobs />

          <motion.div {...fadeInUp} className="mx-auto max-w-3xl">
            <ScrollTextReveal text="Making Values Incarnate" className="text-3xl font-semibold text-foreground" />
            <p className="mt-4 text-muted-foreground">Formation for Families, Schools, and Organizations</p>
            <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
              <p>Words Incarnate exists to help people name what they love — and build lives and cultures that embody it.</p>
              <p>In homes, classrooms, and workplaces, many of us are rich in words but poor in lived meaning. We speak often about values, mission, and purpose, yet struggle to see them take root in daily life.</p>
              <p>Words Incarnate helps close that gap — by turning values into experiences, and experiences into culture.</p>
            </div>
          </motion.div>

          <motion.div {...fadeInUp} className="mx-auto max-w-3xl">
            <ScrollTextReveal text="We Are Losing What Matters Most" className="text-3xl font-semibold text-foreground" />
            <p className="mt-4 text-muted-foreground">In a digitized and distracted world, something essential is being eroded:</p>
            <ul className="mt-8 space-y-3 text-foreground">
              <li>Families are together, but lack connection.</li>
              <li>Schools teach to standards, but lose delight in the process.</li>
              <li>Organizations pursue efficiency, but forget belonging.</li>
            </ul>
            <p className="mt-8 text-foreground">People are hungry for presence, meaning, and shared life — but often lack the tools, language, or structures to recover them.</p>
            <p className="mt-4 text-muted-foreground">Words Incarnate meets this cultural and spiritual hunger by helping individuals and communities make their values concrete, livable, and shared.</p>
          </motion.div>

          <motion.div {...fadeInUp} className="mx-auto max-w-3xl">
            <ScrollTextReveal text="How We Work" className="text-3xl font-semibold text-foreground" />
            <p className="mt-4 text-muted-foreground">Words Incarnate approaches strategy as formation.</p>
            <p className="mt-8 text-foreground leading-relaxed">Drawing from classical wisdom, Catholic anthropology, and lived experience, we help leaders and communities align belief, behavior, and daily life.</p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { title: "Connection", desc: "practicing presence and undivided attention to your unique values" },
                { title: "Delight", desc: "restoring wonder, joy, and meaningful leisure to your routines" },
                { title: "Belonging", desc: "creating the near occasion of communion and solidarity in purpose" },
              ].map((x, i) => (
                <motion.div key={x.title} className="rounded-lg border border-border bg-card p-5" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                  <p className="text-sm font-semibold text-foreground">{x.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{x.desc}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-10 text-foreground">We put our professional passion for clarity, intelligence, and expertise at the service of these core values — in everything we do.</p>
          </motion.div>

          <motion.div {...fadeInUp} className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-8">
            <h2 className="text-3xl font-semibold text-foreground">An Invitation</h2>
            <p className="mt-4 text-muted-foreground">Words Incarnate is not a quick fix or a branding exercise.</p>
            <p className="mt-8 text-foreground leading-relaxed">It is an invitation to slow down, pay attention, and build something enduring — rooted in connection, animated by delight, and sustained by belonging.</p>
            <p className="mt-4 text-foreground leading-relaxed">If you are ready to make your values visible again, to restore meaning to daily life, and to form people — not just systems — we would be honored to walk with you.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <MagneticButton>
                <Button size="lg" onClick={startQuiz} className="wi-cta">
                  Let's make values incarnate again
                  <ChevronRight />
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button size="lg" variant="outline" onClick={() => setShowLeadMagnet(true)} className="wi-cta">
                  Free worksheet
                </Button>
              </MagneticButton>
            </div>
          </motion.div>
        </section>

        <TrustedByLogos />
        <TestimonialCarousel />
        <CaseStudyCards />

        <motion.section className="bg-primary py-16 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold text-primary-foreground sm:text-3xl">Ready to discover what drives you?</h2>
            <p className="mt-3 text-primary-foreground/80">Start with our free values discovery — or book a consultation to go deeper.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" onClick={startQuiz} className="wi-cta">
                Start Values Discovery <ChevronRight />
              </Button>
              <Button size="lg" variant="outline" className="wi-cta border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/contact")}>
                Book a Consultation
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
