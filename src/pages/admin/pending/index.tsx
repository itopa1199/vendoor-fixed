import React, { useEffect, useState } from 'react'
import { Card, Btn, Badge, SearchBar, Modal, NINBox, DR, Field, SelectField, Textarea, useToast } from '@/components/admin/ui'
import { adminVendors } from '@/lib/admin-api'

export default function PendingPage() {
  const toast = useToast()
  const [vendors, setVendors]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [q, setQ]               = useState('')
  const [viewId, setViewId]     = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason]     = useState('Incomplete documentation')
  const [acting, setActing]     = useState(false)

  const load = () => {
    setLoading(true)
    adminVendors.listPending()
      .then(r => { if (r.status) setVendors(r.data ?? []) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = vendors.filter(v =>
    (v.name ?? v.store_name ?? '').toLowerCase().includes(q.toLowerCase()) ||
    (v.email ?? '').toLowerCase().includes(q.toLowerCase())
  )

  const viewing   = viewId   ? vendors.find(v => (v.uuid ?? v.id) === viewId)   : null
  const rejecting = rejectId ? vendors.find(v => (v.uuid ?? v.id) === rejectId) : null

  async function doApprove(uuid: string) {
    setActing(true)
    try {
      const r = await adminVendors.approve(uuid)
      toast(r.status ? '✅ Vendor approved!' : `❌ ${r.message}`)
      if (r.status) load()
    } catch { toast('❌ Failed to approve vendor') }
    finally { setActing(false) }
  }

  async function doReject(uuid: string) {
    setActing(true)
    try {
      const r = await adminVendors.reject(uuid, reason)
      toast(r.status ? '❌ Vendor rejected.' : `❌ ${r.message}`)
      if (r.status) { setRejectId(null); load() }
    } catch { toast('❌ Failed to reject vendor') }
    finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Pending Approvals</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{vendors.length} applications awaiting review.</p>
        </div>
      </div>

      <SearchBar placeholder="Search applicants…" value={q} onChange={setQ} />

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Applicant</th><th>Store</th><th>Category</th><th>Email</th><th>Phone</th><th>NIN</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-[#6B6A62]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-[#6B6A62]">No pending applications</td></tr>
              ) : filtered.map((v: any) => {
                const uuid = v.uuid ?? v.id
                return (
                  <tr key={uuid}>
                    <td><div className="font-semibold">{v.name}</div></td>
                    <td className="font-bold">{v.store_name ?? v.biz}</td>
                    <td>{v.category ?? v.cat}</td>
                    <td className="text-[11px] text-[#6B6A62]">{v.email}</td>
                    <td className="text-[11px]">{v.phone}</td>
                    <td><span className="font-mono text-[11px] bg-[#ECEAE4] px-1.5 py-0.5 rounded">{v.nin ?? '—'}</span></td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap">
                        <Btn v="outline" size="sm" onClick={() => setViewId(uuid)}>👁 View</Btn>
                        <Btn v="green"   size="sm" onClick={() => doApprove(uuid)} disabled={acting}>✓ Approve</Btn>
                        <Btn v="red"     size="sm" onClick={() => setRejectId(uuid)}>✕ Reject</Btn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewId(null)} title={`Application — ${viewing?.store_name ?? viewing?.biz}`}
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setViewId(null)}>Close</Btn>
          <Btn v="red" size="lg" onClick={() => { setViewId(null); setRejectId(viewing?.uuid ?? viewing?.id) }}>✕ Reject</Btn>
          <Btn v="green" size="lg" onClick={() => { setViewId(null); doApprove(viewing?.uuid ?? viewing?.id) }} disabled={acting}>✓ Approve</Btn>
        </>}>
        {viewing && <>
          {viewing.nin && <NINBox nin={viewing.nin} verified={viewing.nin_verified ?? false} />}
          <DR label="Full Name"  value={viewing.name} />
          <DR label="Store"      value={viewing.store_name ?? viewing.biz} />
          <DR label="Category"   value={viewing.category ?? viewing.cat} />
          <DR label="Email"      value={viewing.email} />
          <DR label="Phone"      value={viewing.phone} />
          {viewing.document_url && <DR label="Document" value={<a href={viewing.document_url} target="_blank" rel="noreferrer" className="text-[#2563EB] underline text-[11px]">View Document</a>} />}
        </>}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejecting} onClose={() => setRejectId(null)} title="Reject Application"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setRejectId(null)}>Cancel</Btn>
          <Btn v="red" size="lg" onClick={() => doReject(rejecting?.uuid ?? rejecting?.id)} disabled={acting}>
            {acting ? 'Rejecting…' : '✕ Confirm Rejection'}
          </Btn>
        </>}>
        {rejecting && <>
          <p className="text-[13px] mb-4">Reject <strong>{rejecting.store_name ?? rejecting.biz}</strong>? They will be notified.</p>
          <Field label="Reason">
            <SelectField value={reason} onChange={setReason}
              options={['Incomplete documentation','Invalid NIN','Business category not supported','Duplicate account','Policy violation']} />
          </Field>
          <Field label="Additional Notes (optional)"><Textarea placeholder="Add notes…" /></Field>
        </>}
      </Modal>
    </div>
  )
}
