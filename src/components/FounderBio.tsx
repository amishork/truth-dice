import { motion } from "framer-motion";
import founderPhoto from "@/assets/founder-photo.jpg";

const FounderBio = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-[280px_1fr]">
          {/* Photo */}
          <motion.div
            className="relative mx-auto w-[220px] md:mx-0 md:w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-[4/5] overflow-hidden rounded-xl border border-border">
              <img
                src={founderPhoto}
                alt="Founder of Words Incarnate"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Decorative offset border */}
            <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-xl border border-primary/20" />
          </motion.div>

          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Meet the Founder
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              A Life Rooted in Formation
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground">
              <p>
                Words Incarnate was born from a deeply personal conviction: that our highest values
                should shape the texture of our everyday lives—not just live on a wall or in a
                mission statement.
              </p>
              <p>
                With over 15 years of experience in education, leadership formation, and
                organizational consulting, our founder has walked alongside hundreds of families,
                schools, and communities as they move from aspiration to incarnation.
              </p>
              <p className="text-muted-foreground">
                Drawing from classical wisdom, Catholic anthropology, and years of lived experience
                in both the classroom and the boardroom, Words Incarnate brings a rare combination
                of intellectual depth and practical warmth to every engagement.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {["B.A. Philosophy, University of Dallas", "Seminary Formation", "15+ Years Formation Work"].map((cred) => (
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
