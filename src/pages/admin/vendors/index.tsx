import React, { useEffect, useState } from 'react'
import { Card, Btn, StatusBadge, SearchBar, Select, Modal, DR, Badge, Field, SelectField, useToast } from '@/components/admin/ui'
import { adminVendors } from '@/lib/admin-api'
import { ngnKobo } from '@/lib/utils'

export default function VendorsPage() {
  const toast = useToast()
  const [vendors,  setVendors]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [q, setQ]               = useState('')
  const [statusF,  setStatusF]  = useState('')
  const [viewId,   setViewId]   = useState<string | null>(null)
  const [suspId,   setSuspId]   = useState<string | null>(null)
  const [acting,   setActing]   = useState(false)

  const load = () => {
    setLoading(true)
    adminVendors.listPending()
      .then(r => {
        console.log('[Vendors] raw:', r)
        const list = Array.isArray(r.data) ? r.data : Array.isArray(r.vendors) ? r.vendors : Array.isArray(r) ? r : []
        setVendors(list)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const norm = (v: any) => ({
    uuid:     v.vendor_uuid  ?? v.uuid   ?? v.id ?? '',
    store:    v.store_name   ?? v.biz    ?? '—',
    owner:    v.owner_name   ?? v.name   ?? '—',
    email:    v.email        ?? v.owner_email ?? '—',
    phone:    v.phone        ?? '—',
    category: v.category     ?? v.cat   ?? '—',
    status:   v.status       ?? v.verification_status ?? 'pending',
    rating:   Number(v.rating ?? 0),
    revenue:  Number(v.revenue ?? v.total_revenue ?? 0),
    products: v.product_count ?? v.products ?? 0,
    orders:   v.order_count  ?? v.orders   ?? 0,
    joined:   (v.created_at  ?? v.date_joined ?? '').slice(0, 10),
    spotlight: v.spotlight_active ?? v.is_spotlight ?? false,
    raw: v,
  })

  const list = vendors.map(norm).filter(v =>
    (v.store + v.owner + v.category).toLowerCase().includes(q.toLowerCase()) &&
    (!statusF || v.status === statusF)
  )

  const viewing   = viewId ? list.find(v => v.uuid === viewId) : null
  const suspending = suspId ? list.find(v => v.uuid === suspId) : null

  async function doApprove(uuid: string) {
    setActing(true)
    try {
      const r = await adminVendors.approve(uuid)
      toast(r.status ? '✅ Vendor approved!' : `❌ ${r.message}`)
      if (r.status) load()
    } catch { toast('❌ Failed') } finally { setActing(false) }
  }

  async function doReject(uuid: string) {
    setActing(true)
    try {
      const r = await adminVendors.reject(uuid, 'Admin action')
      toast(r.status ? '✅ Done.' : `❌ ${r.message}`)
      if (r.status) { setSuspId(null); load() }
    } catch { toast('❌ Failed') } finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Vendors</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{vendors.length} vendors on the platform.</p>
        </div>
        <Btn v="outline" size="sm" onClick={load}>Refresh</Btn>
      </div>

      <div className="flex gap-2 flex-wrap">
        <SearchBar placeholder="Search vendors…" value={q} onChange={setQ} />
        <Select value={statusF} onChange={setStatusF} options={[
          { label: 'All Status',  value: '' },
          { label: 'Active',      value: 'active' },
          { label: 'Pending',     value: 'pending' },
          { label: 'Suspended',   value: 'suspended' },
          { label: 'Banned',      value: 'banned' },
        ]} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Vendor</th><th>Owner</th><th>Category</th><th>Products</th><th>Orders</th><th>Revenue</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-[#6B6A62]">Loading…</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-[#6B6A62]">No vendors found</td></tr>
              ) : list.map(v => (
                <tr key={v.uuid}>
                  <td>
                    <div className="font-bold">{v.store}</div>
                    <div className="text-[10px] text-[#6B6A62]">{v.joined}</div>
                  </td>
                  <td>{v.owner}</td>
                  <td><Badge v="dim">{v.category}</Badge></td>
                  <td className="text-center">{v.products}</td>
                  <td className="text-center">{v.orders}</td>
                  <td className="font-bold text-[#0A6E3F]">{v.revenue > 0 ? ngnKobo(v.revenue) : '—'}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      <Btn v="outline" size="sm" onClick={() => setViewId(v.uuid)}>View</Btn>
                      {v.status === 'pending' && (
                        <Btn v="green" size="sm" onClick={() => doApprove(v.uuid)} disabled={acting}>✓ Approve</Btn>
                      )}
                      {v.status === 'active' && (
                        <Btn v="orange" size="sm" onClick={() => setSuspId(v.uuid)}>Suspend</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewId(null)} title={`Vendor — ${viewing?.store}`}
        footer={<Btn v="green" size="lg" onClick={() => setViewId(null)}>Close</Btn>}>
        {viewing && <>
          <DR label="Store"    value={viewing.store} />
          <DR label="Owner"    value={viewing.owner} />
          <DR label="Email"    value={viewing.email} />
          <DR label="Phone"    value={viewing.phone} />
          <DR label="Category" value={viewing.category} />
          <DR label="Status"   value={<StatusBadge status={viewing.status} />} />
          <DR label="Revenue"  value={<span className="text-[#0A6E3F]">{viewing.revenue > 0 ? ngnKobo(viewing.revenue) : '—'}</span>} />
          <DR label="Joined"   value={viewing.joined} />
          {import.meta.env.DEV && (
            <details className="mt-3"><summary className="text-[10px] text-[#A8A79F] cursor-pointer">Raw fields (dev)</summary>
              <pre className="text-[9px] bg-[#F5F4F0] p-2 rounded mt-1 overflow-auto max-h-[200px]">{JSON.stringify(viewing.raw, null, 2)}</pre>
            </details>
          )}
        </>}
      </Modal>

      {/* Suspend/Reject Modal */}
      <Modal open={!!suspending} onClose={() => setSuspId(null)} title="Suspend Vendor"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setSuspId(null)}>Cancel</Btn>
          <Btn v="orange"  size="lg" onClick={() => doReject(suspending!.uuid)} disabled={acting}>Confirm Suspend</Btn>
        </>}>
        {suspending && (
          <p className="text-[13px]">Suspend <strong>{suspending.store}</strong>? Their products will be hidden from buyers.</p>
        )}
      </Modal>
    </div>
  )
}
