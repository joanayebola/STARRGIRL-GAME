import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mcwqktmwssiavfxapaof.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd3FrdG13c3NpYXZmeGFwYW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTgwNDIsImV4cCI6MjA5MjkzNDA0Mn0.F_dT0F4fcDcOemqo111bOyHyVBgj6lxSPczp4rerxvw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface ScoreEntry {
  id: string
  name: string
  score: number
  created_at: string
}

export async function getTopScores(limit = 10): Promise<ScoreEntry[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('id, name, score, created_at')
    .order('score', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function submitScore(name: string, score: number): Promise<ScoreEntry> {
  const { data, error } = await supabase
    .from('scores')
    .insert({ name, score })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPlayerRank(score: number): Promise<number> {
  const { count, error } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
    .gt('score', score)
  if (error) throw error
  return (count ?? 0) + 1
}
