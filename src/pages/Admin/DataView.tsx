import React, { useState, useEffect } from "react";
import { api, fmtDate, fmtValues } from "./api";

type DataTab = "emails" | "quizzes" | "bookings" | "contacts";

interface ColumnDef {
  key: string;
  label: string;
  render?: (val: unknown, row: Record<string, unknown>) => React.ReactNode;
}

const TAB_CONFIG: Record<DataTab, { label: string; action: string; exportTable: string; columns: ColumnDef[] }> = {
  emails: {
    label: "Email Captures",
    action: "email_captures",
    exportTable: "email_captures",
    columns: [
      { key: "email", label: "Email" },
      { key: "name", label: "Name" },
      { key: "source", label: "Source" },
      { key: "created_at", label: "Date", render: fmtDate },
    ],
  },
  quizzes: {
    label: "Quiz Sessions",
    action: "quiz_sessions",
    exportTable: "quiz_sessions",
    columns: [
      { key: "area_of_life", label: "Area of Life" },
      { key: "final_six_values", label: "Final 6 Values", render: fmtValues },
      { key: "duration_seconds", label: "Duration", render: (v) => v ? `${Math.round((v as number) / 60)}m` : "—" },
      { key: "created_at", label: "Date", render: fmtDate },
    ],
  },
  bookings: {
    label: "Chat Bookings",
    action: "chat_bookings",
    exportTable: "chat_bookings",
    columns: [
      { key: "name", label: "Name" },
      { key: "customer_type", label: "Type" },
      { key: "offering", label: "Offering" },
      { key: "intention", label: "Intention" },
      { key: "contact_method", label: "Contact" },
      { key: "contact_info", label: "Info" },
      { key: "timing", label: "Timing" },
      { key: "created_at", label: "Date", render: fmtDate },
    ],
  },
  contacts: {
    label: "Contact Forms",
    action: "contact_submissions",
    exportTable: "contact_submissions",
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "service_interest", label: "Interest" },
      { key: "message", label: "Message" },
      { key: "created_at", label: "Date", render: fmtDate },
    ],
  },
};

const TABS: DataTab[] = ["emails", "quizzes", "bookings", "contacts"];

export default function DataView({ password, defaultTab = "emails" }: { password: string; defaultTab?: DataTab }) {
  const [tab, setTab] = useState<DataTab>(defaultTab);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const config = TAB_CONFIG[tab];
  const pageSize = 50;
  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    setLoading(true);
    api(password, config.action, { limit: pageSize, offset: page * pageSize })
      .then(res => { setRows(res.data || []); setCount(res.count || 0); })
      .finally(() => setLoading(false));
  }, [password, tab, page, config.action]);

  const handleTabChange = (t: DataTab) => {
    setTab(t);
    setPage(0);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api(password, "export_csv", { table: config.exportTable });
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
      a.download = `${config.exportTable}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="ac-section-title">Leads & Data</div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--ac-border)", paddingBottom: 1 }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            style={{
              padding: "8px 16px",
              fontSize: "0.8125rem",
              fontWeight: 500,
              fontFamily: "var(--ac-font-body)",
              color: tab === t ? "var(--ac-accent)" : "var(--ac-text-muted)",
              background: "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid var(--ac-accent)" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: -1,
              transition: "color 0.15s ease",
            }}
          >
            {TAB_CONFIG[t].label}
          </button>
        ))}
      </div>

      {/* Export button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={handleExport} disabled={exporting || count === 0}>
          ↓ {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="ac-loading"><div className="ac-spinner" /></div>
      ) : (
        <>
          <div className="ac-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="ac-table">
                <thead>
                  <tr>
                    {config.columns.map(col => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={config.columns.length} style={{ textAlign: "center", padding: 32, color: "var(--ac-text-muted)" }}>
                        No records found
                      </td>
                    </tr>
                  ) : rows.map((row, i) => (
                    <tr key={i}>
                      {config.columns.map(col => (
                        <td key={col.key}>
                          {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="ac-pagination">
              <span className="ac-pagination-info">{count.toLocaleString()} records</span>
              <div className="ac-pagination-controls">
                <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={() => setPage(page - 1)} disabled={page === 0}>
                  ‹ Prev
                </button>
                <span style={{ fontSize: "0.8125rem", color: "var(--ac-text-muted)" }}>
                  {page + 1} / {totalPages}
                </span>
                <button className="ac-btn ac-btn-ghost ac-btn-sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
                  Next ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
