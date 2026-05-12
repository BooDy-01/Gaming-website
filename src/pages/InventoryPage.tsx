import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  Package,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  Search,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function InventoryPage() {
  const { isAdmin } = useAuth()
  const utils = trpc.useUtils()
  const { data: items, isLoading } = trpc.inventory.list.useQuery()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<{
    id: number
    name: string
    category: string
    price: string
    lowStockThreshold: number
  } | null>(null)
  const [newItem, setNewItem] = useState<{
    name: string
    category: 'snack' | 'drink' | 'other'
    price: string
    stock: number
    lowStockThreshold: number
  }>({
    name: '',
    category: 'snack',
    price: '',
    stock: 0,
    lowStockThreshold: 5,
  })
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)
  const [restockItem, setRestockItem] = useState<{ id: number; name: string } | null>(null)
  const [restockQty, setRestockQty] = useState(10)

  const createMutation = trpc.inventory.create.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate()
      setCreateDialogOpen(false)
      setNewItem({ name: '', category: 'snack', price: '', stock: 0, lowStockThreshold: 5 })
    },
  })

  const updateMutation = trpc.inventory.update.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate()
      setEditDialogOpen(false)
      setEditItem(null)
    },
  })

  const deleteMutation = trpc.inventory.delete.useMutation({
    onSuccess: () => utils.inventory.list.invalidate(),
  })

  const restockMutation = trpc.inventory.restock.useMutation({
    onSuccess: () => {
      utils.inventory.list.invalidate()
      setRestockDialogOpen(false)
      setRestockQty(10)
    },
  })

  const filteredItems = items?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockItems = items?.filter((item) => item.stock <= item.lowStockThreshold) || []

  if (isLoading) {
    return (
      <div className="p-6 lg:p-12">
        <div className="text-[#8A8A8A] font-mono-tech text-sm animate-pulse">LOADING INVENTORY...</div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
            Inventory
          </div>
          <div className="text-2xl font-black text-[#F9F9F9] mt-1">
            SNACKS & DRINKS
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] pl-9 pr-4 py-2 text-xs focus:border-[#0024A7] focus:outline-none transition-colors w-48"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-3 py-2 text-xs focus:border-[#0024A7] focus:outline-none"
          >
            <option value="all">All</option>
            <option value="snack">Snacks</option>
            <option value="drink">Drinks</option>
            <option value="other">Other</option>
          </select>

          {isAdmin && (
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors"
            >
              <Plus size={12} />
              ADD ITEM
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 border border-[#ff4444]/30 bg-[#ff4444]/5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-[#ff4444] mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-[#ff4444] uppercase">
              LOW STOCK ALERT
            </div>
            <div className="text-[10px] font-mono-tech text-[#8A8A8A] mt-1">
              {lowStockItems.map((item) => `${item.name} (${item.stock})`).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-8">
        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-4">
          <div className="text-[10px] font-bold text-[#8A8A8A] uppercase">Total Items</div>
          <div className="text-2xl font-black text-[#F9F9F9] mt-1">{items?.length || 0}.</div>
        </div>
        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-4">
          <div className="text-[10px] font-bold text-[#8A8A8A] uppercase">Low Stock</div>
          <div className="text-2xl font-black text-[#ff4444] mt-1">{lowStockItems.length}.</div>
        </div>
        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-4">
          <div className="text-[10px] font-bold text-[#8A8A8A] uppercase">Snacks</div>
          <div className="text-2xl font-black text-[#F9F9F9] mt-1">
            {items?.filter((i) => i.category === 'snack').length || 0}.
          </div>
        </div>
        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-4">
          <div className="text-[10px] font-bold text-[#8A8A8A] uppercase">Drinks</div>
          <div className="text-2xl font-black text-[#F9F9F9] mt-1">
            {items?.filter((i) => i.category === 'drink').length || 0}.
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-[rgba(255,255,255,0.1)]">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#101010] border-b border-[rgba(255,255,255,0.1)] text-[10px] font-bold text-[#8A8A8A] uppercase">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Stock</div>
          <div className="col-span-3">Actions</div>
        </div>

        {/* Table Rows */}
        {filteredItems?.map((item) => {
          const isLow = item.stock <= item.lowStockThreshold

          return (
            <div
              key={item.id}
              className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.05)] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors ${
                isLow ? 'bg-[#ff4444]/5' : ''
              }`}
            >
              <div className="col-span-3">
                <div className="text-xs font-bold text-[#F9F9F9]">{item.name}</div>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-mono-tech text-[#8A8A8A] uppercase bg-[rgba(255,255,255,0.05)] px-2 py-0.5">
                  {item.category}
                </span>
              </div>
              <div className="col-span-2 text-xs font-mono-tech text-[#F9F9F9]">
                ${item.price}
              </div>
              <div className="col-span-2">
                <span
                  className={`text-xs font-mono-tech ${isLow ? 'text-[#ff4444]' : 'text-[#F9F9F9]'}`}
                >
                  {item.stock}
                  {isLow && (
                    <AlertTriangle size={10} className="inline ml-1 text-[#ff4444]" />
                  )}
                </span>
              </div>
              <div className="col-span-3 flex items-center gap-1">
                <button
                  onClick={() => {
                    setRestockItem({ id: item.id, name: item.name })
                    setRestockDialogOpen(true)
                  }}
                  className="flex items-center gap-1 px-2 py-1 border border-[#0024A7] text-[#0024A7] text-[10px] font-bold hover:bg-[#0024A7] hover:text-white transition-colors"
                  title="Restock"
                >
                  <Plus size={10} />
                  RESTOCK
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setEditItem({
                          id: item.id,
                          name: item.name,
                          category: item.category,
                          price: item.price,
                          lowStockThreshold: item.lowStockThreshold,
                        })
                        setEditDialogOpen(true)
                      }}
                      className="p-1.5 text-[#8A8A8A] hover:text-[#F9F9F9] transition-colors"
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${item.name}?`)) {
                          deleteMutation.mutate(item.id)
                        }
                      }}
                      className="p-1.5 text-[#8A8A8A] hover:text-[#ff4444] transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}

        {filteredItems?.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-[#8A8A8A]">
            <Package size={24} className="mx-auto mb-2 opacity-30" />
            No items found
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Add New Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Name
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Category
              </label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value as 'snack' | 'drink' | 'other' }))}
                className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
              >
                <option value="snack">Snack</option>
                <option value="drink">Drink</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                  Initial Stock
                </label>
                <input
                  type="number"
                  value={newItem.stock}
                  onChange={(e) => setNewItem((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={newItem.lowStockThreshold}
                  onChange={(e) => setNewItem((p) => ({ ...p, lowStockThreshold: parseInt(e.target.value) || 5 }))}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => {
                if (newItem.name && newItem.price) {
                  createMutation.mutate({
                    name: newItem.name,
                    category: newItem.category,
                    price: parseFloat(newItem.price),
                    stock: newItem.stock,
                    lowStockThreshold: newItem.lowStockThreshold,
                  })
                }
              }}
              disabled={!newItem.name || !newItem.price || createMutation.isPending}
              className="w-full py-3 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'ADDING...' : 'ADD ITEM'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Edit Item
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                  Name
                </label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => setEditItem((p) => (p ? { ...p, name: e.target.value } : null))}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                  Category
                </label>
                <select
                  value={editItem.category}
                  onChange={(e) => setEditItem((p) => (p ? { ...p, category: e.target.value } : null))}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
                >
                  <option value="snack">Snack</option>
                  <option value="drink">Drink</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.price}
                  onChange={(e) => setEditItem((p) => (p ? { ...p, price: e.target.value } : null))}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={editItem.lowStockThreshold}
                  onChange={(e) => setEditItem((p) => (p ? { ...p, lowStockThreshold: parseInt(e.target.value) || 5 } : null))}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (editItem) {
                    updateMutation.mutate({
                      id: editItem.id,
                      name: editItem.name,
                      category: editItem.category as 'snack' | 'drink' | 'other',
                      price: parseFloat(editItem.price),
                      lowStockThreshold: editItem.lowStockThreshold,
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

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent className="bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">
              Restock {restockItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                Quantity to Add
              </label>
              <input
                type="number"
                value={restockQty}
                onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                min={1}
                className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-2 text-sm focus:border-[#0024A7] focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                if (restockItem && restockQty > 0) {
                  restockMutation.mutate({
                    id: restockItem.id,
                    quantity: restockQty,
                  })
                }
              }}
              disabled={restockQty <= 0 || restockMutation.isPending}
              className="w-full py-3 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors disabled:opacity-50"
            >
              {restockMutation.isPending ? 'RESTOCKING...' : 'RESTOCK'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
