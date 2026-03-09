import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, BookOpen, Clock, HelpCircle, PlayCircle, StickyNote, Loader2, Trash2, Zap } from 'lucide-react'
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
}

const defaultForm: ProgressFormData = {
  chapters: '',
  topics: '',
  study_hours: 0,
  question_hours: 0,
  lecture_number: 0,
  notes: '',
}

interface HourFieldProps {
  field: 'study_hours' | 'question_hours'
  label: string
  icon: React.ElementType
  placeholder: string
  value: number
  timerFilledField?: 'study_hours' | 'question_hours' | null
  onChange: (field: 'study_hours' | 'question_hours', val: number) => void
}

/** Splits decimal hours into { hrs, mins } for display */
function decimalToHrMin(h: number): { hrs: number; mins: number } {
  const total = Math.round((h || 0) * 60)
  return { hrs: Math.floor(total / 60), mins: total % 60 }
}

/** Combines separate hr + min inputs back to decimal hours */
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
        {/* Hours */}
        <div className="flex-1 relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            className={fieldClass}
            value={hrs || ''}
            onChange={e => {
              const h = parseInt(e.target.value) || 0
              onChange(field, hrMinToDecimal(h, mins))
            }}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono pointer-events-none">hr</span>
        </div>

        <span className="text-muted font-mono text-sm shrink-0">:</span>

        {/* Minutes */}
        <div className="flex-1 relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            className={fieldClass}
            value={mins || ''}
            onChange={e => {
              const m = Math.min(59, parseInt(e.target.value) || 0)
              onChange(field, hrMinToDecimal(hrs, m))
            }}
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

export default function ProgressModal({
  isOpen, onClose, subject, date, existing, onSave, onDelete, saving, timerFilledField,
}: ProgressModalProps) {
  const [form, setForm] = useState<ProgressFormData>(defaultForm)

  useEffect(() => {
    if (isOpen) {
      setForm(existing ? {
        chapters: existing.chapters || '',
        topics: existing.topics || '',
        study_hours: existing.study_hours || 0,
        question_hours: existing.question_hours || 0,
        lecture_number: existing.lecture_number || 0,
        notes: existing.notes || '',
      } : defaultForm)
    }
  }, [existing, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-[80vw] max-w-3xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-8 py-6 border-b border-border shrink-0">
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
        <div className="overflow-y-auto flex-1 px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
                  <BookOpen className="w-3.5 h-3.5" /> Chapters Covered
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ch.3 – Graph Theory, Ch.4 – Trees"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-amber/60 transition-all duration-200"
                  value={form.chapters}
                  onChange={e => setForm(f => ({ ...f, chapters: e.target.value }))}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
                  <BookOpen className="w-3.5 h-3.5" /> Topics Covered
                </label>
                <input
                  type="text"
                  placeholder="e.g. DFS, BFS, Dijkstra's algorithm"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-amber/60 transition-all duration-200"
                  value={form.topics}
                  onChange={e => setForm(f => ({ ...f, topics: e.target.value }))}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
                  <PlayCircle className="w-3.5 h-3.5" /> Lecture Number
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 42"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-amber/60 transition-all duration-200 font-mono"
                  value={form.lecture_number || ''}
                  onChange={e => setForm(f => ({ ...f, lecture_number: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <HourField
                field="study_hours"
                label="Study Hours"
                icon={Clock}
                placeholder="0"
                value={form.study_hours}
                timerFilledField={timerFilledField}
                onChange={(field, val) => setForm(f => ({ ...f, [field]: val }))}
              />
              <HourField
                field="question_hours"
                label="Question Solving Hours"
                icon={HelpCircle}
                placeholder="0"
                value={form.question_hours}
                timerFilledField={timerFilledField}
                onChange={(field, val) => setForm(f => ({ ...f, [field]: val }))}
              />

              {/* Hours summary card */}
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-muted font-mono uppercase tracking-widest mb-3">Session Summary</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:text-center">
                  <div>
                    <p className="text-white font-mono text-xl font-medium">
                      {hoursToLabel(form.study_hours) || '—'}
                    </p>
                    <p className="text-muted text-[10px] font-mono mt-0.5">study</p>
                  </div>
                  <div>
                    <p className="text-white font-mono text-xl font-medium">
                      {hoursToLabel(form.question_hours) || '—'}
                    </p>
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
            </div>
          </div>

          {/* Notes — full width */}
          <div className="mt-6">
            <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </label>
            <textarea
              rows={4}
              placeholder="Any observations, doubts, or reminders..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-amber/60 transition-all duration-200 resize-none"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border flex sm:flex-row flex-col items-center justify-between gap-3 shrink-0">
          {existing && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm px-4 py-2.5 rounded-lg hover:bg-red-400/10 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete entry
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-surface border border-border text-muted hover:text-white rounded-xl px-6 py-2.5 text-sm transition-all hover:border-muted"
            >
              Cancel
            </button>
            <button
              onClick={async () => { await onSave(form) }}
              disabled={saving}
              className="flex items-center justify-center gap-2 bg-amber hover:bg-amber/90 text-black font-semibold rounded-xl px-8 py-2.5 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (existing ? 'Update' : 'Save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}