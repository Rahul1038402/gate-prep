import { format, parseISO } from 'date-fns'
import { X, Clock, HelpCircle, StickyNote, CalendarDays } from 'lucide-react'
import type { DailyProgress, Subject } from '@/types'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject
  entries: DailyProgress[]
  onEditEntry: (date: string) => void
}

function groupByMonth(entries: DailyProgress[]): Record<string, DailyProgress[]> {
  return entries.reduce((acc, entry) => {
    const key = format(parseISO(entry.date), 'MMMM yyyy')
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {} as Record<string, DailyProgress[]>)
}

function EntryCard({ entry, onEdit }: { entry: DailyProgress; onEdit: () => void }) {
  const totalHours = (entry.study_hours || 0) + (entry.question_hours || 0)

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-subtle transition-all">

      {/* Date + edit */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-muted" />
          <span className="text-[#4ade80] text-sm font-medium">
            {format(parseISO(entry.date), 'EEEE, dd MMM')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {totalHours > 0 && (
            <span className="hidden sm:block text-amber font-mono text-xs font-medium">{totalHours.toFixed(1)}h</span>
          )}
          <button
            onClick={onEdit}
            className="text-white hover:bg-neutral-800 text-xs px-2.5 py-1 rounded-lg bg-card border border-border transition-all"
          >
            edit
          </button>
        </div>
      </div>

      {/* Chapters */}
      <div className="mb-2">
        <p className="text-[10px] text-muted font-mono uppercase tracking-widest mb-0.5">Chapters</p>
        <p className={`text-base font-medium leading-snug ${entry.chapters ? 'text-white' : 'text-subtle'}`}>
          {entry.chapters || 'N/A'}
        </p>
      </div>

      {/* Topics + Lecture */}
      <div className="flex flex-col gap-1 mb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] text-muted font-mono uppercase tracking-widest shrink-0">Topics</span>
          <p className={`text-xs leading-relaxed ${entry.topics ? 'text-white/80' : 'text-subtle'}`}>
            {entry.topics || 'N/A'}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] text-muted font-mono uppercase tracking-widest shrink-0">Lecture</span>
          <p className={`text-xs font-mono ${entry.lecture_number > 0 ? 'text-white/80' : 'text-subtle'}`}>
            {entry.lecture_number > 0 ? `#${entry.lecture_number}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Times */}
      <div className="flex sm:flex-row flex-col sm:items-center sm:gap-24 mt-2">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-subtle" />
          <span className="font-mono text-muted text-[14px] mr-1">Study:</span>
          <span className={`font-mono ${entry.study_hours > 0 ? 'text-muted' : 'text-subtle'}`}>
            {entry.study_hours > 0 ? (
              <>
                <span className="text-[18px] text-amber">{entry.study_hours}hr</span>

              </>
            ) : (
              'N/A'
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-subtle" />
          <span className="font-mono text-muted text-[14px] mr-1">Q-Solving:</span>
          <span className={`font-mono ${entry.question_hours > 0 ? 'text-muted' : 'text-subtle'}`}>
            {entry.question_hours > 0 ? (
              <>
                <span className="text-[18px] text-amber">{entry.question_hours}hr</span>

              </>
            ) : (
              'N/A'
            )}
          </span>
        </div>
      </div>

      {/* Notes */}
      {entry.notes && (
        <div className="mt-3 pt-3 border-t border-border flex gap-2">
          <StickyNote className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
          <p className="text-muted text-xs leading-relaxed italic">{entry.notes}</p>
        </div>
      )}
    </div>
  )
}

export default function HistoryModal({ isOpen, onClose, subject, entries, onEditEntry }: HistoryModalProps) {
  if (!isOpen) return null

  const grouped = groupByMonth(entries)
  const months = Object.keys(grouped)

  const totalHours = entries.reduce((sum, e) => sum + (e.study_hours || 0) + (e.question_hours || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-[80vw] max-w-3xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-8 py-6 border-b border-border shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className="text-xs text-muted font-mono uppercase tracking-widest">{subject.shortName}</span>
            </div>
            <h2 className="text-white font-semibold text-xl">Study History</h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-muted text-sm">{entries.length} entries</p>
              {totalHours > 0 && (
                <p className="text-amber text-sm font-mono">{totalHours.toFixed(1)}h total</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white p-2 rounded-lg hover:bg-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="w-10 h-10 text-subtle mb-3" />
              <p className="text-muted text-sm">No entries yet for this subject.</p>
              <p className="text-subtle text-xs font-mono mt-1">Click any date on the calendar to start logging.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {months.map(month => (
                <div key={month}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-white font-semibold text-sm">{month}</h3>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-muted text-xs font-mono">
                      {grouped[month].length} {grouped[month].length === 1 ? 'entry' : 'entries'} ·{' '}
                      {grouped[month].reduce((s, e) => s + (e.study_hours || 0) + (e.question_hours || 0), 0).toFixed(1)}h
                    </span>
                  </div>
                  <div className="space-y-3">
                    {grouped[month].map(entry => (
                      <EntryCard
                        key={entry.id || entry.date}
                        entry={entry}
                        onEdit={() => {
                          onClose()
                          onEditEntry(entry.date)
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}