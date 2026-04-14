import React, { useState, useEffect, useCallback } from "react";
import { api, PIPELINE_STAGES, type LeadRecord, type LeadActivity, type PipelineStage, timeAgo, fmtDate } from "./api";

const CUSTOMER_TYPES = ["individual", "family", "school", "organization"] as const;
const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  family: "Family",
  school: "School",
  organization: "Organization",
};

function stageColor(stage: string): string {
  return PIPELINE_STAGES.find(s => s.id === stage)?.color || "#6B6560";
}

function stageLabel(stage: string): string {
  return PIPELINE_STAGES.find(s => s.id === stage)?.label || stage;
}

const ACTIVITY_ICONS: Record<string, string> = {
  quiz_completed: "📊",
  email_captured: "✉️",
  email_sent: "📤",
  chat_completed: "💬",
  booking_requested: "📅",
  contact_submitted: "📝",
  testimonial_submitted: "⭐",
  note_added: "📌",
  stage_changed: "🔄",
  followed_up: "📞",
  dice_purchased: "🎲",
};

function activityDescription(activity: LeadActivity): string {
  const meta = activity.metadata || {};
  switch (activity.activity_type) {
    case "email_captured":
      return `Email captured via ${meta.source || "unknown source"}`;
    case "email_sent":
      return `Email sent: ${meta.subject || meta.template || "—"}`;
    case "contact_submitted":
      return meta.service_interest ? `Contact form: ${meta.service_interest}` : "Submitted contact form";
    case "booking_requested":
      return `Booking request: ${meta.offering || "General"} (${meta.customer_type || "—"})`;
    case "quiz_completed":
      return `Completed ${meta.area_of_life || "values"} quiz`;
    case "note_added":
      return String(meta.note || "Note added");
    case "stage_changed":
      return `Stage: ${stageLabel(String(meta.from))} → ${stageLabel(String(meta.to))}${meta.lost_reason ? ` (${meta.lost_reason})` : ""}`;
    case "followed_up":
      return String(meta.note || "Followed up");
    case "testimonial_submitted":
      return "Testimonial submitted";
    case "dice_purchased":
      return "Purchased Values Dice";
    default:
      return activity.activity_type.replace(/_/g, " ");
  }
}

