# Words Incarnate — Full Codebase Audit

**Date:** March 25, 2026
**Stack:** React 18 · Vite · Tailwind · shadcn/ui · Framer Motion · Supabase · Shopify Storefront API
**Bundle:** 1,026 KB JS (single chunk) · 79 KB CSS · 169 KB images
**Pages:** Home (w/ quiz), About, Our Story, Services, Contact

---

## I. PERFORMANCE & ARCHITECTURE

### A. Critical: 1MB Single-Chunk Bundle

The entire app ships as one JS file. Vite warns about this explicitly. Every visitor downloads the quiz state machine, Shopify cart integration, AI chat component, all 42 shadcn UI components, Framer Motion, ReactMarkdown, Recharts, Zustand, Zod, and every page — before seeing a single pixel.

**Fix:** Code-split by route using `React.lazy()` + `Suspense`. The quiz flow, dice/chat screen, and each page should be separate chunks. Estimated reduction: 40-50% of initial load.

### B. Critical: 33 of 42 shadcn Components Are Unused

Only 9 shadcn components are actually imported anywhere in the app: accordion, badge, button, input, label, select, separator, sheet, skeleton, sonner, textarea, toast, toaster, tooltip. The remaining 33 (calendar, carousel, chart, checkbox, command, context-menu, drawer, dropdown-menu, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, sidebar, slider, switch, table, tabs, toggle, toggle-group, alert, alert-dialog, aspect-ratio, avatar, breadcrumb, card, collapsible) are dead code.

**Fix:** Delete unused component files. They contribute to build time and IDE noise. Tree-shaking handles runtime cost, but the files are maintenance debt.

### C. Critical: Index.tsx is a 1,114-Line Monolith

The homepage component contains: the full marketing site homepage, a 180-value sorting quiz with 10 stage state machine, ~20 pieces of `useState`, localStorage persistence logic, dice rolling, parallax scrolling, and screen rendering for every quiz stage.

**Fix:** Extract quiz into a dedicated `/quiz` route with its own state management (either a reducer or Zustand store). This separates concerns, enables code-splitting, and makes each piece independently testable. The homepage becomes a marketing page; the quiz becomes an app.

### D. Moderate: No Lazy Loading on Heavy Components

EmberParticles, GradientBlobs, CursorGlow, ValuesConstellation, and ValuesStatsDashboard all load eagerly. These are visual flourishes that add significant JS overhead.

**Fix:** Lazy-load decorative components. `CursorGlow` can also be disabled on mobile (where it does nothing).

### E. Minor: Shopify Storefront Token in Source

`SHOPIFY_STOREFRONT_TOKEN` is hardcoded in `src/lib/shopify.ts`. Storefront tokens are designed to be public, so this isn't a vulnerability — but it should be in an env variable for consistency and so you can rotate it without redeploying.

### F. Minor: Two Unused Custom Components

`Testimonials.tsx` and `TextScramble.tsx` are never imported.

---

## II. DESIGN & UX

### A. Strong: Design System Foundation

The CSS architecture is clean. The color system (HSL variables, light/dark mode) is well-structured. The primary color (deep rose, `350 78% 34%`) reads as warm and distinctive. The typography stack (Inter for sans, EB Garamond for serif, IBM Plex Mono for technical labels) is coherent and appropriate for the brand register. The `sketch-card`, `label-technical`, `wi-wordmark`, and `wi-cta` utility classes create a consistent visual language.

### B. Strong: Our Story Page Parallax

The chapter-by-chapter scroll reveal with per-section parallax and opacity transforms is the most polished UX in the codebase. It matches the brand's contemplative tone.

### C. Moderate Issue: Hero Section Opacity

The hero has a `bg-background/80 backdrop-blur-[2px]` overlay that washes out the background image significantly. On the dark theme, this is worse. The Ken Burns animation on the hero image is subtle enough to work, but the opacity layer means it barely registers.

**Fix:** Reduce opacity to `/60` or `/50` and increase blur to `[4px]` to maintain readability while preserving visual impact. Or use a gradient overlay (transparent at top, opaque at bottom) instead of a uniform wash.

### D. Moderate Issue: Quiz Card Swipe UX

The ValueCard component uses swipe gestures (left = reject, right = keep) — a Tinder-style pattern. This works on mobile but is non-obvious on desktop. The "No" / "Resonates" labels help, but the interaction model itself is unfamiliar for a values-formation audience (skews older, less app-native).

**Fix:** Add visible "No" and "Resonates" buttons below the card on desktop. Keep swipe as an alternative. The ValuePair component (used in Section 3) already handles this better with explicit click targets.

### E. Moderate Issue: Navigation Dimming During Quiz

When the quiz is active, the entire nav bar dims to 20% opacity and becomes `pointer-events-none`. This means a user mid-quiz has no way to navigate away except the small "Home" button in the quiz header. Feels trapped.

**Fix:** Keep nav at reduced but functional opacity (50-60%). Let people leave. If you want to reduce distraction, hide non-essential nav items and show only logo + "Exit Quiz" during active quiz stages.

### F. Minor: ThemeToggle in Nav

Dark mode toggle is in the nav. The site looks fine in both modes, but dark mode on a values-formation site aimed at families and schools is an unusual choice. Most of your audience won't use it, and it adds visual complexity to the nav.

