import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(data: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  if (rateLimitMap.size > 500) {
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

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return json({ error: "Too many requests." }, 429, { ...cors, "Retry-After": "60" });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400, cors);
    }

    const { password, action, params } = body;

    if (typeof password !== "string" || typeof action !== "string") {
      return json({ error: "Invalid request format" }, 400, cors);
    }

    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!password || password !== adminPassword) {
      return json({ error: "Unauthorized" }, 401, cors);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceKey);

    switch (action) {
      case "overview": {
        const [quizRes, emailRes, bookingRes, contactRes, testimonialRes, pendingRes] = await Promise.all([
          db.from("quiz_sessions").select("*", { count: "exact", head: true }),
          db.from("email_captures").select("*", { count: "exact", head: true }),
          db.from("chat_bookings").select("*", { count: "exact", head: true }),
          db.from("contact_submissions").select("*", { count: "exact", head: true }),
          db.from("testimonials").select("*", { count: "exact", head: true }),
          db.from("testimonials").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]);

        // Recent quiz sessions for chart (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        const recentQuizzes = await db
          .from("quiz_sessions")
          .select("created_at, area_of_life, duration_seconds")
          .gte("created_at", thirtyDaysAgo)
          .order("created_at", { ascending: true });

        // Top values from final_six_values
        const allSessions = await db
          .from("quiz_sessions")
          .select("final_six_values")
          .not("final_six_values", "is", null);

        const valueCounts: Record<string, number> = {};
        for (const row of allSessions.data || []) {
          const vals = row.final_six_values as string[];
          if (Array.isArray(vals)) {
            for (const v of vals) {
              valueCounts[v] = (valueCounts[v] || 0) + 1;
            }
          }
        }
        const topValues = Object.entries(valueCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20);

        // Area of life breakdown
        const areaRes = await db
          .from("quiz_sessions")
          .select("area_of_life");
        const areaCounts: Record<string, number> = {};
        for (const row of areaRes.data || []) {
          areaCounts[row.area_of_life] = (areaCounts[row.area_of_life] || 0) + 1;
        }

        return json({
          counts: {
            quizzes: quizRes.count || 0,
            emails: emailRes.count || 0,
            bookings: bookingRes.count || 0,
            contacts: contactRes.count || 0,
            testimonials: testimonialRes.count || 0,
            pendingTestimonials: pendingRes.count || 0,
          },
          recentQuizzes: recentQuizzes.data || [],
          topValues,
          areaCounts,
        }, 200, cors);
      }

      case "quiz_sessions": {
        const limit = params?.limit || 50;
        const offset = params?.offset || 0;
        const { data, count } = await db
          .from("quiz_sessions")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        return json({ data, count }, 200, cors);
      }

      case "email_captures": {
        const limit = params?.limit || 50;
        const offset = params?.offset || 0;
        const { data, count } = await db
          .from("email_captures")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        return json({ data, count }, 200, cors);
      }

      case "chat_bookings": {
        const limit = params?.limit || 50;
        const offset = params?.offset || 0;
        const { data, count } = await db
          .from("chat_bookings")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        return json({ data, count }, 200, cors);
      }

      case "contact_submissions": {
        const limit = params?.limit || 50;
        const offset = params?.offset || 0;
        const { data, count } = await db
          .from("contact_submissions")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        return json({ data, count }, 200, cors);
      }

      case "testimonials": {
        const { data } = await db
          .from("testimonials")
          .select("*")
          .order("created_at", { ascending: false });
        return json({ data }, 200, cors);
      }

      case "update_testimonial": {
        const { id, status } = params || {};
        if (!id || !["approved", "rejected", "pending"].includes(status)) {
          return json({ error: "Invalid id or status" }, 400, cors);
        }
        const { error } = await db
          .from("testimonials")
          .update({ status })
          .eq("id", id);
        if (error) return json({ error: error.message }, 500, cors);
        return json({ success: true }, 200, cors);
      }

      case "export_csv": {
        const table = params?.table;
        const allowed = ["quiz_sessions", "email_captures", "chat_bookings", "contact_submissions"];
        if (!allowed.includes(table)) {
          return json({ error: "Invalid table" }, 400, cors);
        }
        const { data } = await db.from(table).select("*").order("created_at", { ascending: false });
        return json({ data }, 200, cors);
      }

      default:
        return json({ error: "Unknown action" }, 400, cors);
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500, cors);
  }
});
