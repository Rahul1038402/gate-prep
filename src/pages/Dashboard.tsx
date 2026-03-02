import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { Brain, LogOut, ChevronRight, CalendarDays } from 'lucide-react'
import { SUBJECTS, GATE_EXAM_DATE } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { useProgress } from '@/hooks/useProgress'
import { differenceInDays, format } from 'date-fns'

interface DashboardProps {
    user: User
}

function DaysLeftBanner() {
    const daysLeft = differenceInDays(GATE_EXAM_DATE, new Date())
    const weeksLeft = Math.floor(daysLeft / 7)

    const FIXED_START = new Date('2026-02-01')
    const totalDays = differenceInDays(GATE_EXAM_DATE, FIXED_START)
    const elapsed = differenceInDays(new Date(), FIXED_START)
    const progress = Math.max(0, Math.min(100, (elapsed / totalDays) * 100))

    return (
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">Time Remaining</p>
                    <div className="flex items-baseline gap-2">
                        <span className="font-mono text-5xl font-medium text-white tabular-nums">{daysLeft}</span>
                        <span className="text-muted text-sm font-mono">days · {weeksLeft} weeks</span>
                    </div>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xs text-muted font-mono mb-1">GATE 2027 · CS/IT</p>
                    <p className="text-amber font-mono text-lg font-medium">{format(GATE_EXAM_DATE, 'MMM yyyy')}</p>
                </div>
            </div>
            <div className="mt-4 relative z-10">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-muted font-mono">
                        {progress <= 50
                            ? '🌱 early days - grind starts'
                            : progress <= 75
                                ? '🔒 lock in - no more excuses'
                                : '📝 revision & test series time'}
                    </span>

                    <span className="text-xs text-amber font-mono">{progress.toFixed(0)}% elapsed</span>
                </div>
                <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

interface SubjectRowProps {
    subject: (typeof SUBJECTS)[0]
    userId: string
    onClick: () => void
}

function SubjectRow({ subject, userId, onClick }: SubjectRowProps) {
    const { fetchActiveDates } = useProgress(userId)
    const [daysLogged, setDaysLogged] = useState(0)

    useEffect(() => {
        fetchActiveDates(subject.id).then(dates => setDaysLogged(dates.size))
    }, [subject.id, fetchActiveDates])

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 bg-card border border-border hover:border-subtle rounded-xl px-5 py-4 text-left transition-all duration-200 hover:bg-surface group"
        >
            <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: subject.color }} />
            <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{subject.name}</p>
                <p className="text-muted text-xs font-mono mt-0.5">{subject.shortName}</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-muted">
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="text-xs font-mono tabular-nums">{daysLogged} days</span>
            </div>
            <div className="hidden md:flex items-center gap-2 w-32">
                <div className="flex-1 h-1 bg-subtle rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (daysLogged / 300) * 100)}%`, backgroundColor: subject.color }}
                    />
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-subtle group-hover:text-muted transition-colors shrink-0" />
        </button>
    )
}

export default function Dashboard({ user }: DashboardProps) {
    const { signOut } = useAuth()
    const navigate = useNavigate()
    const displayName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Aspirant'
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-amber/10 border border-amber/30 rounded-lg flex items-center justify-center">
                            <Brain className="w-3.5 h-3.5 text-amber" />
                        </div>
                        <span className="text-white font-semibold text-sm tracking-tight">Gate Tracker 2027</span>
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

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6 animate-fade-in">
                    <h1 className="text-2xl font-semibold text-white mb-1">Hey {displayName.split(' ')[0]} 👋</h1>
                    <p className="text-muted text-sm">Pick a subject to log today's prep.</p>
                </div>

                <DaysLeftBanner />

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                            Subjects
                            <span className="text-xs text-muted font-mono font-normal bg-surface border border-border rounded-md px-2 py-0.5">{SUBJECTS.length}</span>
                        </h2>
                        <div className="hidden sm:flex items-center gap-4 text-xs text-subtle font-mono pr-9">
                            <span className="w-16 text-right">days logged</span>
                            <span className="w-32 text-right">progress</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {SUBJECTS.map((subject, i) => (
                            <div key={subject.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}>
                                <SubjectRow subject={subject} userId={user.id} onClick={() => navigate(`/subject/${subject.id}`)} />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}