import React, { useMemo, useState, useEffect } from "react";
import { api, type OverviewData, type BookingRecord, type ContactRecord, type EmailRecord, type QuizRecord, type TestimonialRecord, type DataHealth, timeAgo } from "./api";

// ─── Sparkline ───

function Sparkline({ data, width = 80, height = 24 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const linePath = `M${points.join("L")}`;
  const areaPath = `${linePath}L${width},${height}L0,${height}Z`;
  return (
    <svg className="ac-sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path className="ac-sparkline-area" d={areaPath} />
      <path className="ac-sparkline-line" d={linePath} />
    </svg>
  );
}

// ─── Action Queue Item Types ───

interface ActionItem {
  id: string;
  type: "booking" | "contact" | "testimonial";
  urgency: "overdue" | "today" | "upcoming";
  name: string;
  description: string;
  time: string;
  timeAgo: string;
}

// ─── Activity Feed Item Types ───

interface FeedItem {
  id: string;
  type: "quiz" | "email" | "booking" | "contact" | "testimonial";
  name: string;
  description: string;
  timeAgo: string;
  timestamp: number;
}

// ─── Build Action Queue from existing data ───

function buildActionQueue(
  bookings: BookingRecord[],
  contacts: ContactRecord[],
  testimonials: TestimonialRecord[]
): ActionItem[] {
  const now = Date.now();
  const items: ActionItem[] = [];

  // Bookings awaiting follow-up (all bookings are action items since we have no "followed_up" flag yet)
  for (const b of bookings) {
    const age = now - new Date(b.created_at).getTime();
    const hoursOld = age / 3600000;
    let urgency: ActionItem["urgency"] = "upcoming";
    if (hoursOld > 48) urgency = "overdue";
    else if (hoursOld > 12) urgency = "today";

    items.push({
      id: `booking-${b.created_at}`,
      type: "booking",
      urgency,
      name: b.name || "Unknown",
      description: `${b.customer_type || "Individual"} — ${b.offering || "General inquiry"}`,
      time: b.created_at,
      timeAgo: timeAgo(b.created_at),
    });
  }

  // Recent contact submissions (last 7 days)
  for (const c of contacts) {
    const age = now - new Date(c.created_at).getTime();
    if (age > 7 * 86400000) continue;
    const hoursOld = age / 3600000;
    let urgency: ActionItem["urgency"] = "upcoming";
    if (hoursOld > 48) urgency = "overdue";
    else if (hoursOld > 12) urgency = "today";

    items.push({
      id: `contact-${c.created_at}`,
      type: "contact",
      urgency,
      name: c.name || c.email || "Unknown",
      description: c.service_interest ? `Interest: ${c.service_interest}` : (c.message?.slice(0, 60) || "Contact form submission"),
      time: c.created_at,
      timeAgo: timeAgo(c.created_at),
    });
  }

  // Pending testimonials
  for (const t of testimonials.filter(t => t.status === "pending")) {
    items.push({
      id: `testimonial-${t.id}`,
      type: "testimonial",
      urgency: "today",
      name: t.name || "Anonymous",
      description: "Testimonial pending review",
      time: t.created_at,
      timeAgo: timeAgo(t.created_at),
    });
  }

  // Sort: overdue first, then today, then upcoming. Within each, newest first.
  const urgencyOrder = { overdue: 0, today: 1, upcoming: 2 };
  items.sort((a, b) => {
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  return items;
}

// ─── Build Activity Feed ───

function buildActivityFeed(
  bookings: BookingRecord[],
  contacts: ContactRecord[],
  emails: EmailRecord[],
  quizzes: QuizRecord[],
  testimonials: TestimonialRecord[]
): FeedItem[] {
  const items: FeedItem[] = [];

  for (const q of quizzes.slice(0, 30)) {
    const duration = q.duration_seconds ? `${Math.round(q.duration_seconds / 60)}m ${q.duration_seconds % 60}s` : "";
    items.push({
      id: `quiz-${q.created_at}`,
      type: "quiz",
      name: q.user_id ? "Returning user" : "Anonymous",
      description: `Completed ${q.area_of_life || "values"} quiz${duration ? ` in ${duration}` : ""}`,
      timeAgo: timeAgo(q.created_at),
      timestamp: new Date(q.created_at).getTime(),
    });
  }

  for (const e of emails.slice(0, 20)) {
    items.push({
      id: `email-${e.created_at}`,
      type: "email",
      name: e.name || e.email,
      description: `Email captured via ${e.source || "unknown source"}`,
      timeAgo: timeAgo(e.created_at),
      timestamp: new Date(e.created_at).getTime(),
    });
  }

  for (const b of bookings.slice(0, 20)) {
    items.push({
      id: `booking-${b.created_at}`,
      type: "booking",
      name: b.name || "Unknown",
      description: `Booking request: ${b.offering || "General"} (${b.customer_type || "Individual"})`,
      timeAgo: timeAgo(b.created_at),
      timestamp: new Date(b.created_at).getTime(),
    });
  }

  for (const c of contacts.slice(0, 20)) {
    items.push({
      id: `contact-${c.created_at}`,
      type: "contact",
      name: c.name || c.email,
      description: c.service_interest ? `Contact: ${c.service_interest}` : "Contact form submission",
      timeAgo: timeAgo(c.created_at),
      timestamp: new Date(c.created_at).getTime(),
    });
  }

  for (const t of testimonials.slice(0, 10)) {
    items.push({
      id: `testimonial-${t.id}`,
      type: "testimonial",
      name: t.name || "Anonymous",
      description: `Testimonial submitted (${t.status})`,
      timeAgo: timeAgo(t.created_at),
      timestamp: new Date(t.created_at).getTime(),
    });
  }

  items.sort((a, b) => b.timestamp - a.timestamp);
  return items.slice(0, 30);
}

// ─── Build Hero Insight Line ───

function buildInsight(
  overview: OverviewData,
  bookings: BookingRecord[],
  contacts: ContactRecord[],
  quizzes: QuizRecord[]
): string {
  const parts: string[] = [];
  const now = Date.now();

  // Pending bookings
  const recentBookings = bookings.filter(b => {
    const age = now - new Date(b.created_at).getTime();
    return age < 7 * 86400000; // last 7 days
  });
  if (recentBookings.length > 0) {
    parts.push(`${recentBookings.length} booking${recentBookings.length > 1 ? "s" : ""} await${recentBookings.length === 1 ? "s" : ""} your follow-up`);
  }

  // Recent contacts
  const recentContacts = contacts.filter(c => {
    const age = now - new Date(c.created_at).getTime();
    return age < 48 * 3600000; // last 48 hours
  });
  if (recentContacts.length > 0) {
    const latest = recentContacts[0];
    const role = latest.role ? ` (${latest.role})` : "";
    parts.push(`${latest.name || "Someone"}${role} submitted a contact form ${timeAgo(latest.created_at)}`);
  }

  // Today's quizzes
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayQuizzes = quizzes.filter(q => new Date(q.created_at).getTime() >= todayStart.getTime());
  if (todayQuizzes.length > 0) {
    parts.push(`${todayQuizzes.length} quiz${todayQuizzes.length > 1 ? "zes" : ""} completed today`);
  } else {
    // Fallback to total
    parts.push(`${overview.counts.quizzes} quizzes completed all time`);
  }

  // Pending testimonials
  if (overview.counts.pendingTestimonials > 0) {
    parts.push(`${overview.counts.pendingTestimonials} testimonial${overview.counts.pendingTestimonials > 1 ? "s" : ""} pending review`);
  }

  if (parts.length === 0) return "Everything is quiet. A good day to create content or reach out to a lead.";

  // Join with periods
  return parts.join(". ") + ".";
}

// ─── Stat with Sparkline ───

function StatStrip({ overview, quizzes, emails }: { overview: OverviewData; quizzes: QuizRecord[]; emails: EmailRecord[] }) {
  // Build 30-day daily quiz counts for sparkline
  const quizSparkline = useMemo(() => {
    const days = 30;
    const counts = new Array(days).fill(0);
    const now = Date.now();
    for (const q of overview.recentQuizzes) {
      const daysAgo = Math.floor((now - new Date(q.created_at).getTime()) / 86400000);
      if (daysAgo >= 0 && daysAgo < days) counts[days - 1 - daysAgo]++;
    }
    return counts;
  }, [overview.recentQuizzes]);

  // Build 30-day email captures sparkline
  const emailSparkline = useMemo(() => {
    const days = 30;
    const counts = new Array(days).fill(0);
    const now = Date.now();
    for (const e of emails) {
      const daysAgo = Math.floor((now - new Date(e.created_at).getTime()) / 86400000);
      if (daysAgo >= 0 && daysAgo < days) counts[days - 1 - daysAgo]++;
    }
    return counts;
  }, [emails]);

  // Today / 7d / 30d counts
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = now - 7 * 86400000;

  const quizzesToday = quizzes.filter(q => new Date(q.created_at).getTime() >= todayStart.getTime()).length;
  const quizzes7d = overview.recentQuizzes.filter(q => new Date(q.created_at).getTime() >= sevenDaysAgo).length;
  const quizzes30d = overview.recentQuizzes.length;

  const leadsToday = emails.filter(e => new Date(e.created_at).getTime() >= todayStart.getTime()).length;
  const leads7d = emails.filter(e => new Date(e.created_at).getTime() >= sevenDaysAgo).length;

  const pendingBookings = overview.counts.bookings; // All bookings are "pending" until pipeline exists

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
      <div className="ac-stat">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="ac-stat-label">Quizzes</div>
            <div className="ac-stat-value">{overview.counts.quizzes}</div>
          </div>
          <Sparkline data={quizSparkline} />
        </div>
        <div className="ac-stat-sub">
          {quizzesToday} today · {quizzes7d} this week · {quizzes30d} this month
        </div>
      </div>

      <div className="ac-stat">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="ac-stat-label">New Leads</div>
            <div className="ac-stat-value">{overview.counts.emails}</div>
          </div>
          <Sparkline data={emailSparkline} />
        </div>
        <div className="ac-stat-sub">
          {leadsToday} today · {leads7d} this week
        </div>
      </div>

      <div className="ac-stat">
        <div>
          <div className="ac-stat-label">Bookings</div>
          <div className="ac-stat-value" style={{ color: pendingBookings > 0 ? "var(--ac-warning)" : undefined }}>
            {pendingBookings}
          </div>
        </div>
        <div className="ac-stat-sub">{overview.counts.contacts} contact forms</div>
      </div>

      <div className="ac-stat">
        <div>
          <div className="ac-stat-label">Testimonials</div>
          <div className="ac-stat-value">{overview.counts.testimonials}</div>
        </div>
        <div className="ac-stat-sub">
          {overview.counts.pendingTestimonials > 0 ? (
            <span style={{ color: "var(--ac-warning)" }}>
              {overview.counts.pendingTestimonials} pending review
            </span>
          ) : "All reviewed"}
        </div>
      </div>
    </div>
  );
}

// ─── Feed Icon ───

function FeedIcon({ type }: { type: FeedItem["type"] }) {
  const icons: Record<string, string> = {
    quiz: "📊",
    email: "✉️",
    booking: "📅",
    contact: "💬",
    testimonial: "⭐",
  };
  return <div className={`ac-feed-icon ${type}`}>{icons[type] || "•"}</div>;
}

// ─── Command Center ───

export default function CommandCenter({
  overview,
  bookings,
  contacts,
  emails,
  quizzes,
  testimonials,
  password,
}: {
  overview: OverviewData;
  bookings: BookingRecord[];
  contacts: ContactRecord[];
  emails: EmailRecord[];
  quizzes: QuizRecord[];
  testimonials: TestimonialRecord[];
  password: string;
}) {
  const insight = useMemo(() => buildInsight(overview, bookings, contacts, quizzes), [overview, bookings, contacts, quizzes]);
  const actionQueue = useMemo(() => buildActionQueue(bookings, contacts, testimonials), [bookings, contacts, testimonials]);
  const activityFeed = useMemo(() => buildActivityFeed(bookings, contacts, emails, quizzes, testimonials), [bookings, contacts, emails, quizzes, testimonials]);

  // Data health fetch
  const [health, setHealth] = useState<DataHealth | null>(null);
  useEffect(() => {
    api(password, "data_health").then(res => setHealth(res.health)).catch(() => {});
  }, [password]);

  const healthIssues = health
    ? health.duplicates.length + health.missing_fields + health.stale_leads + health.engagements_without_sessions + health.sessions_without_notes
    : 0;

  return (
    <div>
      {/* Hero Insight Line */}
      <div className="ac-insight">{insight}</div>

      {/* Quick Stats Strip */}
      <div style={{ margin: "24px 0 32px" }}>
        <StatStrip overview={overview} quizzes={quizzes} emails={emails} />
      </div>

      {/* Data Health Alerts */}
      {health && healthIssues > 0 && (
        <div className="ac-card" style={{ marginBottom: 24, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderLeft: "3px solid var(--ac-warning)" }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div style={{ flex: 1, fontSize: "0.8125rem", color: "var(--ac-text-secondary)" }}>
            <span style={{ fontWeight: 600, color: "var(--ac-text)" }}>{healthIssues} data issue{healthIssues !== 1 ? "s" : ""} found. </span>
            {health.duplicates.length > 0 && <span>{health.duplicates.length} duplicate{health.duplicates.length !== 1 ? "s" : ""}, </span>}
            {health.missing_fields > 0 && <span>{health.missing_fields} incomplete lead{health.missing_fields !== 1 ? "s" : ""}, </span>}
            {health.stale_leads > 0 && <span>{health.stale_leads} stale lead{health.stale_leads !== 1 ? "s" : ""}, </span>}
            {health.engagements_without_sessions > 0 && <span>{health.engagements_without_sessions} engagement{health.engagements_without_sessions !== 1 ? "s" : ""} without sessions</span>}
            <span style={{ marginLeft: 4 }}>→ Check System &gt; Data Health</span>
          </div>
        </div>
      )}

      {/* Two-column: Action Queue + Activity Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "flex-start" }}>
        {/* Action Queue */}
        <div>
          <div className="ac-section-title">Action Queue</div>
          {actionQueue.length === 0 ? (
            <div className="ac-card" style={{ textAlign: "center", padding: 40, color: "var(--ac-text-muted)" }}>
              No pending actions. You're all caught up.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {actionQueue.slice(0, 15).map((item) => (
                <div key={item.id} className={`ac-action-card urgency-${item.urgency}`}>
                  <div className={`ac-action-dot ${item.urgency}`} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontWeight: 500, color: "var(--ac-text)" }}>{item.name}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)", flexShrink: 0 }}>{item.timeAgo}</span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--ac-text-secondary)", marginTop: 2 }}>
                      {item.description}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span className={`ac-badge ${item.type === "booking" ? "ac-badge-pending" : item.type === "testimonial" ? "ac-badge-pending" : "ac-badge-approved"}`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div>
          <div className="ac-section-title">Activity Feed</div>
          <div className="ac-card" style={{ padding: 0 }}>
            <div style={{ padding: "4px 16px", maxHeight: 520, overflowY: "auto" }}>
              {activityFeed.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--ac-text-muted)" }}>
                  No recent activity.
                </div>
              ) : (
                activityFeed.map((item) => (
                  <div key={item.id} className="ac-feed-item">
                    <FeedIcon type={item.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 500, fontSize: "0.8125rem", color: "var(--ac-text)" }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: "0.6875rem", color: "var(--ac-text-muted)", flexShrink: 0 }}>
                          {item.timeAgo}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--ac-text-secondary)", marginTop: 2 }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Analytics — below the fold */}
      <div style={{ marginTop: 40 }}>
        <div className="ac-section-title">Values Intelligence</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Top Selected Values */}
          <div className="ac-card">
            <div className="ac-card-header">Top Selected Values</div>
            <div>
              {overview.topValues.slice(0, 12).map(([name, count]) => {
                const max = overview.topValues[0]?.[1] || 1;
                return (
                  <div key={name} className="ac-bar-row">
                    <span className="ac-bar-label">{name}</span>
                    <div className="ac-bar-track">
                      <div className="ac-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="ac-bar-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Area of Life Breakdown + Last 30 Days */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="ac-card">
              <div className="ac-card-header">Area of Life Breakdown</div>
              <div>
                {Object.entries(overview.areaCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([area, count]) => {
                    const max = Math.max(...Object.values(overview.areaCounts), 1);
                    return (
                      <div key={area} className="ac-bar-row">
                        <span className="ac-bar-label">{area}</span>
                        <div className="ac-bar-track">
                          <div className="ac-bar-fill" style={{ width: `${(count / max) * 100}%`, opacity: 0.5 }} />
                        </div>
                        <span className="ac-bar-count">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="ac-card">
              <div className="ac-card-header">Last 30 Days</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "var(--ac-font-mono)", fontSize: "1.5rem", fontWeight: 600, color: "var(--ac-text)" }}>
                    {overview.recentQuizzes.length}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)" }}>Quizzes completed</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--ac-font-mono)", fontSize: "1.5rem", fontWeight: 600, color: "var(--ac-text)" }}>
                    {overview.recentQuizzes.length > 0
                      ? `${Math.round(
                          overview.recentQuizzes
                            .filter(q => q.duration_seconds)
                            .reduce((sum, q) => sum + (q.duration_seconds || 0), 0) /
                          Math.max(overview.recentQuizzes.filter(q => q.duration_seconds).length, 1) / 60
                        )}m`
                      : "—"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)" }}>Avg duration</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
