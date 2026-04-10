import React, { useState, useEffect, useCallback } from "react";
import { api, HOLD_STAGES, type EngagementRecord, type EngagementSession, type LeadRecord, fmtDate } from "./api";

const SEGMENT_LABELS: Record<string, string> = {
  individual: "Individual",
  family: "Family",
  school: "School",
  organization: "Organization",
};

const STATUS_COLORS: Record<string, string> = {
  active: "var(--ac-success)",
  completed: "var(--ac-accent)",
  paused: "var(--ac-warning)",
  cancelled: "var(--ac-danger)",
};

function HoldIndicator({ stage }: { stage: string | null }) {
  const stages = ["honor", "observe", "live", "declare"];
  const idx = stage ? stages.indexOf(stage) : -1;
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {stages.map((s, i) => (
        <div
          key={s}
          title={s.charAt(0).toUpperCase() + s.slice(1)}
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: i <= idx ? "var(--ac-accent)" : "var(--ac-bg-hover)",
            color: i <= idx ? "#0F0F0F" : "var(--ac-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.5625rem",
            fontWeight: 700,
            fontFamily: "var(--ac-font-mono)",
          }}
        >
          {s[0].toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function currency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// ─── Create/Edit Engagement Modal ───

function EngagementForm({
  initial,
  leads,
  onSave,
  onCancel,
}: {
  initial?: EngagementRecord;
  leads: LeadRecord[];
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    client_name: initial?.client_name || "",
    organization: initial?.organization || "",
    engagement_type: initial?.engagement_type || "",
    tier: initial?.tier || "",
    segment: initial?.segment || "individual",
    contract_value: initial?.contract_value || 0,
    amount_invoiced: initial?.amount_invoiced || 0,
    amount_received: initial?.amount_received || 0,
    status: initial?.status || "active",
    start_date: initial?.start_date || new Date().toISOString().slice(0, 10),
    end_date: initial?.end_date || "",
    sessions_total: initial?.sessions_total || 0,
    notes: initial?.notes || "",
    lead_id: initial?.lead_id || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: Record<string, unknown> = { ...form };
      if (!data.lead_id) delete data.lead_id;
      if (!data.end_date) delete data.end_date;
      if (!data.tier) delete data.tier;
      data.contract_value = Number(data.contract_value) || 0;
      data.amount_invoiced = Number(data.amount_invoiced) || 0;
      data.amount_received = Number(data.amount_received) || 0;
      data.sessions_total = Number(data.sessions_total) || 0;
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: 4 };
  const labelStyle = { fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.05em" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={onCancel} />
      <div className="ac-card" style={{ position: "relative", zIndex: 1, width: 560, maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto" }}>
        <div className="ac-card-header">{initial ? "Edit Engagement" : "New Engagement"}</div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Client Name *</label>
              <input className="ac-input" value={form.client_name} onChange={e => set("client_name", e.target.value)} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Organization</label>
              <input className="ac-input" value={form.organization} onChange={e => set("organization", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Engagement Type *</label>
              <input className="ac-input" value={form.engagement_type} onChange={e => set("engagement_type", e.target.value)} placeholder="Family Values Workshop, School Audit..." required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Tier</label>
              <select className="ac-input" value={form.tier} onChange={e => set("tier", e.target.value)}>
                <option value="">—</option>
                <option value="I">Tier I</option>
                <option value="II">Tier II</option>
                <option value="III">Tier III</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Segment</label>
              <select className="ac-input" value={form.segment} onChange={e => set("segment", e.target.value)}>
                {Object.entries(SEGMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Contract Value</label>
              <input className="ac-input" type="number" value={form.contract_value} onChange={e => set("contract_value", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Invoiced</label>
              <input className="ac-input" type="number" value={form.amount_invoiced} onChange={e => set("amount_invoiced", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Received</label>
              <input className="ac-input" type="number" value={form.amount_received} onChange={e => set("amount_received", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <select className="ac-input" value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Start Date</label>
              <input className="ac-input" type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>End Date</label>
              <input className="ac-input" type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Total Sessions</label>
              <input className="ac-input" type="number" value={form.sessions_total} onChange={e => set("sessions_total", e.target.value)} />
            </div>
          </div>
          {leads.length > 0 && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Link to Lead</label>
              <select className="ac-input" value={form.lead_id} onChange={e => set("lead_id", e.target.value)}>
                <option value="">— None —</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.name || l.email || "Unknown"}</option>
                ))}
              </select>
            </div>
          )}
          <div style={fieldStyle}>
            <label style={labelStyle}>Notes</label>
            <textarea className="ac-input" value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} style={{ resize: "vertical", fontFamily: "var(--ac-font-body)" }} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="ac-btn ac-btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="ac-btn ac-btn-primary" disabled={saving || !form.client_name || !form.engagement_type}>
              {saving ? "Saving..." : initial ? "Save Changes" : "Create Engagement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Session Form ───

function SessionForm({
  onSave,
  onCancel,
}: {
  onSave: (data: { session_date: string; session_notes: string; hold_stage: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [holdStage, setHoldStage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ session_date: date, session_notes: notes, hold_stage: holdStage });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ac-card" style={{ marginTop: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Date</label>
          <input className="ac-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>HOLD Stage</label>
          <select className="ac-input" value={holdStage} onChange={e => setHoldStage(e.target.value)}>
            <option value="">— None —</option>
            {HOLD_STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Session Notes</label>
        <textarea className="ac-input" value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: "vertical", fontFamily: "var(--ac-font-body)" }} />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button type="button" className="ac-btn ac-btn-ghost ac-btn-sm" onClick={onCancel}>Cancel</button>
        <button type="submit" className="ac-btn ac-btn-primary ac-btn-sm" disabled={saving}>{saving ? "Saving..." : "Log Session"}</button>
      </div>
    </form>
  );
}

// ─── Engagement Detail ───

function EngagementDetail({
  password,
  engagementId,
  onBack,
  onRefresh,
}: {
  password: string;
  engagementId: string;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [engagement, setEngagement] = useState<EngagementRecord | null>(null);
  const [sessions, setSessions] = useState<EngagementSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, leadsRes] = await Promise.all([
        api(password, "engagement_detail", { id: engagementId }),
        api(password, "leads", { limit: 100 }),
      ]);
      setEngagement(res.engagement);
      setSessions(res.sessions || []);
      setLeads(leadsRes.data || []);
    } finally {
      setLoading(false);
    }
  }, [password, engagementId]);

  useEffect(() => { load(); }, [load]);

  const handleAddSession = async (data: { session_date: string; session_notes: string; hold_stage: string }) => {
    await api(password, "create_session", { engagement_id: engagementId, ...data });
    setShowSessionForm(false);
    load();
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    await api(password, "update_engagement", { id: engagementId, ...data });
    setEditing(false);
    load();
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this engagement? This cannot be undone.")) return;
    await api(password, "delete_engagement", { id: engagementId });
    onRefresh();
    onBack();
  };

  if (loading || !engagement) {
    return <div className="ac-loading"><div className="ac-spinner" /></div>;
  }

  const latestHold = sessions.filter(s => s.hold_stage).slice(-1)[0]?.hold_stage || null;
  const outstanding = (engagement.amount_invoiced || 0) - (engagement.amount_received || 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="ac-btn-icon" onClick={onBack} style={{ fontSize: "1.25rem" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--ac-font-display)", fontSize: "1.25rem", fontWeight: 500, color: "var(--ac-text)" }}>
            {engagement.client_name}{engagement.organization ? ` — ${engagement.organization}` : ""}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
            <span className="ac-badge" style={{ background: `${STATUS_COLORS[engagement.status]}25`, color: STATUS_COLORS[engagement.status] }}>
              {engagement.status}
            </span>
            <span className="ac-badge" style={{ background: "var(--ac-bg-hover)", color: "var(--ac-text-secondary)" }}>
              {SEGMENT_LABELS[engagement.segment]}
            </span>
            <span style={{ fontSize: "0.8125rem", color: "var(--ac-text-secondary)" }}>
              {engagement.engagement_type}{engagement.tier ? ` · Tier ${engagement.tier}` : ""}
            </span>
          </div>
        </div>
        <HoldIndicator stage={latestHold} />
        <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={() => setEditing(true)}>Edit</button>
        <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={handleDelete} style={{ color: "var(--ac-danger)" }}>Delete</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "flex-start" }}>
        {/* Left — financials & metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Financial summary */}
          <div className="ac-card">
            <div className="ac-card-header">Financial Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div className="ac-stat-label">Contract Value</div>
                <div style={{ fontFamily: "var(--ac-font-mono)", fontSize: "1.25rem", fontWeight: 600, color: "var(--ac-text)" }}>{currency(engagement.contract_value)}</div>
              </div>
              <div>
                <div className="ac-stat-label">Received</div>
                <div style={{ fontFamily: "var(--ac-font-mono)", fontSize: "1.25rem", fontWeight: 600, color: "var(--ac-success)" }}>{currency(engagement.amount_received)}</div>
              </div>
              <div>
                <div className="ac-stat-label">Invoiced</div>
                <div style={{ fontFamily: "var(--ac-font-mono)", fontSize: "1rem", color: "var(--ac-text-secondary)" }}>{currency(engagement.amount_invoiced)}</div>
              </div>
              <div>
                <div className="ac-stat-label">Outstanding</div>
                <div style={{ fontFamily: "var(--ac-font-mono)", fontSize: "1rem", color: outstanding > 0 ? "var(--ac-warning)" : "var(--ac-text-muted)" }}>{currency(outstanding)}</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="ac-card">
            <div className="ac-card-header">Progress</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ flex: 1, height: 8, background: "var(--ac-bg-hover)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: engagement.sessions_total > 0 ? `${(engagement.sessions_completed / engagement.sessions_total) * 100}%` : "0%",
                  background: "var(--ac-accent)",
                  borderRadius: 4,
                  transition: "width 0.3s ease",
                }} />
              </div>
              <span style={{ fontFamily: "var(--ac-font-mono)", fontSize: "0.8125rem", color: "var(--ac-text-secondary)" }}>
                {engagement.sessions_completed}/{engagement.sessions_total}
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)" }}>
              {engagement.start_date && `Started ${new Date(engagement.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
              {engagement.end_date && ` · Ends ${new Date(engagement.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </div>
          </div>

          {/* Notes */}
          {engagement.notes && (
            <div className="ac-card">
              <div className="ac-card-header">Notes</div>
              <p style={{ fontSize: "0.8125rem", color: "var(--ac-text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                {engagement.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right — session log */}
        <div>
          <div className="ac-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="ac-card-header" style={{ marginBottom: 0 }}>Session Log</div>
              <button className="ac-btn ac-btn-primary ac-btn-sm" onClick={() => setShowSessionForm(true)}>+ Log Session</button>
            </div>

            {showSessionForm && (
              <SessionForm onSave={handleAddSession} onCancel={() => setShowSessionForm(false)} />
            )}

            {sessions.length === 0 && !showSessionForm ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ac-text-muted)", fontSize: "0.8125rem" }}>
                No sessions logged yet.
              </div>
            ) : (
              <div>
                {sessions.map((session, i) => (
                  <div
                    key={session.id}
                    style={{
                      padding: "14px 0",
                      borderBottom: i < sessions.length - 1 ? "1px solid var(--ac-border)" : "none",
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: session.hold_stage ? "var(--ac-accent-subtle)" : "var(--ac-bg-hover)",
                      color: session.hold_stage ? "var(--ac-accent)" : "var(--ac-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      fontFamily: "var(--ac-font-mono)",
                    }}>
                      {session.hold_stage ? session.hold_stage[0].toUpperCase() : (i + 1)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ac-text)" }}>
                          {session.session_date
                            ? new Date(session.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "No date"}
                        </span>
                        {session.hold_stage && (
                          <span className="ac-badge" style={{ background: "var(--ac-accent-subtle)", color: "var(--ac-accent)" }}>
                            {session.hold_stage.charAt(0).toUpperCase() + session.hold_stage.slice(1)}
                          </span>
                        )}
                      </div>
                      {session.session_notes && (
                        <p style={{ fontSize: "0.8125rem", color: "var(--ac-text-secondary)", marginTop: 4, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {session.session_notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <EngagementForm
          initial={engagement}
          leads={leads}
          onSave={handleEdit}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

// ─── Engagements List ───

export default function Engagements({ password }: { password: string }) {
  const [engagements, setEngagements] = useState<EngagementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [engRes, leadsRes] = await Promise.all([
        api(password, "engagements"),
        api(password, "leads", { limit: 100 }),
      ]);
      setEngagements(engRes.data || []);
      setLeads(leadsRes.data || []);
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: Record<string, unknown>) => {
    await api(password, "create_engagement", data);
    setShowCreate(false);
    load();
  };

  if (selectedId) {
    return (
      <EngagementDetail
        password={password}
        engagementId={selectedId}
        onBack={() => setSelectedId(null)}
        onRefresh={load}
      />
    );
  }

  const filtered = filter === "all" ? engagements : engagements.filter(e => e.status === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="ac-section-title" style={{ marginBottom: 0 }}>Engagements</div>
        <button className="ac-btn ac-btn-primary ac-btn-sm" onClick={() => setShowCreate(true)}>+ New Engagement</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["all", "active", "completed", "paused", "cancelled"].map(f => (
          <button
            key={f}
            className={`ac-btn ${filter === f ? "ac-btn-primary" : "ac-btn-ghost"} ac-btn-sm`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && ` (${engagements.filter(e => e.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ac-loading"><div className="ac-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="ac-card" style={{ textAlign: "center", padding: 48, color: "var(--ac-text-muted)" }}>
          {engagements.length === 0 ? "No engagements yet. Create one to start tracking client work." : "No engagements match this filter."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map(eng => (
            <div
              key={eng.id}
              className="ac-card"
              onClick={() => setSelectedId(eng.id)}
              style={{ cursor: "pointer" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 500, color: "var(--ac-text)", fontSize: "0.9375rem" }}>
                    {eng.client_name}
                  </div>
                  {eng.organization && (
                    <div style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)" }}>{eng.organization}</div>
                  )}
                </div>
                <span className="ac-badge" style={{ background: `${STATUS_COLORS[eng.status]}25`, color: STATUS_COLORS[eng.status] }}>
                  {eng.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <span className="ac-badge" style={{ background: "var(--ac-bg-hover)", color: "var(--ac-text-secondary)" }}>
                  {SEGMENT_LABELS[eng.segment]}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--ac-text-secondary)" }}>
                  {eng.engagement_type}{eng.tier ? ` · Tier ${eng.tier}` : ""}
                </span>
              </div>

              {/* Progress bar */}
              {eng.sessions_total > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, height: 4, background: "var(--ac-bg-hover)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(eng.sessions_completed / eng.sessions_total) * 100}%`, background: "var(--ac-accent)", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: "var(--ac-font-mono)", fontSize: "0.6875rem", color: "var(--ac-text-muted)" }}>
                    {eng.sessions_completed}/{eng.sessions_total}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--ac-font-mono)", fontSize: "0.875rem", fontWeight: 600, color: "var(--ac-text)" }}>
                  {currency(eng.contract_value)}
                </span>
                {eng.start_date && (
                  <span style={{ fontSize: "0.6875rem", color: "var(--ac-text-muted)" }}>
                    {new Date(eng.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <EngagementForm leads={leads} onSave={handleCreate} onCancel={() => setShowCreate(false)} />
      )}
    </div>
  );
}
