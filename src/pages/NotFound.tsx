import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  useEffect(() => {
    // Tell search engines not to index 404 pages
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="label-technical">Error</p>
          <h1 className="mt-3 text-5xl font-semibold text-foreground">404</h1>
          <p className="mt-4 text-muted-foreground">This page isn’t available.</p>
          <div className="mt-8 flex justify-center">
            <Button asChild>
              <a href="/">Go to Homepage</a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
