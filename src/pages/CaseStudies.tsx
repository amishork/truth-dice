import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { ArrowRight, Construction, GraduationCap, Users, Building } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

type Segment = "all" | "school" | "family" | "organization";

interface CaseStudyPreview {
  slug: string;
  title: string;
  client_name: string;
  segment: "school" | "family" | "organization";
  challenge_summary: string;
  outcome_summary: string;
  engagement_duration: string;
  placeholder: boolean;
}

// Placeholder case studies — these demonstrate the template structure.
// Replace with Supabase data once the case_studies table is populated.
const placeholderStudies: CaseStudyPreview[] = [
  {
    slug: "catholic-school-charism-integration",
    title: "From Mission Statement to Lived Charism",
    client_name: "Catholic High School — Diocese of Fort Worth",
    segment: "school",
    challenge_summary: "Faculty couldn't articulate how the school's founding charism connected to daily classroom practice. Student culture had drifted toward compliance rather than formation.",
    outcome_summary: "Shared values vocabulary adopted by 90% of faculty within one semester. Student discipline referrals decreased as values-based conversations replaced punitive responses.",
    engagement_duration: "Full academic year",
    placeholder: true,
  },
  {
    slug: "family-values-charter",
    title: "Building a Family Culture on Purpose",
    client_name: "The M. Family — Fort Worth, TX",
    segment: "family",
    challenge_summary: "Two working parents with three children under 10, feeling like family life was reactive rather than intentional. Values conversations happened only during conflict.",
    outcome_summary: "Family charter created and displayed in the home. Weekly family council established. Children began using values language independently within two months.",
    engagement_duration: "3-session formation",
    placeholder: true,
  },
  {
    slug: "nonprofit-culture-alignment",
    title: "Aligning Leadership Around Mission",
    client_name: "Regional Catholic Nonprofit",
    segment: "organization",
    challenge_summary: "Executive team had grown from 3 to 12 in two years. Rapid growth created competing priorities and inconsistent decision-making across departments.",
    outcome_summary: "Values-based decision framework adopted organization-wide. Leadership alignment measurably improved. Onboarding process rebuilt around articulated culture commitments.",
    engagement_duration: "6-month engagement",
    placeholder: true,
  },
];

const segmentIcon = {
  school: GraduationCap,
  family: Users,
  organization: Building,
};

const segmentLabel = {
  school: "School",
  family: "Family",
  organization: "Organization",
};

const CaseStudies = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Segment>("all");

  const filtered = filter === "all"
    ? placeholderStudies
    : placeholderStudies.filter((s) => s.segment === filter);

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Case Studies | Words Incarnate"
        description="See how the HOLD method has been applied across schools, families, and organizations. Real engagements, real outcomes."
        path="/case-studies"
      />
      <JsonLd data={webPageSchema("Case Studies | Words Incarnate", "Real engagements, real outcomes from the HOLD method.", "/case-studies")} />
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
              <p className="label-technical mb-3">Results</p>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Case Studies
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                How the HOLD method works in practice — across schools, families,
                and organizations.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ─── COMING SOON BANNER ─── */}
        <div className="bg-primary/10 border-y border-primary/20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-center gap-3">
            <Construction className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Case studies publishing soon.</span>{" "}
              The examples below illustrate the type of work we do.{" "}
              <button
                onClick={() => navigate("/contact")}
                className="text-primary hover:underline font-medium"
              >
                Request a proposal
              </button>{" "}
              to learn about our current engagements.
            </p>
          </div>
        </div>

        {/* ─── FILTER + GRID ─── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {/* Filter tabs */}
            <div className="flex justify-center gap-2 mb-12">
              {(["all", "school", "family", "organization"] as Segment[]).map((seg) => (
                <button
                  key={seg}
                  onClick={() => setFilter(seg)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === seg
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {seg === "all" ? "All" : segmentLabel[seg]}
                </button>
              ))}
            </div>

            {/* Case study cards */}
            <div className="mx-auto max-w-4xl grid gap-8">
              {filtered.map((study, i) => {
                const Icon = segmentIcon[study.segment];
                return (
                  <motion.div
                    key={study.slug}
                    className="sketch-card p-8 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    {study.placeholder && (
                      <div className="absolute top-4 right-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                          Sample
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {segmentLabel[study.segment]}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground">{study.title}</h3>
                    <p className="mt-1 text-sm text-primary">{study.client_name}</p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Challenge</p>
                        <p className="text-sm text-foreground leading-relaxed">{study.challenge_summary}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Outcome</p>
                        <p className="text-sm text-foreground leading-relaxed">{study.outcome_summary}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{study.engagement_duration}</p>
                      {!study.placeholder && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="group"
                          onClick={() => navigate(`/case-studies/${study.slug}`)}
                        >
                          Read Full Study
                          <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

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
              Ready to become the next case study?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Tell us about your context and we'll scope a custom engagement.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/contact")}
              >
                Request a Proposal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default CaseStudies;
