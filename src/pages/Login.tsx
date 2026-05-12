import { useState } from 'react'
import { useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Monitor, LogIn, UserPlus, ArrowRight } from 'lucide-react'

function getOAuthUrl() {
  const authUrl = new URL(import.meta.env.VITE_KIMI_AUTH_URL)
  authUrl.searchParams.set('client_id', import.meta.env.VITE_APP_ID)
  authUrl.searchParams.set('redirect_uri', `${window.location.origin}/api/oauth/callback`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'profile')
  authUrl.searchParams.set('state', btoa(window.location.pathname))
  return authUrl.toString()
}

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem('local_auth_token', data.token)
      window.location.href = '/'
    },
    onError: (err) => setError(err.message),
  })

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem('local_auth_token', data.token)
      window.location.href = '/'
    },
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'login') {
      loginMutation.mutate({ username, password })
    } else {
      registerMutation.mutate({ username, password, displayName: displayName || username })
    }
  }

  const isLoading = loginMutation.isPending || registerMutation.isPending

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/hero-gaming.jpg"
          alt="Gaming Cafe"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-16">
          <div className="text-6xl font-black tracking-tight text-[#F9F9F9] mb-4">
            NEXUS
          </div>
          <div className="text-xl font-bold text-[#8A8A8A] uppercase tracking-widest mb-8">
            Gaming Cafe Management
          </div>
          <div className="text-sm text-[#8A8A8A] max-w-sm leading-relaxed">
            The ultimate command center for managing your gaming cafe operations. Track stations,
            monitor inventory, analyze revenue, and optimize your business with AI-powered insights.
          </div>
          <div className="flex items-center gap-6 mt-8 text-xs font-mono-tech text-[#8A8A8A]">
            <div className="flex items-center gap-2">
              <Monitor size={14} className="text-[#0024A7]" />
              <span>10 STATIONS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0024A7] animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl font-black tracking-tight text-[#F9F9F9] mb-2">NEXUS</div>
            <div className="text-xs font-bold text-[#8A8A8A] uppercase tracking-widest">
              Gaming Cafe Management
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex mb-8 border border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${
                mode === 'login'
                  ? 'bg-[#0024A7] text-white'
                  : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              className={`flex-1 py-3 text-xs font-bold transition-colors ${
                mode === 'register'
                  ? 'bg-[#0024A7] text-white'
                  : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              REGISTER
            </button>
          </div>

          {/* OAuth button */}
          <a
            href={getOAuthUrl()}
            className="w-full flex items-center justify-center gap-2 py-3 mb-6 border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] text-xs font-bold hover:border-[#0024A7] hover:text-[#0024A7] transition-colors"
          >
            <LogIn size={14} />
            <span>SIGN IN WITH KIMI</span>
          </a>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.1)]" />
            <span className="text-[10px] font-mono-tech text-[#8A8A8A]">OR</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.1)]" />
          </div>

          {/* Local auth form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-3 text-sm focus:border-[#0024A7] focus:outline-none transition-colors"
                  placeholder="Enter display name"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-3 text-sm focus:border-[#0024A7] focus:outline-none transition-colors"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-3 text-sm focus:border-[#0024A7] focus:outline-none transition-colors"
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-xs text-[#ff4444] bg-[#ff4444]/5 px-3 py-2 border border-[#ff4444]/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-pulse">PROCESSING...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn size={14} />
                  <span>LOGIN</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>CREATE ACCOUNT</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/contact')}
              className="text-[10px] font-mono-tech text-[#8A8A8A] hover:text-[#0024A7] transition-colors flex items-center gap-1 mx-auto"
            >
              <span>NEED HELP? CONTACT SUPPORT</span>
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
