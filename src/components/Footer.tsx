import { Flame } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import NewsletterSignup from "@/components/NewsletterSignup";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <span className="wi-navwordmark">Words Incarnate</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Formation, strategy, and experience design for families, schools, and organizations.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="label-technical mb-4">Navigate</p>
            <nav className="flex flex-col gap-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/how-we-work", label: "How We Work" },
                { to: "/about", label: "About" },
                { to: "/testimonials", label: "Wall of Love" },
                { to: "/contact", label: "Contact" },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <p className="label-technical mb-4">Who We Serve</p>
            <nav className="flex flex-col gap-2.5">
              <NavLink to="/schools" className="text-sm text-muted-foreground transition-colors hover:text-foreground">For Schools</NavLink>
              <NavLink to="/families" className="text-sm text-muted-foreground transition-colors hover:text-foreground">For Families</NavLink>
              <NavLink to="/organizations" className="text-sm text-muted-foreground transition-colors hover:text-foreground">For Organizations</NavLink>
              <NavLink to="/case-studies" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Case Studies</NavLink>
              <NavLink to="/quiz" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Free Values Assessment</NavLink>
            </nav>
          </div>

          {/* Newsletter + Contact */}
          <div>
            <p className="label-technical mb-4">Stay Connected</p>
            <p className="text-sm text-muted-foreground mb-3">
              Get insights on values-driven living.
            </p>
            <NewsletterSignup />
            <div className="mt-6 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <a href="mailto:alex@wordsincarnate.com" className="transition-colors hover:text-foreground">
                alex@wordsincarnate.com
              </a>
              <NavLink to="/contact" className="text-primary transition-colors hover:text-primary/80">
                Request a Proposal →
              </NavLink>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Words Incarnate. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <NavLink to="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</NavLink>
            <NavLink to="/terms" className="transition-colors hover:text-foreground">Terms of Service</NavLink>
          </div>
          <p className="text-xs text-muted-foreground">
            Honor · Observe · Live · Declare
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
