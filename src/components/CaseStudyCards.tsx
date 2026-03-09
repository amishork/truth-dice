import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const caseStudies = [
  {
    tag: "Family",
    title: "The Donovan Family",
    before: "Frequent conflict, screens replacing conversation, disconnected dinner tables.",
    after: "Weekly family council, shared value rituals, kids initiating gratitude practices.",
    pullQuote: "Our kids now remind us of our values before we remind them.",
    metric: "6 months of formation",
  },
  {
    tag: "School",
    title: "Holy Cross Academy",
    before: "Staff burnout, mission statements on walls but not in hallways.",
    after: "Teacher-led formation groups, student ambassadors, 40% drop in disciplinary incidents.",
    pullQuote: "We went from policing behavior to cultivating character.",
    metric: "1 academic year",
  },
  {
    tag: "Organization",
    title: "Caritas Regional Network",
    before: "Siloed departments, competing priorities, volunteer fatigue.",
    after: "Unified values framework, cross-team retreats, 2× volunteer retention.",
    pullQuote: "We finally have a shared language for why we do what we do.",
    metric: "9-month engagement",
  },
];

const CaseStudyCards = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-foreground">Transformation Stories</h2>
          <p className="mt-3 text-muted-foreground">
            Real families, schools, and organizations who moved from aspiration to incarnation.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {caseStudies.map((cs, i) => (
            <motion.div
              key={cs.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              {/* Tag */}
              <div className="border-b border-border px-6 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  {cs.tag}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">• {cs.metric}</span>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground">{cs.title}</h3>

                {/* Before / After */}
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-destructive/70">Before</p>
                    <p className="mt-1 text-sm text-muted-foreground">{cs.before}</p>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="h-4 w-4 text-primary/50" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">After</p>
                    <p className="mt-1 text-sm text-muted-foreground">{cs.after}</p>
                  </div>
                </div>

                {/* Pull quote */}
                <div className="mt-6 border-l-2 border-primary/30 pl-4">
                  <p className="text-sm italic text-foreground">"{cs.pullQuote}"</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudyCards;
