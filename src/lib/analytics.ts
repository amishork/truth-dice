import { track } from "@vercel/analytics";
import posthog from "posthog-js";

/**
 * Words Incarnate Funnel Analytics
 * Dual-fires to Vercel Analytics (existing) and PostHog (funnel analysis).
 *
 * Key funnel stages:
 *   quiz_started → area_selected → section1_complete → section2_complete →
 *   section3_complete → final_selection_complete → quiz_saved →
 *   results_viewed → dice_rolled → chat_engaged → booking_submitted
 */

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  try {
    track(event, properties);
  } catch {
    // Vercel Analytics should never break the app
  }
  try {
    posthog.capture(event, properties);
  } catch {
    // PostHog should never break the app
  }
}

// ─── Quiz Funnel ──────────────────────────────────────────────────────────────

export function trackQuizStarted() {
  trackEvent("quiz_started");
}

export function trackAreaSelected(areaId: string) {
  trackEvent("area_selected", { area: areaId });
}

export function trackSection1Complete(selectedCount: number, totalCount: number) {
  trackEvent("section1_complete", {
    values_selected: selectedCount,
    values_total: totalCount,
    select_rate: Math.round((selectedCount / totalCount) * 100),
  });
}

export function trackSection2Complete(selectedCount: number, inputCount: number) {
  trackEvent("section2_complete", {
    values_kept: selectedCount,
    values_input: inputCount,
  });
}

export function trackSection3Complete(winnerCount: number) {
  trackEvent("section3_complete", { winner_count: winnerCount });
}

export function trackFinalSelectionComplete(values: string[]) {
  trackEvent("final_selection_complete", {
    value_count: values.length,
    values: values.join(", "),
  });
}

export function trackQuizSaved(areaId: string, durationSeconds?: number) {
  trackEvent("quiz_saved", {
    area: areaId,
    ...(durationSeconds ? { duration_seconds: durationSeconds } : {}),
  });
}

export function trackQuizDropoff(stage: string, cardIndex?: number) {
  trackEvent("quiz_dropoff", {
    stage,
    ...(cardIndex !== undefined ? { card_index: cardIndex } : {}),
  });
}

// ─── Results & Engagement ─────────────────────────────────────────────────────

export function trackResultsViewed(areaId: string) {
  trackEvent("results_viewed", { area: areaId });
}

export function trackDiceRolled() {
  trackEvent("dice_rolled");
}

export function trackChatEngaged() {
  trackEvent("chat_engaged");
}

export function trackBookingSubmitted(customerType?: string, offering?: string, intention?: string) {
  trackEvent("booking_submitted", {
    ...(customerType ? { customer_type: customerType } : {}),
    ...(offering ? { offering } : {}),
    ...(intention ? { intention } : {}),
  });
}

export function trackResultsShared(method: "download" | "email") {
  trackEvent("results_shared", { method });
}

// ─── Lead Capture ─────────────────────────────────────────────────────────────

export function trackEmailCaptured(source: string) {
  trackEvent("email_captured", { source });
}

export function trackContactSubmitted(serviceInterest?: string) {
  trackEvent("contact_submitted", {
    ...(serviceInterest ? { service_interest: serviceInterest } : {}),
  });
}

export function trackLeadMagnetDownloaded() {
  trackEvent("lead_magnet_downloaded");
}

// ─── Chat & Booking ───────────────────────────────────────────────────────────

export function trackChatOpened() {
  trackEvent("chat_opened");
}

export function trackChatMessageSent(messageIndex: number, phase: string) {
  trackEvent("chat_message_sent", { message_index: messageIndex, phase });
}

export function trackBookingInitiated() {
  trackEvent("booking_initiated");
}

export function trackWorkshopCtaClicked(location: string) {
  trackEvent("workshop_cta_clicked", { location });
}
