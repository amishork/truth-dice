import React, { useState, useEffect, useCallback } from "react";
import { api, type RevenueSummary } from "./api";

function currency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const SEGMENT_LABELS: Record<string, string> = {
  individual: "Individual",
  family: "Family",
  school: "School",
  organization: "Organization",
};

const SEGMENT_COLORS: Record<string, string> = {
  individual: "#5B7B8C",
  family: "#D4A574",
  school: "#C4943D",
  organization: "#5B8C5A",
};

// ─── Simple Bar Chart ───

function BarChart({ data, maxVal }: { data: { label: string; value: number }[]; maxVal?: number }) {
  const max = maxVal || Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: "0.5625rem", fontFamily: "var(--ac-font-mono)", color: d.value > 0 ? "var(--ac-text-secondary)" : "transparent" }}>
            {d.value > 0 ? currency(d.value) : ""}
          </span>
          <div
            style={{
              width: "100%",
              maxWidth: 40,
              height: `${Math.max((d.value / max) * 100, 2)}%`,
              background: d.value > 0 ? "var(--ac-accent)" : "var(--ac-bg-hover)",
              borderRadius: "4px 4px 0 0",
              minHeight: 2,
              transition: "height 0.3s ease",
              opacity: d.value > 0 ? 0.7 : 0.3,
            }}
          />
          <span style={{ fontSize: "0.5625rem", color: "var(--ac-text-muted)", whiteSpace: "nowrap" }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut segment ───

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "var(--ac-text-muted)", fontSize: "0.8125rem" }}>
        No revenue data yet
      </div>
    );
  }

  let cumAngle = 0;
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const strokeWidth = 20;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        {data.filter(d => d.value > 0).map((d, i) => {
          const angle = (d.value / total) * 360;
          const startAngle = cumAngle;
          cumAngle += angle;
          const endAngle = cumAngle;

          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((endAngle - 90) * Math.PI) / 180;
          const largeArc = angle > 180 ? 1 : 0;

          const x1 = cx + radius * Math.cos(startRad);
          const y1 = cy + radius * Math.sin(startRad);
          const x2 = cx + radius * Math.cos(endRad);
          const y2 = cy + radius * Math.sin(endRad);

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--ac-text)" fontSize="16" fontFamily="var(--ac-font-mono)" fontWeight="600">
          {currency(total)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--ac-text-muted)" fontSize="9">
          Total
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.filter(d => d.value > 0).map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: "0.75rem", color: "var(--ac-text-secondary)" }}>{d.label}</span>
            <span style={{ fontSize: "0.75rem", fontFamily: "var(--ac-font-mono)", color: "var(--ac-text)" }}>{currency(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Revenue Dashboard ───

export default function Revenue({ password }: { password: string }) {
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(password, "revenue_summary")
      .then(res => setData(res as RevenueSummary))
      .finally(() => setLoading(false));
  }, [password]);

  if (loading || !data) {
    return <div className="ac-loading"><div className="ac-spinner" /></div>;
  }

  const monthData = Object.entries(data.byMonth).map(([k, v]) => ({
    label: k.slice(5), // "01", "02", etc.
    value: v,
  }));

  const segmentDonut = Object.entries(SEGMENT_LABELS).map(([key, label]) => ({
    label,
    value: data.bySegment[key] || 0,
    color: SEGMENT_COLORS[key] || "var(--ac-text-muted)",
  }));

  const hasRevenue = data.totalRevenue > 0 || data.totalContract > 0;

  return (
    <div>
      <div className="ac-section-title">Revenue</div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="ac-stat">
          <div className="ac-stat-label">Total Revenue</div>
          <div className="ac-stat-value" style={{ color: "var(--ac-success)" }}>{currency(data.totalRevenue)}</div>
        </div>
        <div className="ac-stat">
          <div className="ac-stat-label">Contract Value</div>
          <div className="ac-stat-value">{currency(data.totalContract)}</div>
        </div>
        <div className="ac-stat">
          <div className="ac-stat-label">Outstanding</div>
          <div className="ac-stat-value" style={{ color: data.outstanding > 0 ? "var(--ac-warning)" : "var(--ac-text-muted)" }}>
            {currency(data.outstanding)}
          </div>
        </div>
        <div className="ac-stat">
          <div className="ac-stat-label">Pipeline Leads</div>
          <div className="ac-stat-value">{data.pipelineCount}</div>
          <div className="ac-stat-sub">In conversation + proposal sent</div>
        </div>
      </div>

      {!hasRevenue ? (
        <div className="ac-card" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>💰</div>
          <div style={{ fontFamily: "var(--ac-font-display)", fontSize: "1.125rem", color: "var(--ac-text)", marginBottom: 8 }}>
            No revenue recorded yet
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--ac-text-muted)", maxWidth: 400, margin: "0 auto" }}>
            Revenue data populates as you create engagements and track payments. Go to Engagements to create your first client engagement.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Revenue by month */}
          <div className="ac-card">
            <div className="ac-card-header">Revenue by Month (Last 12)</div>
            <BarChart data={monthData} />
          </div>

          {/* Revenue by segment */}
          <div className="ac-card">
            <div className="ac-card-header">Revenue by Segment</div>
            <DonutChart data={segmentDonut} />
          </div>

          {/* Average deal size */}
          <div className="ac-card">
            <div className="ac-card-header">Average Deal Size by Segment</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(data.avgBySegment).length === 0 ? (
                <div style={{ color: "var(--ac-text-muted)", fontSize: "0.8125rem" }}>No completed deals yet</div>
              ) : (
                Object.entries(data.avgBySegment).map(([seg, avg]) => (
                  <div key={seg} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: SEGMENT_COLORS[seg] || "var(--ac-text-muted)" }} />
                      <span style={{ fontSize: "0.8125rem", color: "var(--ac-text)" }}>{SEGMENT_LABELS[seg] || seg}</span>
                    </div>
                    <span style={{ fontFamily: "var(--ac-font-mono)", fontWeight: 600, color: "var(--ac-text)" }}>{currency(avg)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Engagement status breakdown */}
          <div className="ac-card">
            <div className="ac-card-header">Engagement Status</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {Object.entries(data.byStatus).map(([status, count]) => (
                <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--ac-text-secondary)", textTransform: "capitalize" }}>{status}</span>
                  <span style={{ fontFamily: "var(--ac-font-mono)", fontWeight: 600, fontSize: "1rem", color: "var(--ac-text)" }}>{count}</span>
                </div>
              ))}
              {Object.keys(data.byStatus).length === 0 && (
                <div style={{ color: "var(--ac-text-muted)", fontSize: "0.8125rem", gridColumn: "1/-1" }}>No engagements yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
