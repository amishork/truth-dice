

# Dice Game Product Popup — Implementation Plan

## What We're Building
A non-intrusive popup that slides up from the bottom-left corner of the dice screen when the user first clicks "Roll dice." It promotes a physical dice conversation game from the Shopify store, personalized with their 6 selected values.

## Current State
- The Shopify store has **no products yet** — we need to create the dice product first
- The dice screen is a two-column layout: left column (dice/values), right column (chat)
- The `rollDice` function and cart store are already fully wired up

## Implementation

### Step 1: Create Shopify Product
Use `shopify--create_product` to create the physical dice conversation game product with title, description, and price.

### Step 2: New Component — `DiceProductPopup.tsx`
- **Trigger:** Appears ~2 seconds after the first dice roll (tracks via local state `hasRolled`)
- **Position:** `fixed bottom-4 left-4 z-40` — bottom-left corner, won't overlap the right-column chat
- **Animation:** Framer Motion `initial={{ y: 100, opacity: 0 }}` → `animate={{ y: 0, opacity: 1 }}` with a slow 0.8s ease-out transition
- **Content:**
  - Product image from Shopify (fetched via Storefront API on mount)
  - Product title + short persuasive copy mentioning their custom-engraved values
  - Display 2-3 of the user's `finalSixValues` as preview tags
  - Price display
  - "Add to Cart" button using the existing `useCartStore`
  - Small "×" dismiss button
- **Dismissal:** Can be closed; stores dismissed state in component state (reappears on page reload if desired, or use localStorage)
- **Size:** Compact card ~280px wide, not blocking content

### Step 3: Edit `Index.tsx`
- Import `DiceProductPopup`
- Track `hasRolledOnce` state, set to `true` on first `rollDice` call
- Render `<DiceProductPopup>` in the dice screen when `hasRolledOnce` is true, passing `finalSixValues`

### Files
| Action | File |
|--------|------|
| Create product | Shopify store (via tool) |
| Create | `src/components/DiceProductPopup.tsx` |
| Edit | `src/pages/Index.tsx` — add state + render popup |

