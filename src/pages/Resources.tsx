import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { trackLeadMagnetDownloaded } from "@/lib/analytics";
import { Download, FileText, BookOpen, GraduationCap, Users, Loader2, CheckCircle2, X } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  fileUrl: string | null; // null = coming soon
  category: string;
}

const resources: Resource[] = [
  {
    id: "seven-conversations",
    title: "Seven Conversations That Matter",
    description: "A practical guide to the seven conversations every family, school, and organization needs to have about values — with prompts, frameworks, and next steps.",
    icon: BookOpen,
    fileUrl: "/seven-conversations-that-matter.pdf",
    category: "Guide",
  },
  {
    id: "hold-overview",
    title: "The HOLD Method: A One-Page Overview",
    description: "A concise summary of the Honor, Observe, Live, Declare framework — what it is, how it works, and what it produces. Ideal for sharing with stakeholders.",
    icon: FileText,
    fileUrl: null,
    category: "Overview",
  },
  {
    id: "school-program",
    title: "School Formation Programs: What to Expect",
    description: "A detailed one-pager for administrators and decision-makers outlining engagement models, outcomes, and investment ranges for school partnerships.",
    icon: GraduationCap,
    fileUrl: null,
    category: "Schools",
  },
  {
    id: "family-formation",
    title: "Family Formation: Getting Started",
    description: "A short guide for families considering values formation work — what to expect, how to prepare, and three exercises you can do tonight.",
    icon: Users,
    fileUrl: null,
    category: "Families",
  },
];

const Resources = () => {
  const [showGate, setShowGate] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

  const handleDownload = (resource: Resource) => {
    if (!resource.fileUrl) return;

    // Check if already captured in this session
    if (downloaded.has(resource.id)) {
      window.open(resource.fileUrl, "_blank");
      return;
    }

    setShowGate(resource.id);
  };

  const handleGateSubmit = async (resourceId: string) => {
    if (!email.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("email_captures").upsert(
      { email: email.trim(), name: name.trim() || null, source: `resource_${resourceId}` },
      { onConflict: "email" }
    );

    if (!error) {
      sendNotification("lead_magnet", { email: email.trim(), name: name.trim() || null });
      trackLeadMagnetDownloaded();
      setDownloaded((prev) => new Set(prev).add(resourceId));

      const resource = resources.find((r) => r.id === resourceId);
      if (resource?.fileUrl) {
        window.open(resource.fileUrl, "_blank");
      }
    }

    setLoading(false);
    setShowGate(null);
    setEmail("");
    setName("");
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Resources | Words Incarnate"
        description="Free guides, frameworks, and tools for values formation in families, schools, and organizations. Download the HOLD method overview, conversation guides, and more."
        path="/resources"
      />
      <JsonLd data={webPageSchema("Resources | Words Incarnate", "Free guides and tools for values formation.", "/resources")} />
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
              <p className="label-technical mb-3">Free Resources</p>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Tools for the work.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Practical guides, frameworks, and starting points for families, schools,
                and organizations doing values formation work.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── RESOURCES GRID ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2">
              {resources.map((resource, i) => {
                const Icon = resource.icon;
                const available = !!resource.fileUrl;
                return (
                  <motion.div
                    key={resource.id}
                    className="sketch-card p-6 flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        {resource.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{resource.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                      {resource.description}
                    </p>
                    <div className="mt-6">
                      {available ? (
                        <Button
                          variant="outline"
                          className="w-full group"
                          onClick={() => handleDownload(resource)}
                        >
                          {downloaded.has(resource.id) ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                              Download Again
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download Free
                            </>
                          )}
                        </Button>
                      ) : (
                        <p className="text-center text-xs text-muted-foreground py-2">
                          Coming soon
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ─── EMAIL GATE MODAL ─── */}
      {showGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            className="relative w-full max-w-md rounded-xl border border-border bg-background p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => { setShowGate(null); setEmail(""); setName(""); }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-semibold text-foreground">
              Where should we send it?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Drop your email and the download will start immediately.
            </p>
            <div className="mt-6 space-y-3">
              <Input
                placeholder="Your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGateSubmit(showGate)}
              />
              <Button
                className="w-full"
                disabled={!email.trim() || loading}
                onClick={() => handleGateSubmit(showGate)}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Now
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No spam. We'll occasionally share formation insights.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Resources;
