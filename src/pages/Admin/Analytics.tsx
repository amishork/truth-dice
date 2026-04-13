import React, { useState, useEffect } from "react";
import { api } from "./api";

type AnalyticsTab = "funnel" | "quiz" | "chat" | "source";

// ─── Funnel ───

function FunnelViz({ data, period }: { data: Record<string, number>; period: string }) {
  const stages = [
    { key: "quizCompletions", label: "Quiz Completions", color: "#5B7B8C" },
    { key: "emailCaptures", label: "Email Captures", color: "#7B8C5B" },
    { key: "chatBookings", label: "Chat Bookings", color: "#C4943D" },
    { key: "contactForms", label: "Contact Forms", color: "#D4A574" },
    { key: "won", label: "Won", color: "#5B8C5A" },
  ];

  const max = Math.max(...stages.map(s => data[s.key] || 0), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 500 }}>
      {stages.map((stage, i) => {
        const count = data[stage.key] || 0;
        const prevCount = i > 0 ? (data[stages[i - 1].key] || 0) : 0;
        const convRate = i > 0 && prevCount > 0 ? ((count / prevCount) * 100).toFixed(1) : null;
        const widthPct = Math.max((count / max) * 100, 12);

        return (
          <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 40,
                  width: `${widthPct}%`,
                  background: `${stage.color}40`,
                  borderLeft: `3px solid ${stage.color}`,
                  borderRadius: "0 6px 6px 0",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 12,
                  marginLeft: "auto",
                  marginRight: "auto",
                  transition: "width 0.4s ease",
                }}
              >
                <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ac-text)", whiteSpace: "nowrap" }}>
                  {stage.label}
                </span>
              </div>
            </div>
            <div style={{ width: 60, textAlign: "right" }}>
              <span style={{ fontFamily: "var(--ac-font-mono)", fontWeight: 600, fontSize: "1rem", color: "var(--ac-text)" }}>
                {count}
              </span>
            </div>
            <div style={{ width: 60, textAlign: "right" }}>
              {convRate && (
                <span style={{ fontSize: "0.6875rem", color: "var(--ac-text-muted)" }}>
                  {convRate}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FunnelOverview({ password }: { password: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(password, "funnel_data", { days: period }).then(setData).finally(() => setLoading(false));
  }, [password, period]);

  if (loading || !data) return <div className="ac-loading"><div className="ac-spinner" /></div>;

  const allTime = data.allTime as Record<string, number>;
  const periodData = data.period as Record<string, number>;

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[7, 30, 90].map(d => (
          <button key={d} className={`ac-btn ${period === d ? "ac-btn-primary" : "ac-btn-ghost"} ac-btn-sm`} onClick={() => setPeriod(d)}>
            {d}d
          </button>
        ))}
        <button className={`ac-btn ${period === 9999 ? "ac-btn-primary" : "ac-btn-ghost"} ac-btn-sm`} onClick={() => setPeriod(9999)}>
          All Time
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div className="ac-card">
          <div className="ac-card-header">{period >= 9999 ? "All Time" : `Last ${period} Days`}</div>
          <FunnelViz data={period >= 9999 ? allTime : periodData} period={period >= 9999 ? "all" : `${period}d`} />
        </div>
        {period < 9999 && (
          <div className="ac-card">
            <div className="ac-card-header">All Time</div>
            <FunnelViz data={allTime} period="all" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quiz Intelligence ───

function QuizIntelligence({ password }: { password: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(password, "quiz_analytics").then(setData).finally(() => setLoading(false));
  }, [password]);

  if (loading || !data) return <div className="ac-loading"><div className="ac-spinner" /></div>;

  const total = data.total as number;
  const avgDuration = data.avgDuration as number;
  const areaCounts = data.areaCounts as Record<string, number>;
  const valueCounts = data.valueCounts as Record<string, number>;
  const durationBuckets = data.durationBuckets as number[];
  const topPairs = data.topPairs as { values: string[]; count: number }[];
  const repeatUsers = data.repeatUsers as number;
  const totalUsers = data.totalUsers as number;

  const topValues = Object.entries(valueCounts).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const maxValCount = topValues[0]?.[1] || 1;

  const durationLabels = ["0–2m", "2–4m", "4–6m", "6–8m", "8–10m", "10+m"];
  const maxDurBucket = Math.max(...durationBuckets, 1);

  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);
  const maxAreaCount = sortedAreas[0]?.[1] || 1;

  return (
    <div>
      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="ac-stat">
          <div className="ac-stat-label">Total Quizzes</div>
          <div className="ac-stat-value">{total}</div>
        </div>
        <div className="ac-stat">
          <div className="ac-stat-label">Avg Duration</div>
          <div className="ac-stat-value">{avgDuration > 0 ? `${Math.round(avgDuration / 60)}m` : "—"}</div>
        </div>
        <div className="ac-stat">
          <div className="ac-stat-label">Repeat Users</div>
          <div className="ac-stat-value">{repeatUsers}</div>
          <div className="ac-stat-sub">of {totalUsers} tracked</div>
        </div>
        <div className="ac-stat">
          <div className="ac-stat-label">Areas Explored</div>
          <div className="ac-stat-value">{Object.keys(areaCounts).length}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Top values */}
        <div className="ac-card">
          <div className="ac-card-header">Top 20 Values</div>
          <div>
            {topValues.map(([name, count]) => (
              <div key={name} className="ac-bar-row">
                <span className="ac-bar-label">{name}</span>
                <div className="ac-bar-track">
                  <div className="ac-bar-fill" style={{ width: `${(count / maxValCount) * 100}%` }} />
                </div>
                <span className="ac-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Area of life */}
          <div className="ac-card">
            <div className="ac-card-header">Area of Life Popularity</div>
            <div>
              {sortedAreas.map(([area, count]) => (
                <div key={area} className="ac-bar-row">
                  <span className="ac-bar-label">{area}</span>
                  <div className="ac-bar-track">
                    <div className="ac-bar-fill" style={{ width: `${(count / maxAreaCount) * 100}%`, opacity: 0.5 }} />
                  </div>
                  <span className="ac-bar-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Duration distribution */}
          <div className="ac-card">
            <div className="ac-card-header">Time to Completion</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
              {durationBuckets.map((count, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: "0.6875rem", fontFamily: "var(--ac-font-mono)", color: count > 0 ? "var(--ac-text-secondary)" : "transparent" }}>
                    {count}
                  </span>
                  <div style={{
                    width: "100%",
                    height: `${Math.max((count / maxDurBucket) * 80, 2)}px`,
                    background: count > 0 ? "var(--ac-accent)" : "var(--ac-bg-hover)",
                    borderRadius: "4px 4px 0 0",
                    opacity: count > 0 ? 0.6 : 0.3,
                  }} />
                  <span style={{ fontSize: "0.5625rem", color: "var(--ac-text-muted)" }}>{durationLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value co-occurrence */}
        {topPairs.length > 0 && (
          <div className="ac-card" style={{ gridColumn: "1 / -1" }}>
            <div className="ac-card-header">Value Co-occurrence (Top Pairs)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {topPairs.map((pair, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  background: "var(--ac-bg-hover)",
                  borderRadius: 6,
                }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--ac-text)" }}>
                    {pair.values[0]} + {pair.values[1]}
                  </span>
                  <span style={{ fontSize: "0.6875rem", fontFamily: "var(--ac-font-mono)", color: "var(--ac-text-muted)" }}>
                    {pair.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat Analytics ───

function ChatAnalytics({ password }: { password: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(password, "chat_analytics").then(setData).finally(() => setLoading(false));
  }, [password]);

  if (loading || !data) return <div className="ac-loading"><div className="ac-spinner" /></div>;

  const total = data.total as number;
  const byType = data.byType as Record<string, number>;
  const byOffering = data.byOffering as Record<string, number>;
  const byTiming = data.byTiming as Record<string, number>;

  const renderDonut = (label: string, counts: Record<string, number>) => {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = entries[0]?.[1] || 1;
    return (
      <div className="ac-card">
        <div className="ac-card-header">{label}</div>
        {entries.length === 0 ? (
          <div style={{ color: "var(--ac-text-muted)", fontSize: "0.8125rem" }}>No data</div>
        ) : (
          <div>
            {entries.map(([name, count]) => (
              <div key={name} className="ac-bar-row">
                <span className="ac-bar-label">{name}</span>
                <div className="ac-bar-track">
                  <div className="ac-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span className="ac-bar-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="ac-stat">
          <div className="ac-stat-label">Total Bookings</div>
          <div className="ac-stat-value">{total}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {renderDonut("By Customer Type", byType)}
        {renderDonut("By Offering", byOffering)}
        {renderDonut("By Timing", byTiming)}
      </div>
    </div>
  );
}

// ─── Source Attribution ───

function SourceAttribution({ password }: { password: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(password, "source_analytics").then(setData).finally(() => setLoading(false));
  }, [password]);

  if (loading || !data) return <div className="ac-loading"><div className="ac-spinner" /></div>;

  const emailsBySource = data.emailsBySource as Record<string, number>;
  const conversionBySource = data.conversionBySource as Record<string, { total: number; converted: number }>;

  const emailEntries = Object.entries(emailsBySource).sort((a, b) => b[1] - a[1]);
  const maxEmails = emailEntries[0]?.[1] || 1;

  const convEntries = Object.entries(conversionBySource).sort((a, b) => b[1].total - a[1].total);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div className="ac-card">
        <div className="ac-card-header">Leads by Source</div>
        {emailEntries.length === 0 ? (
          <div style={{ color: "var(--ac-text-muted)", fontSize: "0.8125rem" }}>No source data</div>
        ) : (
          <div>
            {emailEntries.map(([source, count]) => (
              <div key={source} className="ac-bar-row">
                <span className="ac-bar-label">{source}</span>
                <div className="ac-bar-track">
                  <div className="ac-bar-fill" style={{ width: `${(count / maxEmails) * 100}%` }} />
                </div>
                <span className="ac-bar-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ac-card">
        <div className="ac-card-header">Conversion by Source</div>
        {convEntries.length === 0 ? (
          <div style={{ color: "var(--ac-text-muted)", fontSize: "0.8125rem" }}>No conversion data</div>
        ) : (
          <div>
            {convEntries.map(([source, { total, converted }]) => {
              const rate = total > 0 ? ((converted / total) * 100).toFixed(0) : "0";
              return (
                <div key={source} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--ac-border)" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--ac-text)" }}>{source}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)" }}>{converted}/{total}</span>
                    <span style={{
                      fontSize: "0.75rem",
                      fontFamily: "var(--ac-font-mono)",
                      fontWeight: 600,
                      color: Number(rate) >= 50 ? "var(--ac-success)" : Number(rate) >= 20 ? "var(--ac-warning)" : "var(--ac-text-muted)",
                    }}>
                      {rate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics Container ───

export default function Analytics({ password }: { password: string }) {
  const [tab, setTab] = useState<AnalyticsTab>("funnel");

  const tabs: { id: AnalyticsTab; label: string }[] = [
    { id: "funnel", label: "Funnel" },
    { id: "quiz", label: "Quiz Intelligence" },
    { id: "chat", label: "Chat Analytics" },
    { id: "source", label: "Source Attribution" },
  ];

  return (
    <div>
      <div className="ac-section-title">Analytics</div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--ac-border)", paddingBottom: 1 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 16px",
              fontSize: "0.8125rem",
              fontWeight: 500,
              fontFamily: "var(--ac-font-body)",
              color: tab === t.id ? "var(--ac-accent)" : "var(--ac-text-muted)",
              background: "transparent",
              border: "none",
              borderBottom: tab === t.id ? "2px solid var(--ac-accent)" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "funnel" && <FunnelOverview password={password} />}
      {tab === "quiz" && <QuizIntelligence password={password} />}
      {tab === "chat" && <ChatAnalytics password={password} />}
      {tab === "source" && <SourceAttribution password={password} />}
    </div>
  );
}
