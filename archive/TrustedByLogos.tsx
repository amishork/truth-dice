import { motion } from "framer-motion";

const logos = [
  "Archdiocese of Denver",
  "St. Mary's Academy",
  "Augustine Institute",
  "Regis University",
  "FOCUS Ministries",
  "Holy Family Schools",
  "Frassati Fellowship",
  "Cor Project",
];

const TrustedByLogos = () => {
  return (
    <section className="overflow-hidden border-y border-border bg-muted/50 py-8">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Trusted by schools, parishes &amp; organizations
      </p>
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-muted/50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-muted/50 to-transparent" />

        <motion.div
          className="flex w-max gap-12"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        >
          {[...logos, ...logos].map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex h-10 shrink-0 items-center rounded-md border border-border bg-card px-5"
            >
              <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                {name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedByLogos;
