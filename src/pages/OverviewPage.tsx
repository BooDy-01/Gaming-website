import { trpc } from '@/providers/trpc'
import { Monitor, Users, DollarSign, Clock } from 'lucide-react'

export default function OverviewPage() {
  const { data: stations } = trpc.station.list.useQuery()
  const { data: todayRevenue } = trpc.revenue.today.useQuery()
  const { data: activeSessions } = trpc.session.getActive.useQuery()

  const activeStations = stations?.filter((s) => s.status === 'active' || s.status === 'paused') || []
  const vacantStations = stations?.filter((s) => s.status === 'vacant') || []

  const pcCount = activeStations.filter((s) => s.type === 'pc').length
  const consoleCount = activeStations.filter((s) => s.type === 'ps5' || s.type === 'xbox').length
  const vrCount = activeStations.filter((s) => s.type === 'vr').length

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <img
          src="/hero-gaming.jpg"
          alt="Gaming Cafe Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 to-transparent" />

        {/* Hero Metrics Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-12">
          <div className="flex justify-end">
            <div className="bg-[#101010]/80 backdrop-blur-sm border border-[rgba(255,255,255,0.1)] p-4 lg:p-6">
              <div className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">
                Active Stations
              </div>
              <div className="text-4xl lg:text-6xl font-black text-[#F9F9F9] animate-metric-pulse">
                {activeStations.length}.
              </div>
              <div className="mt-2 text-xs font-mono-tech text-[#8A8A8A]">
                {pcCount} PC &bull; {consoleCount} CONSOLE &bull; {vrCount} VR
              </div>
            </div>
          </div>

          <div className="flex gap-4 lg:gap-6 flex-wrap">
            {/* Today's Revenue */}
            <div className="bg-[#101010]/80 backdrop-blur-sm border border-[rgba(255,255,255,0.1)] border-l-2 border-l-[#0024A7] p-4 lg:p-6 min-w-[180px]">
              <div className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">
                Today's Revenue
              </div>
              <div className="text-2xl lg:text-4xl font-black text-[#F9F9F9] animate-metric-pulse">
                ${(todayRevenue?.totalRevenue || 0).toFixed(0)}.
              </div>
              <div className="mt-2 text-xs font-mono-tech text-[#0024A7]">
                <DollarSign size={12} className="inline mr-1" />
                GAMING + SNACKS
              </div>
            </div>

            {/* Vacant Stations */}
            <div className="bg-[#101010]/80 backdrop-blur-sm border border-[rgba(255,255,255,0.1)] p-4 lg:p-6 min-w-[160px]">
              <div className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">
                Available
              </div>
              <div className="text-2xl lg:text-4xl font-black text-[#F9F9F9]">
                {vacantStations.length}.
              </div>
              <div className="mt-2 text-xs font-mono-tech text-[#8A8A8A]">
                STATIONS READY
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-[#101010]/80 backdrop-blur-sm border border-[rgba(255,255,255,0.1)] p-4 lg:p-6 min-w-[160px]">
              <div className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">
                Sessions
              </div>
              <div className="text-2xl lg:text-4xl font-black text-[#F9F9F9]">
                {activeSessions?.length || 0}.
              </div>
              <div className="mt-2 text-xs font-mono-tech text-[#8A8A8A]">
                IN PROGRESS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operating Hours Bar */}
      <div className="bg-[#101010] border-t border-[rgba(255,255,255,0.1)] px-6 lg:px-12 py-4 flex items-center gap-4 flex-wrap">
        <Clock size={14} className="text-[#0024A7]" />
        <span className="text-xs font-mono-tech text-[#8A8A8A]">
          OPERATING HOURS: 10:00 - 02:00 (WEEKDAYS) &bull; 24H (WEEKENDS)
        </span>
      </div>

      {/* Quick Stats Grid */}
      <div className="p-6 lg:p-12">
        <div className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider mb-6">
          System Status
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {stations?.map((station, index) => {
            const isActive = station.status === 'active'
            const isPaused = station.status === 'paused'
            const isMaintenance = station.status === 'maintenance'

            return (
              <div
                key={station.id}
                className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-4 lg:p-5 hover:border-[#0024A7] transition-colors group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono-tech text-[#8A8A8A]">
                    {station.name}
                  </span>
                  <div
                    className={`w-1.5 h-8 ${
                      isActive
                        ? 'bg-[#0024A7]'
                        : isPaused
                        ? 'bg-[#8A8A8A]'
                        : isMaintenance
                        ? 'bg-[#ff4444]'
                        : 'bg-[rgba(255,255,255,0.1)]'
                    }`}
                  />
                </div>

                <div className="text-xs font-bold uppercase tracking-wider mb-1">
                  {isActive ? (
                    <span className="text-[#0024A7]">{station.currentUser}</span>
                  ) : isPaused ? (
                    <span className="text-[#8A8A8A]">PAUSED</span>
                  ) : isMaintenance ? (
                    <span className="text-[#ff4444]">MAINTENANCE</span>
                  ) : (
                    <span className="text-[#8A8A8A]">VACANT</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Monitor size={12} className="text-[#8A8A8A]" />
                  <span className="text-[10px] font-mono-tech text-[#8A8A8A] uppercase">
                    {station.type} &bull; ${station.hourlyRate}/hr
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-1">
          <button
            onClick={() => (window.location.href = '/floor')}
            className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-5 text-left hover:border-[#0024A7] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Monitor size={18} className="text-[#0024A7] group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-[#F9F9F9] uppercase">Manage Stations</div>
                <div className="text-[10px] font-mono-tech text-[#8A8A8A] mt-1">
                  START, PAUSE, OR END SESSIONS
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = '/inventory')}
            className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-5 text-left hover:border-[#0024A7] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Users size={18} className="text-[#0024A7] group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-[#F9F9F9] uppercase">Inventory</div>
                <div className="text-[10px] font-mono-tech text-[#8A8A8A] mt-1">
                  MANAGE SNACKS AND DRINKS
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => (window.location.href = '/revenue')}
            className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-5 text-left hover:border-[#0024A7] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <DollarSign size={18} className="text-[#0024A7] group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-bold text-[#F9F9F9] uppercase">Revenue</div>
                <div className="text-[10px] font-mono-tech text-[#8A8A8A] mt-1">
                  VIEW REPORTS AND ANALYTICS
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
