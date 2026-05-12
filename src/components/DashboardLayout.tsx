import { Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Monitor,
  Package,
  BarChart3,
  Settings,
  Brain,
  MessageSquare,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'OVERVIEW', icon: LayoutDashboard },
  { path: '/floor', label: 'LIVE FLOOR', icon: Monitor },
  { path: '/inventory', label: 'INVENTORY', icon: Package },
  { path: '/revenue', label: 'REVENUE', icon: BarChart3 },
  { path: '/ai', label: 'AI ASSISTANT', icon: Brain },
  { path: '/contact', label: 'CONTACT', icon: MessageSquare },
  { path: '/settings', label: 'SETTINGS', icon: Settings },
]

export default function DashboardLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-[#8A8A8A] font-mono-tech text-sm animate-pulse">LOADING SYSTEM...</div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#050505] text-[#F9F9F9] flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-[rgba(255,255,255,0.1)] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-[rgba(255,255,255,0.1)]">
          <div className="text-2xl font-black tracking-tight text-[#F9F9F9]">
            NEXUS
          </div>
          <div className="ml-2 text-[10px] font-mono-tech text-[#0024A7] bg-[#0024A7]/10 px-2 py-0.5">
            ADMIN
          </div>
          <button
            className="ml-auto lg:hidden text-[#8A8A8A] hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? 'text-[#F9F9F9] bg-[#0024A7]/15 border-l-2 border-[#0024A7]'
                    : 'text-[#8A8A8A] hover:text-[#F9F9F9] hover:bg-[rgba(255,255,255,0.03)] border-l-2 border-transparent'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-[#0024A7]" />}
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0024A7]/20 flex items-center justify-center">
              <User size={14} className="text-[#0024A7]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] font-mono-tech text-[#8A8A8A] uppercase">
                {user?.role || 'user'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8A8A8A] hover:text-[#ff4444] hover:bg-[#ff4444]/5 transition-colors border border-[rgba(255,255,255,0.1)]"
          >
            <LogOut size={12} />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-[rgba(255,255,255,0.1)] bg-[#050505]/80 backdrop-blur-sm flex items-center px-6 sticky top-0 z-30">
          <button
            className="lg:hidden mr-4 text-[#8A8A8A] hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-xs font-mono-tech text-[#8A8A8A]">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })}
            </div>
            <div className="hidden md:block text-xs font-mono-tech text-[#8A8A8A]">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="text-[10px] font-mono-tech text-[#0024A7] bg-[#0024A7]/10 px-2 py-1">
              v1.0.0
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
