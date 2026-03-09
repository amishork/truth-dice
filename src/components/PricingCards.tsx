import { motion } from "framer-motion";
import { Check, Users, GraduationCap, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    icon: User,
    name: "Individual",
    tagline: "Personal clarity",
    tiers: [
      { level: "Tier I", price: "$150", desc: "Values Discovery session" },
      { level: "Tier II", price: "$450", desc: "3-session deep dive" },
      { level: "Tier III", price: "$900", desc: "Ongoing coaching (monthly)" },
    ],
    features: [
      "Guided values discovery",
      "Personal values profile",
      "AI-powered reflection",
      "Action plan & accountability",
    ],
  },
  {
    icon: Users,
    name: "Family",
    tagline: "Shared foundation",
    popular: true,
    tiers: [
      { level: "Tier I", price: "$300", desc: "Family values workshop" },
      { level: "Tier II", price: "$800", desc: "3-session family formation" },
      { level: "Tier III", price: "$1,500", desc: "Quarterly family coaching" },
    ],
    features: [
      "Family values alignment",
      "Age-appropriate activities",
      "Conflict resolution framework",
      "Family mission statement",
      "Ongoing support & check-ins",
    ],
  },
  {
    icon: GraduationCap,
    name: "School",
    tagline: "Culture of delight",
    tiers: [
      { level: "Tier I", price: "$1,200", desc: "Staff workshop (half-day)" },
      { level: "Tier II", price: "$3,500", desc: "Semester-long program" },
      { level: "Tier III", price: "$8,000", desc: "Full-year transformation" },
    ],
    features: [
      "Student values programs",
      "Teacher professional development",
      "School culture assessment",
      "Curriculum integration",
      "Parent engagement workshops",
    ],
  },
  {
    icon: Building,
    name: "Organization",
    tagline: "Purposeful performance",
    tiers: [
      { level: "Tier I", price: "$2,000", desc: "Leadership workshop" },
      { level: "Tier II", price: "$6,000", desc: "Team alignment program" },
      { level: "Tier III", price: "Custom", desc: "Enterprise transformation" },
    ],
    features: [
      "Leadership values coaching",
      "Team alignment workshops",
      "Culture assessment & strategy",
      "Values-based decision frameworks",
      "Ongoing advisory partnership",
    ],
  },
];

const PricingCards = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
            Investment in What Matters
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Every engagement is tailored. Choose a starting point that matches your context and depth.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.name}
                className={`sketch-card p-6 flex flex-col ${
                  tier.popular ? "ring-2 ring-primary" : ""
                }`}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              >
                {tier.popular && (
                  <span className="mb-3 self-start rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground">{tier.tagline}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {tier.tiers.map((t) => (
                    <div
                      key={t.level}
                      className="flex items-baseline justify-between rounded-md bg-muted/50 px-3 py-2"
                    >
                      <span className="text-xs font-medium text-muted-foreground">{t.level}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-foreground">{t.price}</span>
                        <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.popular ? "default" : "outline"}
                  className="w-full"
                  onClick={() => (window.location.href = "/contact")}
                >
                  Get Started
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingCards;
