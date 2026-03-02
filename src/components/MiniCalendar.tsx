import { useState } from 'react'
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    addDays, addMonths, subMonths, isSameMonth, isToday, isAfter,
    isBefore, parseISO, startOfDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
    subjectColor: string
    activeDates: Set<string>      // dates WITH entries (green)
    prepStartDate: string | null  // dates from here onward with no entry = red
    onDateClick: (date: Date) => void
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function MiniCalendar({ activeDates, prepStartDate, onDateClick }: MiniCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const monthStart = startOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(endOfMonth(currentMonth))

    const days: Date[] = []
    let day = calStart
    while (day <= calEnd) {
        days.push(day)
        day = addDays(day, 1)
    }

    const today = startOfDay(new Date())
    const prepStart = prepStartDate ? startOfDay(parseISO(prepStartDate)) : null

    return (
        <div className="w-full">
            {/* Month nav */}
            <div className="flex items-center justify-center gap-3 mb-6">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-7 h-7 flex items-center justify-center text-muted hover:text-white hover:bg-surface rounded-lg transition-all"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-lg font-mono text-muted uppercase tracking-widest w-28 text-center">
                    {format(currentMonth, 'MMM yyyy')}
                </span>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-7 h-7 flex items-center justify-center text-muted hover:text-white hover:bg-surface rounded-lg transition-all"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <p className="text-muted text-xs font-mono mb-8 border border-border rounded-lg p-2 w-fit mx-auto">Click any date to log progress</p>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((d, i) => (
                    <div key={i} className="text-center text-amber text-xs font-mono py-2">{d}</div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1.5">
                {days.map((d, i) => {
                    const dateStr = format(d, 'yyyy-MM-dd')
                    const inMonth = isSameMonth(d, currentMonth)
                    const isActive = activeDates.has(dateStr)
                    const isTodayDate = isToday(d)
                    const isFutureDate = isAfter(startOfDay(d), today)

                    // Red = past date (>= prepStart) with no entry
                    const isPrepDate = prepStart !== null && !isBefore(startOfDay(d), prepStart)
                    const isMissed = isPrepDate && !isActive && !isTodayDate && !isFutureDate

                    if (!inMonth) {
                        return <div key={i} />
                    }

                    return (
                        <button
                            key={i}
                            disabled={isFutureDate}
                            onClick={() => onDateClick(d)}
                            className={cn(
                                'relative w-full aspect-square flex items-center justify-center rounded-xl text-sm font-mono transition-all duration-150',
                                isFutureDate && 'text-subtle cursor-default',
                                !isFutureDate && !isActive && !isMissed && !isTodayDate && 'text-muted hover:text-white hover:bg-surface',
                                isTodayDate && !isActive && 'text-white ring-1 ring-amber/40',
                            )}
                            style={
                                isActive
                                    ? { backgroundColor: '#16a34a22', color: '#4ade80' }   // green
                                    : isMissed
                                        ? { backgroundColor: '#dc262622', color: '#f87171' }   // red
                                        : isTodayDate
                                            ? { backgroundColor: '#3A3A3A' }
                                            : {}
                            }
                        >
                            {format(d, 'd')}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}