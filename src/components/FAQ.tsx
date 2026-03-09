import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How long does an engagement typically last?",
    a: "It depends on the tier and context. A Tier I session is a single workshop (1–3 hours). Tier II spans 2–3 months of deeper work. Tier III is an ongoing advisory partnership—often a semester or full year for schools, and quarterly for families and organizations.",
  },
  {
    q: "Is this a faith-based program?",
    a: "Our approach draws on Catholic anthropology and classical wisdom, but we serve families, schools, and organizations of all backgrounds. The values discovery process is universal—rooted in what it means to be human, not a particular creed.",
  },
  {
    q: "What's the difference between the tiers?",
    a: "Tier I provides an introduction and foundational clarity. Tier II goes deeper with multiple sessions, custom strategies, and implementation support. Tier III is a sustained partnership with ongoing coaching, assessment, and culture-building.",
  },
  {
    q: "Can I try the values discovery before committing to a paid engagement?",
    a: "Yes! The interactive values discovery on our homepage is completely free. It gives you a taste of the process and produces a personal 6-value profile you can use immediately.",
  },
  {
    q: "Do you work remotely or in-person?",
    a: "Both. Most discovery sessions and coaching happen virtually. For schools and organizations, we offer in-person workshops and retreats as part of Tier II and III engagements.",
  },
  {
    q: "What results can I expect?",
    a: "Clients leave with concrete tools: a personal or organizational values profile, decision-making frameworks, action plans, and—most importantly—shared language that transforms how they relate, lead, and live together.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Common questions about working with Words Incarnate.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="sketch-card px-6 border-none"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
