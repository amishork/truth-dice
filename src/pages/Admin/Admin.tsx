import React, { useState, useEffect, useCallback } from "react";
import PageMeta from "@/components/PageMeta";
import { api, SESSION_KEY, type AdminView, type OverviewData, type BookingRecord, type ContactRecord, type EmailRecord, type TestimonialRecord, type QuizRecord } from "./api";
import CommandCenter from "./CommandCenter";
import Testimonials from "./Testimonials";
import DataView from "./DataView";
import Pipeline from "./Pipeline";
import Engagements from "./Engagements";
import Revenue from "./Revenue";
import Analytics from "./Analytics";
import ContentConfig from "./ContentConfig";
import System from "./System";
import "./admin.css";

// ─── Icons (inline SVG to avoid lucide bundle in admin) ───

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  flame: "M12 2C12 2 7 9 7 13a5 5 0 0 0 10 0c0-4-5-11-5-11z",
  command: "M3 12h18M3 6h18M3 18h18",
  pipeline: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  chart: "M18 20V10M12 20V4M6 20v-6",
  briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  settings: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4l3 3",
  tool: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  collapse: "M15 18l-6-6 6-6",
  expand: "M9 18l6-6-6-6",
  menu: "M3 12h18M3 6h18M3 18h18",
  x: "M18 6L6 18M6 6l12 12",
  loader: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  alert: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
};

// ─── Nav Structure ───

