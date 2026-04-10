import React, { useState } from "react";
import { type TestimonialRecord } from "./api";

export default function Testimonials({
  testimonials,
  onUpdateStatus,
}: {
  testimonials: TestimonialRecord[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdate = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setUpdating(null);
    }
  };

  const pending = testimonials.filter(t => t.status === "pending");
  const approved = testimonials.filter(t => t.status === "approved");
  const rejected = testimonials.filter(t => t.status === "rejected");

  const renderCard = (t: TestimonialRecord) => (
    <div key={t.id} className="ac-card" style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, color: "var(--ac-text)" }}>{t.name || "Anonymous"}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--ac-text-muted)", marginTop: 2 }}>
            {t.role || ""}{t.audience ? ` · ${t.audience}` : ""}
          </div>
        </div>
        <span className={`ac-badge ac-badge-${t.status}`}>{t.status}</span>
      </div>
      <p style={{ marginTop: 12, fontSize: "0.875rem", color: "var(--ac-text)", lineHeight: 1.6 }}>
        {t.experience || t.testimonial_draft || t.impact || "—"}
      </p>
      {t.rating && (
        <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--ac-accent)" }}>
          {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
        </div>
      )}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        {t.status !== "approved" && (
          <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={() => handleUpdate(t.id, "approved")} disabled={updating === t.id}>
            ✓ Approve
          </button>
        )}
        {t.status !== "rejected" && (
          <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={() => handleUpdate(t.id, "rejected")} disabled={updating === t.id}>
            ✕ Reject
          </button>
        )}
        {t.status !== "pending" && (
          <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={() => handleUpdate(t.id, "pending")} disabled={updating === t.id} style={{ color: "var(--ac-text-muted)" }}>
            Reset
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="ac-section-title">Testimonials</div>

      {pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ac-warning)", marginBottom: 12 }}>
            Pending Review ({pending.length})
          </div>
          {pending.map(renderCard)}
        </div>
      )}

      {approved.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ac-success)", marginBottom: 12 }}>
            Approved ({approved.length})
          </div>
          {approved.map(renderCard)}
        </div>
      )}

      {rejected.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--ac-text-muted)", marginBottom: 12 }}>
            Rejected ({rejected.length})
          </div>
          {rejected.map(renderCard)}
        </div>
      )}

      {testimonials.length === 0 && (
        <div className="ac-card" style={{ textAlign: "center", padding: 48, color: "var(--ac-text-muted)" }}>
          No testimonials yet.
        </div>
      )}
    </div>
  );
}
