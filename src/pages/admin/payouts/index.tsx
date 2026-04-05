import React, { useState } from 'react'
import {
  Card, StatCard, Btn, StatusBadge, Modal, DR, Field,
  SelectField, Input, useToast, Empty,
} from '@/components/admin/ui'
import { useAdminStore } from '@/store/admin'
import { ngnKobo } from '@/lib/mock-data'
import { CheckCircle, Landmark, RefreshCw } from 'lucide-react'

export default function PayoutsPage() {
  const { payouts, vendors, processPayout } = useAdminStore()
  const toast     = useToast()
  const [processId, setProcessId] = useState<string | null>(null)
  const [addOpen, setAddOpen]     = useState(false)

  const processing = processId ? payouts.find(p => p.id === processId) : null

  const totalPaid  = payouts.filter(p => p.status === 'done').reduce((s, p) => s + p.net, 0)
  const pending    = payouts.filter(p => p.status === 'pending')
  const inProcess  = payouts.filter(p => p.status === 'processing')

  const BANK_NAMES: Record<string, string> = { '058': 'GTBank', '044': 'Access Bank', '057': 'Zenith Bank', '033': 'UBA', '011': 'First Bank' }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Payouts</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Vendor settlement management via Paystack Transfer.</p>
        </div>
        <Btn v="green" size="md" onClick={() => setAddOpen(true)}>+ Initiate Payout</Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={<CheckCircle size={18} />} value={ngnKobo(totalPaid)}      label="Total Paid Out"     accent="green" />
        <StatCard icon="⏳" value={String(pending.length)}  label="Pending Payouts"    accent="gold"  />
        <StatCard icon={<RefreshCw size={18} />} value={String(inProcess.length)} label="Processing"        accent="blue"  />
      </div>

      <Card>
        <div className="px-4 py-2.5 border-b border-[#E2E0DA]">
          <span className="text-[13px] font-bold">Payout History</span>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Vendor</th><th>Gross</th><th>Fee (5%)</th><th>Net Payout</th>
                <th>Bank</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id}>
                  <td className="font-bold">{p.vendor_name}</td>
                  <td>{ngnKobo(p.amount)}</td>
                  <td className="text-[#DC2626]">{ngnKobo(p.fee)}</td>
                  <td className="font-extrabold text-[#0A6E3F]">{ngnKobo(p.net)}</td>
                  <td className="text-[11px] text-[#6B6A62]">
                    {BANK_NAMES[p.bank_code] ?? p.bank_code} {p.bank_account}
                  </td>
                  <td className="text-[11px] text-[#6B6A62]">
                    {p.processed_at
                      ? new Date(p.processed_at).toLocaleDateString('en-NG')
                      : new Date(p.created_at).toLocaleDateString('en-NG')
                    }
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    {p.status === 'pending'
                      ? <Btn v="green" size="sm" onClick={() => setProcessId(p.id)}>Process</Btn>
                      : <span className="text-[#A8A79F] text-[11px]">—</span>
                    }
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr><td colSpan={8} className="py-10"><Empty icon={<Landmark size={18} />} title="No payouts yet" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Process Modal */}
      <Modal
        open={!!processing}
        onClose={() => setProcessId(null)}
        title="Process Payout"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setProcessId(null)}>Cancel</Btn>
          <Btn v="green" size="lg" onClick={() => {
            processPayout(processing!.id); setProcessId(null)
            toast(`✅ Payout of ${ngnKobo(processing!.net)} sent to ${processing!.vendor_name}!`)
          }}>Send {processing && ngnKobo(processing.net)}</Btn>
        </>}
      >
        {processing && <>
          <div className="bg-[#E8F5EE] border border-[#86efac] rounded-[8px] p-3 mb-4 text-[12px] text-[#065F46]">
            ✓ Payout will be sent via Paystack Transfer to the vendor's registered bank account.
          </div>
          <DR label="Vendor"       value={processing.vendor_name} />
          <DR label="Gross Amount" value={ngnKobo(processing.amount)} />
          <DR label="Platform Fee" value={<span className="text-[#DC2626]">{ngnKobo(processing.fee)}</span>} />
          <DR label="Net Transfer" value={<span className="text-[#0A6E3F] text-[15px] font-extrabold">{ngnKobo(processing.net)}</span>} />
          <DR label="Bank"         value={`${BANK_NAMES[processing.bank_code] ?? processing.bank_code} ${processing.bank_account}`} />
        </>}
      </Modal>

      {/* Add Payout Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Initiate New Payout"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setAddOpen(false)}>Cancel</Btn>
          <Btn v="green" size="lg" onClick={() => { setAddOpen(false); toast('✅ Payout queued for processing!') }}>Queue Payout</Btn>
        </>}
      >
        <Field label="Select Vendor">
          <SelectField value="" onChange={() => {}}
            options={[{ label: 'Choose vendor…', value: '' }, ...vendors.filter(v => v.status === 'active').map(v => ({ label: v.store_name, value: v.id }))]} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (₦)"><Input type="number" placeholder="0" /></Field>
          <Field label="Bank Account"><Input placeholder="e.g. GTBank ****1234" /></Field>
        </div>
        <Field label="Reference Note"><Input placeholder="e.g. December settlement" /></Field>
      </Modal>
    </div>
  )
}
