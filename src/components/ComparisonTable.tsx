import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const features = [
  { name: "Values Discovery Session", individual: true, family: true, school: true, org: true },
  { name: "Personal Values Profile", individual: true, family: true, school: true, org: true },
  { name: "AI-Powered Reflection", individual: true, family: true, school: true, org: true },
  { name: "Action Plan & Accountability", individual: true, family: true, school: true, org: true },
  { name: "Family Mission Statement", individual: false, family: true, school: false, org: false },
  { name: "Age-Appropriate Activities", individual: false, family: true, school: true, org: false },
  { name: "Conflict Resolution Framework", individual: false, family: true, school: true, org: true },
  { name: "Professional Development", individual: false, family: false, school: true, org: true },
  { name: "Culture Assessment", individual: false, family: false, school: true, org: true },
  { name: "Curriculum Integration", individual: false, family: false, school: true, org: false },
  { name: "Leadership Coaching", individual: false, family: false, school: false, org: true },
  { name: "Team Alignment Workshops", individual: false, family: false, school: false, org: true },
  { name: "Ongoing Advisory Partnership", individual: false, family: false, school: false, org: true },
];

const tiers = [
  { key: "individual" as const, label: "Individual", price: "From $150" },
  { key: "family" as const, label: "Family", price: "From $300", popular: true },
  { key: "school" as const, label: "School", price: "From $1,200" },
  { key: "org" as const, label: "Organization", price: "From $2,000" },
];

const ComparisonTable = () => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

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
            Compare Our Offerings
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Find the right fit for your values journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="overflow-x-auto"
        >
          <div className="min-w-[640px]">
            {/* Header row */}
            <div className="grid grid-cols-5 gap-0 border-b-2 border-border pb-4 mb-2">
              <div className="px-4 py-2">
                <p className="label-technical">Features</p>
              </div>
              {tiers.map((tier) => (
                <div
                  key={tier.key}
                  className={`px-4 py-2 text-center transition-colors rounded-t-lg ${
                    hoveredCol === tier.key ? "bg-primary/5" : ""
                  }`}
                  onMouseEnter={() => setHoveredCol(tier.key)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <p className={`text-sm font-semibold ${tier.popular ? "text-primary" : "text-foreground"}`}>
                    {tier.label}
                  </p>
                  {tier.popular && (
                    <span className="inline-block mt-1 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
                      Popular
                    </span>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{tier.price}</p>
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {features.map((feature, i) => (
              <div
                key={feature.name}
                className={`grid grid-cols-5 gap-0 border-b border-border/50 transition-colors ${
                  hoveredRow === i ? "bg-muted/40" : ""
                }`}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <div className="px-4 py-3 flex items-center">
                  <span className="text-sm text-foreground">{feature.name}</span>
                </div>
                {tiers.map((tier) => {
                  const hasFeature = feature[tier.key];
                  return (
                    <div
                      key={tier.key}
                      className={`px-4 py-3 flex items-center justify-center transition-colors ${
                        hoveredCol === tier.key ? "bg-primary/5" : ""
                      }`}
                      onMouseEnter={() => setHoveredCol(tier.key)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      {hasFeature ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
                        >
                          <Check className="h-5 w-5 text-primary" />
                        </motion.div>
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground/30" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* CTA row */}
            <div className="grid grid-cols-5 gap-0 pt-4">
              <div />
              {tiers.map((tier) => (
                <div key={tier.key} className="px-4 py-2 flex justify-center">
                  <Button
                    variant={tier.popular ? "default" : "outline"}
                    size="sm"
                    className="w-full max-w-[140px]"
                    onClick={() => (window.location.href = "/contact")}
                  >
                    Get Started
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
