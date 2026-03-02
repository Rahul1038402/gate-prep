import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, BookOpen, Clock, HelpCircle, PlayCircle, StickyNote, Loader2, Trash2 } from 'lucide-react'
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
}

const defaultForm: ProgressFormData = {
  chapters: '',
  topics: '',
  study_hours: 0,
  question_hours: 0,
  lecture_number: 0,
  notes: '',
}

export default function ProgressModal({
  isOpen, onClose, subject, date, existing, onSave, onDelete, saving,
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

  const inputBase = 'w-full bg-surface border border-border rounded-lg px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-amber/60 transition-all duration-200'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — 80vw wide, up to 90vh tall */}
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
                  className={inputBase}
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
                  className={inputBase}
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
                  className={cn(inputBase, 'font-mono')}
                  value={form.lecture_number || ''}
                  onChange={e => setForm(f => ({ ...f, lecture_number: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
                  <Clock className="w-3.5 h-3.5" /> Study Hours
                </label>
                <input
                  type="number"
                  min="0" max="24" step="0.5"
                  placeholder="0"
                  className={cn(inputBase, 'font-mono')}
                  value={form.study_hours || ''}
                  onChange={e => setForm(f => ({ ...f, study_hours: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-muted font-mono uppercase tracking-widest mb-2">
                  <HelpCircle className="w-3.5 h-3.5" /> Question Solving Hours
                </label>
                <input
                  type="number"
                  min="0" max="24" step="0.5"
                  placeholder="0"
                  className={cn(inputBase, 'font-mono')}
                  value={form.question_hours || ''}
                  onChange={e => setForm(f => ({ ...f, question_hours: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              {/* Hours summary card */}
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-muted font-mono uppercase tracking-widest mb-3">Session Summary</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-white font-mono text-xl font-medium">{form.study_hours || 0}</p>
                    <p className="text-muted text-[10px] font-mono mt-0.5">study hrs</p>
                  </div>
                  <div>
                    <p className="text-white font-mono text-xl font-medium">{form.question_hours || 0}</p>
                    <p className="text-muted text-[10px] font-mono mt-0.5">q-solve hrs</p>
                  </div>
                  <div>
                    <p className="text-amber font-mono text-xl font-medium">
                      {((form.study_hours || 0) + (form.question_hours || 0)).toFixed(1)}
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
              className={cn(inputBase, 'resize-none')}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border flex items-center justify-between gap-3 shrink-0">
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