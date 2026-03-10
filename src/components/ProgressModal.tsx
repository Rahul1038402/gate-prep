import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  X, BookOpen, Clock, HelpCircle, PlayCircle, StickyNote,
  Loader2, Trash2, Zap, ChevronDown, CheckSquare, Square
} from 'lucide-react'
import type { Subject, ProgressFormData, DailyProgress } from '@/types'
import { cn } from '@/lib/utils'

interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject
  date: Date
  existing: DailyProgress | null
  onSave: (data: ProgressFormData) => Promise<void>
  onDelete?: () => Promise<void>
  saving: boolean
  timerFilledField?: 'study_hours' | 'question_hours' | null
  completedTopics?: Set<string>
}

const defaultForm: ProgressFormData = {
  chapters: '',
  topics: '',
  study_hours: 0,
  question_hours: 0,
  lecture_number: '',
  notes: '',
  studied_topics: [],
  newly_completed_topics: [],
}

function decimalToHrMin(h: number): { hrs: number; mins: number } {
  const total = Math.round((h || 0) * 60)
  return { hrs: Math.floor(total / 60), mins: total % 60 }
}
function hrMinToDecimal(hrs: number, mins: number): number {
  return parseFloat(((hrs || 0) + (mins || 0) / 60).toFixed(4))
}

interface HourFieldProps {
  field: 'study_hours' | 'question_hours'
  label: string
  icon: React.ElementType
  value: number
  timerFilledField?: 'study_hours' | 'question_hours' | null
  onChange: (field: 'study_hours' | 'question_hours', val: number) => void
}

function HourField({ field, label, icon: Icon, value, timerFilledField, onChange }: HourFieldProps) {
  const isTimerFilled = timerFilledField === field
  const { hrs, mins } = decimalToHrMin(value)
  const fieldClass = cn(
    'w-full bg-surface border border-border rounded-lg px-3 py-3 text-white text-sm',
    'placeholder:text-muted focus:outline-none transition-all duration-200 font-mono text-center',
    isTimerFilled ? 'border-amber/40 focus:border-amber' : 'focus:border-amber/60'
  )
  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
        {isTimerFilled && (
          <span className="ml-auto flex items-center gap-1 text-amber text-[9px] font-mono normal-case tracking-normal bg-amber/10 border border-amber/20 rounded-md px-1.5 py-0.5">
            <Zap className="w-2.5 h-2.5" /> timer
          </span>
        )}
      </label>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text" inputMode="numeric" placeholder="0" className={fieldClass}
            value={hrs || ''}
            onChange={e => onChange(field, hrMinToDecimal(parseInt(e.target.value) || 0, mins))}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono pointer-events-none">hr</span>
        </div>
        <span className="text-muted font-mono text-sm shrink-0">:</span>
        <div className="flex-1 relative">
          <input
            type="text" inputMode="numeric" placeholder="0" className={fieldClass}
            value={mins || ''}
            onChange={e => onChange(field, hrMinToDecimal(hrs, Math.min(59, parseInt(e.target.value) || 0)))}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono pointer-events-none">min</span>
        </div>
      </div>
    </div>
  )
}

