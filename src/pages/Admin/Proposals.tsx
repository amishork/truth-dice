import { useState, useEffect, useCallback } from "react";
import { api, type ProposalRecord, fmtDate } from "./api";
import jsPDF from "jspdf";

const SEGMENT_LABELS: Record<string, string> = { family: "Family", school: "School", organization: "Organization" };
const STATUS_COLORS: Record<string, string> = { draft: "#6B6560", sent: "#5B7B8C", viewed: "#C4943D", accepted: "#5B8C5A", declined: "#C45B5B" };

const ENGAGEMENT_TYPES: Record<string, string[]> = {
  school: ["Workshop", "Semester Program", "Full-Year Partnership", "Faculty Formation", "Culture Assessment"],
  family: ["Single Workshop", "3-Session Formation", "Quarterly Coaching", "Family Retreat"],
  organization: ["Leadership Workshop", "Team Alignment Program", "Culture Transformation", "Advisory Partnership"],
};

const DEFAULT_DELIVERABLES: Record<string, string[]> = {
  school: ["Values assessment for faculty", "Custom formation plan", "On-site facilitation", "Follow-up report with recommendations"],
  family: ["Family values discovery session", "Values charter document", "Practical rhythm design", "30-day follow-up check-in"],
  organization: ["Leadership values diagnostic", "Decision-making framework", "Culture alignment report", "Implementation roadmap"],
};

function generatePDF(p: ProposalRecord) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const w = doc.internal.pageSize.getWidth();
  const margin = 60;
  const textW = w - margin * 2;
  let y = 60;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(180, 140, 100);
  doc.text("WORDS INCARNATE", margin, y);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(130, 130, 130);
  doc.text("wordsincarnate.com  |  alex@wordsincarnate.com  |  (682) 233-3559", margin, y + 14);

  y += 50;
  doc.setDrawColor(220, 200, 180);
  doc.setLineWidth(0.5);
  doc.line(margin, y, w - margin, y);

  // Title
  y += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Engagement Proposal", margin, y);

  y += 30;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Prepared for: ${p.client_name}${p.organization ? ` — ${p.organization}` : ""}`, margin, y);
  y += 18;
  doc.text(`Date: ${new Date(p.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, margin, y);
  y += 18;
  doc.text(`Engagement: ${p.engagement_type} (${SEGMENT_LABELS[p.segment] || p.segment})`, margin, y);

  // HOLD Section
  y += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("The HOLD Method", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const holdText = "Every Words Incarnate engagement follows the HOLD formation framework: Honor what you truly value, Observe where values are alive and absent, Live through redesigned systems and practices, and Declare your commitments visibly and accountably.";
  const holdLines = doc.splitTextToSize(holdText, textW);
  doc.text(holdLines, margin, y);
  y += holdLines.length * 14 + 10;

  // Deliverables
  if (p.deliverables && p.deliverables.length > 0) {
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Deliverables", margin, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    for (const d of p.deliverables) {
      doc.text(`•  ${d}`, margin + 10, y);
      y += 16;
    }
  }

  // Timeline
  if (p.timeline) {
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Timeline", margin, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const tlLines = doc.splitTextToSize(p.timeline, textW);
    doc.text(tlLines, margin, y);
    y += tlLines.length * 14 + 10;
  }

  // Investment
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Investment", margin, y);
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  if (p.investment_amount) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`$${Number(p.investment_amount).toLocaleString()}`, margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  }
  if (p.investment_description) {
    const invLines = doc.splitTextToSize(p.investment_description, textW);
    doc.text(invLines, margin, y);
    y += invLines.length * 14 + 10;
  }

  // Custom notes
  if (p.custom_notes) {
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Additional Notes", margin, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(p.custom_notes, textW);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 14 + 10;
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 60;
  doc.setDrawColor(220, 200, 180);
  doc.line(margin, y, w - margin, y);
  y += 16;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Honor · Observe · Live · Declare", margin, y);
  doc.text("© Words Incarnate", w - margin - 80, y);

  doc.save(`WI-Proposal-${p.client_name.replace(/\s+/g, "-")}.pdf`);
}

interface Props {
  password: string;
}

