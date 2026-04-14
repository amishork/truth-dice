import React, { useState, useEffect } from "react";
import { api, type DataHealth } from "./api";

function currency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// ─── Export Center ───

function ExportCenter({ password }: { password: string }) {
  const [exporting, setExporting] = useState<string | null>(null);

  const tables = [
    { key: "leads", label: "Leads (Full Pipeline)" },
    { key: "email_captures", label: "Email Captures" },
    { key: "quiz_sessions", label: "Quiz Sessions" },
    { key: "chat_bookings", label: "Chat Bookings" },
    { key: "contact_submissions", label: "Contact Forms" },
  ];

  const handleExport = async (table: string) => {
    setExporting(table);
    try {
      const res = await api(password, "export_csv", { table });
      const data = res.data || [];
      if (data.length === 0) return;
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map((row: Record<string, unknown>) =>
          headers.map(h => {
            const val = row[h];
            const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
            return `"${str.replace(/"/g, '""')}"`;
          }).join(",")
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="ac-card">
      <div className="ac-card-header">Export Center</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tables.map(t => (
          <div key={t.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--ac-border)" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--ac-text)" }}>{t.label}</span>
            <button
              className="ac-btn ac-btn-ghost ac-btn-sm"
              onClick={() => handleExport(t.key)}
              disabled={exporting === t.key}
            >
              {exporting === t.key ? "Exporting..." : "↓ CSV"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Database Info ───

function DatabaseInfo({ password }: { password: string }) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api(password, "overview");
        const c = res.counts as Record<string, number>;
        // Also get leads count
        const leadsRes = await api(password, "leads", { limit: 1 });
        const engRes = await api(password, "engagements");
        setCounts({
          ...c,
          leads: leadsRes.count || 0,
          engagements: (engRes.data || []).length,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [password]);

  if (loading || !counts) return <div className="ac-loading"><div className="ac-spinner" /></div>;

  const tables = [
    { key: "leads", label: "Leads" },
    { key: "quizzes", label: "Quiz Sessions" },
    { key: "emails", label: "Email Captures" },
    { key: "bookings", label: "Chat Bookings" },
    { key: "contacts", label: "Contact Submissions" },
    { key: "testimonials", label: "Testimonials" },
    { key: "engagements", label: "Engagements" },
  ];

  return (
    <div className="ac-card">
      <div className="ac-card-header">Database</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tables.map(t => (
          <div key={t.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--ac-border)" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--ac-text-secondary)" }}>{t.label}</span>
            <span style={{ fontFamily: "var(--ac-font-mono)", fontWeight: 600, fontSize: "0.875rem", color: "var(--ac-text)" }}>
              {(counts[t.key] || 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: "0.6875rem", color: "var(--ac-text-muted)" }}>
        Total records: {Object.values(counts).reduce((s, v) => s + v, 0).toLocaleString()}
      </div>
    </div>
  );
}

// ─── Edge Function Status ───

function EdgeFunctionStatus() {
  const functions = [
    { name: "admin-data", desc: "Dashboard API — password auth, CRUD, analytics" },
    { name: "values-chat", desc: "AI coach chatbot — 21-step flow, Anthropic API" },
    { name: "send-notification", desc: "Email via Resend — blocked by SPF verification" },
    { name: "generate-dice-image", desc: "Dice image generation" },
  ];

  return (
    <div className="ac-card">
      <div className="ac-card-header">Edge Functions</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {functions.map(f => (
          <div key={f.name} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--ac-border)" }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: f.name === "send-notification" ? "var(--ac-warning)" : "var(--ac-success)",
              marginTop: 5,
              flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ac-text)", fontFamily: "var(--ac-font-mono)" }}>{f.name}</div>
              <div style={{ fontSize: "0.6875rem", color: "var(--ac-text-muted)" }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Integration Status ───

function IntegrationStatus() {
  const integrations = [
    { name: "Supabase", status: "connected", detail: "Project: phfvfesypzoxatueijdt" },
    { name: "Vercel", status: "connected", detail: "Auto-deploys from amishork/truth-dice" },
    { name: "Google OAuth", status: "configured", detail: "Consent screen shows project ref (cosmetic)" },
    { name: "Resend Email", status: "pending", detail: "send.wordsincarnate.com — SPF verification pending" },
    { name: "Shopify", status: "not_connected", detail: "Webhook for dice purchase tracking (Phase 5)" },
    { name: "PostHog", status: "configured", detail: "Client-side analytics active" },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case "connected": return "var(--ac-success)";
      case "configured": return "var(--ac-info)";
      case "pending": return "var(--ac-warning)";
      default: return "var(--ac-text-muted)";
    }
  };

  return (
    <div className="ac-card">
      <div className="ac-card-header">Integrations</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {integrations.map(i => (
          <div key={i.name} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--ac-border)" }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusColor(i.status),
              marginTop: 5,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ac-text)" }}>{i.name}</span>
                <span className="ac-badge" style={{
                  background: `${statusColor(i.status)}20`,
                  color: statusColor(i.status),
                }}>
                  {i.status.replace("_", " ")}
                </span>
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--ac-text-muted)" }}>{i.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Data Health ───

function DataHealthPanel({ password }: { password: string }) {
  const [health, setHealth] = useState<DataHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api(password, "data_health");
        setHealth(res.health);
      } finally {
        setLoading(false);
      }
    })();
  }, [password]);

  const handleMerge = async (email: string) => {
    if (!confirm(`Merge duplicate leads for ${email}? The lead with more data will be kept.`)) return;
    setMerging(email);
    try {
      // Get all leads with this email
      const res = await api(password, "leads", { limit: 100 });
      const dupes = (res.data || []).filter((l: { email: string | null }) => l.email === email);
      if (dupes.length < 2) return;
      // Keep the one with more activity / data
      dupes.sort((a: { notes: string | null; lead_score: number }, b: { notes: string | null; lead_score: number }) => (b.notes?.length || 0) + b.lead_score - (a.notes?.length || 0) - a.lead_score);
      const keepId = dupes[0].id;
      for (let i = 1; i < dupes.length; i++) {
        await api(password, "merge_leads", { keep_id: keepId, delete_id: dupes[i].id });
      }
      // Reload
      const newRes = await api(password, "data_health");
      setHealth(newRes.health);
    } finally {
      setMerging(null);
    }
  };

  if (loading) return <div className="ac-card"><div className="ac-card-header">Data Health</div><div className="ac-loading"><div className="ac-spinner" /></div></div>;
  if (!health) return null;

  const totalIssues = health.duplicates.length + health.missing_fields + health.stale_leads +
    health.engagements_without_sessions + health.sessions_without_notes;

  return (
    <div className="ac-card">
      <div className="ac-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Data Health</span>
        {totalIssues > 0 ? (
          <span className="ac-badge" style={{ background: "var(--ac-warning)20", color: "var(--ac-warning)" }}>
            {totalIssues} issue{totalIssues !== 1 ? "s" : ""}
          </span>
        ) : (
          <span className="ac-badge" style={{ background: "var(--ac-success)20", color: "var(--ac-success)" }}>
            All clear
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Duplicates */}
        <div style={{ padding: "8px 0", borderBottom: "1px solid var(--ac-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
            <span style={{ color: "var(--ac-text-secondary)" }}>Duplicate leads</span>
            <span style={{ fontWeight: 600, color: health.duplicates.length > 0 ? "var(--ac-warning)" : "var(--ac-text-muted)" }}>
              {health.duplicates.length}
            </span>
          </div>
          {health.duplicates.map(d => (
            <div key={d.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingLeft: 12 }}>
              <span style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)" }}>{d.email} ({d.count}x)</span>
              <button
                className="ac-btn ac-btn-ghost ac-btn-sm"
                onClick={() => handleMerge(d.email)}
                disabled={merging === d.email}
                style={{ fontSize: "0.6875rem" }}
              >
                {merging === d.email ? "Merging..." : "Merge"}
              </button>
            </div>
          ))}
        </div>

        {/* Missing fields */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", padding: "8px 0", borderBottom: "1px solid var(--ac-border)" }}>
          <span style={{ color: "var(--ac-text-secondary)" }}>Leads missing critical fields</span>
          <span style={{ fontWeight: 600, color: health.missing_fields > 0 ? "var(--ac-warning)" : "var(--ac-text-muted)" }}>
            {health.missing_fields}
          </span>
        </div>

        {/* Stale leads */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", padding: "8px 0", borderBottom: "1px solid var(--ac-border)" }}>
          <span style={{ color: "var(--ac-text-secondary)" }}>Stale leads (30+ days inactive)</span>
          <span style={{ fontWeight: 600, color: health.stale_leads > 0 ? "var(--ac-warning)" : "var(--ac-text-muted)" }}>
            {health.stale_leads}
          </span>
        </div>

        {/* Engagement integrity */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", padding: "8px 0", borderBottom: "1px solid var(--ac-border)" }}>
          <span style={{ color: "var(--ac-text-secondary)" }}>Engagements without sessions</span>
          <span style={{ fontWeight: 600, color: health.engagements_without_sessions > 0 ? "var(--ac-warning)" : "var(--ac-text-muted)" }}>
            {health.engagements_without_sessions}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", padding: "8px 0" }}>
          <span style={{ color: "var(--ac-text-secondary)" }}>Sessions without notes</span>
          <span style={{ fontWeight: 600, color: health.sessions_without_notes > 0 ? "var(--ac-warning)" : "var(--ac-text-muted)" }}>
            {health.sessions_without_notes}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── System Container ───

export default function System({ password }: { password: string }) {
  return (
    <div>
      <div className="ac-section-title">System</div>

      {/* Data Health — full width at top */}
      <div style={{ marginBottom: 24 }}>
        <DataHealthPanel password={password} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <ExportCenter password={password} />
          <EdgeFunctionStatus />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <DatabaseInfo password={password} />
          <IntegrationStatus />
        </div>
      </div>
    </div>
  );
}
