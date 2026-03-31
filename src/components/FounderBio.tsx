import { motion } from "framer-motion";
import founderPhoto from "@/assets/founder-photo.webp";

const FounderBio = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-[260px_1fr]">
          {/* Photo */}
          <motion.div
            className="relative mx-auto w-[220px] md:mx-0 md:w-[260px]"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square overflow-hidden rounded-full shadow-[0_8px_40px_-12px_hsl(var(--primary)/0.25)]">
              <img
                src={founderPhoto}
                alt="Alex Mishork, Founder of Words Incarnate"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Subtle ring accent */}
            <div className="absolute -inset-2 -z-10 rounded-full border border-primary/10" />
          </motion.div>

          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Founder & Formation Director
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              Alex Mishork
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground">
              <p>
                Alex studied philosophy at the University of Dallas and spent five years in
                seminary formation before discerning marriage. That combination — rigorous
                classical training and deep personal formation — is the foundation of everything
                Words Incarnate does.
              </p>
              <p>
                Before founding Words Incarnate, Alex managed 30–40 direct reports in
                production and warehouse operations at Abbott Laboratories, then served as
                Director of Branding &amp; Strategic Programming at Nolan Catholic High School,
                where he built formation programs, curriculum, and institutional identity
                from the ground up.
              </p>
              <p className="text-muted-foreground">
                He brings a rare combination: the intellectual depth of the classical Catholic
                tradition (Aquinas, Chesterton, Pieper) with the operational discipline of
                scaling real organizations. Husband to Dani, father to Joel, and committed
                to the conviction that our highest values should shape the texture of
                everyday life — not just live on a wall.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                "B.A. Philosophy, University of Dallas",
                "5 Years Seminary Formation",
                "Director, Nolan Catholic High School",
                "Operations, Abbott Laboratories",
              ].map((cred) => (
                <span
                  key={cred}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {cred}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FounderBio;
