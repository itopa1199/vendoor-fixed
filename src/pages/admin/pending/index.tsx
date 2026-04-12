import React, { useEffect, useState } from 'react'
import { Card, Btn, SearchBar, Modal, DR, Field, SelectField, Textarea, useToast } from '@/components/admin/ui'
import { adminVendors } from '@/lib/admin-api'

export default function PendingPage() {
  const toast = useToast()
  const [vendors,  setVendors]  = useState<any[]>([])
  const [raw,      setRaw]      = useState<any>(null)   // keep raw for debug
  const [loading,  setLoading]  = useState(true)
  const [q, setQ]               = useState('')
  const [viewId,   setViewId]   = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason,   setReason]   = useState('Incomplete documentation')
  const [acting,   setActing]   = useState(false)

  const load = () => {
    setLoading(true)
    adminVendors.listPending()
      .then(r => {
        console.log('[PendingPage] raw API response:', JSON.stringify(r, null, 2))
        setRaw(r)
        // API may return array at r.data, r.vendors, r.data.vendors, or r itself
        const list =
          Array.isArray(r.data)          ? r.data :
          Array.isArray(r.vendors)       ? r.vendors :
          Array.isArray(r.data?.vendors) ? r.data.vendors :
          Array.isArray(r)               ? r : []
        setVendors(list)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Normalise a vendor object to consistent field names regardless of API shape
  const norm = (v: any) => ({
    uuid:         v.vendor_uuid  ?? v.uuid         ?? v.id          ?? '',
    name:         v.owner_name   ?? v.name         ?? v.full_name   ?? '—',
    store:        v.store_name   ?? v.biz          ?? v.business    ?? '—',
    category:     v.category     ?? v.cat          ?? v.business_category ?? '—',
    email:        v.email        ?? v.owner_email  ?? '—',
    phone:        v.phone        ?? v.owner_phone  ?? '—',
    nin:          v.nin          ?? v.nin_number   ?? '',
    nin_verified: v.nin_verified ?? v.is_nin_verified ?? false,
    document_url: v.document_url ?? v.doc_url      ?? v.id_url      ?? '',
    raw: v,
  })

  const filtered = vendors
    .map(norm)
    .filter(v =>
      v.name.toLowerCase().includes(q.toLowerCase()) ||
      v.email.toLowerCase().includes(q.toLowerCase()) ||
      v.store.toLowerCase().includes(q.toLowerCase())
    )

  const viewing   = viewId   ? filtered.find(v => v.uuid === viewId)   : null
  const rejecting = rejectId ? filtered.find(v => v.uuid === rejectId) : null

  async function doApprove(uuid: string) {
    setActing(true)
    try {
      const r = await adminVendors.approve(uuid)
      toast(r.status ? '✅ Vendor approved and notified!' : `❌ ${r.message}`)
      if (r.status) load()
    } catch (e: any) {
      toast(`❌ ${e?.response?.data?.message ?? 'Failed to approve vendor'}`)
    } finally { setActing(false) }
  }

  async function doReject(uuid: string) {
    setActing(true)
    try {
      const r = await adminVendors.reject(uuid, reason)
      toast(r.status ? '✅ Vendor rejected.' : `❌ ${r.message}`)
      if (r.status) { setRejectId(null); load() }
    } catch (e: any) {
      toast(`❌ ${e?.response?.data?.message ?? 'Failed to reject vendor'}`)
    } finally { setActing(false) }
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
              <tr>
                <th>Applicant</th><th>Store</th><th>Category</th>
                <th>Email</th><th>Phone</th><th>NIN</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-[#6B6A62]">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-[#6B6A62]">
                  {vendors.length === 0 ? 'No pending applications' : 'No results match your search'}
                </td></tr>
              ) : filtered.map(v => (
                <tr key={v.uuid}>
                  <td><div className="font-semibold">{v.name}</div></td>
                  <td className="font-bold">{v.store}</td>
                  <td>{v.category}</td>
                  <td className="text-[11px] text-[#6B6A62]">{v.email}</td>
                  <td className="text-[11px]">{v.phone}</td>
                  <td>
                    <span className="font-mono text-[11px] bg-[#ECEAE4] px-1.5 py-0.5 rounded">
                      {v.nin || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      <Btn v="outline" size="sm" onClick={() => setViewId(v.uuid)}>View</Btn>
                      <Btn v="green"   size="sm" onClick={() => doApprove(v.uuid)} disabled={acting}>✓ Approve</Btn>
                      <Btn v="red"     size="sm" onClick={() => setRejectId(v.uuid)}>✕ Reject</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewId(null)}
        title={`Application — ${viewing?.store}`}
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setViewId(null)}>Close</Btn>
          <Btn v="red"    size="lg" onClick={() => { setViewId(null); setRejectId(viewing!.uuid) }}>✕ Reject</Btn>
          <Btn v="green"  size="lg" onClick={() => { setViewId(null); doApprove(viewing!.uuid) }} disabled={acting}>✓ Approve</Btn>
        </>}>
        {viewing && <>
          <DR label="Full Name"  value={viewing.name} />
          <DR label="Store"      value={viewing.store} />
          <DR label="Category"   value={viewing.category} />
          <DR label="Email"      value={viewing.email} />
          <DR label="Phone"      value={viewing.phone} />
          {viewing.nin && (
            <DR label="NIN" value={
              <span className="font-mono bg-[#ECEAE4] px-2 py-0.5 rounded text-[12px]">{viewing.nin}</span>
            } />
          )}
          {viewing.document_url && (
            <DR label="Document" value={
              <a href={viewing.document_url} target="_blank" rel="noreferrer"
                className="text-[#2563EB] underline text-[11px]">View Document ↗</a>
            } />
          )}
          {/* Debug: show raw keys in dev */}
          {import.meta.env.DEV && (
            <details className="mt-3">
              <summary className="text-[10px] text-[#A8A79F] cursor-pointer">Raw API fields (dev only)</summary>
              <pre className="text-[9px] bg-[#F5F4F0] p-2 rounded mt-1 overflow-auto max-h-[200px]">
                {JSON.stringify(viewing.raw, null, 2)}
              </pre>
            </details>
          )}
        </>}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejecting} onClose={() => setRejectId(null)} title="Reject Application"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setRejectId(null)}>Cancel</Btn>
          <Btn v="red" size="lg" onClick={() => doReject(rejecting!.uuid)} disabled={acting}>
            {acting ? 'Rejecting…' : '✕ Confirm Rejection'}
          </Btn>
        </>}>
        {rejecting && <>
          <p className="text-[13px] mb-4">
            Reject <strong>{rejecting.store}</strong>? The applicant will be notified.
          </p>
          <Field label="Reason for Rejection">
            <SelectField value={reason} onChange={setReason}
              options={['Incomplete documentation','Invalid NIN','Business category not supported','Duplicate account','Policy violation']} />
          </Field>
          <Field label="Additional Notes (optional)">
            <Textarea placeholder="Add notes for the applicant…" />
          </Field>
        </>}
      </Modal>
    </div>
  )
}