function hoursToLabel(h: number): string | null {
  if (!h || h <= 0) return null
  const totalMins = Math.round(h * 60)
  const hrs = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`
  if (hrs > 0) return `${hrs}h`
  return `${mins}m`
}

// Main Modal 

export default function ProgressModal({
  isOpen, onClose, subject, date, existing, onSave, onDelete,
  saving, timerFilledField, completedTopics = new Set(),
}: ProgressModalProps) {
  const [form, setForm] = useState<ProgressFormData>(defaultForm)
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const [studiedKeys, setStudiedKeys] = useState<Set<string>>(new Set())
  const [newlyDoneKeys, setNewlyDoneKeys] = useState<Set<string>>(new Set())

  const chapters = subject.chapters ?? []
  const selectedChapter = chapters.find(c => c.id === selectedChapterId) ?? null

  // Reset on open
  useEffect(() => {
    if (!isOpen) return
    setNewlyDoneKeys(new Set())

    const existingTopicNames = existing?.topics
      ? new Set(existing.topics.split(',').map(t => t.trim()).filter(Boolean))
      : new Set<string>()

    const preStudied = new Set<string>()
    const savedChapter = chapters.find(c => c.name === existing?.chapters)
    if (savedChapter) {
      savedChapter.topics.forEach(t => {
        if (existingTopicNames.has(t)) preStudied.add(`${savedChapter.id}:${t}`)
      })
    }
    setStudiedKeys(preStudied)

    setForm(existing ? {
      chapters: existing.chapters || '',
      topics: existing.topics || '',
      study_hours: existing.study_hours || 0,
      question_hours: existing.question_hours || 0,
      lecture_number: existing.lecture_number || '',
      notes: existing.notes || '',
      studied_topics: [],
      newly_completed_topics: [],
    } : defaultForm)
  }, [existing, isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select chapter from existing entry
  useEffect(() => {
    if (!isOpen) return
    if (existing?.chapters) {
      const match = chapters.find(c => c.name === existing.chapters)
      if (match) { setSelectedChapterId(match.id); return }
    }
    setSelectedChapterId('')
  }, [isOpen, existing]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  const toggleStudied = (key: string) => {
    setStudiedKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleDone = (key: string) => {
    setNewlyDoneKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
        setStudiedKeys(s => new Set([...s, key]))
      }
      return next
    })
  }

  const handleSave = async () => {
    const studiedTopicNames = selectedChapter
      ? selectedChapter.topics.filter(t => studiedKeys.has(`${selectedChapterId}:${t}`))
      : form.topics.split(',').map(t => t.trim()).filter(Boolean)

    await onSave({
      ...form,
      chapters: selectedChapter?.name || form.chapters,
      topics: studiedTopicNames.join(', '),
      studied_topics: [...studiedKeys],
      newly_completed_topics: [...newlyDoneKeys],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-[90vw] max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className="text-xs text-muted font-mono uppercase tracking-widest">{subject.shortName}</span>
            </div>
            <h2 className="text-white font-semibold text-xl">{format(date, 'EEEE, dd MMMM yyyy')}</h2>
            <p className="text-muted text-sm mt-0.5">{existing ? 'Edit progress entry' : 'Add progress entry'}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors p-2 rounded-lg hover:bg-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Row 1: Chapter + Lecture Number */}
          <div className="grid grid-cols-2 gap-4">
            {/* Chapter */}
            <div>
              <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
                <BookOpen className="w-3.5 h-3.5" /> Chapter
              </label>
              <div className="relative">
                <select
                  value={selectedChapterId}
                  onChange={e => setSelectedChapterId(e.target.value)}
                  className="w-full appearance-none bg-surface border border-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber/60 transition-all pr-10 cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="text-muted bg-card">— pick a chapter —</option>
                  {chapters.map(ch => (
                    <option key={ch.id} value={ch.id} className="bg-card">{ch.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
            </div>

            {/* Lecture Number */}
            <div>
              <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
                <PlayCircle className="w-3.5 h-3.5" /> Lecture Number
              </label>
              <input
                type="text"
                placeholder="e.g. 42 or 2A, 2B"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-amber/60 transition-all font-mono"
                value={form.lecture_number || ''}
                onChange={e => setForm(f => ({ ...f, lecture_number: e.target.value }))}
              />
            </div>
          </div>

          {/* Row 2: Topics — full width */}
          {selectedChapter ? (
            <div>
              {/* Column headers */}
              <div className="flex items-center mb-1.5 px-3">
                <span className="flex-1 text-[10px] text-muted font-mono uppercase tracking-wider">Topic</span>
                <div className="flex items-center shrink-0">
                  <span className="text-[10px] text-amber/60 font-mono uppercase tracking-wider w-14 text-center">Studied</span>
                  <span className="text-[10px] text-green-400/60 font-mono uppercase tracking-wider w-12 text-center">Done</span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface divide-y divide-border/40 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-amber scrollbar-track-transparent">
                {selectedChapter.topics.map(topic => {
                  const key = `${selectedChapterId}:${topic}`
                  const isZeroWeight = selectedChapter.zeroWeightTopics?.includes(topic)
                  const isPermanentlyDone = completedTopics.has(key)
                  const isStudied = studiedKeys.has(key)
                  const isNewlyDone = newlyDoneKeys.has(key)
                  const isDone = isPermanentlyDone || isNewlyDone

                  return (
                    <div key={topic} className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 transition-colors">
                      {/* Topic name */}
                      <span className={cn(
                        'flex-1 text-sm leading-snug',
                        isDone ? 'text-white/50' : isStudied ? 'text-white' : 'text-muted'
                      )}>
                        {topic}
                        {isZeroWeight && (
                          <span className="ml-1.5 text-[9px] font-mono text-muted/40 align-middle">unweighted</span>
                        )}
                      </span>

                      {/* Studied (amber) */}
                      <button
                        onClick={() => toggleStudied(key)}
                        className={cn(
                          'shrink-0 w-14 flex justify-center transition-colors rounded',
                          isStudied ? 'text-amber' : 'text-border hover:text-amber/50'
                        )}
                        title="Mark as studied today (can repeat daily)"
                      >
                        {isStudied ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>

                      {/* Done (green) */}
                      <button
                        onClick={() => !isPermanentlyDone && toggleDone(key)}
                        disabled={isPermanentlyDone}
                        className={cn(
                          'shrink-0 w-12 flex justify-center transition-colors rounded',
                          isPermanentlyDone
                            ? 'text-green-400/40 cursor-not-allowed'
                            : isNewlyDone
                              ? 'text-green-400'
                              : 'text-border hover:text-green-400/50'
                        )}
                        title={isPermanentlyDone ? 'Already completed' : 'Mark as permanently done'}
                      >
                        {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Summary badges */}
              {(studiedKeys.size > 0 || newlyDoneKeys.size > 0) && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {studiedKeys.size > 0 && (
                    <span className="text-[10px] font-mono bg-amber/10 border border-amber/20 text-amber rounded-md px-2 py-0.5">
                      {studiedKeys.size} studied today
                    </span>
                  )}
                  {newlyDoneKeys.size > 0 && (
                    <span className="text-[10px] font-mono bg-green-400/10 border border-green-400/20 text-green-400 rounded-md px-2 py-0.5">
                      {newlyDoneKeys.size} newly completed
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : existing ? (
            <div>
              <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
                <BookOpen className="w-3.5 h-3.5" /> Topics
              </label>
              <input
                type="text" placeholder="e.g. DFS, BFS"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-amber/60 transition-all"
                value={form.topics}
                onChange={e => setForm(f => ({ ...f, topics: e.target.value }))}
              />
            </div>
          ) : null}

          {/* Row 3: Study Hours + Question Hours */}
          <div className="flex sm:flex-row flex-col items-start gap-6 sm:gap-16 justify-between">
            <HourField
              field="study_hours" label="Study Hours" icon={Clock}
              value={form.study_hours} timerFilledField={timerFilledField}
              onChange={(field, val) => setForm(f => ({ ...f, [field]: val }))}
            />
            <HourField
              field="question_hours" label="Question Solving Hours" icon={HelpCircle}
              value={form.question_hours} timerFilledField={timerFilledField}
              onChange={(field, val) => setForm(f => ({ ...f, [field]: val }))}
            />
          </div>

          {/* Row 4: Session Summary — full width */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-muted font-mono uppercase tracking-widest mb-3">Session Summary</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-white font-mono text-xl font-medium">{hoursToLabel(form.study_hours) || '—'}</p>
                <p className="text-muted text-[10px] font-mono mt-0.5">study</p>
              </div>
              <div>
                <p className="text-white font-mono text-xl font-medium">{hoursToLabel(form.question_hours) || '—'}</p>
                <p className="text-muted text-[10px] font-mono mt-0.5">q-solve</p>
              </div>
              <div>
                <p className="text-amber font-mono text-xl font-medium">
                  {hoursToLabel((form.study_hours || 0) + (form.question_hours || 0)) || '—'}
                </p>
                <p className="text-muted text-[10px] font-mono mt-0.5">total</p>
              </div>
            </div>
          </div>

          {/* Row 5: Notes — full width */}
          <div>
            <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </label>
            <textarea
              rows={3} placeholder="Any observations, doubts, or reminders..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-amber/60 transition-all resize-none"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-center sm:justify-between gap-3 shrink-0">
          {existing && onDelete ? (
            <button
              type="button" onClick={onDelete}
              className="hidden sm:flex items-center gap-1.5 border-red-400 bg-red-400/10 text-red-400 hover:text-red-300 text-sm px-4 py-2.5 rounded-lg hover:bg-red-400/10 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete entry
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave} disabled={saving}
              className="flex items-center justify-center gap-2 bg-amber hover:bg-amber/90 text-black font-semibold rounded-xl px-8 py-2.5 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (existing ? 'Update' : 'Save')}
            </button>
            <button
              type="button" onClick={onClose}
              className="bg-surface border border-border text-muted hover:text-white rounded-xl px-6 py-2.5 text-sm transition-all hover:border-muted"
            >
              Cancel
            </button>
          </div>
        </div>
        {existing && onDelete ? (
          <div className='mb-4 flex sm:hidden justify-center items-center'>
            <button
              type="button" onClick={onDelete}
              className="flex gap-1.5 border-red-400 bg-red-400/10 text-red-400 hover:text-red-300 text-sm px-4 py-2.5 rounded-lg hover:bg-red-400/10 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete entry
            </button>
          </div>
        ) : <div />}
      </div>
    </div>
  )
}