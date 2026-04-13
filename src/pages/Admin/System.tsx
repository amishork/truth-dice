import React, { useState, useEffect } from "react";
import { api } from "./api";

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

// ─── System Container ───

export default function System({ password }: { password: string }) {
  return (
    <div>
      <div className="ac-section-title">System</div>

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
