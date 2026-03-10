export interface Chapter {
  id: string
  name: string
  topics: string[]
  zeroWeightTopics?: string[]
}

export interface Subject {
  id: string
  name: string
  shortName: string
  color: string
  icon: string
  chapters?: Chapter[]
}

export interface ProgressFormData {
  chapters: string
  topics: string
  study_hours: number
  question_hours: number
  lecture_number: string
  notes: string
  studied_topics?: string[]
  newly_completed_topics?: string[]
}

export interface DailyProgress {
  id?: string
  user_id: string
  subject_id: string
  date: string
  chapters: string
  topics: string
  study_hours: number
  question_hours: number
  lecture_number: string
  notes: string
  created_at?: string
  updated_at?: string
}

export type UserProfile = {
  id: string
  email: string | undefined
  full_name: string | null
  avatar_url: string | null
}