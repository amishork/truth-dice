import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold text-foreground">About</h1>
          <p className="mt-4 text-muted-foreground">Connection. Delight. Belonging.</p>

          <div className="mt-10 space-y-5 text-foreground leading-relaxed">
            <p>
              Words Incarnate exists to help people name what they love—and build lives and cultures that embody it.
            </p>
            <p>
              We work with families, schools, and organizations to translate values from “ideas we agree with” into
              practices that shape daily life.
            </p>
            <p>
              Our approach treats strategy as formation: aligning belief, behavior, and the lived experiences that
              become culture.
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-card p-8">
            <h2 className="text-2xl font-semibold text-foreground">How we serve</h2>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              <li>Formation experiences designed for real life (not just retreats or slogans).</li>
              <li>Values discovery that produces clarity you can act on immediately.</li>
              <li>Practical rhythms that rebuild presence, joy, and shared purpose.</li>
            </ul>
            <div className="mt-8">
              <Button asChild>
                <a href="/">Start values discovery</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
