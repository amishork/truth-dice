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
  selectionCounts: Record<string, number>
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('quiz_sessions').insert({
    user_id: userId,
    area_of_life: areaOfLife,
    final_six_values: finalSixValues,
    all_winners: allWinners,
    selection_counts: selectionCounts,
  });
  return { error: error as Error | null };
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
