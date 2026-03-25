const NOTIFICATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`;

export async function sendNotification(type: "contact" | "newsletter" | "lead_magnet", data: Record<string, unknown>) {
  try {
    await fetch(NOTIFICATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ type, data }),
    });
  } catch (e) {
    // Notification failure should not block the user experience
    console.error("Notification send failed:", e);
  }
}
