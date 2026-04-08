import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import PageMeta from "@/components/PageMeta";
import {
  BarChart3, Users, MessageSquare, Mail, Star, Download, Check, X,
  ChevronLeft, ChevronRight, LogOut, Loader2, AlertCircle
} from "lucide-react";

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SESSION_KEY = "wi-admin-auth";

type Tab = "overview" | "emails" | "quizzes" | "bookings" | "contacts" | "testimonials";

async function api(password: string, action: string, params?: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ password, action, params }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── Password Gate ───
function PasswordGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api(pw, "overview");
      sessionStorage.setItem(SESSION_KEY, pw);
      onAuth(pw);
    } catch {
      setError("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Advisor Console</h1>
          <p className="mt-2 text-sm text-muted-foreground">Words Incarnate</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pw" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                id="pw"
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500 flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !pw}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───
function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}

// ─── Data Table ───
function DataTable({ columns, rows, count, page, onPage }: {
  columns: { key: string; label: string; render?: (val: unknown, row: Record<string, unknown>) => React.ReactNode }[];
  rows: Record<string, unknown>[];
  count: number;
  page: number;
  onPage: (p: number) => void;
}) {
  const pageSize = 50;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">No records found</td></tr>
            ) : rows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-foreground whitespace-nowrap max-w-[300px] truncate">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{count.toLocaleString()} total records</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onPage(page - 1)} disabled={page === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => onPage(page + 1)} disabled={page >= totalPages - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab({ password }: { password: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(password, "overview").then(setData).finally(() => setLoading(false));
  }, [password]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!data) return null;

  const counts = data.counts as Record<string, number>;
  const topValues = data.topValues as [string, number][];
  const areaCounts = data.areaCounts as Record<string, number>;
  const recentQuizzes = data.recentQuizzes as { created_at: string; area_of_life: string; duration_seconds: number | null }[];

  const avgDuration = recentQuizzes.length > 0
    ? Math.round(recentQuizzes.filter(q => q.duration_seconds).reduce((sum, q) => sum + (q.duration_seconds || 0), 0) / recentQuizzes.filter(q => q.duration_seconds).length / 60)
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Quiz Completions" value={counts.quizzes} icon={BarChart3} />
        <StatCard label="Email Leads" value={counts.emails} icon={Mail} />
        <StatCard label="Chat Bookings" value={counts.bookings} icon={MessageSquare} />
        <StatCard label="Contact Forms" value={counts.contacts} icon={Users} />
        <StatCard label="Testimonials" value={counts.testimonials} icon={Star} />
        <StatCard label="Pending Review" value={counts.pendingTestimonials} icon={AlertCircle} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-medium text-foreground mb-4">Top Selected Values</h3>
          <div className="space-y-2">
            {topValues.slice(0, 12).map(([name, count]) => {
              const max = topValues[0]?.[1] || 1;
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-40 truncate">{name}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-medium text-foreground mb-4">Area of Life Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).map(([area, count]) => {
                const max = Math.max(...Object.values(areaCounts));
                return (
                  <div key={area} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-32 truncate">{area}</span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/50 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-medium text-foreground mb-3">Last 30 Days</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-semibold text-foreground">{recentQuizzes.length}</p>
                <p className="text-xs text-muted-foreground">Quizzes completed</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{avgDuration > 0 ? `${avgDuration}m` : "—"}</p>
                <p className="text-xs text-muted-foreground">Avg duration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Testimonial Moderation ───
function TestimonialsTab({ password }: { password: string }) {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api(password, "testimonials").then(res => setData(res.data)).finally(() => setLoading(false));
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await api(password, "update_testimonial", { id, status });
      load();
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const pending = (data || []).filter(t => t.status === "pending");
  const approved = (data || []).filter(t => t.status === "approved");
  const rejected = (data || []).filter(t => t.status === "rejected");

  const renderCard = (t: Record<string, unknown>) => (
    <div key={t.id as string} className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{(t.name as string) || "Anonymous"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{(t.role as string) || ""} {t.organization ? `· ${t.organization}` : ""}</p>
          <p className="text-xs text-muted-foreground">{(t.audience as string) || ""}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          t.status === "approved" ? "bg-green-100 text-green-800" :
          t.status === "rejected" ? "bg-red-100 text-red-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {t.status as string}
        </span>
      </div>
      <p className="mt-3 text-sm text-foreground leading-relaxed">{(t.content as string) || (t.experience as string) || "—"}</p>
      <div className="mt-4 flex items-center gap-2">
        {t.status !== "approved" && (
          <Button size="sm" variant="outline" onClick={() => updateStatus(t.id as string, "approved")} disabled={updating === t.id}>
            <Check className="h-3.5 w-3.5 mr-1" />Approve
          </Button>
        )}
        {t.status !== "rejected" && (
          <Button size="sm" variant="outline" onClick={() => updateStatus(t.id as string, "rejected")} disabled={updating === t.id}>
            <X className="h-3.5 w-3.5 mr-1" />Reject
          </Button>
        )}
        {t.status !== "pending" && (
          <Button size="sm" variant="ghost" onClick={() => updateStatus(t.id as string, "pending")} disabled={updating === t.id}>
            Reset to Pending
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Pending Review ({pending.length})</h3>
          <div className="space-y-4">{pending.map(renderCard)}</div>
        </div>
      )}
      {approved.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Approved ({approved.length})</h3>
          <div className="space-y-4">{approved.map(renderCard)}</div>
        </div>
      )}
      {rejected.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Rejected ({rejected.length})</h3>
          <div className="space-y-4">{rejected.map(renderCard)}</div>
        </div>
      )}
      {(data || []).length === 0 && (
        <p className="text-center text-muted-foreground py-8">No testimonials yet</p>
      )}
    </div>
  );
}

// ─── Generic List Tab ───
function ListTab({ password, action, columns, exportTable }: {
  password: string;
  action: string;
  columns: { key: string; label: string; render?: (val: unknown, row: Record<string, unknown>) => React.ReactNode }[];
  exportTable: string;
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api(password, action, { limit: 50, offset: page * 50 })
      .then(res => { setRows(res.data || []); setCount(res.count || 0); })
      .finally(() => setLoading(false));
  }, [password, action, page]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api(password, "export_csv", { table: exportTable });
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
      a.download = `${exportTable}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || count === 0}>
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
      <DataTable columns={columns} rows={rows} count={count} page={page} onPage={setPage} />
    </div>
  );
}

// ─── Timestamp Formatter ───
function fmtDate(val: unknown) {
  if (!val) return "—";
  const d = new Date(val as string);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function fmtValues(val: unknown) {
  if (!val) return "—";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

// ─── Column Definitions ───
const emailColumns = [
  { key: "email", label: "Email" },
  { key: "name", label: "Name" },
  { key: "source", label: "Source" },
  { key: "created_at", label: "Date", render: fmtDate },
];

const quizColumns = [
  { key: "area_of_life", label: "Area of Life" },
  { key: "final_six_values", label: "Final 6 Values", render: fmtValues },
  { key: "duration_seconds", label: "Duration", render: (v: unknown) => v ? `${Math.round((v as number) / 60)}m` : "—" },
  { key: "created_at", label: "Date", render: fmtDate },
];

const bookingColumns = [
  { key: "name", label: "Name" },
  { key: "customer_type", label: "Type" },
  { key: "offering", label: "Offering" },
  { key: "intention", label: "Intention" },
  { key: "contact_method", label: "Contact" },
  { key: "contact_info", label: "Contact Info" },
  { key: "timing", label: "Timing" },
  { key: "created_at", label: "Date", render: fmtDate },
];

const contactColumns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "interest", label: "Interest" },
  { key: "message", label: "Message" },
  { key: "created_at", label: "Date", render: fmtDate },
];

// ─── Main Admin Page ───
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "emails", label: "Leads", icon: Mail },
  { id: "quizzes", label: "Quizzes", icon: BarChart3 },
  { id: "bookings", label: "Bookings", icon: MessageSquare },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "testimonials", label: "Testimonials", icon: Star },
];

const Admin = () => {
  const [password, setPassword] = useState<string | null>(() => sessionStorage.getItem(SESSION_KEY));
  const [tab, setTab] = useState<Tab>("overview");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(!!password);

  // Verify stored password on mount
  useEffect(() => {
    if (!password) { setChecking(false); return; }
    api(password, "overview")
      .then(() => setVerified(true))
      .catch(() => { sessionStorage.removeItem(SESSION_KEY); setPassword(null); })
      .finally(() => setChecking(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setPassword(null);
    setVerified(false);
  };

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!password || !verified) {
    return (
      <>
        <PageMeta title="Admin" description="" path="/admin" />
        <PasswordGate onAuth={(pw) => { setPassword(pw); setVerified(true); }} />
      </>
    );
  }

  return (
    <>
      <PageMeta title="Advisor Console" description="" path="/admin" />
      <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-foreground">Advisor Console</h1>
              <span className="text-xs text-muted-foreground">Words Incarnate</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" />Sign Out
            </Button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-1 overflow-x-auto -mb-px">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === t.id
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {tab === "overview" && <OverviewTab password={password} />}
          {tab === "emails" && <ListTab password={password} action="email_captures" columns={emailColumns} exportTable="email_captures" />}
          {tab === "quizzes" && <ListTab password={password} action="quiz_sessions" columns={quizColumns} exportTable="quiz_sessions" />}
          {tab === "bookings" && <ListTab password={password} action="chat_bookings" columns={bookingColumns} exportTable="chat_bookings" />}
          {tab === "contacts" && <ListTab password={password} action="contact_submissions" columns={contactColumns} exportTable="contact_submissions" />}
          {tab === "testimonials" && <TestimonialsTab password={password} />}
        </main>
      </div>
    </>
  );
};

export default Admin;
