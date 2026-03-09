

# Comprehensive Website Improvement Plan for Words Incarnate

Based on my review of your entire codebase and knowledge of successful culture/strategy consulting websites, here are my recommendations organized by impact:

---

## HIGH IMPACT — Trust & Conversion

- **Add a "Services" route to navigation** — You have a full Services page built but it is not linked in the nav or router. Visitors cannot find it.
- **Add testimonials/social proof section** — Client quotes, logos of organizations served, or outcome stats (e.g., "200+ families served"). Nothing builds trust faster for consulting.
- **Add a clear pricing page or pricing section** — You have detailed tiered pricing in your reference docs (Tier I/II/III across Individual, Family, School, Organization). Surface this so visitors can self-qualify. Successful consulting sites show at least starting-at prices.
- **Add a "Book a Consultation" / contact form** — The "Schedule Consultation" button on the Services page is a dead link. A real intake form (name, email, role, what they need) that saves to your database and sends a notification would convert visitors to leads.
- **Add a footer with real contact info, social links, and key page links** — The current footer is just a copyright line. Consulting sites need email, phone, social links, and quick navigation.

## HIGH IMPACT — Engagement & Experience

- **Add a hero image or background visual** — The homepage hero is text-only. A high-quality image (team photo, workshop in action, or abstract values-themed imagery) would immediately elevate the feel.
- **Add animation/motion to the homepage content sections** — The Services page uses Framer Motion beautifully; the homepage does not. Apply similar scroll-triggered animations to the "Making Values Incarnate" and "How We Work" sections.
- **Improve the quiz onboarding UX** — 204 values in Section 1 is a long swiping experience. Add an estimated time remaining, allow skipping ahead, or batch values into themed groups to reduce fatigue and abandonment.
- **Add an email capture / lead magnet** — Offer something free (e.g., "Download our Values Discovery Worksheet") in exchange for an email. This captures visitors who are not ready to buy yet.

## MEDIUM IMPACT — Professionalism & Completeness

- **Add a dedicated Team/Founder page** — Consulting is personal. A photo, bio, and credentials of the founder(s) builds connection and authority. The About page is generic — make it personal.
- **Add case studies or "How It Works" examples** — Show a real or anonymized story: "A school came to us with X problem. We did Y. The result was Z." This is the #1 content type that converts on consulting sites.
- **Add an FAQ section** — Answer common objections: "How long does an engagement take?", "Is this faith-based only?", "What's the difference between tiers?"
- **Blog or "Insights" section** — Establishes thought leadership, helps SEO, and gives visitors a reason to return. Even 3-5 launch articles would help.
- **Add Open Graph / SEO meta tags** — Your index.html likely has minimal meta. Add title, description, OG image for social sharing.

## MEDIUM IMPACT — Design Polish

- **Add a dark mode toggle** — You have `next-themes` installed but unused. A toggle in the nav would feel modern and polished.
- **Consistent page styling** — About and Our Story pages are plain text with no animations, while Services uses motion and cards. Unify the design language.
- **Improve mobile quiz experience** — Ensure swipe cards are touch-friendly with haptic-style feedback and clear visual affordances.
- **Add a sticky CTA or floating action button** — As visitors scroll the homepage, keep a "Start Values Discovery" or "Book a Call" button visible.

## LOWER PRIORITY — Nice to Have

- **Add a "Resources" or "Shop" page** — You have Shopify integrated. Surface products (workshops, journals) in a browsable storefront page.
- **Add progress saving for the quiz** — If someone leaves mid-quiz, let them resume. Save progress to localStorage or the database.
- **Add email results delivery** — After the quiz, let users email themselves their 6 core values and chatbot conversation summary.
- **Add analytics tracking** — Track quiz completion rates, drop-off points, and chatbot engagement to optimize conversion.
- **Cookie consent banner** — If you plan to add analytics or serve EU visitors.

---

## Summary of Priorities

The single highest-ROI changes are: **(1)** wire up the Services page in navigation, **(2)** add a real contact/booking form, **(3)** add testimonials, and **(4)** add a hero image. These four changes alone would dramatically improve trust, engagement, and conversion.

