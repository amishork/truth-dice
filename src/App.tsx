import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";
import CookieConsent from "./components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/contexts/AuthContext";

import MobilePhoneCTA from "./components/MobilePhoneCTA";

const queryClient = new QueryClient();

// Code-split all routes
const Index = lazy(() => import("./pages/Index"));
const Quiz = lazy(() => import("./pages/Quiz"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const HowWeWork = lazy(() => import("./pages/HowWeWork"));
const HoldGuide = lazy(() => import("./pages/HoldGuide"));
const Families = lazy(() => import("./pages/Families"));
const Organizations = lazy(() => import("./pages/Organizations"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Contact = lazy(() => import("./pages/Contact"));
const Schools = lazy(() => import("./pages/Schools"));
const WallOfLove = lazy(() => import("./pages/WallOfLove"));
const ShareExperience = lazy(() => import("./pages/ShareExperience"));
const FreeWorkshop = lazy(() => import("./pages/FreeWorkshop"));
const ValuesReveal = lazy(() => import("./pages/ValuesReveal"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Admin = lazy(() => import("./pages/Admin"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Dice = lazy(() => import("./pages/Dice"));

const PageLoader = () => (
  <div className="min-h-screen bg-background">
    <div className="h-16 border-b border-border" />
    <div className="mx-auto max-w-3xl px-6 pt-12 space-y-6">
      <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-48 w-full animate-pulse rounded-lg bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const hidePhoneCTA = ["/quiz", "/admin", "/v"].some((p) => location.pathname.startsWith(p));

  return (
    <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/our-story" element={<Navigate to="/about" replace />} />
          <Route path="/how-we-work" element={<PageTransition><HowWeWork /></PageTransition>} />
          <Route path="/hold" element={<PageTransition><HoldGuide /></PageTransition>} />
          <Route path="/services" element={<Navigate to="/how-we-work" replace />} />
          <Route path="/families" element={<PageTransition><Families /></PageTransition>} />
          <Route path="/organizations" element={<PageTransition><Organizations /></PageTransition>} />
          <Route path="/case-studies" element={<PageTransition><CaseStudies /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/schools" element={<PageTransition><Schools /></PageTransition>} />
          <Route path="/testimonials" element={<PageTransition><WallOfLove /></PageTransition>} />
          <Route path="/testimonials/share" element={<PageTransition><ShareExperience /></PageTransition>} />
          <Route path="/workshop" element={<PageTransition><FreeWorkshop /></PageTransition>} />
          <Route path="/v" element={<ValuesReveal />} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
          <Route path="/dice" element={<PageTransition><Dice /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
        {!hidePhoneCTA && <MobilePhoneCTA />}
    </Suspense>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AuthProvider>
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
              <CookieConsent />
            </BrowserRouter>
            <Analytics />
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
