import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://wordsincarnate.com",
  "https://www.wordsincarnate.com",
  "https://truth-dice.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// CHANGE THESE TWO LINES once send.wordsincarnate.com is verified in Resend:
// 1. Set DOMAIN_VERIFIED to true
// 2. Owner notifications will go to alex@wordsincarnate.com and customers get auto-replies
const DOMAIN_VERIFIED = false;

const OWNER_EMAIL = DOMAIN_VERIFIED ? "alex@wordsincarnate.com" : "alexandermishork@gmail.com";
const FROM_EMAIL = "Words Incarnate <hello@send.wordsincarnate.com>";

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: DOMAIN_VERIFIED ? FROM_EMAIL : "Words Incarnate <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", res.status, err);
    throw new Error(`Email send failed: ${res.status}`);
  }

  return res.json();
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const { type, data } = await req.json();

    if (type === "contact") {
      // Notify you about new contact form submission
      await sendEmail(
        RESEND_API_KEY,
        OWNER_EMAIL,
        `New Contact: ${data.name} — ${data.service_interest || "General"}`,
        `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
        <p><strong>Role:</strong> ${data.role || "Not specified"}</p>
        <p><strong>Service Interest:</strong> ${data.service_interest || "Not specified"}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br />")}</p>
        `
      );

      // Send confirmation to the person (only works with verified domain)
      if (DOMAIN_VERIFIED) {
        await sendEmail(
          RESEND_API_KEY,
          data.email,
          "We received your message — Words Incarnate",
          `
          <p>Hi ${data.name},</p>
          <p>Thank you for reaching out to Words Incarnate. We received your message and will be in touch within 1–2 business days.</p>
          <p>In the meantime, if you haven't already, you can <a href="https://wordsincarnate.com/quiz">discover your core values</a> with our free guided quiz.</p>
          <br />
          <p>Connection · Delight · Belonging</p>
          <p><em>Words Incarnate</em></p>
          `
        );
      }
    } else if (type === "newsletter") {
      // Welcome email to new subscriber (only works with verified domain)
      if (DOMAIN_VERIFIED) {
        await sendEmail(
          RESEND_API_KEY,
          data.email,
          "Welcome to Words Incarnate",
          `
          <p>Welcome to Words Incarnate.</p>
          <p>You'll receive occasional insights on values-driven living — formation for families, schools, and organizations.</p>
          <p>While you're here: <a href="https://wordsincarnate.com/quiz">discover your core values</a> with our free 5-minute guided quiz.</p>
          <br />
          <p>Connection · Delight · Belonging</p>
          <p><em>Words Incarnate</em></p>
          `
        );
      }

      // Notify you
      await sendEmail(
        RESEND_API_KEY,
        OWNER_EMAIL,
        `New Newsletter Subscriber: ${data.email}`,
        `<p>New newsletter signup: <strong>${data.email}</strong></p>`
      );
    } else if (type === "lead_magnet") {
      // Send worksheet to subscriber (only works with verified domain)
      if (DOMAIN_VERIFIED) {
        await sendEmail(
          RESEND_API_KEY,
          data.email,
          "Your Values Discovery Worksheet — Words Incarnate",
          `
          <p>Hi${data.name ? ` ${data.name}` : ""},</p>
          <p>Thank you for your interest in values discovery. Here is your free worksheet:</p>
          <p><strong><a href="https://wordsincarnate.com/values-worksheet.pdf">Download Your Values Discovery Worksheet</a></strong></p>
          <p>This printable guide will help you and your family identify, discuss, and live your core values together.</p>
          <p>Want to go deeper? <a href="https://wordsincarnate.com/quiz">Try our interactive values discovery quiz</a> — it takes about 5 minutes and gives you a personalized 6-value profile.</p>
          <br />
          <p>Connection · Delight · Belonging</p>
          <p><em>Words Incarnate</em></p>
          `
        );
      }

      // Notify you
      await sendEmail(
        RESEND_API_KEY,
        OWNER_EMAIL,
        `New Lead Magnet Download: ${data.email}`,
        `<p>Lead magnet requested by: <strong>${data.email}</strong> (${data.name || "no name"})</p>`
      );
    } else {
      throw new Error(`Unknown notification type: ${type}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-notification error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
