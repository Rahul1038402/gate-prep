import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DailyProgress, ProgressFormData } from '@/types'

export function useProgress(userId: string | undefined) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubjectProgress = useCallback(async (subjectId: string): Promise<DailyProgress[]> => {
    if (!userId) return []
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .order('date', { ascending: false })
    setLoading(false)
    if (error) { setError(error.message); return [] }
    return data as DailyProgress[]
  }, [userId])

  const fetchDayProgress = useCallback(async (subjectId: string, date: string): Promise<DailyProgress | null> => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .eq('date', date)
      .maybeSingle()
    if (error) { setError(error.message); return null }
    return data as DailyProgress | null
  }, [userId])

  const saveProgress = useCallback(async (
    subjectId: string,
    date: string,
    formData: ProgressFormData
  ): Promise<boolean> => {
    if (!userId) return false
    setLoading(true)
    setError(null)
    const record: DailyProgress = { user_id: userId, subject_id: subjectId, date, ...formData }
    const { error } = await supabase
      .from('daily_progress')
      .upsert(record, { onConflict: 'user_id,subject_id,date' })
    setLoading(false)
    if (error) { setError(error.message); return false }
    return true
  }, [userId])

  const deleteProgress = useCallback(async (subjectId: string, date: string): Promise<boolean> => {
    if (!userId) return false
    const { error } = await supabase
      .from('daily_progress')
      .delete()
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .eq('date', date)
    if (error) { setError(error.message); return false }
    return true
  }, [userId])

  const fetchActiveDates = useCallback(async (subjectId: string): Promise<Set<string>> => {
    if (!userId) return new Set()
    const { data, error } = await supabase
      .from('daily_progress')
      .select('date')
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
    if (error) return new Set()
    return new Set((data as { date: string }[]).map(r => r.date))
  }, [userId])

  // Earliest entry date across ALL subjects = prep start date
  const fetchPrepStartDate = useCallback(async (): Promise<string | null> => {
    if (!userId) return null
    const { data, error } = await supabase
      .from('daily_progress')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    return (data as { date: string }).date
  }, [userId])

  return {
    loading,
    error,
    fetchSubjectProgress,
    fetchDayProgress,
    saveProgress,
    deleteProgress,
    fetchActiveDates,
    fetchPrepStartDate,
  }
}