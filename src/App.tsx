import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";
import CookieConsent from "./components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

// Code-split all routes
const Index = lazy(() => import("./pages/Index"));
const Quiz = lazy(() => import("./pages/Quiz"));
const About = lazy(() => import("./pages/About"));
const OurStory = lazy(() => import("./pages/OurStory"));
const Services = lazy(() => import("./pages/Services"));
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

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/our-story" element={<PageTransition><OurStory /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/schools" element={<PageTransition><Schools /></PageTransition>} />
          <Route path="/testimonials" element={<PageTransition><WallOfLove /></PageTransition>} />
          <Route path="/testimonials/share" element={<PageTransition><ShareExperience /></PageTransition>} />
          <Route path="/workshop" element={<PageTransition><FreeWorkshop /></PageTransition>} />
          <Route path="/v" element={<ValuesReveal />} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
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