interface NavItem {
  id: AdminView;
  label: string;
  icon: string;
  badge?: number;
  dividerAfter?: boolean;
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
    <div className="admin-console">
      <div className="ac-gate">
        <div className="ac-gate-card">
          <div className="ac-gate-title">Advisor Console</div>
          <div className="ac-gate-subtitle">Words Incarnate</div>
          <div className="ac-card">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--ac-text-secondary)", marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  className="ac-input"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {error && (
                <p style={{ fontSize: "0.8125rem", color: "var(--ac-danger)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon d={ICONS.alert} size={14} /> {error}
                </p>
              )}
              <button type="submit" className="ac-btn ac-btn-primary" style={{ justifyContent: "center", padding: "10px 16px" }} disabled={loading || !pw}>
                {loading ? <div className="ac-spinner" style={{ width: 16, height: 16 }} /> : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ───

function Sidebar({
  view,
  onViewChange,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  pendingCount,
  onLogout,
}: {
  view: AdminView;
  onViewChange: (v: AdminView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCount: number;
  onLogout: () => void;
}) {
  const navItems: NavItem[] = [
    { id: "command-center", label: "Command Center", icon: "command", dividerAfter: true },
    { id: "pipeline", label: "Pipeline", icon: "pipeline" },
    { id: "analytics", label: "Analytics", icon: "chart", dividerAfter: true },
    { id: "engagements", label: "Engagements", icon: "briefcase" },
    { id: "revenue", label: "Revenue", icon: "dollar", dividerAfter: true },
    { id: "testimonials", label: "Testimonials", icon: "star", badge: pendingCount || undefined },
    { id: "leads-lists", label: "Leads & Lists", icon: "mail" },
    { id: "content-config", label: "Content & Config", icon: "settings", dividerAfter: true },
    { id: "system", label: "System", icon: "tool" },
  ];

  const handleNav = (id: AdminView) => {
    onViewChange(id);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && <div className="ac-overlay" onClick={onCloseMobile} />}
      <aside className={`ac-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="ac-sidebar-brand">
          <div className="ac-sidebar-brand-icon">🔥</div>
          <span className="ac-sidebar-brand-text">Words Incarnate</span>
        </div>

        <nav className="ac-sidebar-nav">
          {navItems.map((item) => (
            <React.Fragment key={item.id}>
              <div className="ac-nav-section">
                <button
                  className={`ac-nav-item ${view === item.id ? "active" : ""}`}
                  onClick={() => handleNav(item.id)}
                >
                  <span className="ac-nav-icon"><Icon d={ICONS[item.icon as keyof typeof ICONS]} /></span>
                  <span className="ac-nav-label">{item.label}</span>
                  {item.badge && <span className="ac-nav-badge">{item.badge}</span>}
                </button>
              </div>
              {item.dividerAfter && <div className="ac-nav-divider" />}
            </React.Fragment>
          ))}
        </nav>

        <div className="ac-sidebar-footer">
          <div className="ac-nav-section">
            <button className="ac-nav-item" onClick={onToggleCollapse} style={{ display: "none" }} id="collapse-btn">
              <span className="ac-nav-icon"><Icon d={collapsed ? ICONS.expand : ICONS.collapse} /></span>
              <span className="ac-nav-label">{collapsed ? "Expand" : "Collapse"}</span>
            </button>
            <button className="ac-nav-item" onClick={onLogout}>
              <span className="ac-nav-icon"><Icon d={ICONS.logout} /></span>
              <span className="ac-nav-label">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Main Admin Shell ───

const Admin = () => {
  const [password, setPassword] = useState<string | null>(() => sessionStorage.getItem(SESSION_KEY));
  const [view, setView] = useState<AdminView>("command-center");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(!!password);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // All data state — loaded once, shared across views
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Verify stored password on mount
  useEffect(() => {
    if (!password) { setChecking(false); return; }
    api(password, "overview")
      .then(() => setVerified(true))
      .catch(() => { sessionStorage.removeItem(SESSION_KEY); setPassword(null); })
      .finally(() => setChecking(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all data after auth
  const loadData = useCallback(async () => {
    if (!password) return;
    setDataLoading(true);
    try {
      const [ovRes, bkRes, ctRes, emRes, qzRes, tmRes] = await Promise.all([
        api(password, "overview"),
        api(password, "chat_bookings", { limit: 50, offset: 0 }),
        api(password, "contact_submissions", { limit: 50, offset: 0 }),
        api(password, "email_captures", { limit: 50, offset: 0 }),
        api(password, "quiz_sessions", { limit: 50, offset: 0 }),
        api(password, "testimonials"),
      ]);
      setOverview(ovRes as OverviewData);
      setBookings(bkRes.data || []);
      setContacts(ctRes.data || []);
      setEmails(emRes.data || []);
      setQuizzes(qzRes.data || []);
      setTestimonials(tmRes.data || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setDataLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (verified && password) loadData();
  }, [verified, password, loadData]);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setPassword(null);
    setVerified(false);
  };

  const handleTestimonialUpdate = async (id: string, status: string) => {
    if (!password) return;
    await api(password, "update_testimonial", { id, status });
    // Reload testimonials
    const tmRes = await api(password, "testimonials");
    setTestimonials(tmRes.data || []);
    // Update overview counts
    const ovRes = await api(password, "overview");
    setOverview(ovRes as OverviewData);
  };

  // Checking auth
  if (checking) {
    return (
      <div className="admin-console">
        <div className="ac-gate">
          <div className="ac-spinner" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!password || !verified) {
    return (
      <>
        <PageMeta title="Admin" description="" path="/admin" />
        <PasswordGate onAuth={(pw) => { setPassword(pw); setVerified(true); }} />
      </>
    );
  }

  const pendingCount = overview?.counts.pendingTestimonials || 0;

  const renderView = () => {
    if (dataLoading) {
      return <div className="ac-loading"><div className="ac-spinner" /></div>;
    }

    switch (view) {
      case "command-center":
        return (
          <CommandCenter
            overview={overview!}
            bookings={bookings}
            contacts={contacts}
            emails={emails}
            quizzes={quizzes}
            testimonials={testimonials}
          />
        );
      case "testimonials":
        return (
          <Testimonials
            testimonials={testimonials}
            onUpdateStatus={handleTestimonialUpdate}
          />
        );
      case "leads-lists":
        return <DataView password={password} defaultTab="emails" />;
      case "analytics":
        return <Analytics password={password} />;
      case "pipeline":
        return <Pipeline password={password} />;
      case "engagements":
        return <Engagements password={password} />;
      case "revenue":
        return <Revenue password={password} />;
      case "content-config":
        return <ContentConfig password={password} />;
      case "system":
        return <System password={password} />;
      default:
        return null;
    }
  };

  return (
    <>
      <PageMeta title="Advisor Console" description="" path="/admin" />
      <meta name="robots" content="noindex, nofollow" />
      <div className="admin-console">
        {/* Mobile header */}
        <div className="ac-mobile-header">
          <button className="ac-btn-icon" onClick={() => setMobileOpen(true)}>
            <Icon d={ICONS.menu} />
          </button>
          <span style={{ fontFamily: "var(--ac-font-display)", fontSize: "1rem", fontWeight: 500 }}>
            Advisor Console
          </span>
          <button className="ac-btn-icon" onClick={handleLogout}>
            <Icon d={ICONS.logout} size={18} />
          </button>
        </div>

        <Sidebar
          view={view}
          onViewChange={setView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          pendingCount={pendingCount}
          onLogout={handleLogout}
        />

        <main className="ac-main">
          <div className="ac-content">
            {renderView()}
          </div>
        </main>
      </div>
    </>
  );
};

export default Admin;
