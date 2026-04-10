import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { api, PIPELINE_STAGES, type LeadRecord, type PipelineStage, timeAgo, fmtDate } from "./api";
import ContactProfile from "./ContactProfile";

// ─── Sub-view type ───

type PipelineView = "board" | "list" | "profile";

// ─── Stage badge color ───

function stageColor(stage: string): string {
  return PIPELINE_STAGES.find(s => s.id === stage)?.color || "#6B6560";
}

function stageLabel(stage: string): string {
  return PIPELINE_STAGES.find(s => s.id === stage)?.label || stage;
}

const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  family: "Family",
  school: "School",
  organization: "Organization",
};

// ─── Lead Card (used in both Kanban and drag overlay) ───

function LeadCard({
  lead,
  onClick,
  isDragging,
}: {
  lead: LeadRecord;
  onClick?: () => void;
  isDragging?: boolean;
}) {
  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(lead.last_activity_at).getTime()) / 86400000
  );

  return (
    <div
      className="ac-card"
      onClick={onClick}
      style={{
        padding: "12px 14px",
        cursor: onClick ? "pointer" : "grab",
        opacity: isDragging ? 0.5 : 1,
        marginBottom: 8,
        transition: "box-shadow 0.15s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--ac-text)" }}>
          {lead.name || lead.email || "Unknown"}
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.6875rem",
            fontWeight: 700,
            fontFamily: "var(--ac-font-mono)",
            background: lead.lead_score >= 60 ? "rgba(91,140,90,0.2)" : lead.lead_score >= 30 ? "rgba(196,148,61,0.2)" : "rgba(107,101,96,0.2)",
            color: lead.lead_score >= 60 ? "var(--ac-success)" : lead.lead_score >= 30 ? "var(--ac-warning)" : "var(--ac-text-muted)",
            flexShrink: 0,
          }}
        >
          {lead.lead_score}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
        <span
          className="ac-badge"
          style={{
            background: `${stageColor(lead.customer_type === "school" ? "booking_requested" : "captured")}30`,
            color: lead.customer_type === "school" ? "var(--ac-warning)" : "var(--ac-text-secondary)",
          }}
        >
          {CUSTOMER_TYPE_LABELS[lead.customer_type] || lead.customer_type}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: "0.6875rem", color: "var(--ac-text-muted)" }}>
          {timeAgo(lead.last_activity_at)}
        </span>
        {lead.follow_up_date && (
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              color:
                new Date(lead.follow_up_date).getTime() < Date.now()
                  ? "var(--ac-danger)"
                  : new Date(lead.follow_up_date).toDateString() === new Date().toDateString()
                  ? "var(--ac-warning)"
                  : "var(--ac-success)",
            }}
          >
            📅 {new Date(lead.follow_up_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {daysSinceActivity > 7 && (
        <div style={{ fontSize: "0.6875rem", color: "var(--ac-danger)", marginTop: 4 }}>
          {daysSinceActivity}d since last activity
        </div>
      )}
    </div>
  );
}

// ─── Sortable Lead Card (for Kanban) ───

function SortableLeadCard({ lead, onClick }: { lead: LeadRecord; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} onClick={onClick} />
    </div>
  );
}

// ─── Kanban Column ───

