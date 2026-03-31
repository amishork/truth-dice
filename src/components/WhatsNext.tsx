import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User, Users, GraduationCap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WhatsNextProps {
  coreValues?: string[];
}

const paths = [
  {
    id: "personal",
    icon: User,
    label: "For Myself",
    desc: "Go deeper into your values with a guided personal workshop.",
    offering: "Personal Values Discovery Workshop",
    detail: "A live, 1-on-1 formation session where you move from naming your values to building a concrete plan for living them.",
    cta: "Apply Now",
    href: "/contact",
    param: "personal",
  },
  {
    id: "family",
    icon: Users,
    label: "For My Family",
    desc: "Build a shared values language your whole family can live by.",
    offering: "Family Foundations Journey",
    detail: "Three workshops over six weeks. Your family discovers shared values, creates a family mission, and builds rituals that stick.",
    cta: "Apply Now",
    href: "/contact",
    param: "family",
  },
  {
    id: "institution",
    icon: GraduationCap,
    label: "For My School or Organization",
    desc: "Give your institution a values architecture people actually feel.",
    offering: "School & Organization Formation",
    detail: "Faculty workshops, student programs, and strategic consulting to align your institution's lived culture with its stated mission.",
    cta: "Request a Proposal",
    href: "/contact",
    param: "school",
  },
];

const WhatsNext = ({ coreValues }: WhatsNextProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  const activePath = paths.find((p) => p.id === selected);

  return (
    <div className="sketch-card p-5">
      <p className="label-technical mb-1">What's Next</p>
      <p className="text-xs text-muted-foreground mb-4">
        You've discovered your values. Now put them to work.
      </p>

      <div className="space-y-2">
        {paths.map((path) => {
          const Icon = path.icon;
          const isActive = selected === path.id;
          return (
            <button
              key={path.id}
              onClick={() => setSelected(isActive ? null : path.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                isActive
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                isActive ? "bg-primary/20" : "bg-muted"
              }`}>
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {path.label}
                </p>
                <p className="text-[11px] text-muted-foreground/70 truncate">{path.desc}</p>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-transform ${
                isActive ? "rotate-90" : ""
              }`} />
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activePath && (
          <motion.div
            key={activePath.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">{activePath.offering}</p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{activePath.detail}</p>
              {coreValues && coreValues.length > 0 && (
                <p className="mt-3 text-[11px] text-muted-foreground/70 italic">
                  Your values — {coreValues.slice(0, 3).join(", ")} — become the foundation.
                </p>
              )}
              <Button
                size="sm"
                className="mt-4 w-full group"
                onClick={() => navigate(`${activePath.href}?interest=${activePath.param}`)}
              >
                {activePath.cta}
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsNext;
