import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import type { User } from '@supabase/supabase-js'
import { ArrowLeft, History, CalendarDays, Clock, HelpCircle, LogOut } from 'lucide-react'
import { SUBJECTS } from '@/lib/constants'
import { useProgress } from '@/hooks/useProgress'
import MiniCalendar from '@/components/MiniCalendar'
import ProgressModal from '@/components/ProgressModal'
import HistoryModal from '@/components/HistoryModal'
import type { DailyProgress, ProgressFormData } from '@/types'
import { useAuth } from '@/hooks/useAuth'

interface SubjectPageProps {
  user: User
}

export default function SubjectPage({ user }: SubjectPageProps) {
  const { subjectId } = useParams<{ subjectId: string }>()
  const navigate = useNavigate()

  const subject = SUBJECTS.find(s => s.id === subjectId)

  const {
    fetchActiveDates,
    fetchDayProgress,
    fetchSubjectProgress,
    fetchPrepStartDate,
    saveProgress,
    deleteProgress,
  } = useProgress(user.id)

  const [activeDates, setActiveDates] = useState<Set<string>>(new Set())
  const [prepStartDate, setPrepStartDate] = useState<string | null>(null)
  const [allEntries, setAllEntries] = useState<DailyProgress[]>([])

  // Modal state
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dayProgress, setDayProgress] = useState<DailyProgress | null>(null)
  const [saving, setSaving] = useState(false)

  // Stats
  const totalStudyHours = allEntries.reduce((s, e) => s + (e.study_hours || 0), 0)
  const totalQHours = allEntries.reduce((s, e) => s + (e.question_hours || 0), 0)
  const daysLogged = activeDates.size

  const reload = useCallback(async () => {
    if (!subject) return
    const [dates, start, entries] = await Promise.all([
      fetchActiveDates(subject.id),
      fetchPrepStartDate(),
      fetchSubjectProgress(subject.id),
    ])
    setActiveDates(dates)
    setPrepStartDate(start)
    setAllEntries(entries)
  }, [subject, fetchActiveDates, fetchPrepStartDate, fetchSubjectProgress])

  useEffect(() => {
    reload()
  }, [reload])

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Subject not found.</p>
          <button onClick={() => navigate('/')} className="text-amber text-sm font-mono hover:underline">
            ← Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleDateClick = async (date: Date) => {
    setSelectedDate(date)
    const prog = await fetchDayProgress(subject.id, format(date, 'yyyy-MM-dd'))
    setDayProgress(prog)
    setProgressModalOpen(true)
  }

  const handleEditFromHistory = async (dateStr: string) => {
    const date = parseISO(dateStr)
    setSelectedDate(date)
    const prog = await fetchDayProgress(subject.id, dateStr)
    setDayProgress(prog)
    setProgressModalOpen(true)
  }

  const handleSave = async (data: ProgressFormData) => {
    setSaving(true)
    const ok = await saveProgress(subject.id, format(selectedDate, 'yyyy-MM-dd'), data)
    if (ok) {
      setProgressModalOpen(false)
      await reload()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    await deleteProgress(subject.id, format(selectedDate, 'yyyy-MM-dd'))
    setProgressModalOpen(false)
    await reload()
  }

  const { signOut } = useAuth()
  const displayName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Aspirant'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-muted hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:block">Dashboard</span>
            </button>
            <span className="text-border text-sm">/</span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className="text-white text-sm font-medium">{subject.shortName}</span>
            </div>
          </div>
                  <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {avatarUrl && <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full border border-border" />}
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-500/50 border border-border transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
        </div>


      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className='flex flex-row items-start justify-between'>
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-1">{subject.name}</h1>
            <p className="text-muted text-sm font-mono">{subject.shortName} · GATE 2027 CS/IT</p>
          </div>

          <button
            onClick={() => setHistoryModalOpen(true)}
            className="flex items-center gap-1.5 text-white hover:bg-neutral-800 text-sm px-3 py-1.5 rounded-lg bg-card border border-border transition-all"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <CalendarDays className="w-4 h-4 text-muted mx-auto mb-2" />
            <p className="text-white font-mono text-2xl font-medium">{daysLogged}</p>
            <p className="text-muted text-xs font-mono mt-0.5">days logged</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Clock className="w-4 h-4 text-muted mx-auto mb-2" />
            <p className="text-white font-mono text-2xl font-medium">{totalStudyHours.toFixed(1)}</p>
            <p className="text-muted text-xs font-mono mt-0.5">study hrs</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <HelpCircle className="w-4 h-4 text-muted mx-auto mb-2" />
            <p className="text-white font-mono text-2xl font-medium">{totalQHours.toFixed(1)}</p>
            <p className="text-muted text-xs font-mono mt-0.5">q-solve hrs</p>
          </div>
        </div>

        {/* Calendar — large, centered */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto animate-slide-up overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Activity Calendar</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-[10px] text-muted font-mono">logged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[10px] text-muted font-mono">missed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3A3A3A' }} />
                <span className="text-[10px] text-muted font-mono">today</span>
              </div>
            </div>
          </div>

          <MiniCalendar
            subjectColor={subject.color}
            activeDates={activeDates}
            prepStartDate={prepStartDate}
            onDateClick={handleDateClick}
          />
        </div>
      </main>

      {/* Modals */}
      <ProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        subject={subject}
        date={selectedDate}
        existing={dayProgress}
        onSave={handleSave}
        onDelete={dayProgress ? handleDelete : undefined}
        saving={saving}
      />

      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        subject={subject}
        entries={allEntries}
        onEditEntry={handleEditFromHistory}
      />
    </div>
  )
}