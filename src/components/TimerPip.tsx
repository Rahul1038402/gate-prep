import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Timer, BookOpen, HelpCircle } from 'lucide-react'

//  Types 

type TimerMode = 'stopwatch' | 'countdown'
export type TimerType = 'study' | 'qsolve'
type Phase = 'idle' | 'setup' | 'running' | 'summary'

interface Subject {
    name: string
    shortName: string
    color: string
}

export interface TimerPiPProps {
    subject: Subject
    onSessionComplete: (hours: number, type: TimerType) => void
}

//  Helpers 

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

//  PiP Content (inline styles — no Tailwind in pip window) 

interface PiPContentProps {
    subject: Subject
    displayTime: string
    countdownProgress: number // 0→1, only used in countdown mode
    mode: TimerMode
    type: TimerType
    isPaused: boolean
    onPause: () => void
    onResume: () => void
    onStop: () => void
}

function PiPContent({
    subject, displayTime, countdownProgress, mode, type, isPaused, onPause, onResume, onStop,
}: PiPContentProps) {
    return (
        <div style={{
            background: '#0d0d0d',
            color: '#fff',
            fontFamily: 'ui-monospace, "Cascadia Code", "SF Mono", monospace',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px',
            gap: '10px',
            userSelect: 'none',
            overflow: 'hidden',
        }}>
            {/* Subject tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    backgroundColor: subject.color,
                    boxShadow: `0 0 6px ${subject.color}88`,
                }} />
                <span style={{ fontSize: '10px', color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {subject.shortName}
                </span>
            </div>

            {/* Timer display */}
            <div style={{
                fontSize: '56px',
                fontWeight: '500',
                letterSpacing: '-0.03em',
                color: isPaused ? '#555' : '#fff',
                lineHeight: 1,
                transition: 'color 0.3s ease',
                tabularNums: 'tabular-nums',
            } as React.CSSProperties}>
                {displayTime}
            </div>

            {/* Session type */}
            <div style={{
                fontSize: '10px',
                color: subject.color,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                opacity: 0.9,
            }}>
                {type === 'study' ? '📖 Study Session' : '📝 Q-Solve Session'}
            </div>

            {/* Countdown progress bar */}
            {mode === 'countdown' && (
                <div style={{
                    width: '80%',
                    height: '2px',
                    background: '#222',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '2px',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${countdownProgress * 100}%`,
                        background: subject.color,
                        borderRadius: '2px',
                        transition: 'width 0.8s linear',
                        boxShadow: `0 0 4px ${subject.color}`,
                    }} />
                </div>
            )}

            {/* Paused label */}
            {isPaused && (
                <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em' }}>
                    PAUSED
                </div>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                    onClick={isPaused ? onResume : onPause}
                    style={{
                        background: '#1c1c1c',
                        border: '1px solid #333',
                        borderRadius: '10px',
                        color: '#ccc',
                        padding: '7px 16px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        letterSpacing: '0.06em',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#2a2a2a')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1c1c1c')}
                >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
                <button
                    onClick={onStop}
                    style={{
                        background: '#1c1c1c',
                        border: '1px solid #7f1d1d',
                        borderRadius: '10px',
                        color: '#ef4444',
                        padding: '7px 16px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        letterSpacing: '0.06em',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#2a1a1a')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1c1c1c')}
                >
                    ■ Stop
                </button>
            </div>
        </div>
    )
}

//  Setup Modal 

const PRESET_MINUTES = [25, 45, 60, 90, 120]

function SetupModal({ subject, onStart, onClose }: {
    subject: Subject
    onStart: (mode: TimerMode, type: TimerType, minutes: number) => void
    onClose: () => void
}) {
    const [mode, setMode] = useState<TimerMode>('stopwatch')
    const [type, setType] = useState<TimerType>('study')
    const [minutes, setMinutes] = useState(60)

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: subject.color }} />
                    <h2 className="text-white font-semibold text-sm">Setup Timer</h2>
                    <span className="text-muted font-mono text-xs ml-auto">{subject.shortName}</span>
                </div>

                {/* Session type */}
                <div className="mb-5">
                    <p className="text-muted text-[10px] font-mono uppercase tracking-widest mb-2">Session Type</p>
                    <div className="grid grid-cols-2 gap-2">
                        {(['study', 'qsolve'] as TimerType[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-mono transition-all ${type === t
                                    ? 'border-amber text-amber bg-amber/10'
                                    : 'border-border text-muted hover:border-subtle hover:text-white'
                                    }`}
                            >
                                {t === 'study'
                                    ? <BookOpen className="w-3 h-3" />
                                    : <HelpCircle className="w-3 h-3" />
                                }
                                {t === 'study' ? 'Study' : 'Q-Solve'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timer mode */}
                <div className="mb-5">
                    <p className="text-muted text-[10px] font-mono uppercase tracking-widest mb-2">Mode</p>
                    <div className="grid grid-cols-2 gap-2">
                        {(['stopwatch', 'countdown'] as TimerMode[]).map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-3 py-2.5 rounded-xl border text-xs font-mono transition-all ${mode === m
                                    ? 'border-amber text-amber bg-amber/10'
                                    : 'border-border text-muted hover:border-subtle hover:text-white'
                                    }`}
                            >
                                {m === 'stopwatch' ? '⏱ Stopwatch' : '⏳ Countdown'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Countdown duration */}
                {mode === 'countdown' && (
                    <div className="mb-5">
                        <p className="text-muted text-[10px] font-mono uppercase tracking-widest mb-2">Duration</p>
                        <div className="flex gap-2 flex-wrap items-center">
                            {PRESET_MINUTES.map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMinutes(m)}
                                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all ${minutes === m
                                        ? 'border-amber text-amber bg-amber/10'
                                        : 'border-border text-muted hover:text-white'
                                        }`}
                                >
                                    {m}m
                                </button>
                            ))}
                            <input
                                type="number"
                                value={minutes}
                                onChange={e => setMinutes(Math.max(1, Math.min(480, parseInt(e.target.value) || 1)))}
                                className="w-14 bg-surface border border-border rounded-lg px-2 py-1.5 text-white text-[11px] font-mono text-center focus:outline-none focus:border-subtle"
                                min={1}
                                max={480}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-400/10 border border-red-400 text-red-400 text-xs font-mono hover:text-red-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onStart(mode, type, minutes)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#4ade80]/10 border border-[#4ade80] text-[#4ade80] text-xs font-mono hover:bg-[#4ade80]/20 transition-colors"
                    >
                        Start →
                    </button>
                </div>
            </div>
        </div>
    )
}

