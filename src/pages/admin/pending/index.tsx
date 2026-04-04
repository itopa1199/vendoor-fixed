import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, Btn, Badge, SearchBar, Select, Modal, NINBox, DR, Field, Input, SelectField, Textarea, useToast } from '@/components/admin/ui'
import { useAdminStore } from '@/store/admin'

export default function PendingPage() {
  const { pendingVendors, approveVendor, rejectVendor } = useAdminStore()
  const toast  = useToast()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [viewId, setViewId]  = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason]  = useState('Incomplete documentation')

  const filtered = pendingVendors.filter(v => {
    const match = v.name.toLowerCase().includes(q.toLowerCase()) ||
                  v.biz.toLowerCase().includes(q.toLowerCase()) ||
                  v.email.toLowerCase().includes(q.toLowerCase())
    const catMatch = !cat || v.cat === cat
    return match && catMatch
  })

  const viewing  = viewId  ? pendingVendors.find(v => v.id === viewId)  : null
  const rejecting = rejectId ? pendingVendors.find(v => v.id === rejectId) : null

  const cats = [...new Set(pendingVendors.map(v => v.cat))]

  function doApprove(id: string) {
    const v = pendingVendors.find(x => x.id === id)
    approveVendor(id)
    toast(`✅ ${v?.biz} approved and activated!`)
  }

  function doReject(id: string) {
    const v = pendingVendors.find(x => x.id === id)
    rejectVendor(id)
    setRejectId(null)
    toast(`❌ ${v?.biz} application rejected.`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Pending Approvals</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{pendingVendors.length} applications awaiting review.</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <SearchBar placeholder="Search applicants…" value={q} onChange={setQ} />
        <Select
          value={cat}
          onChange={setCat}
          options={[{ label: 'All Categories', value: '' }, ...cats.map(c => ({ label: c, value: c }))]}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Applicant</th><th>Business</th><th>Category</th>
                <th>Contact</th><th>NIN</th><th>Submitted</th><th>Doc</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-[10px] text-[#6B6A62]">{v.email}</div>
                  </td>
                  <td className="font-bold">{v.biz}</td>
                  <td>{v.cat}</td>
                  <td className="text-[11px]">{v.phone}</td>
                  <td>
                    <span className="font-mono text-[11px] bg-[#ECEAE4] px-1.5 py-0.5 rounded">
                      {v.nin}
                    </span>
                  </td>
                  <td className="text-[11px] text-[#6B6A62]">{v.sub}</td>
                  <td>
                    <Badge v={v.doc === 'ID verified' ? 'green' : 'gold'}>{v.doc}</Badge>
                  </td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      <Btn v="outline" size="sm" onClick={() => setViewId(v.id)}>👁 View</Btn>
                      <Btn v="green"   size="sm" onClick={() => doApprove(v.id)}>✓ Approve</Btn>
                      <Btn v="red"     size="sm" onClick={() => setRejectId(v.id)}>✕ Reject</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-[#6B6A62]">No pending applications</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal
        open={!!viewing} onClose={() => setViewId(null)}
        title={`Application — ${viewing?.biz}`}
        footer={
          <>
            <Btn v="outline" size="lg" onClick={() => setViewId(null)}>Close</Btn>
            <Btn v="red" size="lg" onClick={() => { setViewId(null); setRejectId(viewing!.id) }}>✕ Reject</Btn>
            <Btn v="green" size="lg" onClick={() => { setViewId(null); doApprove(viewing!.id) }}>✓ Approve</Btn>
          </>
        }
      >
        {viewing && (
          <>
            <NINBox nin={viewing.nin} verified={viewing.doc === 'ID verified'} />
            <DR label="Full Name"  value={viewing.name}  />
            <DR label="Business"   value={viewing.biz}   />
            <DR label="Category"   value={viewing.cat}   />
            <DR label="Email"      value={viewing.email} />
            <DR label="Phone"      value={viewing.phone} />
            <DR label="Submitted"  value={viewing.sub}   />
            <DR label="Document"   value={<Badge v={viewing.doc === 'ID verified' ? 'green' : 'gold'}>{viewing.doc}</Badge>} />
          </>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={!!rejecting} onClose={() => setRejectId(null)}
        title="Reject Application"
        footer={
          <>
            <Btn v="outline" size="lg" onClick={() => setRejectId(null)}>Cancel</Btn>
            <Btn v="red" size="lg" onClick={() => doReject(rejecting!.id)}>✕ Confirm Rejection</Btn>
          </>
        }
      >
        {rejecting && (
          <>
            <p className="text-[13px] mb-4">
              You are rejecting the application from <strong>{rejecting.biz}</strong>. The applicant will be notified.
            </p>
            <Field label="Reason for Rejection">
              <SelectField
                value={reason} onChange={setReason}
                options={['Incomplete documentation','Invalid NIN','Business category not supported','Duplicate account','Policy violation']}
              />
            </Field>
            <Field label="Additional Notes (optional)">
              <Textarea placeholder="Add notes for the applicant…" />
            </Field>
          </>
        )}
      </Modal>
    </div>
  )
}
