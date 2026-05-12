import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/providers/trpc'
import { Play, Pause, Square, ShoppingCart, Plus, Minus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Station = {
  id: number
  name: string
  type: string
  hourlyRate: string
  status: string
  currentUser: string | null
  currentSessionId: number | null
}

type SessionData = {
  id: number
  stationId: number
  userName: string
  startTime: Date
  duration: number | null
  gamingCost: string | null
  addonsCost: string | null
  totalCost: string | null
  status: string
}

function useElapsedTime(startTime: Date, isActive: boolean, baseMinutes: number | null) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setElapsed((baseMinutes || 0) * 60)
      return
    }
    const start = new Date(startTime).getTime()
    const base = (baseMinutes || 0) * 60 * 1000

    const update = () => {
      const now = Date.now()
      setElapsed(Math.floor((now - start + base) / 1000))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startTime, isActive, baseMinutes])

  return elapsed
}

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function StationCard({
  station,
  session,
  onStart,
  onPause,
  onResume,
  onEnd,
  onAddAddon,
}: {
  station: Station
  session: SessionData | undefined
  onStart: (stationId: number) => void
  onPause: (stationId: number) => void
  onResume: (stationId: number) => void
  onEnd: (stationId: number) => void
  onAddAddon: (stationId: number) => void
}) {
  const isActive = station.status === 'active'
  const isPaused = station.status === 'paused'
  const isVacant = station.status === 'vacant'
  const isMaintenance = station.status === 'maintenance'

  const elapsed = useElapsedTime(
    session?.startTime || new Date(),
    isActive,
    session?.duration || null
  )

  const rate = Number(station.hourlyRate)
  const currentCost = isActive ? (elapsed / 3600) * rate : Number(session?.totalCost || 0)

  return (
    <div
      className={`bg-[#101010] border p-4 lg:p-5 transition-all ${
        isActive
          ? 'border-[#0024A7] animate-pulse-glow'
          : 'border-[rgba(255,255,255,0.1)] hover:border-[#0024A7]'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] font-mono-tech text-[#8A8A8A] mb-1">{station.name}</div>
          <div className="text-xs font-bold uppercase tracking-wider">
            {isActive && session ? (
              <span className="text-[#0024A7]">{session.userName}</span>
            ) : isPaused ? (
              <span className="text-[#8A8A8A]">PAUSED</span>
            ) : isMaintenance ? (
              <span className="text-[#ff4444]">MAINTENANCE</span>
            ) : (
              <span className="text-[#8A8A8A]">VACANT</span>
            )}
          </div>
        </div>
        <div
          className={`w-0.5 h-10 ${
            isActive
              ? 'bg-[#0024A7]'
              : isPaused
              ? 'bg-[#8A8A8A]'
              : isMaintenance
              ? 'bg-[#ff4444]'
              : 'bg-[rgba(255,255,255,0.05)]'
          }`}
        />
      </div>

      {/* Timer */}
      <div className="mb-4">
        <div
          className={`font-mono-tech text-xl lg:text-2xl font-bold ${
            isActive ? 'text-[#0024A7]' : 'text-[#8A8A8A]'
          }`}
        >
          {isActive || isPaused ? formatTime(elapsed) : '00:00:00'}
        </div>
        <div className="text-[10px] font-mono-tech text-[#8A8A8A] mt-1">
          ${currentCost.toFixed(2)} &bull; ${station.hourlyRate}/hr
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-1">
        {isVacant && (
          <button
            onClick={() => onStart(station.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#0024A7] text-white text-[10px] font-bold hover:bg-[#1A3DFF] transition-colors"
          >
            <Play size={12} />
            START
          </button>
        )}

        {isActive && (
          <>
            <button
              onClick={() => onPause(station.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[rgba(255,255,255,0.1)] text-[#8A8A8A] text-[10px] font-bold hover:border-[#8A8A8A] hover:text-[#F9F9F9] transition-colors"
            >
              <Pause size={12} />
              PAUSE
            </button>
            <button
              onClick={() => onAddAddon(station.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#0024A7] text-[#0024A7] text-[10px] font-bold hover:bg-[#0024A7] hover:text-white transition-colors"
            >
              <ShoppingCart size={12} />
              ORDER
            </button>
            <button
              onClick={() => onEnd(station.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff4444] text-[10px] font-bold hover:bg-[#ff4444]/20 transition-colors"
            >
              <Square size={12} />
              END
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={() => onResume(station.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#0024A7] text-white text-[10px] font-bold hover:bg-[#1A3DFF] transition-colors"
            >
              <Play size={12} />
              RESUME
            </button>
            <button
              onClick={() => onEnd(station.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff4444] text-[10px] font-bold hover:bg-[#ff4444]/20 transition-colors"
            >
              <Square size={12} />
              END
            </button>
          </>
        )}

        {isMaintenance && (
          <div className="flex-1 py-2 text-center text-[10px] font-mono-tech text-[#ff4444]">
            UNDER MAINTENANCE
          </div>
        )}
      </div>
    </div>
  )
}

export default function LiveFloorPage() {
  const utils = trpc.useUtils()
  const { data: stations } = trpc.station.list.useQuery()
  const { data: activeSessions } = trpc.session.getActive.useQuery(undefined, {
    refetchInterval: 5000,
  })

  const [startDialogOpen, setStartDialogOpen] = useState(false)
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [addonDialogOpen, setAddonDialogOpen] = useState(false)
  const [addonQty, setAddonQty] = useState<Record<number, number>>({})

  const { data: inventoryItems } = trpc.inventory.list.useQuery()

  const startMutation = trpc.station.startSession.useMutation({
    onSuccess: () => {
      utils.station.list.invalidate()
      utils.session.getActive.invalidate()
      setStartDialogOpen(false)
      setUserName('')
    },
  })

  const pauseMutation = trpc.station.pauseSession.useMutation({
    onSuccess: () => {
      utils.station.list.invalidate()
      utils.session.getActive.invalidate()
    },
  })

  const resumeMutation = trpc.station.resumeSession.useMutation({
    onSuccess: () => {
      utils.station.list.invalidate()
      utils.session.getActive.invalidate()
    },
  })

  const endMutation = trpc.station.endSession.useMutation({
    onSuccess: () => {
      utils.station.list.invalidate()
      utils.session.getActive.invalidate()
      utils.revenue.today.invalidate()
    },
  })

  const addAddonMutation = trpc.station.addAddon.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate()
      utils.session.getActive.invalidate()
      setAddonDialogOpen(false)
      setAddonQty({})
    },
  })

  const handleStart = useCallback(
    (stationId: number) => {
      setSelectedStationId(stationId)
      setStartDialogOpen(true)
    },
    []
  )

  const handleStartSubmit = () => {
    if (selectedStationId && userName.trim()) {
      startMutation.mutate({ stationId: selectedStationId, userName: userName.trim() })
    }
  }

  const handleAddAddon = useCallback((stationId: number) => {
    setSelectedStationId(stationId)
    setAddonDialogOpen(true)
  }, [])

  const handleAddonSubmit = (itemId: number) => {
    const qty = addonQty[itemId] || 1
    if (selectedStationId) {
      addAddonMutation.mutate({ stationId: selectedStationId, inventoryItemId: itemId, quantity: qty })
    }
  }

  const sessionMap = new Map<number, SessionData>()
  activeSessions?.forEach((s) => {
    if (typeof s.stationId === 'number') {
      sessionMap.set(s.stationId, s as unknown as SessionData)
    }
  })

  return (
    <div className="p-6 lg:p-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
            Live Floor
          </div>
          <div className="text-2xl font-black text-[#F9F9F9] mt-1">
            GAMING STATIONS
          </div>
        </div>
        <div className="text-xs font-mono-tech text-[#8A8A8A]">
          {activeSessions?.length || 0} ACTIVE &bull; {stations?.filter((s) => s.status === 'vacant').length || 0} VACANT
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
        {stations?.map((station) => (
          <StationCard
            key={station.id}
            station={station as unknown as Station}
            session={sessionMap.get(station.id)}
            onStart={handleStart}
            onPause={(id) => pauseMutation.mutate(id)}
            onResume={(id) => resumeMutation.mutate(id)}
            onEnd={(id) => endMutation.mutate(id)}
            onAddAddon={handleAddAddon}
          />
        ))}
      </div>

      {/* Start Session Dialog */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent className="bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Start Session
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Player Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-3 text-sm focus:border-[#0024A7] focus:outline-none transition-colors"
                placeholder="Enter player name"
                onKeyDown={(e) => e.key === 'Enter' && handleStartSubmit()}
              />
            </div>
            <button
              onClick={handleStartSubmit}
              disabled={!userName.trim() || startMutation.isPending}
              className="w-full py-3 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors disabled:opacity-50"
            >
              {startMutation.isPending ? 'STARTING...' : 'START SESSION'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Addon Dialog */}
      <Dialog open={addonDialogOpen} onOpenChange={setAddonDialogOpen}>
        <DialogContent className="bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] max-w-md max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart size={14} />
              ADD ORDER
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {inventoryItems?.map((item) => {
              const qty = addonQty[item.id] || 1
              const isLowStock = item.stock <= item.lowStockThreshold

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-[#050505] border border-[rgba(255,255,255,0.05)]"
                >
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#F9F9F9]">{item.name}</div>
                    <div className="text-[10px] font-mono-tech text-[#8A8A8A]">
                      ${item.price} &bull; {item.stock} in stock
                      {isLowStock && (
                        <span className="text-[#ff4444] ml-2">LOW STOCK</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setAddonQty((prev) => ({
                          ...prev,
                          [item.id]: Math.max(1, (prev[item.id] || 1) - 1),
                        }))
                      }
                      className="w-7 h-7 flex items-center justify-center border border-[rgba(255,255,255,0.1)] text-[#8A8A8A] hover:text-[#F9F9F9] hover:border-[#0024A7] transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-mono-tech w-6 text-center">{qty}</span>
                    <button
                      onClick={() =>
                        setAddonQty((prev) => ({
                          ...prev,
                          [item.id]: Math.min(item.stock, (prev[item.id] || 1) + 1),
                        }))
                      }
                      className="w-7 h-7 flex items-center justify-center border border-[rgba(255,255,255,0.1)] text-[#8A8A8A] hover:text-[#F9F9F9] hover:border-[#0024A7] transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddonSubmit(item.id)}
                    disabled={item.stock < qty || addAddonMutation.isPending}
                    className="px-3 py-1.5 bg-[#0024A7] text-white text-[10px] font-bold hover:bg-[#1A3DFF] transition-colors disabled:opacity-50"
                  >
                    ADD
                  </button>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