//  Summary Modal 

function SummaryModal({ seconds, type, subject, onLog, onDiscard }: {
    seconds: number
    type: TimerType
    subject: Subject
    onLog: () => void
    onDiscard: () => void
}) {
    const hrs = seconds / 3600

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: subject.color }} />
                    <h2 className="text-white font-semibold text-sm">Session Complete</h2>
                </div>
                <p className="text-muted text-[11px] font-mono mb-6">
                    {subject.shortName} · {type === 'study' ? 'Study' : 'Q-Solve'}
                </p>

                {/* Time display */}
                <div className="bg-surface border border-border rounded-xl p-5 text-center mb-2">
                    <p className="text-white font-mono text-4xl font-medium tracking-tight mb-1">
                        {formatTime(seconds)}
                    </p>
                    <p className="text-muted text-xs font-mono">
                        {hrs.toFixed(2)} hrs · {type === 'study' ? 'study time' : 'question solving'}
                    </p>
                </div>

                <p className="text-muted text-[10px] font-mono text-center mb-5">
                    This will be added to today's progress entry.
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={onDiscard}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-muted text-xs font-mono hover:text-white transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onLog}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-amber/10 border border-amber text-amber text-xs font-mono hover:bg-amber/20 transition-colors"
                    >
                        Log to Progress →
                    </button>
                </div>
            </div>
        </div>
    )
}

//  Main Export 

