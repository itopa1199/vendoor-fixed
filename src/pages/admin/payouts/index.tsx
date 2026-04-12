import React, { useEffect, useState } from 'react'
import { Card, StatCard, Btn, StatusBadge, Modal, DR, useToast, Empty } from '@/components/admin/ui'
import { adminFinance } from '@/lib/admin-api'
import { ngnKobo } from '@/lib/utils'
import { Landmark, Clock, RefreshCw } from 'lucide-react'

export default function PayoutsPage() {
  const toast = useToast()
  const [payouts,  setPayouts]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [processId, setProcessId] = useState<number | null>(null)
  const [acting,   setActing]   = useState(false)

  const load = () => {
    setLoading(true)
    adminFinance.listWithdrawals()
      .then(r => {
        console.log('[Payouts] raw response:', r)
        const list =
          Array.isArray(r.data)             ? r.data :
          Array.isArray(r.withdrawals)      ? r.withdrawals :
          Array.isArray(r.payouts)          ? r.payouts :
          Array.isArray(r.data?.withdrawals)? r.data.withdrawals :
          Array.isArray(r)                  ? r : []
        setPayouts(list)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const processing = processId !== null ? payouts.find(p => p.id === processId) : null
  const totalPaid  = payouts.filter(p => p.status === 'approved' || p.status === 'done').reduce((s, p) => s + Number(p.amount ?? 0), 0)
  const pending    = payouts.filter(p => p.status === 'pending')

  async function approve(id: number) {
    setActing(true)
    try {
      const r = await adminFinance.processWithdrawal(id)
      toast(r.status ? '✅ Withdrawal approved!' : `❌ ${r.message}`)
      if (r.status) { setProcessId(null); load() }
    } catch { toast('❌ Failed to process payout') }
    finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Payouts / Withdrawals</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Vendor payout requests.</p>
        </div>
        <Btn v="outline" size="sm" onClick={load}>Refresh</Btn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={<Landmark size={18} />} value={ngnKobo(totalPaid)}      label="Total Paid Out"  accent="green" />
        <StatCard icon={<Clock size={18} />}    value={String(pending.length)}   label="Pending"         accent="gold"  />
        <StatCard icon={<RefreshCw size={18} />} value={String(payouts.length)}  label="All Requests"    accent="blue"  />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Vendor</th><th>Amount</th><th>Bank</th><th>Account</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-[#6B6A62]">Loading…</td></tr>
              ) : payouts.length === 0 ? (
                <tr><td colSpan={7} className="py-10"><Empty icon={<Landmark size={18} />} title="No withdrawal requests" /></td></tr>
              ) : payouts.map((p: any) => (
                <tr key={p.id}>
                  <td className="font-bold">{p.vendor_name ?? p.store_name ?? p.name ?? '—'}</td>
                  <td className="font-bold text-[#0A6E3F]">{ngnKobo(Number(p.amount ?? p.withdrawal_amount ?? 0))}</td>
                  <td className="text-[11px] text-[#6B6A62]">{p.bank_name ?? p.bank ?? p.bank_code ?? '—'}</td>
                  <td className="text-[11px]">{p.account_number ?? p.bank_account ?? p.account ?? '—'}</td>
                  <td className="text-[11px] text-[#6B6A62]">{(p.created_at ?? p.date ?? '').slice(0,10)}</td>
                  <td><StatusBadge status={p.status ?? 'pending'} /></td>
                  <td>
                    {p.status === 'pending'
                      ? <Btn v="green" size="sm" onClick={() => setProcessId(p.id)}>Approve</Btn>
                      : <span className="text-[#A8A79F] text-[11px]">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirm Modal */}
      <Modal open={!!processing} onClose={() => setProcessId(null)} title="Approve Withdrawal"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setProcessId(null)}>Cancel</Btn>
          <Btn v="green" size="lg" onClick={() => approve(processId!)} disabled={acting}>
            {acting ? 'Processing…' : `Approve ${processing ? ngnKobo(Number(processing.amount)) : ''}`}
          </Btn>
        </>}>
        {processing && <>
          <div className="bg-[#E8F5EE] border border-[#86efac] rounded-[8px] p-3 mb-4 text-[12px] text-[#065F46]">
            ✓ This will approve the payout request.
          </div>
          <DR label="Vendor"  value={processing.vendor_name ?? processing.store_name} />
          <DR label="Amount"  value={<span className="text-[#0A6E3F] font-bold text-[15px]">{ngnKobo(Number(processing.amount))}</span>} />
          <DR label="Bank"    value={processing.bank_name ?? processing.bank_code} />
          <DR label="Account" value={processing.account_number ?? processing.bank_account} />
        </>}
      </Modal>
    </div>
  )
}
