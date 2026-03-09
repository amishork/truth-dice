import { motion } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { Flame, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/our-story", label: "Our Story" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

const Navigation = () => {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-3">
          <Flame className="h-4 w-4 text-primary" />
          <span className="wi-navwordmark">WORDS INCARNATE</span>
        </NavLink>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeClassName="active text-foreground"
            >
              {item.label}
              <span className="pointer-events-none absolute -bottom-2 left-0 h-px w-full scale-x-0 bg-foreground/60 transition-transform duration-200 [transform-origin:left] group-[.active]:scale-x-100" />
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <CartDrawer />
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Flame className="h-4 w-4 text-primary" />
                  <span className="wi-navwordmark">WORDS INCARNATE</span>
                </div>

                <div className="h-px w-full bg-border" />

                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className="text-base font-medium text-muted-foreground"
                      activeClassName="text-foreground"
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