function KanbanColumn({
  stage,
  leads,
  onLeadClick,
}: {
  stage: typeof PIPELINE_STAGES[number];
  leads: LeadRecord[];
  onLeadClick: (lead: LeadRecord) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 260,
        maxWidth: 300,
        flex: "0 0 260px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `2px solid ${stage.color}`,
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: stage.color,
            }}
          />
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--ac-text)" }}>
            {stage.label}
          </span>
        </div>
        <span
          style={{
            fontSize: "0.6875rem",
            fontFamily: "var(--ac-font-mono)",
            color: "var(--ac-text-muted)",
            background: "var(--ac-bg-hover)",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {leads.length}
        </span>
      </div>

      {/* Cards container */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 4,
          borderRadius: 8,
          background: isOver ? "var(--ac-accent-subtle)" : "transparent",
          transition: "background 0.15s ease",
          minHeight: 60,
        }}
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <SortableLeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div
            style={{
              padding: "20px 8px",
              textAlign: "center",
              fontSize: "0.75rem",
              color: "var(--ac-text-muted)",
              fontStyle: "italic",
            }}
          >
            No leads
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lost Reason Modal ───

function LostReasonModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reasons = ["Too expensive", "Not ready", "Went with competitor", "No response", "Other"];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={onCancel} />
      <div className="ac-card" style={{ position: "relative", zIndex: 1, width: 400, maxWidth: "90vw" }}>
        <div className="ac-card-header">Why was this lead lost?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {reasons.map(r => (
            <button
              key={r}
              className="ac-btn ac-btn-ghost"
              onClick={() => setReason(r)}
              style={{
                justifyContent: "flex-start",
                background: reason === r ? "var(--ac-accent-subtle)" : undefined,
                borderColor: reason === r ? "var(--ac-accent)" : undefined,
                color: reason === r ? "var(--ac-accent)" : undefined,
              }}
            >
              {r}
            </button>
          ))}
        </div>
        {reason === "Other" && (
          <input
            className="ac-input"
            placeholder="Describe the reason..."
            value={customReason}
            onChange={e => setCustomReason(e.target.value)}
            style={{ marginBottom: 16 }}
            autoFocus
          />
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="ac-btn ac-btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className="ac-btn ac-btn-primary"
            onClick={() => onConfirm(reason === "Other" ? customReason || "Other" : reason)}
            disabled={!reason || (reason === "Other" && !customReason)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Component ───

export default function Pipeline({ password }: { password: string }) {
  const [view, setView] = useState<PipelineView>("board");
  const [stageData, setStageData] = useState<Record<string, LeadRecord[]>>({});
  const [allLeads, setAllLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [activeDragLead, setActiveDragLead] = useState<LeadRecord | null>(null);
  const [lostModal, setLostModal] = useState<{ leadId: string; fromStage: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api(password, "leads_by_stage");
      setStageData(res.stages || {});
      // Flatten for list view
      const flat: LeadRecord[] = [];
      for (const leads of Object.values(res.stages || {}) as LeadRecord[][]) {
        flat.push(...leads);
      }
      flat.sort((a, b) => b.lead_score - a.lead_score);
      setAllLeads(flat);
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Drag handlers ───

  const handleDragStart = (event: DragStartEvent) => {
    const lead = allLeads.find(l => l.id === event.active.id);
    setActiveDragLead(lead || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const lead = allLeads.find(l => l.id === leadId);
    if (!lead) return;

    // Determine target stage — over.id could be a stage id or another lead's id
    let targetStage: string;
    const isStage = PIPELINE_STAGES.some(s => s.id === over.id);
    if (isStage) {
      targetStage = over.id as string;
    } else {
      // Dropped on another lead — find which stage that lead is in
      const targetLead = allLeads.find(l => l.id === over.id);
      targetStage = targetLead?.pipeline_stage || lead.pipeline_stage;
    }

    if (targetStage === lead.pipeline_stage) return;

    // If moving to "lost", show reason modal
    if (targetStage === "lost") {
      setLostModal({ leadId, fromStage: lead.pipeline_stage });
      return;
    }

    // Optimistic update
    const newStageData = { ...stageData };
    const oldStageLeads = (newStageData[lead.pipeline_stage] || []).filter(l => l.id !== leadId);
    newStageData[lead.pipeline_stage] = oldStageLeads;
    const updatedLead = { ...lead, pipeline_stage: targetStage as PipelineStage };
    newStageData[targetStage] = [...(newStageData[targetStage] || []), updatedLead];
    setStageData(newStageData);
    setAllLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));

    // API call
    try {
      await api(password, "update_lead_stage", { id: leadId, stage: targetStage });
    } catch {
      // Revert on failure
      loadData();
    }
  };

  const handleLostConfirm = async (reason: string) => {
    if (!lostModal) return;
    const { leadId } = lostModal;

    try {
      await api(password, "update_lead_stage", { id: leadId, stage: "lost", lost_reason: reason });
      await loadData();
    } catch {
      // Reload anyway
      loadData();
    }
    setLostModal(null);
  };

  const handleLeadClick = (lead: LeadRecord) => {
    setSelectedLead(lead);
    setView("profile");
  };

  const handleBackFromProfile = () => {
    setSelectedLead(null);
    setView("board");
    loadData(); // Refresh in case profile made changes
  };

  // ─── Render ───

  if (loading) {
    return <div className="ac-loading"><div className="ac-spinner" /></div>;
  }

  // Profile view
  if (view === "profile" && selectedLead) {
    return (
      <ContactProfile
        password={password}
        leadId={selectedLead.id}
        onBack={handleBackFromProfile}
      />
    );
  }

  // Active Kanban stages (hide empty non-essential stages to reduce clutter)
  const activeStages = PIPELINE_STAGES.filter(s => {
    const leads = stageData[s.id] || [];
    // Always show these core stages
    if (["captured", "engaged", "booking_requested", "contacted", "in_conversation", "won"].includes(s.id)) return true;
    // Show others only if they have leads
    return leads.length > 0;
  });

  return (
    <div>
      {/* Header with view toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="ac-section-title" style={{ marginBottom: 0 }}>Pipeline</div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className={`ac-btn ${view === "board" ? "ac-btn-primary" : "ac-btn-ghost"} ac-btn-sm`}
            onClick={() => setView("board")}
          >
            Board
          </button>
          <button
            className={`ac-btn ${view === "list" ? "ac-btn-primary" : "ac-btn-ghost"} ac-btn-sm`}
            onClick={() => setView("list")}
          >
            List
          </button>
        </div>
      </div>

      {/* Board View */}
      {view === "board" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              paddingBottom: 16,
              minHeight: 400,
            }}
          >
            {activeStages.map(stage => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                leads={stageData[stage.id] || []}
                onLeadClick={handleLeadClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDragLead ? (
              <div style={{ width: 260 }}>
                <LeadCard lead={activeDragLead} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="ac-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Stage</th>
                  <th>Score</th>
                  <th>Source</th>
                  <th>Last Activity</th>
                  <th>Follow-Up</th>
                </tr>
              </thead>
              <tbody>
                {allLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: 32, color: "var(--ac-text-muted)" }}>
                      No leads yet
                    </td>
                  </tr>
                ) : allLeads.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => handleLeadClick(lead)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ fontWeight: 500 }}>{lead.name || "—"}</td>
                    <td>{lead.email || "—"}</td>
                    <td>{lead.phone || "—"}</td>
                    <td>
                      <span className="ac-badge" style={{ background: `${stageColor(lead.pipeline_stage)}20`, color: stageColor(lead.pipeline_stage) }}>
                        {CUSTOMER_TYPE_LABELS[lead.customer_type] || lead.customer_type}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: stageColor(lead.pipeline_stage) }} />
                        {stageLabel(lead.pipeline_stage)}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--ac-font-mono)", fontWeight: 600 }}>{lead.lead_score}</td>
                    <td>{lead.source || "—"}</td>
                    <td style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)" }}>
                      {timeAgo(lead.last_activity_at)}
                    </td>
                    <td>
                      {lead.follow_up_date ? (
                        <span style={{
                          fontSize: "0.75rem",
                          color: new Date(lead.follow_up_date).getTime() < Date.now() ? "var(--ac-danger)" : "var(--ac-success)",
                        }}>
                          {new Date(lead.follow_up_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lost Reason Modal */}
      {lostModal && (
        <LostReasonModal
          onConfirm={handleLostConfirm}
          onCancel={() => {
            setLostModal(null);
            loadData(); // Revert optimistic update
          }}
        />
      )}
    </div>
  );
}
