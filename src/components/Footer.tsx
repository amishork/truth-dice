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
                { to: "/about", label: "About" },
                { to: "/our-story", label: "Our Story" },
                { to: "/services", label: "Services" },
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
            <p className="label-technical mb-4">Services</p>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>Family Formation</li>
              <li>School Culture Advisory</li>
              <li>Organizational Strategy</li>
              <li>Values Discovery</li>
            </ul>
          </div>

          {/* Newsletter + Contact */}
          <div>
            <p className="label-technical mb-4">Stay Connected</p>
            <p className="text-sm text-muted-foreground mb-3">
              Get insights on values-driven living.
            </p>
            <NewsletterSignup />
            <div className="mt-6 flex flex-col gap-2.5 text-sm text-muted-foreground">
              <a href="mailto:hello@wordsincarnate.com" className="transition-colors hover:text-foreground">
                hello@wordsincarnate.com
              </a>
              <NavLink to="/contact" className="text-primary transition-colors hover:text-primary/80">
                Book a Consultation →
              </NavLink>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Words Incarnate. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Connection · Delight · Belonging
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
