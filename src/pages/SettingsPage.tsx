import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function SettingsPage() {
  const { isAdmin, user } = useAuth()
  const utils = trpc.useUtils()
  const { data: stations } = trpc.station.list.useQuery()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editStation, setEditStation] = useState<{
    id: number
    name: string
    type: string
    hourlyRate: string
  } | null>(null)
  const [newStation, setNewStation] = useState({
    name: '',
    type: 'pc' as 'pc' | 'ps5' | 'xbox' | 'vr',
    hourlyRate: '30',
  })

  const createMutation = trpc.station.create.useMutation({
    onSuccess: () => {
      utils.station.list.invalidate()
      setCreateDialogOpen(false)
      setNewStation({ name: '', type: 'pc', hourlyRate: '30' })
    },
  })

  const updateMutation = trpc.station.update.useMutation({
    onSuccess: () => {
      utils.station.list.invalidate()
      setEditDialogOpen(false)
      setEditStation(null)
    },
  })

  const deleteMutation = trpc.station.delete.useMutation({
    onSuccess: () => utils.station.list.invalidate(),
  })

  const updateStatusMutation = trpc.station.update.useMutation({
    onSuccess: () => utils.station.list.invalidate(),
  })

  return (
    <div className="p-6 lg:p-12">
      <div className="mb-8">
        <div className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
          Settings
        </div>
        <div className="text-2xl font-black text-[#F9F9F9] mt-1">
          SYSTEM CONFIGURATION
        </div>
      </div>

      {/* User Info */}
      <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-6 mb-6">
        <div className="text-xs font-bold text-[#F9F9F9] uppercase mb-4">
          Account Information
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-1">Name</div>
            <div className="text-sm font-mono-tech text-[#F9F9F9]">{user?.name || 'N/A'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-1">Role</div>
            <div className="text-sm font-mono-tech text-[#F9F9F9] uppercase">
              <span className={`px-2 py-0.5 text-[10px] font-bold ${
                user?.role === 'admin' ? 'bg-[#0024A7]/20 text-[#0024A7]' : 'bg-[rgba(255,255,255,0.05)] text-[#8A8A8A]'
              }`}>
                {user?.role || 'user'}
              </span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-1">Auth Type</div>
            <div className="text-sm font-mono-tech text-[#F9F9F9] uppercase">
              {user?.authType || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-1">Email</div>
            <div className="text-sm font-mono-tech text-[#F9F9F9]">
              {user?.email || 'Not set'}
            </div>
          </div>
        </div>
      </div>

      {/* Station Management */}
      <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold text-[#F9F9F9] uppercase">
            Station Management
          </div>
          {isAdmin && (
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors"
            >
              <Plus size={12} />
              ADD STATION
            </button>
          )}
        </div>

        {!isAdmin && (
          <div className="flex items-start gap-3 p-4 mb-4 border border-[#8A8A8A]/30 bg-[#8A8A8A]/5">
            <AlertTriangle size={16} className="text-[#8A8A8A] mt-0.5 shrink-0" />
            <div className="text-xs text-[#8A8A8A]">
              Station management requires admin privileges.
            </div>
          </div>
        )}

        <div className="border border-[rgba(255,255,255,0.1)]">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#050505] border-b border-[rgba(255,255,255,0.1)] text-[10px] font-bold text-[#8A8A8A] uppercase">
            <div className="col-span-2">ID</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Rate</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>

          {stations?.map((station) => (
            <div
              key={station.id}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.05)] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              <div className="col-span-2 text-xs font-mono-tech text-[#8A8A8A]">
                #{station.id}
              </div>
              <div className="col-span-2 text-xs font-bold text-[#F9F9F9]">
                {station.name}
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-mono-tech text-[#8A8A8A] uppercase bg-[rgba(255,255,255,0.05)] px-2 py-0.5">
                  {station.type}
                </span>
              </div>
              <div className="col-span-2 text-xs font-mono-tech text-[#F9F9F9]">
                ${station.hourlyRate}/hr
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => {
                    if (!isAdmin) return
                    const nextStatus = station.status === 'maintenance' ? 'vacant' : 'maintenance'
                    updateStatusMutation.mutate({ id: station.id, status: nextStatus as 'vacant' | 'active' | 'paused' | 'maintenance' })
                  }}
                  disabled={!isAdmin || station.status === 'active' || station.status === 'paused'}
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 transition-colors ${
                    station.status === 'active'
                      ? 'bg-[#0024A7]/20 text-[#0024A7]'
                      : station.status === 'paused'
                      ? 'bg-[#8A8A8A]/20 text-[#8A8A8A]'
                      : station.status === 'maintenance'
                      ? 'bg-[#ff4444]/20 text-[#ff4444]'
                      : 'bg-[rgba(255,255,255,0.05)] text-[#8A8A8A]'
                  } ${!isAdmin ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                >
                  {station.status}
                </button>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setEditStation({
                          id: station.id,
                          name: station.name,
                          type: station.type,
                          hourlyRate: station.hourlyRate,
                        })
                        setEditDialogOpen(true)
                      }}
                      className="p-1.5 text-[#8A8A8A] hover:text-[#F9F9F9] transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${station.name}?`)) {
                          deleteMutation.mutate(station.id)
                        }
                      }}
                      className="p-1.5 text-[#8A8A8A] hover:text-[#ff4444] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Station Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Add New Station
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Station Name
              </label>
              <input
                type="text"
                value={newStation.name}
                onChange={(e) => setNewStation((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
                placeholder="e.g., PC-05"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Type
              </label>
              <select
                value={newStation.type}
                onChange={(e) => setNewStation((p) => ({ ...p, type: e.target.value as 'pc' | 'ps5' | 'xbox' | 'vr' }))}
                className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
              >
                <option value="pc">PC</option>
                <option value="ps5">PS5</option>
                <option value="xbox">Xbox</option>
                <option value="vr">VR</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newStation.hourlyRate}
                onChange={(e) => setNewStation((p) => ({ ...p, hourlyRate: e.target.value }))}
                className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                if (newStation.name && newStation.hourlyRate) {
                  createMutation.mutate({
                    name: newStation.name,
                    type: newStation.type,
                    hourlyRate: parseFloat(newStation.hourlyRate),
                  })
                }
              }}
              disabled={!newStation.name || !newStation.hourlyRate || createMutation.isPending}
              className="w-full py-3 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'ADDING...' : 'ADD STATION'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Station Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Edit Station
            </DialogTitle>
          </DialogHeader>
          {editStation && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                  Station Name
                </label>
                <input
                  type="text"
                  value={editStation.name}
                  onChange={(e) => setEditStation((p) => (p ? { ...p, name: e.target.value } : null))}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editStation.hourlyRate}
                  onChange={(e) => setEditStation((p) => (p ? { ...p, hourlyRate: e.target.value } : null))}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (editStation) {
                    updateMutation.mutate({
                      id: editStation.id,
                      name: editStation.name,
                      hourlyRate: parseFloat(editStation.hourlyRate),
                    })
                  }
                }}
                disabled={updateMutation.isPending}
                className="w-full py-3 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
