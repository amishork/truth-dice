import { motion } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { Flame, Menu, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import { useCartStore } from "@/stores/cartStore";
import { useCartSync } from "@/hooks/useCartSync";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/our-story", label: "Our Story" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

interface NavigationProps {
  quizMode?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ quizMode = false }) => {
  useCartSync();
  const cartItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  const emailInitial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-border backdrop-blur-sm transition-all duration-500 ${
        quizMode
          ? "bg-background/60 opacity-70 hover:opacity-100"
          : "bg-background/95"
      }`}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-3">
          <Flame className="h-4 w-4 text-primary" />
          <span className="wi-navwordmark">WORDS INCARNATE</span>
        </NavLink>

        {quizMode ? (
          <Button variant="ghost" size="sm" asChild>
            <a href="/">Exit Quiz</a>
          </Button>
        ) : (
          <>
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
              {cartItemCount > 0 && <CartDrawer />}

              {/* Auth UI */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/quiz")}
                    className="text-sm font-medium"
                  >
                    My Values
                  </Button>
                  <button
                    onClick={() => signOut()}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                    title={user?.email}
                  >
                    {emailInitial}
                  </button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/quiz")}
                  className="hidden md:flex text-sm font-medium"
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </Button>
              )}

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
                        <div className="h-px w-full bg-border" />
                        {isAuthenticated ? (
                          <>
                            <button
                              onClick={() => navigate("/quiz")}
                              className="text-left text-base font-medium text-muted-foreground"
                            >
                              My Values
                            </button>
                            <button
                              onClick={() => signOut()}
                              className="text-left text-base font-medium text-muted-foreground"
                            >
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => navigate("/quiz")}
                            className="text-left text-base font-medium text-muted-foreground"
                          >
                            Sign In / Create Account
                          </button>
                        )}
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navigation;
