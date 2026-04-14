/**
 * UTM Parameter Capture & Persistence
 *
 * Captures UTM params + landing page on first page load,
 * stores in sessionStorage, and provides a getter for
 * attaching to lead creation payloads.
 */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORAGE_KEY = "wi_utm";

export interface UtmData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_page: string | null;
}

const EMPTY_UTM: UtmData = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  landing_page: null,
};

/** Call once on app init (e.g. in main.tsx). Captures UTM params from the URL if present. */
export function captureUtm(): void {
  // Don't overwrite if already captured this session
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
  } catch {
    return; // sessionStorage unavailable
  }

  const params = new URLSearchParams(window.location.search);
  const hasUtm = UTM_KEYS.some((k) => params.has(k));

  const data: UtmData = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
    landing_page: window.location.pathname,
  };

  // Always store (even without UTM) so we capture landing_page for organic visitors
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage full or unavailable
  }
}

/** Returns stored UTM data, or empty object if nothing captured. */
export function getUtmData(): UtmData {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // parse error or storage unavailable
  }
  return { ...EMPTY_UTM };
}

/** Returns only non-null UTM fields, suitable for spreading into payloads. */
export function getUtmPayload(): Record<string, string> {
  const data = getUtmData();
  const payload: Record<string, string> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val) payload[key] = val;
  }
  return payload;
}
