import React, { useState } from 'react'
import {
  Card, Btn, StatusBadge, SearchBar, Select,
  Modal, DR, Badge, Toggle, useToast, Empty,
} from '@/components/admin/ui'
import { useAdminStore } from '@/store/admin'
import { ngnKobo } from '@/lib/mock-data'

export default function ProductsPage() {
  const { products, flagProduct, unflagProduct, removeProduct, toggleFeatured } = useAdminStore()
  const toast = useToast()

  const [q, setQ]            = useState('')
  const [statusF, setStatusF] = useState('')
  const [catF, setCatF]      = useState('')
  const [viewId, setViewId]  = useState<string | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)

  const filtered = products.filter(p => {
    const txt = (p.title + p.vendor_name + p.category_name).toLowerCase()
    const sMatch = !statusF || (statusF === 'active' ? p.is_active : !p.is_active)
    const cMatch = !catF    || p.category_name === catF
    return txt.includes(q.toLowerCase()) && sMatch && cMatch
  })

  const viewing  = viewId   ? products.find(p => p.id === viewId)   : null
  const removing = removeId ? products.find(p => p.id === removeId) : null
  const cats = [...new Set(products.map(p => p.category_name).filter(Boolean))]
  const flaggedCount = products.filter(p => !p.is_active).length

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Products</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">
            {products.length} total · {flaggedCount > 0 && <span className="text-[#DC2626]">{flaggedCount} flagged</span>}
          </p>
        </div>
        <Btn v="outline" size="sm">⬇️ Export</Btn>
      </div>

      <div className="flex gap-2 flex-wrap">
        <SearchBar placeholder="Search products…" value={q} onChange={setQ} />
        <Select value={statusF} onChange={setStatusF} options={[
          { label: 'All Status',  value: ''       },
          { label: 'Active',      value: 'active' },
          { label: 'Flagged',     value: 'flagged'},
        ]} />
        <Select value={catF} onChange={setCatF} options={[
          { label: 'All Categories', value: '' },
          ...cats.map(c => ({ label: c!, value: c! })),
        ]} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Vendor</th><th>Category</th><th>Price</th>
                <th>Stock</th><th>Sales</th><th>Featured</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="font-semibold max-w-[180px] truncate">{p.title}</td>
                  <td className="text-[11px] text-[#6B6A62]">{p.vendor_name}</td>
                  <td><Badge v="dim">{p.category_name}</Badge></td>
                  <td className="font-bold text-[#0A6E3F]">{ngnKobo(p.price)}</td>
                  <td className={`text-center font-semibold ${p.stock < 10 ? 'text-[#DC2626]' : ''}`}>
                    {p.stock}
                  </td>
                  <td className="text-center">{p.sales_count}</td>
                  <td className="text-center">
                    <Toggle on={p.is_featured} onChange={() => {
                      toggleFeatured(p.id)
                      toast(p.is_featured ? '✓ Feature removed' : '⭐ Product featured!')
                    }} />
                  </td>
                  <td><StatusBadge status={p.is_active ? 'active' : 'flagged'} /></td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      <Btn v="outline" size="sm" onClick={() => setViewId(p.id)}>👁</Btn>
                      {p.is_active
                        ? <Btn v="red" size="sm" onClick={() => { flagProduct(p.id); toast('🚩 Product flagged.') }}>🚩 Flag</Btn>
                        : <Btn v="green" size="sm" onClick={() => { unflagProduct(p.id); toast('✅ Product restored.') }}>✓ Restore</Btn>
                      }
                      <Btn v="red" size="sm" onClick={() => setRemoveId(p.id)}>🗑️</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="py-10">
                  <Empty icon="📦" title="No products found" />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewId(null)} title="Product Details"
        footer={<Btn v="green" size="lg" onClick={() => setViewId(null)}>Close</Btn>}>
        {viewing && <>
          <DR label="Name"        value={viewing.title} />
          <DR label="Vendor"      value={viewing.vendor_name ?? '—'} />
          <DR label="Category"    value={viewing.category_name ?? '—'} />
          <DR label="Price"       value={<span className="text-[#0A6E3F]">{ngnKobo(viewing.price)}</span>} />
          <DR label="Compare Price" value={viewing.compare_price ? ngnKobo(viewing.compare_price) : '—'} />
          <DR label="Discount"    value={viewing.discount_percentage > 0 ? `${viewing.discount_percentage}%` : 'None'} />
          <DR label="Stock"       value={`${viewing.stock} units`} />
          <DR label="Sales"       value={`${viewing.sales_count} sold`} />
          <DR label="Featured"    value={viewing.is_featured ? '⭐ Yes' : 'No'} />
          <DR label="Status"      value={<StatusBadge status={viewing.is_active ? 'active' : 'flagged'} />} />
          <DR label="SKU"         value={viewing.sku ?? '—'} />
          <DR label="Tags"        value={viewing.tags.length ? viewing.tags.join(', ') : '—'} />
          {viewing.description && (
            <div className="mt-3 pt-3 border-t border-[#E2E0DA]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B6A62] mb-1">Description</div>
              <p className="text-[12px] leading-relaxed">{viewing.description}</p>
            </div>
          )}
        </>}
      </Modal>

      {/* Remove Modal */}
      <Modal open={!!removing} onClose={() => setRemoveId(null)} title="Remove Product"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setRemoveId(null)}>Cancel</Btn>
          <Btn v="red" size="lg" onClick={() => {
            removeProduct(removing!.id); setRemoveId(null); toast('🗑️ Product removed.')
          }}>🗑️ Remove Permanently</Btn>
        </>}>
        {removing && (
          <p className="text-[13px]">
            Are you sure you want to permanently remove <strong>{removing.title}</strong>?
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  )
}
