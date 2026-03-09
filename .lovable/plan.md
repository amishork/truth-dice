

# Plan: Hero Background Animation + Comprehensive Enhancement List

## 1. Animate the Hero Background Image

The hero section currently has a static `hero-bg.jpg` with parallax scrolling. We'll add a **slow Ken Burns effect** — a continuous gentle zoom-and-pan CSS animation that gives the background life while keeping the embers intact.

**Changes:**
- Add a `@keyframes hero-drift` animation in `src/index.css` that slowly scales between 1.1–1.2 and subtly shifts position over ~25 seconds
- Apply this animation to the hero background `div` in `Index.tsx` alongside the existing parallax transform

---

## 2. Comprehensive Enhancement List (Remaining Items)

Already implemented: exit-intent popup, lead magnet modal, newsletter signup, ember particles, cursor glow, gradient blobs, morphing tagline, confetti, floating CTA, back-to-top, testimonials carousel, FAQ, pricing cards, theme toggle, page transitions, founder bio, trusted-by logos, case study cards, parallax hero.

### A. Conversion & Lead Capture
1. **Shareable results card** — Canvas-rendered downloadable image of user's 6 core values
2. **AI-powered Values Profile PDF** — Formatted summary downloadable via browser print
3. **Email results delivery** — Backend function to email quiz results and transcript
4. **Calendly booking embed** — Inline scheduling on Contact page
5. **Social share buttons** — One-click Twitter/LinkedIn/Facebook sharing of results

### B. Visual & Motion Polish
6. **Scroll-progress indicator** — Thin bar at viewport top showing scroll depth
7. **Staggered card cascades** — Unified staggered entrance animations on all card grids
8. **Animated SVG icons** — Service icons with stroke-dashoffset draw-in on hover
9. **Scroll-triggered text reveals** — Headlines animate word-by-word on scroll
10. **Magnetic button effect** — CTAs subtly pull toward cursor with spring physics
11. **Glassmorphism section dividers** — Frosted-glass bands between sections
12. **Infinite marquee ticker** — Slowly scrolling band of value words as a visual divider

### C. Quiz & Interactive
13. **Values constellation visualizer** — Interactive radial diagram for final 6 values
14. **Quiz gamification** — Milestone celebrations at 25/50/75% with mini confetti
15. **Contextual value tooltips** — Hover descriptions during quiz
16. **Statistics dashboard** — Post-quiz visual breakdown using Recharts
17. **Conversation export** — Download AI chat transcript as formatted document
18. **3D rotating value display** — CSS 3D cube/sphere for final values

### D. Navigation & UX
19. **Mobile bottom nav bar** — Persistent thumb-friendly bar (Home, Quiz, Contact)
20. **Branded 404 page** — Animated on-brand 404 with ember particles and helpful links
21. **Skeleton loading screens** — Shimmer placeholders for heavy content
22. **Command palette** — Cmd+K quick navigation
23. **Breadcrumb navigation** — Location indicator on inner pages

### E. Technical & SEO
24. **JSON-LD structured data** — FAQ, Review, BreadcrumbList schemas
25. **Image blur-up lazy loading** — Progressive load with blurred placeholder
26. **Cookie consent banner** — GDPR-ready UI
27. **PWA support** — Manifest + service worker for installability
28. **Accessibility** — Keyboard nav, screen reader announcements, `prefers-reduced-motion`
29. **Open Graph meta tags** — Dynamic OG images/descriptions per page

### F. Advanced / Wow Factor
30. **Sound design** — Optional subtle audio on interactions with mute toggle
31. **Interactive service comparison table** — Animated tier toggle
32. **Micro-animated hover states** — Spring-physics hover effects site-wide
33. **Morphing page headers** — Inner page titles use the homepage tagline animation
34. **Ambient cursor trail** — Faint ember trail extending the particle system
35. **Typewriter chatbot effect** — AI responses stream character-by-character
36. **Animated theme transition** — Sun/moon morph with smooth color crossfade
37. **Scroll-triggered counter animations** — Stats count up when scrolled into view

### Recommended Batches
- **Batch E (Visual Polish):** Items 6–12 — scroll bar, staggered cards, magnetic buttons, text reveals, marquee
- **Batch F (Quiz Depth):** Items 13–18 — constellation, gamification, stats, export
- **Batch G (Technical):** Items 20, 24–29 — branded 404, JSON-LD, accessibility, PWA
- **Batch H (Wow Factor):** Items 30–37 — sound, cursor trail, typewriter, theme morph

