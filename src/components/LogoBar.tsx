import { motion } from "framer-motion";

/** Partner logos / names displayed as a trust signal.
 *  Replace text entries with <img> tags once real logo files are available
 *  in Supabase storage or /public. */
const partners = [
  { name: "Nolan Catholic High School" },
  { name: "Oklahoma Catholic Women's Conference" },
  { name: "Diocese of Fort Worth" },
];

const LogoBar = () => {
  return (
    <section className="py-8 border-b border-border">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5">
            Trusted By
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {partners.map((p) => (
              <span
                key={p.name}
                className="text-sm font-medium text-muted-foreground/70 whitespace-nowrap"
              >
                {p.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LogoBar;
