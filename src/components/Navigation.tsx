import { motion } from "framer-motion";
import { NavLink } from "@/components/NavLink";

const Navigation = () => {
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-foreground/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <div className="w-8 h-8 sketch-card flex items-center justify-center relative">
              <div className="absolute top-0 right-0 w-3 h-3 cross-hatch opacity-20 pointer-events-none" />
              <PenTool className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="brand-heading text-lg ink-red">
              Words Incarnate
            </span>
          </NavLink>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/" 
              className="text-foreground/70 hover:text-foreground transition-colors duration-200 font-medium"
              activeClassName="text-primary"
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className="text-foreground/70 hover:text-foreground transition-colors duration-200 font-medium"
              activeClassName="text-primary"
            >
              About
            </NavLink>
            <NavLink 
              to="/services" 
              className="text-foreground/70 hover:text-foreground transition-colors duration-200 font-medium"
              activeClassName="text-primary"
            >
              Services
            </NavLink>
            <NavLink 
              to="/our-story" 
              className="text-foreground/70 hover:text-foreground transition-colors duration-200 font-medium"
              activeClassName="text-primary"
            >
              Our Story
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden flex items-center justify-center w-8 h-8">
            <div className="space-y-1.5">
              <div className="w-5 h-0.5 bg-foreground/70"></div>
              <div className="w-5 h-0.5 bg-foreground/70"></div>
              <div className="w-5 h-0.5 bg-foreground/70"></div>
            </div>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;