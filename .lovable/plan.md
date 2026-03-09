

# Answers & Implementation Plan

## Question 1: Auto-scroll chat with fixed input

**Yes, absolutely.** The chat component (`ValuesChat.tsx`) already has a `scrollToBottom` helper and a `scrollRef`. The issue is the chat container uses `flex-1 overflow-y-auto` which should work, but the scroll may not always fire reliably. The fix is:
- Ensure `scrollToBottom` fires after every message update (including during streaming)
- Use `scrollIntoView({ behavior: 'smooth' })` on a sentinel div at the bottom of messages instead of `scrollTop` manipulation — this is more reliable

The input is already pinned at the bottom via flexbox (`flex flex-col` with the message area as `flex-1 overflow-y-auto` and input below). No layout changes needed — just improve the auto-scroll reliability.

## Question 2: Trigger popup at a specific chat message

**Yes.** Instead of triggering on the first dice roll, we can watch the streaming chat messages for the trigger phrase. When the assistant's message contains `"At Words Incarnate, everything we create"`, we show the popup.

### Changes

**`src/components/ValuesChat.tsx`**
- Add a bottom-sentinel `<div ref={bottomRef} />` after messages, scroll to it via `bottomRef.current?.scrollIntoView({ behavior: 'smooth' })` on every message update
- Accept an `onTriggerProductPopup?: () => void` callback prop
- In the streaming loop, when `assistantSoFar` contains the trigger phrase, call `onTriggerProductPopup()`

**`src/pages/Index.tsx`**
- Replace the `hasRolledOnce`-based popup trigger with a `showDicePopup` state
- Pass `onTriggerProductPopup={() => setShowDicePopup(true)}` to `ValuesChat`
- Pass `visible={showDicePopup}` to `DiceProductPopup`
- Remove `hasRolledOnce` state (no longer needed)

