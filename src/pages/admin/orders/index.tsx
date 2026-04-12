import React, { useEffect, useState } from 'react'
import { Card, StatCard, Btn, StatusBadge, SearchBar, Select, Modal, DR, useToast, Empty } from '@/components/admin/ui'
import { adminOrders } from '@/lib/admin-api'
import { ngnKobo } from '@/lib/mock-data'
import { ShoppingCart, Truck, Package, CheckCircle, XCircle } from 'lucide-react'

const STATUS_OPTIONS = [
  { label: 'All Status',        value: ''                },
  { label: 'Paid',              value: 'paid'            },
  { label: 'Confirmed',         value: 'confirmed'       },
  { label: 'Preparing',         value: 'preparing'       },
  { label: 'Shipped',           value: 'shipped'         },
  { label: 'Out for Delivery',  value: 'out_for_delivery'},
  { label: 'Delivered',         value: 'delivered'       },
  { label: 'Cancelled',         value: 'cancelled'       },
]

export default function OrdersPage() {
  const toast = useToast()
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ]             = useState('')
  const [statusF, setStatusF] = useState('')
  const [viewId,  setViewId]  = useState<string | null>(null)
  const [acting,  setActing]  = useState(false)

  const load = () => {
    setLoading(true)
    adminOrders.list({ status: statusF, search: q })
      .then(r => {
        console.log('[Orders] raw response:', r)
        const list =
          Array.isArray(r.data)          ? r.data :
          Array.isArray(r.orders)        ? r.orders :
          Array.isArray(r.data?.orders)  ? r.data.orders :
          Array.isArray(r)               ? r : []
        setOrders(list)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusF])

  const viewing = viewId ? orders.find(o => o.order_uuid === viewId || o.uuid === viewId) : null

  async function updateStatus(uuid: string, status: string) {
    setActing(true)
    try {
      const r = await adminOrders.updateStatus(uuid, status)
      toast(r.status ? `✅ Order updated to ${status}` : `❌ ${r.message}`)
      if (r.status) load()
    } catch { toast('❌ Failed to update order') }
    finally { setActing(false) }
  }

  async function exportCSV() {
    try { await adminOrders.exportCSV(); toast('✅ CSV downloaded') }
    catch { toast('❌ Export failed') }
  }

  const counts: Record<string, number> = {}
  orders.forEach(o => { const s = o.status ?? ''; counts[s] = (counts[s] || 0) + 1 })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Orders</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{orders.length} orders loaded.</p>
        </div>
        <Btn v="outline" size="sm" onClick={exportCSV}>Export CSV</Btn>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={<ShoppingCart size={18} />} value={String(counts.paid ?? 0)}           label="Paid"            accent="blue"  />
        <StatCard icon={<Package size={18} />}      value={String(counts.preparing ?? 0)}      label="Preparing"       accent="gold"  />
        <StatCard icon={<Truck size={18} />}        value={String(counts.out_for_delivery ?? 0)} label="Out for Delivery" accent="blue" />
        <StatCard icon={<CheckCircle size={18} />}  value={String(counts.delivered ?? 0)}      label="Delivered"       accent="green" />
        <StatCard icon={<XCircle size={18} />}      value={String(counts.cancelled ?? 0)}      label="Cancelled"       accent="red"   />
      </div>

      <div className="flex gap-2 flex-wrap">
        <SearchBar placeholder="Search orders…" value={q} onChange={v => { setQ(v) }} />
        <Btn v="outline" size="sm" onClick={load}>Search</Btn>
        <Select value={statusF} onChange={setStatusF} options={STATUS_OPTIONS} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#6B6A62]">Loading…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="py-10"><Empty icon={<ShoppingCart size={18} />} title="No orders found" /></td></tr>
              ) : orders.map((o: any) => {
                const uuid = o.order_uuid ?? o.uuid
                return (
                  <tr key={uuid}>
                    <td className="font-mono font-bold text-[11px] text-[#2563EB]">{o.reference ?? o.order_reference ?? uuid?.slice(0,10)}</td>
                    <td>{o.customer_name ?? o.user_name ?? o.buyer_name ?? 'Guest'}</td>
                    <td className="font-bold text-[#0A6E3F]">{ngnKobo(Number(o.total ?? o.amount ?? o.total_amount ?? 0))}</td>
                    <td className="text-[11px] text-[#6B6A62]">{(o.created_at ?? o.date ?? '').slice(0,10)}</td>
                    <td><StatusBadge status={o.status ?? o.order_status ?? 'pending'} /></td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap">
                        <Btn v="outline" size="sm" onClick={() => setViewId(uuid)}>👁 View</Btn>
                        {!['delivered','cancelled'].includes(o.status) && (
                          <Btn v="blue" size="sm" onClick={() => setViewId(uuid)}>Update</Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View/Update Modal */}
      <Modal open={!!viewing} onClose={() => setViewId(null)} title={`Order — ${viewing?.reference}`}
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setViewId(null)}>Close</Btn>
          {viewing && !['delivered','cancelled'].includes(viewing.status) && (
            <Btn v="blue" size="lg" onClick={() => { updateStatus(viewing.order_uuid ?? viewing.uuid, 'shipped'); setViewId(null) }} disabled={acting}>
              Mark Shipped
            </Btn>
          )}
        </>}>
        {viewing && <>
          <DR label="Order ID"  value={<span className="font-mono text-[#2563EB]">{viewing.reference}</span>} />
          <DR label="Customer"  value={viewing.customer_name ?? viewing.user_name ?? 'Guest'} />
          <DR label="Total"     value={<span className="text-[#0A6E3F] font-bold">{ngnKobo(viewing.total ?? 0)}</span>} />
          <DR label="Status"    value={<StatusBadge status={viewing.status} />} />
          <DR label="Date"      value={viewing.created_at?.slice(0,10)} />
          <div className="mt-4 pt-3 border-t border-[#E2E0DA]">
            <p className="text-[11px] font-bold text-[#6B6A62] mb-2">UPDATE STATUS</p>
            <div className="flex flex-wrap gap-2">
              {['confirmed','preparing','shipped','out_for_delivery','delivered','cancelled'].map(s => (
                <Btn key={s} v={s === 'cancelled' ? 'red' : 'outline'} size="sm"
                  onClick={() => { updateStatus(viewing.order_uuid ?? viewing.uuid, s); setViewId(null) }}
                  disabled={acting || viewing.status === s}>
                  {s.replace(/_/g,' ')}
                </Btn>
              ))}
            </div>
          </div>
        </>}
      </Modal>
    </div>
  )
}
