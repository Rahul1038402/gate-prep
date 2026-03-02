export interface Subject {
  id: string
  name: string
  shortName: string
  color: string
  icon: string
}

export interface DailyProgress {
  id?: string
  user_id: string
  subject_id: string
  date: string // ISO format YYYY-MM-DD
  chapters: string
  topics: string
  study_hours: number
  question_hours: number
  lecture_number: number
  notes: string
  created_at?: string
  updated_at?: string
}

export interface ProgressFormData {
  chapters: string
  topics: string
  study_hours: number
  question_hours: number
  lecture_number: number
  notes: string
}

export type UserProfile = {
  id: string
  email: string | undefined
  full_name: string | null
  avatar_url: string | null
}