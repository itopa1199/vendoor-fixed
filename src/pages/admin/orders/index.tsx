import React, { useState } from 'react'
import {
  Card, StatCard, Btn, StatusBadge, SearchBar, Select,
  Modal, DR, Badge, useToast, Empty,
} from '@/components/admin/ui'
import { useAdminStore } from '@/store/admin'
import { ngnKobo } from '@/lib/mock-data'
import { CheckCircle, Package, Settings, ShoppingCart, Truck, XCircle } from 'lucide-react'

export default function OrdersPage() {
  const { orders, advanceOrder, cancelOrder } = useAdminStore()
  const toast = useToast()

  const [q, setQ]          = useState('')
  const [statusF, setStatusF] = useState('')
  const [viewId, setViewId]  = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const txt = (o.reference + o.vendor_name + o.user_name).toLowerCase()
    return txt.includes(q.toLowerCase()) && (!statusF || o.status === statusF)
  })

  const viewing = viewId ? orders.find(o => o.id === viewId) : null

  const counts: Record<string, number> = {}
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })

  const FLOW = ['confirmed','preparing','out_for_delivery','delivered']
  const canAdvance = (status: string) => FLOW.includes(status) && status !== 'delivered'

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Orders</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{orders.length} total orders.</p>
        </div>
        <Btn v="outline" size="sm">Export</Btn>
      </div>

      {/* Status stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={<CheckCircle size={18} />} value={String(counts.confirmed ?? 0)}          label="Confirmed"       accent="blue"   />
        <StatCard icon={<Settings size={18} />} value={String(counts.preparing ?? 0)}          label="Preparing"       accent="gold"   />
        <StatCard icon={<Truck size={18} />} value={String(counts.out_for_delivery ?? 0)}   label="Out for Delivery" accent="blue"   />
        <StatCard icon={<Package size={18} />} value={String(counts.delivered ?? 0)}          label="Delivered"       accent="green"  />
        <StatCard icon={<XCircle size={18} />} value={String((counts.cancelled ?? 0) + (counts.refunded ?? 0))} label="Cancelled/Refunded" accent="red" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <SearchBar placeholder="Search orders, vendors, customers…" value={q} onChange={setQ} />
        <Select value={statusF} onChange={setStatusF} options={[
          { label: 'All Status',          value: ''                },
          { label: 'Confirmed',           value: 'confirmed'       },
          { label: 'Preparing',           value: 'preparing'       },
          { label: 'Out for Delivery',    value: 'out_for_delivery'},
          { label: 'Delivered',           value: 'delivered'       },
          { label: 'Cancelled',           value: 'cancelled'       },
          { label: 'Refunded',            value: 'refunded'        },
        ]} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Order ID</th><th>Vendor</th><th>Customer</th>
                <th>Amount</th><th>Payment</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className="font-mono font-bold text-[11px] text-[#2563EB]">{o.reference}</td>
                  <td className="font-semibold">{o.vendor_name}</td>
                  <td>{o.user_name ?? o.guest_email ?? 'Guest'}</td>
                  <td className="font-bold text-[#0A6E3F]">{ngnKobo(o.total)}</td>
                  <td><StatusBadge status={o.payment_status} /></td>
                  <td className="text-[11px] text-[#6B6A62]">
                    {new Date(o.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      <Btn v="outline" size="sm" onClick={() => setViewId(o.id)}>👁 View</Btn>
                      {canAdvance(o.status) && (
                        <Btn v="blue" size="sm" onClick={() => {
                          advanceOrder(o.id)
                          toast(`📦 Order ${o.reference} advanced.`)
                        }}>→ Advance</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-10"><Empty icon={<ShoppingCart size={18} />} title="No orders found" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewId(null)}
        title={`Order — ${viewing?.reference}`}
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setViewId(null)}>Close</Btn>
          {viewing && !['delivered','cancelled','refunded'].includes(viewing.status) && (
            <Btn v="red" size="lg" onClick={() => {
              cancelOrder(viewing.id); setViewId(null); toast('❌ Order cancelled.')
            }}>Cancel Order</Btn>
          )}
        </>}
      >
        {viewing && <>
          <DR label="Order ID"   value={<span className="font-mono text-[#2563EB]">{viewing.reference}</span>} />
          <DR label="Vendor"     value={viewing.vendor_name ?? '—'} />
          <DR label="Customer"   value={viewing.user_name ?? viewing.guest_email ?? 'Guest'} />
          <DR label="Subtotal"   value={ngnKobo(viewing.subtotal)} />
          <DR label="Delivery"   value={ngnKobo(viewing.delivery_fee)} />
          <DR label="Total"      value={<span className="text-[#0A6E3F] font-bold">{ngnKobo(viewing.total)}</span>} />
          <DR label="Payment"    value={<StatusBadge status={viewing.payment_status} />} />
          <DR label="Paystack Ref" value={viewing.payment_ref ?? '—'} />
          <DR label="Status"     value={<StatusBadge status={viewing.status} />} />
          <DR label="Date"       value={new Date(viewing.created_at).toLocaleString('en-NG')} />
          {viewing.note && <DR label="Note" value={viewing.note} />}
        </>}
      </Modal>
    </div>
  )
}
