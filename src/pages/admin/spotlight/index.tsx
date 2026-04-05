import React, { useState } from 'react'
import {
  Card, StatCard, Btn, StatusBadge, Badge,
  Modal, DR, Field, SelectField, Input, useToast, Empty,
} from '@/components/admin/ui'
import { useAdminStore } from '@/store/admin'
import { ngnKobo } from '@/lib/mock-data'
import { Calendar, DollarSign, Star } from 'lucide-react'

export default function SpotlightPage() {
  const { spotlightSubs, vendors, removeSpotlight } = useAdminStore()
  const toast = useToast()
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [addOpen, setAddOpen]   = useState(false)

  const active  = spotlightSubs.filter(s => s.status === 'active')
  const expired = spotlightSubs.filter(s => s.status === 'expired')
  const removing = removeId ? spotlightSubs.find(s => s.id === removeId) : null

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Spotlight Subscriptions</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Vendor featured placement — ₦1,000/month.</p>
        </div>
        <Btn v="green" size="md" onClick={() => setAddOpen(true)}>+ Add Spotlight</Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={<Star size={18} />} value={String(active.length)}       label="Active Spotlights"       accent="gold"  />
        <StatCard icon={<DollarSign size={18} />} value={ngnKobo(active.length * 100_000)} label="Monthly Revenue"   accent="green" />
        <StatCard icon={<Calendar size={18} />} value={String(expired.length)}      label="Expired"                 accent="purple"/>
      </div>

      <Card>
        <div className="px-4 py-2.5 border-b border-[#E2E0DA]">
          <span className="text-[13px] font-bold">All Subscriptions</span>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Vendor</th><th>Owner</th><th>Paid On</th><th>Expires</th>
                <th>Paystack Ref</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {spotlightSubs.map(s => (
                <tr key={s.id}>
                  <td className="font-bold">{s.vendor}</td>
                  <td>{s.owner}</td>
                  <td className="text-[11px] text-[#6B6A62]">{s.paid}</td>
                  <td className="text-[11px] text-[#6B6A62]">{s.exp}</td>
                  <td className="font-mono text-[11px] text-[#2563EB]">{s.ref}</td>
                  <td>
                    {s.status === 'active'
                      ? <Badge v="gold">⭐ Active</Badge>
                      : <Badge v="dim">Expired</Badge>
                    }
                  </td>
                  <td>
                    {s.status === 'active'
                      ? <Btn v="red" size="sm" onClick={() => setRemoveId(s.id)}>Remove</Btn>
                      : <span className="text-[#A8A79F] text-[11px]">—</span>
                    }
                  </td>
                </tr>
              ))}
              {spotlightSubs.length === 0 && (
                <tr><td colSpan={7} className="py-10"><Empty icon={<Star size={18} />} title="No spotlight subscriptions" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Remove Modal */}
      <Modal open={!!removing} onClose={() => setRemoveId(null)} title="Remove Spotlight"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setRemoveId(null)}>Cancel</Btn>
          <Btn v="red" size="lg" onClick={() => {
            removeSpotlight(removing!.id); setRemoveId(null); toast('⭐ Spotlight removed.')
          }}>Remove</Btn>
        </>}>
        {removing && (
          <p className="text-[13px]">
            Remove <strong>{removing.vendor}</strong> from spotlight?
            They will not be refunded for the remaining days.
          </p>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Spotlight Manually"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setAddOpen(false)}>Cancel</Btn>
          <Btn v="green" size="lg" onClick={() => { setAddOpen(false); toast('⭐ Spotlight added!') }}>Add Spotlight</Btn>
        </>}>
        <Field label="Select Vendor">
          <SelectField value="" onChange={() => {}}
            options={[{ label: 'Choose vendor…', value: '' }, ...vendors.filter(v => v.status === 'active').map(v => ({ label: v.store_name, value: v.id }))]} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date">
            <Input type="date" defaultValue={new Date().toISOString().slice(0,10)} />
          </Field>
          <Field label="Duration">
            <SelectField value="30" onChange={() => {}} options={['30 days','60 days','90 days']} />
          </Field>
        </div>
        <Field label="Payment Reference">
          <Input placeholder="Paystack ref or MANUAL-xxx" />
        </Field>
      </Modal>
    </div>
  )
}
