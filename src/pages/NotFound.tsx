import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

const NotFound = () => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main id="main" className="container mx-auto px-4 pt-32 pb-20">
        <div className="mx-auto max-w-xl text-center">
          <Flame className="mx-auto h-10 w-10 text-primary mb-6" />
          <h1 className="text-6xl font-bold text-foreground tracking-tight">404</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            This page doesn't exist — but your values do.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg">
              <a href="/">Back to Home</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/quiz">Discover Your Values</a>
            </Button>
          </div>
          <p className="mt-12 text-sm text-muted-foreground">
            Looking for something specific? Try{" "}
            <a href="/about" className="text-primary underline hover:text-primary/80">About</a>,{" "}
            <a href="/schools" className="text-primary underline hover:text-primary/80">Schools</a>, or{" "}
            <a href="/testimonials" className="text-primary underline hover:text-primary/80">Testimonials</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
