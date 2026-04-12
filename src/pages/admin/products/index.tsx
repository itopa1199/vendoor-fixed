import React, { useEffect, useState } from 'react'
import { Card, Btn, StatusBadge, SearchBar, Select, Modal, DR, Badge, useToast, Empty } from '@/components/admin/ui'
import { adminModeration } from '@/lib/admin-api'
import { adminDashboard } from '@/lib/admin-api'
import { ngnKobo } from '@/lib/utils'
import { Package } from 'lucide-react'

export default function ProductsPage() {
  const toast = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [q, setQ]               = useState('')
  const [viewId,   setViewId]   = useState<string | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [acting,   setActing]   = useState(false)

  const load = () => {
    setLoading(true)
    // Products come from stats or a dedicated endpoint — use get_stats_overview and extract
    // Also try fetching via orders data or a general list
    adminDashboard.getStats()
      .then(r => {
        console.log('[Products] stats response:', r)
        // If API returns products in stats, use them
        // Otherwise show empty state until a dedicated endpoint is available
        const list = Array.isArray(r.data?.products) ? r.data.products :
                     Array.isArray(r.products)        ? r.products : []
        setProducts(list)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const norm = (p: any) => ({
    uuid:     p.product_uuid ?? p.uuid ?? p.id ?? '',
    name:     p.name ?? p.title ?? p.product_name ?? '—',
    vendor:   p.vendor_name ?? p.store_name ?? '—',
    category: p.category ?? p.category_name ?? '—',
    price:    Number(p.price ?? p.amount ?? 0),
    stock:    Number(p.stock ?? p.quantity ?? 0),
    sales:    Number(p.sales_count ?? p.total_sales ?? p.sales ?? 0),
    active:   p.is_active ?? p.active ?? (p.status === 'active'),
    raw: p,
  })

  const list = products.map(norm).filter(p =>
    (p.name + p.vendor + p.category).toLowerCase().includes(q.toLowerCase())
  )

  const viewing  = viewId   ? list.find(p => p.uuid === viewId)   : null
  const removing = removeId ? list.find(p => p.uuid === removeId) : null

  async function doDelete(uuid: string) {
    setActing(true)
    try {
      const r = await adminModeration.deleteProduct(uuid)
      toast(r.status ? '🗑️ Product removed.' : `❌ ${r.message}`)
      if (r.status) { setRemoveId(null); load() }
    } catch { toast('❌ Failed to remove product') } finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Products</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{products.length} products loaded.</p>
        </div>
        <Btn v="outline" size="sm" onClick={load}>Refresh</Btn>
      </div>

      <SearchBar placeholder="Search products…" value={q} onChange={setQ} />

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Product</th><th>Vendor</th><th>Category</th><th>Price</th><th>Stock</th><th>Sales</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-[#6B6A62]">Loading…</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={8} className="py-10"><Empty icon={<Package size={18} />} title="No products found" sub="Products will appear here once loaded from the API" /></td></tr>
              ) : list.map(p => (
                <tr key={p.uuid}>
                  <td className="font-semibold max-w-[180px] truncate">{p.name}</td>
                  <td className="text-[11px] text-[#6B6A62]">{p.vendor}</td>
                  <td><Badge v="dim">{p.category}</Badge></td>
                  <td className="font-bold text-[#0A6E3F]">{ngnKobo(p.price)}</td>
                  <td className={`text-center font-semibold ${p.stock < 10 ? 'text-[#DC2626]' : ''}`}>{p.stock}</td>
                  <td className="text-center">{p.sales}</td>
                  <td><StatusBadge status={p.active ? 'active' : 'flagged'} /></td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      <Btn v="outline" size="sm" onClick={() => setViewId(p.uuid)}>View</Btn>
                      <Btn v="red"     size="sm" onClick={() => setRemoveId(p.uuid)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewId(null)} title="Product Details"
        footer={<Btn v="green" size="lg" onClick={() => setViewId(null)}>Close</Btn>}>
        {viewing && <>
          <DR label="Name"     value={viewing.name} />
          <DR label="Vendor"   value={viewing.vendor} />
          <DR label="Category" value={viewing.category} />
          <DR label="Price"    value={<span className="text-[#0A6E3F]">{ngnKobo(viewing.price)}</span>} />
          <DR label="Stock"    value={`${viewing.stock} units`} />
          <DR label="Sales"    value={`${viewing.sales} sold`} />
          <DR label="Status"   value={<StatusBadge status={viewing.active ? 'active' : 'flagged'} />} />
          {import.meta.env.DEV && (
            <details className="mt-3"><summary className="text-[10px] text-[#A8A79F] cursor-pointer">Raw fields (dev)</summary>
              <pre className="text-[9px] bg-[#F5F4F0] p-2 rounded mt-1 overflow-auto max-h-[200px]">{JSON.stringify(viewing.raw, null, 2)}</pre>
            </details>
          )}
        </>}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!removing} onClose={() => setRemoveId(null)} title="Delete Product"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setRemoveId(null)}>Cancel</Btn>
          <Btn v="red" size="lg" onClick={() => doDelete(removing!.uuid)} disabled={acting}>
            {acting ? 'Deleting…' : 'Delete Permanently'}
          </Btn>
        </>}>
        {removing && <p className="text-[13px]">Permanently delete <strong>{removing.name}</strong>? This cannot be undone.</p>}
      </Modal>
    </div>
  )
}
