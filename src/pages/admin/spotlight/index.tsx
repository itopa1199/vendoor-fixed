import React, { useEffect, useState } from 'react'
import { Card, StatCard, Btn, Badge, Modal, DR, useToast, Empty } from '@/components/admin/ui'
import { adminDashboard } from '@/lib/admin-api'
import { ngnKobo } from '@/lib/utils'
import { Calendar, DollarSign, Star } from 'lucide-react'

export default function SpotlightPage() {
  const toast = useToast()
  const [subs,    setSubs]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminDashboard.getStats()
      .then(r => {
        console.log('[Spotlight] stats response:', r)
        const list = Array.isArray(r.data?.spotlight)       ? r.data.spotlight :
                     Array.isArray(r.spotlight)              ? r.spotlight :
                     Array.isArray(r.data?.spotlight_subs)  ? r.data.spotlight_subs : []
        setSubs(list)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const norm = (s: any) => ({
    id:     s.id ?? s.uuid ?? s.spotlight_uuid ?? '',
    vendor: s.vendor_name ?? s.store_name ?? s.vendor ?? '—',
    owner:  s.owner_name  ?? s.name       ?? s.owner  ?? '—',
    paid:   (s.paid_at    ?? s.created_at ?? s.paid   ?? '').slice(0, 10),
    exp:    (s.expires_at ?? s.expiry     ?? s.exp    ?? '').slice(0, 10),
    ref:    s.reference   ?? s.payment_ref ?? s.ref   ?? '—',
    status: s.status      ?? (s.is_active ? 'active' : 'expired'),
    amount: Number(s.amount ?? s.price ?? 0),
    raw: s,
  })

  const list    = subs.map(norm)
  const active  = list.filter(s => s.status === 'active')
  const expired = list.filter(s => s.status !== 'active')

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Spotlight Subscriptions</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Vendor featured placements.</p>
        </div>
        <Btn v="outline" size="sm" onClick={load}>Refresh</Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={<Star size={18} />}        value={String(active.length)}  label="Active Spotlights" accent="gold"   />
        <StatCard icon={<DollarSign size={18} />}  value={ngnKobo(active.reduce((s, x) => s + x.amount, 0))} label="Revenue" accent="green" />
        <StatCard icon={<Calendar size={18} />}    value={String(expired.length)} label="Expired"           accent="purple" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Vendor</th><th>Owner</th><th>Paid On</th><th>Expires</th><th>Reference</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#6B6A62]">Loading…</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={6} className="py-10">
                  <Empty icon={<Star size={18} />} title="No spotlight subscriptions" sub="Spotlight data will appear here once loaded from the API" />
                </td></tr>
              ) : list.map((s, i) => (
                <tr key={i}>
                  <td className="font-bold">{s.vendor}</td>
                  <td>{s.owner}</td>
                  <td className="text-[11px] text-[#6B6A62]">{s.paid}</td>
                  <td className="text-[11px] text-[#6B6A62]">{s.exp}</td>
                  <td className="font-mono text-[11px] text-[#2563EB]">{s.ref}</td>
                  <td>
                    {s.status === 'active'
                      ? <Badge v="gold">Active</Badge>
                      : <Badge v="dim">Expired</Badge>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
