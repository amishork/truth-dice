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

      // ─── Analytics ────────────────────────────────────────────────────────

      case "funnel_data": {
        const periodDays = (params?.days as number) || 30;
        const since = new Date(Date.now() - periodDays * 86400000).toISOString();

        const [quizAll, quizPeriod, chatAll, chatPeriod, emailAll, emailPeriod, contactAll, contactPeriod, leadWon] = await Promise.all([
          db.from("quiz_sessions").select("*", { count: "exact", head: true }),
          db.from("quiz_sessions").select("*", { count: "exact", head: true }).gte("created_at", since),
          db.from("chat_bookings").select("*", { count: "exact", head: true }),
          db.from("chat_bookings").select("*", { count: "exact", head: true }).gte("created_at", since),
          db.from("email_captures").select("*", { count: "exact", head: true }),
          db.from("email_captures").select("*", { count: "exact", head: true }).gte("created_at", since),
          db.from("contact_submissions").select("*", { count: "exact", head: true }),
          db.from("contact_submissions").select("*", { count: "exact", head: true }).gte("created_at", since),
          db.from("leads").select("*", { count: "exact", head: true }).eq("pipeline_stage", "won"),
        ]);

        return json({
          allTime: {
            quizCompletions: quizAll.count || 0,
            emailCaptures: emailAll.count || 0,
            chatBookings: chatAll.count || 0,
            contactForms: contactAll.count || 0,
            won: leadWon.count || 0,
          },
          period: {
            quizCompletions: quizPeriod.count || 0,
            emailCaptures: emailPeriod.count || 0,
            chatBookings: chatPeriod.count || 0,
            contactForms: contactPeriod.count || 0,
          },
          days: periodDays,
        }, 200, cors);
      }

      case "quiz_analytics": {
        // All quiz sessions with details
        const { data: sessions } = await db
          .from("quiz_sessions")
          .select("area_of_life, final_six_values, duration_seconds, created_at, user_id")
          .order("created_at", { ascending: false });

        const all = sessions || [];
        const withDuration = all.filter(s => s.duration_seconds && s.duration_seconds > 0);

        // Area of life counts
        const areaCounts: Record<string, number> = {};
        for (const s of all) {
          areaCounts[s.area_of_life] = (areaCounts[s.area_of_life] || 0) + 1;
        }

        // Value frequency
        const valueCounts: Record<string, number> = {};
        for (const s of all) {
          if (Array.isArray(s.final_six_values)) {
            for (const v of s.final_six_values) {
              valueCounts[v] = (valueCounts[v] || 0) + 1;
            }
          }
        }

        // Values by area
        const valuesByArea: Record<string, Record<string, number>> = {};
        for (const s of all) {
          if (!valuesByArea[s.area_of_life]) valuesByArea[s.area_of_life] = {};
          if (Array.isArray(s.final_six_values)) {
            for (const v of s.final_six_values) {
              valuesByArea[s.area_of_life][v] = (valuesByArea[s.area_of_life][v] || 0) + 1;
            }
          }
        }

        // Duration distribution (buckets: 0-2m, 2-4m, 4-6m, 6-8m, 8-10m, 10+m)
        const durationBuckets = [0, 0, 0, 0, 0, 0];
        for (const s of withDuration) {
          const mins = s.duration_seconds / 60;
          if (mins < 2) durationBuckets[0]++;
          else if (mins < 4) durationBuckets[1]++;
          else if (mins < 6) durationBuckets[2]++;
          else if (mins < 8) durationBuckets[3]++;
          else if (mins < 10) durationBuckets[4]++;
          else durationBuckets[5]++;
        }

        // Daily counts for trend (last 90 days)
        const ninetyDaysAgo = Date.now() - 90 * 86400000;
        const dailyCounts: Record<string, number> = {};
        for (const s of all) {
          const d = new Date(s.created_at);
          if (d.getTime() >= ninetyDaysAgo) {
            const key = d.toISOString().slice(0, 10);
            dailyCounts[key] = (dailyCounts[key] || 0) + 1;
          }
        }

        // Repeat users
        const userIds = all.filter(s => s.user_id).map(s => s.user_id);
        const userCounts: Record<string, number> = {};
        for (const uid of userIds) {
          userCounts[uid] = (userCounts[uid] || 0) + 1;
        }
        const repeatUsers = Object.values(userCounts).filter(c => c > 1).length;

        // Co-occurrence (top value pairs)
        const pairCounts: Record<string, number> = {};
        for (const s of all) {
          if (Array.isArray(s.final_six_values)) {
            const vals = s.final_six_values.sort();
            for (let i = 0; i < vals.length; i++) {
              for (let j = i + 1; j < vals.length; j++) {
                const pair = `${vals[i]}|${vals[j]}`;
                pairCounts[pair] = (pairCounts[pair] || 0) + 1;
              }
            }
          }
        }
        const topPairs = Object.entries(pairCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([pair, count]) => ({ values: pair.split("|"), count }));

        return json({
          total: all.length,
          avgDuration: withDuration.length > 0
            ? Math.round(withDuration.reduce((s, q) => s + q.duration_seconds, 0) / withDuration.length)
            : 0,
          areaCounts,
          valueCounts,
          valuesByArea,
          durationBuckets,
          dailyCounts,
          repeatUsers,
          totalUsers: Object.keys(userCounts).length,
          topPairs,
        }, 200, cors);
      }

      case "chat_analytics": {
        const { data: bookings } = await db
          .from("chat_bookings")
          .select("customer_type, offering, timing, created_at")
          .order("created_at", { ascending: false });

        const all = bookings || [];

        // By customer type
        const byType: Record<string, number> = {};
        for (const b of all) {
          byType[b.customer_type || "unknown"] = (byType[b.customer_type || "unknown"] || 0) + 1;
        }

        // By offering
        const byOffering: Record<string, number> = {};
        for (const b of all) {
          byOffering[b.offering || "unknown"] = (byOffering[b.offering || "unknown"] || 0) + 1;
        }

        // By timing
        const byTiming: Record<string, number> = {};
        for (const b of all) {
          byTiming[b.timing || "unknown"] = (byTiming[b.timing || "unknown"] || 0) + 1;
        }

        return json({
          total: all.length,
          byType,
          byOffering,
          byTiming,
        }, 200, cors);
      }

      case "source_analytics": {
        const { data: emails } = await db.from("email_captures").select("source, created_at");
        const { data: leads } = await db.from("leads").select("source, pipeline_stage");

        const emailsBySource: Record<string, number> = {};
        for (const e of emails || []) {
          emailsBySource[e.source || "unknown"] = (emailsBySource[e.source || "unknown"] || 0) + 1;
        }

        // Conversion by source (leads that reached booking_requested or beyond)
        const convertedStages = ["booking_requested", "contacted", "in_conversation", "proposal_sent", "won"];
        const conversionBySource: Record<string, { total: number; converted: number }> = {};
        for (const l of leads || []) {
          const src = l.source || "unknown";
          if (!conversionBySource[src]) conversionBySource[src] = { total: 0, converted: 0 };
          conversionBySource[src].total++;
          if (convertedStages.includes(l.pipeline_stage)) conversionBySource[src].converted++;
        }

        return json({
          emailsBySource,
          conversionBySource,
        }, 200, cors);
      }

      // ─── Configuration ────────────────────────────────────────────────────

      case "get_config": {
        const { data } = await db.from("dashboard_config").select("*");
        const config: Record<string, unknown> = {};
        for (const row of data || []) {
          config[row.key] = row.value;
        }
        return json({ config }, 200, cors);
      }

      case "set_config": {
        const key = params?.key as string;
        const value = params?.value;
        if (!key || value === undefined) return json({ error: "Missing key or value" }, 400, cors);

        const { error } = await db.from("dashboard_config").upsert({
          key,
          value: JSON.parse(JSON.stringify(value)),
          updated_at: new Date().toISOString(),
        });
        if (error) return json({ error: error.message }, 500, cors);
        return json({ success: true }, 200, cors);
      }

      // ─── 4.1: Proposals ───

      case "proposals": {
        const { data } = await db.from("proposals").select("*").order("created_at", { ascending: false });
        return json({ proposals: data || [] }, 200, cors);
      }

      case "create_proposal": {
        const p = params as Record<string, unknown>;
        if (!p?.client_name || !p?.segment || !p?.engagement_type) {
          return json({ error: "Missing required fields" }, 400, cors);
        }
        const { data, error } = await db.from("proposals").insert({
          lead_id: p.lead_id || null,
          client_name: p.client_name,
          organization: p.organization || null,
          segment: p.segment,
          engagement_type: p.engagement_type,
          tier: p.tier || null,
          investment_amount: p.investment_amount || null,
          investment_description: p.investment_description || null,
          timeline: p.timeline || null,
          deliverables: p.deliverables || [],
          custom_notes: p.custom_notes || null,
          status: "draft",
        }).select().single();
        if (error) return json({ error: error.message }, 500, cors);
        return json({ proposal: data }, 200, cors);
      }

      case "update_proposal": {
        const p = params as Record<string, unknown>;
        if (!p?.id) return json({ error: "Missing id" }, 400, cors);
        const updates: Record<string, unknown> = {};
        for (const key of ["client_name", "organization", "segment", "engagement_type", "tier", "investment_amount", "investment_description", "timeline", "deliverables", "custom_notes", "status", "sent_at", "viewed_at", "responded_at"]) {
          if (p[key] !== undefined) updates[key] = p[key];
        }
        const { error } = await db.from("proposals").update(updates).eq("id", p.id);
        if (error) return json({ error: error.message }, 500, cors);
        return json({ success: true }, 200, cors);
      }

      case "delete_proposal": {
        const id = (params as Record<string, unknown>)?.id;
        if (!id) return json({ error: "Missing id" }, 400, cors);
        const { error } = await db.from("proposals").delete().eq("id", id);
        if (error) return json({ error: error.message }, 500, cors);
        return json({ success: true }, 200, cors);
      }

      // ─── 4.2: Email Sends ───

      case "send_email": {
        const p = params as Record<string, unknown>;
        if (!p?.recipient_email || !p?.subject || !p?.html || !p?.template_key) {
          return json({ error: "Missing required fields" }, 400, cors);
        }
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY not configured" }, 500, cors);

        const DOMAIN_VERIFIED = Deno.env.get("DOMAIN_VERIFIED") === "true";
        const fromEmail = DOMAIN_VERIFIED
          ? "Words Incarnate <hello@send.wordsincarnate.com>"
          : "Words Incarnate <onboarding@resend.dev>";

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [p.recipient_email],
            subject: p.subject,
            html: p.html,
          }),
        });

        let resendId = null;
        let status = "sent";
        if (!res.ok) {
          console.error("Resend error:", res.status, await res.text());
          status = "failed";
        } else {
          const resData = await res.json();
          resendId = resData.id || null;
        }

        // Log the send
        await db.from("email_sends").insert({
          lead_id: p.lead_id || null,
          template_key: p.template_key,
          recipient_email: p.recipient_email,
          subject: p.subject,
          status,
          resend_id: resendId,
        });

        // Log activity on the lead
        if (p.lead_id) {
          await db.from("lead_activities").insert({
            lead_id: p.lead_id,
            activity_type: "email_sent",
            metadata: { template: p.template_key, subject: p.subject, status },
          });
          await db.from("leads").update({ last_activity_at: new Date().toISOString() }).eq("id", p.lead_id);
        }

        if (status === "failed") return json({ error: "Email send failed" }, 500, cors);
        return json({ success: true, resend_id: resendId }, 200, cors);
      }

      case "email_history": {
        const leadId = (params as Record<string, unknown>)?.lead_id;
        let query = db.from("email_sends").select("*").order("sent_at", { ascending: false });
        if (leadId) query = query.eq("lead_id", leadId);
        const { data } = await query.limit(100);
        return json({ emails: data || [] }, 200, cors);
      }

      // ─── 4.3: Data Health ───

      case "data_health": {
        // Duplicate leads by email
        const { data: dupes } = await db.rpc("get_duplicate_lead_emails") as { data: { email: string; count: number }[] | null };

        // Fallback: query directly if RPC doesn't exist
        let duplicates: { email: string; count: number }[] = [];
        if (!dupes) {
          const { data: allLeads } = await db.from("leads").select("email").not("email", "is", null);
          const emailCounts: Record<string, number> = {};
          for (const l of allLeads || []) {
            if (l.email) emailCounts[l.email] = (emailCounts[l.email] || 0) + 1;
          }
          duplicates = Object.entries(emailCounts)
            .filter(([, c]) => c > 1)
            .map(([email, count]) => ({ email, count }));
        } else {
          duplicates = dupes;
        }

        // Leads missing critical fields
        const { data: missingFields } = await db.from("leads")
          .select("id, email, name, phone, customer_type")
          .or("name.is.null,phone.is.null,customer_type.is.null");
        const leadsNeedingAttention = (missingFields || []).filter(l =>
          !l.name || !l.phone || !l.customer_type
        );

        // Stale leads (no activity in 30+ days, not in terminal stages)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: staleLeads } = await db.from("leads")
          .select("id, name, email, pipeline_stage, last_activity_at")
          .not("pipeline_stage", "in", "(won,lost,nurture)")
          .or(`last_activity_at.is.null,last_activity_at.lt.${thirtyDaysAgo}`);

        // Engagement integrity
        const { data: allEngagements } = await db.from("engagements").select("id, client_name, status");
        const { data: allSessions } = await db.from("engagement_sessions").select("id, engagement_id, session_notes");

        const engagementIds = new Set((allSessions || []).map(s => s.engagement_id));
        const engagementsWithoutSessions = (allEngagements || []).filter(e => !engagementIds.has(e.id));
        const sessionsWithoutNotes = (allSessions || []).filter(s => !s.session_notes);

        return json({
          health: {
            duplicates,
            missing_fields: leadsNeedingAttention.length,
            missing_fields_leads: leadsNeedingAttention.slice(0, 20),
            stale_leads: (staleLeads || []).length,
            stale_leads_list: (staleLeads || []).slice(0, 20),
            engagements_without_sessions: engagementsWithoutSessions.length,
            sessions_without_notes: sessionsWithoutNotes.length,
          },
        }, 200, cors);
      }

      case "merge_leads": {
        const p = params as Record<string, unknown>;
        if (!p?.keep_id || !p?.delete_id) return json({ error: "Missing keep_id or delete_id" }, 400, cors);

        // Move activities from deleted lead to kept lead
        await db.from("lead_activities").update({ lead_id: p.keep_id }).eq("lead_id", p.delete_id);
        // Move email sends
        await db.from("email_sends").update({ lead_id: p.keep_id }).eq("lead_id", p.delete_id);
        // Move engagements
        await db.from("engagements").update({ lead_id: p.keep_id }).eq("lead_id", p.delete_id);
        // Move proposals
        await db.from("proposals").update({ lead_id: p.keep_id }).eq("lead_id", p.delete_id);
        // Delete the duplicate
        const { error } = await db.from("leads").delete().eq("id", p.delete_id);
        if (error) return json({ error: error.message }, 500, cors);
        return json({ success: true }, 200, cors);
      }

      default:
        return json({ error: "Unknown action" }, 400, cors);
    }
  } catch (err) {
    return json({ error: (err as Error).message }, 500, cors);
  }
});
