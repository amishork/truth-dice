const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const SESSION_KEY = "wi-admin-auth";

export async function api(password: string, action: string, params?: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ password, action, params }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── Types ───

export type AdminView =
  | "command-center"
  | "pipeline"
  | "analytics"
  | "engagements"
  | "revenue"
  | "testimonials"
  | "leads-lists"
  | "content-config"
  | "system";

export interface OverviewData {
  counts: {
    quizzes: number;
    emails: number;
    bookings: number;
    contacts: number;
    testimonials: number;
    pendingTestimonials: number;
  };
  recentQuizzes: { created_at: string; area_of_life: string; duration_seconds: number | null }[];
  topValues: [string, number][];
  areaCounts: Record<string, number>;
}

export interface BookingRecord {
  id?: string;
  name: string;
  customer_type: string;
  offering: string;
  intention: string;
  contact_method: string;
  contact_info: string;
  timing: string;
  core_values?: string;
  insight?: string;
  value_explored?: string;
  context_explored?: string;
  desired_outcome?: string;
  support_type?: string;
  raw_summary?: string;
  created_at: string;
}

export interface ContactRecord {
  id?: string;
  name: string;
  email: string;
  message: string;
  phone?: string;
  role?: string;
  service_interest?: string;
  created_at: string;
}

export interface EmailRecord {
  id?: string;
  email: string;
  name?: string;
  source?: string;
  created_at: string;
}

export interface QuizRecord {
  id?: string;
  area_of_life: string;
  final_six_values: string[];
  all_winners?: string[];
  selection_counts?: Record<string, number>;
  duration_seconds: number | null;
  user_id?: string;
  created_at: string;
}

export interface TestimonialRecord {
  id: string;
  name: string;
  role?: string;
  audience?: string;
  experience?: string;
  impact?: string;
  challenge?: string;
  testimonial_draft?: string;
  status: "pending" | "approved" | "rejected";
  rating?: number;
  photo_url?: string;
  email?: string;
  created_at: string;
}

// ─── Helpers ───

export const PIPELINE_STAGES = [
  { id: "anonymous", label: "Anonymous", color: "#6B6560" },
  { id: "captured", label: "Captured", color: "#5B7B8C" },
  { id: "engaged", label: "Engaged", color: "#7B8C5B" },
  { id: "booking_requested", label: "Booking Requested", color: "#C4943D" },
  { id: "contacted", label: "Contacted", color: "#8C7B5B" },
  { id: "in_conversation", label: "In Conversation", color: "#D4A574" },
  { id: "proposal_sent", label: "Proposal Sent", color: "#D4A574" },
  { id: "won", label: "Won", color: "#5B8C5A" },
  { id: "lost", label: "Lost", color: "#C45B5B" },
  { id: "nurture", label: "Nurture", color: "#8C5B7B" },
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number]["id"];

export interface LeadRecord {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  customer_type: "individual" | "family" | "school" | "organization";
  pipeline_stage: PipelineStage;
  lead_score: number;
  source: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  follow_up_date: string | null;
  follow_up_note: string | null;
  lost_reason: string | null;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EngagementRecord {
  id: string;
  lead_id: string | null;
  client_name: string;
  organization: string | null;
  engagement_type: string;
  tier: "I" | "II" | "III" | null;
  segment: "individual" | "family" | "school" | "organization";
  contract_value: number;
  amount_invoiced: number;
  amount_received: number;
  status: "active" | "completed" | "paused" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  sessions_total: number;
  sessions_completed: number;
  deliverables: unknown[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EngagementSession {
  id: string;
  engagement_id: string;
  session_date: string | null;
  session_notes: string | null;
  hold_stage: "honor" | "observe" | "live" | "declare" | null;
  created_at: string;
}

export const HOLD_STAGES = ["honor", "observe", "live", "declare"] as const;

export interface RevenueSummary {
  totalRevenue: number;
  totalInvoiced: number;
  totalContract: number;
  outstanding: number;
  bySegment: Record<string, number>;
  byMonth: Record<string, number>;
  byStatus: Record<string, number>;
  avgBySegment: Record<string, number>;
  pipelineCount: number;
  engagementCount: number;
}

// ─── Helpers ───

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtDate(val: unknown) {
  if (!val) return "—";
  const d = new Date(val as string);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function fmtValues(val: unknown) {
  if (!val) return "—";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}
