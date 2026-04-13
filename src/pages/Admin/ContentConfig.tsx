import React, { useState, useEffect, useCallback } from "react";
import { api } from "./api";

// ─── Config Panel ───

function ConfigPanel({ password }: { password: string }) {
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api(password, "get_config");
      setConfig(res.config || {});
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const save = async (key: string, value: unknown) => {
    setSaving(key);
    try {
      await api(password, "set_config", { key, value });
      setConfig(prev => ({ ...prev, [key]: value }));
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="ac-loading"><div className="ac-spinner" /></div>;

  const configItems = [
    {
      key: "workshop_date",
      label: "Workshop Date",
      description: "Currently hardcoded in FreeWorkshop.tsx — once wired, this controls the scarcity date displayed on the workshop page.",
      type: "date" as const,
    },
    {
      key: "workshop_capacity",
      label: "Workshop Capacity",
      description: "Maximum number of workshop registrants.",
      type: "number" as const,
    },
    {
      key: "workshop_title",
      label: "Workshop Title",
      description: "Title shown on the free workshop registration page.",
      type: "text" as const,
    },
    {
      key: "revenue_target_monthly",
      label: "Monthly Revenue Target",
      description: "Displayed as a target line on the revenue dashboard.",
      type: "number" as const,
    },
    {
      key: "revenue_target_annual",
      label: "Annual Revenue Target",
      description: "Annual revenue goal.",
      type: "number" as const,
    },
    {
      key: "follow_up_reminder_days",
      label: "Follow-Up Reminder (Days)",
      description: "Default number of days before a follow-up reminder surfaces in the action queue.",
      type: "number" as const,
    },
  ];

  return (
    <div className="ac-card">
      <div className="ac-card-header">Site Configuration</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {configItems.map(item => {
          const raw = config[item.key];
          const val = typeof raw === "string" ? raw : raw !== undefined ? String(raw) : "";

          return (
            <ConfigField
              key={item.key}
              item={item}
              value={val}
              saving={saving === item.key}
              onSave={(v) => save(item.key, item.type === "number" ? Number(v) : v)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ConfigField({
  item,
  value,
  saving,
  onSave,
}: {
  item: { key: string; label: string; description: string; type: "text" | "number" | "date" };
  value: string;
  saving: boolean;
  onSave: (v: string) => Promise<void>;
}) {
  const [editVal, setEditVal] = useState(value);
  const changed = editVal !== value;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "flex-start" }}>
      <div>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--ac-text)", marginBottom: 2 }}>
          {item.label}
        </label>
        <p style={{ fontSize: "0.6875rem", color: "var(--ac-text-muted)", margin: "0 0 6px" }}>{item.description}</p>
        <input
          className="ac-input"
          type={item.type}
          value={editVal}
          onChange={e => setEditVal(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>
      <div style={{ paddingTop: 24 }}>
        {changed && (
          <button className="ac-btn ac-btn-primary ac-btn-sm" onClick={() => onSave(editVal)} disabled={saving}>
            {saving ? "..." : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Communication Templates ───

const TEMPLATES = [
  {
    id: "first-outreach",
    title: "First Outreach After Booking",
    template: `Hi {name},

Thank you for taking the time to explore your values through our quiz and chat experience. I'm glad to know you're interested in {offering}.

I'd love to set up a brief call to learn more about what you're hoping to accomplish and share how Words Incarnate can help. Would {timing} work for a 15-minute conversation?

Looking forward to connecting.

Warmly,
Alex Mishork
Words Incarnate`,
  },
  {
    id: "workshop-confirm",
    title: "Workshop Confirmation",
    template: `Hi {name},

You're confirmed for our free workshop: "Living Your Values."

Date: {workshop_date}
Format: Interactive, small group (limited to 20 participants)

Come ready to discover what matters most to you — and to have a genuine conversation about values with others who care about the same things.

See you there,
Alex`,
  },
  {
    id: "post-session",
    title: "Post-Session Follow-Up",
    template: `Hi {name},

Thank you for our session today. I enjoyed our conversation about {topic}, and I think the direction we're heading is meaningful.

A few things to reflect on before next time:
- {reflection_1}
- {reflection_2}

Our next session is scheduled for {next_date}. Let me know if you need to adjust.

In the meantime, I'm here if anything comes up.

Alex`,
  },
  {
    id: "testimonial-request",
    title: "Testimonial Request",
    template: `Hi {name},

I hope the values work we did together is still bearing fruit. I'd love to hear how things have gone since our sessions.

Would you be willing to share a brief testimonial about your experience? It doesn't need to be long — even a few sentences about what stood out or what's changed would mean a lot.

You can submit one directly at: https://wordsincarnate.com/testimonials/share

Thank you for considering it.

Warmly,
Alex`,
  },
  {
    id: "proposal-email",
    title: "Proposal Email",
    template: `Hi {name},

Thank you for our conversation about bringing values formation to {organization}. I've put together a proposal based on what we discussed.

Program: {engagement_type} — Tier {tier}
Investment: {contract_value}
Timeline: {timeline}
Sessions: {sessions_total}

The program includes:
- {deliverable_1}
- {deliverable_2}
- {deliverable_3}

I believe this will make a real difference for your {segment}. Let me know if you'd like to discuss any adjustments.

Looking forward to working together.

Alex Mishork
Words Incarnate
alex@wordsincarnate.com`,
  },
  {
    id: "nurture-checkin",
    title: "Nurture Check-In",
    template: `Hi {name},

I hope you're doing well. I wanted to check in — we connected a while back about values work for your {segment_context}, and I wanted to see if the timing might be better now.

No pressure at all. I'm here if and when you're ready.

Warmly,
Alex`,
  },
  {
    id: "school-cold-outreach",
    title: "School Administrator Cold Outreach",
    template: `Dear {name},

My name is Alex Mishork, and I lead Words Incarnate, a values formation consultancy serving Catholic schools across Texas.

I'm reaching out because I believe {school_name} would benefit from a structured approach to values formation — one grounded in the classical Catholic intellectual tradition and designed to complement your existing mission.

Our program helps students identify their core values, articulate them clearly, and build habits that make those values real in daily life. It uses our proprietary HOLD framework (Honor, Observe, Live, Declare) and includes interactive workshops, a digital values quiz, and take-home materials including our custom-engraved Values Dice.

I'd welcome the opportunity to share more. Would you have 15 minutes for a brief call next week?

Respectfully,
Alex Mishork
Founder, Words Incarnate
alex@wordsincarnate.com
wordsincarnate.com`,
  },
];

function Templates() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)", marginBottom: 16 }}>
        Merge fields shown in {"{braces}"} — replace with actual values before sending.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} className="ac-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div className="ac-card-header" style={{ marginBottom: 0 }}>{t.title}</div>
              <button
                className="ac-btn ac-btn-ghost ac-btn-sm"
                onClick={() => handleCopy(t.template, t.id)}
              >
                {copied === t.id ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre style={{
              fontSize: "0.75rem",
              lineHeight: 1.6,
              color: "var(--ac-text-secondary)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "var(--ac-font-body)",
              margin: 0,
              padding: "12px",
              background: "var(--ac-bg)",
              borderRadius: 8,
              border: "1px solid var(--ac-border)",
            }}>
              {t.template}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Content & Config Container ───

type ConfigTab = "config" | "templates";

export default function ContentConfig({ password }: { password: string }) {
  const [tab, setTab] = useState<ConfigTab>("config");

  return (
    <div>
      <div className="ac-section-title">Content & Config</div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--ac-border)", paddingBottom: 1 }}>
        {([
          { id: "config" as const, label: "Configuration" },
          { id: "templates" as const, label: "Communication Templates" },
        ]).map(t => (
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

      {tab === "config" && <ConfigPanel password={password} />}
      {tab === "templates" && <Templates />}
    </div>
  );
}
