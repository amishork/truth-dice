

# Implementation Plan — 6 Features

## 1. Commitment Escalation Path (#20)
**New file:** `src/components/CommitmentEscalation.tsx`
- Track 5 engagement milestones in localStorage: quiz started, results viewed, chat used, values shared, contact made
- Render a horizontal stepper UI with animated progress dots and connecting lines
- Highlight the next uncompleted step with a pulsing glow and a dynamic CTA button ("Your next step: Chat with the AI coach")
- Show on the dice/results screen below the shareable card

**New file:** `src/hooks/useCommitmentTracker.ts`
- Custom hook that reads/writes milestone state to localStorage
- Exposes `markMilestone(key)` and `getMilestones()` 
- Called from Index.tsx at appropriate moments (quiz start, dice screen mount, chat first message, share button click)

**Edit:** `src/pages/Index.tsx` — import hook, call `markMilestone` at stage transitions, render `<CommitmentEscalation />` on dice screen

---

## 2. Parallax Origin Scroll (#21)
**Rewrite:** `src/pages/OurStory.tsx`
- Structure page as 4 "chapters" with scroll-linked Framer Motion animations
- Each chapter: a full-viewport section with `useScroll` + `useTransform` for parallax text movement and opacity
- Background layers with different translateY multipliers (0.1x, 0.3x, 0.5x)
- Text fades in/out based on scroll progress per section using `useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])`
- Chapter structure: "The Question" → "The Gap" → "The Conviction" → "The Invitation" (same content, cinematic presentation)
- Ambient ember particles reused from existing `EmberParticles` component

---

## 3. Speed Round Challenge (#30)
**New file:** `src/components/SpeedRound.tsx`
- A self-contained timed quiz mode accessible from the dice/results screen via a "Try Speed Round" button
- Uses the user's existing `allWinners` values (or falls back to top 20 from section4)
- 2-second countdown timer per card with auto-advance (auto-selects "skip" if time expires)
- Visual countdown ring using SVG circle with `stroke-dashoffset` animation
- After completion, shows a comparison view: "Gut Instinct" vs "Deliberate" values side by side
- Framer Motion card entrance/exit with urgency-themed red glow on timer

**Edit:** `src/pages/Index.tsx` — add Speed Round button on dice screen, pass `allWinners` and `finalSixValues` as props for comparison

---

## 4. Gravity Card Physics (#32)
**Edit:** `src/components/ValueCard.tsx`
- Replace current simple translate exit animation with Framer Motion `AnimatePresence` + `exit` variants
- Left swipe: card falls downward with `y: 800, rotate: -25, opacity: 0` using `easeIn` gravity-like easing
- Right swipe: card lifts upward briefly then settles with a glow `y: -20` then `y: 800, rotate: 15` 
- Add a key prop tied to current value index to trigger AnimatePresence re-render
- Wrap the card div in `motion.div` with `exit` animation variants keyed to swipe direction state

**Edit:** `src/components/ValuePair.tsx`
- Add subtle Framer Motion `whileTap={{ scale: 0.97 }}` and exit animation when a selection is made
- Selected card glows briefly (`boxShadow` animate), unselected card falls with gravity

---

## 5. Focus Mode Dim (#34)
**Edit:** `src/pages/Index.tsx`
- Pass a `isQuizActive` prop/class to Navigation and Footer (or use CSS approach)
- When stage is any quiz stage (section1-final), add a CSS class `quiz-active` to the root container
- Navigation and Footer get `transition-all duration-700` with reduced opacity and blur when quiz is active

**Edit:** `src/components/Navigation.tsx`
- Accept optional `dimmed` prop or use a CSS selector approach
- When `.quiz-active` parent exists: apply `opacity-30 blur-[1px] pointer-events-none` to nav (except Home button)

**Edit:** `src/index.css`
- Add `.quiz-active` modifier styles for nav/footer dimming

---

## 6. Printable Values Poster Generator (#40)
**New file:** `src/components/ValuesPosterGenerator.tsx`
- Modal/drawer UI with 3 layout presets: "Minimal Grid," "Centered Stack," "Artistic Scatter"
- 3 background options: white, dark, gradient
- 2 typography styles: serif elegant, sans-serif modern
- Live preview using a styled div (not canvas) for real-time feedback
- On "Download," render to Canvas at 2400×3200 (poster resolution) using the same layout logic
- Export as PNG via `canvas.toBlob()` + download link
- Each value rendered with its rank number and the Words Incarnate watermark at bottom

**Edit:** `src/pages/Index.tsx` — add "Create Poster" button on dice screen, render modal with `finalSixValues`

---

## Summary of Files

| Action | File |
|--------|------|
| Create | `src/hooks/useCommitmentTracker.ts` |
| Create | `src/components/CommitmentEscalation.tsx` |
| Create | `src/components/SpeedRound.tsx` |
| Create | `src/components/ValuesPosterGenerator.tsx` |
| Rewrite | `src/pages/OurStory.tsx` |
| Edit | `src/pages/Index.tsx` |
| Edit | `src/components/ValueCard.tsx` |
| Edit | `src/components/ValuePair.tsx` |
| Edit | `src/components/Navigation.tsx` |
| Edit | `src/index.css` |

