import { useMemo } from 'react'
import { differenceInDays, format } from 'date-fns'
import { GATE_EXAM_DATE } from '@/lib/constants'

export default function DaysLeft() {
  const daysLeft = useMemo(() => {
    return differenceInDays(GATE_EXAM_DATE, new Date())
  }, [])

  const weeksLeft = Math.floor(daysLeft / 7)
  const progress = Math.max(0, Math.min(100, ((548 - daysLeft) / 548) * 100)) // ~18 months total

  return (
    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">Time Remaining</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-5xl font-medium text-white tabular-nums">{daysLeft}</span>
              <span className="text-muted text-sm font-mono">days</span>
            </div>
            <p className="text-muted text-xs mt-1">{weeksLeft} weeks left</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted font-mono mb-1">GATE 2027</p>
            <p className="text-amber font-mono text-sm font-medium">{format(GATE_EXAM_DATE, 'dd MMM yyyy')}</p>
            <p className="text-muted text-xs mt-1">CS / IT</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-muted font-mono">prep timeline</span>
            <span className="text-xs text-amber font-mono">{progress.toFixed(0)}% elapsed</span>
          </div>
          <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-amber rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}