**Consider:** Removing the toggle and committing to light mode for the production site. Keep dark mode CSS for developer convenience but don't expose the switch.

### G. Minor: Cart Icon Always Visible

The Shopify cart icon appears in the nav even when the cart is empty and there are no products visible on most pages. It creates an expectation of e-commerce that the site only partially fulfills (via the DiceProductPopup).

**Fix:** Only show the cart icon when `totalItems > 0`, or when the user is on a page with purchasable products.

---

## III. CONVERSION OPTIMIZATION

### A. Strong: Funnel Architecture

The conversion architecture is surprisingly sophisticated for a Lovable-built site. The funnel layers are:

1. **Top-of-funnel:** Free quiz (values discovery) — good lead-gen vehicle
2. **Mid-funnel:** AI chat reflection → segmentation questions → product presentation
3. **Bottom-of-funnel:** Contact form, newsletter, lead magnet worksheet
4. **Behavioral triggers:** Exit intent popup, floating CTA, social proof toasts, welcome back prompt, commitment escalation tracker

This is a legitimate conversion stack. The commitment escalation component (tracking milestones: quiz started → results viewed → chat used → next step) is a good behavioral design pattern.

### B. Strong: AI Chat System Prompt

The edge function prompt is the most carefully built part of the entire codebase. The six-step Socratic reflection flow (Anchor → Deepen → Connect → Feel → Speak → Make It Incarnate) into segmentation → product presentation → booking is a complete sales conversation. The product catalog reference with four customer types × four support categories × three tiers is comprehensive. The conversational guardrails (one-question rule, narrative anchoring, emotional safety protocol) are well-designed.

**One concern:** The chat runs through Lovable's AI gateway (`ai.gateway.lovable.dev`) using `google/gemini-3-flash-preview`. When you leave Lovable, this endpoint dies. You'll need to replace it with a direct Anthropic, OpenAI, or Google API call from your own Supabase edge function.

### C. Critical Issue: No SEO Infrastructure

No `<title>` tags per page. No meta descriptions. No Open Graph tags. No structured data (JSON-LD). No sitemap.xml. No canonical URLs. The `robots.txt` exists but is minimal. This means the site is invisible to search engines and shares poorly on social media.

**Fix:** Add a `<Helmet>` (or `react-helmet-async`) provider. Each page needs: unique title, meta description, OG image, OG title, OG description. Generate a sitemap at build time. Add Organization and Service structured data.

### D. Moderate Issue: Lead Magnet Has No Delivery Mechanism

The LeadMagnetModal collects email and name, writes to `email_captures` in Supabase, then shows "Check your inbox!" — but there's no email delivery system connected. The "Free Values Discovery Worksheet" doesn't actually get sent.

**Fix:** Connect Supabase to a transactional email service (Resend, Postmark, or a Supabase edge function that sends via API). Or use a Supabase database webhook to trigger an email flow.

### E. Moderate Issue: Contact Form Submissions Go to a Black Hole

`MultiStepContactForm` writes to `contact_submissions` in Supabase, but there's no notification system. You'd have to manually check the Supabase dashboard to see new submissions.

**Fix:** Add a Supabase database webhook or edge function that sends you an email notification when a new contact submission arrives.

### F. Moderate Issue: Newsletter Has No Follow-Up

Same pattern as the lead magnet — writes to `email_captures` with source "newsletter" but no email service is connected. No welcome email, no drip sequence.

### G. Minor: Pricing Page Shows All Tiers Publicly

The pricing cards on the Services page show Individual ($150-$900), Family ($300-$1,500), School ($1,200-$8,000), and Organization ($2,000-Custom). Meanwhile, the AI chat's product catalog has dramatically higher Tier III pricing (e.g., School Tier III at $100,000+). The public-facing pricing and the chat-presented pricing are different product sets.

**Fix:** Either align these or make a deliberate choice about what's public vs. what's presented in conversation. The current disconnect could confuse someone who sees the Services page pricing and then gets quoted Tier III in the chat.

### H. Minor: Founder Bio Credential Check

The FounderBio component lists "M.A. Philosophy of Education" and "200+ Families Served." Verify these are accurate for your current bio. Your background is BA Philosophy (University of Dallas) and seminary formation — the M.A. credential should be confirmed or corrected.

---

## IV. PRIORITY ACTIONS

### Must-Do Before Deploying to Production

1. **Replace Lovable AI gateway** — the chat breaks the moment you leave Lovable
2. **Add SEO infrastructure** — title tags, meta descriptions, OG tags, sitemap
3. **Connect email delivery** — lead magnet, contact form notifications, newsletter
4. **Verify founder credentials** in FounderBio component
5. **Delete 33 unused shadcn components + 2 unused custom components**

### Should-Do for Performance

6. **Code-split by route** — React.lazy the quiz flow, each page
7. **Extract quiz from Index.tsx** — separate route, own state management
8. **Lazy-load decorative components** — particles, blobs, constellation

### Should-Do for Conversion

9. **Add visible quiz buttons on desktop** (not just swipe)
10. **Fix nav behavior during quiz** — functional but reduced, not locked out
11. **Align pricing** between Services page and chat product catalog
12. **Hide empty cart icon** when no items

### Nice-to-Have

13. Remove dark mode toggle from production
14. Improve hero overlay opacity
15. Add analytics (Plausible, PostHog, or similar)
