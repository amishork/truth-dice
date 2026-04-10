import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { productSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Gift, Users, MessageCircle } from "lucide-react";

const SHOPIFY_URL =
  "https://words-incarnate.myshopify.com/products/values-dice-conversation-game-custom-engraved?variant=43386798473290";

const features = [
  {
    icon: Gift,
    title: "Custom Engraved",
    description: "Your 6 personal core values laser-engraved on premium dice — no two sets are alike.",
  },
  {
    icon: Users,
    title: "For Any Group",
    description: "Families at dinner, teams at offsites, friends around a fire. Roll and go.",
  },
  {
    icon: MessageCircle,
    title: "Conversation Starter",
    description: "One die shows your values, the other shows contexts — hope, fear, person, place, object, experience. Each roll sparks a different story.",
  },
];

const Dice = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Values Dice"
        description="A conversation game with your 6 core values custom engraved. Roll the dice to spark meaningful conversations with family, friends, and teams."
        path="/dice"
      />
      <JsonLd data={productSchema} />
      <Navigation />

      <main id="main" className="container mx-auto px-4 pt-24 pb-20">
        {/* Hero */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div
              className="overflow-hidden rounded-2xl bg-white"
              style={{ animation: "fadeSlideUp 0.5s ease-out forwards" }}
            >
              <img
                src="/dice-product.png"
                alt="Words Incarnate Values Dice — custom engraved conversation game with box"
                className="w-full h-auto"
                loading="eager"
              />
            </div>

            <div style={{ animation: "fadeSlideUp 0.6s ease-out forwards" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                The Original Values Dice
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
                A Conversation Game About Values
              </h1>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                An easy-to-play dice game with your 6 personal core values custom
                engraved on each face. Roll the dice to spark meaningful
                conversations with family, friends, and teams.
              </p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">$49</span>
                <span className="text-sm text-muted-foreground">per set · includes 2 dice + game instructions</span>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="gap-2">
                  <a href={SHOPIFY_URL} target="_blank" rel="noopener noreferrer">
                    <ShoppingCart className="h-4 w-4" />
                    Order Your Set
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="/quiz">Take the Quiz First</a>
                </Button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Don't know your core values yet?{" "}
                <a href="/quiz" className="text-primary underline hover:text-primary/80">
                  Take our free values assessment
                </a>{" "}
                — then order your custom set.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div
            className="mt-20"
            style={{ animation: "fadeSlideUp 0.7s ease-out forwards" }}
          >
            <h2 className="text-center text-2xl font-semibold text-foreground">
              How It Works
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* What's in the Box */}
          <div
            className="mt-20 rounded-xl border border-border bg-card p-8 mx-auto max-w-2xl"
            style={{ animation: "fadeSlideUp 0.8s ease-out forwards" }}
          >
            <h2 className="text-xl font-semibold text-foreground">What's in the Box</h2>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span><strong className="text-foreground">1 Values Die (white)</strong> — your 6 core values, one per face, custom laser-engraved</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span><strong className="text-foreground">1 Context Die (black)</strong> — 6 conversation contexts: hope, fear, person, place, physical object, experience</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span><strong className="text-foreground">Game Instructions</strong> — simple rules to help groups share openly and listen actively</span>
              </li>
            </ul>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p className="text-lg text-muted-foreground">
              Name what you love. Then put it in your hands.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="gap-2">
                <a href={SHOPIFY_URL} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="h-4 w-4" />
                  Order Your Set — $49
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dice;
