import { supabase } from '@/integrations/supabase/client';

export interface QuizSession {
  id: string;
  user_id: string | null;
  area_of_life: string;
  final_six_values: string[];
  all_winners: string[];
  selection_counts: Record<string, number>;
  created_at: string;
}

export async function saveQuizSession(
  userId: string | null,
  areaOfLife: string,
  finalSixValues: string[],
  allWinners: string[],
  selectionCounts: Record<string, number>,
  durationSeconds?: number
): Promise<{ error: Error | null; sessionId: string | null }> {
  const sessionId = crypto.randomUUID();
  const row: Record<string, unknown> = {
    id: sessionId,
    user_id: userId,
    area_of_life: areaOfLife,
    final_six_values: finalSixValues,
    all_winners: allWinners,
    selection_counts: selectionCounts,
  };
  if (durationSeconds && durationSeconds > 0) {
    row.duration_seconds = Math.round(durationSeconds);
  }
  const { error } = await supabase.from('quiz_sessions').insert(row);
  return { error: error as Error | null, sessionId: error ? null : sessionId };
}

export async function getAvgQuizDuration(): Promise<number> {
  const { data, error } = await supabase.rpc('get_avg_quiz_duration');
  if (error || data == null) return 720;
  return data as number;
}

export async function getCompletedAreas(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('area_of_life')
    .eq('user_id', userId);
  if (error || !data) return [];
  return [...new Set(data.map((r: { area_of_life: string }) => r.area_of_life))];
}

export async function getUserSessions(userId: string): Promise<QuizSession[]> {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as QuizSession[];
}

export async function getSessionById(sessionId: string): Promise<QuizSession | null> {
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (error || !data) return null;
  return data as QuizSession;
}

export const GUEST_SESSION_KEY = 'wi-guest-session-id';

export async function claimGuestSession(userId: string): Promise<boolean> {
  try {
    const sessionId = localStorage.getItem(GUEST_SESSION_KEY);
    if (!sessionId) return false;
    const { error } = await supabase
      .from('quiz_sessions')
      .update({ user_id: userId })
      .eq('id', sessionId)
      .is('user_id', null);
    if (!error) {
      localStorage.removeItem(GUEST_SESSION_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Core Values (cross-area synthesis) ───────────────────────────────────────

export async function getCoreValues(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('core_values')
    .select('values')
    .eq('user_id', userId)
    .single();
  if (error || !data) return [];
  return data.values as string[];
}

export async function saveCoreValues(userId: string, values: string[]): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('core_values')
    .upsert(
      { user_id: userId, values, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  return { error: error as Error | null };
}

/** Aggregate all unique values across sessions, ranked by area count */
export function aggregateValuesAcrossSessions(sessions: QuizSession[]): { value: string; areaCount: number; areas: string[] }[] {
  const valueMap = new Map<string, Set<string>>();
  for (const session of sessions) {
    for (const value of session.final_six_values) {
      if (!valueMap.has(value)) valueMap.set(value, new Set());
      valueMap.get(value)!.add(session.area_of_life);
    }
  }
  return Array.from(valueMap.entries())
    .map(([value, areas]) => ({ value, areaCount: areas.size, areas: Array.from(areas) }))
    .sort((a, b) => b.areaCount - a.areaCount || a.value.localeCompare(b.value));
}