export default function Proposals({ password }: Props) {
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    organization: "",
    segment: "school" as "family" | "school" | "organization",
    engagement_type: "",
    tier: "",
    investment_amount: "",
    investment_description: "",
    timeline: "",
    deliverables: [] as string[],
    custom_notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api(password, "proposals");
      setProposals(data.proposals || []);
    } catch { /* */ }
    setLoading(false);
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.client_name || !form.engagement_type) return;
    try {
      await api(password, "create_proposal", {
        ...form,
        investment_amount: form.investment_amount ? Number(form.investment_amount) : null,
        deliverables: form.deliverables.length > 0 ? form.deliverables : DEFAULT_DELIVERABLES[form.segment] || [],
      });
      setShowForm(false);
      setForm({ client_name: "", organization: "", segment: "school", engagement_type: "", tier: "", investment_amount: "", investment_description: "", timeline: "", deliverables: [], custom_notes: "" });
      load();
    } catch { /* */ }
  };

  const updateStatus = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { id, status };
    if (status === "sent") updates.sent_at = new Date().toISOString();
    if (status === "accepted" || status === "declined") updates.responded_at = new Date().toISOString();
    await api(password, "update_proposal", updates);
    load();
  };

  const deleteProposal = async (id: string) => {
    if (!confirm("Delete this proposal?")) return;
    await api(password, "delete_proposal", { id });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 className="ac-page-title">Proposals</h2>
        <button className="ac-btn ac-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Proposal"}
        </button>
      </div>

      {showForm && (
        <div className="ac-card" style={{ marginBottom: 24, padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="ac-label">Client Name *</label>
              <input className="ac-input" value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} />
            </div>
            <div>
              <label className="ac-label">Organization</label>
              <input className="ac-input" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
            </div>
            <div>
              <label className="ac-label">Segment *</label>
              <select className="ac-input" value={form.segment} onChange={e => setForm({ ...form, segment: e.target.value as "family" | "school" | "organization", engagement_type: "" })}>
                <option value="school">School</option>
                <option value="family">Family</option>
                <option value="organization">Organization</option>
              </select>
            </div>
            <div>
              <label className="ac-label">Engagement Type *</label>
              <select className="ac-input" value={form.engagement_type} onChange={e => setForm({ ...form, engagement_type: e.target.value })}>
                <option value="">Select...</option>
                {(ENGAGEMENT_TYPES[form.segment] || []).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="ac-label">Investment Amount ($)</label>
              <input className="ac-input" type="number" value={form.investment_amount} onChange={e => setForm({ ...form, investment_amount: e.target.value })} />
            </div>
            <div>
              <label className="ac-label">Investment Description</label>
              <input className="ac-input" value={form.investment_description} onChange={e => setForm({ ...form, investment_description: e.target.value })} placeholder="e.g. Per month, per semester" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="ac-label">Timeline</label>
              <input className="ac-input" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} placeholder="e.g. August 2026 – May 2027" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="ac-label">Custom Notes</label>
              <textarea className="ac-input" rows={3} value={form.custom_notes} onChange={e => setForm({ ...form, custom_notes: e.target.value })} placeholder="Anything specific to include in the proposal" />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="ac-btn ac-btn-primary" onClick={handleCreate} disabled={!form.client_name || !form.engagement_type}>
              Create Proposal
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9A9590" }}>Loading...</div>
      ) : proposals.length === 0 ? (
        <div className="ac-card" style={{ padding: 40, textAlign: "center", color: "#9A9590" }}>
          No proposals yet. Create your first one above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {proposals.map(p => (
            <div key={p.id} className="ac-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{p.client_name}</span>
                    {p.organization && <span style={{ color: "#9A9590", fontSize: 13 }}>— {p.organization}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#9A9590" }}>
                    <span>{SEGMENT_LABELS[p.segment]}</span>
                    <span>·</span>
                    <span>{p.engagement_type}</span>
                    {p.investment_amount && <><span>·</span><span>${Number(p.investment_amount).toLocaleString()}</span></>}
                    <span>·</span>
                    <span>{fmtDate(p.created_at)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: STATUS_COLORS[p.status] || "#6B6560",
                  }}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="ac-btn" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => generatePDF(p)}>
                  📄 Download PDF
                </button>
                {p.status === "draft" && (
                  <button className="ac-btn" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => updateStatus(p.id, "sent")}>
                    Mark Sent
                  </button>
                )}
                {p.status === "sent" && (
                  <>
                    <button className="ac-btn" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => updateStatus(p.id, "accepted")}>
                      ✓ Accepted
                    </button>
                    <button className="ac-btn" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => updateStatus(p.id, "declined")}>
                      ✗ Declined
                    </button>
                  </>
                )}
                <button className="ac-btn" style={{ fontSize: 12, padding: "4px 10px", marginLeft: "auto", color: "#C45B5B" }} onClick={() => deleteProposal(p.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