export default function TimerPiP({ subject, onSessionComplete }: TimerPiPProps) {
    const [phase, setPhase] = useState<Phase>('idle')
    const [mode, setMode] = useState<TimerMode>('stopwatch')
    const [type, setType] = useState<TimerType>('study')
    const [countdownMinutes, setCountdownMinutes] = useState(60)
    const [elapsed, setElapsed] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [pipBody, setPipBody] = useState<Element | null>(null)
    const [finalSeconds, setFinalSeconds] = useState(0)

    // Refs for use in closures / event listeners
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const elapsedRef = useRef(0)
    const phaseRef = useRef<Phase>('idle')
    const pipWindowRef = useRef<Window | null>(null)

    useEffect(() => { phaseRef.current = phase }, [phase])

    //  Ticker 
    useEffect(() => {
        if (phase !== 'running' || isPaused) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return
        }
        intervalRef.current = setInterval(() => {
            setElapsed(e => {
                const next = e + 1
                elapsedRef.current = next
                return next
            })
        }, 1000)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [phase, isPaused])

    //  Countdown auto-stop 
    const countdownTotal = countdownMinutes * 60
    useEffect(() => {
        if (mode === 'countdown' && phase === 'running' && elapsed >= countdownTotal) {
            stopTimer()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elapsed])

    //  Stop 
    const stopTimer = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        const final = elapsedRef.current
        setFinalSeconds(final)
        pipWindowRef.current?.close()
        pipWindowRef.current = null
        setPipBody(null)
        setPhase('summary')
    }, [])

    //  Open PiP 
    const openPiP = useCallback(async (): Promise<boolean> => {
        if (!(window as any).documentPictureInPicture) {
            alert('Picture-in-Picture is not supported in this browser.\nPlease use Chrome 116 or later.')
            return false
        }
        try {
            const pip: Window = await (window as any).documentPictureInPicture.requestWindow({
                width: 280,
                height: 230,
            })

            // Inject a minimal CSS reset into the pip window
            const style = pip.document.createElement('style')
            style.textContent = `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; background: #0d0d0d; }
      `
            pip.document.head.appendChild(style)

            // Handle user closing pip window externally
            pip.addEventListener('pagehide', () => {
                if (phaseRef.current === 'running') {
                    setFinalSeconds(elapsedRef.current)
                    setPipBody(null)
                    pipWindowRef.current = null
                    setPhase('summary')
                    if (intervalRef.current) clearInterval(intervalRef.current)
                }
            })

            pipWindowRef.current = pip
            setPipBody(pip.document.body)
            return true
        } catch (err) {
            console.error('PiP open failed:', err)
            return false
        }
    }, [])

    //  Start 
    const handleStart = async (m: TimerMode, t: TimerType, mins: number) => {
        setMode(m)
        setType(t)
        setCountdownMinutes(mins)
        setElapsed(0)
        elapsedRef.current = 0
        setIsPaused(false)
        const ok = await openPiP()
        if (ok) setPhase('running')
    }

    //  Derived display values 
    const displayTime = mode === 'countdown'
        ? formatTime(Math.max(0, countdownTotal - elapsed))
        : formatTime(elapsed)

    const countdownProgress = mode === 'countdown'
        ? Math.max(0, (countdownTotal - elapsed) / countdownTotal)
        : 0

    return (
        <>
            {/* Idle — show "Timer" button */}
            {phase === 'idle' && (
                <button
                    onClick={() => setPhase('setup')}
                    className="flex items-center gap-1.5 text-white hover:bg-neutral-800 text-sm px-3 py-1.5 rounded-lg bg-card border border-border transition-all"
                >
                    <Timer className="w-4 h-4" />
                    <span>Timer</span>
                </button>
            )}

            {/* Running — pulsing indicator in place of button */}
            {(phase === 'running') && (
                <button
                    onClick={stopTimer}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 transition-all"
                    title="Click to stop timer"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="font-mono text-xs text-red-400 tabular-nums">{displayTime}</span>
                </button>
            )}

            {/* Setup modal */}
            {phase === 'setup' && (
                <SetupModal
                    subject={subject}
                    onStart={handleStart}
                    onClose={() => setPhase('idle')}
                />
            )}

            {/* PiP portal — renders into the floating pip window */}
            {pipBody && createPortal(
                <PiPContent
                    subject={subject}
                    displayTime={displayTime}
                    countdownProgress={countdownProgress}
                    mode={mode}
                    type={type}
                    isPaused={isPaused}
                    onPause={() => setIsPaused(true)}
                    onResume={() => setIsPaused(false)}
                    onStop={stopTimer}
                />,
                pipBody,
            )}

            {/* Summary modal */}
            {phase === 'summary' && (
                <SummaryModal
                    seconds={finalSeconds}
                    type={type}
                    subject={subject}
                    onLog={() => {
                        onSessionComplete(finalSeconds / 3600, type)
                        setPhase('idle')
                        setElapsed(0)
                        elapsedRef.current = 0
                    }}
                    onDiscard={() => {
                        setPhase('idle')
                        setElapsed(0)
                        elapsedRef.current = 0
                    }}
                />
            )}
        </>
    )
}