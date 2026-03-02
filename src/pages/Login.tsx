import { FcGoogle } from 'react-icons/fc'
import { LuBrain } from 'react-icons/lu'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber/10 border border-amber/30 rounded-xl flex items-center justify-center">
              <LuBrain className="w-5 h-5 text-amber" />
            </div>
            <div>
              <p className="text-xs text-muted font-mono tracking-widest uppercase">Gate</p>
              <p className="text-white font-semibold text-lg leading-none tracking-tight">Tracker 2027</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
            <p className="text-muted text-sm leading-relaxed">
              Track your GATE 2027 preparation,<br />one day at a time.
            </p>
          </div>

          {/* Exam countdown teaser */}
          <div className="bg-surface border border-border rounded-xl p-4 mb-6 text-center">
            <p className="text-xs text-muted font-mono uppercase tracking-widest mb-1">GATE 2027</p>
            <p className="text-amber font-mono font-medium text-sm">Feb 7, 2027 · CS/IT</p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 rounded-xl py-3 px-4 font-medium text-sm hover:bg-gray-100 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          >
            <FcGoogle className="w-5 h-5 shrink-0" />
            Continue with Google
          </button>

          <p className="text-center text-muted text-xs mt-6 leading-relaxed">
            By signing in, you agree to use this tracker<br />for educational purposes only.
          </p>
        </div>

        <p className="text-center text-subtle text-xs mt-6 font-mono">
          built for cs/it · gate 2027
        </p>
      </div>
    </div>
  )
}