import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { getUtmPayload } from "@/lib/utm";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Loader2, Clock, Users, Video } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

const FreeWorkshop = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Fetch workshop config from dashboard_config
  const [workshopDate, setWorkshopDate] = useState<string | null>(null);
  const [workshopScheduled, setWorkshopScheduled] = useState(false);
  const [workshopCapacity, setWorkshopCapacity] = useState(20);

  useEffect(() => {
    supabase
      .from("dashboard_config")
      .select("key, value")
      .in("key", ["workshop_date", "workshop_capacity"])
      .then(({ data }) => {
        if (data) {
          for (const row of data) {
            if (row.key === "workshop_date" && row.value) {
              const d = new Date(String(row.value));
              if (!isNaN(d.getTime()) && d > new Date()) {
                setWorkshopDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
                setWorkshopScheduled(true);
              }
            }
            if (row.key === "workshop_capacity" && row.value) {
              setWorkshopCapacity(Number(row.value) || 20);
            }
          }
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (honeypot) return;

    setLoading(true);
    const { error } = await supabase.from("email_captures").upsert(
      { email: email.trim(), name: name.trim() || null, source: "free_workshop", ...getUtmPayload() },
      { onConflict: "email" }
    );
    setLoading(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    sendNotification("newsletter", { email: email.trim(), name: name.trim() || null });
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Free Workshop | Words Incarnate"
        description="Experience the work before you commit. Join a free live values formation workshop — open to families, educators, and leaders."
        path="/workshop"
      />
      <JsonLd data={webPageSchema("Free Workshop | Words Incarnate", "Experience the work before you commit. Join a free live values formation workshop — open to families, educators, and leaders.", "/workshop")} />
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
              <p className="label-technical mb-3">Experience the Work</p>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Free workshops and Q&As.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Get a real taste of values formation before you commit to anything.
                Live, interactive, and led by Alex — open to anyone exploring what it
                means to live with intention.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── SCARCITY / NEXT SESSION ─── */}
        {workshopScheduled && (
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                Next Live Session
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {workshopDate}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Limited to {workshopCapacity} participants per session to keep conversation personal.
              </p>
              <div className="mt-4">
                <Button
                  size="lg"
                  onClick={() => document.getElementById("workshop-signup")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Reserve Your Spot
                </Button>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ─── WHAT TO EXPECT ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-semibold text-foreground text-center mb-12">
                What to expect
              </h2>
              <div className="grid gap-8 sm:grid-cols-3">
                {[
                  {
                    icon: Clock,
                    title: "60–90 minutes",
                    desc: "A focused, live session — not a webinar. Real conversation, real exercises, real takeaways.",
                  },
                  {
                    icon: Video,
                    title: "Live on Zoom",
                    desc: "Join from anywhere. Camera optional, participation encouraged. Interactive throughout.",
                  },
                  {
                    icon: Users,
                    title: "Open Q&A",
                    desc: "Bring your questions about values, family formation, school culture, or anything on your mind.",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── SIGNUP ─── */}
        <section id="workshop-signup" className="bg-card py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-md text-center">
              <h2 className="text-3xl font-semibold text-foreground">
                {workshopScheduled
                  ? `Register for ${workshopDate}`
                  : "Get notified when the next workshop is scheduled."}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {workshopScheduled
                  ? `Limited to ${workshopCapacity} participants. Drop your info below to reserve your spot.`
                  : "Workshops are scheduled periodically. Drop your email and you'll be the first to know."}
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="mt-8 space-y-3 text-left">
                  <input
                    type="text"
                    name="company"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
                    aria-hidden="true"
                  />
                  <Input
                    placeholder="Your first name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background"
                  />
                  <Input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background"
                  />
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {workshopScheduled ? "Reserve My Spot" : "Notify Me"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 rounded-xl border border-border bg-background p-8"
                >
                  <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {workshopScheduled ? "You're registered." : "You're on the list."}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {workshopScheduled
                      ? `We'll send you the details for the ${workshopDate} session.`
                      : "We'll email you as soon as the next workshop is scheduled."}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ─── MEANWHILE CTA ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                Can't wait? Start now.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Take the free values assessment — 10 minutes to discover the 6 values
                that are already shaping your decisions.
              </p>
              <Button size="lg" className="mt-8" onClick={() => navigate("/quiz")}>
                Free Values Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FreeWorkshop;
