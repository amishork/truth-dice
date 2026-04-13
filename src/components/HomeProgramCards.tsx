import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Users, GraduationCap, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const programs = [
  {
    icon: Sparkles,
    step: "Start here",
    name: "Free Values Assessment",
    desc: "A guided 5-minute experience that reveals your 6 core values — the ones already shaping your decisions.",
    cta: "Take the Assessment",
    ctaVariant: "default" as const,
    href: "/quiz",
    free: true,
  },
  {
    icon: Video,
    step: "Experience the work",
    name: "Free Workshop",
    desc: "A live, interactive session where you experience values formation firsthand. No commitment — just come curious.",
    cta: "Get Notified",
    ctaVariant: "outline" as const,
    href: "/workshop",
    free: true,
  },
  {
    icon: Users,
    step: "Go deeper",
    name: "Paid Formation Programs",
    desc: "Personal workshops, family formation journeys, and institutional consulting — tailored to your context.",
    cta: "View Programs",
    ctaVariant: "outline" as const,
    href: "/how-we-work",
    free: false,
  },
];

const HomeProgramCards = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="label-technical mb-3">How It Works</p>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Start free. Go as deep as you want.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every engagement begins with discovery. No commitment until you've experienced the work.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {programs.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.name}
                className={`sketch-card relative flex flex-col p-6 ${
                  i === 0 ? "ring-2 ring-primary" : ""
                }`}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                {p.free && (
                  <span className="mb-3 self-start rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                    Free
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.step}
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {p.desc}
                </p>

                <Button
                  variant={p.ctaVariant}
                  className="mt-6 w-full group"
                  onClick={() => navigate(p.href)}
                >
                  {p.cta}
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Connector line visual on desktop */}
        <div className="hidden md:flex items-center justify-center mt-8 gap-2 text-muted-foreground/50">
          <div className="h-px w-16 bg-border" />
          <p className="text-xs">free assessment → free workshop → paid programs</p>
          <div className="h-px w-16 bg-border" />
        </div>
      </div>
    </section>
  );
};

export default HomeProgramCards;
