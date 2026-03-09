

## Plan

### Bug Fix: Text disappearing on scroll

**Root cause:** `HomeScreen` is defined as a function component *inside* the `Index` component. Every time `scrollY` state updates (on every scroll frame), `Index` re-renders, creating a **new** `HomeScreen` function reference. React treats this as a different component type and **unmounts/remounts** the entire HomeScreen tree, causing all `motion.div` elements (including `fadeInUp` animations) to replay their `initial` state (opacity: 0) before animating back in.

**Fix:** Stop defining `HomeScreen` as an inner component. Inline its JSX directly into the `Index` return statement (or the relevant stage branch). This way, scroll-driven re-renders only update the `style.transform` on parallax layers without unmounting/remounting the content tree. The `once: true` viewport option on `fadeInUp` will then work correctly.

Similarly, any other stage screens (quiz stages) defined as inner components should be inlined or extracted to separate files with explicit props.

---

### Feature Ideas (comprehensive list for Phase 2+3 remaining items)

**Batch C — Conversion:**
- Exit-intent popup detecting cursor leaving the viewport, offering "Before you go — discover your values in 5 minutes"
- Lead magnet email capture form ("Download our Values Discovery Worksheet") saving to database
- Shareable results card — a styled downloadable image of the user's 6 core values for social media
- AI-powered "Values Profile" one-page summary generated after the chatbot conversation

**Batch D — Trust & SEO:**
- Founder/team bio section with photo, credentials, and personal story
- "Trusted By" logo wall showing schools, organizations, and publications served
- Animated testimonial carousel with auto-rotation and crossfade (replacing static grid)
- Case study cards with before/after transformation narratives
- FAQ and Review JSON-LD structured data schemas for rich search results

**Additional ideas not yet listed:**
- **Scroll-progress indicator** — A thin colored bar at the top of the page showing how far the user has scrolled
- **Interactive service comparison table** — Toggle between Individual/Family/School/Org tiers with animated highlighting
- **Quiz gamification** — Streak counter, badges, or milestone celebrations at 25%/50%/75% progress
- **Animated statistics dashboard** — After quiz completion, show a visual breakdown of value categories chosen vs. skipped
- **Contextual tooltips on values** — Hovering a value during the quiz shows a brief description or example
- **Social share buttons on results** — One-click sharing to Twitter/LinkedIn/Facebook with pre-filled text
- **Accessibility enhancements** — Keyboard navigation for swipe cards, screen reader announcements for quiz progress, reduced-motion preference support
- **Multi-language support** — i18n framework for translating the quiz and site content
- **Newsletter signup in footer** — Email capture integrated into the existing footer
- **Chatbot conversation export** — Download or email the full AI conversation transcript
- **Video background option** — Short looping ambient video in the hero instead of static image
- **Micro-animated icons** — Service page icons that animate on hover (rotate, pulse, draw-in)
- **Custom 404 page** — Branded not-found page with navigation back to key sections
- **Cookie consent banner** — GDPR-ready consent UI for analytics tracking
- **Progressive Web App (PWA)** — Add manifest and service worker for installability and offline quiz access