export default function ContactProfile({
  password,
  leadId,
  onBack,
}: {
  password: string;
  leadId: string;
  onBack: () => void;
}) {
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editType, setEditType] = useState<string>("individual");
  const [editStage, setEditStage] = useState<string>("captured");
  const [editSource, setEditSource] = useState("");
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editFollowUpNote, setEditFollowUpNote] = useState("");

  // New note
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Quick email send
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSendEmail = async () => {
    if (!lead?.email || !emailSubject.trim() || !emailBody.trim()) return;
    setSendingEmail(true);
    try {
      await api(password, "send_email", {
        lead_id: lead.id,
        recipient_email: lead.email,
        subject: emailSubject,
        html: emailBody.replace(/\n/g, "<br/>"),
        template_key: "manual",
      });
      setEmailSubject("");
      setEmailBody("");
      setShowEmailForm(false);
      loadLead();
    } catch { /* */ }
    setSendingEmail(false);
  };

  const loadLead = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api(password, "lead_detail", { id: leadId });
      const l = res.lead as LeadRecord;
      setLead(l);
      setActivities(res.activities || []);
      setEditName(l.name || "");
      setEditEmail(l.email || "");
      setEditPhone(l.phone || "");
      setEditType(l.customer_type || "individual");
      setEditStage(l.pipeline_stage || "captured");
      setEditSource(l.source || "");
      setEditFollowUpDate(l.follow_up_date || "");
      setEditFollowUpNote(l.follow_up_note || "");
    } finally {
      setLoading(false);
    }
  }, [password, leadId]);

  useEffect(() => { loadLead(); }, [loadLead]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      if (editName !== (lead?.name || "")) updates.name = editName || null;
      if (editEmail !== (lead?.email || "")) updates.email = editEmail || null;
      if (editPhone !== (lead?.phone || "")) updates.phone = editPhone || null;
      if (editType !== lead?.customer_type) updates.customer_type = editType;
      if (editSource !== (lead?.source || "")) updates.source = editSource || null;
      if (editFollowUpDate !== (lead?.follow_up_date || "")) updates.follow_up_date = editFollowUpDate || null;
      if (editFollowUpNote !== (lead?.follow_up_note || "")) updates.follow_up_note = editFollowUpNote || null;

      if (Object.keys(updates).length > 0) {
        await api(password, "update_lead", { id: leadId, ...updates });
      }

      // Handle stage change separately (logs activity)
      if (editStage !== lead?.pipeline_stage) {
        await api(password, "update_lead_stage", { id: leadId, stage: editStage });
      }

      await loadLead();
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await api(password, "add_lead_note", { id: leadId, note: newNote.trim() });
      setNewNote("");
      await loadLead();
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    await api(password, "delete_lead", { id: leadId });
    onBack();
  };

  if (loading) {
    return <div className="ac-loading"><div className="ac-spinner" /></div>;
  }

  if (!lead) {
    return (
      <div style={{ textAlign: "center", padding: 48, color: "var(--ac-text-muted)" }}>
        Lead not found.
        <br />
        <button className="ac-btn ac-btn-ghost" onClick={onBack} style={{ marginTop: 16 }}>← Back to Pipeline</button>
      </div>
    );
  }

  const hasChanges =
    editName !== (lead.name || "") ||
    editEmail !== (lead.email || "") ||
    editPhone !== (lead.phone || "") ||
    editType !== lead.customer_type ||
    editStage !== lead.pipeline_stage ||
    editSource !== (lead.source || "") ||
    editFollowUpDate !== (lead.follow_up_date || "") ||
    editFollowUpNote !== (lead.follow_up_note || "");

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="ac-btn-icon" onClick={onBack} style={{ fontSize: "1.25rem" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--ac-font-display)", fontSize: "1.25rem", fontWeight: 500, color: "var(--ac-text)" }}>
            {lead.name || lead.email || "Unknown Contact"}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
            <span className="ac-badge" style={{ background: `${stageColor(lead.pipeline_stage)}25`, color: stageColor(lead.pipeline_stage) }}>
              {stageLabel(lead.pipeline_stage)}
            </span>
            <span className="ac-badge" style={{ background: "var(--ac-bg-hover)", color: "var(--ac-text-secondary)" }}>
              {CUSTOMER_TYPE_LABELS[lead.customer_type]}
            </span>
            <span style={{ fontFamily: "var(--ac-font-mono)", fontSize: "0.75rem", color: "var(--ac-text-muted)" }}>
              Score: {lead.lead_score}
            </span>
          </div>
        </div>
        <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={handleDelete} style={{ color: "var(--ac-danger)" }}>
          Delete
        </button>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 24, alignItems: "flex-start" }}>
        {/* Left column — editable fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Contact Info */}
          <div className="ac-card">
            <div className="ac-card-header">Contact Information</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Name</label>
                <input className="ac-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Email</label>
                <input className="ac-input" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email" type="email" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Phone</label>
                <input className="ac-input" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="Phone" />
              </div>
            </div>
          </div>

          {/* Pipeline */}
          <div className="ac-card">
            <div className="ac-card-header">Pipeline</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Customer Type</label>
                <select className="ac-input" value={editType} onChange={e => setEditType(e.target.value)} style={{ cursor: "pointer" }}>
                  {CUSTOMER_TYPES.map(t => (
                    <option key={t} value={t}>{CUSTOMER_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Stage</label>
                <select className="ac-input" value={editStage} onChange={e => setEditStage(e.target.value)} style={{ cursor: "pointer" }}>
                  {PIPELINE_STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Source</label>
                <input className="ac-input" value={editSource} onChange={e => setEditSource(e.target.value)} placeholder="organic, referral, conference..." />
              </div>
            </div>
          </div>

          {/* Follow-up */}
          <div className="ac-card">
            <div className="ac-card-header">Follow-Up</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Date</label>
                <input className="ac-input" type="date" value={editFollowUpDate} onChange={e => setEditFollowUpDate(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--ac-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Note</label>
                <input className="ac-input" value={editFollowUpNote} onChange={e => setEditFollowUpNote(e.target.value)} placeholder="What to follow up about..." />
              </div>
            </div>
          </div>

          {/* Save button */}
          {hasChanges && (
            <button className="ac-btn ac-btn-primary" onClick={handleSave} disabled={saving} style={{ justifyContent: "center", padding: "10px 16px" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}

          {/* Add Note */}
          <div className="ac-card">
            <div className="ac-card-header">Add Note</div>
            <textarea
              className="ac-input"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Log a call, meeting note, or observation..."
              rows={3}
              style={{ resize: "vertical", fontFamily: "var(--ac-font-body)" }}
            />
            <button
              className="ac-btn ac-btn-ghost ac-btn-sm"
              onClick={handleAddNote}
              disabled={!newNote.trim() || addingNote}
              style={{ marginTop: 8 }}
            >
              {addingNote ? "Adding..." : "Add Note"}
            </button>
          </div>

          {/* Notes log */}
          {lead.notes && (
            <div className="ac-card">
              <div className="ac-card-header">Notes</div>
              <pre style={{
                fontSize: "0.8125rem",
                color: "var(--ac-text-secondary)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "var(--ac-font-body)",
                margin: 0,
              }}>
                {lead.notes}
              </pre>
            </div>
          )}

          {/* Metadata */}
          <div style={{ fontSize: "0.6875rem", color: "var(--ac-text-muted)", padding: "0 4px" }}>
            Created {fmtDate(lead.created_at)}
            {lead.lost_reason && <> · Lost reason: {lead.lost_reason}</>}
          </div>
        </div>

        {/* Right column — email + timeline */}
        <div>
          {/* Quick Email Send */}
          {lead.email && (
            <div className="ac-card" style={{ marginBottom: 16 }}>
              <div className="ac-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Send Email</span>
                <button
                  className="ac-btn ac-btn-ghost ac-btn-sm"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  style={{ fontSize: "0.75rem" }}
                >
                  {showEmailForm ? "Cancel" : "Compose"}
                </button>
              </div>
              {showEmailForm && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)" }}>To: {lead.email}</div>
                  <input
                    className="ac-input"
                    placeholder="Subject"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                  />
                  <textarea
                    className="ac-input"
                    rows={4}
                    placeholder="Message body (plain text, line breaks preserved)"
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                  />
                  <button
                    className="ac-btn ac-btn-primary ac-btn-sm"
                    disabled={!emailSubject.trim() || !emailBody.trim() || sendingEmail}
                    onClick={handleSendEmail}
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="ac-card">
            <div className="ac-card-header">Activity Timeline</div>
            {activities.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ac-text-muted)", fontSize: "0.8125rem" }}>
                No activity recorded yet.
              </div>
            ) : (
              <div>
                {activities.map((activity, i) => (
                  <div
                    key={activity.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 0",
                      borderBottom: i < activities.length - 1 ? "1px solid var(--ac-border)" : "none",
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--ac-bg-hover)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "0.875rem",
                    }}>
                      {ACTIVITY_ICONS[activity.activity_type] || "•"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8125rem", color: "var(--ac-text)" }}>
                        {activityDescription(activity)}
                      </div>

                      {/* Show booking details if available */}
                      {activity.activity_type === "booking_requested" && activity.metadata && (
                        <div style={{ marginTop: 8, padding: "8px 12px", background: "var(--ac-bg)", borderRadius: 6, fontSize: "0.75rem" }}>
                          {activity.metadata.intention && (
                            <div style={{ color: "var(--ac-text-secondary)", marginBottom: 4 }}>
                              <strong style={{ color: "var(--ac-text-muted)" }}>Intention:</strong> {String(activity.metadata.intention)}
                            </div>
                          )}
                          {activity.metadata.desired_outcome && (
                            <div style={{ color: "var(--ac-text-secondary)", marginBottom: 4 }}>
                              <strong style={{ color: "var(--ac-text-muted)" }}>Desired outcome:</strong> {String(activity.metadata.desired_outcome)}
                            </div>
                          )}
                          {activity.metadata.timing && (
                            <div style={{ color: "var(--ac-text-secondary)", marginBottom: 4 }}>
                              <strong style={{ color: "var(--ac-text-muted)" }}>Timing:</strong> {String(activity.metadata.timing)}
                            </div>
                          )}
                          {activity.metadata.core_values && (
                            <div style={{ color: "var(--ac-text-secondary)" }}>
                              <strong style={{ color: "var(--ac-text-muted)" }}>Values:</strong> {String(activity.metadata.core_values)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show contact form details */}
                      {activity.activity_type === "contact_submitted" && activity.metadata?.message && (
                        <div style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--ac-text-secondary)", fontStyle: "italic" }}>
                          "{String(activity.metadata.message).slice(0, 200)}"
                        </div>
                      )}

                      <div style={{ fontSize: "0.6875rem", color: "var(--ac-text-muted)", marginTop: 4 }}>
                        {timeAgo(activity.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
