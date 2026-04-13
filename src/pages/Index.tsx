import React, { useState } from "react";
import { ChevronRight, Loader2, CheckCircle2, Download } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import BackToTop from "@/components/BackToTop";
import MorphingTagline from "@/components/MorphingTagline";
import { Button } from "@/components/ui/button";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import LeadMagnetModal from "@/components/LeadMagnetModal";
import MagneticButton from "@/components/MagneticButton";
import HomeProgramCards from "@/components/HomeProgramCards";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { trackEmailCaptured, trackLeadMagnetDownloaded } from "@/lib/analytics";
import QuizPreview from "@/components/QuizPreview";
import WelcomeBack from "@/components/WelcomeBack";
import PageMeta from "@/components/PageMeta";
import JsonLd, { organizationSchema, localBusinessSchema } from "@/components/JsonLd";
import heroPoster from "@/assets/hero-poster.webp";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

const Index = () => {
  const navigate = useNavigate();
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);

  const { scrollY } = useScroll();
  const videoY = useTransform(scrollY, [0, 1000], [0, 300]);
  const overlayY = useTransform(scrollY, [0, 1000], [0, 100]);

  const startQuiz = () => navigate("/quiz");

  const [footerEmail, setFooterEmail] = useState("");
  const [footerLoading, setFooterLoading] = useState(false);
  const [footerSubmitted, setFooterSubmitted] = useState(false);
  const [footerHoneypot, setFooterHoneypot] = useState("");

  const handleFooterEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail.trim() || footerHoneypot) return;
    setFooterLoading(true);
    await supabase.from("email_captures").upsert(
      { email: footerEmail.trim(), source: "footer_cta" },
      { onConflict: "email" }
    );
    setFooterLoading(false);
    setFooterSubmitted(true);
    trackEmailCaptured("footer_cta");
    sendNotification("newsletter", { email: footerEmail.trim() });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Values Formation for Families, Schools & Organizations"
        description="Discover your core values and build cultures of connection, delight, and belonging. Start your free values assessment today."
        path="/"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={localBusinessSchema} />

      <Navigation />
      <ExitIntentPopup onStartQuiz={startQuiz} />
      <LeadMagnetModal open={showLeadMagnet} onClose={() => setShowLeadMagnet(false)} />
      <WelcomeBack onStartQuiz={startQuiz} />
      <FloatingCTA onClick={startQuiz} />
      <BackToTop />

      <main id="main" className="pt-16">
        {/* ─── HERO ─── */}
        <section id="hero" className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6">
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{ y: videoY }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={heroPoster}
              className="h-full w-full object-cover"
            >
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background/90 backdrop-blur-[3px]"
            style={{ y: overlayY }}
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

            <p className="mt-3 text-xs text-muted-foreground">~10 minutes · guided assessment · 6-value takeaway</p>
          </motion.div>

          {/* Talk to an Adviser — desktop only (mobile uses global sticky CTA) */}
          <motion.a
            href="tel:+16822333559"
            className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="text-sm font-semibold">(682) 233-3559</span>
          </motion.a>
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

            {/* HOLD Framework */}
            <motion.div {...fadeInUp} className="mx-auto mt-14 max-w-3xl">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-8">The HOLD Method</p>
              <div className="grid gap-6 sm:grid-cols-4">
                {[
                  { letter: "H", title: "Honor", desc: "Name the one thing that matters most. Strip away the aspirational list and commit." },
                  { letter: "O", title: "Observe", desc: "Trace the value back to where it's already alive in lived experience — even if no one has noticed." },
                  { letter: "L", title: "Live", desc: "Build the practices, rhythms, and systems that move the value from belief into daily life." },
                  { letter: "D", title: "Declare", desc: "Share it outward. Invite others in. Make the value communal, accountable, and visible." },
                ].map((x, i) => (
                  <motion.div
                    key={x.title}
                    className="rounded-lg border border-border bg-card p-5 text-center"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <span className="text-2xl font-semibold text-primary">{x.letter}</span>
                    <p className="mt-1 text-sm font-semibold text-foreground">{x.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{x.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── WHAT YOU'LL DISCOVER (quiz preview) ─── */}
        <QuizPreview />

        {/* ─── PROGRAMS (commitment ladder) ─── */}
        <HomeProgramCards />

        {/* Social proof (logos + testimonials) will go here once real content is collected */}

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
              Not ready for the assessment yet?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Get our free dinner guide — seven nights of guided family conversation.
            </p>

            <div className="mt-8 mx-auto max-w-md">
              {footerSubmitted ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-primary-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">You're in — here's your free guide:</span>
                  </div>
                  <a
                    href="/seven-conversations-that-matter.pdf"
                    download
                    onClick={() => trackLeadMagnetDownloaded()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary-foreground/15 px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary-foreground/25 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Seven Conversations That Matter (PDF)
                  </a>
                </div>
              ) : (
                <form onSubmit={handleFooterEmail} className="flex gap-2">
                  <input
                    type="text"
                    name="company"
                    value={footerHoneypot}
                    onChange={(e) => setFooterHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    className="h-10 flex-1 rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
                  />
                  <Button type="submit" size="sm" variant="secondary" disabled={footerLoading} className="h-10 px-5 whitespace-nowrap">
                    {footerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Free Guide"}
                  </Button>
                </form>
              )}

              <p className="mt-3 text-[11px] text-primary-foreground/60">
                Seven nights of guided family conversation — plus formation insights and workshop invitations.
              </p>
            </div>

            <div className="mt-8">
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
