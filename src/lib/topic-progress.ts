import { supabase } from '@/lib/supabase'

/**
 * Returns a Set of "chapter_id:topic_name" strings for ALL dates.
 * Used to show permanent Done status in the UI and drive the pie chart.
 */
export async function fetchCompletedTopics(
  userId: string,
  subjectId: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from('topic_progress')
    .select('chapter_id, topic')
    .eq('user_id', userId)
    .eq('subject_id', subjectId)

  const set = new Set<string>()
  data?.forEach(row => set.add(`${row.chapter_id}:${row.topic}`))
  return set
}

/**
 * Saves newly completed topics for a specific date.
 * Uses upsert — safe to call multiple times for same day.
 */
export async function saveCompletedTopics(
  userId: string,
  subjectId: string,
  topicKeys: string[],
  date: string,
): Promise<void> {
  if (!topicKeys.length) return

  const rows = topicKeys.map(key => {
    const colonIdx = key.indexOf(':')
    return {
      user_id: userId,
      subject_id: subjectId,
      chapter_id: key.slice(0, colonIdx),
      topic: key.slice(colonIdx + 1),
      date,
    }
  })

  await supabase
    .from('topic_progress')
    .upsert(rows, {
      onConflict: 'user_id,subject_id,chapter_id,topic,date',
    })
}

/**
 * Deletes all topic completions logged on a specific date.
 * Called when a daily_progress entry is deleted — cleanly undoes any
 * Done marks that were set that day.
 */
export async function deleteCompletedTopicsForDate(
  userId: string,
  subjectId: string,
  date: string
): Promise<void> {
  await supabase
    .from('topic_progress')
    .delete()
    .eq('user_id', userId)
    .eq('subject_id', subjectId)
    .eq('date', date)
}