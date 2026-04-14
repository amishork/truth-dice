import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://wordsincarnate.com",
  "https://www.wordsincarnate.com",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.startsWith("http://localhost");
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// DOMAIN_VERIFIED is set via Supabase secret. Once send.wordsincarnate.com is verified in Resend,
// set the secret to "true" via: supabase secrets set DOMAIN_VERIFIED=true
// Owner notifications will then go to alex@wordsincarnate.com and customers get auto-replies
const DOMAIN_VERIFIED = Deno.env.get("DOMAIN_VERIFIED") === "true";

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

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap) {
      if (val.every((t) => now - t > RATE_WINDOW_MS)) rateLimitMap.delete(key);
    }
  }
  return false;
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown";
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Too many requests." }),
      { status: 429, headers: { ...cors, "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { type, data: rawData } = body;
    const data = rawData as Record<string, unknown>;

    const VALID_TYPES = ["contact", "newsletter", "lead_magnet", "booking", "testimonial"];
    if (typeof type !== "string" || !VALID_TYPES.includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid or missing notification type" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (typeof data !== "object" || data === null) {
      return new Response(JSON.stringify({ error: "data must be an object" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

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
      // Welcome email with PDF to new subscriber
      await sendEmail(
        RESEND_API_KEY,
        data.email,
        "Your free guide: Seven Conversations That Matter — Words Incarnate",
        `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #333;">
          <p>Welcome to Words Incarnate.</p>
          <p>Here is your free copy of <strong>Seven Conversations That Matter</strong> — a printable family dinner guide with seven nights of guided reflection.</p>
          <p style="margin: 24px 0;">
            <a href="https://wordsincarnate.com/seven-conversations-that-matter.pdf"
               style="display: inline-block; background-color: #9B1B3A; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">
              Download Your Free Guide (PDF)
            </a>
          </p>
          <p>Print it out, bring it to the table tonight, and work through the six steps together. Each night takes about 20 minutes.</p>
          <p>Want to go deeper? <a href="https://wordsincarnate.com/quiz" style="color: #9B1B3A;">Take our free values assessment</a> — five minutes, six core values, yours to keep.</p>
          <br />
          <p style="color: #999; font-size: 13px;">Connection · Delight · Belonging</p>
          <p style="color: #999; font-size: 13px;"><em>Words Incarnate</em><br />wordsincarnate.com</p>
        </div>
        `
      );

      // Notify owner
      await sendEmail(
        RESEND_API_KEY,
        OWNER_EMAIL,
        `New Lead: ${data.email} — Seven Conversations PDF`,
        `<p>New PDF guide request: <strong>${data.email}</strong></p><p>Source: hero email capture</p>`
      );
    } else if (type === "lead_magnet") {
      // Send guide to subscriber
      await sendEmail(
        RESEND_API_KEY,
        data.email,
        "Your free guide: Seven Conversations That Matter — Words Incarnate",
        `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #333;">
          <p>Hi${data.name ? ` ${data.name}` : ""},</p>
          <p>Here is your free copy of <strong>Seven Conversations That Matter</strong> — a printable family dinner guide with seven nights of guided reflection.</p>
          <p style="margin: 24px 0;">
            <a href="https://wordsincarnate.com/seven-conversations-that-matter.pdf"
               style="display: inline-block; background-color: #9B1B3A; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">
              Download Your Free Guide (PDF)
            </a>
          </p>
          <p>Print it out, bring it to the table tonight, and work through the six steps together. Each night takes about 20 minutes.</p>
          <p>Want to go deeper? <a href="https://wordsincarnate.com/quiz" style="color: #9B1B3A;">Take our free values assessment</a> — five minutes, six core values, yours to keep.</p>
          <br />
          <p style="color: #999; font-size: 13px;">Connection · Delight · Belonging</p>
          <p style="color: #999; font-size: 13px;"><em>Words Incarnate</em><br />wordsincarnate.com</p>
        </div>
        `
      );

      // Notify owner
      await sendEmail(
        RESEND_API_KEY,
        OWNER_EMAIL,
        `New Lead Magnet Download: ${data.email}`,
        `<p>Lead magnet requested by: <strong>${data.email}</strong> (${data.name || "no name"})</p>`
      );
    } else if (type === "booking") {
      // Notify owner about new chatbot booking
      const summary = data.raw_summary || {};
      const rows = Object.entries(summary)
        .map(([k, v]) => `<tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;white-space:nowrap;color:#333;">${k.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${v}</td></tr>`)
        .join("");

      await sendEmail(
        RESEND_API_KEY,
        OWNER_EMAIL,
        `New Booking: ${data.name || "Unknown"} — ${data.offering || "Unknown offering"}`,
        `
        <h2 style="color:#333;font-family:Georgia,serif;">New Values Coach Booking</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;font-family:Arial,sans-serif;font-size:14px;">
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Name</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.name || "Not provided"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Contact Method</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.contact_method || "Not provided"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Contact Info</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.contact_info || "Not provided"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Customer Type</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.customer_type || "Not specified"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Intention</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.intention || "Not specified"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Offering</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.offering || "Not specified"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Timing</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.timing || "Not specified"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Desired Outcome</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.desired_outcome || "Not specified"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Value Explored</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.value_explored || "Not specified"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Insight</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${data.insight || "Not specified"}</td></tr>
          <tr><td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;color:#333;">Core Values</td><td style="padding:6px 12px;border:1px solid #e5e5e5;color:#555;">${Array.isArray(data.core_values) ? data.core_values.join(", ") : "Not specified"}</td></tr>
        </table>
        ${rows ? `<h3 style="margin-top:20px;color:#333;">Raw Summary</h3><table style="border-collapse:collapse;width:100%;max-width:600px;font-family:Arial,sans-serif;font-size:14px;">${rows}</table>` : ""}
        `
      );

      // ─── Create/update lead in pipeline ───
      try {
        const sbUrl = Deno.env.get("SUPABASE_URL");
        const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (sbUrl && sbKey) {
          const isEmail = data.contact_method?.toLowerCase() === "email";
          const contactEmail = isEmail ? data.contact_info : null;
          const contactPhone = !isEmail ? data.contact_info : null;

          const notes = [
            data.intention ? `Intention: ${data.intention}` : "",
            data.offering ? `Interested in: ${data.offering}` : "",
            data.timing ? `Timing preference: ${data.timing}` : "",
            data.desired_outcome ? `Desired outcome: ${data.desired_outcome}` : "",
            data.value_explored ? `Value explored: ${data.value_explored}` : "",
            data.core_values?.length ? `Core values: ${data.core_values.join(", ")}` : "",
          ].filter(Boolean).join("\n");

          const leadPayload = {
            name: data.name || null,
            email: contactEmail,
            phone: contactPhone,
            customer_type: data.customer_type || null,
            pipeline_stage: "new",
            source: "values_chat",
            lead_score: 70,
            notes,
            last_activity_at: new Date().toISOString(),
            // UTM attribution (passed from frontend sessionStorage)
            utm_source: data.utm_source || null,
            utm_medium: data.utm_medium || null,
            utm_campaign: data.utm_campaign || null,
            utm_content: data.utm_content || null,
            utm_term: data.utm_term || null,
            landing_page: data.landing_page || null,
          };

          // Upsert by email if available, otherwise just insert
          const upsertUrl = contactEmail
            ? `${sbUrl}/rest/v1/leads?on_conflict=email`
            : `${sbUrl}/rest/v1/leads`;

          await fetch(upsertUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: sbKey,
              Authorization: `Bearer ${sbKey}`,
              Prefer: contactEmail ? "resolution=merge-duplicates,return=minimal" : "return=minimal",
            },
            body: JSON.stringify(leadPayload),
          });
        }
      } catch (leadErr) {
        console.error("Failed to create lead from booking:", leadErr);
        // Non-fatal: booking notification already sent
      }

      // Send confirmation to customer if we have their email and domain is verified
      if (DOMAIN_VERIFIED && data.contact_method?.toLowerCase() === 'email' && data.contact_info) {
        await sendEmail(
          RESEND_API_KEY,
          data.contact_info,
          `Your ${data.offering || "session"} is being scheduled — Words Incarnate`,
          `
          <p>Hi ${data.name || "there"},</p>
          <p>Thank you for booking your <strong>${data.offering || "session"}</strong> with Words Incarnate.</p>
          <p>Your advisor will be in touch within 24 hours to confirm the details.</p>
          <br />
          <p>Connection · Delight · Belonging</p>
          <p><em>Words Incarnate</em></p>
          `
        );
      }
    } else if (type === "testimonial") {
      // Notify owner about new testimonial submission for review
      const starsHtml = "★".repeat(data.rating || 5) + "☆".repeat(5 - (data.rating || 5));

      await sendEmail(
        RESEND_API_KEY,
        OWNER_EMAIL,
        `New Testimonial Submitted: ${data.name} (${data.audience})`,
        `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #9B1B3A; margin-bottom: 4px;">New Testimonial for Review</h2>
          <p style="color: #888; margin-top: 0;">Submitted via wordsincarnate.com/testimonials/share</p>

          <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 14px; margin: 16px 0;">
            <tr><td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 600; width: 120px;">Name</td><td style="padding: 8px 12px; border: 1px solid #e5e5e5;">${data.name}</td></tr>
            <tr><td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 600;">Role</td><td style="padding: 8px 12px; border: 1px solid #e5e5e5;">${data.role}</td></tr>
            <tr><td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 600;">Audience</td><td style="padding: 8px 12px; border: 1px solid #e5e5e5;">${data.audience}</td></tr>
            <tr><td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 600;">Rating</td><td style="padding: 8px 12px; border: 1px solid #e5e5e5; color: #9B1B3A; font-size: 18px;">${starsHtml}</td></tr>
            <tr><td style="padding: 8px 12px; border: 1px solid #e5e5e5; font-weight: 600;">Email</td><td style="padding: 8px 12px; border: 1px solid #e5e5e5;">${data.email}</td></tr>
          </table>

          <div style="background: #f9f7f5; border-left: 3px solid #9B1B3A; padding: 16px 20px; margin: 20px 0; font-style: italic; line-height: 1.6;">
            "${data.testimonial}"
          </div>

          <p style="font-size: 13px; color: #666;">To approve: Supabase Dashboard → Table Editor → <strong>testimonials</strong> → find this row → change <code>status</code> from <code>pending</code> to <code>approved</code>.</p>
          <p style="margin-top: 16px;">
            <a href="https://supabase.com/dashboard/project/phfvfesypzoxatueijdt/editor" style="display: inline-block; background-color: #9B1B3A; color: #fff; padding: 10px 24px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">Open Supabase Dashboard</a>
          </p>
        </div>
        `
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
