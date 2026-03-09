

# AI-Generated Personalized Dice Product Image

## What We're Building
A dynamically generated photorealistic image of two dice — a black die showing 3 of the user's personal core values in white text, and a white die showing "Person", "Place", "Experience" in black text — rendered via AI image generation each time the popup appears.

## Approach

### New Edge Function: `generate-dice-image`
Create `supabase/functions/generate-dice-image/index.ts` that:
- Accepts `{ values: string[] }` (the user's top 3 values)
- Calls the Lovable AI image generation endpoint (`google/gemini-2.5-flash-image`) with a detailed prompt describing the two dice
- The prompt will be constant except for the 3 value words on the black die
- Returns the base64 image data to the client

**Prompt template** (backend only):
> "Photorealistic product photo on a clean surface with soft studio lighting. Two 6-sided dice side by side. Left: a matte black die with white engraved text showing '{value1}', '{value2}', '{value3}' on three visible faces. Right: a matte white die with black engraved text showing 'Person', 'Place', 'Experience' on three visible faces. Minimal background, premium product photography style."

### Update `DiceProductPopup.tsx`
- On mount (when `show` becomes true), call the edge function with `values.slice(0, 3)`
- Show a skeleton/loading shimmer while the image generates
- Display the returned AI image instead of the static `dice-product.jpg`
- Cache the generated image in component state so it doesn't regenerate on re-render
- Fall back to the static image if generation fails

### Update `supabase/config.toml`
- Add `[functions.generate-dice-image]` with `verify_jwt = false`

## Files

| Action | File |
|--------|------|
| Create | `supabase/functions/generate-dice-image/index.ts` |
| Edit | `src/components/DiceProductPopup.tsx` — call edge function, show loading state, display AI image |
| Edit | `supabase/config.toml` — register new function |

