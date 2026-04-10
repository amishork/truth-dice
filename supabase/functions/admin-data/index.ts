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
        const allowed = ["quiz_sessions", "email_captures", "chat_bookings", "contact_submissions", "leads"];
        if (!allowed.includes(table)) {
          return json({ error: "Invalid table" }, 400, cors);
        }
        const { data } = await db.from(table).select("*").order("created_at", { ascending: false });
        return json({ data }, 200, cors);
      }

      // ─── Lead Management ─────────────────────────────────────────────────

      case "leads": {
        const stage = params?.stage as string | undefined;
        const limit = (params?.limit as number) || 100;
        const offset = (params?.offset as number) || 0;
        let query = db.from("leads").select("*", { count: "exact" });
        if (stage) query = query.eq("pipeline_stage", stage);
        query = query.order("last_activity_at", { ascending: false }).range(offset, offset + limit - 1);
        const { data, count, error } = await query;
        if (error) return json({ error: error.message }, 500, cors);
        return json({ data, count }, 200, cors);
      }

      case "leads_by_stage": {
        const { data, error } = await db
          .from("leads")
          .select("*")
          .order("lead_score", { ascending: false });
        if (error) return json({ error: error.message }, 500, cors);

        const stages = [
          "anonymous", "captured", "engaged", "booking_requested",
          "contacted", "in_conversation", "proposal_sent", "won", "lost", "nurture"
        ];
        const grouped: Record<string, unknown[]> = {};
        for (const s of stages) grouped[s] = [];
        for (const lead of data || []) {
          const s = lead.pipeline_stage || "captured";
          if (grouped[s]) grouped[s].push(lead);
          else grouped["captured"].push(lead);
        }
        return json({ stages: grouped }, 200, cors);
      }

      case "lead_detail": {
        const leadId = params?.id as string;
        if (!leadId) return json({ error: "Missing lead id" }, 400, cors);

        const [leadRes, activitiesRes] = await Promise.all([
          db.from("leads").select("*").eq("id", leadId).single(),
          db.from("lead_activities").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
        ]);
        if (leadRes.error) return json({ error: leadRes.error.message }, 404, cors);
        return json({ lead: leadRes.data, activities: activitiesRes.data || [] }, 200, cors);
      }

      case "create_lead": {
        const { email, name, phone, customer_type, pipeline_stage, source, tags, notes } = params || {};
        const insertData: Record<string, unknown> = {};
        if (email) insertData.email = (email as string).toLowerCase();
        if (name) insertData.name = name;
        if (phone) insertData.phone = phone;
        if (customer_type) insertData.customer_type = customer_type;
        if (pipeline_stage) insertData.pipeline_stage = pipeline_stage;
        if (source) insertData.source = source;
        if (tags) insertData.tags = tags;
        if (notes) insertData.notes = notes;
        insertData.lead_score = 0;

        const { data, error } = await db.from("leads").insert(insertData).select().single();
        if (error) return json({ error: error.message }, 400, cors);
        return json({ lead: data }, 201, cors);
      }

      case "update_lead": {
        const leadId = params?.id as string;
        if (!leadId) return json({ error: "Missing lead id" }, 400, cors);

        const updates: Record<string, unknown> = {};
        const allowed_fields = [
          "name", "email", "phone", "customer_type", "source",
          "tags", "notes", "follow_up_date", "follow_up_note", "lost_reason", "lead_score"
        ];
        for (const f of allowed_fields) {
          if (params?.[f] !== undefined) {
            updates[f] = f === "email" && params[f] ? (params[f] as string).toLowerCase() : params[f];
          }
        }

        if (Object.keys(updates).length === 0) return json({ error: "No fields to update" }, 400, cors);

        const { data, error } = await db.from("leads").update(updates).eq("id", leadId).select().single();
        if (error) return json({ error: error.message }, 400, cors);
        return json({ lead: data }, 200, cors);
      }

      case "update_lead_stage": {
        const leadId = params?.id as string;
        const newStage = params?.stage as string;
        const lostReason = params?.lost_reason as string | undefined;
        if (!leadId || !newStage) return json({ error: "Missing id or stage" }, 400, cors);

        const validStages = [
          "anonymous", "captured", "engaged", "booking_requested",
          "contacted", "in_conversation", "proposal_sent", "won", "lost", "nurture"
        ];
        if (!validStages.includes(newStage)) return json({ error: "Invalid stage" }, 400, cors);

        // Get current stage for activity log
        const { data: current } = await db.from("leads").select("pipeline_stage").eq("id", leadId).single();
        const oldStage = current?.pipeline_stage || "unknown";

        const updateData: Record<string, unknown> = {
          pipeline_stage: newStage,
          last_activity_at: new Date().toISOString(),
        };
        if (newStage === "lost" && lostReason) updateData.lost_reason = lostReason;

        const { data, error } = await db.from("leads").update(updateData).eq("id", leadId).select().single();
        if (error) return json({ error: error.message }, 400, cors);

        // Log the stage change
        await db.from("lead_activities").insert({
          lead_id: leadId,
          activity_type: "stage_changed",
          metadata: { from: oldStage, to: newStage, lost_reason: lostReason || null },
        });

        return json({ lead: data }, 200, cors);
      }

      case "add_lead_note": {
        const leadId = params?.id as string;
        const note = params?.note as string;
        if (!leadId || !note) return json({ error: "Missing id or note" }, 400, cors);

        // Append to notes field
        const { data: current } = await db.from("leads").select("notes").eq("id", leadId).single();
        const timestamp = new Date().toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
        });
        const newNotes = current?.notes
          ? `${current.notes}\n\n[${timestamp}] ${note}`
          : `[${timestamp}] ${note}`;

        const { error } = await db.from("leads").update({
          notes: newNotes,
          last_activity_at: new Date().toISOString(),
        }).eq("id", leadId);
        if (error) return json({ error: error.message }, 500, cors);

        // Log activity
        await db.from("lead_activities").insert({
          lead_id: leadId,
          activity_type: "note_added",
          metadata: { note },
        });

        return json({ success: true }, 200, cors);
      }

      case "delete_lead": {
        const leadId = params?.id as string;
        if (!leadId) return json({ error: "Missing lead id" }, 400, cors);
        const { error } = await db.from("leads").delete().eq("id", leadId);
        if (error) return json({ error: error.message }, 500, cors);
        return json({ success: true }, 200, cors);
      }

      // ─── Engagement Management ────────────────────────────────────────────

      case "engagements": {
        const status = params?.status as string | undefined;
        let query = db.from("engagements").select("*").order("created_at", { ascending: false });
        if (status) query = query.eq("status", status);
        const { data, error } = await query;
        if (error) return json({ error: error.message }, 500, cors);
        return json({ data }, 200, cors);
      }

      case "engagement_detail": {
        const engId = params?.id as string;
        if (!engId) return json({ error: "Missing engagement id" }, 400, cors);
        const [engRes, sessRes] = await Promise.all([
          db.from("engagements").select("*").eq("id", engId).single(),
          db.from("engagement_sessions").select("*").eq("engagement_id", engId).order("session_date", { ascending: true }),
        ]);
        if (engRes.error) return json({ error: engRes.error.message }, 404, cors);
        return json({ engagement: engRes.data, sessions: sessRes.data || [] }, 200, cors);
      }

      case "create_engagement": {
        const fields = [
          "lead_id", "client_name", "organization", "engagement_type", "tier",
          "segment", "contract_value", "amount_invoiced", "amount_received",
          "status", "start_date", "end_date", "sessions_total", "sessions_completed",
          "deliverables", "notes"
        ];
        const insertData: Record<string, unknown> = {};
        for (const f of fields) {
          if (params?.[f] !== undefined) insertData[f] = params[f];
        }
        if (!insertData.client_name) return json({ error: "client_name required" }, 400, cors);

        const { data, error } = await db.from("engagements").insert(insertData).select().single();
        if (error) return json({ error: error.message }, 400, cors);

        // If linked to a lead, update lead stage to "won"
        if (insertData.lead_id) {
          await db.from("leads").update({
            pipeline_stage: "won",
            last_activity_at: new Date().toISOString(),
          }).eq("id", insertData.lead_id);
          await db.from("lead_activities").insert({
            lead_id: insertData.lead_id,
            activity_type: "stage_changed",
            metadata: { to: "won", engagement_id: data.id, engagement_type: insertData.engagement_type },
          });
        }

        return json({ engagement: data }, 201, cors);
      }

      case "update_engagement": {
        const engId = params?.id as string;
        if (!engId) return json({ error: "Missing engagement id" }, 400, cors);
        const fields = [
          "client_name", "organization", "engagement_type", "tier",
          "segment", "contract_value", "amount_invoiced", "amount_received",
          "status", "start_date", "end_date", "sessions_total", "sessions_completed",
          "deliverables", "notes"
        ];
        const updates: Record<string, unknown> = {};
        for (const f of fields) {
          if (params?.[f] !== undefined) updates[f] = params[f];
        }
        if (Object.keys(updates).length === 0) return json({ error: "No fields to update" }, 400, cors);

        const { data, error } = await db.from("engagements").update(updates).eq("id", engId).select().single();
        if (error) return json({ error: error.message }, 400, cors);
        return json({ engagement: data }, 200, cors);
      }

      case "delete_engagement": {
        const engId = params?.id as string;
        if (!engId) return json({ error: "Missing engagement id" }, 400, cors);
        const { error } = await db.from("engagements").delete().eq("id", engId);
        if (error) return json({ error: error.message }, 500, cors);
        return json({ success: true }, 200, cors);
      }

      case "create_session": {
        const engId = params?.engagement_id as string;
        if (!engId) return json({ error: "Missing engagement_id" }, 400, cors);
        const insertData: Record<string, unknown> = { engagement_id: engId };
        if (params?.session_date) insertData.session_date = params.session_date;
        if (params?.session_notes) insertData.session_notes = params.session_notes;
        if (params?.hold_stage) insertData.hold_stage = params.hold_stage;

        const { data, error } = await db.from("engagement_sessions").insert(insertData).select().single();
        if (error) return json({ error: error.message }, 400, cors);

        // Increment sessions_completed
        await db.rpc("", {}).catch(() => {}); // no-op, we'll do it manually
        const { data: eng } = await db.from("engagements").select("sessions_completed").eq("id", engId).single();
        if (eng) {
          await db.from("engagements").update({
            sessions_completed: (eng.sessions_completed || 0) + 1,
          }).eq("id", engId);
        }

        return json({ session: data }, 201, cors);
      }

      case "update_session": {
        const sessId = params?.id as string;
        if (!sessId) return json({ error: "Missing session id" }, 400, cors);
        const updates: Record<string, unknown> = {};
        if (params?.session_date !== undefined) updates.session_date = params.session_date;
        if (params?.session_notes !== undefined) updates.session_notes = params.session_notes;
        if (params?.hold_stage !== undefined) updates.hold_stage = params.hold_stage;

        const { data, error } = await db.from("engagement_sessions").update(updates).eq("id", sessId).select().single();
        if (error) return json({ error: error.message }, 400, cors);
        return json({ session: data }, 200, cors);
      }

      case "delete_session": {
        const sessId = params?.id as string;
        const engId = params?.engagement_id as string;
        if (!sessId) return json({ error: "Missing session id" }, 400, cors);

        const { error } = await db.from("engagement_sessions").delete().eq("id", sessId);
        if (error) return json({ error: error.message }, 500, cors);

        // Decrement sessions_completed
        if (engId) {
          const { data: eng } = await db.from("engagements").select("sessions_completed").eq("id", engId).single();
          if (eng && eng.sessions_completed > 0) {
            await db.from("engagements").update({
              sessions_completed: eng.sessions_completed - 1,
            }).eq("id", engId);
          }
        }

        return json({ success: true }, 200, cors);
      }

      case "revenue_summary": {
        const { data: engagements } = await db.from("engagements").select("*");
        const all = engagements || [];

        const totalRevenue = all.reduce((s, e) => s + (Number(e.amount_received) || 0), 0);
        const totalInvoiced = all.reduce((s, e) => s + (Number(e.amount_invoiced) || 0), 0);
        const totalContract = all.reduce((s, e) => s + (Number(e.contract_value) || 0), 0);
        const outstanding = totalInvoiced - totalRevenue;

        // Revenue by segment
        const bySegment: Record<string, number> = {};
        for (const e of all) {
          const seg = e.segment || "individual";
          bySegment[seg] = (bySegment[seg] || 0) + (Number(e.amount_received) || 0);
        }

        // Revenue by month (last 12 months)
        const byMonth: Record<string, number> = {};
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          byMonth[key] = 0;
        }
        for (const e of all) {
          if (e.start_date) {
            const d = new Date(e.start_date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            if (byMonth[key] !== undefined) {
              byMonth[key] += Number(e.amount_received) || 0;
            }
          }
        }

        // Active pipeline value (leads in conversation/proposal)
        const { data: pipelineLeads } = await db
          .from("leads")
          .select("pipeline_stage")
          .in("pipeline_stage", ["in_conversation", "proposal_sent"]);
        const pipelineCount = pipelineLeads?.length || 0;

        // Engagement counts by status
        const byStatus: Record<string, number> = {};
        for (const e of all) {
          byStatus[e.status] = (byStatus[e.status] || 0) + 1;
        }

        // Average deal size by segment
        const avgBySegment: Record<string, number> = {};
        const countBySegment: Record<string, number> = {};
        for (const e of all) {
          const seg = e.segment || "individual";
          const val = Number(e.contract_value) || 0;
          if (val > 0) {
            avgBySegment[seg] = (avgBySegment[seg] || 0) + val;
            countBySegment[seg] = (countBySegment[seg] || 0) + 1;
          }
        }
        for (const seg of Object.keys(avgBySegment)) {
          avgBySegment[seg] = Math.round(avgBySegment[seg] / countBySegment[seg]);
        }

        return json({
          totalRevenue,
          totalInvoiced,
          totalContract,
          outstanding,
          bySegment,
          byMonth,
          byStatus,
          avgBySegment,
          pipelineCount,
          engagementCount: all.length,
        }, 200, cors);
      }

      default:
        return json({ error: "Unknown action" }, 400, cors);
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500, cors);
  }
});
